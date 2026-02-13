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
    const [isViewModalOpen, setIsViewModalOpen] = useState(false); // New state for view modal
    const [modalMode, setModalMode] = useState('create'); // 'create' or 'edit'
    const [selectedUser, setSelectedUser] = useState(null);
    const [viewUser, setViewUser] = useState(null); // New state for selected viewing user
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        mobile: '',
        password: '',
        confirmPassword: '',
        referralLink: '', // For create only
        placementSide: 'Left', // For create only
        rank: 'Member'
    });
    const [formError, setFormError] = useState('');
    const [submitLoading, setSubmitLoading] = useState(false);

    // Sponsor Search State
    const [sponsorSearch, setSponsorSearch] = useState('');
    const [sponsorOptions, setSponsorOptions] = useState([]);
    const [showSponsorDropdown, setShowSponsorDropdown] = useState(false);

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

    const handleSponsorSearch = async (query) => {
        setSponsorSearch(query);
        if (query.length > 1) {
            try {
                // Reuse getAllUsers but with search param and limit
                const response = await adminService.getAllUsers(1, 5, query);
                if (response.success) {
                    setSponsorOptions(response.data);
                    setShowSponsorDropdown(true);
                }
            } catch (error) {
                console.error("Error searching sponsors", error);
            }
        } else {
            setSponsorOptions([]);
            setShowSponsorDropdown(false);
        }
    };

    const selectSponsor = (user) => {
        setFormData({ ...formData, newSponsorId: user.userId });
        setSponsorSearch(`${user.fullName} (${user.userId})`);
        setShowSponsorDropdown(false);
    };

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

        // Determine initial placement selection based on user's actual position (placementSide)
        // detailed logic: if user is on Left, default to 'left' or 'placing-left' (preferred?).
        // User asked to select the option that is the user's position.
        // So if user.placementSide is 'Left', select 'left'. If 'Right', select 'right'.
        // We fallback to user.defaultPlacement if placementSide is missing.
        let initialPlacement = user.defaultPlacement || 'placing-left';
        if (user.placementSide) {
            initialPlacement = user.placementSide.toLowerCase(); // 'left' or 'right'
        }

        setFormData({
            fullName: user.fullName,
            email: user.email,
            mobile: user.mobile,
            password: '', // Leave blank if not changing
            confirmPassword: '',
            referralLink: '', // Not editable
            placementSide: user.placementSide || 'Left',
            rank: user.rank || 'Member',
            defaultPlacement: initialPlacement,
            newSponsorId: user.referralId || ''
        });
        setSponsorSearch(user.referralId || '');
        setFormError('');
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedUser(null);
    };

    const openViewModal = (user) => {
        setViewUser(user);
        setIsViewModalOpen(true);
    };

    const closeViewModal = () => {
        setIsViewModalOpen(false);
        setViewUser(null);
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

                // Derive placementSide from defaultPlacement for the move operation
                const placementSideDerived = (formData.defaultPlacement === 'right' || formData.defaultPlacement === 'placing-right') ? 'Right' : 'Left';

                const updateData = {
                    fullName: formData.fullName,
                    email: formData.email,
                    mobile: formData.mobile,
                    ...(formData.password && { password: formData.password }),
                    defaultPlacement: formData.defaultPlacement,
                    rank: formData.rank,
                    // Send newSponsorId Only if changed
                    newSponsorId: formData.newSponsorId !== selectedUser.referralId ? formData.newSponsorId : undefined,
                    placementSide: placementSideDerived
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

    const handleToggleStatus = async (user) => {
        if (window.confirm(`Are you sure you want to ${user.isActive ? 'deactivate' : 'activate'} ${user.fullName}?`)) {
            try {
                console.log('Sending toggle request for:', user._id);
                await adminService.toggleUserStatus(user._id);
                console.log('Toggle success, fetching users...');
                await fetchUsers(); // Refresh list
                alert(`User ${user.isActive ? 'deactivated' : 'activated'} successfully`);
            } catch (error) {
                console.error('Error toggling status:', error);
                alert(`Failed to update status: ${error.response?.data?.message || error.message}`);
            }
        }
    };

    return (
        <div className="space-y-6 relative">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="card p-6 flex flex-col md:flex-row justify-between items-center gap-4 shadow-lg shadow-gray-500 border border-gray-400"
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
                className="card overflow-hidden shadow-lg shadow-gray-500 border border-gray-400"
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
                                    <tr key={user._id} className="hover:bg-gray-300">
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
                                            <div className="flex items-center space-x-2">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                    {user.isActive ? 'Active' : 'Inactive'}
                                                </span>
                                                <button
                                                    onClick={() => handleToggleStatus(user)}
                                                    className={`relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-golden-500 ${user.isActive ? 'bg-green-500' : 'bg-gray-200'}`}
                                                >
                                                    <span className="sr-only">Use setting</span>
                                                    <span
                                                        aria-hidden="true"
                                                        className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200 ${user.isActive ? 'translate-x-5' : 'translate-x-0'}`}
                                                    ></span>
                                                </button>
                                            </div>
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
                                            <button
                                                onClick={() => openViewModal(user)}
                                                className="text-blue-600 hover:text-blue-900 mr-3"
                                            >
                                                View Data
                                            </button>
                                            {/* <button className="text-indigo-600 hover:text-indigo-900">View Tree</button> */}
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

            {/* Create/Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[200] overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
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

                                        {modalMode === 'edit' && (
                                            <div className="mt-4 border-t pt-4">
                                                <h4 className="text-sm font-semibold text-gray-900 mb-2">Settings & Status</h4>

                                                {/* Sponsor Change Section */}
                                                <div className="mb-4 relative">
                                                    <label className="block text-sm font-medium text-gray-700">Sponsor (Referral ID)</label>
                                                    <p className="text-xs text-gray-500 mb-1">Search to change sponsor & move user.</p>
                                                    <input
                                                        type="text"
                                                        value={sponsorSearch}
                                                        onChange={(e) => handleSponsorSearch(e.target.value)}
                                                        className="input w-full mt-1"
                                                        placeholder="Search by Name or ID..."
                                                        onFocus={() => sponsorSearch.length > 1 && setShowSponsorDropdown(true)}
                                                    />
                                                    {showSponsorDropdown && sponsorOptions.length > 0 && (
                                                        <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto mt-1">
                                                            {sponsorOptions.map(option => (
                                                                <div
                                                                    key={option._id}
                                                                    className="p-2 hover:bg-gray-100 cursor-pointer text-sm"
                                                                    onClick={() => selectSponsor(option)}
                                                                >
                                                                    <span className="font-semibold">{option.userId}</span> - {option.fullName}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="grid grid-cols-1 gap-4 mb-4">
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700">Rank</label>
                                                        <input
                                                            type="text"
                                                            name="rank"
                                                            value={formData.rank}
                                                            onChange={handleInputChange}
                                                            className="input w-full mt-1"
                                                            placeholder="e.g. Member, Silver, Gold"
                                                        />
                                                    </div>
                                                </div>



                                                <div className="mb-4">
                                                    <label className="block text-sm font-medium text-gray-700">Placement</label>
                                                    <p className="text-xs text-gray-500 mb-1">Select placement preference and position.</p>
                                                    <select
                                                        name="defaultPlacement"
                                                        value={formData.defaultPlacement || 'placing-left'}
                                                        onChange={handleInputChange}
                                                        className="input w-full mt-1"
                                                    >
                                                        <option value="placing-left">Placing Left</option>
                                                        <option value="placing-right">Placing Right</option>
                                                        <option value="left">Left</option>
                                                        <option value="right">Right</option>
                                                    </select>
                                                </div>
                                            </div>
                                        )}
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

            {/* View Full Details Modal */}
            {isViewModalOpen && viewUser && (
                <div className="fixed inset-0 z-[200] overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
                    <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={closeViewModal} aria-hidden="true"></div>
                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl w-full">
                            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="text-xl leading-6 font-bold text-gray-900" id="modal-title">
                                            User Details
                                        </h3>
                                        <p className="text-sm text-gray-500">
                                            Full database record for {viewUser.userId}
                                        </p>
                                    </div>
                                    <button onClick={closeViewModal} className="text-gray-400 hover:text-gray-500">
                                        <span className="text-2xl">&times;</span>
                                    </button>
                                </div>

                                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 text-sm">
                                    {/* Personal Info */}
                                    <div className="col-span-1 md:col-span-2">
                                        <h4 className="font-semibold text-golden-600 border-b pb-1 mb-2">Personal Information</h4>
                                        <div className="grid grid-cols-2 gap-2">
                                            <div className="col-span-2 text-xs text-gray-400">ObjectId: {viewUser._id}</div>
                                            <div><span className="font-medium text-gray-500">Full Name:</span> {viewUser.fullName}</div>
                                            <div><span className="font-medium text-gray-500">User ID:</span> {viewUser.userId}</div>
                                            <div><span className="font-medium text-gray-500">Email:</span> {viewUser.email}</div>
                                            <div><span className="font-medium text-gray-500">Mobile:</span> {viewUser.mobile}</div>
                                            <div><span className="font-medium text-gray-500">Role:</span> {viewUser.role}</div>
                                            <div>
                                                <span className="font-medium text-gray-500">Status:</span>
                                                <span className={`ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${viewUser.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                    {viewUser.isActive ? 'Active' : 'Inactive'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Security (Requested) */}
                                    <div className="col-span-1 md:col-span-2">
                                        <h4 className="font-semibold text-red-600 border-b pb-1 mb-2">Security & Access</h4>
                                        <div className="grid grid-cols-2 gap-2">
                                            <div><span className="font-medium text-gray-500">Plain Password:</span> <span className="font-mono bg-gray-100 px-1 rounded">{viewUser.plainPassword || 'N/A'}</span></div>
                                            <div><span className="font-medium text-gray-500">Email Verified:</span> {viewUser.isEmailVerified ? 'Yes' : 'No'}</div>
                                            <div className="col-span-2"><span className="font-medium text-gray-500">Wallet Address:</span> <span className="text-xs">{viewUser.walletAddress || 'Not Set'}</span></div>
                                        </div>
                                    </div>

                                    {/* Network & Placement */}
                                    <div className="col-span-1 border-r pr-2">
                                        <h4 className="font-semibold text-blue-600 border-b pb-1 mb-2">Network</h4>
                                        <div className="space-y-1">
                                            <div><span className="font-medium text-gray-500">Sponsor ID:</span> {viewUser.referralId || 'Root'}</div>
                                            <div><span className="font-medium text-gray-500">Placement Side:</span> {viewUser.placementSide || 'N/A'}</div>
                                            <div><span className="font-medium text-gray-500">Default Placement:</span> {viewUser.defaultPlacement || 'Default'}</div>
                                            <div className="text-xs truncate"><span className="font-medium text-gray-500">Ref Link:</span> {viewUser.referralLink || 'N/A'}</div>
                                        </div>
                                    </div>

                                    {/* Financials */}
                                    <div className="col-span-1 pl-2">
                                        <h4 className="font-semibold text-green-600 border-b pb-1 mb-2">Financials</h4>
                                        <div className="space-y-1">
                                            <div><span className="font-medium text-gray-500">Wallet Balance:</span> ${viewUser.walletBalance}</div>
                                            <div><span className="font-medium text-gray-500">Total Earnings:</span> ${viewUser.totalEarnings}</div>
                                            <div><span className="font-medium text-gray-500">Invested:</span> ${viewUser.investmentAmount}</div>
                                            <div><span className="font-medium text-gray-500">Inv Date:</span> {viewUser.investmentDate ? new Date(viewUser.investmentDate).toLocaleDateString() : 'N/A'}</div>
                                            <div><span className="font-medium text-gray-500">Package:</span> {viewUser.packageType || 'None'}</div>
                                        </div>
                                    </div>

                                    {/* Ranks */}
                                    <div className="col-span-1 md:col-span-2">
                                        <h4 className="font-semibold text-purple-600 border-b pb-1 mb-2">Rank & Performance</h4>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                            <div><span className="font-medium text-gray-500">Current Rank:</span> {viewUser.rank}</div>
                                            <div><span className="font-medium text-gray-500">Closing Rank:</span> {viewUser.closingRank}</div>
                                            <div><span className="font-medium text-gray-500">Royalty %:</span> {viewUser.royaltyPercentage}%</div>
                                            <div><span className="font-medium text-gray-500">Monthly Income:</span> ${viewUser.monthlyIncome}</div>
                                        </div>
                                    </div>

                                    {/* Timestamps */}
                                    <div className="col-span-1 md:col-span-2 text-xs text-gray-400 border-t pt-2 mt-2">
                                        <div className="grid grid-cols-2">
                                            <div>Reg Date: {new Date(viewUser.registrationDate || viewUser.createdAt).toLocaleString()}</div>
                                            <div>Last Updated: {new Date(viewUser.updatedAt).toLocaleString()}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                <button
                                    type="button"
                                    onClick={closeViewModal}
                                    className="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserManagement;
