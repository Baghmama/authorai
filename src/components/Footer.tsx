import React from 'react';
import { Mail, Phone, MapPin, Linkedin, Twitter } from 'lucide-react';

interface FooterProps {
  onPageChange?: (page: 'contact' | 'refund' | 'about' | 'terms' | 'privacy' | null) => void;
}

const Footer: React.FC<FooterProps> = ({ onPageChange }) => {
  return (
    <footer className="bg-gray-900 dark:bg-gray-950 text-white transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-xl font-bold mb-4">Author AI</h3>
            <p className="text-gray-300 dark:text-gray-400 mb-4 max-w-md">
              Transform your ideas into complete books using the power of artificial intelligence. 
              Create professional-quality content in minutes, not months.
            </p>
            <div className="flex space-x-4">
              <a
                href="https://x.com/startupVHQ"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 dark:text-gray-500 hover:text-white dark:hover:text-gray-300 transition-colors"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="https://linkedin.com/company/startup-verify"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 dark:text-gray-500 hover:text-white dark:hover:text-gray-300 transition-colors"
              >
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => onPageChange?.('about')}
                  className="text-gray-300 dark:text-gray-400 hover:text-white dark:hover:text-gray-200 transition-colors text-left"
                >
                  About Us
                </button>
              </li>
              <li>
                <button
                  onClick={() => onPageChange?.('contact')}
                  className="text-gray-300 dark:text-gray-400 hover:text-white dark:hover:text-gray-200 transition-colors text-left"
                >
                  Contact Us
                </button>
              </li>
              <li>
                <button
                  onClick={() => onPageChange?.('refund')}
                  className="text-gray-300 dark:text-gray-400 hover:text-white dark:hover:text-gray-200 transition-colors text-left"
                >
                  Refund Policy
                </button>
              </li>
              <li>
                <button
                  onClick={() => onPageChange?.('terms')}
                  className="text-gray-300 dark:text-gray-400 hover:text-white dark:hover:text-gray-200 transition-colors text-left"
                >
                  Terms & Conditions
                </button>
              </li>
              <li>
                <button
                  onClick={() => onPageChange?.('privacy')}
                  className="text-gray-300 dark:text-gray-400 hover:text-white dark:hover:text-gray-200 transition-colors text-left"
                >
                  Privacy Policy
                </button>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact Info</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Mail className="h-4 w-4 text-gray-400" />
                <a
                  href="mailto:sv@goodaiclub.com"
                  className="text-gray-300 dark:text-gray-400 hover:text-white dark:hover:text-gray-200 transition-colors text-sm"
                >
                  sv@goodaiclub.com
                </a>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-4 w-4 text-gray-400" />
                <a
                  href="tel:+919144433606"
                  className="text-gray-300 dark:text-gray-400 hover:text-white dark:hover:text-gray-200 transition-colors text-sm"
                >
                  +91 9144433606
                </a>
              </div>
              <div className="flex items-start space-x-3">
                <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                <span className="text-gray-300 dark:text-gray-400 text-sm">
                  Joypur, Bongaon, 24 pgs (north),<br />
                  West Bengal, India
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 dark:border-gray-700 mt-8 pt-8 text-center">
          <p className="text-gray-400 dark:text-gray-500 text-sm">
            © {new Date().getFullYear()} Author AI. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;