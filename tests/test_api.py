import pytest
from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["model_loaded"] is True
    assert "version" in data

def test_symptoms_search():
    response = client.get("/api/symptoms/search")
    assert response.status_code == 200
    symptoms = response.json()
    assert len(symptoms) >= 40
    assert any("Cough" in s["name"] for s in symptoms)

def test_symptoms_filter_region():
    response = client.get("/api/symptoms/search?region=chest")
    assert response.status_code == 200
    symptoms = response.json()
    assert len(symptoms) > 0
    assert all(s["anatomical_region"] == "chest" for s in symptoms)

def test_body_regions():
    response = client.get("/api/body-regions")
    assert response.status_code == 200
    regions = response.json()
    assert len(regions) >= 6
    region_ids = [r["id"] for r in regions]
    assert "chest" in region_ids
    assert "head" in region_ids

def test_auth_flow():
    import uuid
    uid = uuid.uuid4().hex[:8]
    username = f"test_doc_{uid}"
    email = f"doc_{uid}@vitalis.ai"
    password = "SecurePass#123"

    # Register (201 Created)
    reg_resp = client.post(
        "/api/auth/register",
        json={"username": username, "email": email, "password": password}
    )
    assert reg_resp.status_code == 201
    reg_data = reg_resp.json()
    assert "access_token" in reg_data
    token = reg_data["access_token"]

    # Login (200 OK)
    login_resp = client.post(
        "/api/auth/login",
        json={"username_or_email": username, "password": password}
    )
    assert login_resp.status_code == 200
    assert "access_token" in login_resp.json()

    # Me endpoint (200 OK)
    me_resp = client.get(
        "/api/auth/me",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert me_resp.status_code == 200
    assert me_resp.json()["username"] == username

def test_ml_analysis_inference():
    payload = {
        "symptoms": [
            {"id": "persistent_dry_cough", "severity": 7, "duration": 4},
            {"id": "low_grade_fever", "severity": 5, "duration": 2},
            {"id": "physical_fatigue_malaise", "severity": 6, "duration": 5}
        ],
        "context": {
            "onset": "Gradual (3 - 5 days)",
            "progression": "Slowly worsening",
            "triggers": ["Cold air"]
        }
    }

    response = client.post("/api/analysis", json=payload)
    assert response.status_code == 200
    data = response.json()

    assert "session_id" in data
    assert data["aggregate_confidence"] > 0
    assert "primary_condition" in data
    assert data["primary_probability"] > 0
    assert len(data["predictions"]) > 0

    top_pred = data["predictions"][0]
    assert "ci_low" in top_pred
    assert "ci_high" in top_pred
    assert top_pred["ci_low"] <= top_pred["probability"] <= top_pred["ci_high"]
    assert "positive_drivers" in top_pred
    assert "negative_suppressors" in top_pred

def test_red_flag_safety_override():
    payload = {
        "symptoms": [
            {"id": "radiating_arm_jaw_pain", "severity": 10, "duration": 1},
            {"id": "dyspnea_shortness_breath", "severity": 9, "duration": 1}
        ]
    }

    response = client.post("/api/analysis", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["red_flags"]["is_triggered"] is True
    assert len(data["red_flags"]["flags"]) > 0

def test_journey_observations():
    obs_payload = {
        "day_number": 1,
        "date_str": "NOV 01 (DAY 01)",
        "severity": 4,
        "temperature": 37.5,
        "spo2": 98,
        "clinical_notes": "Mild pharyngeal tickle. Adequate hydration maintained."
    }

    create_resp = client.post("/api/journey/observations", json=obs_payload)
    assert create_resp.status_code in (200, 201)
    created = create_resp.json()
    assert created["severity"] == 4

    get_resp = client.get("/api/journey/observations")
    assert get_resp.status_code == 200
    observations = get_resp.json()
    assert len(observations) >= 1

def test_clinical_export_summary():
    response = client.get("/api/journey/export-summary")
    assert response.status_code == 200
    data = response.json()
    assert "standard" in data
    assert "resourceType" in data
    assert "observations_count" in data
    assert "trajectory" in data
