import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaArrowLeft } from 'react-icons/fa';
import GoogleButton from '../components/GoogleButton';
import { authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Signup = () => {
    const navigate = useNavigate();
    const { isLoggedIn } = useAuth();

    // Redirect if already logged in
    if (isLoggedIn) {
        navigate('/reviews');
        return null;
    }

    const handleGoogleAuth = () => {
        window.location.href = authAPI.getGoogleAuthUrl();
    };

    return (
        <div className="min-h-screen pt-24 pb-12 flex items-center justify-center relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <motion.div
                    animate={{
                        scale: [1, 1.3, 1],
                        rotate: [0, 180, 360],
                    }}
                    transition={{ duration: 30, repeat: Infinity }}
                    className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-primary-500/20 via-transparent to-transparent rounded-full blur-3xl"
                />
                <motion.div
                    animate={{
                        scale: [1.3, 1, 1.3],
                        rotate: [360, 180, 0],
                    }}
                    transition={{ duration: 25, repeat: Infinity }}
                    className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-accent-500/20 via-transparent to-transparent rounded-full blur-3xl"
                />
            </div>

            {/* Form Container */}
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="relative z-10 w-full max-w-md px-4"
            >
                {/* Back Link */}
                <Link
                    to="/"
                    className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors mb-8 group"
                >
                    <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" />
                    <span>Back to Home</span>
                </Link>

                {/* Card */}
                <div className="glass-card p-8 sm:p-10">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <motion.h1
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-3xl font-heading font-bold gradient-text mb-2"
                        >
                            Sign in to Owais Optics
                        </motion.h1>
                        <p className="text-gray-500">
                            Sign in to share your experience and leave a review.
                        </p>
                    </div>

                    {/* Google Button */}
                    <GoogleButton onClick={handleGoogleAuth} />

                    {/* Info Text */}
                    <p className="text-center mt-6 text-gray-400 text-sm">
                        By signing in, you agree to our{' '}
                        <a href="#" className="text-primary-500 hover:underline">Terms of Service</a>
                        {' '}and{' '}
                        <a href="#" className="text-primary-500 hover:underline">Privacy Policy</a>
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default Signup;
