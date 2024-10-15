import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import ClaimForm from './pages/ClaimForm';
import ClaimStatus from './pages/ClaimStatus';
import AdminDashboard from './pages/AdminDashboard';
import Login from './pages/Login';
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="flex flex-col min-h-screen">
          <Header />
          <main className="flex-grow container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-4">Warranty Claims Portal</h1>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/claim" element={<ClaimForm />} />
              <Route path="/status" element={<ClaimStatus />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/login" element={<Login />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;