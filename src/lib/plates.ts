/**
 * Plate calculator + warm-up generator (pure logic, no React, no IO).
 *
 * Sprint 1 — Foundation Logging Excellence:
 *  - computePlates: target weight → plate breakdown per side
 *  - totalFromPlates: reverse calculator (plates per side → total)
 *  - generateWarmup: working weight + scheme → warm-up set list
 */

export interface PlateInventory {
  /** Plate sizes available (kg). Stored largest-first or any order — we sort on use. */
  kg: number[];
  /** Bar weight in kg. Default Olympic = 20 kg. */
  barKg: number;
  /**
   * Optional: max count per plate size (per side, so 4 = "4 pcs ada di rak per sisi").
   * Omit = treat as unlimited.
   */
  countsPerSide?: Record<number, number>;
}

export interface PlateGroup {
  kg: number;
  count: number;
}

export interface PlateSelection {
  /** Plates loaded per side, largest first. Both sides mirror. */
  perSide: PlateGroup[];
  /** Effective total bar weight (bar + 2× sum(perSide)). */
  totalKg: number;
  /** target - totalKg. Positive = couldn't reach target, negative = overshot impossible. */
  remainderKg: number;
  /** Whether totalKg matches target exactly. */
  feasible: boolean;
}

const EPS = 1e-6;

export const DEFAULT_PLATE_INVENTORY: PlateInventory = {
  kg: [25, 20, 15, 10, 5, 2.5, 1.25],
  barKg: 20,
};

/**
 * Compute plate breakdown for a target loaded weight using greedy largest-first.
 *
 * @example
 * computePlates(100, DEFAULT_PLATE_INVENTORY)
 *   // → perSide: [{ kg: 25, count: 1 }, { kg: 15, count: 1 }], totalKg: 100, feasible: true
 */
export function computePlates(target: number, inventory: PlateInventory): PlateSelection {
  const barKg = inventory.barKg;
  if (!Number.isFinite(target) || target < barKg) {
    return {
      perSide: [],
      totalKg: barKg,
      remainderKg: target - barKg,
      feasible: target === barKg,
    };
  }

  const perSideTarget = (target - barKg) / 2;
  if (perSideTarget < EPS) {
    return {
      perSide: [],
      totalKg: barKg,
      remainderKg: 0,
      feasible: true,
    };
  }

  const plates = [...inventory.kg].filter((p) => p > 0).sort((a, b) => b - a);
  const caps = inventory.countsPerSide ?? {};

  let remaining = perSideTarget;
  const perSide: PlateGroup[] = [];

  for (const plate of plates) {
    if (remaining < plate - EPS) continue;
    const cap = caps[plate] ?? Number.POSITIVE_INFINITY;
    if (cap <= 0) continue;
    const wanted = Math.floor(remaining / plate + EPS);
    const count = Math.min(wanted, cap);
    if (count > 0) {
      perSide.push({ kg: plate, count });
      remaining -= count * plate;
    }
  }

  const loadedPerSide = perSide.reduce((sum, x) => sum + x.kg * x.count, 0);
  const totalKg = round01(barKg + 2 * loadedPerSide);
  return {
    perSide,
    totalKg,
    remainderKg: round01(target - totalKg),
    feasible: Math.abs(target - totalKg) < 0.05,
  };
}

/**
 * Reverse: total weight from a per-side plate selection + bar.
 */
export function totalFromPlates(perSide: PlateGroup[], barKg: number): number {
  const perSideTotal = perSide.reduce((sum, g) => sum + g.kg * g.count, 0);
  return round01(barKg + 2 * perSideTotal);
}

export interface WarmupStep {
  percent: number; // 0..1
  reps: number;
}

export interface WarmupScheme {
  steps: WarmupStep[];
}

export const DEFAULT_WARMUP_SCHEME: WarmupScheme = {
  steps: [
    { percent: 0.4, reps: 8 },
    { percent: 0.6, reps: 5 },
    { percent: 0.8, reps: 3 },
  ],
};

export interface GeneratedWarmup {
  weight: number;
  reps: number;
  percent: number;
}

/**
 * Generate warm-up sets given working weight + scheme.
 * Each weight is rounded to the smallest viable plate increment for inventory.
 * If the rounded weight ≤ bar, the step is dropped.
 */
export function generateWarmup(
  workingKg: number,
  scheme: WarmupScheme,
  inventory: PlateInventory,
): GeneratedWarmup[] {
  if (!Number.isFinite(workingKg) || workingKg <= inventory.barKg) return [];
  const smallest = smallestPlate(inventory.kg);
  const increment = smallest * 2;
  const min = inventory.barKg;

  return scheme.steps
    .map<GeneratedWarmup>((step) => {
      const raw = workingKg * step.percent;
      const snapped = snapToIncrement(raw, increment, min);
      return { weight: snapped, reps: Math.max(1, Math.round(step.reps)), percent: step.percent };
    })
    .filter((s, idx, arr) => {
      if (s.weight < min + EPS) return false;
      if (s.weight >= workingKg - EPS) return false;
      // dedupe identical weights produced by rounding
      return arr.findIndex((x) => Math.abs(x.weight - s.weight) < EPS) === idx;
    });
}

/**
 * Validate a custom warm-up scheme. Returns first error or null when valid.
 */
export function validateWarmupScheme(scheme: WarmupScheme): string | null {
  if (!scheme.steps.length) return 'Minimal 1 step warm-up';
  if (scheme.steps.length > 8) return 'Maksimal 8 step warm-up';
  for (let i = 0; i < scheme.steps.length; i++) {
    const s = scheme.steps[i];
    if (!s) continue;
    if (s.percent <= 0 || s.percent >= 1) {
      return `Step ${i + 1}: percent harus 1-99%`;
    }
    if (s.reps < 1 || s.reps > 30) {
      return `Step ${i + 1}: reps harus 1-30`;
    }
  }
  return null;
}

function smallestPlate(kgList: number[]): number {
  const positives = kgList.filter((p) => p > 0);
  if (!positives.length) return 1.25;
  return Math.min(...positives);
}

function snapToIncrement(value: number, increment: number, min: number): number {
  if (increment <= 0) return Math.max(min, round01(value));
  const stepped = Math.round((value - min) / increment) * increment + min;
  return round01(Math.max(min, stepped));
}

function round01(n: number): number {
  return Math.round(n * 100) / 100;
}

/**
 * Pretty-format a plate selection as one-line string ("25+15 per sisi").
 */
export function formatPerSide(perSide: PlateGroup[]): string {
  if (!perSide.length) return 'Bar doang';
  const parts = perSide.flatMap((g) =>
    Array.from({ length: g.count }, () => stripTrailingZero(g.kg)),
  );
  return parts.join(' + ');
}

function stripTrailingZero(n: number): string {
  if (Number.isInteger(n)) return String(n);
  return n.toFixed(2).replace(/0+$/, '').replace(/\.$/, '');
}

/** Convenience: shorthand string per side (used in chips / hints). */
export function plateHint(target: number, inventory: PlateInventory): string {
  const sel = computePlates(target, inventory);
  if (!sel.perSide.length) return `${stripTrailingZero(inventory.barKg)} kg (bar)`;
  return `${formatPerSide(sel.perSide)} per sisi`;
}
