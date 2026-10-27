import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    skills: {
      type: [String],
      default: ['JavaScript', 'React', 'Node.js', 'Python'],
    },
    interests: {
      type: [String],
      default: ['Web Development', 'Open Source', 'Hackathons'],
    },
    preferredLocations: {
      type: [String],
      default: ['Bengaluru', 'Remote'],
    },
    educationLevel: {
      type: String,
      default: 'Undergraduate (B.Tech / B.E. / B.Sc)',
    },
    graduationYear: {
      type: Number,
      default: 2027,
    },
    role: {
      type: String,
      enum: ['student', 'admin'],
      default: 'student',
    },
  },
  {
    timestamps: true,
  }
);

export const User = mongoose.model('User', userSchema);
