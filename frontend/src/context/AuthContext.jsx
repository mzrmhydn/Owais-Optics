import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

// Simple JWT decode (without verification - just for reading user info)
const decodeJWT = (token) => {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );
        return JSON.parse(jsonPayload);
    } catch (e) {
        return null;
    }
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Check for token in URL (from Google OAuth redirect)
        const urlParams = new URLSearchParams(window.location.search);
        const tokenFromUrl = urlParams.get('token');
        const nameFromUrl = urlParams.get('name');
        const avatarFromUrl = urlParams.get('avatar');

        if (tokenFromUrl) {
            localStorage.setItem('authToken', tokenFromUrl);
            // Clean up URL
            window.history.replaceState({}, document.title, window.location.pathname);

            // Create user session with name and avatar from URL
            const userName = nameFromUrl ? decodeURIComponent(nameFromUrl) : 'Google User';
            const userAvatar = avatarFromUrl ? decodeURIComponent(avatarFromUrl) : null;
            const decoded = decodeJWT(tokenFromUrl);
            const userInfo = {
                _id: decoded?.sub || 'user',
                name: userName,
                email: '',
                avatar: userAvatar,
                provider: 'google'
            };
            localStorage.setItem('user', JSON.stringify(userInfo));
            setUser(userInfo);
            setIsLoading(false);
            return;
        }

        // Check if user is already logged in
        const token = localStorage.getItem('authToken');
        const savedUser = localStorage.getItem('user');

        if (token && savedUser) {
            try {
                setUser(JSON.parse(savedUser));
            } catch (e) {
                localStorage.removeItem('user');
            }
        } else if (token && !savedUser) {
            // Token exists but no user - try to use decoded token
            const decoded = decodeJWT(token);
            if (decoded && decoded.sub) {
                const minimalUser = {
                    _id: decoded.sub,
                    name: 'User',
                    email: ''
                };
                localStorage.setItem('user', JSON.stringify(minimalUser));
                setUser(minimalUser);
            }
        }
        setIsLoading(false);
    }, []);

    const login = (userData, token) => {
        localStorage.setItem('authToken', token);
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
    };

    const logout = () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        setUser(null);
    };

    const isLoggedIn = !!user;

    return (
        <AuthContext.Provider value={{ user, isLoggedIn, isLoading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export default AuthContext;
