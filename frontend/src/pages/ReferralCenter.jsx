import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { dashboardService } from '../services/dashboard.service';
import ReferralCard from '../components/ReferralCard';

const ReferralCenter = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await dashboardService.getStats();
                if (response.success) {
                    setStats(response.data);
                }
            } catch (error) {
                console.error("Failed to fetch stats", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
            </div>
        );
    }

    if (!user?.isActive) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-6 px-4">
                <div className="bg-red-50 p-6 rounded-full border-4 border-red-100 animate-pulse">
                    <img src="/icons/lock.svg" alt="Locked" className="w-12 h-12 opacity-50" onError={(e) => e.target.style.display = 'none'} />
                    {/* Fallback icon if image fails */}
                    <div className="text-red-400 text-5xl">🔒</div>
                </div>
                <div className="space-y-2">
                    <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight">Access Restricted</h2>
                    <p className="text-gray-500 max-w-md mx-auto">
                        Your referral center is locked. You must activate your account by purchasing a package to unlock your referral links.
                    </p>
                </div>
                <button
                    onClick={() => window.location.href = '/packages'}
                    className="bg-gradient-to-r from-red-600 to-red-500 text-white px-8 py-4 rounded-xl font-bold uppercase tracking-widest hover:shadow-lg hover:scale-105 transition-all"
                >
                    Activate Account Now
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-6">
            <div className="min-h-[600px]">
                <ReferralCard user={user} stats={stats} />
            </div>
        </div>
    );
};

export default ReferralCenter;


