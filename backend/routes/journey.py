from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from backend.database import get_db
from backend.models.entities import Observation, User
from backend.schemas.types import ObservationCreate, ObservationResponse
from backend.services.auth_service import get_optional_user

router = APIRouter(prefix="/api/journey", tags=["Health Journey & Longitudinal Tracker"])

# Seed default baseline observations if database is clean
def ensure_default_observations(db: Session, user_id: Optional[str] = None):
    count = db.query(Observation).count()
    if count == 0:
        samples = [
            Observation(
                day_number=1,
                date_str="OCT 24",
                severity=2,
                temperature=37.1,
                spo2=99,
                clinical_notes="Initial dry tickle in pharynx. Irritation noted post-exercise. No systemic malaise, vital signs nominal.",
                user_id=user_id,
                episode_id="TRK-9042-REV3"
            ),
            Observation(
                day_number=2,
                date_str="OCT 25",
                severity=5,
                temperature=38.0,
                spo2=98,
                clinical_notes="Dry cough worsened + Low fever onset. Evening chills reported. Hydration therapy initiated.",
                user_id=user_id,
                episode_id="TRK-9042-REV3"
            ),
            Observation(
                day_number=3,
                date_str="OCT 26 (TODAY)",
                severity=6,
                temperature=38.2,
                spo2=97,
                clinical_notes="Fatigue peaked, chest tightness noted during deep exhalation. Temperature 38.2°C at 12:45.",
                user_id=user_id,
                episode_id="TRK-9042-REV3"
            )
        ]
        db.add_all(samples)
        db.commit()

@router.get("/observations", response_model=List[ObservationResponse])
def get_observations(
    db: Session = Depends(get_db),
    user: Optional[User] = Depends(get_optional_user)
):
    ensure_default_observations(db, user.id if user else None)
    
    query = db.query(Observation)
    if user:
        query = query.filter((Observation.user_id == user.id) | (Observation.user_id == None))
        
    obs = query.order_by(Observation.day_number.asc()).all()
    return [
        ObservationResponse(
            id=o.id,
            day_number=o.day_number,
            date_str=o.date_str,
            severity=o.severity,
            temperature=o.temperature,
            spo2=o.spo2,
            clinical_notes=o.clinical_notes,
            created_at=o.created_at.isoformat() if o.created_at else ""
        )
        for o in obs
    ]

@router.post("/observations", response_model=ObservationResponse, status_code=status.HTTP_201_CREATED)
def create_observation(
    req: ObservationCreate,
    db: Session = Depends(get_db),
    user: Optional[User] = Depends(get_optional_user)
):
    new_obs = Observation(
        day_number=req.day_number,
        date_str=req.date_str,
        severity=req.severity,
        temperature=req.temperature,
        spo2=req.spo2,
        clinical_notes=req.clinical_notes,
        user_id=user.id if user else None,
        episode_id=req.episode_id or "TRK-9042-REV3"
    )
    db.add(new_obs)
    db.commit()
    db.refresh(new_obs)

    return ObservationResponse(
        id=new_obs.id,
        day_number=new_obs.day_number,
        date_str=new_obs.date_str,
        severity=new_obs.severity,
        temperature=new_obs.temperature,
        spo2=new_obs.spo2,
        clinical_notes=new_obs.clinical_notes,
        created_at=new_obs.created_at.isoformat() if new_obs.created_at else ""
    )

@router.get("/export-summary")
def export_summary(db: Session = Depends(get_db)):
    obs = db.query(Observation).order_by(Observation.day_number.asc()).all()
    return {
        "resourceType": "ClinicalDossierSummary",
        "standard": "HL7/FHIR CDSS v4.2 Compatible",
        "generated_at": datetime.utcnow().isoformat() + "Z",
        "patient_status": "Ambulatory Monitored",
        "observations_count": len(obs),
        "trajectory": [
            {
                "day": o.day_number,
                "date": o.date_str,
                "severity_index": f"{o.severity}/10",
                "temperature_celsius": o.temperature,
                "oxygen_saturation": f"{o.spo2}%" if o.spo2 else "N/A",
                "notes": o.clinical_notes
            }
            for o in obs
        ]
    }