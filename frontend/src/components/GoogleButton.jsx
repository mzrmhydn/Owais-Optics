import { motion } from 'framer-motion';
import { FcGoogle } from 'react-icons/fc';

const GoogleButton = ({ onClick, isLoading = false }) => {
    return (
        <motion.button
            onClick={onClick}
            disabled={isLoading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full flex items-center justify-center gap-3 px-6 py-3.5 bg-white text-gray-700 font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
            {isLoading ? (
                <div className="w-5 h-5 border-2 border-gray-300 border-t-primary-500 rounded-full animate-spin" />
            ) : (
                <FcGoogle className="text-xl" />
            )}
            <span>Continue with Google</span>
        </motion.button>
    );
};

export default GoogleButton;
