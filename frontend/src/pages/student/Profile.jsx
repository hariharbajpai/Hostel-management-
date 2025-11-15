import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Home, Utensils, Check, ArrowRight, RefreshCw } from 'lucide-react';
import Layout from '../../components/Layout';
import Card from '../../ui/Card';
import Button from '../../ui/Button';
import Badge from '../../ui/Badge';
import Loader from '../../ui/Loader';
import Modal from '../../ui/Modal';
import hostelService from '../../services/hostelService';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../store/authStore';

const StudentProfile = () => {
  const { user } = useAuthStore();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);
  const [showSwapModal, setShowSwapModal] = useState(false);
  const [showChangeModal, setShowChangeModal] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const { profile } = await hostelService.getProfile();
      setProfile(profile);
    } catch (error) {
      console.error('Failed to load profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignRoom = async () => {
    if (!profile?.preferredSeater) {
      toast.error('Please set your preferences first');
      return;
    }

    setAssigning(true);
    try {
      const { assignedRoom } = await hostelService.autoAssignRoom();
      toast.success('Room assigned successfully!');
      loadProfile();
    } catch (error) {
      console.error('Failed to assign room:', error);
      toast.error(error.response?.data?.error || 'Failed to assign room');
    } finally {
      setAssigning(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader size="lg" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-black mb-2">My Profile</h1>
            <p className="text-gray-600">View and manage your hostel profile</p>
          </div>
          <Button onClick={loadProfile} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>

        {/* User Info */}
        <Card>
          <div className="flex items-center gap-4 mb-6">
            <div className="w-20 h-20 bg-black text-white rounded-2xl flex items-center justify-center text-2xl font-bold">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-2xl font-bold">{user?.name}</h2>
              <p className="text-gray-600">{user?.email}</p>
            </div>
          </div>
        </Card>

        {/* Preferences */}
        <Card>
          <h2 className="text-2xl font-bold mb-6">Preferences</h2>
          {profile ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-gray-600 mb-1">Food Preference</p>
                <p className="font-semibold capitalize">{profile.foodPreference?.replace('_', ' ')}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Seater</p>
                <p className="font-semibold">{profile.preferredSeater}-Seater</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">AC Type</p>
                <p className="font-semibold">{profile.preferredAC ? 'AC' : 'Non-AC'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Block Type</p>
                <p className="font-semibold capitalize">{profile.preferredBlock || 'No Preference'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Status</p>
                <Badge variant={profile.status === 'assigned' ? 'success' : 'warning'}>
                  {profile.status?.toUpperCase()}
                </Badge>
              </div>
            </div>
          ) : (
            <p className="text-gray-600">No preferences set yet</p>
          )}
        </Card>

        {/* Room Assignment */}
        {profile?.assignedRoom ? (
          <Card>
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Check className="w-6 h-6 text-green-600" />
              Assigned Room
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <p className="text-sm text-gray-600 mb-1">Hostel</p>
                <p className="font-semibold">
                  {profile.assignedRoom.hostelName || `Hostel ${profile.assignedRoom.hostelNumber}`}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Room Label</p>
                <p className="font-semibold">{profile.assignedRoom.roomLabel || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Type</p>
                <p className="font-semibold">
                  {profile.assignedRoom.seater}-Seater {profile.assignedRoom.ac ? 'AC' : 'Non-AC'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Block</p>
                <p className="font-semibold capitalize">{profile.assignedRoom.blockType}</p>
              </div>
            </div>

            <div className="mt-6 flex gap-4">
              <Button variant="outline" onClick={() => setShowSwapModal(true)}>
                Request Swap
              </Button>
              <Button variant="outline" onClick={() => setShowChangeModal(true)}>
                Request Change
              </Button>
            </div>
          </Card>
        ) : (
          <Card className="bg-gray-50">
            <h2 className="text-2xl font-bold mb-4">Room Assignment</h2>
            <p className="text-gray-600 mb-6">You don't have an assigned room yet</p>
            <Button onClick={handleAssignRoom} loading={assigning}>
              <Home className="w-5 h-5" />
              Auto-Assign Room
            </Button>
          </Card>
        )}
      </motion.div>

      {/* Modals */}
      <Modal isOpen={showSwapModal} onClose={() => setShowSwapModal(false)} title="Request Room Swap">
        <p className="text-gray-600 mb-4">Room swap feature will be implemented here</p>
        <Button onClick={() => setShowSwapModal(false)}>Close</Button>
      </Modal>

      <Modal isOpen={showChangeModal} onClose={() => setShowChangeModal(false)} title="Request Room Change">
        <p className="text-gray-600 mb-4">Room change application will be implemented here</p>
        <Button onClick={() => setShowChangeModal(false)}>Close</Button>
      </Modal>
    </Layout>
  );
};

export default StudentProfile;
