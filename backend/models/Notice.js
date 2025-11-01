import mongoose from 'mongoose';

const noticeSchema = new mongoose.Schema(
  {
    title: { 
      type: String, 
      required: true, 
      trim: true,
      maxlength: 200 
    },
    content: { 
      type: String, 
      required: true, 
      trim: true,
      maxlength: 5000 
    },
    author: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User', 
      required: true 
    },
    category: { 
      type: String, 
      enum: [
        'general', 
        'maintenance', 
        'events', 
        'rules', 
        'emergency', 
        'food', 
        'facilities', 
        'academic',
        'fees',
        'other'
      ], 
      required: true 
    },
    priority: { 
      type: String, 
      enum: ['low', 'medium', 'high', 'urgent'], 
      default: 'medium' 
    },
    targetAudience: { 
      type: String, 
      enum: ['all', 'students', 'specific_hostel', 'specific_room'], 
      default: 'all' 
    },
    targetHostels: [{ 
      type: Number, 
      min: 1, 
      max: 8 
    }],
    targetHostelNames: [{ 
      type: String 
    }],
    targetRooms: [{ 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Room' 
    }],
    isPublished: { 
      type: Boolean, 
      default: false 
    },
    publishedAt: { 
      type: Date 
    },
    expiresAt: { 
      type: Date 
    },
    isPinned: { 
      type: Boolean, 
      default: false 
    },
    attachments: [{
      filename: String,
      url: String,
      uploadedAt: { type: Date, default: Date.now }
    }],
    readBy: [{ 
      user: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User' 
      },
      readAt: { 
        type: Date, 
        default: Date.now 
      }
    }],
    likes: [{ 
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
      createdAt: { 
        type: Date, 
        default: Date.now 
      }
    }],
    tags: [{ 
      type: String, 
      trim: true,
      lowercase: true 
    }],
    isUrgent: { 
      type: Boolean, 
      default: false 
    },
    notificationSent: { 
      type: Boolean, 
      default: false 
    },
    viewCount: { 
      type: Number, 
      default: 0 
    }
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual for like count
noticeSchema.virtual('likeCount').get(function() {
  return this.likes ? this.likes.length : 0;
});

// Virtual for comment count
noticeSchema.virtual('commentCount').get(function() {
  return this.comments ? this.comments.length : 0;
});

// Virtual for read count
noticeSchema.virtual('readCount').get(function() {
  return this.readBy ? this.readBy.length : 0;
});

// Virtual to check if notice is active
noticeSchema.virtual('isActive').get(function() {
  const now = new Date();
  return this.isPublished && 
         (!this.expiresAt || this.expiresAt > now);
});

// Index for efficient queries
noticeSchema.index({ isPublished: 1, publishedAt: -1 });
noticeSchema.index({ category: 1, isPublished: 1 });
noticeSchema.index({ priority: 1, isPublished: 1 });
noticeSchema.index({ isPinned: 1, publishedAt: -1 });
noticeSchema.index({ targetAudience: 1, isPublished: 1 });
noticeSchema.index({ expiresAt: 1 });
noticeSchema.index({ tags: 1 });

// Pre-save middleware to set published timestamp
noticeSchema.pre('save', function(next) {
  if (this.isModified('isPublished') && this.isPublished && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  
  // Set urgent flag based on priority
  if (this.priority === 'urgent') {
    this.isUrgent = true;
  }
  
  next();
});

// Static method to get active notices for a user
noticeSchema.statics.getActiveNoticesForUser = function(user, hostelNumber = null, room = null) {
  const now = new Date();
  const query = {
    isPublished: true,
    $or: [
      { expiresAt: { $exists: false } },
      { expiresAt: null },
      { expiresAt: { $gt: now } }
    ]
  };

  // Filter by target audience
  const audienceFilter = {
    $or: [
      { targetAudience: 'all' },
      { targetAudience: 'students' }
    ]
  };

  if (hostelNumber) {
    audienceFilter.$or.push(
      { targetAudience: 'specific_hostel', targetHostels: hostelNumber }
    );
  }

  if (room) {
    audienceFilter.$or.push(
      { targetAudience: 'specific_room', targetRooms: room }
    );
  }

  query.$and = [audienceFilter];

  return this.find(query)
    .populate('author', 'name email')
    .sort({ isPinned: -1, publishedAt: -1 });
};

export default mongoose.model('Notice', noticeSchema);