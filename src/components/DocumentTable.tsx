import type { DocumentItem } from "../types/document";

type DocumentTableProps = {
  sortedDocuments: DocumentItem[];
  openMenuId: number | null;
  getRiskClass: (risk: string) => string;
  getDocIconClass: (type: string) => string;
  openDocumentDetail: (doc: DocumentItem) => void;
  startEdit: (doc: DocumentItem) => void;
  deleteDocument: (id: number) => void;
  setOpenMenuId: (id: number | null) => void;
};

function DocumentTable({
  sortedDocuments,
  openMenuId,
  getRiskClass,
  getDocIconClass,
  openDocumentDetail,
  startEdit,
  deleteDocument,
  setOpenMenuId,
}: DocumentTableProps) {
  return (
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
                    setOpenMenuId(openMenuId === doc.id ? null : doc.id);
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
  );
}

export default DocumentTable;