import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Alert, Spinner, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { authAPI, healthAPI } from '../services/api';
import '../styles/dashboard.css';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [healthProfile, setHealthProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const [userResponse, healthResponse] = await Promise.all([
        authAPI.getProfile(),
        healthAPI.getProfile()
      ]);
      
      if (userResponse.success) {
        setUser(userResponse.data);
      }
      
      if (healthResponse.success) {
        setHealthProfile(healthResponse.data);
      }
    } catch (error) {
      console.error('Fetch user data error:', error);
      setError('Failed to load dashboard data');
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

  const completionPercentage = healthProfile?.completionStatus?.overallCompletion || 0;
  const documentsCount = healthProfile?.documents?.length || 0;

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
                <h6 className="mt-2">Profile Completion</h6>
                <h4 className="text-primary">{completionPercentage}%</h4>
                <small className="text-muted">
                  {completionPercentage < 50 ? 'Getting Started' : 
                   completionPercentage < 100 ? 'Almost Done' : 'Complete'}
                </small>
              </Card.Body>
            </Card>
          </Col>
          
          <Col md={3} sm={6} className="mb-3">
            <Card className="stats-card h-100">
              <Card.Body className="text-center">
                <div style={{fontSize: '2rem', color: '#28a745'}}>🍎</div>
                <h6 className="mt-2">Foods Tracked</h6>
                <h4 className="text-success">0</h4>
                <small className="text-muted">Coming in Phase 3</small>
              </Card.Body>
            </Card>
          </Col>
          
          <Col md={3} sm={6} className="mb-3">
            <Card className="stats-card h-100">
              <Card.Body className="text-center">
                <div style={{fontSize: '2rem', color: '#ffc107'}}>⚠️</div>
                <h6 className="mt-2">Health Alerts</h6>
                <h4 className="text-warning">0</h4>
                <small className="text-muted">No alerts</small>
              </Card.Body>
            </Card>
          </Col>
          
          <Col md={3} sm={6} className="mb-3">
            <Card className="stats-card h-100">
              <Card.Body className="text-center">
                <div style={{fontSize: '2rem', color: '#17a2b8'}}>📄</div>
                <h6 className="mt-2">Documents</h6>
                <h4 className="text-info">{documentsCount}</h4>
                <small className="text-muted">Uploaded</small>
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
                <h5 className="mb-0">👤 Profile Overview</h5>
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
                
                {healthProfile?.basicInfo?.age && (
                  <>
                    <hr/>
                    <div className="mb-2">
                      <strong>Age:</strong> {healthProfile.basicInfo.age} years
                    </div>
                    {healthProfile.basicInfo.height?.value && (
                      <div className="mb-2">
                        <strong>Height:</strong> {healthProfile.basicInfo.height.value} {healthProfile.basicInfo.height.unit}
                      </div>
                    )}
                    {healthProfile.basicInfo.weight?.value && (
                      <div className="mb-2">
                        <strong>Weight:</strong> {healthProfile.basicInfo.weight.value} {healthProfile.basicInfo.weight.unit}
                      </div>
                    )}
                  </>
                )}
                
                <hr/>
                
                <div className="mb-2">
                  <strong>Health Profile</strong>
                  <div className="progress progress-custom mt-2">
                    <div 
                      className="progress-bar progress-bar-custom" 
                      style={{ width: `${completionPercentage}%` }}
                    ></div>
                  </div>
                </div>
                <small className="text-muted mt-1 d-block mb-3">
                  {completionPercentage === 100 ? 
                    'Profile complete! 🎉' : 
                    'Complete your health profile for better recommendations'
                  }
                </small>
                
                <Button as={Link} to="/health-profile" variant="primary" size="sm" className="w-100">
                  {completionPercentage === 0 ? 'Start Health Profile' : 'Update Health Profile'}
                </Button>
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
                        <h6 className="mt-2">Complete Health Profile</h6>
                        <p className="text-muted small">Fill out your complete health information for personalized recommendations</p>
                        <Button as={Link} to="/health-profile" variant="primary" size="sm">
                          {completionPercentage === 0 ? 'Get Started' : 'Continue'}
                        </Button>
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

        {/* Health Insights */}
        <Row>
          <Col md={12}>
            <Card>
              <Card.Header className="bg-white">
                <h5 className="mb-0">💡 Health Insights</h5>
              </Card.Header>
              <Card.Body>
                {completionPercentage > 0 ? (
                  <div>
                    <h6>Based on your health profile:</h6>
                    <ul className="mb-0">
                      {healthProfile?.dietaryInfo?.dietType && (
                        <li>You follow a <strong>{healthProfile.dietaryInfo.dietType}</strong> diet</li>
                      )}
                      {healthProfile?.medicalHistory?.allergies?.length > 0 && (
                        <li>You have <strong>{healthProfile.medicalHistory.allergies.length}</strong> known allergies</li>
                      )}
                      {healthProfile?.lifestyle?.activityLevel && (
                        <li>Your activity level is <strong>{healthProfile.lifestyle.activityLevel.replace('-', ' ')}</strong></li>
                      )}
                      {completionPercentage === 100 && (
                        <li className="text-success">✅ Your profile is complete! You'll get personalized recommendations soon.</li>
                      )}
                    </ul>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <div style={{fontSize: '4rem', opacity: 0.3}}>📊</div>
                    <h6 className="text-muted">Complete your health profile to see personalized insights</h6>
                    <Button as={Link} to="/health-profile" variant="primary" className="mt-2">
                      Start Health Profile
                    </Button>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Dashboard;
