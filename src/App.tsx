import { useEffect, useState } from "react";
import "./App.css";

type View = "dashboard" | "add" | "detail";

type SortOption = "newest" | "oldest" | "title-asc" | "risk-high";

type DocumentItem = {
  id: number;
  title: string;
  document_type: string;
  client_name: string | null;
  content: string;
  risk_level: string;
  summary: string | null;
  risky_clauses: string | null;
  privacy_concerns: string | null;
  suggested_questions: string | null;
  created_at: string;
  updated_at: string;
};

const API_BASE_URL = "http://127.0.0.1:8000";

function App() {
  const [view, setView] = useState<View>("dashboard");
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<DocumentItem | null>(
    null,
  );

  const [title, setTitle] = useState("");
  const [documentType, setDocumentType] = useState("NDA");
  const [clientName, setClientName] = useState("");
  const [content, setContent] = useState("");

  const [search, setSearch] = useState("");
  const [riskFilter, setRiskFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [sortOption, setSortOption] = useState<SortOption>("newest");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [inputMode, setInputMode] = useState<"paste" | "upload">("paste");

  const fetchDocuments = async () => {
    const params = new URLSearchParams();

    if (search) params.append("query", search);
    if (riskFilter) params.append("risk_level", riskFilter);
    if (typeFilter) params.append("document_type", typeFilter);

    const response = await fetch(
      `${API_BASE_URL}/documents?${params.toString()}`,
    );
    const data = await response.json();
    setDocuments(data);
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchDocuments();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [search, riskFilter, typeFilter]);

  const resetForm = () => {
    setTitle("");
    setDocumentType("NDA");
    setClientName("");
    setContent("");
    setSelectedFile(null);
    setInputMode("paste");
    setEditingId(null);
  };

  const openAddPage = () => {
    resetForm();
    setView("add");
  };

  const openDocumentDetail = async (doc: DocumentItem) => {
    const response = await fetch(`${API_BASE_URL}/documents/${doc.id}`);
    const fullDocument = await response.json();

    setSelectedDocument(fullDocument);
    setShowAnalysis(false);
    setOpenMenuId(null);
    setView("detail");
  };

  const startEdit = (doc: DocumentItem) => {
    setEditingId(doc.id);
    setTitle(doc.title);
    setDocumentType(doc.document_type);
    setClientName(doc.client_name || "");
    setContent(doc.content);
    setOpenMenuId(null);
    setView("add");
  };

  const saveDocument = async () => {
    if (!title.trim()) {
      alert("Title is required.");
      return;
    }

    let response: Response;

    if (inputMode === "upload" && !editingId) {
      if (!selectedFile) {
        alert("Please choose a file to upload.");
        return;
      }

      const formData = new FormData();
      formData.append("title", title);
      formData.append("document_type", documentType);
      formData.append("client_name", clientName);
      formData.append("file", selectedFile);

      response = await fetch(`${API_BASE_URL}/documents/upload`, {
        method: "POST",
        body: formData,
      });
    } else {
      if (!content.trim()) {
        alert("Document content is required.");
        return;
      }

      const payload = {
        title,
        document_type: documentType,
        client_name: clientName,
        content,
      };

      const url = editingId
        ? `${API_BASE_URL}/documents/${editingId}`
        : `${API_BASE_URL}/documents`;

      const method = editingId ? "PUT" : "POST";

      response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
    }

    if (!response.ok) {
      const errorData = await response.json();
      alert(errorData.detail || "Failed to save document.");
      return;
    }

    const savedDocument = await response.json();

    await fetchDocuments();
    setSelectedDocument(savedDocument);
    resetForm();
    setShowAnalysis(false);
    setView("detail");
  };

  const deleteDocument = async (id: number) => {
    await fetch(`${API_BASE_URL}/documents/${id}`, {
      method: "DELETE",
    });

    setSelectedDocument(null);
    setShowAnalysis(false);
    setOpenMenuId(null);
    await fetchDocuments();
    setView("dashboard");
  };

  const analyzeDocument = async (id: number) => {
    if (isAnalyzing) {
      return;
    }

    try {
      setIsAnalyzing(true);

      const response = await fetch(`${API_BASE_URL}/documents/${id}/analyze`, {
        method: "POST",
      });

      if (!response.ok) {
        const errorData = await response.json();
        alert(errorData.detail || "Analysis failed.");
        return;
      }

      const analyzedDocument = await response.json();

      setSelectedDocument(analyzedDocument);
      setShowAnalysis(true);
      await fetchDocuments();
    } catch (error) {
      alert("Analysis failed. Check backend logs.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const parseJsonArray = (value: string | null) => {
    if (!value) return [];

    try {
      return JSON.parse(value);
    } catch {
      return [];
    }
  };

  const getRiskClass = (risk: string) => {
    if (risk === "High") return "risk high";
    if (risk === "Medium") return "risk medium";
    if (risk === "Low") return "risk low";
    return "risk neutral";
  };

  const getDocIconClass = (type: string) => {
    if (type === "NDA") return "doc-icon green";
    if (type === "Contract") return "doc-icon blue";
    if (type === "Privacy Policy") return "doc-icon mint";
    if (type === "Terms of Service") return "doc-icon purple";
    if (type === "Employment Agreement") return "doc-icon orange";
    return "doc-icon gray";
  };

  const getSortedDocuments = () => {
    const docs = [...documents];

    const riskOrder: Record<string, number> = {
      High: 1,
      Medium: 2,
      Low: 3,
      "Not analyzed": 4,
    };

    if (sortOption === "newest") {
      return docs.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      );
    }

    if (sortOption === "oldest") {
      return docs.sort(
        (a, b) =>
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
      );
    }

    if (sortOption === "title-asc") {
      return docs.sort((a, b) => a.title.localeCompare(b.title));
    }

    if (sortOption === "risk-high") {
      return docs.sort(
        (a, b) =>
          (riskOrder[a.risk_level] || 99) - (riskOrder[b.risk_level] || 99),
      );
    }

    return docs;
  };

  const riskyClauses = parseJsonArray(selectedDocument?.risky_clauses || null);
  const privacyConcerns = parseJsonArray(
    selectedDocument?.privacy_concerns || null,
  );
  const suggestedQuestions = parseJsonArray(
    selectedDocument?.suggested_questions || null,
  );

  const sortedDocuments = getSortedDocuments();

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="logo">P</div>
          <div>
            <h1>PrivyDoc AI</h1>
            <p>Privacy-first legal analyzer</p>
          </div>
        </div>

        <nav>
          <button
            className={view === "dashboard" ? "nav-active" : ""}
            onClick={() => setView("dashboard")}
          >
            Dashboard
          </button>

          <button
            className={view === "add" ? "nav-active" : ""}
            onClick={openAddPage}
          >
            Add Document
          </button>
        </nav>

        <div className="privacy-card">
          <h3>Privacy First</h3>
          <p>
            Your documents are stored locally in SQLite. Analysis runs only when
            you click Analyze.
          </p>
        </div>
      </aside>

      <main className="main">
        {view === "dashboard" && (
          <>
            <div className="page-header">
              <h1>Dashboard</h1>
              <button onClick={openAddPage}>+ Add Document</button>
            </div>

            <section className="panel">
              <div className="control-bar">
                <input
                  placeholder="Search documents by title or content..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />

                <select
                  value={typeFilter}
                  onChange={(event) => setTypeFilter(event.target.value)}
                >
                  <option value="">All Types</option>
                  <option>NDA</option>
                  <option>Contract</option>
                  <option>Terms of Service</option>
                  <option>Privacy Policy</option>
                  <option>Employment Agreement</option>
                  <option>Vendor Agreement</option>
                  <option>Other</option>
                </select>

                <select
                  value={riskFilter}
                  onChange={(event) => setRiskFilter(event.target.value)}
                >
                  <option value="">All Risks</option>
                  <option>High</option>
                  <option>Medium</option>
                  <option>Low</option>
                  <option>Not analyzed</option>
                </select>

                <select
                  value={sortOption}
                  onChange={(event) =>
                    setSortOption(event.target.value as SortOption)
                  }
                >
                  <option value="newest">Sort: Newest First</option>
                  <option value="oldest">Sort: Oldest First</option>
                  <option value="title-asc">Sort: Title A-Z</option>
                  <option value="risk-high">Sort: Highest Risk First</option>
                </select>
              </div>

              <div className="document-table">
                <div className="document-table-header">
                  <span>Document</span>
                  <span>Type</span>
                  <span>Risk</span>
                  <span>Created</span>
                  <span></span>
                </div>

                {sortedDocuments.length === 0 ? (
                  <p className="empty">No documents found.</p>
                ) : (
                  sortedDocuments.map((doc) => (
                    <div
                      key={doc.id}
                      className="document-table-row"
                      onClick={() => openDocumentDetail(doc)}
                    >
                      <div className="document-cell">
                        <div className={getDocIconClass(doc.document_type)}>
                          {doc.document_type.slice(0, 3).toUpperCase()}
                        </div>

                        <div className="document-info">
                          <h3>{doc.title}</h3>
                          <p>{doc.content.slice(0, 125)}...</p>
                        </div>
                      </div>

                      <span className="type-cell">{doc.document_type}</span>

                      <span className={getRiskClass(doc.risk_level)}>
                        {doc.risk_level}
                      </span>

                      <span className="date-cell">
                        {new Date(doc.created_at).toLocaleDateString()}
                      </span>

                      <div className="table-actions">
                        <div className="action-menu">
                          <button
                            className="action-trigger"
                            onClick={(event) => {
                              event.stopPropagation();
                              setOpenMenuId(
                                openMenuId === doc.id ? null : doc.id,
                              );
                            }}
                          >
                            ⋮
                          </button>

                          {openMenuId === doc.id && (
                            <div className="action-dropdown">
                              <button
                                onClick={(event) => {
                                  event.stopPropagation();
                                  setOpenMenuId(null);
                                  openDocumentDetail(doc);
                                }}
                              >
                                Open
                              </button>

                              <button
                                onClick={(event) => {
                                  event.stopPropagation();
                                  setOpenMenuId(null);
                                  startEdit(doc);
                                }}
                              >
                                Edit
                              </button>

                              <button
                                className="delete-action"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  setOpenMenuId(null);
                                  deleteDocument(doc.id);
                                }}
                              >
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>
          </>
        )}

        {view === "detail" && selectedDocument && (
          <>
            <div className="page-header">
              <h1>{selectedDocument.title}</h1>

              <div className="button-row no-margin">
                <button
                  className="secondary"
                  onClick={() => setView("dashboard")}
                >
                  Back
                </button>

                <button
                  className="secondary"
                  onClick={() => startEdit(selectedDocument)}
                >
                  Edit
                </button>

                <button
                  className="danger-button"
                  onClick={() => deleteDocument(selectedDocument.id)}
                >
                  Delete
                </button>
              </div>
            </div>

            <section className="detail-page-layout">
              <div className="panel">
                <div className="document-meta-grid">
                  <div>
                    <p className="meta-label">Document Type</p>
                    <h3>{selectedDocument.document_type}</h3>
                  </div>

                  <div>
                    <p className="meta-label">Client / Matter</p>
                    <h3>{selectedDocument.client_name || "Not provided"}</h3>
                  </div>

                  <div>
                    <p className="meta-label">Current Risk</p>
                    <span className={getRiskClass(selectedDocument.risk_level)}>
                      {selectedDocument.risk_level}
                    </span>
                  </div>
                </div>
              </div>

              <div className="panel">
                <h2>Original Document Text</h2>
                <pre className="full-document-text">
                  {selectedDocument.content}
                </pre>
              </div>

              {!showAnalysis && (
                <div className="panel analyze-placeholder">
                  <h2>AI Analysis Not Started</h2>
                  <p>
                    {isAnalyzing
                      ? "Analyzing document with Claude. This may take a few seconds."
                      : "Click Analyze to generate the plain-English summary, risky clauses, privacy concerns, and suggested review questions."}
                  </p>
                  <button
                    onClick={() => analyzeDocument(selectedDocument.id)}
                    disabled={isAnalyzing}
                  >
                    {isAnalyzing ? "Analyzing..." : "Analyze Document"}
                  </button>
                </div>
              )}

              {showAnalysis && (
                <div className="analysis-grid">
                  <div className="panel analysis-card-large">
                    <div className="detail-title-row">
                      <h2>Plain-English Summary</h2>
                      <span
                        className={getRiskClass(selectedDocument.risk_level)}
                      >
                        {selectedDocument.risk_level}
                      </span>
                    </div>

                    <p className="summary-text">
                      {selectedDocument.summary || "No summary generated."}
                    </p>
                  </div>

                  <div className="panel">
                    <h2>Risky Clauses</h2>

                    {riskyClauses.length === 0 ? (
                      <p className="empty">No risky clauses detected.</p>
                    ) : (
                      riskyClauses.map((item: any, index: number) => (
                        <div className="finding" key={index}>
                          <div>
                            <strong>{item.clause}</strong>
                            <p>{item.reason}</p>
                          </div>

                          <span className={getRiskClass(item.severity)}>
                            {item.severity}
                          </span>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="panel">
                    <h2>Privacy Concerns</h2>

                    {privacyConcerns.length === 0 ? (
                      <p className="empty">No privacy concerns detected.</p>
                    ) : (
                      privacyConcerns.map((item: any, index: number) => (
                        <div className="finding" key={index}>
                          <strong>{item.issue}</strong>
                          <p>{item.reason}</p>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="panel">
                    <h2>Suggested Questions</h2>

                    {suggestedQuestions.length === 0 ? (
                      <p className="empty">No suggested questions generated.</p>
                    ) : (
                      <ul className="question-list">
                        {suggestedQuestions.map(
                          (question: string, index: number) => (
                            <li key={index}>{question}</li>
                          ),
                        )}
                      </ul>
                    )}
                  </div>
                </div>
              )}
            </section>
          </>
        )}

        {view === "add" && (
          <>
            <div className="page-header">
              <h1>{editingId ? "Update Document" : "Add Document"}</h1>

              <button
                className="secondary"
                onClick={() => setView("dashboard")}
              >
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
                      className={
                        inputMode === "paste" ? "toggle-active" : "secondary"
                      }
                      onClick={() => setInputMode("paste")}
                    >
                      Paste Text
                    </button>

                    <button
                      type="button"
                      className={
                        inputMode === "upload" ? "toggle-active" : "secondary"
                      }
                      onClick={() => setInputMode("upload")}
                      disabled={editingId !== null}
                    >
                      Upload File
                    </button>
                  </div>

                  {editingId && (
                    <p className="helper-text">
                      Upload is disabled while editing. Edit extracted text
                      directly instead.
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
        )}
      </main>
    </div>
  );
}

export default App;
