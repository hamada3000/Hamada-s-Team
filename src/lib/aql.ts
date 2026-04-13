export type InspectionLevel = 'S-1' | 'S-2' | 'S-3' | 'S-4' | 'I' | 'II' | 'III';
export type AQLValue = '0.065' | '0.10' | '0.15' | '0.25' | '0.40' | '0.65' | '1.0' | '1.5' | '2.5' | '4.0' | '6.5' | 'Critical (0)';

export const AQL_VALUES: AQLValue[] = ['Critical (0)', '0.065', '0.10', '0.15', '0.25', '0.40', '0.65', '1.0', '1.5', '2.5', '4.0', '6.5'];
export const INSPECTION_LEVELS: InspectionLevel[] = ['S-1', 'S-2', 'S-3', 'S-4', 'I', 'II', 'III'];

const lotSizeRanges = [
  { min: 2, max: 8, levels: { 'S-1': 'A', 'S-2': 'A', 'S-3': 'A', 'S-4': 'A', 'I': 'A', 'II': 'A', 'III': 'B' } },
  { min: 9, max: 15, levels: { 'S-1': 'A', 'S-2': 'A', 'S-3': 'A', 'S-4': 'A', 'I': 'A', 'II': 'B', 'III': 'C' } },
  { min: 16, max: 25, levels: { 'S-1': 'A', 'S-2': 'A', 'S-3': 'B', 'S-4': 'B', 'I': 'B', 'II': 'C', 'III': 'D' } },
  { min: 26, max: 50, levels: { 'S-1': 'A', 'S-2': 'B', 'S-3': 'B', 'S-4': 'C', 'I': 'C', 'II': 'D', 'III': 'E' } },
  { min: 51, max: 90, levels: { 'S-1': 'B', 'S-2': 'B', 'S-3': 'C', 'S-4': 'C', 'I': 'C', 'II': 'E', 'III': 'F' } },
  { min: 91, max: 150, levels: { 'S-1': 'B', 'S-2': 'B', 'S-3': 'C', 'S-4': 'D', 'I': 'D', 'II': 'F', 'III': 'G' } },
  { min: 151, max: 280, levels: { 'S-1': 'B', 'S-2': 'C', 'S-3': 'D', 'S-4': 'E', 'I': 'E', 'II': 'G', 'III': 'H' } },
  { min: 281, max: 500, levels: { 'S-1': 'B', 'S-2': 'C', 'S-3': 'D', 'S-4': 'E', 'I': 'F', 'II': 'H', 'III': 'J' } },
  { min: 501, max: 1200, levels: { 'S-1': 'C', 'S-2': 'C', 'S-3': 'E', 'S-4': 'F', 'I': 'G', 'II': 'J', 'III': 'K' } },
  { min: 1201, max: 3200, levels: { 'S-1': 'C', 'S-2': 'D', 'S-3': 'E', 'S-4': 'G', 'I': 'H', 'II': 'K', 'III': 'L' } },
  { min: 3201, max: 10000, levels: { 'S-1': 'C', 'S-2': 'D', 'S-3': 'F', 'S-4': 'G', 'I': 'J', 'II': 'L', 'III': 'M' } },
  { min: 10001, max: 35000, levels: { 'S-1': 'C', 'S-2': 'D', 'S-3': 'F', 'S-4': 'H', 'I': 'K', 'II': 'M', 'III': 'N' } },
  { min: 35001, max: 150000, levels: { 'S-1': 'D', 'S-2': 'E', 'S-3': 'G', 'S-4': 'J', 'I': 'L', 'II': 'N', 'III': 'P' } },
  { min: 150001, max: 500000, levels: { 'S-1': 'D', 'S-2': 'E', 'S-3': 'G', 'S-4': 'J', 'I': 'M', 'II': 'P', 'III': 'Q' } },
  { min: 500001, max: Infinity, levels: { 'S-1': 'D', 'S-2': 'E', 'S-3': 'H', 'S-4': 'K', 'I': 'N', 'II': 'Q', 'III': 'R' } },
];

export const sampleSizes: Record<string, number> = {
  'A': 2, 'B': 3, 'C': 5, 'D': 8, 'E': 13, 'F': 20, 'G': 32, 'H': 50, 'J': 80, 'K': 125, 'L': 200, 'M': 315, 'N': 500, 'P': 800, 'Q': 1250, 'R': 2000
};

const codeLetters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 'N', 'P', 'Q', 'R'];

// AQL Table Mapping
// Rows are Code Letters (0 to 15)
// Columns are AQL values (0.065 to 6.5)
// Values: number (Ac value), 'up' (arrow up), 'down' (arrow down)
const aqlColumns = ['0.065', '0.10', '0.15', '0.25', '0.40', '0.65', '1.0', '1.5', '2.5', '4.0', '6.5'];

const aqlMatrix: Record<string, (number | 'up' | 'down')[]> = {
  '0.065': ['down', 'down', 'down', 'down', 'down', 'down', 'down', 'down', 'down', 'down', 0, 'down', 1, 2, 3, 5],
  '0.10':  ['down', 'down', 'down', 'down', 'down', 'down', 'down', 'down', 'down', 0, 'down', 1, 2, 3, 5, 7],
  '0.15':  ['down', 'down', 'down', 'down', 'down', 'down', 'down', 'down', 0, 'down', 1, 2, 3, 5, 7, 10],
  '0.25':  ['down', 'down', 'down', 'down', 'down', 'down', 'down', 0, 'down', 1, 2, 3, 5, 7, 10, 14],
  '0.40':  ['down', 'down', 'down', 'down', 'down', 'down', 0, 'down', 1, 2, 3, 5, 7, 10, 14, 21],
  '0.65':  ['down', 'down', 'down', 'down', 'down', 0, 'down', 1, 2, 3, 5, 7, 10, 14, 21, 'up'],
  '1.0':   ['down', 'down', 'down', 'down', 0, 'down', 1, 2, 3, 5, 7, 10, 14, 21, 'up', 'up'],
  '1.5':   ['down', 'down', 'down', 0, 'down', 1, 2, 3, 5, 7, 10, 14, 21, 'up', 'up', 'up'],
  '2.5':   ['down', 'down', 0, 'down', 1, 2, 3, 5, 7, 10, 14, 21, 'up', 'up', 'up', 'up'],
  '4.0':   ['down', 0, 'down', 1, 2, 3, 5, 7, 10, 14, 21, 'up', 'up', 'up', 'up', 'up'],
  '6.5':   [0, 'down', 1, 2, 3, 5, 7, 10, 14, 21, 'up', 'up', 'up', 'up', 'up', 'up'],
};

export interface InspectionPlan {
  codeLetter: string;
  sampleSize: number;
  ac: number;
  re: number;
  note?: string;
}

export function getCodeLetter(lotSize: number, level: InspectionLevel): string {
  const range = lotSizeRanges.find(r => lotSize >= r.min && lotSize <= r.max);
  return range ? range.levels[level] : 'A';
}

export function getInspectionPlan(codeLetter: string, aql: AQLValue): InspectionPlan {
  const initialIndex = codeLetters.indexOf(codeLetter);
  
  if (aql === 'Critical (0)') {
    return {
      codeLetter,
      sampleSize: sampleSizes[codeLetter],
      ac: 0,
      re: 1,
      note: 'Critical defects usually require Ac=0, Re=1 for the given sample size.'
    };
  }

  const column = aqlMatrix[aql];
  let currentIndex = initialIndex;
  let value = column[currentIndex];
  let note = '';

  if (value === 'down') {
    while (value === 'down' && currentIndex < codeLetters.length - 1) {
      currentIndex++;
      value = column[currentIndex];
    }
    note = 'Use first sampling plan below arrow.';
  } else if (value === 'up') {
    while (value === 'up' && currentIndex > 0) {
      currentIndex--;
      value = column[currentIndex];
    }
    note = 'Use first sampling plan above arrow.';
  }

  const finalCodeLetter = codeLetters[currentIndex];
  const finalSampleSize = sampleSizes[finalCodeLetter];
  const ac = value as number;
  const re = ac + 1;

  return {
    codeLetter: finalCodeLetter,
    sampleSize: finalSampleSize,
    ac,
    re,
    note: note || undefined
  };
}
