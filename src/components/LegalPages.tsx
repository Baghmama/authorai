import React from 'react';
import { ArrowLeft, Mail, Phone, MapPin, Linkedin, Twitter, RefreshCw, Users } from 'lucide-react';

interface LegalPagesProps {
  currentPage: 'contact' | 'refund' | 'about' | null;
  onClose: () => void;
}

const LegalPages: React.FC<LegalPagesProps> = ({ currentPage, onClose }) => {
  if (!currentPage) return null;

  const renderContactPage = () => (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <div className="bg-gradient-to-r from-orange-500 to-yellow-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <Mail className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Contact Us</h1>
        <p className="text-gray-600">Get in touch with our team</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Contact Information */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Get in Touch</h2>
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="bg-orange-100 p-3 rounded-full">
                <Mail className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Email</p>
                <a
                  href="mailto:sv@goodaiclub.com"
                  className="text-orange-600 hover:text-orange-700"
                >
                  sv@goodaiclub.com
                </a>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="bg-orange-100 p-3 rounded-full">
                <Phone className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Phone</p>
                <a
                  href="tel:+919144433606"
                  className="text-orange-600 hover:text-orange-700"
                >
                  +91 9144433606
                </a>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="bg-orange-100 p-3 rounded-full">
                <MapPin className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Address</p>
                <p className="text-gray-600">
                  Joypur, Bongaon, 24 pgs (north),<br />
                  West Bengal, India
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Social Media & Support */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Follow Us</h2>
          <div className="space-y-4">
            <a
              href="https://linkedin.com/company/startup-verify"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="bg-blue-100 p-3 rounded-full">
                <Linkedin className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">LinkedIn</p>
                <p className="text-gray-600">Startup Verify</p>
              </div>
            </a>

            <a
              href="https://x.com/startupVHQ"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="bg-blue-100 p-3 rounded-full">
                <Twitter className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">X (Twitter)</p>
                <p className="text-gray-600">@startupVHQ</p>
              </div>
            </a>
          </div>

          <div className="mt-8 p-4 bg-orange-50 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-2">Support Hours</h3>
            <p className="text-sm text-gray-600">
              Monday - Friday: 9:00 AM - 6:00 PM IST<br />
              Saturday: 10:00 AM - 4:00 PM IST<br />
              Sunday: Closed
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderRefundPage = () => (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <div className="bg-gradient-to-r from-green-500 to-green-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <RefreshCw className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Refund Policy</h1>
        <p className="text-gray-600">Our commitment to customer satisfaction</p>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="prose max-w-none">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Refund Policy</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Credit Purchases</h3>
              <p className="text-gray-700">
                We offer a 7-day refund policy for credit purchases. If you're not satisfied with your 
                purchase, you can request a full refund within 7 days of the transaction date.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Refund Conditions</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>Refund requests must be made within 7 days of purchase</li>
                <li>Credits must not have been used for chapter generation</li>
                <li>Original payment method will be used for refunds</li>
                <li>Processing time: 5-10 business days</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">How to Request a Refund</h3>
              <ol className="list-decimal list-inside text-gray-700 space-y-2">
                <li>Contact us at <a href="mailto:sv@goodaiclub.com" className="text-orange-600 hover:text-orange-700">sv@goodaiclub.com</a></li>
                <li>Include your transaction ID and reason for refund</li>
                <li>Our team will review your request within 24 hours</li>
                <li>Once approved, refund will be processed to your original payment method</li>
              </ol>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Non-Refundable Items</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>Credits that have been used for chapter generation</li>
                <li>Promotional or bonus credits</li>
                <li>Refund requests made after 7 days</li>
              </ul>
            </div>

            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <h3 className="text-lg font-medium text-orange-900 mb-2">Need Help?</h3>
              <p className="text-orange-800">
                If you have any questions about our refund policy, please don't hesitate to contact us at{' '}
                <a href="mailto:sv@goodaiclub.com" className="font-medium underline">
                  sv@goodaiclub.com
                </a>{' '}
                or call us at{' '}
                <a href="tel:+919144433606" className="font-medium underline">
                  +91 9144433606
                </a>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAboutPage = () => (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <Users className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">About Us</h1>
        <p className="text-gray-600">Empowering authors with AI technology</p>
      </div>

      <div className="space-y-8">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Our Mission</h2>
          <p className="text-gray-700 leading-relaxed">
            At Author AI, we believe that everyone has a story to tell. Our mission is to democratize 
            book writing by leveraging the power of artificial intelligence to help aspiring authors 
            transform their ideas into complete, professional-quality books.
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">What We Do</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Author AI is an innovative platform that uses advanced AI technology to help you:
          </p>
          <ul className="list-disc list-inside text-gray-700 space-y-2">
            <li>Generate detailed chapter outlines from your book ideas</li>
            <li>Create full-length chapters with engaging content</li>
            <li>Support multiple languages and book types</li>
            <li>Export your completed book in PDF and Word formats</li>
          </ul>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Our Story</h2>
          <p className="text-gray-700 leading-relaxed">
            Founded by the team at Startup Verify, Author AI was born from the recognition that 
            traditional book writing can be time-consuming and challenging. We saw an opportunity 
            to use AI to streamline the creative process while maintaining the author's unique voice 
            and vision. Our platform has helped hundreds of writers bring their ideas to life, 
            from fiction novels to educational content.
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Innovation</h3>
              <p className="text-gray-700">
                We continuously improve our AI technology to provide the best writing assistance.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Accessibility</h3>
              <p className="text-gray-700">
                Making book writing accessible to everyone, regardless of their writing experience.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Quality</h3>
              <p className="text-gray-700">
                Ensuring every generated book meets high standards of content and structure.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Support</h3>
              <p className="text-gray-700">
                Providing excellent customer service and support throughout your writing journey.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl border border-orange-200 p-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Get Started Today</h2>
          <p className="text-gray-700 mb-4">
            Ready to turn your book idea into reality? Join thousands of authors who have already 
            used Author AI to create their books.
          </p>
          <button
            onClick={onClose}
            className="bg-gradient-to-r from-orange-500 to-yellow-500 text-white px-6 py-3 rounded-lg hover:from-orange-600 hover:to-yellow-600 transition-all duration-200"
          >
            Start Writing Your Book
          </button>
        </div>
      </div>
    </div>
  );

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'contact':
        return renderContactPage();
      case 'refund':
        return renderRefundPage();
      case 'about':
        return renderAboutPage();
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={onClose}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Author AI</span>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="py-12 px-4 sm:px-6 lg:px-8">
        {renderCurrentPage()}
      </div>
    </div>
  );
};

export default LegalPages;