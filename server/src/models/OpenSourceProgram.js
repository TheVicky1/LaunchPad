import mongoose from 'mongoose';

const openSourceProgramSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    organization: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    description: {
      type: String,
      required: true,
    },
    officialUrl: {
      type: String,
      required: true,
    },
    repositoryUrl: {
      type: String,
    },
    contributionGuideUrl: {
      type: String,
    },
    technologies: {
      type: [String],
      default: [],
      index: true,
    },
    eligibility: {
      type: String,
      default: 'Open to all students and beginners worldwide',
    },
    difficulty: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced'],
      default: 'Beginner',
      index: true,
    },
    applicationDeadline: {
      type: Date,
      index: true,
    },
    programStatus: {
      type: String,
      enum: ['Open', 'Upcoming', 'Closed'],
      default: 'Open',
      index: true,
    },
    lastVerifiedAt: {
      type: Date,
      default: Date.now,
    },
    isBeginnerFriendly: {
      type: Boolean,
      default: true,
      index: true,
    },
    isDemoData: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export const OpenSourceProgram = mongoose.model('OpenSourceProgram', openSourceProgramSchema);
