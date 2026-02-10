/**
 * Risk Scoring Utilities
 * Aligned with NIST SP 800-30 risk assessment methodology
 */

/**
 * Calculate risk score from likelihood and impact
 * @param {number} likelihood - Likelihood score (1-5)
 * @param {number} impact - Impact score (1-5)
 * @returns {number} Risk score (1-25)
 */
export function calculateScore(likelihood, impact) {
  if (!Number.isInteger(likelihood) || likelihood < 1 || likelihood > 5) {
    throw new Error('Likelihood must be an integer between 1 and 5');
  }
  if (!Number.isInteger(impact) || impact < 1 || impact > 5) {
    throw new Error('Impact must be an integer between 1 and 5');
  }
  return likelihood * impact;
}

/**
 * Calculate risk level based on score
 * Aligned with NIST SP 800-30 risk assessment methodology
 * @param {number} score - Risk score (1-25)
 * @returns {string} Risk level: Low, Medium, High, or Critical
 */
export function calculateLevel(score) {
  if (!Number.isInteger(score) || score < 1 || score > 25) {
    throw new Error('Score must be an integer between 1 and 25');
  }
  if (score <= 5) return 'Low';
  if (score <= 12) return 'Medium';
  if (score <= 18) return 'High';
  return 'Critical';
}

/**
 * Get mitigation hint based on risk level
 * Based on NIST Cybersecurity Framework recommendations
 * @param {string} level - Risk level
 * @returns {string} Mitigation hint
 */
export function getMitigationHint(level) {
  const hints = {
    Low: 'Accept / monitor - Review during next risk assessment cycle',
    Medium: 'Plan mitigation within 6 months - Document compensating controls',
    High: 'Prioritize action + implement compensating controls (NIST PR.AC-7: Rate Limiting)',
    Critical: 'Immediate mitigation required + executive reporting - Escalate to CISO'
  };
  return hints[level] || 'Review required';
}

/**
 * Full risk assessment calculation
 * @param {number} likelihood - Likelihood score (1-5)
 * @param {number} impact - Impact score (1-5)
 * @returns {{ score: number, level: string, hint: string }}
 */
export function assessRisk(likelihood, impact) {
  const score = calculateScore(likelihood, impact);
  const level = calculateLevel(score);
  const hint = getMitigationHint(level);
  return { score, level, hint };
}

/**
 * Risk level thresholds
 */
export const RISK_THRESHOLDS = {
  LOW_MAX: 5,
  MEDIUM_MAX: 12,
  HIGH_MAX: 18,
  CRITICAL_MIN: 19
};

/**
 * Likelihood labels
 */
export const LIKELIHOOD_LABELS = [
  'Rare',
  'Unlikely', 
  'Possible',
  'Likely',
  'Almost Certain'
];

/**
 * Impact labels
 */
export const IMPACT_LABELS = [
  'Negligible',
  'Minor',
  'Moderate',
  'Major',
  'Critical'
];
