import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, MapPin, Linkedin, Twitter, Gift, ChevronUp, ExternalLink } from 'lucide-react';
import FreeCreditsModal from './FreeCreditsModal';
import { supabase } from '../lib/supabase';

interface FooterProps {
  collapsible?: boolean;
}

const Footer: React.FC<FooterProps> = ({ collapsible = false }) => {
  const [showModal, setShowModal] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);

  React.useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id || null);
    };
    getUser();
  }, []);

  const handleOpenModal = () => {
    if (userId) {
      setShowModal(true);
    }
  };

  if (collapsible) {
    return (
      <>
        <footer className="bg-slate-900 border-t border-slate-800">
          <div
            className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-12 cursor-pointer select-none"
            onClick={() => setExpanded(!expanded)}
          >
            <span className="text-sm font-semibold text-white tracking-wide">Author AI</span>

            <div className="flex items-center gap-3">
              {userId && (
                <button
                  onClick={(e) => { e.stopPropagation(); handleOpenModal(); }}
                  className="flex items-center gap-1.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:from-orange-600 hover:to-amber-600 transition-all shadow-sm"
                >
                  <Gift className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Free Credits</span>
                </button>
              )}
              <button
                className={`p-1 rounded-md text-slate-400 hover:text-white hover:bg-white/10 transition-all duration-200 ${expanded ? '' : 'rotate-180'}`}
                aria-label={expanded ? 'Collapse footer' : 'Expand footer'}
              >
                <ChevronUp className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div
            className={`overflow-hidden transition-all duration-300 ease-in-out ${
              expanded ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
            }`}
          >
            <div className="border-t border-slate-800">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div>
                    <p className="text-slate-400 text-sm leading-relaxed">
                      Transform your ideas into complete books using AI. Professional-quality content in minutes.
                    </p>
                    <div className="flex gap-3 mt-3">
                      <a href="https://x.com/shuvodip99" target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-white transition-colors">
                        <Twitter className="h-4 w-4" />
                      </a>
                      <a href="https://linkedin.com/company/startup-verify" target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-white transition-colors">
                        <Linkedin className="h-4 w-4" />
                      </a>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Links</h4>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                      {[
                        { to: '/about', label: 'About' },
                        { to: '/contact', label: 'Contact' },
                        { to: '/refund', label: 'Refund Policy' },
                        { to: '/terms', label: 'Terms' },
                        { to: '/privacy', label: 'Privacy' },
                      ].map((link) => (
                        <Link key={link.to} to={link.to} className="text-slate-400 hover:text-white text-sm transition-colors flex items-center gap-1 group">
                          {link.label}
                          <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </Link>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Contact</h4>
                    <div className="space-y-2">
                      <a href="mailto:sv@goodaiclub.com" className="flex items-center gap-2 text-slate-400 hover:text-white text-sm transition-colors">
                        <Mail className="h-3.5 w-3.5 flex-shrink-0" />
                        sv@goodaiclub.com
                      </a>
                      <div className="flex items-start gap-2 text-slate-400 text-sm">
                        <MapPin className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
                        <span>Joypur, Bongaon, West Bengal, India</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-800 mt-5 pt-4 text-center">
                  <p className="text-slate-500 text-xs">
                    &copy; {new Date().getFullYear()} Author AI. All rights reserved.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </footer>

        {userId && (
          <FreeCreditsModal isOpen={showModal} onClose={() => setShowModal(false)} userId={userId} />
        )}
      </>
    );
  }

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {userId && (
          <div className="mb-8 flex justify-center">
            <button
              onClick={handleOpenModal}
              className="bg-gradient-to-r from-orange-500 to-yellow-500 text-white px-8 py-4 rounded-xl font-bold text-lg hover:shadow-2xl hover:scale-105 transition-all duration-200 flex items-center gap-3"
            >
              <Gift className="h-6 w-6" />
              Get 450 Free Credits - Complete 3 Simple Tasks!
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-xl font-bold mb-4">Author AI</h3>
            <p className="text-gray-300 mb-4 max-w-md">
              Transform your ideas into complete books using the power of artificial intelligence.
              Create professional-quality content in minutes, not months.
            </p>
            <div className="flex space-x-4">
              <a href="https://x.com/shuvodip99" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="https://linkedin.com/company/startup-verify" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li><Link to="/about" className="text-gray-300 hover:text-white transition-colors">About Us</Link></li>
              <li><Link to="/contact" className="text-gray-300 hover:text-white transition-colors">Contact Us</Link></li>
              <li><Link to="/refund" className="text-gray-300 hover:text-white transition-colors">Refund Policy</Link></li>
              <li><Link to="/terms" className="text-gray-300 hover:text-white transition-colors">Terms & Conditions</Link></li>
              <li><Link to="/privacy" className="text-gray-300 hover:text-white transition-colors">Privacy Policy</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">Contact Info</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Mail className="h-4 w-4 text-gray-400" />
                <a href="mailto:sv@goodaiclub.com" className="text-gray-300 hover:text-white transition-colors text-sm">sv@goodaiclub.com</a>
              </div>
              <div className="flex items-start space-x-3">
                <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                <span className="text-gray-300 text-sm">
                  Joypur, Bongaon, 24 pgs (north),<br />
                  West Bengal, India
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-gray-400 text-sm">
            &copy; {new Date().getFullYear()} Author AI. All rights reserved.
          </p>
        </div>
      </div>

      {userId && (
        <FreeCreditsModal isOpen={showModal} onClose={() => setShowModal(false)} userId={userId} />
      )}
    </footer>
  );
};

export default Footer;
