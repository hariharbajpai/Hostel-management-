import mongoose from 'mongoose';

const NAMED_HOSTELS = ['aminity', 'largedinning-2'];

const studentProfileSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', unique: true, required: true },
    foodPreference: { type: String, enum: ['vegetarian', 'non_vegetarian', 'jain'], required: true },
    preferredSeater: { type: Number, enum: [1, 2, 3, 4, 6, 8], required: true },
    preferredAC: { type: Boolean, required: true },
    preferredHostels: {
      type: [mongoose.Schema.Types.Mixed],
      validate: {
        validator: function (arr) {
          if (!Array.isArray(arr)) return true;
          return arr.every(v => (typeof v === 'number' && v >= 1 && v <= 8) || (typeof v === 'string' && NAMED_HOSTELS.includes(v)));
        },
        message: 'preferredHostels must contain numbers 1-8 or named hostels'
      }
    },
    preferredBlock: { type: String, enum: ['normal', 'premium'] },
    amenities: {
      largeDining: { type: Boolean, default: false },
      extraFacilities: { type: Boolean, default: false }
    },
    assignedRoom: { type: mongoose.Schema.Types.ObjectId, ref: 'Room' },
    status: { type: String, enum: ['pending', 'assigned', 'swap_pending'], default: 'pending' }
  },
  { timestamps: true }
);

export default mongoose.model('StudentProfile', studentProfileSchema);