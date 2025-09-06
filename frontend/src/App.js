import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

// Import components
import Navbar from './components/common/Navbar';
import ProtectedRoute from './components/common/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/Dashboard';
import HealthProfile from './pages/HealthProfile';
import FoodTracking from './pages/FoodTracking';
import MLInsights from './pages/MLInsights';  // Add this import

// Import AuthContext
import { AuthProvider } from './contexts/AuthContext';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Navbar />
          <div className="container-fluid">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/health-profile" 
                element={
                  <ProtectedRoute>
                    <HealthProfile />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/food-tracking" 
                element={
                  <ProtectedRoute>
                    <FoodTracking />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/ml-insights" 
                element={
                  <ProtectedRoute>
                    <MLInsights />
                  </ProtectedRoute>
                } 
              />
            </Routes>
          </div>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
