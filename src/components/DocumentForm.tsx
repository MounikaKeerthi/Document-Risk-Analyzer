import type { InputMode } from "../types/document";

type DocumentFormProps = {
  editingId: number | null;
  title: string;
  documentType: string;
  clientName: string;
  content: string;
  selectedFile: File | null;
  inputMode: InputMode;
  setViewDashboard: () => void;
  setTitle: (value: string) => void;
  setDocumentType: (value: string) => void;
  setClientName: (value: string) => void;
  setContent: (value: string) => void;
  setSelectedFile: (file: File | null) => void;
  setInputMode: (mode: InputMode) => void;
  saveDocument: () => void;
  resetForm: () => void;
};

function DocumentForm({
  editingId,
  title,
  documentType,
  clientName,
  content,
  selectedFile,
  inputMode,
  setViewDashboard,
  setTitle,
  setDocumentType,
  setClientName,
  setContent,
  setSelectedFile,
  setInputMode,
  saveDocument,
  resetForm,
}: DocumentFormProps) {
  return (
    <>
      <div className="page-header">
        <h1>{editingId ? "Update Document" : "Add Document"}</h1>

        <button className="secondary" onClick={setViewDashboard}>
          Back to Dashboard
        </button>
      </div>

      <section className="form-page panel">
        <div className="form-two-column">
          <div className="form-left">
            <label>Document Title</label>
            <input
              placeholder="Example: Vendor NDA Review"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
            />

            <label>Client / Matter Name</label>
            <input
              placeholder="Example: Acme Corp"
              value={clientName}
              onChange={(event) => setClientName(event.target.value)}
            />

            <label>Document Type</label>
            <select
              value={documentType}
              onChange={(event) => setDocumentType(event.target.value)}
            >
              <option>NDA</option>
              <option>Contract</option>
              <option>Terms of Service</option>
              <option>Privacy Policy</option>
              <option>Employment Agreement</option>
              <option>Vendor Agreement</option>
              <option>Other</option>
            </select>

            <div className="button-row">
              <button onClick={saveDocument}>
                {editingId ? "Save Changes" : "Create Document"}
              </button>

              <button className="secondary" onClick={resetForm}>
                Clear
              </button>
            </div>
          </div>

          <div className="form-right">
            <label>Input Method</label>

            <div className="input-toggle">
              <button
                type="button"
                className={inputMode === "paste" ? "toggle-active" : "secondary"}
                onClick={() => setInputMode("paste")}
              >
                Paste Text
              </button>

              <button
                type="button"
                className={inputMode === "upload" ? "toggle-active" : "secondary"}
                onClick={() => setInputMode("upload")}
                disabled={editingId !== null}
              >
                Upload File
              </button>
            </div>

            {editingId && (
              <p className="helper-text">
                Upload is disabled while editing. Edit extracted text directly
                instead.
              </p>
            )}

            {inputMode === "paste" && (
              <>
                <label>Document Content</label>
                <textarea
                  className="large-textarea"
                  placeholder="Paste document text here..."
                  value={content}
                  onChange={(event) => setContent(event.target.value)}
                />
              </>
            )}

            {inputMode === "upload" && !editingId && (
              <div className="upload-box">
                <label>Upload Document</label>

                <input
                  type="file"
                  accept=".txt,.pdf,.docx"
                  onChange={(event) => {
                    const file = event.target.files?.[0] || null;
                    setSelectedFile(file);
                  }}
                />

                <p className="helper-text">
                  Supported files: TXT, PDF, DOCX. Scanned PDFs are not
                  supported yet.
                </p>

                {selectedFile && (
                  <p className="selected-file">
                    Selected file: <strong>{selectedFile.name}</strong>
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}

export default DocumentForm;