import Dexie, { type Table } from 'dexie';

export interface InspectionRecord {
  id?: number;
  date: string;
  lotSize: number;
  inspectionLevel: string;
  criticalAql: string;
  majorAql: string;
  minorAql: string;
  criticalPlan: { sampleSize: number; ac: number; re: number };
  majorPlan: { sampleSize: number; ac: number; re: number };
  minorPlan: { sampleSize: number; ac: number; re: number };
}

export class AQLDatabase extends Dexie {
  inspections!: Table<InspectionRecord, number>;

  constructor() {
    super('AQLDatabase');
    this.version(1).stores({
      inspections: '++id, date, lotSize'
    });
  }
}

export const db = new AQLDatabase();
