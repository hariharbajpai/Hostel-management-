import Notice from '../models/Notice.js';
import User from '../models/User.js';
import Room from '../models/Room.js';
import StudentProfile from '../models/StudentProfile.js';

// -------- Admin: Create a new notice --------
export async function createNotice(req, res) {
  try {
    const userId = req.user.id;
    const { 
      title, 
      content, 
      category, 
      priority, 
      targetAudience,
      targetHostels,
      targetHostelNames,
      targetRooms,
      expiresAt,
      isPinned,
      tags,
      isPublished = false
    } = req.body;

    const notice = new Notice({
      title,
      content,
      author: userId,
      category,
      priority: priority || 'medium',
      targetAudience: targetAudience || 'all',
      targetHostels,
      targetHostelNames,
      targetRooms,
      expiresAt,
      isPinned: isPinned || false,
      tags,
      isPublished
    });

    await notice.save();
    await notice.populate('author', 'name email');

    res.status(201).json({
      message: 'Notice created successfully',
      notice
    });
  } catch (error) {
    console.error('Create notice error:', error);
    res.status(500).json({ error: 'Failed to create notice' });
  }
}

// -------- Get notices (public view for students) --------
export async function getNotices(req, res) {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    const { 
      category, 
      priority, 
      page = 1, 
      limit = 10,
      sortBy = 'publishedAt',
      sortOrder = 'desc',
      includeExpired = false
    } = req.query;

    let query = {};
    
    if (userRole === 'student') {
      // Students only see published notices
      query.isPublished = true;
      
      if (!includeExpired) {
        const now = new Date();
        query.$or = [
          { expiresAt: { $exists: false } },
          { expiresAt: null },
          { expiresAt: { $gt: now } }
        ];
      }

      // Get user's hostel and room info for targeted notices
      const studentProfile = await StudentProfile.findOne({ user: userId }).populate('assignedRoom');
      let userHostelNumber = null;
      let userRoom = null;

      if (studentProfile && studentProfile.assignedRoom) {
        userHostelNumber = studentProfile.assignedRoom.hostelNumber;
        userRoom = studentProfile.assignedRoom._id;
      }

      // Filter by target audience
      const audienceFilter = {
        $or: [
          { targetAudience: 'all' },
          { targetAudience: 'students' }
        ]
      };

      if (userHostelNumber) {
        audienceFilter.$or.push(
          { targetAudience: 'specific_hostel', targetHostels: userHostelNumber }
        );
      }

      if (userRoom) {
        audienceFilter.$or.push(
          { targetAudience: 'specific_room', targetRooms: userRoom }
        );
      }

      query.$and = query.$and ? [...query.$and, audienceFilter] : [audienceFilter];
    }

    // Apply filters
    if (category) query.category = category;
    if (priority) query.priority = priority;

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Ensure pinned notices come first
    const finalSort = { isPinned: -1, ...sortOptions };

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const notices = await Notice.find(query)
      .populate('author', 'name email')
      .populate('targetRooms', 'roomLabel hostelNumber hostelName')
      .sort(finalSort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Notice.countDocuments(query);

    res.json({
      notices,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        total
      }
    });
  } catch (error) {
    console.error('Get notices error:', error);
    res.status(500).json({ error: 'Failed to fetch notices' });
  }
}

// -------- Admin: Get all notices (including unpublished) --------
export async function getAllNotices(req, res) {
  try {
    const { 
      category, 
      priority, 
      isPublished,
      page = 1, 
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const query = {};
    
    // Apply filters
    if (category) query.category = category;
    if (priority) query.priority = priority;
    if (isPublished !== undefined) query.isPublished = isPublished === 'true';

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const notices = await Notice.find(query)
      .populate('author', 'name email')
      .populate('targetRooms', 'roomLabel hostelNumber hostelName')
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Notice.countDocuments(query);

    res.json({
      notices,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        total
      }
    });
  } catch (error) {
    console.error('Get all notices error:', error);
    res.status(500).json({ error: 'Failed to fetch notices' });
  }
}

// -------- Get single notice --------
export async function getNotice(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    const notice = await Notice.findById(id)
      .populate('author', 'name email')
      .populate('targetRooms', 'roomLabel hostelNumber hostelName')
      .populate('comments.author', 'name email');

    if (!notice) {
      return res.status(404).json({ error: 'Notice not found' });
    }

    // Students can only view published notices
    if (userRole === 'student' && !notice.isPublished) {
      return res.status(404).json({ error: 'Notice not found' });
    }

    // Increment view count
    notice.viewCount += 1;
    await notice.save();

    // Mark as read for the user
    const hasRead = notice.readBy.some(read => read.user.toString() === userId);
    if (!hasRead) {
      notice.readBy.push({ user: userId });
      await notice.save();
    }

    res.json({ notice });
  } catch (error) {
    console.error('Get notice error:', error);
    res.status(500).json({ error: 'Failed to fetch notice' });
  }
}

// -------- Admin: Update notice --------
export async function updateNotice(req, res) {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const notice = await Notice.findById(id);
    if (!notice) {
      return res.status(404).json({ error: 'Notice not found' });
    }

    // Update fields
    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined) {
        notice[key] = updateData[key];
      }
    });

    await notice.save();
    await notice.populate('author', 'name email');
    await notice.populate('targetRooms', 'roomLabel hostelNumber hostelName');

    res.json({
      message: 'Notice updated successfully',
      notice
    });
  } catch (error) {
    console.error('Update notice error:', error);
    res.status(500).json({ error: 'Failed to update notice' });
  }
}

// -------- Admin: Publish/Unpublish notice --------
export async function togglePublishNotice(req, res) {
  try {
    const { id } = req.params;

    const notice = await Notice.findById(id);
    if (!notice) {
      return res.status(404).json({ error: 'Notice not found' });
    }

    notice.isPublished = !notice.isPublished;
    
    if (notice.isPublished && !notice.publishedAt) {
      notice.publishedAt = new Date();
    }

    await notice.save();

    res.json({
      message: `Notice ${notice.isPublished ? 'published' : 'unpublished'} successfully`,
      notice
    });
  } catch (error) {
    console.error('Toggle publish notice error:', error);
    res.status(500).json({ error: 'Failed to update notice' });
  }
}

// -------- Add comment to notice --------
export async function addComment(req, res) {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const userId = req.user.id;

    const notice = await Notice.findById(id);
    if (!notice) {
      return res.status(404).json({ error: 'Notice not found' });
    }

    // Students can only comment on published notices
    if (req.user.role === 'student' && !notice.isPublished) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const comment = {
      author: userId,
      content
    };

    notice.comments.push(comment);
    await notice.save();

    await notice.populate('comments.author', 'name email');

    res.json({
      message: 'Comment added successfully',
      comment: notice.comments[notice.comments.length - 1]
    });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ error: 'Failed to add comment' });
  }
}

// -------- Like notice --------
export async function likeNotice(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const notice = await Notice.findById(id);
    if (!notice) {
      return res.status(404).json({ error: 'Notice not found' });
    }

    const hasLiked = notice.likes.includes(userId);
    
    if (hasLiked) {
      // Remove like
      notice.likes = notice.likes.filter(
        likeId => likeId.toString() !== userId
      );
    } else {
      // Add like
      notice.likes.push(userId);
    }

    await notice.save();

    res.json({
      message: hasLiked ? 'Like removed' : 'Notice liked',
      likeCount: notice.likes.length,
      hasLiked: !hasLiked
    });
  } catch (error) {
    console.error('Like notice error:', error);
    res.status(500).json({ error: 'Failed to update like' });
  }
}

// -------- Admin: Get notice statistics --------
export async function getNoticeStats(req, res) {
  try {
    const stats = await Notice.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          published: { $sum: { $cond: ['$isPublished', 1, 0] } },
          draft: { $sum: { $cond: ['$isPublished', 0, 1] } },
          pinned: { $sum: { $cond: ['$isPinned', 1, 0] } },
          totalViews: { $sum: '$viewCount' }
        }
      }
    ]);

    const categoryStats = await Notice.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    const priorityStats = await Notice.aggregate([
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      overview: stats[0] || { total: 0, published: 0, draft: 0, pinned: 0, totalViews: 0 },
      byCategory: categoryStats,
      byPriority: priorityStats
    });
  } catch (error) {
    console.error('Get notice stats error:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
}

// -------- Admin: Delete notice --------
export async function deleteNotice(req, res) {
  try {
    const { id } = req.params;

    const notice = await Notice.findByIdAndDelete(id);
    if (!notice) {
      return res.status(404).json({ error: 'Notice not found' });
    }

    res.json({ message: 'Notice deleted successfully' });
  } catch (error) {
    console.error('Delete notice error:', error);
    res.status(500).json({ error: 'Failed to delete notice' });
  }
}