from fastapi import APIRouter, Query
from typing import List, Optional
from backend.ml.symptom_taxonomy import SYMPTOMS_TAXONOMY
from backend.schemas.types import SymptomSchema

router = APIRouter(prefix="/api", tags=["Symptoms & Anatomy"])

@router.get("/symptoms", response_model=List[SymptomSchema])
def list_symptoms():
    return [SymptomSchema(**s) for s in SYMPTOMS_TAXONOMY]

@router.get("/symptoms/search", response_model=List[SymptomSchema])
def search_symptoms(
    q: Optional[str] = Query(None, description="Search term for symptom name or description"),
    region: Optional[str] = Query(None, description="Filter by anatomical region (head, chest, abdomen, joints, general)")
):
    results = SYMPTOMS_TAXONOMY
    
    if region and region.lower() != "all":
        results = [s for s in results if s["anatomical_region"].lower() == region.lower()]
        
    if q and q.strip():
        term = q.strip().lower()
        results = [
            s for s in results
            if term in s["name"].lower()
            or term in s["category"].lower()
            or term in s.get("description", "").lower()
        ]
        
    return [SymptomSchema(**s) for s in results]

@router.get("/body-regions")
@router.get("/symptoms/body-regions")
def get_body_regions():
    regions = [
        {"id": "all", "name": "All Physiological Systems", "icon": "grid_view", "count": 48},
        {"id": "chest", "name": "Pulmonology & Airway", "icon": "air", "count": 8, "mesh_id": "chest"},
        {"id": "head", "name": "Cranial & Neurological", "icon": "psychology", "count": 8, "mesh_id": "head"},
        {"id": "heart", "name": "Cardiovascular & Thoracic", "icon": "cardiology", "count": 8, "mesh_id": "heart"},
        {"id": "abdomen", "name": "Gastrointestinal & Hepatic", "icon": "nutrition", "count": 8, "mesh_id": "abdomen"},
        {"id": "joints", "name": "Musculoskeletal & Articular", "icon": "accessibility_new", "count": 8, "mesh_id": "joints"},
        {"id": "general", "name": "Systemic & Thermal", "icon": "thermostat", "count": 8, "mesh_id": "body"}
    ]
    return regions