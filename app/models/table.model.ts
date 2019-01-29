import * as mongoose from 'mongoose';

export interface IOutcomeTableDocument extends mongoose.Document {
  interventionType: string;
}

export interface IOutcomeTableModel<T> {
  findByInterventionType(interventionKey: number): Promise<T[]>;
  getAllInterventionTypes(): Promise<number[]>;
}
