import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaStar, FaPen, FaTimes, FaLock, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import ReviewCard from '../components/ReviewCard';
import StarRating from '../components/StarRating';
import { reviewsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Reviews = () => {
    const { user, isLoggedIn } = useAuth();
    const [reviews, setReviews] = useState([]);
    const [stats, setStats] = useState({ averageRating: 0, totalReviews: 0 });
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newReview, setNewReview] = useState({ rating: 0, comment: '', isAnonymous: false });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [userReview, setUserReview] = useState(null); // Track if user already has a review
    const [isEditMode, setIsEditMode] = useState(false);

    // Filter and pagination state
    const [sortBy, setSortBy] = useState('newest'); // 'newest', 'oldest', 'highest', 'lowest'
    const [currentPage, setCurrentPage] = useState(1);
    const reviewsPerPage = 12;

    // Fetch reviews on mount
    useEffect(() => {
        fetchReviews();
    }, []);

    // Check if user has already reviewed when user or reviews change
    useEffect(() => {
        if (user?._id && reviews.length > 0) {
            const existingReview = reviews.find(r => r.user_id === user._id);
            setUserReview(existingReview || null);
        } else {
            setUserReview(null);
        }
    }, [user, reviews]);

    const fetchReviews = async () => {
        setIsLoading(true);
        try {
            const [reviewsData, statsData] = await Promise.all([
                reviewsAPI.getAll(),
                reviewsAPI.getStats(),
            ]);
            setReviews(reviewsData);
            setStats(statsData);

            // Check if current user has already reviewed (by user_id, not name)
            if (user?._id) {
                const existingReview = reviewsData.find(
                    r => r.user_id === user._id
                );
                setUserReview(existingReview || null);
            }
        } catch (err) {
            console.error('Failed to fetch reviews:', err);
            // Use mock data if API fails
            setReviews(mockReviews);
            setStats({ averageRating: 4.7, totalReviews: mockReviews.length });

            // Check in mock data too (by user_id)
            if (user?._id) {
                const existingReview = mockReviews.find(
                    r => r.user_id === user._id
                );
                setUserReview(existingReview || null);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpenModal = () => {
        if (!isLoggedIn) {
            return; // Don't open modal if not logged in
        }

        // If user has existing review, load it for editing
        if (userReview) {
            setIsEditMode(true);
            setNewReview({
                rating: userReview.rating,
                comment: userReview.comment,
                isAnonymous: userReview.name === 'Anonymous'
            });
        } else {
            setIsEditMode(false);
            setNewReview({ rating: 0, comment: '', isAnonymous: false });
        }

        setIsModalOpen(true);
    };

    const handleSubmitReview = async (e) => {
        e.preventDefault();
        if (newReview.rating === 0) {
            setError('Please select a rating');
            return;
        }
        if (newReview.comment.trim().length < 10) {
            setError('Please write at least 10 characters');
            return;
        }

        setIsSubmitting(true);
        setError('');

        const reviewData = {
            ...newReview,
            name: newReview.isAnonymous ? 'Anonymous' : (user?.name || 'User'),
            avatar: newReview.isAnonymous ? null : (user?.avatar || null),
            user_id: user?._id,
        };

        try {
            if (isEditMode && user?._id) {
                // Update existing review
                await reviewsAPI.update(user._id, reviewData);
            } else {
                // Create new review
                await reviewsAPI.create(reviewData);
            }
            setIsModalOpen(false);
            setNewReview({ rating: 0, comment: '', isAnonymous: false });
            setUserReview(null); // Reset so it refetches
            fetchReviews();
        } catch (err) {
            // For demo, handle locally
            if (isEditMode) {
                // Update existing review in local state
                setReviews(reviews.map(r =>
                    r.user_id === user?._id
                        ? { ...r, ...reviewData, rating: newReview.rating, comment: newReview.comment }
                        : r
                ));
            } else {
                // Add new review to local state
                const demoReview = {
                    _id: Date.now(),
                    ...reviewData,
                    rating: newReview.rating,
                    comment: newReview.comment,
                    createdAt: new Date().toISOString(),
                };
                setReviews([demoReview, ...reviews]);
                setStats({
                    averageRating: ((stats.averageRating * stats.totalReviews + newReview.rating) / (stats.totalReviews + 1)).toFixed(1),
                    totalReviews: stats.totalReviews + 1,
                });
            }
            setIsModalOpen(false);
            setNewReview({ rating: 0, comment: '', isAnonymous: false });
            setUserReview(null);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Mock reviews for demo
    const mockReviews = [
        {
            _id: 1,
            name: 'Ahmed Khan',
            rating: 5,
            comment: 'Excellent service and quality glasses! The staff was very helpful in choosing the right frame for my face. Highly recommended!',
            createdAt: '2026-01-10T10:00:00Z',
        },
        {
            _id: 2,
            name: 'Sara Ali',
            rating: 5,
            comment: 'Best optical shop in the area. They have a wide variety of frames and lenses. Very professional eye testing.',
            createdAt: '2026-01-08T14:30:00Z',
        },
        {
            _id: 3,
            name: 'Muhammad Usman',
            rating: 4,
            comment: 'Good experience overall. The glasses are comfortable and stylish. Delivery was a bit delayed but quality is great.',
            createdAt: '2026-01-05T09:15:00Z',
        },
        {
            _id: 4,
            name: 'Fatima Zahra',
            rating: 5,
            comment: 'Amazing collection of designer frames! Got my progressive lenses here and they are perfect. Great customer service.',
            createdAt: '2026-01-03T16:45:00Z',
        },
        {
            _id: 5,
            name: 'Hassan Raza',
            rating: 4,
            comment: 'Very satisfied with my purchase. The anti-glare coating is excellent for computer work. Will visit again!',
            createdAt: '2025-12-28T11:20:00Z',
        },
        {
            _id: 6,
            name: 'Ayesha Malik',
            rating: 5,
            comment: 'Owais Optics has the best prices in town with premium quality. The eye check-up was thorough and professional.',
            createdAt: '2025-12-25T13:00:00Z',
        },
    ];

    const displayReviews = reviews.length > 0 ? reviews : mockReviews;
    const displayStats = stats.totalReviews > 0 ? stats : { averageRating: 4.7, totalReviews: mockReviews.length };

    // Sort reviews based on filter
    const sortedReviews = [...displayReviews].sort((a, b) => {
        switch (sortBy) {
            case 'newest':
                return new Date(b.createdAt) - new Date(a.createdAt);
            case 'oldest':
                return new Date(a.createdAt) - new Date(b.createdAt);
            case 'highest':
                return b.rating - a.rating;
            case 'lowest':
                return a.rating - b.rating;
            default:
                return 0;
        }
    });

    // Pagination logic
    const totalPages = Math.ceil(sortedReviews.length / reviewsPerPage);
    const startIndex = (currentPage - 1) * reviewsPerPage;
    const paginatedReviews = sortedReviews.slice(startIndex, startIndex + reviewsPerPage);

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
            // Scroll to top of reviews section
            window.scrollTo({ top: 400, behavior: 'smooth' });
        }
    };

    const handleSortChange = (newSort) => {
        setSortBy(newSort);
        setCurrentPage(1); // Reset to first page when changing sort
    };

    return (
        <div className="min-h-screen pt-24 pb-20">
            {/* Background Effects */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-500/10 rounded-full blur-[150px]" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent-500/10 rounded-full blur-[150px]" />
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header Section */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <h1 className="text-4xl sm:text-5xl font-heading font-bold mb-4">
                        <span className="text-gray-700">Customer </span>
                        <span className="gradient-text">Reviews</span>
                    </h1>
                    <p className="text-gray-500 max-w-2xl mx-auto">
                        See what our valued customers have to say about their experience with Owais Optics
                    </p>
                </motion.div>

                {/* Stats Card */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="glass-card p-8 mb-12 max-w-xl mx-auto text-center"
                >
                    <div className="flex items-center justify-center gap-4 mb-4">
                        <span className="text-6xl font-heading font-bold gradient-text">
                            {displayStats.averageRating}
                        </span>
                        <div className="text-left">
                            <StarRating rating={Math.round(displayStats.averageRating)} size={24} />
                            <p className="text-gray-500 text-sm mt-1">
                                Based on {displayStats.totalReviews} reviews
                            </p>
                        </div>
                    </div>

                    {/* Rating Distribution */}
                    <div className="space-y-2 max-w-xs mx-auto">
                        {[5, 4, 3, 2, 1].map((star) => {
                            const count = displayReviews.filter(r => r.rating === star).length;
                            const percentage = displayReviews.length > 0
                                ? Math.round((count / displayReviews.length) * 100)
                                : 0;
                            return (
                                <div key={star} className="flex items-center gap-2 text-sm">
                                    <span className="text-gray-500 w-3">{star}</span>
                                    <FaStar className="text-amber-400" size={12} />
                                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${percentage}%` }}
                                            transition={{ duration: 1, delay: 0.5 }}
                                            className="h-full bg-gradient-to-r from-primary-400 to-primary-600 rounded-full"
                                        />
                                    </div>
                                    <span className="text-gray-400 w-8">{percentage}%</span>
                                </div>
                            );
                        })}
                    </div>
                </motion.div>

                {/* Write Review Button */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="flex justify-center mb-12"
                >
                    {isLoggedIn ? (
                        <motion.button
                            onClick={handleOpenModal}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="btn-primary text-lg px-8 py-4 group"
                        >
                            <FaPen className="text-sm" />
                            {userReview ? 'Edit Your Review' : 'Write a Review'}
                        </motion.button>
                    ) : (
                        <div className="text-center">
                            <div className="glass-card p-6 inline-block">
                                <FaLock className="text-2xl text-primary-500 mx-auto mb-3" />
                                <p className="text-gray-600 mb-4">Sign in to write a review</p>
                                <Link to="/signup">
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        className="btn-primary px-6 py-3"
                                    >
                                        Sign in
                                    </motion.button>
                                </Link>
                            </div>
                        </div>
                    )}
                </motion.div>

                {/* Filter Buttons */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="flex flex-wrap justify-center gap-3 mb-8"
                >
                    {[
                        { key: 'newest', label: 'Newest' },
                        { key: 'oldest', label: 'Oldest' },
                        { key: 'highest', label: 'Highest Rated' },
                        { key: 'lowest', label: 'Lowest Rated' },
                    ].map((filter) => (
                        <button
                            key={filter.key}
                            onClick={() => handleSortChange(filter.key)}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${sortBy === filter.key
                                    ? 'bg-primary-500 text-white shadow-lg'
                                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                                }`}
                        >
                            {filter.label}
                        </button>
                    ))}
                </motion.div>

                {/* Reviews Grid */}
                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className="glass-card p-6 animate-pulse">
                                <div className="flex items-center space-x-3 mb-4">
                                    <div className="w-12 h-12 rounded-full bg-gray-200" />
                                    <div className="space-y-2">
                                        <div className="w-24 h-4 bg-gray-200 rounded" />
                                        <div className="w-16 h-3 bg-gray-200 rounded" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="w-full h-3 bg-gray-200 rounded" />
                                    <div className="w-3/4 h-3 bg-gray-200 rounded" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.5 }}
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                        >
                            {paginatedReviews.map((review, index) => (
                                <ReviewCard key={review._id} review={review} index={index} />
                            ))}
                        </motion.div>

                        {/* Pagination Controls */}
                        {totalPages > 1 && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.2 }}
                                className="flex items-center justify-center gap-4 mt-12"
                            >
                                <button
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className={`p-3 rounded-full transition-all ${currentPage === 1
                                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                            : 'bg-white text-gray-700 hover:bg-primary-500 hover:text-white shadow-md'
                                        }`}
                                >
                                    <FaChevronLeft />
                                </button>

                                <div className="flex items-center gap-2">
                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                        <button
                                            key={page}
                                            onClick={() => handlePageChange(page)}
                                            className={`w-10 h-10 rounded-full text-sm font-medium transition-all ${currentPage === page
                                                    ? 'bg-primary-500 text-white shadow-lg'
                                                    : 'bg-white text-gray-600 hover:bg-gray-100'
                                                }`}
                                        >
                                            {page}
                                        </button>
                                    ))}
                                </div>

                                <button
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    className={`p-3 rounded-full transition-all ${currentPage === totalPages
                                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                            : 'bg-white text-gray-700 hover:bg-primary-500 hover:text-white shadow-md'
                                        }`}
                                >
                                    <FaChevronRight />
                                </button>
                            </motion.div>
                        )}
                    </>
                )}
            </div>

            {/* Review Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                        onClick={() => setIsModalOpen(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            transition={{ type: 'spring', damping: 20 }}
                            className="glass-card p-8 w-full max-w-md relative"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Close Button */}
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <FaTimes size={20} />
                            </button>

                            <h2 className="text-2xl font-heading font-bold text-gray-800 mb-2">
                                {isEditMode ? 'Edit Your Review' : 'Share Your Experience'}
                            </h2>
                            <p className="text-gray-500 text-sm mb-6">
                                {isEditMode ? 'Update your review below' : (<>Posting as <span className="text-primary-500">{user?.name || 'User'}</span></>)}
                            </p>

                            <form onSubmit={handleSubmitReview} className="space-y-6">
                                {/* Rating */}
                                <div>
                                    <label className="block text-gray-700 mb-3 font-medium">
                                        Your Rating
                                    </label>
                                    <StarRating
                                        rating={newReview.rating}
                                        interactive={true}
                                        size={32}
                                        onRatingChange={(rating) => setNewReview({ ...newReview, rating })}
                                    />
                                </div>

                                {/* Comment */}
                                <div>
                                    <label className="block text-gray-700 mb-3 font-medium">
                                        Your Review
                                    </label>
                                    <textarea
                                        value={newReview.comment}
                                        onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                                        placeholder="Share your experience with us..."
                                        rows={4}
                                        className="input-field resize-none"
                                    />
                                </div>

                                {/* Anonymous Option */}
                                <label className="flex items-center gap-3 cursor-pointer group">
                                    <div className="relative">
                                        <input
                                            type="checkbox"
                                            checked={newReview.isAnonymous || false}
                                            onChange={(e) => setNewReview({ ...newReview, isAnonymous: e.target.checked })}
                                            className="sr-only peer"
                                        />
                                        <div className="w-5 h-5 border-2 border-gray-300 rounded bg-gray-50 peer-checked:bg-primary-500 peer-checked:border-primary-500 transition-all flex items-center justify-center">
                                            {newReview.isAnonymous && (
                                                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                </svg>
                                            )}
                                        </div>
                                    </div>
                                    <span className="text-gray-600 text-sm group-hover:text-gray-800 transition-colors">
                                        Post anonymously (hide my name)
                                    </span>
                                </label>

                                {/* Error Message */}
                                {error && (
                                    <p className="text-red-400 text-sm">{error}</p>
                                )}

                                {/* Submit */}
                                <motion.button
                                    type="submit"
                                    disabled={isSubmitting}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="btn-primary w-full justify-center"
                                >
                                    {isSubmitting ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        isEditMode ? 'Update Review' : 'Submit Review'
                                    )}
                                </motion.button>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Reviews;
