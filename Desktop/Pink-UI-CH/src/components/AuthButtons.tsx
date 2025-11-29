import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const AuthButtons: React.FC = () => {
  const { signInWithProvider } = useAuth();

  const handleFacebook = async () => {
    try {
      await signInWithProvider('facebook');
    } catch (err) {
      console.error('Facebook sign-in error', err);
      alert('Unable to start Facebook OAuth flow. Check console for details.');
    }
  };

  return (
    <div className="flex gap-3">
      <button
        className="px-4 py-2 rounded-md bg-white border shadow-sm text-sm"
        onClick={handleFacebook}
        aria-label="Sign in with Facebook"
      >
        Sign in with Facebook
      </button>
    </div>
  );
};

export default AuthButtons;
