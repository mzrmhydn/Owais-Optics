import { motion } from 'framer-motion';
import { FaMapMarkerAlt, FaPhone, FaWhatsapp, FaEnvelope } from 'react-icons/fa';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    const phoneNumber = '+923294432206';
    const email = 'owaisoptics2023@gmail.com';
    const address = 'Room 126, Hajveri Hostel, NUST H-12, Islamabad, Pakistan';
    const mapsUrl = 'https://maps.app.goo.gl/whuzzQNoGC6wFjdw8';

    return (
        <footer className="relative border-t border-gray-200 bg-white">
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-gray-50 to-transparent pointer-events-none" />

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="flex flex-col md:flex-row justify-between gap-8">
                    {/* Brand - Left side */}
                    <div className="space-y-4 md:max-w-sm">
                        <h3 className="text-2xl font-heading font-bold" style={{ color: '#555759' }}>
                            Owais Optics
                        </h3>
                        <p className="text-gray-500 text-sm leading-relaxed">
                            Backed by 30+ years of professional optician experience in Lahore, we bring premium eyewear services directly to NUST hostels in Islamabad.
                            <br />
                            We offer a wide range of frames, sunglasses, and lenses, all custom-fitted to your prescription.
                            No shops, no hassle, your eyewear is delivered straight to your hostel room.
                            <br />
                            Quality you can trust. Convenience you'll love.
                        </p>
                    </div>

                    {/* Contact Info - Right side */}
                    <div className="space-y-4">
                        <h4 className="text-lg font-heading font-bold" style={{ color: '#555759' }}>
                            Contact Us
                        </h4>
                        <div className="space-y-3">
                            {/* Location */}
                            <a
                                href={mapsUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-start space-x-3 text-gray-500 hover:text-primary-500 transition-colors group"
                            >
                                <FaMapMarkerAlt className="text-primary-500 group-hover:scale-110 transition-transform mt-1" />
                                <span className="text-sm">{address}</span>
                            </a>
                            {/* WhatsApp */}
                            <a
                                href={`https://wa.me/${phoneNumber.replace('+', '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center space-x-3 text-gray-500 hover:text-green-500 transition-colors group"
                            >
                                <FaWhatsapp className="text-green-500 group-hover:scale-110 transition-transform" />
                                <span className="text-sm">+92-329-4432206</span>
                            </a>

                            {/* Email */}
                            <a
                                href="https://mail.google.com/mail/?view=cm&fs=1&to=owaisoptics2023@gmail.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center space-x-3 text-gray-500 hover:text-primary-500 transition-colors group"
                            >
                                <FaEnvelope className="text-primary-500 group-hover:scale-110 transition-transform" />
                                <span className="text-sm">owaisoptics2023@gmail.com</span>
                            </a>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="mt-12 pt-6 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-gray-400 text-sm">
                        © {currentYear} Owais Optics. All rights reserved.
                    </p>
                    <div className="flex items-center space-x-4 text-sm text-gray-400">
                        <span className="flex items-center space-x-1">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            <span style={{ color: '#555759' }}>Website in Development</span>
                        </span>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
