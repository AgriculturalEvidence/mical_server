import * as mongoose from 'mongoose';

const Schema = mongoose.Schema;

enum EffectSizeScale {
  LOG,
  DIVISION
}

// Document interface
interface IStudyDocument extends mongoose.Document {
  id: string;
  name: string;
  type: string;
  effectScale: EffectSizeScale;
  people: string;
  link: string;
}

// Model interface
interface IStudyModel extends mongoose.Model<IStudyDocument> {
  findByType(type: string): Promise<Array<IStudyDocument>>;
}

const StudySchema = new Schema({
  id: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  effectScale: {
    type: Number,
    required: true,
  },
  people: {
    type: String,
  },
  link: {
    type: String,
  },
});

// Statics
StudySchema.statics = {
  /**
   * Get
   * @param {string} type - The type of studies we want to explore
   * @returns {Promise<Array<IStudyDocument>>} Returns a Promise of the datapoints.
   */
  // todo vpineda figure out which type of queries we want to compute
  findByType: function (type: string): Promise<Array<IStudyDocument>> {
    let q = this.find({ type: type });

    return q.exec()
      .then((studies: Array<IStudyModel>) => {
        if (studies && studies.length) {
          return studies;
        }
        return Promise.reject('It seems like the study type that you are ' +
          'looking for doesn\'t exits');
      });
  }
};

const Study: IStudyModel = <IStudyModel>mongoose.model('Study', StudySchema);

export { Study, IStudyDocument, EffectSizeScale };

