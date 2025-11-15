import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, Settings, User, RefreshCw, ArrowRight, Bed, Building, Info } from 'lucide-react';
import Layout from '../../components/Layout';
import Card from '../../ui/Card';
import Button from '../../ui/Button';
import Badge from '../../ui/Badge';
import Loader from '../../ui/Loader';
import hostelService from '../../services/hostelService';
import toast from 'react-hot-toast';

const StudentDashboard = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

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

  const getStatusBadge = (status) => {
    const variants = {
      pending: 'warning',
      assigned: 'success',
      swap_pending: 'info',
    };
    return <Badge variant={variants[status] || 'default'}>{status?.replace('_', ' ').toUpperCase()}</Badge>;
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

  const stats = [
    {
      icon: Home,
      label: 'Room Status',
      value: profile?.status || 'N/A',
      badge: profile?.status ? getStatusBadge(profile.status) : null,
    },
    {
      icon: Bed,
      label: 'Preferred Seater',
      value: profile?.preferredSeater ? `${profile.preferredSeater}-Seater` : 'Not Set',
    },
    {
      icon: Building,
      label: 'Preferred AC',
      value: profile?.preferredAC !== undefined ? (profile.preferredAC ? 'AC' : 'Non-AC') : 'Not Set',
    },
  ];

  return (
    <Layout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-black mb-2">Student Dashboard</h1>
            <p className="text-gray-600">Welcome back! Here's your hostel overview</p>
          </div>
          <Button onClick={loadProfile} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Card>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                  <div className="p-3 bg-black text-white rounded-lg">
                    <stat.icon className="w-6 h-6" />
                  </div>
                </div>
                {stat.badge && <div className="mt-3">{stat.badge}</div>}
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Room Info */}
        {profile?.assignedRoom ? (
          <Card>
            <h2 className="text-2xl font-bold mb-4">Your Assigned Room</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-600">Hostel</p>
                <p className="font-semibold">
                  {profile.assignedRoom.hostelName || `Hostel ${profile.assignedRoom.hostelNumber}`}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Room Label</p>
                <p className="font-semibold">{profile.assignedRoom.roomLabel || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Type</p>
                <p className="font-semibold">
                  {profile.assignedRoom.seater}-Seater {profile.assignedRoom.ac ? 'AC' : 'Non-AC'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Block Type</p>
                <p className="font-semibold capitalize">{profile.assignedRoom.blockType}</p>
              </div>
            </div>
          </Card>
        ) : (
          <Card variant="light" className="bg-gray-50">
            <div className="flex items-center gap-4">
              <Info className="w-8 h-8 text-gray-600" />
              <div>
                <h3 className="font-bold text-lg mb-1">No Room Assigned</h3>
                <p className="text-gray-600">
                  Please set your preferences and request room assignment
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Quick Actions */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Card hoverable className="cursor-pointer" onClick={() => navigate('/student/preferences')}>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-lg mb-1">Set Preferences</h3>
                    <p className="text-sm text-gray-600">Configure your room preferences</p>
                  </div>
                  <ArrowRight className="w-6 h-6" />
                </div>
              </Card>
            </motion.div>

            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Card hoverable className="cursor-pointer" onClick={() => navigate('/student/profile')}>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-lg mb-1">View Profile</h3>
                    <p className="text-sm text-gray-600">See your complete profile</p>
                  </div>
                  <ArrowRight className="w-6 h-6" />
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </Layout>
  );
};

export default StudentDashboard;
