import * as mongoose from 'mongoose';

export interface IOutcomeTableDocument extends mongoose.Document {
  interventionType: string;
}

export interface IOutcomeTableModel<T> {
  findByCoords(areaPoints: Array<number[]>, filters?: Object): Promise<Array<IOutcomeTableDocument>>
  findByInterventionType(interventionKey: number): Promise<T[]>;
  getAllInterventionTypes(): Promise<number[]>;
}
