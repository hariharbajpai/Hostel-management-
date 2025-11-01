import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bell, Heart, MessageSquare, Pin, Calendar, Filter, Search, Eye } from 'lucide-react';
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

const StudentNotices = () => {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedNotice, setSelectedNotice] = useState(null);
  const [filters, setFilters] = useState({
    category: '',
    priority: '',
    search: ''
  });

  const categories = [
    'general', 'academic', 'hostel', 'mess', 'events', 'maintenance', 'emergency'
  ];

  const priorities = ['low', 'medium', 'high', 'urgent'];

  useEffect(() => {
    loadNotices();
  }, [filters]);

  const loadNotices = async () => {
    try {
      setLoading(true);
      const data = await noticeService.getNotices(filters);
      setNotices(data.notices || []);
    } catch (error) {
      console.error('Failed to load notices:', error);
      toast.error('Failed to load notices');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (id) => {
    try {
      await noticeService.likeNotice(id);
      toast.success('Liked successfully');
      loadNotices();
    } catch (error) {
      console.error('Failed to like notice:', error);
      toast.error('Failed to like notice');
    }
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

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isExpired = (notice) => {
    return notice.expiryDate && new Date(notice.expiryDate) < new Date();
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

  // Separate pinned and regular notices
  const pinnedNotices = notices.filter(notice => notice.isPinned && !isExpired(notice));
  const regularNotices = notices.filter(notice => !notice.isPinned && !isExpired(notice));

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
            <h1 className="text-4xl font-black mb-2">Notice Board</h1>
            <p className="text-gray-600">Stay updated with the latest announcements</p>
          </div>
          <div className="flex items-center gap-2">
            <Bell className="w-6 h-6 text-gray-600" />
            <span className="text-sm text-gray-600">{notices.length} notices</span>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              placeholder="Search notices..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              icon={Search}
            />
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

        {/* Pinned Notices */}
        {pinnedNotices.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Pin className="w-5 h-5 text-yellow-600" />
              <h2 className="text-xl font-semibold">Pinned Notices</h2>
            </div>
            <div className="space-y-4">
              {pinnedNotices.map((notice) => (
                <motion.div
                  key={notice._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ y: -2 }}
                >
                  <Card 
                    className="cursor-pointer border-yellow-200 bg-yellow-50" 
                    onClick={() => setSelectedNotice(notice)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Pin className="w-4 h-4 text-yellow-600" />
                          <h3 className="text-lg font-semibold">{notice.title}</h3>
                          {getCategoryBadge(notice.category)}
                          {getPriorityBadge(notice.priority)}
                          {notice.isUrgent && (
                            <Badge variant="danger">URGENT</Badge>
                          )}
                        </div>
                        <p className="text-gray-600 mb-3 line-clamp-2">{notice.content}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>{formatDate(notice.publishedAt || notice.createdAt)}</span>
                          {notice.expiryDate && (
                            <>
                              <span>•</span>
                              <span>Expires: {formatDate(notice.expiryDate)}</span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Heart className="w-4 h-4" />
                          <span>{notice.likeCount || 0}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MessageSquare className="w-4 h-4" />
                          <span>{notice.commentCount || 0}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Eye className="w-4 h-4" />
                          <span>{notice.viewCount || 0}</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Regular Notices */}
        <div className="space-y-4">
          {pinnedNotices.length > 0 && (
            <h2 className="text-xl font-semibold">Recent Notices</h2>
          )}
          
          {regularNotices.length === 0 && pinnedNotices.length === 0 ? (
            <Card className="text-center py-12">
              <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">No notices found</h3>
              <p className="text-gray-500">There are no notices available at the moment.</p>
            </Card>
          ) : (
            regularNotices.map((notice) => (
              <motion.div
                key={notice._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -2 }}
              >
                <Card className="cursor-pointer" onClick={() => setSelectedNotice(notice)}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold">{notice.title}</h3>
                        {getCategoryBadge(notice.category)}
                        {getPriorityBadge(notice.priority)}
                        {notice.isUrgent && (
                          <Badge variant="danger">URGENT</Badge>
                        )}
                      </div>
                      <p className="text-gray-600 mb-3 line-clamp-2">{notice.content}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>{formatDate(notice.publishedAt || notice.createdAt)}</span>
                        {notice.expiryDate && (
                          <>
                            <span>•</span>
                            <span>Expires: {formatDate(notice.expiryDate)}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Heart className="w-4 h-4" />
                        <span>{notice.likeCount || 0}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageSquare className="w-4 h-4" />
                        <span>{notice.commentCount || 0}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        <span>{notice.viewCount || 0}</span>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))
          )}
        </div>

        {/* Notice Detail Modal */}
        {selectedNotice && (
          <Modal
            isOpen={!!selectedNotice}
            onClose={() => setSelectedNotice(null)}
            title="Notice Details"
            size="lg"
          >
            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  {selectedNotice.isPinned && <Pin className="w-5 h-5 text-yellow-600" />}
                  <h2 className="text-xl font-semibold">{selectedNotice.title}</h2>
                  {getCategoryBadge(selectedNotice.category)}
                  {getPriorityBadge(selectedNotice.priority)}
                  {selectedNotice.isUrgent && (
                    <Badge variant="danger">URGENT</Badge>
                  )}
                </div>
                
                <div className="prose max-w-none mb-6">
                  <p className="text-gray-700 whitespace-pre-wrap">{selectedNotice.content}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm bg-gray-50 p-4 rounded-lg">
                  <div>
                    <span className="font-medium">Published:</span>
                    <span className="ml-2">{formatDate(selectedNotice.publishedAt || selectedNotice.createdAt)}</span>
                  </div>
                  <div>
                    <span className="font-medium">Author:</span>
                    <span className="ml-2">{selectedNotice.author?.name || 'Admin'}</span>
                  </div>
                  {selectedNotice.expiryDate && (
                    <div>
                      <span className="font-medium">Expires:</span>
                      <span className="ml-2">{formatDate(selectedNotice.expiryDate)}</span>
                    </div>
                  )}
                  {selectedNotice.targetAudience?.hostelNumbers?.length > 0 && (
                    <div>
                      <span className="font-medium">Target Hostels:</span>
                      <span className="ml-2">{selectedNotice.targetAudience.hostelNumbers.join(', ')}</span>
                    </div>
                  )}
                </div>
              </div>

              {selectedNotice.tags && selectedNotice.tags.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedNotice.tags.map((tag, index) => (
                      <Badge key={index} variant="outline">#{tag}</Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center gap-4 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => handleLike(selectedNotice._id)}
                  className="flex items-center gap-2"
                >
                  <Heart className="w-4 h-4" />
                  Like ({selectedNotice.likeCount || 0})
                </Button>
                <div className="flex items-center gap-2 text-gray-500">
                  <MessageSquare className="w-4 h-4" />
                  <span>{selectedNotice.commentCount || 0} comments</span>
                </div>
                <div className="flex items-center gap-2 text-gray-500">
                  <Eye className="w-4 h-4" />
                  <span>{selectedNotice.viewCount || 0} views</span>
                </div>
              </div>
            </div>
          </Modal>
        )}
      </motion.div>
    </Layout>
  );
};

export default StudentNotices;