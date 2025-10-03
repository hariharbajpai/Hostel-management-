import mongoose from 'mongoose';

const NAMED_HOSTELS = ['aminity', 'largedinning-2'];

const changeApplicationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    registrationNumber: { type: String, required: true },
    reason: { type: String, required: true },
    type: { type: String, enum: ['bed_type', 'hostel'], required: true },
    // desired fields
    desiredSeater: { type: Number, enum: [1, 2, 3, 4, 6, 8] },
    desiredAC: { type: Boolean },
    desiredHostel: {
      type: mongoose.Schema.Types.Mixed,
      validate: {
        validator: function (v) {
          return (typeof v === 'number' && v >= 1 && v <= 8) || (typeof v === 'string' && NAMED_HOSTELS.includes(v));
        },
        message: 'desiredHostel must be 1-8 or a valid named hostel'
      }
    },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    adminNote: { type: String }
  },
  { timestamps: true }
);

export default mongoose.model('ChangeApplication', changeApplicationSchema);