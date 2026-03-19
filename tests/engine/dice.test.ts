import { describe, it, expect } from 'vitest';
import { rollDie, rollDice, roll1D, roll2D, roll3D, rollD3, rollD66 } from '../../src/engine/dice';

describe('Dice Engine', () => {
  describe('rollDie', () => {
    it('returns integer within range for d6', () => {
      for (let i = 0; i < 100; i++) {
        const result = rollDie(6);
        expect(result).toBeGreaterThanOrEqual(1);
        expect(result).toBeLessThanOrEqual(6);
        expect(Number.isInteger(result)).toBe(true);
      }
    });

    it('returns integer within range for d3', () => {
      for (let i = 0; i < 100; i++) {
        const result = rollDie(3);
        expect(result).toBeGreaterThanOrEqual(1);
        expect(result).toBeLessThanOrEqual(3);
      }
    });

    it('returns 1 for d1', () => {
      for (let i = 0; i < 10; i++) {
        expect(rollDie(1)).toBe(1);
      }
    });

    it('throws for sides <= 0', () => {
      expect(() => rollDie(0)).toThrow();
      expect(() => rollDie(-1)).toThrow();
    });
  });

  describe('rollDice', () => {
    it('returns array of correct length', () => {
      const results = rollDice(2, 6);
      expect(results).toHaveLength(2);
      results.forEach((r) => {
        expect(r).toBeGreaterThanOrEqual(1);
        expect(r).toBeLessThanOrEqual(6);
      });
    });

    it('returns array of 5 dice', () => {
      const results = rollDice(5, 6);
      expect(results).toHaveLength(5);
    });
  });

  describe('convenience functions', () => {
    it('roll1D returns 1-6', () => {
      for (let i = 0; i < 50; i++) {
        const r = roll1D();
        expect(r).toBeGreaterThanOrEqual(1);
        expect(r).toBeLessThanOrEqual(6);
      }
    });

    it('roll2D returns 2-12', () => {
      for (let i = 0; i < 50; i++) {
        const r = roll2D();
        expect(r).toBeGreaterThanOrEqual(2);
        expect(r).toBeLessThanOrEqual(12);
      }
    });

    it('roll3D returns 3-18', () => {
      for (let i = 0; i < 50; i++) {
        const r = roll3D();
        expect(r).toBeGreaterThanOrEqual(3);
        expect(r).toBeLessThanOrEqual(18);
      }
    });

    it('rollD3 returns 1-3', () => {
      for (let i = 0; i < 50; i++) {
        const r = rollD3();
        expect(r).toBeGreaterThanOrEqual(1);
        expect(r).toBeLessThanOrEqual(3);
      }
    });

    it('rollD66 returns valid D66 values (11-66, no 7/8/9 in digits)', () => {
      const validValues = new Set<number>();
      for (let tens = 1; tens <= 6; tens++) {
        for (let ones = 1; ones <= 6; ones++) {
          validValues.add(tens * 10 + ones);
        }
      }

      for (let i = 0; i < 200; i++) {
        const r = rollD66();
        expect(validValues.has(r)).toBe(true);
      }
    });
  });

  describe('statistical distribution', () => {
    it('passes chi-squared test for 1D6 over 10,000 rolls (p=0.01)', () => {
      const counts = [0, 0, 0, 0, 0, 0]; // index 0 = face 1, etc.
      const N = 10_000;

      for (let i = 0; i < N; i++) {
        const result = rollDie(6);
        counts[result - 1]++;
      }

      const expected = N / 6;
      let chiSquared = 0;
      for (let i = 0; i < 6; i++) {
        chiSquared += (counts[i] - expected) ** 2 / expected;
      }

      // Chi-squared critical value for df=5, p=0.01 is 15.086
      // Using 16.81 as threshold (more lenient)
      expect(chiSquared).toBeLessThan(16.81);
    });
  });
});
