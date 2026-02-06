import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { FiUser, FiLock, FiEye, FiEyeOff, FiAlertCircle } from 'react-icons/fi';

const Login = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [formData, setFormData] = useState({
        userId: '',
        password: '',
        rememberMe: false,
    });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        // Normalize User ID: Uppercase if it looks like an ID, keep as-is if it looks like an email
        const isEmail = formData.userId.includes('@');
        const normalizedUserId = isEmail ? formData.userId.trim() : formData.userId.trim().toUpperCase();

        console.log('Attempting login with:', { userId: normalizedUserId }); // Debug log

        try {
            const response = await login({ userId: normalizedUserId, password: formData.password });
            console.log('Login successful:', response); // Debug log

            if (response.role === 'admin') {
                navigate('/admin');
            } else {
                navigate('/');
            }
        } catch (err) {
            console.error('Login error details:', err); // Detailed error log

            let errorMessage = 'Login failed. Please try again.';

            if (err.response) {
                // Server responded with a status code outside the 2xx range
                console.error('Server response data:', err.response.data);
                console.error('Server response status:', err.response.status);
                errorMessage = err.response.data?.message || `Server Error (${err.response.status})`;
            } else if (err.request) {
                // Request was made but no response was received
                console.error('No response received:', err.request);
                errorMessage = 'Cannot connect to server. Please check your internet connection or try again later.';
            } else {
                // Something happened in setting up the request
                console.error('Request setup error:', err.message);
                errorMessage = err.message;
            }

            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-400 flex items-center justify-center p-4 relative overflow-hidden">
            {/* dynamic background elements */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
                <div className="absolute -top-[20%] -left-[10%] w-[600px] h-[600px] bg-golden-100 rounded-full blur-[100px] opacity-30 animate-pulse"></div>
                <div className="absolute -bottom-[20%] -right-[10%] w-[600px] h-[600px] bg-golden-200 rounded-full blur-[120px] opacity-20 animate-pulse" style={{ animationDelay: '1s' }}></div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="w-full max-w-md relative z-10"
            >
                <div className="bg-white/80 backdrop-blur-xl border border-white/60 shadow-2xl rounded-3xl p-8 md:p-10 relative overflow-hidden">

                    {/* Top Decoration Line */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-golden-200 via-golden-500 to-golden-200"></div>

                    {/* Logo */}
                    <div className="text-center mb-10">
                        <div className="w-16 h-16 mx-auto bg-gradient-golden rounded-2xl flex items-center justify-center shadow-lg shadow-golden-500/30 mb-4 transform hover:rotate-6 transition-transform duration-300">
                            <span className="text-white font-bold text-3xl">IV</span>
                        </div>
                        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                            IVA<span className="text-golden-600">MAX</span>
                        </h1>
                        <p className="text-gray-500 mt-2 text-sm">Welcome back! Access your dashboard.</p>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="bg-red-50/80 border border-red-400 text-red-600 px-4 py-3 rounded-xl mb-6 flex items-start gap-3"
                        >
                            <FiAlertCircle className="mt-0.5 flex-shrink-0" />
                            <span className="text-sm font-medium">{error}</span>
                        </motion.div>
                    )}

                    {/* Login Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* User ID */}
                        <div className="group">
                            <label htmlFor="userId" className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">
                                User ID
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                    <FiUser className="text-golden-400 text-lg group-focus-within:text-golden-600 transition-colors" />
                                </div>
                                <input
                                    type="text"
                                    id="userId"
                                    name="userId"
                                    value={formData.userId}
                                    onChange={handleChange}
                                    className="w-full pl-11 pr-4 py-3.5 bg-gray-200 border border-gray-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-golden-400/50 focus:border-golden-400 focus:bg-white transition-all duration-300 text-gray-900 placeholder-gray-400 font-medium"
                                    placeholder="Enter your User ID"
                                    required
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div className="group">
                            <div className="flex items-center justify-between mb-1.5 ml-1">
                                <label htmlFor="password" className="block text-sm font-semibold text-gray-700">
                                    Password
                                </label>
                            </div>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                    <FiLock className="text-golden-400 text-lg group-focus-within:text-golden-600 transition-colors" />
                                </div>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    id="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="w-full pl-11 pr-12 py-3.5 bg-gray-200 border border-gray-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-golden-400/50 focus:border-golden-400 focus:bg-white transition-all duration-300 text-gray-900 placeholder-gray-400 font-medium"
                                    placeholder="Enter your password"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-golden-600 transition-colors p-1"
                                >
                                    {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                                </button>
                            </div>
                        </div>

                        {/* Remember Me & Forgot Password */}
                        <div className="flex items-center justify-between pt-1">
                            <label className="flex items-center cursor-pointer group">
                                <div className="relative flex items-center">
                                    <input
                                        type="checkbox"
                                        name="rememberMe"
                                        checked={formData.rememberMe}
                                        onChange={handleChange}
                                        className="peer h-4 w-4 rounded border-gray-300 text-golden-500 focus:ring-golden-500 transition-all cursor-pointer"
                                    />
                                </div>
                                <span className="ml-2.5 text-sm text-gray-600 group-hover:text-gray-900 transition-colors">Remember me</span>
                            </label>
                            <Link to="/forgot-password" className="text-sm font-semibold text-golden-600 hover:text-golden-700 transition-colors hover:underline">
                                Forgot Password?
                            </Link>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-gradient-golden text-white font-bold rounded-xl shadow-lg shadow-golden-500/30 hover:shadow-golden-500/50 transform hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    <span>Signing In...</span>
                                </>
                            ) : (
                                'Sign In'
                            )}
                        </button>
                    </form>

                    {/* Register Link */}
                    <div className="mt-8 text-center">
                        <p className="text-gray-500 text-sm">
                            Don't have an account?{' '}
                            <Link to="/register" className="text-golden-600 font-bold hover:text-golden-700 hover:underline transition-all">
                                Create Account
                            </Link>
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default Login;
