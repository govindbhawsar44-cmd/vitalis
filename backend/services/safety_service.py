from typing import List, Dict, Any
from backend.schemas.types import RedFlagAlert, SymptomInput
from backend.ml.symptom_taxonomy import SYMPTOMS_TAXONOMY

CRITICAL_INDICATORS = [
    {
        "id": "respiratory_compromise",
        "title": "Acute Respiratory Compromise",
        "description": "Sudden severe shortness of breath, audible stridor, or inability to speak in complete sentences without gasping.",
        "trigger_symptoms": ["dyspnea_shortness_breath", "tachypnea_rapid_breathing", "RESP-04", "RESP-08", "RESP_SOB_REST", "4"],
        "min_severity": 7
    },
    {
        "id": "cardiothoracic_distress",
        "title": "Cardiothoracic Distress",
        "description": "Persistent retrosternal chest pain, squeezing pressure, or radiating pain to the shoulder, jaw, or left arm.",
        "trigger_symptoms": ["retrosternal_chest_pressure", "radiating_arm_jaw_pain", "CARD-01", "CARD-02", "CARD_CHEST_PAIN_RAD", "13", "14"],
        "min_severity": 6
    },
    {
        "id": "peripheral_hypoxia",
        "title": "Peripheral Hypoxia (Cyanosis)",
        "description": "Bluish tint observed along lip margins, tongue, or nail beds, pale ashen skin with cold diaphoresis, or SpO2 < 93%.",
        "trigger_symptoms": ["peripheral_cyanosis", "cold_diaphoresis", "DERM-02", "SYS-04", "DERM_CYANOSIS", "48"],
        "min_severity": 6
    },
    {
        "id": "uncontrolled_hyperpyrexia",
        "title": "Uncontrolled Hyperpyrexia & Meningeal Signs",
        "description": "High persistent fever exceeding 39.5°C unresponsive to antipyretics, severe acute neck stiffness, or altered orientation.",
        "trigger_symptoms": ["uncontrolled_hyperpyrexia", "nuchal_rigidity_neck_stiffness", "SYS-02", "NEURO-06", "NEURO_NECK_STIFF", "32"],
        "min_severity": 7
    }
]

def evaluate_safety_flags(symptoms: List[SymptomInput]) -> RedFlagAlert:
    active_flags: List[Dict[str, str]] = []
    
    # Map each symptom input id/name/code to severity
    symptom_severities: Dict[str, int] = {}
    for s in symptoms:
        symptom_severities[str(s.id).lower()] = s.severity
        if hasattr(s, "name") and s.name:
            symptom_severities[s.name.lower()] = s.severity

    # Also resolve taxonomy indexes/ids/codes
    for idx, tax in enumerate(SYMPTOMS_TAXONOMY, start=1):
        # if tax id, code, or index was passed
        tax_id = tax["id"].lower()
        tax_code = tax["code"].lower()
        idx_str = str(idx)

        sev = None
        if tax_id in symptom_severities:
            sev = symptom_severities[tax_id]
        elif tax_code in symptom_severities:
            sev = symptom_severities[tax_code]
        elif idx_str in symptom_severities:
            sev = symptom_severities[idx_str]

        if sev is not None:
            symptom_severities[tax_id] = sev
            symptom_severities[tax_code] = sev
            symptom_severities[idx_str] = sev

    for indicator in CRITICAL_INDICATORS:
        is_active = False
        matched_sym_names = []
        for ts in indicator["trigger_symptoms"]:
            ts_lower = ts.lower()
            if ts_lower in symptom_severities and symptom_severities[ts_lower] >= indicator["min_severity"]:
                is_active = True
                matched_sym_names.append(ts)
                
        if is_active:
            active_flags.append({
                "id": indicator["id"],
                "title": indicator["title"],
                "description": indicator["description"],
                "matched_symptoms": ", ".join(set(matched_sym_names)),
                "severity_level": "EMERGENCY_OVERRIDE"
            })
            
    return RedFlagAlert(
        is_triggered=len(active_flags) > 0,
        flags=active_flags
    )