import mongoose from 'mongoose';

const opportunitySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    company: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    category: {
      type: String,
      enum: ['Internship', 'Full-time', 'Part-time', 'Contract'],
      default: 'Internship',
      index: true,
    },
    description: {
      type: String,
      required: true,
    },
    skills: {
      type: [String],
      default: [],
      index: true,
    },
    location: {
      type: String,
      default: 'Bengaluru',
      index: true,
    },
    mode: {
      type: String,
      enum: ['Remote', 'Hybrid', 'On-site'],
      default: 'Remote',
      index: true,
    },
    deadline: {
      type: Date,
      index: true,
    },
    applicationUrl: {
      type: String,
      required: true,
    },
    sourceName: {
      type: String,
      default: 'Direct Career Page',
    },
    sourceUrl: {
      type: String,
    },
    sourceExternalId: {
      type: String,
    },
    status: {
      type: String,
      enum: ['Open', 'Closing Soon', 'Expired'],
      default: 'Open',
      index: true,
    },
    lastVerifiedAt: {
      type: Date,
      default: Date.now,
    },
    isDemoData: {
      type: Boolean,
      default: false,
    },
    companyLogo: {
      type: String,
    },
    stipend: {
      type: String,
    },
    experienceLevel: {
      type: String,
      enum: ['Entry Level', 'Intermediate', 'All Levels'],
      default: 'Entry Level',
    },
  },
  {
    timestamps: true,
  }
);

// Helpful compound indexes
opportunitySchema.index({ status: 1, deadline: 1 });
opportunitySchema.index({ category: 1, location: 1, mode: 1 });

export const Opportunity = mongoose.model('Opportunity', opportunitySchema);
