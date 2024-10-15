import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, Search } from 'lucide-react';

const Home: React.FC = () => {
  return (
    <div className="text-center">
      <h1 className="text-4xl font-bold mb-8">Welcome to Our Warranty Claims Portal</h1>
      <p className="text-xl mb-8">Easy and efficient warranty claim management for our valued customers.</p>
      <div className="flex justify-center space-x-4">
        <Link to="/claim" className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded inline-flex items-center">
          <FileText className="mr-2" />
          Submit a Claim
        </Link>
        <Link to="/status" className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded inline-flex items-center">
          <Search className="mr-2" />
          Check Claim Status
        </Link>
      </div>
    </div>
  );
};

export default Home;