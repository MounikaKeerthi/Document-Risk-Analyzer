# Document Risk Analyzer

A full-stack AI-powered legal document analyzer built with React, TypeScript, FastAPI, SQLite, and Anthropic Claude.

The application helps users upload or paste legal documents such as NDAs, contracts, privacy policies, and terms of service, then generate a plain-English summary, risky clause review, privacy-related concerns, and suggested questions for legal review.

> This project is for educational and demo purposes only. It does not provide legal advice.

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

## Project Structure

```text
Document-Risk-Analyzer/
  backend/
    main.py
    database.py
    models.py
    schemas.py
    analyzer.py
    requirements.txt
  src/
    App.tsx
    App.css
    index.css
    main.tsx
  public/
  assets/
    demo-screenshot.png
  README.md
  .gitignore
  package.json
  vite.config.ts
```

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

## Local Setup

### 1. Clone the repository

```bash
git clone https://github.com/MounikaKeerthi/Document-Risk-Analyzer.git
cd Document-Risk-Analyzer
```

### 2. Install frontend dependencies

```bash
npm install
```

### 3. Set up backend virtual environment

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
```

### 4. Install backend dependencies

```bash
python3 -m pip install -r requirements.txt
```

### 5. Create environment file

Inside the `backend` folder, create a `.env` file:

```bash
nano .env
```

Add:

```env
ANTHROPIC_API_KEY=your_anthropic_api_key_here
```

### 6. Start backend

From the `backend` folder:

```bash
source venv/bin/activate
python3 -m uvicorn main:app --reload
```

Backend will run at:

```text
http://127.0.0.1:8000
```

Swagger docs:

```text
http://127.0.0.1:8000/docs
```

### 7. Start frontend

Open a second terminal from the project root:

```bash
npm run dev
```

Frontend will run at:

```text
http://localhost:5173
```

## Environment Variables

Backend:

```env
ANTHROPIC_API_KEY=your_anthropic_api_key_here
```

Frontend deployment:

```env
VITE_API_BASE_URL=https://your-backend-url.onrender.com
```

## Deployment Plan

For demo deployment:

* Frontend: Render Static Site
* Backend: Render Web Service
* Database: SQLite for MVP demo

For production:

* Use PostgreSQL instead of SQLite
* Store uploaded files in S3 or another object storage service
* Add authentication and role-based access control
* Add audit logs for document analysis events
* Add persistent vector search for legal/privacy knowledge retrieval

## Production Improvements

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

## Security and Privacy Notes

* The Anthropic API key is stored only in the backend environment.
* The API key is never exposed to the frontend.
* Documents are stored locally in SQLite for the MVP.
* Analysis is triggered only when the user clicks Analyze.
* `.env`, virtual environment files, database files, and build artifacts are ignored by Git.

## Git Ignore

The repository should ignore:

```gitignore
backend/.env
backend/venv/
backend/privydoc.db
node_modules/
dist/
```

## Demo Talking Points

I built this project as a full-stack legal-tech application to demonstrate React, TypeScript, FastAPI, database persistence, document upload, and AI integration.

The project is designed around a privacy-first workflow. Documents are created or uploaded by the user, stored locally, and only sent for AI analysis when the user explicitly clicks Analyze.

For the AI layer, I used Anthropic Claude with a structured prompt that includes GDPR-style, CCPA-style, HIPAA-style, and risky contract clause review concepts. The model returns structured JSON, which the backend stores and the frontend displays in a clean legal review dashboard.

For production, I would replace SQLite with PostgreSQL, add authentication and RBAC, store uploaded files in object storage, and build a real RAG pipeline over curated public legal and privacy documents.

## Disclaimer

This application is not a substitute for legal advice. It is an AI-assisted review tool intended to surface possible issues for further human legal review.
