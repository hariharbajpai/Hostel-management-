import mongoose from 'mongoose';

const swapRequestSchema = new mongoose.Schema(
  {
    fromUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    toUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['pending', 'approved', 'rejected', 'cancelled'], default: 'pending' },
    reason: { type: String },
    // Snapshots of bed type for validation
    seater: { type: Number, enum: [1, 2, 3, 4, 6, 8], required: true },
    ac: { type: Boolean, required: true }
  },
  { timestamps: true }
);

export default mongoose.model('SwapRequest', swapRequestSchema);