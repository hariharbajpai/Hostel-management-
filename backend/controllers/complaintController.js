import Complaint from '../models/Complaint.js';
import User from '../models/User.js';
import Room from '../models/Room.js';
import StudentProfile from '../models/StudentProfile.js';

// -------- Student: Create a new complaint --------
export async function createComplaint(req, res) {
  try {
    const userId = req.user.id;
    const { 
      title, 
      description, 
      category, 
      priority, 
      isAnonymous, 
      hostelNumber, 
      hostelName 
    } = req.body;

    // Get user's room information if available
    let room = null;
    let userHostelNumber = hostelNumber;
    let userHostelName = hostelName;

    if (!isAnonymous) {
      const studentProfile = await StudentProfile.findOne({ user: userId }).populate('assignedRoom');
      if (studentProfile && studentProfile.assignedRoom) {
        room = studentProfile.assignedRoom._id;
        userHostelNumber = studentProfile.assignedRoom.hostelNumber;
        userHostelName = studentProfile.assignedRoom.hostelName;
      }
    }

    const complaint = new Complaint({
      complainant: userId,
      title,
      description,
      category,
      priority: priority || 'medium',
      isAnonymous,
      room,
      hostelNumber: userHostelNumber,
      hostelName: userHostelName
    });

    await complaint.save();
    await complaint.populate('complainant', 'name email');

    res.status(201).json({
      message: 'Complaint created successfully',
      complaint
    });
  } catch (error) {
    console.error('Create complaint error:', error);
    res.status(500).json({ error: 'Failed to create complaint' });
  }
}

// -------- Get complaints (with filtering) --------
export async function getComplaints(req, res) {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    const { 
      status, 
      category, 
      priority, 
      page = 1, 
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const query = {};
    
    // Students can only see their own complaints
    if (userRole === 'student') {
      query.complainant = userId;
    }

    // Apply filters
    if (status) query.status = status;
    if (category) query.category = category;
    if (priority) query.priority = priority;

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const complaints = await Complaint.find(query)
      .populate('complainant', 'name email')
      .populate('assignedTo', 'name email')
      .populate('resolvedBy', 'name email')
      .populate('room', 'roomLabel hostelNumber hostelName')
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Complaint.countDocuments(query);

    res.json({
      complaints,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        total
      }
    });
  } catch (error) {
    console.error('Get complaints error:', error);
    res.status(500).json({ error: 'Failed to fetch complaints' });
  }
}

// -------- Get single complaint --------
export async function getComplaint(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    const complaint = await Complaint.findById(id)
      .populate('complainant', 'name email')
      .populate('assignedTo', 'name email')
      .populate('resolvedBy', 'name email')
      .populate('room', 'roomLabel hostelNumber hostelName')
      .populate('comments.author', 'name email');

    if (!complaint) {
      return res.status(404).json({ error: 'Complaint not found' });
    }

    // Students can only view their own complaints
    if (userRole === 'student' && complaint.complainant._id.toString() !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({ complaint });
  } catch (error) {
    console.error('Get complaint error:', error);
    res.status(500).json({ error: 'Failed to fetch complaint' });
  }
}

// -------- Admin: Update complaint status --------
export async function updateComplaintStatus(req, res) {
  try {
    const { id } = req.params;
    const { status, assignedTo, adminNotes, resolution } = req.body;
    const userId = req.user.id;

    const complaint = await Complaint.findById(id);
    if (!complaint) {
      return res.status(404).json({ error: 'Complaint not found' });
    }

    // Update fields
    if (status) complaint.status = status;
    if (assignedTo) complaint.assignedTo = assignedTo;
    if (adminNotes) complaint.adminNotes = adminNotes;
    if (resolution) complaint.resolution = resolution;

    // Set resolved fields if status is resolved
    if (status === 'resolved') {
      complaint.resolvedAt = new Date();
      complaint.resolvedBy = userId;
    }

    await complaint.save();
    await complaint.populate('complainant', 'name email');
    await complaint.populate('assignedTo', 'name email');
    await complaint.populate('resolvedBy', 'name email');

    res.json({
      message: 'Complaint updated successfully',
      complaint
    });
  } catch (error) {
    console.error('Update complaint status error:', error);
    res.status(500).json({ error: 'Failed to update complaint' });
  }
}

// -------- Add comment to complaint --------
export async function addComment(req, res) {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;

    const complaint = await Complaint.findById(id);
    if (!complaint) {
      return res.status(404).json({ error: 'Complaint not found' });
    }

    // Students can only comment on their own complaints
    if (userRole === 'student' && complaint.complainant.toString() !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const comment = {
      author: userId,
      content,
      isAdminComment: userRole === 'admin'
    };

    complaint.comments.push(comment);
    await complaint.save();

    await complaint.populate('comments.author', 'name email');

    res.json({
      message: 'Comment added successfully',
      comment: complaint.comments[complaint.comments.length - 1]
    });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ error: 'Failed to add comment' });
  }
}

// -------- Upvote complaint --------
export async function upvoteComplaint(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const complaint = await Complaint.findById(id);
    if (!complaint) {
      return res.status(404).json({ error: 'Complaint not found' });
    }

    const hasUpvoted = complaint.upvotes.includes(userId);
    
    if (hasUpvoted) {
      // Remove upvote
      complaint.upvotes = complaint.upvotes.filter(
        upvoteId => upvoteId.toString() !== userId
      );
    } else {
      // Add upvote
      complaint.upvotes.push(userId);
    }

    await complaint.save();

    res.json({
      message: hasUpvoted ? 'Upvote removed' : 'Complaint upvoted',
      upvoteCount: complaint.upvotes.length,
      hasUpvoted: !hasUpvoted
    });
  } catch (error) {
    console.error('Upvote complaint error:', error);
    res.status(500).json({ error: 'Failed to update upvote' });
  }
}

// -------- Admin: Get complaint statistics --------
export async function getComplaintStats(req, res) {
  try {
    const stats = await Complaint.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          open: { $sum: { $cond: [{ $eq: ['$status', 'open'] }, 1, 0] } },
          inProgress: { $sum: { $cond: [{ $eq: ['$status', 'in_progress'] }, 1, 0] } },
          resolved: { $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] } },
          closed: { $sum: { $cond: [{ $eq: ['$status', 'closed'] }, 1, 0] } }
        }
      }
    ]);

    const categoryStats = await Complaint.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    const priorityStats = await Complaint.aggregate([
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      overview: stats[0] || { total: 0, open: 0, inProgress: 0, resolved: 0, closed: 0 },
      byCategory: categoryStats,
      byPriority: priorityStats
    });
  } catch (error) {
    console.error('Get complaint stats error:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
}

// -------- Delete complaint (Admin only) --------
export async function deleteComplaint(req, res) {
  try {
    const { id } = req.params;

    const complaint = await Complaint.findByIdAndDelete(id);
    if (!complaint) {
      return res.status(404).json({ error: 'Complaint not found' });
    }

    res.json({ message: 'Complaint deleted successfully' });
  } catch (error) {
    console.error('Delete complaint error:', error);
    res.status(500).json({ error: 'Failed to delete complaint' });
  }
}