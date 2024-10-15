import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isCreatingAdmin, setIsCreatingAdmin] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    const checkUserExistence = async () => {
      try {
        const response = await fetch('/api/users/check');
        if (!response.ok) {
          throw new Error('Failed to check user existence');
        }
        const data = await response.json();
        console.log('User existence check response:', data);
        if (!data.exists) {
          setIsCreatingAdmin(true);
          setError('No admin user exists. Create the first admin account.');
        }
      } catch (error) {
        console.error('Error checking user existence:', error);
        setError('Unable to check user existence. Please try again later.');
      }
    };

    checkUserExistence();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    try {
      if (isCreatingAdmin) {
        const response = await fetch('/api/admin/create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (response.ok) {
          setIsCreatingAdmin(false);
          setError('Admin created successfully. Please log in.');
        } else {
          setError(data.error || 'Failed to create admin user');
        }
      } else {
        const response = await fetch('/api/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (response.ok) {
          login(data);
          navigate(data.isAdmin ? '/admin' : '/status');
        } else {
          setError(data.error || 'Invalid credentials');
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('An error occurred during login. Please try again.');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-8">
      <h2 className="text-2xl font-bold mb-4">
        {isCreatingAdmin ? 'Create Admin Account' : 'Login'}
      </h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Password
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          />
        </div>
        <button
          type="submit"
          className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          {isCreatingAdmin ? 'Create Admin Account' : 'Login'}
        </button>
      </form>
    </div>
  );
};

export default Login;