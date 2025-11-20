import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Phone, MapPin, Linkedin, Twitter, RefreshCw, Users, FileText, Shield, BookOpen } from 'lucide-react';

interface LegalPagesProps {
  currentPage: 'contact' | 'refund' | 'about' | 'terms' | 'privacy' | null;
  onClose?: () => void;
}

const LegalPages: React.FC<LegalPagesProps> = ({ currentPage, onClose }) => {
  const navigate = useNavigate();

  if (!currentPage) return null;

  const handleBackClick = () => {
    navigate('/');
  };

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
              href="https://x.com/shuvodip99"
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
            type="button"
          >
            Start Writing Your Book
          </button>
        </div>
      </div>
    </div>
  );

  const renderTermsPage = () => (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <FileText className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Terms & Conditions</h1>
        <p className="text-gray-600">Terms of service for Author AI</p>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="prose max-w-none">
          <p className="text-sm text-gray-500 mb-6">Last updated: {new Date().toLocaleDateString()}</p>
          
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">1. Acceptance of Terms</h2>
              <p className="text-gray-700">
                By accessing and using Author AI, you accept and agree to be bound by the terms and 
                provision of this agreement. If you do not agree to abide by the above, please do not 
                use this service.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">2. Service Description</h2>
              <p className="text-gray-700 mb-3">
                Author AI is an AI-powered platform that helps users create books by:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>Generating chapter outlines from user-provided ideas</li>
                <li>Creating full chapter content using artificial intelligence</li>
                <li>Providing book compilation and export features</li>
                <li>Supporting multiple languages and book types</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">3. User Accounts and Credits</h2>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>Users must create an account to access the service</li>
                <li>New users receive 30 free credits upon registration</li>
                <li>Chapter generation costs 6 credits per chapter</li>
                <li>Additional credits can be purchased through our payment system</li>
                <li>Credits are non-transferable and non-refundable once used</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">4. Content and Intellectual Property</h2>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>Users retain ownership of their original ideas and concepts</li>
                <li>AI-generated content is provided as-is for user modification and use</li>
                <li>Users are responsible for ensuring content originality and avoiding plagiarism</li>
                <li>Author AI does not claim ownership of user-generated books</li>
                <li>Users grant Author AI the right to use anonymized data for service improvement</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">5. Prohibited Uses</h2>
              <p className="text-gray-700 mb-3">You may not use Author AI to:</p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>Generate content that is illegal, harmful, or violates third-party rights</li>
                <li>Create content that promotes hate speech, violence, or discrimination</li>
                <li>Attempt to reverse engineer or exploit the AI system</li>
                <li>Share account credentials or transfer credits to other users</li>
                <li>Use the service for commercial resale without permission</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">6. Payment and Refunds</h2>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>Credit purchases are processed through secure payment systems</li>
                <li>Refunds are available within 7 days for unused credits</li>
                <li>Used credits are non-refundable</li>
                <li>Prices are subject to change with notice</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">7. Limitation of Liability</h2>
              <p className="text-gray-700">
                Author AI provides the service "as is" without warranties. We are not liable for 
                any damages arising from the use of AI-generated content. Users are responsible 
                for reviewing and editing all generated content before publication or distribution.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">8. Termination</h2>
              <p className="text-gray-700">
                We reserve the right to terminate accounts that violate these terms. Users may 
                delete their accounts at any time. Upon termination, unused credits will be 
                forfeited unless eligible for refund under our refund policy.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">9. Changes to Terms</h2>
              <p className="text-gray-700">
                We may update these terms from time to time. Users will be notified of significant 
                changes via email or platform notification. Continued use of the service constitutes 
                acceptance of updated terms.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">10. Contact Information</h2>
              <p className="text-gray-700">
                For questions about these terms, please contact us at{' '}
                <a href="mailto:sv@goodaiclub.com" className="text-orange-600 hover:text-orange-700 underline">
                  sv@goodaiclub.com
                </a>{' '}
                or call{' '}
                <a href="tel:+919144433606" className="text-orange-600 hover:text-orange-700 underline">
                  +91 9144433606
                </a>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPrivacyPage = () => (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <Shield className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
        <p className="text-gray-600">How we protect and use your information</p>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="prose max-w-none">
          <p className="text-sm text-gray-500 mb-6">Last updated: {new Date().toLocaleDateString()}</p>
          
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">1. Information We Collect</h2>
              <div className="space-y-3">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Account Information</h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-1">
                    <li>Email address for account creation and communication</li>
                    <li>Password (encrypted and never stored in plain text)</li>
                    <li>Account creation and last login timestamps</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Usage Data</h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-1">
                    <li>Book ideas and content you create</li>
                    <li>Credit usage and transaction history</li>
                    <li>Feature usage patterns and preferences</li>
                    <li>Technical data like IP address and browser information</li>
                  </ul>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">2. How We Use Your Information</h2>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>Provide and improve our AI book generation services</li>
                <li>Process payments and manage your credit balance</li>
                <li>Send important account and service notifications</li>
                <li>Analyze usage patterns to enhance user experience</li>
                <li>Provide customer support and respond to inquiries</li>
                <li>Ensure platform security and prevent abuse</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">3. Information Sharing</h2>
              <p className="text-gray-700 mb-3">We do not sell your personal information. We may share data in these limited circumstances:</p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li><strong>Service Providers:</strong> Third-party services that help us operate (payment processing, hosting)</li>
                <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
                <li><strong>Business Transfers:</strong> In case of merger, acquisition, or sale of assets</li>
                <li><strong>Anonymized Data:</strong> Aggregated, non-identifiable data for research and improvement</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">4. Data Security</h2>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>All data is encrypted in transit and at rest</li>
                <li>We use industry-standard security measures</li>
                <li>Regular security audits and updates</li>
                <li>Limited access to personal data by authorized personnel only</li>
                <li>Secure payment processing through trusted providers</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">5. Your Rights and Choices</h2>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li><strong>Access:</strong> Request a copy of your personal data</li>
                <li><strong>Correction:</strong> Update or correct your account information</li>
                <li><strong>Deletion:</strong> Request deletion of your account and data</li>
                <li><strong>Portability:</strong> Export your created content</li>
                <li><strong>Opt-out:</strong> Unsubscribe from marketing communications</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">6. Cookies and Tracking</h2>
              <p className="text-gray-700">
                We use essential cookies for authentication and service functionality. We do not use 
                tracking cookies for advertising purposes. You can control cookie settings through 
                your browser preferences.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">7. Data Retention</h2>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>Account data is retained while your account is active</li>
                <li>Content and books are stored until you delete them</li>
                <li>Transaction records are kept for 7 years for legal compliance</li>
                <li>Deleted accounts are permanently removed within 30 days</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">8. International Data Transfers</h2>
              <p className="text-gray-700">
                Your data may be processed in countries other than your own. We ensure appropriate 
                safeguards are in place to protect your information in accordance with this privacy policy.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">9. Children's Privacy</h2>
              <p className="text-gray-700">
                Author AI is not intended for children under 13. We do not knowingly collect personal 
                information from children under 13. If we become aware of such collection, we will 
                delete the information immediately.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">10. Changes to Privacy Policy</h2>
              <p className="text-gray-700">
                We may update this privacy policy from time to time. We will notify you of any 
                material changes via email or platform notification. Your continued use of the 
                service constitutes acceptance of the updated policy.
              </p>
            </div>

            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <h2 className="text-xl font-semibold text-orange-900 mb-4">Contact Us About Privacy</h2>
              <p className="text-orange-800">
                If you have questions about this privacy policy or want to exercise your rights, 
                please contact us at{' '}
                <a href="mailto:sv@goodaiclub.com" className="font-medium underline">
                  sv@goodaiclub.com
                </a>{' '}
                or call{' '}
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

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'contact':
        return renderContactPage();
      case 'refund':
        return renderRefundPage();
      case 'about':
        return renderAboutPage();
      case 'terms':
        return renderTermsPage();
      case 'privacy':
        return renderPrivacyPage();
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={handleBackClick}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Back to Author AI</span>
            </button>
            
            <div className="flex items-center space-x-3">
              <img 
                src="/android-chrome-192x192.png" 
                alt="Author AI Logo" 
                className="h-6 w-6 rounded-lg"
              />
              <h1 className="font-poppins text-xl font-bold text-gray-900">
                Author AI
              </h1>
            </div>
          </div>
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