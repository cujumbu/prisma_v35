import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { sendStatusUpdateEmail } from '../utils/emailService';

interface Claim {
  id: string;
  orderNumber: string;
  email: string;
  name: string;
  status: string;
  submissionDate: string;
}

const AdminDashboard: React.FC = () => {
  const [claims, setClaims] = useState<Claim[]>([]);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || !user.isAdmin) {
      navigate('/login');
      return;
    }

    const fetchClaims = async () => {
      try {
        const response = await fetch('/api/claims');
        if (!response.ok) {
          throw new Error('Failed to fetch claims');
        }
        const claimsData = await response.json();
        setClaims(claimsData);
      } catch (error) {
        console.error('Error fetching claims:', error);
      }
    };

    fetchClaims();
  }, [user, navigate]);

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/claims/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update claim status');
      }

      const updatedClaim = await response.json();

      setClaims(prevClaims => prevClaims.map(claim =>
        claim.id === id ? { ...claim, status: newStatus } : claim
      ));

      // Send email notification
      await sendStatusUpdateEmail(updatedClaim.email, updatedClaim.orderNumber, newStatus);
    } catch (error) {
      console.error('Error updating claim status:', error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead>
            <tr>
              <th className="px-6 py-3 border-b-2 border-gray-300 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Order Number
              </th>
              <th className="px-6 py-3 border-b-2 border-gray-300 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 border-b-2 border-gray-300 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 border-b-2 border-gray-300 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 border-b-2 border-gray-300 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Submission Date
              </th>
              <th className="px-6 py-3 border-b-2 border-gray-300 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {claims.map((claim) => (
              <tr key={claim.id}>
                <td className="px-6 py-4 whitespace-nowrap">{claim.orderNumber}</td>
                <td className="px-6 py-4 whitespace-nowrap">{claim.name}</td>
                <td className="px-6 py-4 whitespace-nowrap">{claim.email}</td>
                <td className="px-6 py-4 whitespace-nowrap">{claim.status}</td>
                <td className="px-6 py-4 whitespace-nowrap">{new Date(claim.submissionDate).toLocaleString()}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <select
                    value={claim.status}
                    onChange={(e) => handleStatusChange(claim.id, e.target.value)}
                    className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  >
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminDashboard;