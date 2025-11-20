import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { UserPlus, Upload, FileText, Check, AlertCircle, X } from 'lucide-react';
import Layout from '../../components/Layout';
import Card from '../../ui/Card';
import Button from '../../ui/Button';
import adminService from '../../services/adminService';
import toast from 'react-hot-toast';

const AdminStudents = () => {
    const [activeTab, setActiveTab] = useState('manual'); // manual | csv
    const [loading, setLoading] = useState(false);

    // Manual Form State
    const [formData, setFormData] = useState({
        email: '',
        name: '',
        branch: '',
        batch: '',
        phone: ''
    });

    // CSV State
    const [csvFile, setCsvFile] = useState(null);
    const [csvPreview, setCsvPreview] = useState([]);

    const handleManualSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await adminService.addStudent({
                ...formData,
                batch: Number(formData.batch)
            });
            toast.success('Student added successfully');
            setFormData({ email: '', name: '', branch: '', batch: '', phone: '' });
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to add student');
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
            const headers = lines[0].split(',').map(h => h.trim().toLowerCase());

            const students = [];
            for (let i = 1; i < lines.length; i++) {
                if (!lines[i].trim()) continue;
                const values = lines[i].split(',');
                const student = {};
                headers.forEach((header, index) => {
                    let value = values[index]?.trim();
                    if (header === 'batch') value = Number(value);
                    student[header] = value;
                });
                if (student.email) students.push(student);
            }
            setCsvPreview(students);
        };
        reader.readAsText(file);
    };

    const handleBulkUpload = async () => {
        if (csvPreview.length === 0) return;
        setLoading(true);
        try {
            const res = await adminService.bulkAddStudents(csvPreview);
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
                    <h1 className="text-4xl font-black mb-2">Manage Students</h1>
                    <p className="text-gray-600">Add students manually or import via CSV</p>
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
                            <UserPlus className="w-5 h-5" />
                            Add Single Student
                        </h2>
                        <form onSubmit={handleManualSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Email *</label>
                                    <input
                                        type="email"
                                        required
                                        className="w-full p-2 border rounded-lg"
                                        value={formData.email}
                                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                                        placeholder="student@vitbhopal.ac.in"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Name</label>
                                    <input
                                        type="text"
                                        className="w-full p-2 border rounded-lg"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="John Doe"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Branch *</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full p-2 border rounded-lg"
                                        value={formData.branch}
                                        onChange={e => setFormData({ ...formData, branch: e.target.value })}
                                        placeholder="CSE"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Batch *</label>
                                    <input
                                        type="number"
                                        required
                                        className="w-full p-2 border rounded-lg"
                                        value={formData.batch}
                                        onChange={e => setFormData({ ...formData, batch: e.target.value })}
                                        placeholder="2025"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Phone</label>
                                    <input
                                        type="tel"
                                        className="w-full p-2 border rounded-lg"
                                        value={formData.phone}
                                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                        placeholder="+91..."
                                    />
                                </div>
                            </div>
                            <div className="pt-4">
                                <Button type="submit" disabled={loading} className="w-full md:w-auto">
                                    {loading ? 'Adding...' : 'Add Student'}
                                </Button>
                            </div>
                        </form>
                    </Card>
                ) : (
                    <Card>
                        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <Upload className="w-5 h-5" />
                            Bulk Import
                        </h2>

                        <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center mb-6">
                            <input
                                type="file"
                                accept=".csv"
                                onChange={handleFileChange}
                                className="hidden"
                                id="csv-upload"
                            />
                            <label htmlFor="csv-upload" className="cursor-pointer flex flex-col items-center gap-2">
                                <FileText className="w-12 h-12 text-gray-400" />
                                <span className="font-bold text-lg">Click to upload CSV</span>
                                <span className="text-sm text-gray-500">Headers: email, name, branch, batch, phone</span>
                            </label>
                        </div>

                        {csvPreview.length > 0 && (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <p className="font-bold text-green-600 flex items-center gap-2">
                                        <Check className="w-4 h-4" />
                                        {csvPreview.length} students found
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

export default AdminStudents;
