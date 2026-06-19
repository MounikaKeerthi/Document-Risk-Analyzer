import type { View } from "../types/document";

type SidebarProps = {
  view: View;
  onDashboardClick: () => void;
  onAddDocumentClick: () => void;
};

function Sidebar({ view, onDashboardClick, onAddDocumentClick }: SidebarProps) {
  return (
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
          onClick={onDashboardClick}
        >
          Dashboard
        </button>

        <button
          className={view === "add" ? "nav-active" : ""}
          onClick={onAddDocumentClick}
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
  );
}

export default Sidebar;