import { useState } from 'react';
import { motion } from 'framer-motion';
import { FaStar, FaRegStar } from 'react-icons/fa';

const StarRating = ({
    rating = 0,
    maxStars = 5,
    size = 24,
    interactive = false,
    onRatingChange = () => { }
}) => {
    const [hoverRating, setHoverRating] = useState(0);

    const handleClick = (value) => {
        if (interactive) {
            onRatingChange(value);
        }
    };

    const handleMouseEnter = (value) => {
        if (interactive) {
            setHoverRating(value);
        }
    };

    const handleMouseLeave = () => {
        if (interactive) {
            setHoverRating(0);
        }
    };

    const displayRating = hoverRating || rating;

    return (
        <div className="flex items-center gap-1">
            {[...Array(maxStars)].map((_, index) => {
                const starValue = index + 1;
                const isFilled = starValue <= displayRating;
                const isHalf = !isFilled && starValue - 0.5 <= displayRating;

                return (
                    <motion.button
                        key={index}
                        type="button"
                        onClick={() => handleClick(starValue)}
                        onMouseEnter={() => handleMouseEnter(starValue)}
                        onMouseLeave={handleMouseLeave}
                        whileHover={interactive ? { scale: 1.2 } : {}}
                        whileTap={interactive ? { scale: 0.9 } : {}}
                        className={`relative ${interactive ? 'cursor-pointer' : 'cursor-default'} focus:outline-none`}
                        disabled={!interactive}
                        aria-label={`${starValue} star${starValue > 1 ? 's' : ''}`}
                    >
                        {isFilled ? (
                            <motion.div
                                initial={interactive ? { scale: 0 } : false}
                                animate={{ scale: 1 }}
                                transition={{ type: 'spring', stiffness: 500, damping: 15 }}
                            >
                                <FaStar
                                    size={size}
                                    className="text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]"
                                />
                            </motion.div>
                        ) : (
                            <FaRegStar
                                size={size}
                                className={`${interactive ? 'text-gray-300 hover:text-amber-400/50' : 'text-gray-200'} transition-colors`}
                            />
                        )}
                    </motion.button>
                );
            })}
        </div>
    );
};

export default StarRating;
