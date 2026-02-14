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
    const [submitSuccess, setSubmitSuccess] = useState(false);
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

            setSubmitSuccess(true);

            // Auto redirect after 5 seconds
            setTimeout(() => {
                navigate('/login', {
                    state: {
                        message: 'THANK YOU FOR REGISTRATION! Registration successful. Your login details have been sent to your email. Please check your inbox (and spam folder) for User ID and Password.'
                    }
                });
            }, 5000);
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
                    {submitSuccess ? (
                        <div className="text-center space-y-6 py-8">
                            <motion.div
                                initial={{ scale: 0.5, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-green-200"
                            >
                                <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                </svg>
                            </motion.div>
                            <h2 className="text-3xl font-bold gradient-text">Registration Successful!</h2>
                            <p className="text-lg text-text-secondary">THANK YOU FOR REGISTRATION</p>
                            <div className="bg-golden-50 border border-golden-100 p-6 rounded-2xl space-y-2">
                                <p className="font-bold text-golden-800">NOW VISIT MAIL FOR LOGIN DETAIL</p>
                                <p className="text-sm text-gray-500">We have sent your User ID and Password to your registered email address.</p>
                            </div>
                            <p className="text-xs text-text-tertiary animate-pulse font-medium">Redirecting to login in 5 seconds...</p>
                        </div>
                    ) : (
                        <>
                            <div className="text-center mb-10">
                                <h1 className="text-4xl font-extrabold gradient-text mb-2">IVAMAX</h1>
                                <p className="text-text-tertiary">Create your account and start earning</p>
                            </div>

                            {error && (
                                <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded-xl mb-8 flex items-center gap-3">
                                    <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse"></span>
                                    <span className="text-sm font-medium">{error}</span>
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Referral Link */}
                                    <div className="md:col-span-2 group">
                                        <label htmlFor="referralLink" className="label ml-1">Referral Link (Optional)</label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                id="referralLink"
                                                name="referralLink"
                                                value={formData.referralLink}
                                                onChange={handleChange}
                                                className="w-full pl-4 py-3.5 bg-gray-200 border border-gray-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-golden-400/50 focus:border-golden-400 focus:bg-white transition-all duration-300 text-gray-900 placeholder-gray-400 font-medium"
                                                placeholder="Enter referral link or ID"
                                            />
                                        </div>
                                        {formData.referralLink && (
                                            <p className="text-xs text-golden-600 mt-2 ml-1 font-bold uppercase tracking-wider">
                                                Detecting:
                                                {formData.referralLink.match(/ref=([^&]+)/) ? ` ID: ${formData.referralLink.match(/ref=([^&]+)/)[1]}` : ''}
                                                {formData.referralLink.match(/position=([^&]+)/) ? ` | Position: ${formData.referralLink.match(/position=([^&]+)/)[1]}` : ''}
                                            </p>
                                        )}
                                    </div>

                                    {/* Full Name */}
                                    <div className="group">
                                        <label htmlFor="fullName" className="label ml-1 font-bold text-gray-700">FULL NAME *</label>
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
                                    <div className="group">
                                        <label htmlFor="mobile" className="label ml-1 font-bold text-gray-700">MOBILE NO *</label>
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

                                    {/* Email Address */}
                                    <div className="md:col-span-2 group">
                                        <label htmlFor="email" className="label ml-1 font-bold text-gray-700">EMAIL ID *</label>
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
                                    <div className="group">
                                        <div className="flex justify-between items-center mb-1 ml-1">
                                            <label htmlFor="password" className="label font-bold text-gray-700">PASSWORD *</label>
                                        </div>
                                        <div className="relative">
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                id="password"
                                                name="password"
                                                value={formData.password}
                                                onChange={handleChange}
                                                className="w-full pl-4 pr-12 py-3.5 bg-gray-200 border border-gray-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-golden-400/50 focus:border-golden-400 focus:bg-white transition-all duration-300 text-gray-900 placeholder-gray-400 font-medium"
                                                placeholder="Create password"
                                                required
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-golden-600 transition-colors"
                                            >
                                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Confirm Password */}
                                    <div className="group">
                                        <div className="flex justify-between items-center mb-1 ml-1">
                                            <label htmlFor="confirmPassword" className="label font-bold text-gray-700">CONFIRM PASSWORD *</label>
                                        </div>
                                        <div className="relative">
                                            <input
                                                type={showConfirmPassword ? "text" : "password"}
                                                id="confirmPassword"
                                                name="confirmPassword"
                                                value={formData.confirmPassword}
                                                onChange={handleChange}
                                                className="w-full pl-4 pr-12 py-3.5 bg-gray-200 border border-gray-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-golden-400/50 focus:border-golden-400 focus:bg-white transition-all duration-300 text-gray-900 placeholder-gray-400 font-medium"
                                                placeholder="Confirm password"
                                                required
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-golden-600 transition-colors"
                                            >
                                                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="btn-primary w-full mt-4 py-4 uppercase font-bold tracking-wider disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-golden-500/20"
                                >
                                    {loading ? (
                                        <span className="flex items-center justify-center gap-3">
                                            <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Processing...
                                        </span>
                                    ) : 'Create Account'}
                                </button>
                            </form>

                            <div className="mt-8 text-center pt-2">
                                <p className="text-gray-500 text-sm font-medium">
                                    Already have an account?{' '}
                                    <Link to="/login" className="text-golden-600 font-bold hover:text-golden-700 hover:underline transition-all">
                                        Login Here
                                    </Link>
                                </p>
                            </div>
                        </>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default Register;
