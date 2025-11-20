import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, CheckCircle } from 'lucide-react';
import Layout from '../../components/Layout';
import Card from '../../ui/Card';
import Button from '../../ui/Button';
import Select from '../../ui/Select';
import Loader from '../../ui/Loader';
import hostelService from '../../services/hostelService';
import toast from 'react-hot-toast';

const TRAITS_LIST = [
  "Early Riser", "Night Owl", "Studious", "Gamer",
  "Sports Enthusiast", "Music Lover", "Artist", "Social Butterfly",
  "Introvert", "Clean Freak", "Foodie", "Techie"
];

const StudentPreferences = () => {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [availableHostels, setAvailableHostels] = useState([]);
  const [formData, setFormData] = useState({
    foodPreference: 'vegetarian',
    preferredSeater: 2,
    preferredAC: false,
    preferredHostels: [],
    preferredBlock: '',
    amenities: {
      largeDining: false,
      extraFacilities: false,
    },
    traits: []
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [profileData, hostelsData] = await Promise.all([
        hostelService.getProfile(),
        hostelService.getHostelNames()
      ]);

      setAvailableHostels(hostelsData.hostels || []);

      const profile = profileData.profile;
      if (profile) {
        setFormData({
          foodPreference: profile.foodPreference || 'vegetarian',
          preferredSeater: profile.preferredSeater || 2,
          preferredAC: profile.preferredAC || false,
          preferredHostels: profile.preferredHostels || [],
          preferredBlock: profile.preferredBlock || '',
          amenities: profile.amenities || { largeDining: false, extraFacilities: false },
          traits: profile.traits || []
        });
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await hostelService.setPreferences(formData);
      toast.success('Preferences saved successfully!');
    } catch (error) {
      console.error('Failed to save preferences:', error);
      toast.error(error.response?.data?.error || 'Failed to save preferences');
    } finally {
      setSubmitting(false);
    }
  };

  const handleHostelToggle = (hostel) => {
    setFormData((prev) => ({
      ...prev,
      preferredHostels: prev.preferredHostels.includes(hostel)
        ? prev.preferredHostels.filter((h) => h !== hostel)
        : [...prev.preferredHostels, hostel],
    }));
  };

  const handleTraitToggle = (trait) => {
    setFormData((prev) => ({
      ...prev,
      traits: prev.traits.includes(trait)
        ? prev.traits.filter((t) => t !== trait)
        : [...prev.traits, trait],
    }));
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete your preferences? This action cannot be undone.')) return;
    setSubmitting(true);
    try {
      await hostelService.deletePreferences();
      toast.success('Preferences deleted successfully');
      setFormData({
        foodPreference: 'vegetarian',
        preferredSeater: 2,
        preferredAC: false,
        preferredHostels: [],
        preferredBlock: '',
        amenities: { largeDining: false, extraFacilities: false },
        traits: []
      });
    } catch (error) {
      console.error('Failed to delete preferences:', error);
      toast.error(error.response?.data?.error || 'Failed to delete preferences');
    } finally {
      setSubmitting(false);
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
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-black mb-2">Room Preferences</h1>
            <p className="text-gray-600">Configure your hostel room preferences</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <Card>
              <h2 className="text-2xl font-bold mb-6">Basic Preferences</h2>

              <div className="space-y-4">
                <Select
                  label="Food Preference"
                  value={formData.foodPreference}
                  onChange={(e) => setFormData({ ...formData, foodPreference: e.target.value })}
                  options={[
                    { value: 'vegetarian', label: 'Vegetarian' },
                    { value: 'non_vegetarian', label: 'Non-Vegetarian' },
                    { value: 'jain', label: 'Jain' },
                  ]}
                />

                <Select
                  label="Preferred Seater"
                  value={formData.preferredSeater}
                  onChange={(e) => setFormData({ ...formData, preferredSeater: Number(e.target.value) })}
                  options={[
                    { value: 1, label: '1-Seater' },
                    { value: 2, label: '2-Seater' },
                    { value: 3, label: '3-Seater' },
                    { value: 4, label: '4-Seater' },
                    { value: 6, label: '6-Seater' },
                    { value: 8, label: '8-Seater' },
                  ]}
                />

                <Select
                  label="AC Preference"
                  value={formData.preferredAC.toString()}
                  onChange={(e) => setFormData({ ...formData, preferredAC: e.target.value === 'true' })}
                  options={[
                    { value: 'false', label: 'Non-AC' },
                    { value: 'true', label: 'AC' },
                  ]}
                />

                <Select
                  label="Block Type"
                  value={formData.preferredBlock}
                  onChange={(e) => setFormData({ ...formData, preferredBlock: e.target.value })}
                  options={[
                    { value: '', label: 'No Preference' },
                    { value: 'normal', label: 'Normal Block' },
                    { value: 'premium', label: 'Premium Block' },
                  ]}
                />
              </div>
            </Card>

            <Card>
              <h2 className="text-2xl font-bold mb-6">Hostel Preferences</h2>
              <p className="text-sm text-gray-600 mb-4">Select your preferred hostels (optional)</p>

              {availableHostels.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {availableHostels.map((h) => (
                    <motion.button
                      key={h}
                      type="button"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleHostelToggle(h)}
                      className={`p-4 rounded-lg border-2 font-semibold transition-all ${formData.preferredHostels.includes(h)
                          ? 'bg-black text-white border-black'
                          : 'bg-white border-gray-300 hover:border-gray-400'
                        }`}
                    >
                      {typeof h === 'number' ? `Hostel ${h}` : h}
                    </motion.button>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 italic">No hostels available yet.</p>
              )}
            </Card>

            <Card>
              <h2 className="text-2xl font-bold mb-6">Traits & Hobbies</h2>
              <p className="text-sm text-gray-600 mb-4">Select traits to help us find compatible roommates</p>

              <div className="flex flex-wrap gap-2">
                {TRAITS_LIST.map((trait) => (
                  <button
                    key={trait}
                    type="button"
                    onClick={() => handleTraitToggle(trait)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${formData.traits.includes(trait)
                        ? 'bg-black text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                  >
                    {trait}
                  </button>
                ))}
              </div>
            </Card>

            <Card>
              <h2 className="text-2xl font-bold mb-6">Amenities</h2>

              <div className="space-y-4">
                <label className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                  <input
                    type="checkbox"
                    checked={formData.amenities.largeDining}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        amenities: { ...formData.amenities, largeDining: e.target.checked },
                      })
                    }
                    className="w-5 h-5 accent-black"
                  />
                  <div>
                    <p className="font-semibold">Large Dining Hall</p>
                    <p className="text-sm text-gray-600">Prefer hostels with large dining facilities</p>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                  <input
                    type="checkbox"
                    checked={formData.amenities.extraFacilities}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        amenities: { ...formData.amenities, extraFacilities: e.target.checked },
                      })
                    }
                    className="w-5 h-5 accent-black"
                  />
                  <div>
                    <p className="font-semibold">Extra Facilities</p>
                    <p className="text-sm text-gray-600">Prefer hostels with additional amenities</p>
                  </div>
                </label>
              </div>
            </Card>

            <div className="flex gap-4">
              <Button type="button" onClick={handleDelete} disabled={submitting} variant="outline" className="flex-1 border-red-500 text-red-500 hover:bg-red-50">
                Delete Preferences
              </Button>
              <Button type="submit" loading={submitting} className="flex-1">
                <Save className="w-5 h-5" />
                Save Preferences
              </Button>
            </div>
          </form>
        </div>
      </motion.div>
    </Layout>
  );
};

export default StudentPreferences;
