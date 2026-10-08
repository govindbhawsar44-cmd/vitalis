import json
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional

from backend.database import get_db
from backend.models.entities import AnalysisSession, AnalysisPrediction, User
from backend.schemas.types import AnalysisRequest, AnalysisResponse, PredictionResult
from backend.services.auth_service import get_optional_user, get_current_user
from backend.services.ml_service import ml_engine

router = APIRouter(prefix="/api/analysis", tags=["ML Analysis & Triage"])

@router.post("", response_model=AnalysisResponse)
@router.post("/predict", response_model=AnalysisResponse)
def run_analysis(
    req: AnalysisRequest,
    db: Session = Depends(get_db),
    user: Optional[User] = Depends(get_optional_user)
):
    if not req.symptoms or len(req.symptoms) == 0:
        raise HTTPException(status_code=400, detail="At least one symptom must be provided")

    # Run ML prediction pipeline
    response = ml_engine.analyze(req)

    # Persist session to database
    try:
        session_record = AnalysisSession(
            id=response.session_id,
            user_id=user.id if user else None,
            input_symptoms_json=json.dumps([s.model_dump() for s in req.symptoms]),
            context_json=json.dumps(req.context.model_dump()) if req.context else None,
            aggregate_confidence=response.aggregate_confidence,
            primary_condition=response.primary_condition,
            primary_probability=response.primary_probability
        )
        db.add(session_record)

        for pred in response.predictions:
            pred_record = AnalysisPrediction(
                session_id=session_record.id,
                condition_name=pred.condition_name,
                icd10_code=pred.icd10_code,
                rank=pred.rank,
                probability=pred.probability,
                ci_low=pred.ci_low,
                ci_high=pred.ci_high,
                shap_attributions_json=json.dumps({
                    "positive": [p.model_dump() for p in pred.positive_drivers],
                    "negative": [n.model_dump() for n in pred.negative_suppressors]
                })
            )
            db.add(pred_record)

        db.commit()
    except Exception as e:
        db.rollback()
        # Log error but return analysis response to client without breaking UX
        print(f"Warning: Failed to persist analysis session: {e}")

    return response

@router.get("/history")
def get_analysis_history(
    db: Session = Depends(get_db),
    user: Optional[User] = Depends(get_optional_user)
):
    query = db.query(AnalysisSession)
    if user:
        query = query.filter(AnalysisSession.user_id == user.id)
    
    sessions = query.order_by(AnalysisSession.created_at.desc()).limit(10).all()
    
    history_list = []
    for s in sessions:
        history_list.append({
            "id": s.id,
            "created_at": s.created_at.isoformat() if s.created_at else "",
            "primary_condition": s.primary_condition,
            "primary_probability": s.primary_probability,
            "aggregate_confidence": s.aggregate_confidence,
            "symptom_count": len(json.loads(s.input_symptoms_json)) if s.input_symptoms_json else 0
        })
    return history_list

@router.get("/{session_id}", response_model=AnalysisResponse)
def get_analysis_by_id(session_id: str, db: Session = Depends(get_db)):
    session_record = db.query(AnalysisSession).filter(AnalysisSession.id == session_id).first()
    if not session_record:
        raise HTTPException(status_code=404, detail="Analysis session not found")

    input_symptoms = json.loads(session_record.input_symptoms_json) if session_record.input_symptoms_json else []
    # Re-run or construct response from database
    req = AnalysisRequest(
        symptoms=input_symptoms,
        context=json.loads(session_record.context_json) if session_record.context_json else None
    )
    res = ml_engine.analyze(req)
    res.session_id = session_record.id
    return res

@router.delete("/{session_id}")
def delete_analysis(session_id: str, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    session_record = db.query(AnalysisSession).filter(
        AnalysisSession.id == session_id,
        AnalysisSession.user_id == user.id
    ).first()
    if not session_record:
        raise HTTPException(status_code=404, detail="Analysis session not found or unauthorized")
    
    db.delete(session_record)
    db.commit()
    return {"message": "Session deleted"}