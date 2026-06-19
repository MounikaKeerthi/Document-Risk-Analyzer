from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class DocumentCreate(BaseModel):
    title: str
    document_type: str
    client_name: Optional[str] = None
    content: str

class DocumentUpdate(BaseModel):
    title: str
    document_type: str
    client_name: Optional[str] = None
    content: str

class DocumentResponse(BaseModel):
    id: int
    title: str
    document_type: str
    client_name: Optional[str]
    content: str

    risk_level: str
    summary: Optional[str]
    risky_clauses: Optional[str]
    privacy_concerns: Optional[str]
    suggested_questions: Optional[str]

    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True