import type { DocumentItem } from "../types/document";

type DocumentDetailProps = {
  selectedDocument: DocumentItem;
  showAnalysis: boolean;
  isAnalyzing: boolean;
  riskyClauses: any[];
  privacyConcerns: any[];
  suggestedQuestions: string[];
  getRiskClass: (risk: string) => string;
  setViewDashboard: () => void;
  startEdit: (doc: DocumentItem) => void;
  deleteDocument: (id: number) => void;
  analyzeDocument: (id: number) => void;
};

function DocumentDetail({
  selectedDocument,
  showAnalysis,
  isAnalyzing,
  riskyClauses,
  privacyConcerns,
  suggestedQuestions,
  getRiskClass,
  setViewDashboard,
  startEdit,
  deleteDocument,
  analyzeDocument,
}: DocumentDetailProps) {
  return (
    <>
      <div className="page-header">
        <h1>{selectedDocument.title}</h1>

        <div className="button-row no-margin">
          <button className="secondary" onClick={setViewDashboard}>
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
                <span className={getRiskClass(selectedDocument.risk_level)}>
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
                  {suggestedQuestions.map((question: string, index: number) => (
                    <li key={index}>{question}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </section>
    </>
  );
}

export default DocumentDetail;