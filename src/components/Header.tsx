import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Header: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <header className="bg-blue-600 text-white shadow-md">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="flex items-center space-x-2">
          <ShieldCheck size={24} />
          <span className="text-xl font-bold">Warranty Claims</span>
        </Link>
        <nav>
          <ul className="flex space-x-4">
            <li><Link to="/" className="hover:text-blue-200">Home</Link></li>
            <li><Link to="/claim" className="hover:text-blue-200">New Claim</Link></li>
            <li><Link to="/status" className="hover:text-blue-200">Check Status</Link></li>
            {user ? (
              <>
                {user.isAdmin && (
                  <li><Link to="/admin" className="hover:text-blue-200">Admin</Link></li>
                )}
                <li><button onClick={logout} className="hover:text-blue-200">Logout</button></li>
              </>
            ) : (
              <li><Link to="/login" className="hover:text-blue-200">Login</Link></li>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;