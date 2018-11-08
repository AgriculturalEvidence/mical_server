import * as mongoose from 'mongoose';
import { GeoPoint } from './geopoint.model';

const Schema = mongoose.Schema;

// Document interface
interface IYieldDocument extends mongoose.Document {
  coords: GeoPoint;
  effectSize: number;
  sampleSize: number;
  studyID: string;
}

// Model interface
interface IYieldModel extends mongoose.Model<IYieldDocument> {
  findByUsername(username: string): any;
}

const YieldSchema = new Schema({
  coords: {
    type: {
      type: String,
      enum: ['Point'],
      required: true,
    },
    coordinates: {
      type: [Number],
      required: true,
    },
  },
  effectSize: {
    type: Number,
    required: true,
    unique: true,
  },
  sampleSize: {
    type: Number,
    default: 1
  },
  studyID: {
    type: String,
    default: '-1',
  },
});

// Statics
YieldSchema.statics = {
  /**
  * Get
  * @param {string} username - The GitHub username of the student.
  * @returns {Promise<any>} Returns a Promise of the student.
  */
  // todo vpineda figure out which type of queries we want to compute
  findByUsername: function (username: string): Promise<IYieldDocument> {
    return this
      .find({ username: username })
      .exec()
      .then((student: Array<IYieldModel>) => {
        if (student && student.length) {
          return student[0];
        }
        return Promise.reject('errrrr');
      });
  }
};

const Yield: IYieldModel = <IYieldModel>mongoose.model('Yield', YieldSchema);

export { Yield, IYieldDocument };
