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

    return (
        <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-6">
            {/* Wrapper div to give it fixed height if needed, or let it grow */}
            <div className="min-h-[600px]">
                <ReferralCard user={user} stats={stats} />
            </div>
        </div>
    );
};

export default ReferralCenter;


