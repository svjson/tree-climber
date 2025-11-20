;;; tree-climber.el --- summary -*- lexical-binding: t -*-

;; Author: Sven Johansson
;; Version: 0.1.0
;; Package-Requires: (dependencies)
;; Homepage: https://www.github.com/svjson/tree-climber
;; Keywords: structured editing


;; This file is not part of GNU Emacs

;; This program is free software: you can redistribute it and/or modify
;; it under the terms of the GNU General Public License as published by
;; the Free Software Foundation, either version 3 of the License, or
;; (at your option) any later version.

;; This program is distributed in the hope that it will be useful,
;; but WITHOUT ANY WARRANTY; without even the implied warranty of
;; MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
;; GNU General Public License for more details.

;; You should have received a copy of the GNU General Public License
;; along with this program.  If not, see <https://www.gnu.org/licenses/>.


;;; Commentary:

;; commentary

;;; Code:

(require 'color)
(require 'request)
(require 'json)
(require 'treesit)



(defgroup tree-climber nil
  "Minor mode for structural editing via the Tree-Climber service."
  :group 'editing)



;; Custom variables

(defcustom tree-climber-server-url "http://localhost:4434"
  "URL to the Tree-Climber backend server."
  :type 'string)

(defcustom tree-climber-base-face 'region
  "Base face to derive overlay colors from."
  :type 'face
  :group 'tree-climber)

(defcustom tree-climber-node-brightness +10
  "Brightness shift for node highlight."
  :type 'integer
  :group 'tree-climber)

(defcustom tree-climber-parent-brightness -40
  "Brightness shift for parent highlight."
  :type 'integer
  :group 'tree-climber)

(defcustom tree-climber-child-brightness +50
  "Brightness shift for child highlight."
  :type 'integer
  :group 'tree-climber)



;; Local variables

(defvar-local tree-climber-buffer-language nil)



;; Faces

(defface tree-climber-node-face
  '((t))
  "Face for current node."
  :group 'tree-climber)

(defface tree-climber-parent-face
  '((t))
  "Face for parent node."
  :group 'tree-climber)

(defface tree-climber-child-face
  '((t))
  "Face for child nodes."
  :group 'tree-climber)



;; Library functions

(defun tree-climber--make-face-spec (base diff)
  "Return a face spec that adjusts BASE face background by DIFF percent."
  (let* ((bg (face-background base nil t))
         (bg (or bg "#444444"))
         (new-bg (if (>= diff 0)
                     (color-lighten-name bg diff)
                   (color-darken-name  bg (* -1 diff)))))
    `((t :background ,new-bg))))

(defun tree-climber--update-faces (&rest _)
  "Recompute faces when theme changes."
  (interactive)
  (let ((base tree-climber-base-face))
    (custom-set-faces
     `(tree-climber-node-face
       ,(tree-climber--make-face-spec base tree-climber-node-brightness))
     `(tree-climber-parent-face
       ,(tree-climber--make-face-spec base tree-climber-parent-brightness))
     `(tree-climber-child-face
       ,(tree-climber--make-face-spec base tree-climber-child-brightness)))))

(defun tree-climber--buffer-language ()
  "Determine the buffer language."
  (or tree-climber-buffer-language (treesit-language-at (point))))

(defun tree-climber--buffer-content ()
  "Return full buffer contents as a string."
  (buffer-substring-no-properties (point-min) (point-max)))

(defun tree-climber--point-position ()
  "Return point as a plist with row/column (0-indexed)."
  (save-excursion
    (let ((row (1- (line-number-at-pos)))
          (col (- (point) (line-beginning-position))))
      `((row . ,row) (column . ,col)))))

(defun tree-climber--payload-get (format payload key)
  "Get KEY from PAYLOAD, treating payload as FORMAT."
  (pcase format
    ('hash (gethash key payload))
    ('plist (plist-get payload (tree-climber--keyword->string key)))))

(defun tree-climber--keyword->string (kw)
  "Convert keyword KW (e.g. :foo) to string \"foo\"."
  (let ((s (symbol-name kw)))
    (if (and (> (length s) 0)
             (eq (aref s 0) ?:))
        (substring s 1)
      s)))

(defun tree-climber--format-node (node)
  "Format NODE type and bounds."
  (format "%s (%s - %s)" (plist-get node :type)
          (plist-get (plist-get node :start) :index)
          (plist-get (plist-get node :start) :index)))

(defun tree-climber--post (endpoint payload callback &optional format)
  "POST PAYLOAD to ENDPOINT and call CALLBACK with parsed JSON or nil."
  (setq format (or format 'hash))
  (request
    (concat tree-climber-server-url endpoint)
    :type "POST"
    :headers '(("Content-Type" . "application/json"))
    :data (json-encode payload)
    :parser (pcase format
              ('hash #'json-parse-buffer)
              ('plist (lambda () (json-parse-buffer
                                  :object-type 'plist
                                  :array-type 'list
                                  :null-object nil
                                  :false-object nil))))
    :success (cl-function
              (lambda (&key data &allow-other-keys)
                (funcall callback data)))
    :error (cl-function
            (lambda (&key data &allow-other-keys)
              (message "Tree-Climber error contacting %s: %s - %s"
                       endpoint
                       (tree-climber--payload-get format data "error")
                       (tree-climber--payload-get format data "message"))
              (funcall callback nil)))))



;; Overlays

(defun tree-climber--overlay-face (role)
  "Get the overlay font-lock face for ROLE."
  (pcase role
    ('node        'tree-climber-node-face)
    ('parent-node 'tree-climber-parent-face)
    ('child-node  'tree-climber-child-face)))

(defun tree-climber--make-overlay (start end role)
  "Create overlay from START to END with face according to ROLE."
  (let ((ov (make-overlay start end)))
    (overlay-put ov 'face (tree-climber--overlay-face role))
    (overlay-put ov 'tree-climber-query t)
    ov))

(defun tree-climber--clear-overlays (&rest _)
  "Remove all temporary tree-climber overlays."
  (remove-overlays nil nil 'tree-climber-query t))

(defun tree-climber--make-node-overlay (node role)
  "Create an overlay for NODE with as ROLE."
  (let ((bounds (tree-climber--node-boundary node)))
    (tree-climber--make-overlay (car bounds)
                                (cdr bounds)
                                role)))

(defun tree-climber--node-boundary (node)
  "Return (beg . end) buffer positions from NODE plist."
  (cons (1+ (plist-get (plist-get node :start) :index))
        (1+ (plist-get (plist-get node :end) :index))))

(defun tree-climber--highlight-nodes (node-data)
  "Overlay visualizer for a NODE-DATA query response."
  (interactive)
  (tree-climber--clear-overlays)

  (tree-climber--make-node-overlay (plist-get node-data :node) 'node)
  (tree-climber--make-node-overlay (plist-get node-data :parent) 'parent-node)
  (dolist (child (plist-get node-data :children))
    (tree-climber--make-node-overlay child 'child-node)))



;; Navigation Commands

(defun tree-climber--navigate (command)
  "Send a navigation COMMAND and move point to response if valid."
  (let ((payload `((lang . ,(tree-climber--buffer-language))
                   (command . ,command)
                   (point . ,(tree-climber--point-position))
                   (content . ,(tree-climber--buffer-content)))))
    (tree-climber--post "/navigate" payload
                        (lambda (data)
                          (when data
                            (let* ((row (gethash "row" (gethash "point" data)))
                                   (col (gethash "column" (gethash "point" data))))
                              (goto-char (point-min))
                              (forward-line row)
                              (forward-char col)))))))

(defun tree-climber-barf-forward ()
  "Barf last child from current scope."
  (interactive)
  (tree-climber--operate "barfForward"))

(defun tree-climber-raise-expr ()
  "Raise expression at point."
  (interactive)
  (tree-climber--operate "raiseExpr"))


(defun tree-climber-scope-start ()
  "Move point to start of current scope."
  (interactive)
  (tree-climber--navigate "scopeStart"))

(defun tree-climber-scope-end ()
  "Move point to end of current scope."
  (interactive)
  (tree-climber--navigate "scopeEnd"))

(defun tree-climber-scope-into ()
  "Move point to the start of the closest child scope."
  (interactive)
  (tree-climber--navigate "scopeInto"))

(defun tree-climber-scope-out ()
  "Move point to the start of the containing parent scope."
  (interactive)
  (tree-climber--navigate "scopeOut"))

(defun tree-climber-query-node-at-point ()
  "Query the AST for a description of the node at point."
  (interactive)
  (tree-climber--query "nodeAt"))

(defun tree-climber-query-parent-node-at-point ()
  "Query the AST for a description of the parent node of the  node at point."
  (interactive)
  (tree-climber--query "nodeParent"))

(defun tree-climber-query-node-before-point ()
  "Query the AST for a description of the previous sibling of the node at point."
  (interactive)
  (tree-climber--query "nodeBefore"))



;; Operation Commands

(defun tree-climber--operate (command)
  "Send an operation COMMAND and replace buffer text at returned range."
  (let ((payload `((lang . ,(tree-climber--buffer-language))
                   (command . ,command)
                   (point . ,(tree-climber--point-position))
                   (content . ,(tree-climber--buffer-content)))))
    (tree-climber--post "/operation" payload
                        (lambda (data)
                          (when data
                            (let* ((start (gethash "start" data))
                                   (end (gethash "end" data))
                                   (content (gethash "content" data)))
                              (save-excursion
                                (goto-char (point-min))
                                (forward-line (gethash "row" start))
                                (forward-char (gethash "column" start))
                                (let ((start-pos (point)))
                                  (goto-char (point-min))
                                  (forward-line (gethash "row" end))
                                  (forward-char (gethash "column" end))
                                  (delete-region start-pos (point))
                                  (goto-char start-pos)
                                  (insert content)))))))))

(defun tree-climber-split-expr ()
  "Split the expression at point."
  (interactive)
  (tree-climber--operate "splitExpr"))



;; Query Commands

(defun tree-climber--query (query)
  "Send an operation QUERY and display result."
  (let ((payload `((lang . ,(tree-climber--buffer-language))
                   (command . ,query)
                   (point . ,(tree-climber--point-position))
                   (content . ,(tree-climber--buffer-content)))))
    (tree-climber--post "/query"
                        payload
                        (lambda (data)
                          (message (format "Parent: %s\n - Node: %s\n   - Children:\n%s"
                                           (tree-climber--format-node (plist-get data :parent))
                                           (tree-climber--format-node (plist-get data :node))
                                           (string-join (mapcar (lambda (child)
                                                             (format "       - %s" (tree-climber--format-node child)))
                                                           (plist-get data :children))
                                                        "\n")))
                          (tree-climber--highlight-nodes data))
                        'plist)))



;; Tree Climber Mode

(defvar tree-climber-mode-map
  (let ((map (make-sparse-keymap)))
    (define-key map (kbd "C-M-<left>") #'tree-climber-scope-start)
    (define-key map (kbd "C-M-<right>") #'tree-climber-scope-end)
    (define-key map (kbd "C-M-<down>") #'tree-climber-scope-into)
    (define-key map (kbd "C-M-<up>") #'tree-climber-scope-out)
    (define-key map (kbd "M-m j s") #'tree-climber-split-expr)
    (define-key map (kbd "M-r") #'tree-climber-raise-expr)
    (define-key map (kbd "s-<left>") #'tree-climber-barf-forward)
    (define-key map (kbd "C-c q .") #'tree-climber-query-node-at-point)
    (define-key map (kbd "C-c q <up>") #'tree-climber-query-parent-node-at-point)
    (define-key map (kbd "C-c q <left>") #'tree-climber-query-node-before-point)
    map)
  "Keymap for `tree-climber-mode`.")

;;;###autoload
(define-minor-mode tree-climber-mode
  "Minor mode for interacting with the Tree-Climber backend service."
  :lighter " 🌲"
  :keymap tree-climber-mode-map

  (advice-add 'keyboard-quit :before #'tree-climber--clear-overlays))


(provide 'tree-climber)

;;; tree-climber.el ends here
