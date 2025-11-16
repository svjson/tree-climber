import * as vscode from 'vscode'

export function activate(context: vscode.ExtensionContext) {
  const disposable = vscode.commands.registerCommand(
    'tree-climber.splitStr',
    async () => {
      const info = getActiveEditorInfo()
      if (!info) {
        vscode.window.showWarningMessage('No active text editor.')
        return
      }

      // Example: use the data (send to your feature, navigate, etc.)
      console.log('Cursors:', info.cursors) // line/character
      console.log('Offsets:', info.cursorOffsets) // absolute offsets
      const cursor = info.cursors[0]
      const result = (await makeOperationRequest({
        line: cursor.line,
        char: cursor.character,
        content: info.text,
      })) as {
        start: { row: number; column: number }
        end: { row: number; column: number }
        content: string
      }
      applyPatch({
        content: result.content,
        end: { character: result.end.column, line: result.end.row },
        start: { character: result.start.column, line: result.start.row },
      })
    }
  )

  context.subscriptions.push(disposable)

  // Optional: subscribe to cursor changes if you want live tracking
  vscode.window.onDidChangeTextEditorSelection((e) => {
    if (e.textEditor === vscode.window.activeTextEditor) {
      // You can read e.selections here if needed
    }
  })
}

/**
 * Reads the entire current file and cursor positions.
 */
function getActiveEditorInfo() {
  const editor = vscode.window.activeTextEditor
  if (!editor) {
    return null
  }

  const doc = editor.document
  const text = doc.getText() // full in-memory text, includes unsaved edits

  // Support multi-cursor: each selection has an active (cursor) and anchor
  const cursors = editor.selections.map((sel) => ({
    line: sel.active.line,
    character: sel.active.character,
  }))

  // Absolute offsets (useful for slicing text, block detection, etc.)
  const cursorOffsets = editor.selections.map((sel) => doc.offsetAt(sel.active))

  return {
    text,
    uri: doc.uri, // file path: doc.uri.fsPath (if needed)
    languageId: doc.languageId,
    version: doc.version, // increases on each edit
    cursors,
    cursorOffsets,
  }
}

function makeOperationRequest(params: {
  line: number
  char: number
  content: string
}) {
  const API_URL = 'http://localhost:4434'

  const content = `const foo = "bar"`
  const point = { row: params.line, col: params.char }
  const payload = {
    lang: 'typescript',
    command: 'splitExpr',
    point: { row: point.row, column: point.col },
    content: params.content,
  }

  return fetch(`${API_URL}/operation`, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
    .then((res) => {
      if (!res.ok) {
        throw res
      }

      return res.json()
    })
    .catch(console.log)
}

type Lc = { line: number; character: number }
type Patch = { start: Lc; end: Lc; content: string }

export async function applyPatch(patch: Patch) {
  const editor = vscode.window.activeTextEditor
  if (!editor) {
    vscode.window.showWarningMessage('No active text editor.')
    return
  }

  const { document } = editor
  const range = new vscode.Range(
    new vscode.Position(patch.start.line, patch.start.character),
    new vscode.Position(patch.end.line, patch.end.character)
  )

  // Single atomic edit (undo in one step)
  const ok = await editor.edit((edit) => {
    edit.replace(range, normalizeEOL(patch.content, document.eol))
  })

  if (!ok) {
    vscode.window.showErrorMessage('Could not apply patch.')
  } else {
    // Optional: keep the cursor at end of the inserted content and reveal it
    const endPos = range.start.translate(0, patch.content.length)
    editor.selection = new vscode.Selection(endPos, endPos)
    editor.revealRange(
      new vscode.Range(endPos, endPos),
      vscode.TextEditorRevealType.InCenterIfOutsideViewport
    )
  }
}

// Normalize line endings to the document’s choice (LF or CRLF)
function normalizeEOL(text: string, eol: vscode.EndOfLine): string {
  if (eol === vscode.EndOfLine.LF) {
    return text.replace(/\r\n/g, '\n')
  }
  // Convert lone \n to \r\n
  return text.replace(/\r?\n/g, '\r\n')
}

export function deactivate() {}
