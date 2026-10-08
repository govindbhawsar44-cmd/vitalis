from datetime import datetime
import uuid
from sqlalchemy import Column, String, Integer, Float, DateTime, ForeignKey, Text, Boolean
from sqlalchemy.orm import relationship
from backend.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    sessions = relationship("AnalysisSession", back_populates="user", cascade="all, delete-orphan")
    observations = relationship("Observation", back_populates="user", cascade="all, delete-orphan")

class Symptom(Base):
    __tablename__ = "symptoms"

    id = Column(String(50), primary_key=True)  # e.g., 'cough_dry', 'fever_low'
    code = Column(String(20), unique=True, index=True, nullable=False)  # e.g. 'RESP-01'
    name = Column(String(100), nullable=False)
    category = Column(String(50), nullable=False)  # 'Pulmonology', 'Cranial', etc.
    anatomical_region = Column(String(50), nullable=False)  # 'chest', 'head', 'abdomen', 'joints', 'general'
    default_severity = Column(Integer, default=5)
    is_red_flag = Column(Boolean, default=False)
    description = Column(Text, nullable=True)

class AnalysisSession(Base):
    __tablename__ = "analysis_sessions"

    id = Column(String(36), primary_key=True, default=lambda: f"VIT-{uuid.uuid4().hex[:6].upper()}-DX")
    user_id = Column(String(36), ForeignKey("users.id"), nullable=True, index=True)
    input_symptoms_json = Column(Text, nullable=False)  # JSON array of selected symptoms
    context_json = Column(Text, nullable=True)  # JSON object with onset, progression, triggers
    aggregate_confidence = Column(Float, default=0.0)
    primary_condition = Column(String(100), nullable=True)
    primary_probability = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="sessions")
    predictions = relationship("AnalysisPrediction", back_populates="session", cascade="all, delete-orphan")

class AnalysisPrediction(Base):
    __tablename__ = "analysis_predictions"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    session_id = Column(String(36), ForeignKey("analysis_sessions.id"), nullable=False, index=True)
    condition_name = Column(String(100), nullable=False)
    icd10_code = Column(String(20), nullable=True)
    rank = Column(Integer, default=1)
    probability = Column(Float, nullable=False)
    ci_low = Column(Float, nullable=False)
    ci_high = Column(Float, nullable=False)
    shap_attributions_json = Column(Text, nullable=True)

    session = relationship("AnalysisSession", back_populates="predictions")

class Observation(Base):
    __tablename__ = "observations"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id"), nullable=True, index=True)
    episode_id = Column(String(50), index=True, default="EPISODE-CURRENT")
    day_number = Column(Integer, nullable=False)
    date_str = Column(String(50), nullable=False)
    severity = Column(Integer, nullable=False)  # 1 to 10
    temperature = Column(Float, nullable=True)  # Celsius
    spo2 = Column(Integer, nullable=True)       # Percentage
    clinical_notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="observations")