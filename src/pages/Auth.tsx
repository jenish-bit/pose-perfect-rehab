
import { useState } from 'react';
import { SignInForm } from '@/components/auth/SignInForm';
import { SignUpForm } from '@/components/auth/SignUpForm';

const Auth = () => {
  const [isSignIn, setIsSignIn] = useState(true);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {isSignIn ? (
          <SignInForm onToggleMode={() => setIsSignIn(false)} />
        ) : (
          <SignUpForm onToggleMode={() => setIsSignIn(true)} />
        )}
      </div>
    </div>
  );
};

export default Auth;
