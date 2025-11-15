import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, FileText, RefreshCw, ArrowRight, Building, Bed } from 'lucide-react';
import Layout from '../../components/Layout';
import Card from '../../ui/Card';
import Button from '../../ui/Button';
import Loader from '../../ui/Loader';
import hostelService from '../../services/hostelService';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    applications: 0,
    swaps: 0,
    rooms: 0,
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const [applications, swaps, rooms] = await Promise.all([
        hostelService.listApplications(),
        hostelService.listSwapRequests(),
        hostelService.getRoomsAvailability(),
      ]);

      setStats({
        applications: applications.applications?.length || 0,
        swaps: swaps.swaps?.length || 0,
        rooms: rooms.rooms?.length || 0,
      });
    } catch (error) {
      console.error('Failed to load stats:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleBatchAssign = async () => {
    try {
      const result = await hostelService.batchAutoAssign();
      toast.success(`Assigned ${result.assigned.filter(a => a.roomId).length} students`);
      loadStats();
    } catch (error) {
      console.error('Batch assign failed:', error);
      toast.error('Batch assignment failed');
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

  const statCards = [
    { icon: FileText, label: 'Applications', value: stats.applications, color: 'bg-blue-500' },
    { icon: RefreshCw, label: 'Swap Requests', value: stats.swaps, color: 'bg-green-500' },
    { icon: Building, label: 'Total Rooms', value: stats.rooms, color: 'bg-purple-500' },
  ];

  return (
    <Layout>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
        <div>
          <h1 className="text-4xl font-black mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Manage hostel rooms and student applications</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {statCards.map((stat, idx) => (
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
                    <p className="text-3xl font-bold">{stat.value}</p>
                  </div>
                  <div className={`p-3 ${stat.color} text-white rounded-lg`}>
                    <stat.icon className="w-6 h-6" />
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Card hoverable className="cursor-pointer" onClick={() => navigate('/admin/applications')}>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-lg mb-1">Manage Applications</h3>
                    <p className="text-sm text-gray-600">Review room change requests</p>
                  </div>
                  <ArrowRight className="w-6 h-6" />
                </div>
              </Card>
            </motion.div>

            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Card hoverable className="cursor-pointer" onClick={() => navigate('/admin/swaps')}>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-lg mb-1">Manage Swaps</h3>
                    <p className="text-sm text-gray-600">Approve room swap requests</p>
                  </div>
                  <ArrowRight className="w-6 h-6" />
                </div>
              </Card>
            </motion.div>

            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Card hoverable className="cursor-pointer" onClick={() => navigate('/admin/rooms')}>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-lg mb-1">Manage Rooms</h3>
                    <p className="text-sm text-gray-600">Add or edit hostel rooms</p>
                  </div>
                  <ArrowRight className="w-6 h-6" />
                </div>
              </Card>
            </motion.div>

            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Card hoverable variant="dark" className="cursor-pointer" onClick={handleBatchAssign}>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-lg mb-1">Batch Auto-Assign</h3>
                    <p className="text-sm text-gray-400">Assign rooms to all pending students</p>
                  </div>
                  <Users className="w-6 h-6" />
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </Layout>
  );
};

export default AdminDashboard;
