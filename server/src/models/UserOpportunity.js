import mongoose from 'mongoose';

const userOpportunitySchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    opportunityId: {
      type: String,
      required: true,
      index: true,
    },
    itemType: {
      type: String,
      enum: ['Opportunity', 'Event', 'OpenSourceProgram'],
      default: 'Opportunity',
    },
    applicationStatus: {
      type: String,
      enum: ['Saved', 'Preparing', 'Applied', 'Interviewing', 'Completed', 'Rejected'],
      default: 'Saved',
      index: true,
    },
    saved: {
      type: Boolean,
      default: true,
    },
    title: String,
    company: String,
    category: String,
    location: String,
    deadline: Date,
    applicationUrl: String,
    notes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to guarantee uniqueness per user and item
userOpportunitySchema.index({ userId: 1, opportunityId: 1 }, { unique: true });

export const UserOpportunity = mongoose.model('UserOpportunity', userOpportunitySchema);
