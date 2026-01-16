import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { HiMenuAlt3, HiX } from 'react-icons/hi';
import { FaUserCircle, FaSignOutAlt } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

const Header = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const { user, isLoggedIn, logout } = useAuth();

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/');
        setIsMobileMenuOpen(false);
    };

    const navLinks = [
        { name: 'Home', path: '/' },
        { name: 'Reviews', path: '/reviews' },
    ];

    return (
        <motion.header
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-lg shadow-md shadow-gray-200/50"
        >
            <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">
                    {/* Logo */}
                    <Link to="/" className="flex items-center space-x-3">
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="flex items-center gap-1"
                        >
                            <img
                                src="/logo.png"
                                alt="Owais Optics"
                                className="h-15 w-auto"
                            />
                            <span
                                className="text-xl sm:text-2xl font-bold tracking-wide"
                                style={{ fontFamily: "'Proxima Nova', 'Inter', sans-serif", color: '#555759' }}
                            >
                                OWAIS OPTICS
                            </span>
                        </motion.div>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-8">
                        {navLinks.map((link) => (
                            <Link
                                key={link.path}
                                to={link.path}
                                className={`relative font-medium transition-colors duration-200 ${location.pathname === link.path
                                    ? 'text-primary-600'
                                    : 'text-gray-600 hover:text-primary-500'
                                    }`}
                            >
                                {link.name}
                                {location.pathname === link.path && (
                                    <motion.div
                                        layoutId="activeNav"
                                        className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-primary-400 to-primary-600"
                                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                                    />
                                )}
                            </Link>
                        ))}

                        {/* Auth Section */}
                        {isLoggedIn ? (
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2 text-gray-600">
                                    {user?.avatar ? (
                                        <img
                                            src={user.avatar}
                                            alt={user.name}
                                            className="w-8 h-8 rounded-full object-cover border-2 border-primary-400"
                                            onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block'; }}
                                        />
                                    ) : null}
                                    <FaUserCircle
                                        className="text-primary-500 text-2xl"
                                        style={{ display: user?.avatar ? 'none' : 'block' }}
                                    />
                                    <span className="text-sm">{user?.name || 'User'}</span>
                                </div>
                                <motion.button
                                    onClick={handleLogout}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="btn-secondary text-sm px-4 py-2 flex items-center gap-2"
                                >
                                    <FaSignOutAlt />
                                    Logout
                                </motion.button>
                            </div>
                        ) : (
                            <Link to="/signup">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="btn-primary text-sm"
                                >
                                    Sign in
                                </motion.button>
                            </Link>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="md:hidden p-2 text-gray-600 hover:text-gray-800"
                    >
                        {isMobileMenuOpen ? <HiX size={28} /> : <HiMenuAlt3 size={28} />}
                    </button>
                </div>

                {/* Mobile Menu */}
                <AnimatePresence>
                    {isMobileMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                            className="md:hidden overflow-hidden"
                        >
                            <div className="glass-card p-4 mb-4 space-y-4">
                                {navLinks.map((link) => (
                                    <Link
                                        key={link.path}
                                        to={link.path}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className={`block py-2 px-4 rounded-lg transition-colors ${location.pathname === link.path
                                            ? 'bg-primary-500/20 text-primary-600'
                                            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
                                            }`}
                                    >
                                        {link.name}
                                    </Link>
                                ))}

                                {/* Mobile Auth Section */}
                                {isLoggedIn ? (
                                    <>
                                        <div className="flex items-center gap-2 px-4 py-2 text-gray-600">
                                            <FaUserCircle className="text-primary-500" />
                                            <span>{user?.name || 'User'}</span>
                                        </div>
                                        <button
                                            onClick={handleLogout}
                                            className="btn-secondary w-full text-sm flex items-center justify-center gap-2"
                                        >
                                            <FaSignOutAlt />
                                            Logout
                                        </button>
                                    </>
                                ) : (
                                    <Link
                                        to="/signup"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className="block"
                                    >
                                        <button className="btn-primary w-full text-sm">
                                            Sign in with Google
                                        </button>
                                    </Link>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </nav>
        </motion.header>
    );
};

export default Header;
