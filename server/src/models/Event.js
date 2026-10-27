import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    organizer: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    description: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    venue: {
      type: String,
      default: 'Online / To be announced',
    },
    mode: {
      type: String,
      enum: ['Online', 'Offline', 'Hybrid'],
      default: 'Offline',
      index: true,
    },
    category: {
      type: String,
      enum: ['Hackathon', 'Conference', 'Workshop', 'Meetup', 'Competition'],
      default: 'Hackathon',
      index: true,
    },
    startDate: {
      type: Date,
      required: true,
      index: true,
    },
    endDate: {
      type: Date,
    },
    registrationDeadline: {
      type: Date,
      index: true,
    },
    registrationUrl: {
      type: String,
      required: true,
    },
    sourceUrl: {
      type: String,
    },
    status: {
      type: String,
      enum: ['Upcoming', 'Happening Now', 'Past'],
      default: 'Upcoming',
      index: true,
    },
    tags: {
      type: [String],
      default: [],
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

eventSchema.index({ city: 1, startDate: 1 });
eventSchema.index({ mode: 1, category: 1 });

export const Event = mongoose.model('Event', eventSchema);
