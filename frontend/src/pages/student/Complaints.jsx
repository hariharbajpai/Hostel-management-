import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, MessageSquare, ThumbsUp, Clock, CheckCircle, AlertCircle, Filter, Search } from 'lucide-react';
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

const StudentComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [filters, setFilters] = useState({
    status: '',
    category: '',
    priority: '',
    search: ''
  });

  const [newComplaint, setNewComplaint] = useState({
    title: '',
    description: '',
    category: '',
    priority: 'medium',
    isAnonymous: false,
    roomNumber: '',
    hostelNumber: ''
  });

  const categories = [
    'maintenance', 'cleanliness', 'food', 'security', 'noise', 'facilities', 'other'
  ];

  const priorities = ['low', 'medium', 'high', 'urgent'];

  useEffect(() => {
    loadComplaints();
  }, [filters]);

  const loadComplaints = async () => {
    try {
      setLoading(true);
      const data = await complaintService.getMyComplaints(filters);
      setComplaints(data.complaints || []);
    } catch (error) {
      console.error('Failed to load complaints:', error);
      toast.error('Failed to load complaints');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateComplaint = async (e) => {
    e.preventDefault();
    try {
      await complaintService.createComplaint(newComplaint);
      toast.success('Complaint submitted successfully');
      setShowCreateModal(false);
      setNewComplaint({
        title: '',
        description: '',
        category: '',
        priority: 'medium',
        isAnonymous: false,
        roomNumber: '',
        hostelNumber: ''
      });
      loadComplaints();
    } catch (error) {
      console.error('Failed to create complaint:', error);
      toast.error('Failed to submit complaint');
    }
  };

  const handleUpvote = async (id) => {
    try {
      await complaintService.upvoteComplaint(id);
      toast.success('Upvoted successfully');
      loadComplaints();
    } catch (error) {
      console.error('Failed to upvote:', error);
      toast.error('Failed to upvote');
    }
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
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'in-progress':
        return <Clock className="w-5 h-5 text-blue-500" />;
      case 'resolved':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-500" />;
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
            <h1 className="text-4xl font-black mb-2">My Complaints</h1>
            <p className="text-gray-600">Track and manage your hostel complaints</p>
          </div>
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="w-4 h-4" />
            New Complaint
          </Button>
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
              <option value="open">Open</option>
              <option value="in-progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
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
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">No complaints found</h3>
              <p className="text-gray-500 mb-4">You haven't submitted any complaints yet.</p>
              <Button onClick={() => setShowCreateModal(true)}>
                <Plus className="w-4 h-4" />
                Submit Your First Complaint
              </Button>
            </Card>
          ) : (
            complaints.map((complaint) => (
              <motion.div
                key={complaint._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -2 }}
              >
                <Card className="cursor-pointer" onClick={() => setSelectedComplaint(complaint)}>
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
                        {complaint.roomNumber && (
                          <>
                            <span>•</span>
                            <span>Room {complaint.roomNumber}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <ThumbsUp className="w-4 h-4" />
                        <span>{complaint.upvoteCount || 0}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageSquare className="w-4 h-4" />
                        <span>{complaint.commentCount || 0}</span>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))
          )}
        </div>

        {/* Create Complaint Modal */}
        <Modal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          title="Submit New Complaint"
        >
          <form onSubmit={handleCreateComplaint} className="space-y-4">
            <Input
              label="Title"
              value={newComplaint.title}
              onChange={(e) => setNewComplaint({ ...newComplaint, title: e.target.value })}
              required
              placeholder="Brief description of the issue"
            />
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                rows={4}
                value={newComplaint.description}
                onChange={(e) => setNewComplaint({ ...newComplaint, description: e.target.value })}
                required
                placeholder="Detailed description of the issue"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Category"
                value={newComplaint.category}
                onChange={(e) => setNewComplaint({ ...newComplaint, category: e.target.value })}
                required
              >
                <option value="">Select Category</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
                ))}
              </Select>

              <Select
                label="Priority"
                value={newComplaint.priority}
                onChange={(e) => setNewComplaint({ ...newComplaint, priority: e.target.value })}
              >
                {priorities.map(priority => (
                  <option key={priority} value={priority}>{priority.charAt(0).toUpperCase() + priority.slice(1)}</option>
                ))}
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Room Number (Optional)"
                value={newComplaint.roomNumber}
                onChange={(e) => setNewComplaint({ ...newComplaint, roomNumber: e.target.value })}
                placeholder="e.g., 101"
              />
              
              <Input
                label="Hostel Number (Optional)"
                value={newComplaint.hostelNumber}
                onChange={(e) => setNewComplaint({ ...newComplaint, hostelNumber: e.target.value })}
                placeholder="e.g., H1"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="anonymous"
                checked={newComplaint.isAnonymous}
                onChange={(e) => setNewComplaint({ ...newComplaint, isAnonymous: e.target.checked })}
                className="rounded border-gray-300 text-black focus:ring-black"
              />
              <label htmlFor="anonymous" className="text-sm text-gray-700">
                Submit anonymously
              </label>
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" className="flex-1">
                Submit Complaint
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowCreateModal(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Modal>

        {/* Complaint Detail Modal */}
        {selectedComplaint && (
          <Modal
            isOpen={!!selectedComplaint}
            onClose={() => setSelectedComplaint(null)}
            title="Complaint Details"
            size="lg"
          >
            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  {getStatusIcon(selectedComplaint.status)}
                  <h2 className="text-xl font-semibold">{selectedComplaint.title}</h2>
                  {getStatusBadge(selectedComplaint.status)}
                  {getPriorityBadge(selectedComplaint.priority)}
                </div>
                <p className="text-gray-700 mb-4">{selectedComplaint.description}</p>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Category:</span>
                    <span className="ml-2 capitalize">{selectedComplaint.category}</span>
                  </div>
                  <div>
                    <span className="font-medium">Created:</span>
                    <span className="ml-2">{new Date(selectedComplaint.createdAt).toLocaleString()}</span>
                  </div>
                  {selectedComplaint.roomNumber && (
                    <div>
                      <span className="font-medium">Room:</span>
                      <span className="ml-2">{selectedComplaint.roomNumber}</span>
                    </div>
                  )}
                  {selectedComplaint.hostelNumber && (
                    <div>
                      <span className="font-medium">Hostel:</span>
                      <span className="ml-2">{selectedComplaint.hostelNumber}</span>
                    </div>
                  )}
                </div>
              </div>

              {selectedComplaint.adminNotes && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Admin Notes</h4>
                  <p className="text-blue-800">{selectedComplaint.adminNotes}</p>
                </div>
              )}

              {selectedComplaint.resolution && (
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-medium text-green-900 mb-2">Resolution</h4>
                  <p className="text-green-800">{selectedComplaint.resolution}</p>
                  {selectedComplaint.resolvedAt && (
                    <p className="text-sm text-green-700 mt-2">
                      Resolved on {new Date(selectedComplaint.resolvedAt).toLocaleString()}
                    </p>
                  )}
                </div>
              )}

              <div className="flex items-center gap-4 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => handleUpvote(selectedComplaint._id)}
                  className="flex items-center gap-2"
                >
                  <ThumbsUp className="w-4 h-4" />
                  Upvote ({selectedComplaint.upvoteCount || 0})
                </Button>
                <div className="flex items-center gap-2 text-gray-500">
                  <MessageSquare className="w-4 h-4" />
                  <span>{selectedComplaint.commentCount || 0} comments</span>
                </div>
              </div>
            </div>
          </Modal>
        )}
      </motion.div>
    </Layout>
  );
};

export default StudentComplaints;