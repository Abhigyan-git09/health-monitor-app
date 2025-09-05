import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Alert, Spinner, Badge } from 'react-bootstrap';
import { authAPI } from '../services/api';
import '../styles/dashboard.css';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const response = await authAPI.getProfile();
      if (response.success) {
        setUser(response.data);
      }
    } catch (error) {
      console.error('Profile fetch error:', error);
      setError('Failed to load user profile');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container className="text-center dashboard-container">
        <Spinner animation="border" role="status" variant="primary" size="lg">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p className="mt-3 text-muted">Loading your dashboard...</p>
      </Container>
    );
  }

  return (
    <div className="dashboard-container">
      <Container>
        {/* Welcome Header */}
        <Row>
          <Col md={12}>
            <Card className="welcome-card">
              <Card.Body className="text-center py-4">
                <h2>Welcome back, {user?.name}! 👋</h2>
                <p className="mb-0">Your health monitoring dashboard is ready to help you stay healthy</p>
              </Card.Body>
            </Card>
          </Col>
        </Row>
        
        {error && (
          <Row>
            <Col md={12}>
              <Alert variant="danger">{error}</Alert>
            </Col>
          </Row>
        )}

        {/* Stats Cards */}
        <Row className="mb-4">
          <Col md={3} sm={6} className="mb-3">
            <Card className="stats-card h-100">
              <Card.Body className="text-center">
                <div style={{fontSize: '2rem', color: '#007bff'}}>📊</div>
                <h6 className="mt-2">Health Score</h6>
                <h4 className="text-primary">85/100</h4>
                <small className="text-muted">Good</small>
              </Card.Body>
            </Card>
          </Col>
          
          <Col md={3} sm={6} className="mb-3">
            <Card className="stats-card h-100">
              <Card.Body className="text-center">
                <div style={{fontSize: '2rem', color: '#28a745'}}>🍎</div>
                <h6 className="mt-2">Foods Tracked</h6>
                <h4 className="text-success">0</h4>
                <small className="text-muted">This week</small>
              </Card.Body>
            </Card>
          </Col>
          
          <Col md={3} sm={6} className="mb-3">
            <Card className="stats-card h-100">
              <Card.Body className="text-center">
                <div style={{fontSize: '2rem', color: '#ffc107'}}>⚠️</div>
                <h6 className="mt-2">Warnings</h6>
                <h4 className="text-warning">0</h4>
                <small className="text-muted">Total</small>
              </Card.Body>
            </Card>
          </Col>
          
          <Col md={3} sm={6} className="mb-3">
            <Card className="stats-card h-100">
              <Card.Body className="text-center">
                <div style={{fontSize: '2rem', color: '#17a2b8'}}>💡</div>
                <h6 className="mt-2">Recommendations</h6>
                <h4 className="text-info">5</h4>
                <small className="text-muted">Available</small>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Main Content */}
        <Row>
          {/* Profile Section */}
          <Col md={4}>
            <Card className="profile-card mb-4">
              <Card.Header className="bg-white">
                <h5 className="mb-0">👤 Profile Information</h5>
              </Card.Header>
              <Card.Body>
                <div className="mb-3">
                  <strong>Name:</strong> {user?.name}
                </div>
                <div className="mb-3">
                  <strong>Email:</strong> {user?.email}
                </div>
                <div className="mb-3">
                  <strong>Member Since:</strong><br/>
                  <small className="text-muted">{new Date(user?.createdAt).toLocaleDateString()}</small>
                </div>
                
                <hr/>
                
                <div className="mb-2">
                  <strong>Profile Completion</strong>
                  <Badge bg="warning" className="float-end">20%</Badge>
                </div>
                <div className="progress progress-custom">
                  <div 
                    className="progress-bar progress-bar-custom" 
                    style={{ width: '20%' }}
                  ></div>
                </div>
                <small className="text-muted mt-1 d-block">Complete your health profile to get better recommendations</small>
              </Card.Body>
            </Card>
          </Col>
          
          {/* Quick Actions */}
          <Col md={8}>
            <Card className="mb-4">
              <Card.Header className="bg-white">
                <h5 className="mb-0">🚀 Quick Actions</h5>
              </Card.Header>
              <Card.Body>
                <Row>
                  <Col md={6} className="mb-3">
                    <Card className="feature-card">
                      <Card.Body className="text-center">
                        <div style={{fontSize: '3rem'}}>📋</div>
                        <h6 className="mt-2">Health Questionnaire</h6>
                        <p className="text-muted small">Complete your health profile for personalized recommendations</p>
                        <div className="coming-soon-badge">Coming in Phase 2!</div>
                      </Card.Body>
                    </Card>
                  </Col>
                  
                  <Col md={6} className="mb-3">
                    <Card className="feature-card">
                      <Card.Body className="text-center">
                        <div style={{fontSize: '3rem'}}>🍕</div>
                        <h6 className="mt-2">Food Tracking</h6>
                        <p className="text-muted small">Monitor your food orders and get instant health warnings</p>
                        <div className="coming-soon-badge">Coming in Phase 3!</div>
                      </Card.Body>
                    </Card>
                  </Col>
                  
                  <Col md={6} className="mb-3">
                    <Card className="feature-card">
                      <Card.Body className="text-center">
                        <div style={{fontSize: '3rem'}}>🤖</div>
                        <h6 className="mt-2">AI Recommendations</h6>
                        <p className="text-muted small">Get personalized health and food suggestions</p>
                        <div className="coming-soon-badge">Coming in Phase 4!</div>
                      </Card.Body>
                    </Card>
                  </Col>
                  
                  <Col md={6} className="mb-3">
                    <Card className="feature-card">
                      <Card.Body className="text-center">
                        <div style={{fontSize: '3rem'}}>📈</div>
                        <h6 className="mt-2">Health Reports</h6>
                        <p className="text-muted small">View detailed analytics of your health progress</p>
                        <div className="coming-soon-badge">Coming Soon!</div>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Recent Activity */}
        <Row>
          <Col md={12}>
            <Card>
              <Card.Header className="bg-white">
                <h5 className="mb-0">📅 Recent Activity</h5>
              </Card.Header>
              <Card.Body>
                <div className="text-center py-4">
                  <div style={{fontSize: '4rem', opacity: 0.3}}>📊</div>
                  <h6 className="text-muted">No recent activity</h6>
                  <p className="text-muted small">Complete your profile and start tracking food to see activity here</p>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Dashboard;
