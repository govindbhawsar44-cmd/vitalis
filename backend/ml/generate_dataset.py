import numpy as np
import json
from backend.ml.symptom_taxonomy import SYMPTOMS_TAXONOMY, CONDITIONS_PROFILES

def generate_cohort(
    n_samples: int = 50000,
    random_seed: int = 42,
    key_sym_prob: float = 0.88,
    unreported_prob: float = 0.03,
    noise_prob: float = 0.15
):
    np.random.seed(random_seed)
    
    symptom_ids = [s["id"] for s in SYMPTOMS_TAXONOMY]
    symptom_idx_map = {s_id: i for i, s_id in enumerate(symptom_ids)}
    n_features = len(symptom_ids)
    
    condition_names = [c["id"] for c in CONDITIONS_PROFILES]
    n_classes = len(condition_names)
    
    X = np.zeros((n_samples, n_features), dtype=np.float32)
    y = np.zeros(n_samples, dtype=np.int32)
    
    samples_per_class = n_samples // n_classes
    current_row = 0
    
    for c_idx, condition in enumerate(CONDITIONS_PROFILES):
        c_samples = samples_per_class if c_idx < n_classes - 1 else n_samples - current_row
        key_syms = set(condition["key_symptoms"])
        unreported = set(condition.get("unreported_common", []))
        
        # Background symptoms excluding key symptoms and unreported symptoms to prevent noise overwriting
        bg_symptom_indices = [
            i for i, sid in enumerate(symptom_ids)
            if sid not in key_syms and sid not in unreported
        ]
        
        for _ in range(c_samples):
            # Key symptoms present with parameterized probability (e.g., 0.88 for train, 0.80 for distribution shift test)
            for ks in key_syms:
                if ks in symptom_idx_map and np.random.rand() < key_sym_prob:
                    severity = np.random.choice([0.4, 0.6, 0.7, 0.8, 0.9, 1.0])
                    X[current_row, symptom_idx_map[ks]] = severity
            
            # Unreported/counter symptoms present with very low probability
            for us in unreported:
                if us in symptom_idx_map and np.random.rand() < unreported_prob:
                    X[current_row, symptom_idx_map[us]] = 0.3
            
            # Random background noise sampled strictly from background symptoms
            if bg_symptom_indices:
                n_noise = np.random.choice([0, 1, 2], p=[0.6, 0.3, 0.1])
                if n_noise > 0:
                    chosen_bg = np.random.choice(bg_symptom_indices, size=min(n_noise, len(bg_symptom_indices)), replace=False)
                    for ni in chosen_bg:
                        if np.random.rand() < noise_prob:
                            X[current_row, ni] = np.random.uniform(0.2, 0.5)
            
            y[current_row] = c_idx
            current_row += 1
            
    return X, y, symptom_ids, condition_names

if __name__ == "__main__":
    X, y, symptoms, conditions = generate_cohort(1000)
    print(f"Generated test cohort shape: X={X.shape}, y={y.shape}")