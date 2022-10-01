import mongoose from 'mongoose';
import slug from 'mongoose-slug-generator';

mongoose.plugin(slug);

const userSchema = new mongoose.Schema(
  {
    // IDENTITY DATA ( does'nt change)
    slug: { type: String, slug: 'name', unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    profilePic: { type: String },
    marvelId: { type: String },
    id: { type: String, required: true, unique: true },

    // META DATA ( changes. auto )
    currentRole: {
      type: String,
      enum: { values: ['STU', 'INS', 'NA'] },
      default: 'NA',
    },
    currentStuCourse: { type: String, default: 'NA' },
    currentInsCourse: { type: [String], default: [] },
    currentLevel: { type: Number },
    roleHistory: [
      {
        role: { type: String, enum: { values: ['STU', 'INS', 'NA'] } },
        startTime: { type: Date },
        stuCourse: { type: String },
        insCourse: { type: [String] },
      },
    ], //role history should always be appended at the time of assigning roles
    rights: {
      type: String,
      enum: { values: ['MOD', 'USER'] },
      default: 'USER',
    },
    enrollmentStatus: {
      type: String,
      enum: { values: ['ACTIVE', 'INACTIVE', 'UNKNOWN', 'BANNED'] },
      default: 'UNKNOWN',
    },

    // DIRECTLY EDITABLE
    bio: { type: String, maxLength: 200 },
    gitHub: { type: String, maxLength: 80 },
    linkedIn: { type: String, maxLength: 80 },
    website: { type: String, maxLength: 80 },

    // META DATA IF BANNED
    bannedAt: { type: String },
    bannedByName: { type: String },
    bannedById: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model('users', userSchema);