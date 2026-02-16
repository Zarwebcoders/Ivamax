import { createContext, useState, useContext, useEffect } from 'react';
import { authService } from '../services/auth.service';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check if user is logged in
        const storedUser = authService.getStoredUser();
        const token = authService.getToken();

        if (storedUser && token) {
            setUser(storedUser);
        }
        setLoading(false);
    }, []);

    const login = async (credentials) => {
        console.log('AuthContext: Attempting login...');
        const data = await authService.login(credentials);
        console.log('AuthContext: Login success, data:', data);
        setUser(data);
        return data;
    };

    const register = async (userData) => {
        const data = await authService.register(userData);
        setUser(data);
        return data;
    };

    const logout = () => {
        authService.logout();
        setUser(null);
    };

    const refreshUser = async () => {
        try {
            const responseData = await authService.getCurrentUser();
            // authController.getMe returns { success: true, data: userObj }
            // Some other controllers might return just userObj. 
            // We need to be careful. Based on previous analysis, getMe returns wrapped data.
            const userData = responseData.data || responseData;

            if (userData) {
                setUser(userData);
                // Also update local storage to keep it in sync
                const stored = JSON.parse(localStorage.getItem('user') || '{}');
                // Merge carefully. 
                const updated = { ...stored, ...userData };
                localStorage.setItem('user', JSON.stringify(updated));
            }
            return userData;
        } catch (error) {
            console.error("Failed to refresh user:", error);
        }
    };

    const value = {
        user,
        loading,
        login,
        register,
        logout,
        refreshUser,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
