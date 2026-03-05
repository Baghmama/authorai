import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface AuthCallbackProps {
  onAuthSuccess: () => void;
}

const AuthCallback: React.FC<AuthCallbackProps> = ({ onAuthSuccess }) => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 500));
        onAuthSuccess();
      } catch (error) {
        console.error('Error handling OAuth callback:', error);
        navigate('/auth');
      }
    };

    handleCallback();
  }, [onAuthSuccess, navigate]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
        <p className="text-gray-600">Completing sign in...</p>
      </div>
    </div>
  );
};

export default AuthCallback;
