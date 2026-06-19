# Document Risk Analyzer

A full-stack AI-powered legal document analyzer built with React, TypeScript, FastAPI, SQLite, and Anthropic Claude.

The application helps users upload or paste legal documents such as NDAs, contracts, privacy policies, and terms of service, then generate a plain-English summary, risky clause review, privacy-related concerns, and suggested questions for legal review.

## Features

* Create, view, edit, and delete legal documents
* Upload `.txt`, `.pdf`, and `.docx` files
* Paste document text manually
* Search documents by title or content
* Filter by document type and risk level
* Sort by newest, oldest, title, or highest risk
* Analyze documents using Anthropic Claude
* Generate:

  * Plain-English summary
  * Risky clause findings
  * Privacy-related concerns
  * Suggested review questions
* Local SQLite persistence for MVP demo
* FastAPI Swagger documentation
* Privacy-first design: documents are analyzed only when the user clicks Analyze

## Tech Stack

### Frontend

* React
* TypeScript
* Vite
* CSS

### Backend

* Python
* FastAPI
* SQLAlchemy
* SQLite
* Anthropic Claude API
* pypdf
* python-docx

## How It Works

1. A user adds a document by pasting text or uploading a file.
2. The backend extracts text from uploaded files.
3. The document is stored in SQLite.
4. When the user clicks Analyze, the backend sends the document text to Anthropic Claude.
5. Claude returns structured analysis as JSON.
6. The frontend displays the summary, risky clauses, privacy concerns, and suggested questions.

## AI Analysis Design

The analyzer uses a prompt-based legal/privacy knowledge base instead of model training.

The prompt includes guidance based on:

* GDPR-style privacy review concepts
* CCPA-style privacy review concepts
* HIPAA-style privacy review concepts
* Common risky contract clause patterns
* AI/data usage concerns

The app does not claim that a document violates a regulation. Instead, it flags possible privacy or contract review concerns for legal review.

## Supported Document Types

* NDA
* Contract
* Terms of Service
* Privacy Policy
* Employment Agreement
* Vendor Agreement
* Other

## Supported Upload Formats

* `.txt`
* `.pdf`
* `.docx`

Scanned PDFs are not supported in this MVP because OCR is not included yet.

Future enhancements:

* PostgreSQL database
* User authentication
* Role-based access control
* Audit history
* PDF OCR support
* Real RAG pipeline with ChromaDB or FAISS
* Document chunking and semantic retrieval
* Matter-based document organization
* Downloadable PDF analysis report
* Version history for edited documents
