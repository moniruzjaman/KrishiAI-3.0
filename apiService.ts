
import { AnalysisResult } from '../types';

const API_BASE = '/api/v1';

/**
 * Service to interact with the Krishi AI Python Backend
 */
export const apiService = {
  /**
   * Log a diagnostic report to the backend for auditing.
   */
  async logDiagnostic(userId: string, result: AnalysisResult, crop: string) {
    try {
      const response = await fetch(`${API_BASE}/diagnostics/log`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          crop: crop,
          diagnosis: result.diagnosis,
          category: result.category,
          confidence: result.confidence,
          advisory: result.advisory,
          location: 'Detected via Frontend'
        }),
      });
      return await response.json();
    } catch (error) {
      console.error("Backend logging failed:", error);
      return null;
    }
  },

  /**
   * Fetch official government-verified supplementary data.
   */
  async getOfficialAdvisory(crop: string, condition: string) {
    try {
      const response = await fetch(`${API_BASE}/advisory/official?crop=${encodeURIComponent(crop)}&condition=${encodeURIComponent(condition)}`);
      if (!response.ok) throw new Error('Network response was not ok');
      return await response.json();
    } catch (error) {
      console.error("Failed to fetch official advisory:", error);
      return null;
    }
  }
};
