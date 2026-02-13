import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import adminService from '../../services/admin.service';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        pages: 1
    });
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('create'); // 'create' or 'edit'
    const [selectedUser, setSelectedUser] = useState(null);
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        mobile: '',
        password: '',
        confirmPassword: '',
        referralLink: '', // For create only
        placementSide: 'Left' // For create only
    });
    const [formError, setFormError] = useState('');
    const [submitLoading, setSubmitLoading] = useState(false);

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
            setPagination(prev => ({ ...prev, page: 1 })); // Reset to page 1 on search
        }, 500);

        return () => clearTimeout(timer);
    }, [search]);

    useEffect(() => {
        fetchUsers();
    }, [pagination.page, debouncedSearch]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const response = await adminService.getAllUsers(
                pagination.page,
                pagination.limit,
                debouncedSearch
            );

            if (response.success) {
                setUsers(response.data);
                setPagination(prev => ({
                    ...prev,
                    ...response.pagination
                }));
            }
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= pagination.pages) {
            setPagination(prev => ({ ...prev, page: newPage }));
        }
    };

    const openCreateModal = () => {
        setModalMode('create');
        setFormData({
            fullName: '',
            email: '',
            mobile: '',
            password: '',
            confirmPassword: '',
            referralLink: '',
            placementSide: 'Left'
        });
        setFormError('');
        setIsModalOpen(true);
    };

    const openEditModal = (user) => {
        setModalMode('edit');
        setSelectedUser(user);
        setFormData({
            fullName: user.fullName,
            email: user.email,
            mobile: user.mobile,
            password: '', // Leave blank if not changing
            confirmPassword: '',
            referralLink: '', // Not editable
            placementSide: '' // Not editable
        });
        setFormError('');
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedUser(null);
    };

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormError('');
        setSubmitLoading(true);

        try {
            if (modalMode === 'create') {
                if (formData.password !== formData.confirmPassword) {
                    throw new Error("Passwords do not match");
                }
                if (!formData.password) {
                    throw new Error("Password is required");
                }

                const response = await adminService.createUser(formData);
                if (response.success) {
                    alert('User created successfully!');
                    closeModal();
                    fetchUsers();
                }
            } else {
                // Edit Mode
                if (formData.password && formData.password !== formData.confirmPassword) {
                    throw new Error("Passwords do not match");
                }

                const updateData = {
                    fullName: formData.fullName,
                    email: formData.email,
                    mobile: formData.mobile,
                    ...(formData.password && { password: formData.password })
                };

                const response = await adminService.updateUser(selectedUser._id, updateData);
                if (response.success) {
                    alert('User updated successfully!');
                    closeModal();
                    fetchUsers();
                }
            }
        } catch (error) {
            console.error('Submit Error:', error);
            setFormError(error.response?.data?.message || error.message || 'Operation failed');
        } finally {
            setSubmitLoading(false);
        }
    };

    return (
        <div className="space-y-6 relative">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="card p-6 flex flex-col md:flex-row justify-between items-center gap-4"
            >
                <div>
                    <h1 className="text-2xl font-bold gradient-text">User Management</h1>
                    <p className="text-text-tertiary">View and manage all registered users</p>
                </div>

                <div className="flex flex-col md:flex-row gap-4 items-center w-full md:w-auto">
                    <div className="relative w-full md:w-auto">
                        <input
                            type="text"
                            placeholder="Search by name, email, or ID..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="input pl-10 w-full md:w-64"
                        />
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                            🔍
                        </span>
                    </div>
                    <button
                        onClick={openCreateModal}
                        className="btn btn-primary whitespace-nowrap"
                    >
                        + Create User
                    </button>
                </div>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="card overflow-hidden"
            >
                <div className="overflow-x-auto">
                    <table className="table w-full">
                        <thead>
                            <tr>
                                <th className="px-6 py-4 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User Info</th>
                                <th className="px-6 py-4 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                                <th className="px-6 py-4 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
                                <th className="px-6 py-4 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                                <th className="px-6 py-4 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center">
                                        <div className="flex justify-center">
                                            <div className="spinner h-8 w-8"></div>
                                        </div>
                                    </td>
                                </tr>
                            ) : users.length > 0 ? (
                                users.map((user) => (
                                    <tr key={user._id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="h-10 w-10 flex-shrink-0">
                                                    <div className="h-10 w-10 rounded-full bg-golden-100 flex items-center justify-center text-golden-600 font-bold">
                                                        {user.fullName.charAt(0).toUpperCase()}
                                                    </div>
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">{user.fullName}</div>
                                                    <div className="text-sm text-gray-500">{user.userId}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{user.email}</div>
                                            <div className="text-sm text-gray-500">{user.mobile}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                                {user.rank || 'Member'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                {user.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(user.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <button
                                                onClick={() => openEditModal(user)}
                                                className="text-golden-600 hover:text-golden-900 mr-3"
                                            >
                                                Edit
                                            </button>
                                            <button className="text-indigo-600 hover:text-indigo-900">View Tree</button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                                        No users found matching your search.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                    <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                        <div>
                            <p className="text-sm text-gray-700">
                                Showing <span className="font-medium">{(pagination.page - 1) * pagination.limit + 1}</span> to <span className="font-medium">{Math.min(pagination.page * pagination.limit, pagination.total)}</span> of <span className="font-medium">{pagination.total}</span> results
                            </p>
                        </div>
                        <div>
                            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                                <button
                                    onClick={() => handlePageChange(pagination.page - 1)}
                                    disabled={pagination.page === 1}
                                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Previous
                                </button>
                                {[...Array(pagination.pages)].map((_, i) => (
                                    <button
                                        key={i + 1}
                                        onClick={() => handlePageChange(i + 1)}
                                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${pagination.page === i + 1
                                            ? 'z-10 bg-golden-50 border-golden-500 text-golden-600'
                                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                            }`}
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                                <button
                                    onClick={() => handlePageChange(pagination.page + 1)}
                                    disabled={pagination.page === pagination.pages}
                                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Next
                                </button>
                            </nav>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
                    <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={closeModal} aria-hidden="true"></div>
                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg w-full">
                            <form onSubmit={handleSubmit}>
                                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                    <div className="mb-4">
                                        <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                                            {modalMode === 'create' ? 'Create New User' : 'Edit User'}
                                        </h3>
                                        <p className="text-sm text-gray-500 mt-1">
                                            {modalMode === 'create' ? 'Add a new user to the system.' : `Editing details for ${selectedUser?.userId}`}
                                        </p>
                                    </div>

                                    {formError && (
                                        <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4">
                                            <p className="text-sm text-red-700">{formError}</p>
                                        </div>
                                    )}

                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Full Name *</label>
                                            <input
                                                type="text"
                                                name="fullName"
                                                required
                                                value={formData.fullName}
                                                onChange={handleInputChange}
                                                className="input w-full mt-1"
                                                placeholder="Enter full name"
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Mobile Number *</label>
                                                <input
                                                    type="text"
                                                    name="mobile"
                                                    required
                                                    value={formData.mobile}
                                                    onChange={handleInputChange}
                                                    className="input w-full mt-1"
                                                    placeholder="Enter mobile"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Email Address *</label>
                                                <input
                                                    type="email"
                                                    name="email"
                                                    required
                                                    value={formData.email}
                                                    onChange={handleInputChange}
                                                    className="input w-full mt-1"
                                                    placeholder="Enter email"
                                                />
                                            </div>
                                        </div>

                                        {modalMode === 'create' && (
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700">Referral ID (Optional)</label>
                                                    <input
                                                        type="text"
                                                        name="referralLink"
                                                        value={formData.referralLink}
                                                        onChange={handleInputChange}
                                                        className="input w-full mt-1"
                                                        placeholder="Sponsor ID (e.g. IVA...)"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700">Placement</label>
                                                    <select
                                                        name="placementSide"
                                                        value={formData.placementSide}
                                                        onChange={handleInputChange}
                                                        className="input w-full mt-1"
                                                    >
                                                        <option value="Left">Left</option>
                                                        <option value="Right">Right</option>
                                                        <option value="placing-left">Extreme Left</option>
                                                        <option value="placing-right">Extreme Right</option>
                                                    </select>
                                                </div>
                                            </div>
                                        )}

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">
                                                    {modalMode === 'edit' ? 'New Password (Optional)' : 'Password *'}
                                                </label>
                                                <input
                                                    type="password"
                                                    name="password"
                                                    required={modalMode === 'create'}
                                                    value={formData.password}
                                                    onChange={handleInputChange}
                                                    className="input w-full mt-1"
                                                    placeholder={modalMode === 'edit' ? "Leave blank to keep" : "Create password"}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">
                                                    Confirm Password {modalMode === 'create' && '*'}
                                                </label>
                                                <input
                                                    type="password"
                                                    name="confirmPassword"
                                                    required={modalMode === 'create' || formData.password.length > 0}
                                                    value={formData.confirmPassword}
                                                    onChange={handleInputChange}
                                                    className="input w-full mt-1"
                                                    placeholder="Confirm password"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                    <button
                                        type="submit"
                                        disabled={submitLoading}
                                        className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-golden-600 text-base font-medium text-white hover:bg-golden-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-golden-500 sm:ml-3 sm:w-auto sm:text-sm ${submitLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    >
                                        {submitLoading ? 'Processing...' : (modalMode === 'create' ? 'Create Account' : 'Save Changes')}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={closeModal}
                                        className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserManagement;
