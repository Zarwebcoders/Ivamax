import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bell, Megaphone, Sparkles, Plus, Edit2, Trash2, ToggleLeft, ToggleRight, Loader } from 'lucide-react';
import { announcementService } from '../../services/announcement.service';
import toast from 'react-hot-toast';

const AnnouncementManagement = () => {
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        type: 'announcement',
        title: '',
        message: '',
        priority: 1
    });

    useEffect(() => {
        fetchAnnouncements();
    }, []);

    const fetchAnnouncements = async () => {
        try {
            const response = await announcementService.getAllAnnouncements();
            if (response.success) {
                setAnnouncements(response.data);
            }
        } catch (error) {
            toast.error('Failed to fetch announcements');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            if (editingId) {
                await announcementService.updateAnnouncement(editingId, formData);
                toast.success('Announcement updated successfully');
            } else {
                await announcementService.createAnnouncement(formData);
                toast.success('Announcement created successfully');
            }
            
            resetForm();
            fetchAnnouncements();
        } catch (error) {
            toast.error(error.message || 'Failed to save announcement');
        }
    };

    const handleEdit = (announcement) => {
        setFormData({
            type: announcement.type,
            title: announcement.title,
            message: announcement.message,
            priority: announcement.priority
        });
        setEditingId(announcement._id);
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this announcement?')) return;
        
        try {
            await announcementService.deleteAnnouncement(id);
            toast.success('Announcement deleted successfully');
            fetchAnnouncements();
        } catch (error) {
            toast.error('Failed to delete announcement');
        }
    };

    const handleToggle = async (id) => {
        try {
            await announcementService.toggleAnnouncementStatus(id);
            toast.success('Status updated successfully');
            fetchAnnouncements();
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    const resetForm = () => {
        setFormData({
            type: 'announcement',
            title: '',
            message: '',
            priority: 1
        });
        setEditingId(null);
        setShowForm(false);
    };

    const getTypeConfig = (type) => {
        const configs = {
            news: { icon: Bell, color: 'blue', label: 'NEWS' },
            announcement: { icon: Megaphone, color: 'purple', label: 'ANNOUNCEMENT' },
            update: { icon: Sparkles, color: 'green', label: 'UPDATE' }
        };
        return configs[type] || configs.announcement;
    };

    return (
        <div className="space-y-6">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl p-6 text-white"
            >
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Announcement Management</h1>
                        <p className="text-sm text-purple-100 mt-1">Manage news, announcements, and updates</p>
                    </div>
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="bg-white text-purple-600 px-6 py-3 rounded-lg font-bold hover:shadow-lg transition-all flex items-center gap-2"
                    >
                        <Plus size={20} />
                        {showForm ? 'Cancel' : 'New Announcement'}
                    </button>
                </div>
            </motion.div>

            {showForm && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="bg-white rounded-xl shadow-lg border-2 border-gray-200 p-6"
                >
                    <h2 className="text-xl font-bold text-gray-800 mb-4">
                        {editingId ? 'Edit Announcement' : 'Create New Announcement'}
                    </h2>
                    
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Type</label>
                            <select
                                value={formData.type}
                                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
                                required
                            >
                                <option value="news">News</option>
                                <option value="announcement">Announcement</option>
                                <option value="update">Update</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Title</label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                placeholder="Enter announcement title"
                                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
                                maxLength={100}
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Message</label>
                            <textarea
                                value={formData.message}
                                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                placeholder="Enter announcement message"
                                rows="4"
                                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none resize-none"
                                maxLength={500}
                                required
                            />
                            <p className="text-xs text-gray-500 mt-1">{formData.message.length}/500</p>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Priority (1-10)</label>
                            <input
                                type="number"
                                value={formData.priority}
                                onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })}
                                min="1"
                                max="10"
                                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
                                required
                            />
                        </div>

                        <div className="flex gap-3">
                            <button
                                type="submit"
                                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-lg font-bold hover:shadow-lg transition-all"
                            >
                                {editingId ? 'Update' : 'Create'} Announcement
                            </button>
                            <button
                                type="button"
                                onClick={resetForm}
                                className="px-6 py-3 border-2 border-gray-300 rounded-lg font-bold hover:bg-gray-50 transition-all"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </motion.div>
            )}

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-lg border-2 border-gray-200 p-6"
            >
                <h2 className="text-xl font-bold text-gray-800 mb-4">All Announcements</h2>
                
                {loading ? (
                    <div className="flex justify-center items-center py-12">
                        <Loader className="animate-spin text-purple-600" size={32} />
                    </div>
                ) : announcements.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                        <p>No announcements yet. Create your first one!</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {announcements.map((announcement) => {
                            const config = getTypeConfig(announcement.type);
                            const Icon = config.icon;
                            
                            return (
                                <div
                                    key={announcement._id}
                                    className="border-2 border-gray-200 rounded-xl p-4 hover:border-gray-400 transition-all"
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                                                    <Icon className="text-purple-600" size={16} />
                                                </div>
                                                <span className="text-xs font-bold text-purple-600 uppercase">
                                                    {config.label}
                                                </span>
                                                <span className="text-xs text-gray-400">
                                                    Priority: {announcement.priority}
                                                </span>
                                                <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                                                    announcement.isActive 
                                                        ? 'bg-green-100 text-green-700' 
                                                        : 'bg-gray-100 text-gray-700'
                                                }`}>
                                                    {announcement.isActive ? 'Active' : 'Inactive'}
                                                </span>
                                            </div>
                                            <h3 className="text-lg font-bold text-gray-800 mb-1">
                                                {announcement.title}
                                            </h3>
                                            <p className="text-sm text-gray-600">
                                                {announcement.message}
                                            </p>
                                            <p className="text-xs text-gray-400 mt-2">
                                                Created: {new Date(announcement.createdAt).toLocaleString()}
                                            </p>
                                        </div>
                                        
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleToggle(announcement._id)}
                                                className="p-2 hover:bg-gray-100 rounded-lg transition-all"
                                                title={announcement.isActive ? 'Deactivate' : 'Activate'}
                                            >
                                                {announcement.isActive ? (
                                                    <ToggleRight className="text-green-600" size={20} />
                                                ) : (
                                                    <ToggleLeft className="text-gray-400" size={20} />
                                                )}
                                            </button>
                                            <button
                                                onClick={() => handleEdit(announcement)}
                                                className="p-2 hover:bg-blue-50 rounded-lg transition-all"
                                                title="Edit"
                                            >
                                                <Edit2 className="text-blue-600" size={20} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(announcement._id)}
                                                className="p-2 hover:bg-red-50 rounded-lg transition-all"
                                                title="Delete"
                                            >
                                                <Trash2 className="text-red-600" size={20} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </motion.div>
        </div>
    );
};

export default AnnouncementManagement;
