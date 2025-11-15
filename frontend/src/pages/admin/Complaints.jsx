import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Clock, CheckCircle, XCircle, Filter, Search, BarChart3, Users, TrendingUp } from 'lucide-react';
import Layout from '../../components/Layout';
import Card from '../../ui/Card';
import Button from '../../ui/Button';
import Badge from '../../ui/Badge';
import Loader from '../../ui/Loader';
import Modal from '../../ui/Modal';
import Input from '../../ui/Input';
import Select from '../../ui/Select';
import complaintService from '../../services/complaintService';
import toast from 'react-hot-toast';

const AdminComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    category: '',
    priority: '',
    search: ''
  });

  const [updateData, setUpdateData] = useState({
    status: '',
    assignedTo: '',
    adminNotes: '',
    resolution: ''
  });

  const categories = [
    'maintenance', 'cleanliness', 'food', 'security', 'noise', 'facilities', 'other'
  ];

  const priorities = ['low', 'medium', 'high', 'urgent'];
  const statuses = ['open', 'in-progress', 'resolved', 'closed'];

  useEffect(() => {
    loadComplaints();
    loadStats();
  }, [filters]);

  const loadComplaints = async () => {
    try {
      setLoading(true);
      const data = await complaintService.getAllComplaints(filters);
      setComplaints(data.complaints || []);
    } catch (error) {
      console.error('Failed to load complaints:', error);
      toast.error('Failed to load complaints');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const data = await complaintService.getComplaintStats();
      setStats(data.stats || {});
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const handleUpdateComplaint = async (e) => {
    e.preventDefault();
    try {
      await complaintService.updateComplaintStatus(selectedComplaint._id, updateData);
      toast.success('Complaint updated successfully');
      setShowUpdateModal(false);
      setSelectedComplaint(null);
      setUpdateData({
        status: '',
        assignedTo: '',
        adminNotes: '',
        resolution: ''
      });
      loadComplaints();
      loadStats();
    } catch (error) {
      console.error('Failed to update complaint:', error);
      toast.error('Failed to update complaint');
    }
  };

  const handleDeleteComplaint = async (id) => {
    if (!confirm('Are you sure you want to delete this complaint?')) return;
    
    try {
      await complaintService.deleteComplaint(id);
      toast.success('Complaint deleted successfully');
      loadComplaints();
      loadStats();
    } catch (error) {
      console.error('Failed to delete complaint:', error);
      toast.error('Failed to delete complaint');
    }
  };

  const openUpdateModal = (complaint) => {
    setSelectedComplaint(complaint);
    setUpdateData({
      status: complaint.status,
      assignedTo: complaint.assignedTo || '',
      adminNotes: complaint.adminNotes || '',
      resolution: complaint.resolution || ''
    });
    setShowUpdateModal(true);
  };

  const getStatusBadge = (status) => {
    const variants = {
      open: 'warning',
      'in-progress': 'info',
      resolved: 'success',
      closed: 'default'
    };
    return <Badge variant={variants[status] || 'default'}>{status.replace('-', ' ').toUpperCase()}</Badge>;
  };

  const getPriorityBadge = (priority) => {
    const variants = {
      low: 'default',
      medium: 'warning',
      high: 'danger',
      urgent: 'danger'
    };
    return <Badge variant={variants[priority]}>{priority.toUpperCase()}</Badge>;
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'open':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'in-progress':
        return <Clock className="w-5 h-5 text-blue-500" />;
      case 'resolved':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'closed':
        return <XCircle className="w-5 h-5 text-gray-500" />;
      default:
        return <AlertTriangle className="w-5 h-5 text-gray-500" />;
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
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-black mb-2">Complaint Management</h1>
            <p className="text-gray-600">Manage and resolve student complaints</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Complaints</p>
                  <p className="text-2xl font-bold">{stats.total || 0}</p>
                </div>
                <BarChart3 className="w-8 h-8 text-blue-500" />
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Open</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.open || 0}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-yellow-500" />
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">In Progress</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.inProgress || 0}</p>
                </div>
                <Clock className="w-8 h-8 text-blue-500" />
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Resolved</p>
                  <p className="text-2xl font-bold text-green-600">{stats.resolved || 0}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Filters */}
        <Card>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input
              placeholder="Search complaints..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              icon={Search}
            />
            <Select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            >
              <option value="">All Status</option>
              {statuses.map(status => (
                <option key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}</option>
              ))}
            </Select>
            <Select
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
              ))}
            </Select>
            <Select
              value={filters.priority}
              onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
            >
              <option value="">All Priorities</option>
              {priorities.map(priority => (
                <option key={priority} value={priority}>{priority.charAt(0).toUpperCase() + priority.slice(1)}</option>
              ))}
            </Select>
          </div>
        </Card>

        {/* Complaints List */}
        <div className="space-y-4">
          {complaints.length === 0 ? (
            <Card className="text-center py-12">
              <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">No complaints found</h3>
              <p className="text-gray-500">No complaints match your current filters.</p>
            </Card>
          ) : (
            complaints.map((complaint) => (
              <motion.div
                key={complaint._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -2 }}
              >
                <Card>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {getStatusIcon(complaint.status)}
                        <h3 className="text-lg font-semibold">{complaint.title}</h3>
                        {getStatusBadge(complaint.status)}
                        {getPriorityBadge(complaint.priority)}
                      </div>
                      <p className="text-gray-600 mb-3 line-clamp-2">{complaint.description}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="capitalize">{complaint.category}</span>
                        <span>•</span>
                        <span>{new Date(complaint.createdAt).toLocaleDateString()}</span>
                        {complaint.complainant && !complaint.isAnonymous && (
                          <>
                            <span>•</span>
                            <span>{complaint.complainant.name}</span>
                          </>
                        )}
                        {complaint.isAnonymous && (
                          <>
                            <span>•</span>
                            <span className="italic">Anonymous</span>
                          </>
                        )}
                        {complaint.roomNumber && (
                          <>
                            <span>•</span>
                            <span>Room {complaint.roomNumber}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openUpdateModal(complaint)}
                      >
                        Update
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDeleteComplaint(complaint._id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))
          )}
        </div>

        {/* Update Complaint Modal */}
        <Modal
          isOpen={showUpdateModal}
          onClose={() => setShowUpdateModal(false)}
          title="Update Complaint"
          size="lg"
        >
          {selectedComplaint && (
            <form onSubmit={handleUpdateComplaint} className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <h4 className="font-semibold mb-2">{selectedComplaint.title}</h4>
                <p className="text-gray-600 text-sm">{selectedComplaint.description}</p>
              </div>

              <Select
                label="Status"
                value={updateData.status}
                onChange={(e) => setUpdateData({ ...updateData, status: e.target.value })}
                required
              >
                {statuses.map(status => (
                  <option key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
                  </option>
                ))}
              </Select>

              <Input
                label="Assigned To"
                value={updateData.assignedTo}
                onChange={(e) => setUpdateData({ ...updateData, assignedTo: e.target.value })}
                placeholder="Staff member or department"
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Admin Notes
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  rows={3}
                  value={updateData.adminNotes}
                  onChange={(e) => setUpdateData({ ...updateData, adminNotes: e.target.value })}
                  placeholder="Internal notes for tracking"
                />
              </div>

              {updateData.status === 'resolved' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Resolution Details
                  </label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                    rows={3}
                    value={updateData.resolution}
                    onChange={(e) => setUpdateData({ ...updateData, resolution: e.target.value })}
                    placeholder="How was this complaint resolved?"
                    required={updateData.status === 'resolved'}
                  />
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <Button type="submit" className="flex-1">
                  Update Complaint
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowUpdateModal(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          )}
        </Modal>
      </motion.div>
    </Layout>
  );
};

export default AdminComplaints;