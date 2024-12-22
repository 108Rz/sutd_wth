import { GetServerSideProps } from 'next';
import { getSession, signIn } from 'next-auth/react';
import { useState } from 'react';
import { LogIn } from 'lucide-react'; // Replacing Google with LogIn as fallback
import Head from 'next/head';
import { ThemeProvider } from '../contexts/ThemeContext';

const LoginPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      await signIn('google', { 
        callbackUrl: '/dashboard' 
      });
    } catch (error) {
      console.error('Login failed', error);
      setIsLoading(false);
    }
  };

  return (
    <ThemeProvider>
      <Head>
        <title>Login - TutorMe</title>
      </Head>
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 py-12">
        <div className="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 p-10 rounded-xl shadow-2xl">
          <div className="text-center">
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">
              Welcome to TutorMe
            </h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Sign in to access your multi-chat dashboard
            </p>
          </div>
          
          <div className="mt-8">
            <button
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full flex justify-center py-3 px-4 
                         border border-transparent rounded-md 
                         shadow-sm text-sm font-medium text-white 
                         bg-blue-600 hover:bg-blue-700 
                         focus:outline-none focus:ring-2 
                         focus:ring-offset-2 focus:ring-blue-500
                         disabled:opacity-50 disabled:cursor-wait
                         transition-colors flex items-center justify-center"
            >
              {isLoading ? (
                <span>Signing in...</span>
              ) : (
                <>
                  <LogIn className="w-5 h-5 mr-2" />
                  Sign in with Google
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </ThemeProvider>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession(context);

  if (session) {
    return {
      redirect: {
        destination: '/dashboard',
        permanent: false,
      },
    };
  }

  return {
    props: {},
  };
};

export default LoginPage;
