import { useEffect, useState } from "react";
import "./App.css";

import Sidebar from "./components/Sidebar";
import Dashboard from "./components/Dashboard";
import DocumentDetail from "./components/DocumentDetail";
import DocumentForm from "./components/DocumentForm";

import type { DocumentItem, SortOption, View } from "./types/document";

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

  const hasAnalysis =
    fullDocument.risk_level !== "Not analyzed" &&
    Boolean(fullDocument.summary);

  setShowAnalysis(hasAnalysis);
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
      <Sidebar
        view={view}
        onDashboardClick={() => setView("dashboard")}
        onAddDocumentClick={openAddPage}
      />

      <main className="main">
        {view === "dashboard" && (
          <Dashboard
            search={search}
            riskFilter={riskFilter}
            typeFilter={typeFilter}
            sortOption={sortOption}
            sortedDocuments={sortedDocuments}
            openMenuId={openMenuId}
            setSearch={setSearch}
            setRiskFilter={setRiskFilter}
            setTypeFilter={setTypeFilter}
            setSortOption={setSortOption}
            openAddPage={openAddPage}
            openDocumentDetail={openDocumentDetail}
            startEdit={startEdit}
            deleteDocument={deleteDocument}
            setOpenMenuId={setOpenMenuId}
            getRiskClass={getRiskClass}
            getDocIconClass={getDocIconClass}
          />
        )}

        {view === "detail" && selectedDocument && (
          <DocumentDetail
            selectedDocument={selectedDocument}
            showAnalysis={showAnalysis}
            isAnalyzing={isAnalyzing}
            riskyClauses={riskyClauses}
            privacyConcerns={privacyConcerns}
            suggestedQuestions={suggestedQuestions}
            getRiskClass={getRiskClass}
            setViewDashboard={() => setView("dashboard")}
            startEdit={startEdit}
            deleteDocument={deleteDocument}
            analyzeDocument={analyzeDocument}
          />
        )}

        {view === "add" && (
          <DocumentForm
            editingId={editingId}
            title={title}
            documentType={documentType}
            clientName={clientName}
            content={content}
            selectedFile={selectedFile}
            inputMode={inputMode}
            setViewDashboard={() => setView("dashboard")}
            setTitle={setTitle}
            setDocumentType={setDocumentType}
            setClientName={setClientName}
            setContent={setContent}
            setSelectedFile={setSelectedFile}
            setInputMode={setInputMode}
            saveDocument={saveDocument}
            resetForm={resetForm}
          />
        )}
      </main>
    </div>
  );
}

export default App;