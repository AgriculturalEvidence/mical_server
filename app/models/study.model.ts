import * as mongoose from 'mongoose';

const studySchema = new mongoose.Schema({
  studyID: {
    type: Number,
    required: true,
  },
  url: {
    type: String,
    required: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Methods
studySchema.method({
});

// Statics
studySchema.static({
});

const Team = mongoose.model('Team', studySchema);

export { Team };
