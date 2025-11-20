import mongoose from 'mongoose';

// Block type mapping: 1,6 => normal; 2,3,4,5,7,8 => premium
export function deriveBlockType(hostelNumber) {
  const premium = [2, 3, 4, 5, 7, 8];
  return premium.includes(Number(hostelNumber)) ? 'premium' : 'normal';
}

const roomSchema = new mongoose.Schema(
  {
    hostelNumber: { type: Number },
    hostelName: { type: String }, // Dynamic name allowed
    blockType: { type: String, enum: ['normal', 'premium'], required: true },
    seater: { type: Number, enum: [1, 2, 3, 4, 6, 8], required: true },
    ac: { type: Boolean, required: true },
    amenities: {
      largeDining: { type: Boolean, default: false },
      extraFacilities: { type: Boolean, default: false }
    },
    occupants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    capacity: { type: Number, required: true },
    roomLabel: { type: String } // optional identifier like "H2-302"
  },
  { timestamps: true }
);

roomSchema.pre('validate', function (next) {
  if (this.hostelNumber != null && !this.blockType) {
    this.blockType = deriveBlockType(this.hostelNumber);
  }
  if (!this.capacity && this.seater) {
    this.capacity = this.seater;
  }
  next();
});

export default mongoose.model('Room', roomSchema);