import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, User, Bed, Building } from 'lucide-react';
import Layout from '../../components/Layout';
import Card from '../../ui/Card';
import Button from '../../ui/Button';
import Badge from '../../ui/Badge';
import Loader from '../../ui/Loader';
import hostelService from '../../services/hostelService';
import toast from 'react-hot-toast';

const AdminApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    try {
      setLoading(true);
      const { applications } = await hostelService.listApplications();
      setApplications(applications);
    } catch (error) {
      console.error('Failed to load applications:', error);
      toast.error('Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const handleDecision = async (id, decision) => {
    if (!window.confirm(`Are you sure you want to ${decision} this application?`)) return;

    setProcessing(id);
    try {
      await hostelService.decideApplication(id, decision);
      toast.success(`Application ${decision}d successfully`);
      loadApplications(); // Reload list
    } catch (error) {
      console.error('Failed to process application:', error);
      toast.error(error.response?.data?.error || 'Failed to process application');
    } finally {
      setProcessing(null);
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      pending: 'warning',
      approved: 'success',
      rejected: 'error',
    };
    return <Badge variant={variants[status] || 'default'}>{status.toUpperCase()}</Badge>;
  };

  return (
    <Layout>
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-black mb-2">Applications</h1>
            <p className="text-gray-600">Manage student room change requests</p>
          </div>
          <Button onClick={loadApplications} variant="outline" size="sm">
            Refresh
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader size="lg" />
          </div>
        ) : applications.length === 0 ? (
          <Card>
            <div className="text-center py-8 text-gray-500">
              No pending applications found
            </div>
          </Card>
        ) : (
          <div className="space-y-4">
            {applications.map((app) => (
              <motion.div
                key={app._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card>
                  <div className="flex flex-col md:flex-row gap-6">
                    {/* Student Info */}
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-gray-100 rounded-full">
                            <User className="w-5 h-5 text-gray-600" />
                          </div>
                          <div>
                            <h3 className="font-bold text-lg">{app.name}</h3>
                            <p className="text-sm text-gray-600">{app.registrationNumber}</p>
                          </div>
                        </div>
                        {getStatusBadge(app.status)}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-xs text-gray-500 uppercase font-bold mb-1">Request Type</p>
                          <p className="font-medium capitalize">{app.type.replace('_', ' ')}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 uppercase font-bold mb-1">Reason</p>
                          <p className="text-sm text-gray-700">{app.reason}</p>
                        </div>
                      </div>

                      {/* Desired Changes */}
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-xs text-gray-500 uppercase font-bold mb-2">Desired Preferences</p>
                        <div className="flex flex-wrap gap-4">
                          {app.desiredSeater && (
                            <div className="flex items-center gap-2 text-sm">
                              <Bed className="w-4 h-4 text-gray-500" />
                              <span>{app.desiredSeater}-Seater</span>
                            </div>
                          )}
                          {app.desiredAC !== undefined && (
                            <div className="flex items-center gap-2 text-sm">
                              <Building className="w-4 h-4 text-gray-500" />
                              <span>{app.desiredAC ? 'AC' : 'Non-AC'}</span>
                            </div>
                          )}
                          {app.desiredHostel && (
                            <div className="flex items-center gap-2 text-sm">
                              <HomeIcon className="w-4 h-4 text-gray-500" />
                              <span>Hostel: {app.desiredHostel}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Student Traits */}
                      {app.traits && app.traits.length > 0 && (
                        <div className="mt-4">
                          <p className="text-xs text-gray-500 uppercase font-bold mb-2">Student Traits</p>
                          <div className="flex flex-wrap gap-2">
                            {app.traits.map((trait, i) => (
                              <span key={i} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full font-medium">
                                {trait}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    {app.status === 'pending' && (
                      <div className="flex md:flex-col justify-center gap-2 border-t md:border-t-0 md:border-l pt-4 md:pt-0 md:pl-6">
                        <Button
                          onClick={() => handleDecision(app._id, 'approve')}
                          disabled={processing === app._id}
                          className="w-full bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Approve
                        </Button>
                        <Button
                          onClick={() => handleDecision(app._id, 'reject')}
                          disabled={processing === app._id}
                          variant="outline"
                          className="w-full border-red-200 text-red-600 hover:bg-red-50"
                        >
                          <XCircle className="w-4 h-4" />
                          Reject
                        </Button>
                      </div>
                    )}
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

// Simple Home Icon component since lucide-react might not export HomeIcon specifically or I missed it
const HomeIcon = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

export default AdminApplications;
