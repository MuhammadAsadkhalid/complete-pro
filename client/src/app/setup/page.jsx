'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { BoltIcon } from '@heroicons/react/24/outline';

export default function Setup() {
  const router = useRouter();
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [credentials, setCredentials] = useState(null);
  const [adminStatus, setAdminStatus] = useState(null);

  useEffect(() => {
    checkAdminStatus();
  }, []);

  const checkAdminStatus = async () => {
    try {
      const response = await axios.get('/api/auth/check');
      setAdminStatus(response.data);
    } catch (error) {
      console.error('Error checking admin status:', error);
    }
  };

  const handleSetup = async () => {
    try {
      setIsLoading(true);
      const response = await axios.post('/api/auth/setup');
      setMessage('Setup completed successfully!');
      setCredentials(response.data.defaultCredentials);
      checkAdminStatus();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Setup failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <BoltIcon className="h-12 w-12 text-blue-600" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Al-Zafar Electronics
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          System Setup
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="space-y-6">
            {adminStatus && (
              <div className={`p-4 rounded-md ${
                adminStatus.adminExists ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'
              }`}>
                {adminStatus.adminExists ? (
                  <>
                    <h3 className="font-medium">Admin User Status</h3>
                    <p>An admin user already exists with username: {adminStatus.username}</p>
                    <p className="mt-2">You can proceed to login.</p>
                  </>
                ) : (
                  <>
                    <h3 className="font-medium">No Admin User Found</h3>
                    <p>Click the button below to create an admin user.</p>
                  </>
                )}
              </div>
            )}

            {message && (
              <div className={`p-4 rounded-md ${
                message.includes('failed') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'
              }`}>
                {message}
              </div>
            )}

            {credentials && (
              <div className="bg-blue-50 p-4 rounded-md">
                <h3 className="text-lg font-medium text-blue-900 mb-2">Default Credentials:</h3>
                <p className="text-blue-700">Username: {credentials.username}</p>
                <p className="text-blue-700">Password: {credentials.password}</p>
                <p className="mt-2 text-sm text-blue-600">
                  Please save these credentials and change the password after logging in.
                </p>
              </div>
            )}

            <div>
              <button
                onClick={handleSetup}
                disabled={isLoading || adminStatus?.adminExists}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {isLoading ? 'Setting up...' : 'Initialize Admin User'}
              </button>
            </div>

            <div className="text-center">
              <button
                onClick={() => router.push('/login')}
                className="text-blue-600 hover:text-blue-500"
              >
                Go to Login
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 