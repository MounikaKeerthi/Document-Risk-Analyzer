import type { DocumentItem, SortOption } from "../types/document";
import DocumentTable from "./DocumentTable";

type DashboardProps = {
  search: string;
  riskFilter: string;
  typeFilter: string;
  sortOption: SortOption;
  sortedDocuments: DocumentItem[];
  openMenuId: number | null;
  setSearch: (value: string) => void;
  setRiskFilter: (value: string) => void;
  setTypeFilter: (value: string) => void;
  setSortOption: (value: SortOption) => void;
  openAddPage: () => void;
  openDocumentDetail: (doc: DocumentItem) => void;
  startEdit: (doc: DocumentItem) => void;
  deleteDocument: (id: number) => void;
  setOpenMenuId: (id: number | null) => void;
  getRiskClass: (risk: string) => string;
  getDocIconClass: (type: string) => string;
};

function Dashboard({
  search,
  riskFilter,
  typeFilter,
  sortOption,
  sortedDocuments,
  openMenuId,
  setSearch,
  setRiskFilter,
  setTypeFilter,
  setSortOption,
  openAddPage,
  openDocumentDetail,
  startEdit,
  deleteDocument,
  setOpenMenuId,
  getRiskClass,
  getDocIconClass,
}: DashboardProps) {
  return (
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

        <DocumentTable
          sortedDocuments={sortedDocuments}
          openMenuId={openMenuId}
          getRiskClass={getRiskClass}
          getDocIconClass={getDocIconClass}
          openDocumentDetail={openDocumentDetail}
          startEdit={startEdit}
          deleteDocument={deleteDocument}
          setOpenMenuId={setOpenMenuId}
        />
      </section>
    </>
  );
}

export default Dashboard;