import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    googleId: { type: String, index: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    name: { type: String },
    role: { type: String, enum: ['admin', 'student'], required: true },
    avatar: { type: String },
    phone: { type: String }, // Phone number for admin users

    // Optional email/password flow support
    passwordHash: { type: String }
  },
  { timestamps: true }
);

export default mongoose.model('User', userSchema);
