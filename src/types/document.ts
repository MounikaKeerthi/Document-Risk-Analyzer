export type View = "dashboard" | "add" | "detail";

export type SortOption = "newest" | "oldest" | "title-asc" | "risk-high";

export type InputMode = "paste" | "upload";

export type DocumentItem = {
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