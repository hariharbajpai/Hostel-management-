import Room, { deriveBlockType } from '../models/Room.js';
import StudentProfile from '../models/StudentProfile.js';
import SwapRequest from '../models/SwapRequest.js';
import ChangeApplication from '../models/ChangeApplication.js';
import User from '../models/User.js';

// Helper: find available room satisfying preferences
async function findMatchingRoom({ preferredSeater, preferredAC, preferredHostels, preferredBlock, amenities }) {
  const query = {
    seater: preferredSeater,
    ac: preferredAC
  };
  if (preferredBlock) {
    query.blockType = preferredBlock;
  }
  if (amenities) {
    if (amenities.largeDining) query['amenities.largeDining'] = true;
    if (amenities.extraFacilities) query['amenities.extraFacilities'] = true;
  }
  if (Array.isArray(preferredHostels) && preferredHostels.length) {
    const nums = preferredHostels.filter(h => typeof h === 'number');
    const names = preferredHostels.filter(h => typeof h === 'string');
    if (nums.length && names.length) {
      query.$or = [{ hostelNumber: { $in: nums } }, { hostelName: { $in: names } }];
    } else if (nums.length) {
      query.hostelNumber = { $in: nums };
    } else if (names.length) {
      query.hostelName = { $in: names };
    }
  }
  // rooms where occupancy < capacity
  const rooms = await Room.find(query).lean();
  for (const r of rooms) {
    const occupied = (r.occupants || []).length;
    if (occupied < r.capacity) return r;
  }
  return null;
}

// -------- Student: set preferences --------
export async function setPreferences(req, res) {
  try {
    const userId = req.user.id;
    const { foodPreference, preferredSeater, preferredAC, preferredHostels, amenities } = req.body;
    const preferredBlock =
      req.body.preferredBlock ||
      (Array.isArray(preferredHostels) && preferredHostels.length && typeof preferredHostels[0] === 'number'
        ? deriveBlockType(preferredHostels[0])
        : undefined);

    const profile = await StudentProfile.findOneAndUpdate(
      { user: userId },
      {
        user: userId,
        foodPreference,
        preferredSeater,
        preferredAC,
        preferredHostels,
        preferredBlock,
        amenities
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    ).lean();

    return res.json({ profile });
  } catch (err) {
    console.error('setPreferences error', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// -------- Student: auto-assign room based on preferences --------
export async function autoAssignRoom(req, res) {
  try {
    const userId = req.user.id;
    const profile = await StudentProfile.findOne({ user: userId });
    if (!profile) return res.status(400).json({ error: 'Preferences not set' });
    if (profile.assignedRoom) return res.status(409).json({ error: 'Room already assigned' });

    const room = await findMatchingRoom(profile);
    if (!room) return res.status(404).json({ error: 'No matching room available' });

    // Assign
    await Room.updateOne({ _id: room._id }, { $addToSet: { occupants: userId } });
    profile.assignedRoom = room._id;
    profile.status = 'assigned';
    await profile.save();

    return res.json({ assignedRoom: room });
  } catch (err) {
    console.error('autoAssignRoom error', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// -------- Student: view profile --------
export async function getProfile(req, res) {
  try {
    const userId = req.user.id;
    const profile = await StudentProfile.findOne({ user: userId }).populate('assignedRoom').lean();
    return res.json({ profile });
  } catch (err) {
    console.error('getProfile error', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// -------- Student: request swap --------
export async function requestSwap(req, res) {
  try {
    const fromUserId = req.user.id;
    const { toUserId, reason } = req.body;
    if (!toUserId) return res.status(400).json({ error: 'toUserId required' });

    const fromProfile = await StudentProfile.findOne({ user: fromUserId }).populate('assignedRoom');
    const toProfile = await StudentProfile.findOne({ user: toUserId }).populate('assignedRoom');
    if (!fromProfile?.assignedRoom || !toProfile?.assignedRoom) {
      return res.status(400).json({ error: 'Both students must have assigned rooms' });
    }

    // Validation: same bed type (seater + AC) and same room category (blockType)
    const a = fromProfile.assignedRoom;
    const b = toProfile.assignedRoom;
    if (a.seater !== b.seater || a.ac !== b.ac || a.blockType !== b.blockType) {
      return res.status(400).json({ error: 'Swap allowed only for same bed type and room category' });
    }

    const swap = await SwapRequest.create({
      fromUser: fromUserId,
      toUser: toUserId,
      reason,
      seater: a.seater,
      ac: a.ac
    });

    // mark status for visibility
    await StudentProfile.updateOne({ user: fromUserId }, { status: 'swap_pending' });

    return res.status(201).json({ swap });
  } catch (err) {
    console.error('requestSwap error', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// -------- Student: change application --------
export async function applyChange(req, res) {
  try {
    const userId = req.user.id;
    const { name, registrationNumber, reason, type, desiredSeater, desiredAC, desiredHostel } = req.body;
    if (!name || !registrationNumber || !reason || !type) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    if (type === 'bed_type' && (desiredSeater == null || desiredAC == null)) {
      return res.status(400).json({ error: 'desiredSeater and desiredAC required for bed_type change' });
    }
    if (type === 'hostel' && desiredHostel == null) {
      return res.status(400).json({ error: 'desiredHostel required for hostel change' });
    }

    const app = await ChangeApplication.create({
      user: userId,
      name,
      registrationNumber,
      reason,
      type,
      desiredSeater,
      desiredAC,
      desiredHostel
    });

    return res.status(201).json({ application: app });
  } catch (err) {
    console.error('applyChange error', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// -------- Admin: list applications --------
export async function listApplications(_req, res) {
  try {
    const apps = await ChangeApplication.find().sort({ createdAt: -1 }).lean();
    return res.json({ applications: apps });
  } catch (err) {
    console.error('listApplications error', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// -------- Admin: approve/reject application --------
export async function decideApplication(req, res) {
  try {
    const { id } = req.params;
    const { decision, adminNote } = req.body; // decision: 'approve' | 'reject'
    if (!['approve', 'reject'].includes(decision)) return res.status(400).json({ error: 'Invalid decision' });
    const app = await ChangeApplication.findById(id);
    if (!app) return res.status(404).json({ error: 'Application not found' });

    app.status = decision === 'approve' ? 'approved' : 'rejected';
    app.adminNote = adminNote;
    await app.save();

    if (app.status === 'approved') {
      const profile = await StudentProfile.findOne({ user: app.user });
      if (app.type === 'bed_type') {
        profile.preferredSeater = app.desiredSeater;
        profile.preferredAC = app.desiredAC;
      } else if (app.type === 'hostel') {
        profile.preferredHostels = [app.desiredHostel];
        profile.preferredBlock = typeof app.desiredHostel === 'number' ? deriveBlockType(app.desiredHostel) : profile.preferredBlock;
      }
      await profile.save();

      // Try re-assign with new preferences
      if (profile.assignedRoom) {
        // remove from old room occupants
        await Room.updateOne({ _id: profile.assignedRoom }, { $pull: { occupants: app.user } });
        profile.assignedRoom = undefined;
        profile.status = 'pending';
        await profile.save();
      }
      const match = await findMatchingRoom(profile);
      if (match) {
        await Room.updateOne({ _id: match._id }, { $addToSet: { occupants: app.user } });
        profile.assignedRoom = match._id;
        profile.status = 'assigned';
        await profile.save();
      }
    }

    return res.json({ application: app });
  } catch (err) {
    console.error('decideApplication error', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// -------- Admin: list swap requests --------
export async function listSwapRequests(_req, res) {
  try {
    const swaps = await SwapRequest.find().sort({ createdAt: -1 }).lean();
    return res.json({ swaps });
  } catch (err) {
    console.error('listSwapRequests error', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// -------- Admin: approve swap --------
export async function decideSwap(req, res) {
  try {
    const { id } = req.params;
    const { decision } = req.body; // 'approve' | 'reject'
    if (!['approve', 'reject'].includes(decision)) return res.status(400).json({ error: 'Invalid decision' });
    const swap = await SwapRequest.findById(id);
    if (!swap) return res.status(404).json({ error: 'Swap not found' });

    swap.status = decision === 'approve' ? 'approved' : 'rejected';
    await swap.save();

    if (swap.status === 'approved') {
      const a = await StudentProfile.findOne({ user: swap.fromUser });
      const b = await StudentProfile.findOne({ user: swap.toUser });
      if (!a?.assignedRoom || !b?.assignedRoom) {
        return res.status(400).json({ error: 'Both students must have assigned rooms' });
      }
      // Swap occupants
      const roomA = await Room.findById(a.assignedRoom);
      const roomB = await Room.findById(b.assignedRoom);
      await Room.updateOne({ _id: roomA._id }, { $pull: { occupants: swap.fromUser } });
      await Room.updateOne({ _id: roomB._id }, { $pull: { occupants: swap.toUser } });
      await Room.updateOne({ _id: roomA._id }, { $addToSet: { occupants: swap.toUser } });
      await Room.updateOne({ _id: roomB._id }, { $addToSet: { occupants: swap.fromUser } });
      // Update profiles
      const temp = a.assignedRoom;
      a.assignedRoom = b.assignedRoom;
      b.assignedRoom = temp;
      a.status = 'assigned';
      b.status = 'assigned';
      await a.save();
      await b.save();
    }

    return res.json({ swap });
  } catch (err) {
    console.error('decideSwap error', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// -------- Admin: create/update rooms --------
export async function upsertRoom(req, res) {
  try {
    const { hostelNumber, hostelName, seater, ac, amenities, roomLabel, capacity, blockType: inputBlockType } = req.body;
    if (hostelNumber == null && !hostelName) {
      return res.status(400).json({ error: 'Provide hostelNumber (1-8) or hostelName' });
    }
    const blockType = hostelNumber != null ? deriveBlockType(hostelNumber) : inputBlockType;
    if (!blockType) {
      return res.status(400).json({ error: 'blockType required when using hostelName' });
    }
    const filter = { seater, ac, roomLabel };
    if (hostelNumber != null) filter.hostelNumber = hostelNumber;
    if (hostelName) filter.hostelName = hostelName;
    const update = { seater, ac, amenities, roomLabel, capacity: capacity || seater, blockType };
    if (hostelNumber != null) update.hostelNumber = hostelNumber;
    if (hostelName) update.hostelName = hostelName;
    const room = await Room.findOneAndUpdate(filter, update, { upsert: true, new: true, setDefaultsOnInsert: true });
    return res.status(201).json({ room });
  } catch (err) {
    console.error('upsertRoom error', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// -------- Public: list availability --------
export async function listAvailability(req, res) {
  try {
    const { hostelNumber, hostelName, blockType, seater, ac } = req.query;
    const query = {};
    if (hostelNumber) query.hostelNumber = Number(hostelNumber);
    if (hostelName) query.hostelName = hostelName;
    if (blockType) query.blockType = blockType;
    if (seater) query.seater = Number(seater);
    if (ac != null) query.ac = String(ac) === 'true';

    const rooms = await Room.find(query).lean();
    const formatted = rooms.map(r => ({
      id: r._id,
      hostelNumber: r.hostelNumber,
      hostelName: r.hostelName,
      blockType: r.blockType,
      seater: r.seater,
      ac: r.ac,
      capacity: r.capacity,
      occupied: (r.occupants || []).length,
      available: Math.max(0, r.capacity - (r.occupants || []).length),
      amenities: r.amenities,
      roomLabel: r.roomLabel
    }));
    return res.json({ rooms: formatted });
  } catch (err) {
    console.error('listAvailability error', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// -------- Admin: batch auto-assign for all pending students --------
export async function batchAutoAssign(_req, res) {
  try {
    const pending = await StudentProfile.find({ status: 'pending', assignedRoom: { $exists: false } });
    const results = [];
    for (const p of pending) {
      const match = await findMatchingRoom(p);
      if (match) {
        await Room.updateOne({ _id: match._id }, { $addToSet: { occupants: p.user } });
        p.assignedRoom = match._id;
        p.status = 'assigned';
        await p.save();
        results.push({ user: p.user.toString(), roomId: match._id.toString() });
      } else {
        results.push({ user: p.user.toString(), roomId: null });
      }
    }
    return res.json({ assigned: results });
  } catch (err) {
    console.error('batchAutoAssign error', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}