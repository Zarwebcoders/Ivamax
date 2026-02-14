import { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Eye, EyeOff } from 'lucide-react';

const Register = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { register, logout } = useAuth();

    // Parse URL Params using useLocation which is reactive to router changes
    const getUrlParams = () => {
        const params = new URLSearchParams(location.search);
        return {
            ref: params.get('ref'),
            position: params.get('position')
        };
    };

    const [formData, setFormData] = useState({
        fullName: '',
        mobile: '',
        email: '',
        password: '',
        confirmPassword: '',
        referralLink: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    useEffect(() => {
        const { ref, position } = getUrlParams();
        if (ref) {
            console.log('Detected Referral:', ref, position);
            // Construct a displayable link or just keep the current URL
            setFormData(prev => ({
                ...prev,
                referralLink: window.location.href // Pre-fill with full URL so user sees it
            }));
        }
    }, [location.search]);

    const handleChange = (e) => {
        setFormData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setLoading(true);

        try {
            const { confirmPassword, ...registerData } = formData;

            // ============================================================
            // ROBUST REFERRAL EXTRACTION LOGIC
            // ============================================================
            let finalReferrerId = null;
            let finalPlacement = null;

            console.log("Current Form Link:", formData.referralLink);
            console.log("Current Window URL:", window.location.href);

            // 1. Try to extract from the Input Field (User input text)
            if (formData.referralLink && formData.referralLink.trim() !== '') {
                try {
                    let input = formData.referralLink.trim();
                    if (input.match(/^IVA\d+$/i)) {
                        finalReferrerId = input;
                    } else {
                        // Attempt to parse as URL
                        const linkUrl = input.startsWith('http') ? input : `http://dummy.com/${input}`;
                        const urlObj = new URL(linkUrl);
                        finalReferrerId = urlObj.searchParams.get('ref');
                        finalPlacement = urlObj.searchParams.get('position');
                    }
                } catch (e) {
                    console.error("Input link parsing error:", e);
                }
            }

            // 2. Fallback: Parse from Current Window Location (State might be stale or cleared)
            if (!finalReferrerId) {
                // Use native URLSearchParams for reliability
                const params = new URLSearchParams(window.location.search);
                const refParam = params.get('ref');
                const posParam = params.get('position');

                if (refParam) {
                    console.log("Found params in Window Location:", refParam, posParam);
                    finalReferrerId = refParam;
                    finalPlacement = posParam;
                }
            }

            // 3. Last Resort: Parse from 'hash' if using HashRouter (just in case)
            if (!finalReferrerId && window.location.hash.includes('?')) {
                try {
                    const hashPart = window.location.hash.split('?')[1];
                    if (hashPart) {
                        const params = new URLSearchParams(hashPart);
                        if (params.get('ref')) {
                            finalReferrerId = params.get('ref');
                            finalPlacement = params.get('position');
                        }
                    }
                } catch (err) {
                    console.error("Hash parse error", err);
                }
            }

            // ============================================================
            // ATTACH TO PAYLOAD
            // ============================================================
            if (finalReferrerId) {
                registerData.referrerId = finalReferrerId;
            }
            if (finalPlacement) {
                registerData.placementSide = finalPlacement;
            }

            console.log("FINAL REGISTER PAYLOAD:", registerData);

            await register(registerData);
            logout(); // Ensure user is not auto-logged in
            navigate('/login', { state: { message: 'Registration successful! Please login to continue.' } });
        } catch (err) {
            console.error("Register Failed:", err);
            setError(err.response?.data?.message || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-400 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-2xl"
            >
                <div className="card-glass p-8">
                    <div className="text-center mb-8">
                        <h1 className="text-4xl font-bold gradient-text mb-2">IVAMAX</h1>
                        <p className="text-text-tertiary">Create your account and start earning</p>
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Referral Link (Top, Full Width) */}
                            <div className="md:col-span-2">
                                <label htmlFor="referralLink" className="label">Referral Link (Optional)</label>
                                <input
                                    type="text"
                                    id="referralLink"
                                    name="referralLink"
                                    value={formData.referralLink}
                                    onChange={handleChange}
                                    className="w-full pl-4 py-3.5 bg-gray-200 border border-gray-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-golden-400/50 focus:border-golden-400 focus:bg-white transition-all duration-300 text-gray-900 placeholder-gray-400 font-medium"
                                    placeholder="Enter referral link or ID"
                                />
                                {formData.referralLink && (
                                    <p className="text-xs text-golden-600 mt-1 font-medium">
                                        Detecting:
                                        {formData.referralLink.match(/ref=([^&]+)/) ? ` ID: ${formData.referralLink.match(/ref=([^&]+)/)[1]}` : ''}
                                        {formData.referralLink.match(/position=([^&]+)/) ? ` | Position: ${formData.referralLink.match(/position=([^&]+)/)[1]}` : ''}
                                    </p>
                                )}
                            </div>

                            {/* Full Name */}
                            <div>
                                <label htmlFor="fullName" className="label">Full Name *</label>
                                <input
                                    type="text"
                                    id="fullName"
                                    name="fullName"
                                    value={formData.fullName}
                                    onChange={handleChange}
                                    className="w-full pl-4 py-3.5 bg-gray-200 border border-gray-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-golden-400/50 focus:border-golden-400 focus:bg-white transition-all duration-300 text-gray-900 placeholder-gray-400 font-medium"
                                    placeholder="Enter your full name"
                                    required
                                />
                            </div>

                            {/* Mobile Number */}
                            <div>
                                <label htmlFor="mobile" className="label">Mobile Number *</label>
                                <input
                                    type="tel"
                                    id="mobile"
                                    name="mobile"
                                    value={formData.mobile}
                                    onChange={handleChange}
                                    className="w-full pl-4 py-3.5 bg-gray-200 border border-gray-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-golden-400/50 focus:border-golden-400 focus:bg-white transition-all duration-300 text-gray-900 placeholder-gray-400 font-medium"
                                    placeholder="Enter mobile number"
                                    required
                                />
                            </div>

                            {/* Email Address (Full Width below Name/Mobile) */}
                            <div className="md:col-span-2">
                                <label htmlFor="email" className="label">Email Address *</label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full pl-4 py-3.5 bg-gray-200 border border-gray-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-golden-400/50 focus:border-golden-400 focus:bg-white transition-all duration-300 text-gray-900 placeholder-gray-400 font-medium"
                                    placeholder="Enter email address"
                                    required
                                />
                            </div>

                            {/* Password */}
                            <div>
                                <label htmlFor="password" className="label">Password *</label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        id="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        className="w-full pl-4 pr-10 py-3.5 bg-gray-200 border border-gray-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-golden-400/50 focus:border-golden-400 focus:bg-white transition-all duration-300 text-gray-900 placeholder-gray-400 font-medium"
                                        placeholder="Create password"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-golden-600 focus:outline-none"
                                    >
                                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                            </div>

                            {/* Confirm Password */}
                            <div>
                                <label htmlFor="confirmPassword" className="label">Confirm Password *</label>
                                <div className="relative">
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        className="w-full pl-4 pr-10 py-3.5 bg-gray-200 border border-gray-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-golden-400/50 focus:border-golden-400 focus:bg-white transition-all duration-300 text-gray-900 placeholder-gray-400 font-medium"
                                        placeholder="Confirm password"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-golden-600 focus:outline-none"
                                    >
                                        {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center">
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Creating Account...
                                </span>
                            ) : 'Create Account'}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-text-tertiary">
                            Already have an account?{' '}
                            <Link to="/login" className="text-golden-500 hover:text-golden-600 font-semibold">
                                Login Here
                            </Link>
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default Register;
