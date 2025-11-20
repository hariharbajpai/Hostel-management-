import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Building, Upload, FileText, Check, Plus } from 'lucide-react';
import Layout from '../../components/Layout';
import Card from '../../ui/Card';
import Button from '../../ui/Button';
import hostelService from '../../services/hostelService';
import toast from 'react-hot-toast';

const AdminRooms = () => {
  const [activeTab, setActiveTab] = useState('manual'); // manual | csv
  const [loading, setLoading] = useState(false);

  // Manual Form State
  const [formData, setFormData] = useState({
    hostelName: '',
    hostelNumber: '',
    roomLabel: '',
    blockType: 'normal',
    seater: '2',
    ac: 'false',
    capacity: '',
    largeDining: false,
    extraFacilities: false
  });

  // CSV State
  const [csvFile, setCsvFile] = useState(null);
  const [csvPreview, setCsvPreview] = useState([]);

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...formData,
        seater: Number(formData.seater),
        ac: formData.ac === 'true',
        capacity: formData.capacity ? Number(formData.capacity) : Number(formData.seater),
        amenities: {
          largeDining: formData.largeDining,
          extraFacilities: formData.extraFacilities
        }
      };

      // Handle hostel identifier
      if (formData.hostelNumber) payload.hostelNumber = Number(formData.hostelNumber);
      if (formData.hostelName) payload.hostelName = formData.hostelName;

      await hostelService.upsertRoom(payload);
      toast.success('Room added successfully');
      setFormData({ ...formData, roomLabel: '' }); // Reset label only for quick add
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to add room');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCsvFile(file);
      parseCSV(file);
    }
  };

  const parseCSV = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      const lines = text.split('\n');
      const headers = lines[0].split(',').map(h => h.trim());

      const rooms = [];
      for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;
        const values = lines[i].split(',');
        const room = {};
        headers.forEach((header, index) => {
          let value = values[index]?.trim();
          if (['seater', 'capacity', 'hostelNumber'].includes(header)) value = Number(value);
          if (['ac', 'largeDining', 'extraFacilities'].includes(header)) value = value?.toLowerCase() === 'true';
          room[header] = value;
        });

        // Construct amenities object if flattened in CSV
        if (room.largeDining !== undefined || room.extraFacilities !== undefined) {
          room.amenities = {
            largeDining: !!room.largeDining,
            extraFacilities: !!room.extraFacilities
          };
          delete room.largeDining;
          delete room.extraFacilities;
        }

        rooms.push(room);
      }
      setCsvPreview(rooms);
    };
    reader.readAsText(file);
  };

  const handleBulkUpload = async () => {
    if (csvPreview.length === 0) return;
    setLoading(true);
    try {
      const res = await hostelService.bulkAddRooms(csvPreview);
      toast.success(`Processed: ${res.results.added} added, ${res.results.failed} failed`);
      if (res.results.failed > 0) {
        console.error('Failed items:', res.results.errors);
        toast.error('Check console for failed items');
      }
      setCsvFile(null);
      setCsvPreview([]);
    } catch (error) {
      toast.error('Bulk upload failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-4xl font-black mb-2">Room Management</h1>
          <p className="text-gray-600">Add rooms manually or import via CSV</p>
        </div>

        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab('manual')}
            className={`px-6 py-2 rounded-full font-bold transition-colors ${activeTab === 'manual' ? 'bg-black text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
          >
            Manual Entry
          </button>
          <button
            onClick={() => setActiveTab('csv')}
            className={`px-6 py-2 rounded-full font-bold transition-colors ${activeTab === 'csv' ? 'bg-black text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
          >
            CSV Import
          </button>
        </div>

        {activeTab === 'manual' ? (
          <Card>
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Add Single Room
            </h2>
            <form onSubmit={handleManualSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Hostel Name</label>
                  <input
                    type="text"
                    className="w-full p-2 border rounded-lg"
                    value={formData.hostelName}
                    onChange={e => setFormData({ ...formData, hostelName: e.target.value })}
                    placeholder="e.g. Phoenix"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Hostel Number (Optional)</label>
                  <input
                    type="number"
                    min="1"
                    max="8"
                    className="w-full p-2 border rounded-lg"
                    value={formData.hostelNumber}
                    onChange={e => setFormData({ ...formData, hostelNumber: e.target.value })}
                    placeholder="1-8"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Room Label *</label>
                  <input
                    type="text"
                    required
                    className="w-full p-2 border rounded-lg"
                    value={formData.roomLabel}
                    onChange={e => setFormData({ ...formData, roomLabel: e.target.value })}
                    placeholder="e.g. H1-101"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Block Type *</label>
                  <select
                    className="w-full p-2 border rounded-lg"
                    value={formData.blockType}
                    onChange={e => setFormData({ ...formData, blockType: e.target.value })}
                  >
                    <option value="normal">Normal</option>
                    <option value="premium">Premium</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Seater *</label>
                  <select
                    className="w-full p-2 border rounded-lg"
                    value={formData.seater}
                    onChange={e => setFormData({ ...formData, seater: e.target.value })}
                  >
                    {[1, 2, 3, 4, 6, 8].map(n => (
                      <option key={n} value={n}>{n} Seater</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">AC *</label>
                  <select
                    className="w-full p-2 border rounded-lg"
                    value={formData.ac}
                    onChange={e => setFormData({ ...formData, ac: e.target.value })}
                  >
                    <option value="false">Non-AC</option>
                    <option value="true">AC</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.largeDining}
                    onChange={e => setFormData({ ...formData, largeDining: e.target.checked })}
                  />
                  <span>Large Dining Access</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.extraFacilities}
                    onChange={e => setFormData({ ...formData, extraFacilities: e.target.checked })}
                  />
                  <span>Extra Facilities</span>
                </label>
              </div>

              <div className="pt-4">
                <Button type="submit" disabled={loading} className="w-full md:w-auto">
                  {loading ? 'Adding...' : 'Add Room'}
                </Button>
              </div>
            </form>
          </Card>
        ) : (
          <Card>
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Bulk Import Rooms
            </h2>

            <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center mb-6">
              <input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="hidden"
                id="csv-upload-rooms"
              />
              <label htmlFor="csv-upload-rooms" className="cursor-pointer flex flex-col items-center gap-2">
                <FileText className="w-12 h-12 text-gray-400" />
                <span className="font-bold text-lg">Click to upload CSV</span>
                <span className="text-sm text-gray-500">Headers: hostelName, roomLabel, blockType, seater, ac, largeDining...</span>
              </label>
            </div>

            {csvPreview.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="font-bold text-green-600 flex items-center gap-2">
                    <Check className="w-4 h-4" />
                    {csvPreview.length} rooms found
                  </p>
                  <Button onClick={handleBulkUpload} disabled={loading}>
                    {loading ? 'Uploading...' : 'Import All'}
                  </Button>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg max-h-60 overflow-y-auto text-sm">
                  <pre>{JSON.stringify(csvPreview.slice(0, 3), null, 2)}</pre>
                  {csvPreview.length > 3 && <p className="text-gray-500 mt-2">...and {csvPreview.length - 3} more</p>}
                </div>
              </div>
            )}
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default AdminRooms;
