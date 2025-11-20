import mongoose from 'mongoose';

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
          // Allow any number or string since admins can add any hostel
          return arr.every(v => typeof v === 'number' || typeof v === 'string');
        },
        message: 'preferredHostels must contain numbers or hostel names'
      }
    },
    preferredBlock: { type: String, enum: ['normal', 'premium'] },
    traits: { type: [String], default: [] }, // Student hobbies/personality
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