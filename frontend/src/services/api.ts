import {
  Symptom,
  SymptomInput,
  AnalysisContext,
  AnalysisResponse,
  Observation,
  User,
  BodyRegion,
} from '../types';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('vitalis_token');
  const headers: Record<string, string> = {
    'Bypass-Tunnel-Reminder': 'true',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export async function fetchSymptoms(region?: string, q?: string): Promise<Symptom[]> {
  const params = new URLSearchParams();
  if (region && region !== 'all') params.append('region', region);
  if (q && q.trim()) params.append('q', q.trim());

  const url = `${API_BASE}/symptoms/search?${params.toString()}`;
  const res = await fetch(url, {
    headers: getAuthHeader(),
  });
  if (!res.ok) throw new Error('Failed to fetch symptoms catalog');
  return res.json();
}

export async function fetchBodyRegions(): Promise<BodyRegion[]> {
  const res = await fetch(`${API_BASE}/symptoms/body-regions`, {
    headers: getAuthHeader(),
  });
  if (!res.ok) throw new Error('Failed to fetch body regions');
  return res.json();
}

export async function runSymptomAnalysis(
  symptoms: SymptomInput[],
  context?: AnalysisContext
): Promise<AnalysisResponse> {
  const res = await fetch(`${API_BASE}/analysis`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
    body: JSON.stringify({ symptoms, context }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Analysis failed' }));
    throw new Error(err.detail || 'Analysis inference failed');
  }
  return res.json();
}

export async function fetchAnalysisHistory(): Promise<any[]> {
  const res = await fetch(`${API_BASE}/analysis/history`, {
    headers: getAuthHeader(),
  });
  if (!res.ok) throw new Error('Failed to fetch analysis history');
  return res.json();
}

export async function fetchObservations(): Promise<Observation[]> {
  const res = await fetch(`${API_BASE}/journey/observations`, {
    headers: getAuthHeader(),
  });
  if (!res.ok) throw new Error('Failed to fetch observations');
  return res.json();
}

export async function createObservation(data: {
  day_number: number;
  date_str: string;
  severity: number;
  temperature?: number;
  spo2?: number;
  clinical_notes?: string;
}): Promise<Observation> {
  const res = await fetch(`${API_BASE}/journey/observations`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to commit observation record');
  return res.json();
}

export async function exportClinicalSummary(): Promise<any> {
  const res = await fetch(`${API_BASE}/journey/export-summary`, {
    headers: getAuthHeader(),
  });
  if (!res.ok) throw new Error('Failed to generate export summary');
  return res.json();
}

export async function loginUser(
  username_or_email: string,
  password: string
): Promise<{ access_token: string; user: User }> {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
    body: JSON.stringify({ username_or_email, password }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Invalid credentials' }));
    throw new Error(err.detail || 'Authentication failed');
  }
  const data = await res.json();
  localStorage.setItem('vitalis_token', data.access_token);
  return {
    access_token: data.access_token,
    user: {
      id: data.user_id,
      username: data.username,
      email: data.email,
      created_at: new Date().toISOString(),
    },
  };
}

export async function registerUser(
  username: string,
  email: string,
  password: string
): Promise<{ access_token: string; user: User }> {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
    body: JSON.stringify({ username, email, password }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Registration failed' }));
    throw new Error(err.detail || 'Registration failed');
  }
  const data = await res.json();
  localStorage.setItem('vitalis_token', data.access_token);
  return {
    access_token: data.access_token,
    user: {
      id: data.user_id,
      username: data.username,
      email: data.email,
      created_at: new Date().toISOString(),
    },
  };
}

export async function getCurrentUser(): Promise<User | null> {
  const token = localStorage.getItem('vitalis_token');
  if (!token) return null;
  try {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getAuthHeader(),
    });
    if (!res.ok) {
      localStorage.removeItem('vitalis_token');
      return null;
    }
    return res.json();
  } catch {
    return null;
  }
}

export function logoutUser(): void {
  localStorage.removeItem('vitalis_token');
}