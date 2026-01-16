import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaStar, FaGlasses, FaArrowRight } from 'react-icons/fa';
import { HiSparkles } from 'react-icons/hi';
import { useAuth } from '../context/AuthContext';

const Home = () => {
    const { isLoggedIn } = useAuth();
    return (
        <div className="min-h-screen pt-20">
            {/* Hero Section */}
            <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
                {/* Background Effects */}
                <div className="absolute inset-0 overflow-hidden">
                    {/* Gradient orbs */}
                    <motion.div
                        animate={{
                            scale: [1, 1.2, 1],
                            opacity: [0.3, 0.5, 0.3],
                        }}
                        transition={{ duration: 8, repeat: Infinity }}
                        className="absolute top-1/4 -left-32 w-96 h-96 bg-primary-500/30 rounded-full blur-[100px]"
                    />
                    <motion.div
                        animate={{
                            scale: [1.2, 1, 1.2],
                            opacity: [0.2, 0.4, 0.2],
                        }}
                        transition={{ duration: 10, repeat: Infinity }}
                        className="absolute bottom-1/4 -right-32 w-96 h-96 bg-accent-500/30 rounded-full blur-[100px]"
                    />

                    {/* Grid pattern */}
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(105,190,235,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(105,190,235,0.05)_1px,transparent_1px)] bg-[size:50px_50px]" />
                </div>

                {/* Content */}
                <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">


                    {/* Main Heading */}
                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="text-4xl sm:text-5xl md:text-7xl font-heading font-bold mb-6"
                    >
                        <span className="text-gray-700">Welcome to </span>
                        <span className="gradient-text">Owais Optics</span>
                    </motion.h1>

                    {/* Subtitle */}
                    <motion.p
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="text-lg sm:text-xl text-gray-500 max-w-2xl mx-auto mb-8"
                    >
                        Expertly crafted premium eyewear, delivered straight to your hostel room.
                    </motion.p>

                    {/* Under Construction Notice */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                        className="glass-card inline-block px-6 py-4 mb-10"
                    >
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse [animation-delay:200ms]" />
                                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse [animation-delay:400ms]" />
                            </div>
                            <p className="text-gray-600 text-sm sm:text-base">
                                <span className="text-amber-500 font-semibold">Website in Progress</span> — Currently featuring our Reviews section
                            </p>
                        </div>
                    </motion.div>

                    {/* CTA Buttons */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                        className="flex flex-col sm:flex-row items-center justify-center gap-4"
                    >
                        <Link to="/reviews">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="btn-primary text-lg px-8 py-4"
                            >
                                View Reviews
                            </motion.button>
                        </Link>
                    </motion.div>
                </div>


            </section>


        </div>
    );
};

export default Home;
