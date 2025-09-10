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


(require 'request)
(require 'json)



(defgroup tree-climber nil
  "Minor mode for structural editing via the Tree-Climber service."
  :group 'editing)

(defcustom tree-climber-server-url "http://localhost:4434"
  "URL to the Tree-Climber backend server."
  :type 'string)


;; Library functions

(defun tree-climber--buffer-content ()
  "Return full buffer contents as a string."
  (buffer-substring-no-properties (point-min) (point-max)))

(defun tree-climber--point-position ()
  "Return point as a plist with row/column (0-indexed)."
  (save-excursion
    (let ((row (1- (line-number-at-pos)))
          (col (- (point) (line-beginning-position))))
      `((row . ,row) (column . ,col)))))

(defun tree-climber--post (endpoint payload callback)
  "POST PAYLOAD to ENDPOINT and call CALLBACK with parsed JSON or nil."
  (request
    (concat tree-climber-server-url endpoint)
    :type "POST"
    :headers '(("Content-Type" . "application/json"))
    :data (json-encode payload)
    :parser #'json-parse-buffer
    :success (cl-function
              (lambda (&key data &allow-other-keys)
                (funcall callback data)))
    :error (cl-function
            (lambda (&key data &allow-other-keys)
              (message "Tree-Climber error contacting %s: %s - %s" endpoint (gethash "error" data) (gethash "message" data))
              (funcall callback nil)))))


;; Navigation Commands

(defun tree-climber--navigate (command)
  "Send a navigation COMMAND and move point to response if valid."
  (let ((payload `((command . ,command)
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



;; Operation Commands

(defun tree-climber--operate (command)
  "Send an operation COMMAND and replace buffer text at returned range."
  (let ((payload `((command . ,command)
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


;; Tree Climber Mode

(defvar tree-climber-mode-map
  (let ((map (make-sparse-keymap)))
    (define-key map (kbd "C-M-<left>") #'tree-climber-scope-start)
    (define-key map (kbd "C-M-<right>") #'tree-climber-scope-end)
    (define-key map (kbd "C-M-<down>") #'tree-climber-scope-into)
    (define-key map (kbd "M-m j s") #'tree-climber-split-expr)
    map)
  "Keymap for `tree-climber-mode`.")

;;;###autoload
(define-minor-mode tree-climber-mode
  "Minor mode for interacting with the Tree-Climber backend service."
  :lighter " 🌲"
  :keymap tree-climber-mode-map)


(provide 'tree-climber)

;;; tree-climber.el ends here
