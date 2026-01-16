import { motion } from 'framer-motion';
import StarRating from './StarRating';
import { FaUserCircle } from 'react-icons/fa';

const ReviewCard = ({ review, index = 0 }) => {
    const { name, rating, comment, avatar, createdAt } = review;

    // Format date
    const formattedDate = createdAt
        ? new Date(createdAt).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        })
        : 'Recently';

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
                duration: 0.5,
                delay: index * 0.1,
                ease: 'easeOut'
            }}
            whileHover={{
                y: -5,
                boxShadow: '0 20px 40px rgba(105, 190, 235, 0.15)',
            }}
            className="glass-card p-6 relative overflow-hidden group"
        >
            {/* Gradient border effect on hover */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary-500/20 via-transparent to-accent-500/20" />
            </div>

            {/* Content */}
            <div className="relative z-10">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                        {/* Avatar */}
                        <div className="relative">
                            {avatar ? (
                                <img
                                    src={avatar}
                                    alt={name}
                                    className="w-12 h-12 rounded-full object-cover border-2 border-primary-500/30"
                                />
                            ) : (
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                                    <FaUserCircle className="text-white/80 text-2xl" />
                                </div>
                            )}
                            {/* Online indicator */}
                            <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white" />
                        </div>

                        {/* Name & Date */}
                        <div>
                            <h4 className="font-heading font-semibold text-gray-800">
                                {name}
                            </h4>
                            <p className="text-xs text-gray-400">{formattedDate}</p>
                        </div>
                    </div>

                    {/* Rating */}
                    <StarRating rating={rating} size={16} />
                </div>

                {/* Comment */}
                <p className="text-gray-600 text-sm leading-relaxed">
                    {comment}
                </p>

                {/* Decorative element */}
                <div className="absolute top-4 right-4 text-6xl text-primary-500/5 font-serif pointer-events-none">
                    "
                </div>
            </div>
        </motion.div>
    );
};

export default ReviewCard;
