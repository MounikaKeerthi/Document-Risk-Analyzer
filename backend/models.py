from sqlalchemy import Column, Integer, String, Text, DateTime
from datetime import datetime
from database import Base

class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    document_type = Column(String, nullable=False)
    client_name = Column(String, nullable=True)
    content = Column(Text, nullable=False)

    risk_level = Column(String, default="Not analyzed")
    summary = Column(Text, nullable=True)
    risky_clauses = Column(Text, nullable=True)
    privacy_concerns = Column(Text, nullable=True)
    suggested_questions = Column(Text, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow)