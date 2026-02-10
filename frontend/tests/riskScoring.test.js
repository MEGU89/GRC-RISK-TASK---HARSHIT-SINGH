import { describe, it, expect } from 'vitest';
import {
  calculateScore,
  calculateLevel,
  getMitigationHint,
  assessRisk,
  RISK_THRESHOLDS,
  LIKELIHOOD_LABELS,
  IMPACT_LABELS
} from '../src/utils/riskScoring.js';

describe('calculateScore', () => {
  it('calculates score as likelihood × impact', () => {
    expect(calculateScore(1, 1)).toBe(1);
    expect(calculateScore(2, 3)).toBe(6);
    expect(calculateScore(5, 5)).toBe(25);
    expect(calculateScore(3, 4)).toBe(12);
    expect(calculateScore(4, 3)).toBe(12);
  });

  it('handles minimum values (1, 1)', () => {
    expect(calculateScore(1, 1)).toBe(1);
  });

  it('handles maximum values (5, 5)', () => {
    expect(calculateScore(5, 5)).toBe(25);
  });

  it('throws error for invalid likelihood', () => {
    expect(() => calculateScore(0, 3)).toThrow('Likelihood must be an integer between 1 and 5');
    expect(() => calculateScore(6, 3)).toThrow('Likelihood must be an integer between 1 and 5');
    expect(() => calculateScore(-1, 3)).toThrow('Likelihood must be an integer between 1 and 5');
    expect(() => calculateScore(1.5, 3)).toThrow('Likelihood must be an integer between 1 and 5');
  });

  it('throws error for invalid impact', () => {
    expect(() => calculateScore(3, 0)).toThrow('Impact must be an integer between 1 and 5');
    expect(() => calculateScore(3, 6)).toThrow('Impact must be an integer between 1 and 5');
    expect(() => calculateScore(3, -1)).toThrow('Impact must be an integer between 1 and 5');
    expect(() => calculateScore(3, 2.5)).toThrow('Impact must be an integer between 1 and 5');
  });
});

describe('calculateLevel', () => {
  it('returns "Low" for scores 1-5', () => {
    expect(calculateLevel(1)).toBe('Low');
    expect(calculateLevel(2)).toBe('Low');
    expect(calculateLevel(3)).toBe('Low');
    expect(calculateLevel(4)).toBe('Low');
    expect(calculateLevel(5)).toBe('Low');
  });

  it('returns "Medium" for scores 6-12', () => {
    expect(calculateLevel(6)).toBe('Medium');
    expect(calculateLevel(9)).toBe('Medium');
    expect(calculateLevel(12)).toBe('Medium');
  });

  it('returns "High" for scores 13-18', () => {
    expect(calculateLevel(13)).toBe('High');
    expect(calculateLevel(15)).toBe('High');
    expect(calculateLevel(18)).toBe('High');
  });

  it('returns "Critical" for scores 19-25', () => {
    expect(calculateLevel(19)).toBe('Critical');
    expect(calculateLevel(20)).toBe('Critical');
    expect(calculateLevel(25)).toBe('Critical');
  });

  it('handles boundary values correctly', () => {
    expect(calculateLevel(5)).toBe('Low');       // Low boundary
    expect(calculateLevel(6)).toBe('Medium');    // Medium lower boundary
    expect(calculateLevel(12)).toBe('Medium');   // Medium upper boundary
    expect(calculateLevel(13)).toBe('High');     // High lower boundary
    expect(calculateLevel(18)).toBe('High');     // High upper boundary
    expect(calculateLevel(19)).toBe('Critical'); // Critical boundary
  });

  it('throws error for invalid scores', () => {
    expect(() => calculateLevel(0)).toThrow('Score must be an integer between 1 and 25');
    expect(() => calculateLevel(26)).toThrow('Score must be an integer between 1 and 25');
    expect(() => calculateLevel(-5)).toThrow('Score must be an integer between 1 and 25');
    expect(() => calculateLevel(10.5)).toThrow('Score must be an integer between 1 and 25');
  });
});

describe('getMitigationHint', () => {
  it('returns correct hint for Low level', () => {
    expect(getMitigationHint('Low')).toBe('Accept / monitor - Review during next risk assessment cycle');
  });

  it('returns correct hint for Medium level', () => {
    expect(getMitigationHint('Medium')).toBe('Plan mitigation within 6 months - Document compensating controls');
  });

  it('returns correct hint for High level', () => {
    expect(getMitigationHint('High')).toBe('Prioritize action + implement compensating controls (NIST PR.AC-7: Rate Limiting)');
  });

  it('returns correct hint for Critical level', () => {
    expect(getMitigationHint('Critical')).toBe('Immediate mitigation required + executive reporting - Escalate to CISO');
  });

  it('returns fallback for unknown level', () => {
    expect(getMitigationHint('Unknown')).toBe('Review required');
    expect(getMitigationHint('')).toBe('Review required');
  });
});

describe('assessRisk', () => {
  it('returns complete assessment for low risk', () => {
    const result = assessRisk(1, 2);
    expect(result).toEqual({
      score: 2,
      level: 'Low',
      hint: 'Accept / monitor - Review during next risk assessment cycle'
    });
  });

  it('returns complete assessment for medium risk', () => {
    const result = assessRisk(2, 4);
    expect(result).toEqual({
      score: 8,
      level: 'Medium',
      hint: 'Plan mitigation within 6 months - Document compensating controls'
    });
  });

  it('returns complete assessment for high risk', () => {
    const result = assessRisk(3, 5);
    expect(result).toEqual({
      score: 15,
      level: 'High',
      hint: 'Prioritize action + implement compensating controls (NIST PR.AC-7: Rate Limiting)'
    });
  });

  it('returns complete assessment for critical risk', () => {
    const result = assessRisk(5, 5);
    expect(result).toEqual({
      score: 25,
      level: 'Critical',
      hint: 'Immediate mitigation required + executive reporting - Escalate to CISO'
    });
  });

  it('calculates edge case 4×5=20 as Critical', () => {
    const result = assessRisk(4, 5);
    expect(result.score).toBe(20);
    expect(result.level).toBe('Critical');
  });

  it('calculates 3×4=12 as Medium (boundary)', () => {
    const result = assessRisk(3, 4);
    expect(result.score).toBe(12);
    expect(result.level).toBe('Medium');
  });

  it('calculates 4×4=16 as High', () => {
    const result = assessRisk(4, 4);
    expect(result.score).toBe(16);
    expect(result.level).toBe('High');
  });
});

describe('RISK_THRESHOLDS', () => {
  it('has correct threshold values', () => {
    expect(RISK_THRESHOLDS.LOW_MAX).toBe(5);
    expect(RISK_THRESHOLDS.MEDIUM_MAX).toBe(12);
    expect(RISK_THRESHOLDS.HIGH_MAX).toBe(18);
    expect(RISK_THRESHOLDS.CRITICAL_MIN).toBe(19);
  });
});

describe('LIKELIHOOD_LABELS', () => {
  it('has 5 labels in correct order', () => {
    expect(LIKELIHOOD_LABELS).toHaveLength(5);
    expect(LIKELIHOOD_LABELS[0]).toBe('Rare');
    expect(LIKELIHOOD_LABELS[4]).toBe('Almost Certain');
  });
});

describe('IMPACT_LABELS', () => {
  it('has 5 labels in correct order', () => {
    expect(IMPACT_LABELS).toHaveLength(5);
    expect(IMPACT_LABELS[0]).toBe('Negligible');
    expect(IMPACT_LABELS[4]).toBe('Critical');
  });
});

// Integration-style tests
describe('Risk Matrix Coverage', () => {
  it('covers all 25 combinations in the risk matrix', () => {
    const results = [];
    for (let l = 1; l <= 5; l++) {
      for (let i = 1; i <= 5; i++) {
        const { score, level } = assessRisk(l, i);
        results.push({ likelihood: l, impact: i, score, level });
      }
    }
    
    expect(results).toHaveLength(25);
    
    // Verify all levels are present
    const levels = new Set(results.map(r => r.level));
    expect(levels).toContain('Low');
    expect(levels).toContain('Medium');
    expect(levels).toContain('High');
    expect(levels).toContain('Critical');
  });

  it('Low risks are in expected positions', () => {
    // Low: score 1-5 (combinations that result in ≤5)
    expect(assessRisk(1, 1).level).toBe('Low'); // 1
    expect(assessRisk(1, 5).level).toBe('Low'); // 5
    expect(assessRisk(5, 1).level).toBe('Low'); // 5
  });

  it('Critical risks are in expected positions', () => {
    // Critical: score 19-25
    expect(assessRisk(4, 5).level).toBe('Critical'); // 20
    expect(assessRisk(5, 4).level).toBe('Critical'); // 20
    expect(assessRisk(5, 5).level).toBe('Critical'); // 25
  });
});
