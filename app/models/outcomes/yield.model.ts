import * as mongoose from 'mongoose';
import {
  DefaultSchemaJSON,
  DefaultStatistics,
  GeoPoint,
  IOutcomeTableDocument,
  IOutcomeTableModel,
  IOutcomeTableRow
} from '../../util/typedef.util';

const Schema = mongoose.Schema;

// Row interface, values of each row without being a full-fledged document,
interface IYieldRow extends IOutcomeTableRow {
  coords: GeoPoint;
  effectSize: number;
  sampleSize: number;
  importID: string;
  interventionType: number;
  filterCols: {[key: string]: string};
}

// Document interface
interface IYieldDocument extends mongoose.Document, IOutcomeTableDocument, IYieldRow {}

// Model interface
interface IYieldModel extends mongoose.Model<IYieldDocument>, IOutcomeTableModel<IYieldDocument> {}

const TableName = 'Yield';
const SchemaJSON = {
  ... DefaultSchemaJSON,
  filterCols: {
    type: Object,
    required: true,
    default: {
      climate: 'Unknown',
      duration: 'Unknown',
    },
  },
  infoCols: {
    type: Object,
    required: true,
    default: {
      author: 'Unknown'
    },
  }
};

const YieldSchema = new Schema(SchemaJSON);

YieldSchema.index({ location: '2dsphere' });
YieldSchema.statics = Object.assign({}, DefaultStatistics);

const Yield: IYieldModel = <IYieldModel>mongoose.model(TableName, YieldSchema);
function getModel(): IOutcomeTableModel<IYieldDocument> {
  return Yield;
}
export { getModel, Yield, IYieldDocument, IYieldRow, TableName, SchemaJSON };

