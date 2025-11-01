import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Bell, Eye, EyeOff, Edit, Trash2, Pin, Calendar, Users, BarChart3 } from 'lucide-react';
import Layout from '../../components/Layout';
import Card from '../../ui/Card';
import Button from '../../ui/Button';
import Badge from '../../ui/Badge';
import Loader from '../../ui/Loader';
import Modal from '../../ui/Modal';
import Input from '../../ui/Input';
import Select from '../../ui/Select';
import noticeService from '../../services/noticeService';
import toast from 'react-hot-toast';

const AdminNotices = () => {
  const [notices, setNotices] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedNotice, setSelectedNotice] = useState(null);
  const [filters, setFilters] = useState({
    status: '',
    category: '',
    priority: '',
    search: ''
  });

  const [noticeData, setNoticeData] = useState({
    title: '',
    content: '',
    category: '',
    priority: 'medium',
    targetAudience: {
      type: 'all',
      hostelNumbers: [],
      roomNumbers: []
    },
    expiryDate: '',
    isPinned: false,
    isUrgent: false,
    tags: []
  });

  const categories = [
    'general', 'academic', 'hostel', 'mess', 'events', 'maintenance', 'emergency'
  ];

  const priorities = ['low', 'medium', 'high', 'urgent'];

  useEffect(() => {
    loadNotices();
    loadStats();
  }, [filters]);

  const loadNotices = async () => {
    try {
      setLoading(true);
      const data = await noticeService.getAllNotices(filters);
      setNotices(data.notices || []);
    } catch (error) {
      console.error('Failed to load notices:', error);
      toast.error('Failed to load notices');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const data = await noticeService.getNoticeStats();
      setStats(data.stats || {});
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const handleCreateNotice = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...noticeData,
        tags: noticeData.tags.filter(tag => tag.trim() !== '')
      };
      await noticeService.createNotice(payload);
      toast.success('Notice created successfully');
      setShowCreateModal(false);
      resetNoticeData();
      loadNotices();
      loadStats();
    } catch (error) {
      console.error('Failed to create notice:', error);
      toast.error('Failed to create notice');
    }
  };

  const handleUpdateNotice = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...noticeData,
        tags: noticeData.tags.filter(tag => tag.trim() !== '')
      };
      await noticeService.updateNotice(selectedNotice._id, payload);
      toast.success('Notice updated successfully');
      setShowEditModal(false);
      setSelectedNotice(null);
      resetNoticeData();
      loadNotices();
      loadStats();
    } catch (error) {
      console.error('Failed to update notice:', error);
      toast.error('Failed to update notice');
    }
  };

  const handleTogglePublish = async (id) => {
    try {
      await noticeService.togglePublishNotice(id);
      toast.success('Notice status updated');
      loadNotices();
      loadStats();
    } catch (error) {
      console.error('Failed to toggle publish status:', error);
      toast.error('Failed to update notice status');
    }
  };

  const handleDeleteNotice = async (id) => {
    if (!confirm('Are you sure you want to delete this notice?')) return;
    
    try {
      await noticeService.deleteNotice(id);
      toast.success('Notice deleted successfully');
      loadNotices();
      loadStats();
    } catch (error) {
      console.error('Failed to delete notice:', error);
      toast.error('Failed to delete notice');
    }
  };

  const openEditModal = (notice) => {
    setSelectedNotice(notice);
    setNoticeData({
      title: notice.title,
      content: notice.content,
      category: notice.category,
      priority: notice.priority,
      targetAudience: notice.targetAudience || { type: 'all', hostelNumbers: [], roomNumbers: [] },
      expiryDate: notice.expiryDate ? new Date(notice.expiryDate).toISOString().split('T')[0] : '',
      isPinned: notice.isPinned,
      isUrgent: notice.isUrgent,
      tags: notice.tags || []
    });
    setShowEditModal(true);
  };

  const resetNoticeData = () => {
    setNoticeData({
      title: '',
      content: '',
      category: '',
      priority: 'medium',
      targetAudience: {
        type: 'all',
        hostelNumbers: [],
        roomNumbers: []
      },
      expiryDate: '',
      isPinned: false,
      isUrgent: false,
      tags: []
    });
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

  const getCategoryBadge = (category) => {
    const variants = {
      general: 'default',
      academic: 'info',
      hostel: 'warning',
      mess: 'success',
      events: 'info',
      maintenance: 'warning',
      emergency: 'danger'
    };
    return <Badge variant={variants[category] || 'default'}>{category.toUpperCase()}</Badge>;
  };

  const addTag = () => {
    setNoticeData({
      ...noticeData,
      tags: [...noticeData.tags, '']
    });
  };

  const updateTag = (index, value) => {
    const newTags = [...noticeData.tags];
    newTags[index] = value;
    setNoticeData({
      ...noticeData,
      tags: newTags
    });
  };

  const removeTag = (index) => {
    const newTags = noticeData.tags.filter((_, i) => i !== index);
    setNoticeData({
      ...noticeData,
      tags: newTags
    });
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
            <h1 className="text-4xl font-black mb-2">Notice Management</h1>
            <p className="text-gray-600">Create and manage announcements for students</p>
          </div>
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="w-4 h-4" />
            Create Notice
          </Button>
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
                  <p className="text-sm font-medium text-gray-600">Total Notices</p>
                  <p className="text-2xl font-bold">{stats.total || 0}</p>
                </div>
                <Bell className="w-8 h-8 text-blue-500" />
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
                  <p className="text-sm font-medium text-gray-600">Published</p>
                  <p className="text-2xl font-bold text-green-600">{stats.published || 0}</p>
                </div>
                <Eye className="w-8 h-8 text-green-500" />
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
                  <p className="text-sm font-medium text-gray-600">Draft</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.draft || 0}</p>
                </div>
                <EyeOff className="w-8 h-8 text-yellow-500" />
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
                  <p className="text-sm font-medium text-gray-600">Total Views</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.totalViews || 0}</p>
                </div>
                <BarChart3 className="w-8 h-8 text-blue-500" />
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Filters */}
        <Card>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input
              placeholder="Search notices..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            />
            <Select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            >
              <option value="">All Status</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
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

        {/* Notices List */}
        <div className="space-y-4">
          {notices.length === 0 ? (
            <Card className="text-center py-12">
              <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">No notices found</h3>
              <p className="text-gray-500 mb-4">No notices match your current filters.</p>
              <Button onClick={() => setShowCreateModal(true)}>
                <Plus className="w-4 h-4" />
                Create Your First Notice
              </Button>
            </Card>
          ) : (
            notices.map((notice) => (
              <motion.div
                key={notice._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -2 }}
              >
                <Card className={notice.isPinned ? 'border-yellow-200 bg-yellow-50' : ''}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {notice.isPinned && <Pin className="w-4 h-4 text-yellow-600" />}
                        <h3 className="text-lg font-semibold">{notice.title}</h3>
                        {getCategoryBadge(notice.category)}
                        {getPriorityBadge(notice.priority)}
                        {notice.isUrgent && (
                          <Badge variant="danger">URGENT</Badge>
                        )}
                        <Badge variant={notice.isPublished ? 'success' : 'warning'}>
                          {notice.isPublished ? 'Published' : 'Draft'}
                        </Badge>
                      </div>
                      <p className="text-gray-600 mb-3 line-clamp-2">{notice.content}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>{new Date(notice.createdAt).toLocaleDateString()}</span>
                        {notice.expiryDate && (
                          <>
                            <span>•</span>
                            <span>Expires: {new Date(notice.expiryDate).toLocaleDateString()}</span>
                          </>
                        )}
                        <span>•</span>
                        <span>{notice.viewCount || 0} views</span>
                        <span>•</span>
                        <span>{notice.likeCount || 0} likes</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleTogglePublish(notice._id)}
                      >
                        {notice.isPublished ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        {notice.isPublished ? 'Unpublish' : 'Publish'}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditModal(notice)}
                      >
                        <Edit className="w-4 h-4" />
                        Edit
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDeleteNotice(notice._id)}
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))
          )}
        </div>

        {/* Create/Edit Notice Modal */}
        <Modal
          isOpen={showCreateModal || showEditModal}
          onClose={() => {
            setShowCreateModal(false);
            setShowEditModal(false);
            setSelectedNotice(null);
            resetNoticeData();
          }}
          title={showEditModal ? 'Edit Notice' : 'Create New Notice'}
          size="lg"
        >
          <form onSubmit={showEditModal ? handleUpdateNotice : handleCreateNotice} className="space-y-4">
            <Input
              label="Title"
              value={noticeData.title}
              onChange={(e) => setNoticeData({ ...noticeData, title: e.target.value })}
              required
              placeholder="Notice title"
            />
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Content
              </label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                rows={6}
                value={noticeData.content}
                onChange={(e) => setNoticeData({ ...noticeData, content: e.target.value })}
                required
                placeholder="Notice content"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Category"
                value={noticeData.category}
                onChange={(e) => setNoticeData({ ...noticeData, category: e.target.value })}
                required
              >
                <option value="">Select Category</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
                ))}
              </Select>

              <Select
                label="Priority"
                value={noticeData.priority}
                onChange={(e) => setNoticeData({ ...noticeData, priority: e.target.value })}
              >
                {priorities.map(priority => (
                  <option key={priority} value={priority}>{priority.charAt(0).toUpperCase() + priority.slice(1)}</option>
                ))}
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Target Audience"
                value={noticeData.targetAudience.type}
                onChange={(e) => setNoticeData({ 
                  ...noticeData, 
                  targetAudience: { ...noticeData.targetAudience, type: e.target.value }
                })}
              >
                <option value="all">All Students</option>
                <option value="hostel">Specific Hostels</option>
                <option value="room">Specific Rooms</option>
              </Select>

              <Input
                label="Expiry Date (Optional)"
                type="date"
                value={noticeData.expiryDate}
                onChange={(e) => setNoticeData({ ...noticeData, expiryDate: e.target.value })}
              />
            </div>

            {noticeData.targetAudience.type === 'hostel' && (
              <Input
                label="Hostel Numbers (comma-separated)"
                value={noticeData.targetAudience.hostelNumbers.join(', ')}
                onChange={(e) => setNoticeData({ 
                  ...noticeData, 
                  targetAudience: { 
                    ...noticeData.targetAudience, 
                    hostelNumbers: e.target.value.split(',').map(h => h.trim()).filter(h => h)
                  }
                })}
                placeholder="e.g., H1, H2, H3"
              />
            )}

            {noticeData.targetAudience.type === 'room' && (
              <Input
                label="Room Numbers (comma-separated)"
                value={noticeData.targetAudience.roomNumbers.join(', ')}
                onChange={(e) => setNoticeData({ 
                  ...noticeData, 
                  targetAudience: { 
                    ...noticeData.targetAudience, 
                    roomNumbers: e.target.value.split(',').map(r => r.trim()).filter(r => r)
                  }
                })}
                placeholder="e.g., 101, 102, 201"
              />
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tags
              </label>
              <div className="space-y-2">
                {noticeData.tags.map((tag, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={tag}
                      onChange={(e) => updateTag(index, e.target.value)}
                      placeholder="Tag name"
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeTag(index)}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addTag}
                >
                  Add Tag
                </Button>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="pinned"
                  checked={noticeData.isPinned}
                  onChange={(e) => setNoticeData({ ...noticeData, isPinned: e.target.checked })}
                  className="rounded border-gray-300 text-black focus:ring-black"
                />
                <label htmlFor="pinned" className="text-sm text-gray-700">
                  Pin this notice
                </label>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="urgent"
                  checked={noticeData.isUrgent}
                  onChange={(e) => setNoticeData({ ...noticeData, isUrgent: e.target.checked })}
                  className="rounded border-gray-300 text-black focus:ring-black"
                />
                <label htmlFor="urgent" className="text-sm text-gray-700">
                  Mark as urgent
                </label>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" className="flex-1">
                {showEditModal ? 'Update Notice' : 'Create Notice'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowCreateModal(false);
                  setShowEditModal(false);
                  setSelectedNotice(null);
                  resetNoticeData();
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Modal>
      </motion.div>
    </Layout>
  );
};

export default AdminNotices;