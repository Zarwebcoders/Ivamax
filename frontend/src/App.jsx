import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { WalletProvider } from './context/WalletContext';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import BusinessDetails from './pages/BusinessDetails';
import TreeView from './pages/TreeView';
import Income from './pages/Income';
import IncomeOverview from './pages/IncomeOverview';
import Reports from './pages/Reports';
import Withdrawals from './pages/Withdrawals';
import Packages from './pages/Packages';
import Support from './pages/Support';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';
import WalletApprovals from './pages/admin/WalletApprovals';
import WithdrawalApprovals from './pages/admin/WithdrawalApprovals';
import DepositApprovals from './pages/admin/DepositApprovals';
import IncomeProcessing from './pages/admin/IncomeProcessing';
import AnnouncementManagement from './pages/admin/AnnouncementManagement';

// Layout
import DashboardLayout from './components/DashboardLayout';
import AdminLayout from './components/AdminLayout';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
    return (
        <Router>
            <AuthProvider>
                <WalletProvider>
                    <Routes>
                        {/* Public Routes */}
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/forgot-password" element={<ForgotPassword />} />

                        {/* Protected User Routes */}
                        <Route
                            path="/"
                            element={
                                <ProtectedRoute>
                                    <DashboardLayout />
                                </ProtectedRoute>
                            }
                        >
                            <Route index element={<Dashboard />} />
                            <Route path="profile" element={<Profile />} />
                            <Route path="business" element={<BusinessDetails />} />
                            <Route path="tree" element={<TreeView />} />
                            <Route path="income" element={<Income />} />
                            <Route path="reports" element={<Reports />} />
                            <Route path="withdrawals" element={<Withdrawals />} />
                            <Route path="packages" element={<Packages />} />
                            <Route path="support" element={<Support />} />
                        </Route>

                        {/* Protected Admin Routes */}
                        <Route
                            path="/admin"
                            element={
                                <ProtectedRoute adminOnly>
                                    <AdminLayout />
                                </ProtectedRoute>
                            }
                        >
                            <Route index element={<AdminDashboard />} />
                            <Route path="users" element={<UserManagement />} />
                            <Route path="wallet-approvals" element={<WalletApprovals />} />
                            <Route path="withdrawal-approvals" element={<WithdrawalApprovals />} />
                            <Route path="deposit-approvals" element={<DepositApprovals />} />
                            <Route path="income-processing" element={<IncomeProcessing />} />
                            <Route path="announcements" element={<AnnouncementManagement />} />
                        </Route>

                        {/* Catch all */}
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </WalletProvider>
            </AuthProvider>
        </Router>
    );
}

export default App;
