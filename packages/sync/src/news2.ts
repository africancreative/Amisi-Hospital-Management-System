/**
 * NEWS2 (National Early Warning Score) Protocol
 * 
 * Standard clinical prognostic score for predicting deterioration in adults.
 * Used for triage and automated nursing alerts in AmisiMedOS.
 */

export interface VitalsInput {
  respiratoryRate?: number;
  spO2?: number;
  temperature?: number;
  systolicBP?: number;
  heartRate?: number;
  consciousness?: 'A' | 'C' | 'V' | 'P' | 'U'; // Alert, Confused, Voice, Pain, Unresponsive
  isSupplementalOxygen?: boolean;
}

export function calculateNEWS2(vitals: VitalsInput, scale: 1 | 2 = 1): number {
  let score = 0;

  // 1. Respiratory Rate
  if (vitals.respiratoryRate !== undefined) {
    const rr = vitals.respiratoryRate;
    if (rr <= 8 || rr >= 25) score += 3;
    else if (rr >= 21) score += 2;
    else if (rr >= 9 && rr <= 11) score += 1;
  }

  // 2. SpO2 (Scale 1 vs Scale 2)
  if (vitals.spO2 !== undefined) {
    const sat = vitals.spO2;
    if (scale === 1) {
      if (sat <= 91) score += 3;
      else if (sat <= 93) score += 2;
      else if (sat <= 95) score += 1;
    } else {
      // Scale 2 for hypercapnoeic respiratory failure (e.g. COPD)
      if (sat <= 83) score += 3;
      else if (sat === 84 || sat === 85) score += 2;
      else if (sat === 86 || sat === 87) score += 1;
      else if (sat > 92 && vitals.isSupplementalOxygen) score += 2;
    }
  }

  // 3. Supplemental Oxygen
  if (vitals.isSupplementalOxygen) score += 2;

  // 4. Systolic Blood Pressure
  if (vitals.systolicBP !== undefined) {
    const bp = vitals.systolicBP;
    if (bp <= 90 || bp >= 220) score += 3;
    else if (bp <= 100) score += 2;
    else if (bp <= 110) score += 1;
  }

  // 5. Heart Rate
  if (vitals.heartRate !== undefined) {
    const hr = vitals.heartRate;
    if (hr <= 40 || hr >= 131) score += 3;
    else if (hr >= 111) score += 2;
    else if (hr >= 91 || (hr >= 41 && hr <= 50)) score += 1;
  }

  // 6. Consciousness (ACVPU)
  if (vitals.consciousness && vitals.consciousness !== 'A') {
    score += 3; // Any status other than 'Alert' (C, V, P, or U) is highly critical
  }

  // 7. Temperature
  if (vitals.temperature !== undefined) {
    const t = vitals.temperature;
    if (t <= 35) score += 3;
    else if (t >= 39.1) score += 2;
    else if (t <= 36 || t >= 38.1) score += 1;
  }

  return score;
}

/**
 * Returns clinical risk level based on NEWS2 score
 */
export function getRiskLevel(score: number): 'LOW' | 'MEDIUM' | 'HIGH' {
  if (score >= 7) return 'HIGH';
  if (score >= 5) return 'MEDIUM';
  return 'LOW';
}
