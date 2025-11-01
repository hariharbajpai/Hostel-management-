import mongoose from 'mongoose';

const complaintSchema = new mongoose.Schema(
  {
    complainant: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User', 
      required: true 
    },
    title: { 
      type: String, 
      required: true, 
      trim: true,
      maxlength: 200 
    },
    description: { 
      type: String, 
      required: true, 
      trim: true,
      maxlength: 2000 
    },
    category: { 
      type: String, 
      enum: [
        'maintenance', 
        'cleanliness', 
        'food', 
        'security', 
        'noise', 
        'facilities', 
        'staff_behavior', 
        'other'
      ], 
      required: true 
    },
    priority: { 
      type: String, 
      enum: ['low', 'medium', 'high', 'urgent'], 
      default: 'medium' 
    },
    status: { 
      type: String, 
      enum: ['open', 'in_progress', 'resolved', 'closed'], 
      default: 'open' 
    },
    assignedTo: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User' 
    },
    room: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Room' 
    },
    hostelNumber: { 
      type: Number, 
      min: 1, 
      max: 8 
    },
    hostelName: { 
      type: String 
    },
    attachments: [{
      filename: String,
      url: String,
      uploadedAt: { type: Date, default: Date.now }
    }],
    adminNotes: { 
      type: String, 
      trim: true,
      maxlength: 1000 
    },
    resolution: { 
      type: String, 
      trim: true,
      maxlength: 1000 
    },
    resolvedAt: { 
      type: Date 
    },
    resolvedBy: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User' 
    },
    isAnonymous: { 
      type: Boolean, 
      default: false 
    },
    upvotes: [{ 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User' 
    }],
    comments: [{
      author: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
      },
      content: { 
        type: String, 
        required: true, 
        trim: true,
        maxlength: 500 
      },
      isAdminComment: { 
        type: Boolean, 
        default: false 
      },
      createdAt: { 
        type: Date, 
        default: Date.now 
      }
    }]
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual for upvote count
complaintSchema.virtual('upvoteCount').get(function() {
  return this.upvotes ? this.upvotes.length : 0;
});

// Virtual for comment count
complaintSchema.virtual('commentCount').get(function() {
  return this.comments ? this.comments.length : 0;
});

// Index for efficient queries
complaintSchema.index({ complainant: 1, status: 1 });
complaintSchema.index({ status: 1, priority: 1 });
complaintSchema.index({ category: 1, status: 1 });
complaintSchema.index({ assignedTo: 1, status: 1 });
complaintSchema.index({ createdAt: -1 });

// Pre-save middleware to set resolved timestamp
complaintSchema.pre('save', function(next) {
  if (this.isModified('status') && this.status === 'resolved' && !this.resolvedAt) {
    this.resolvedAt = new Date();
  }
  next();
});

export default mongoose.model('Complaint', complaintSchema);