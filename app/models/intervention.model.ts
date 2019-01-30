import * as mongoose from 'mongoose';

const Schema = mongoose.Schema;

// Document interface
interface IInterventionDocument extends mongoose.Document {
  key: number;
  sKey: string;
  title: string;
  desc: string;
  denom: string;
  numerator: string;
}

// Model interface
interface IInterventionModel extends mongoose.Model<IInterventionDocument> {
  findByKey(key: number): Promise<IInterventionDocument>;
  findByStringKey(sKey: string): Promise<IInterventionDocument>;
}

const InterventionSchema = new Schema({
  key: {
    type: Number,
    required: true,
    unique: true,
    index: true,
  },
  sKey: {
    type: String,
    required: true,
    unique: true,
  },
  title: {
    type: String,
    default: "",
    required: true,
  },
  desc: {
    type: String,
    default: "",
  },
  denom: {
    type: String,
    default: "",
  },
  numerator: {
    type: String,
    default: "",
  },
}, {
});
InterventionSchema.index({ key: 1}, {unique: true});

// Statics
InterventionSchema.statics = {
  /**
  * Get a specific intervention with by its key
  * */
  // todo vpineda figure out which type of queries we want to compute
  findByKey(key: number): Promise<IInterventionDocument> {
    let q = this.findOne({
      key: key
    });
    return q.exec()
      .then((intervention: IInterventionModel) => {
        if (intervention) {
          return intervention;
        }
        return Promise.reject('It seems like the intervention doesn\'t exist or there is no data');
      });
  },

  findByStringKey(sKey: string): Promise<IInterventionDocument> {
    let q = this.findOne({
      sKey: sKey
    });

    return q.exec()
      .then((intervention: IInterventionModel) => {
        if (intervention) {
          return intervention;
        }
        return Promise.reject('It seems like the intervention doesn\'t exist or there is no data');
      });
  }
};

const Intervention: IInterventionModel =
  <IInterventionModel>mongoose.model('Intervention', InterventionSchema);

export { Intervention, IInterventionDocument };
