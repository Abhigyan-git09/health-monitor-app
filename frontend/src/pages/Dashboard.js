import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Alert, Badge } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import { healthAPI, foodAPI, mlAPI } from '../services/api';

const Dashboard = () => {
  const { user } = useAuth();
  const [healthProfile, setHealthProfile] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [quickInsights, setQuickInsights] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch health profile
      const profileResponse = await healthAPI.getHealthProfile();
      if (profileResponse.success) {
        setHealthProfile(profileResponse.data);
      }

      // Fetch recent orders
      const ordersResponse = await foodAPI.getUserOrders({ limit: 5 });
      if (ordersResponse.success) {
        setRecentOrders(ordersResponse.data);
      }

      // Fetch quick insights if user has data
      if (profileResponse.data && ordersResponse.data.length > 0) {
        const insightsResponse = await mlAPI.getHealthRiskAssessment();
        if (insightsResponse.success) {
          setQuickInsights(insightsResponse.risk_assessment);
        }
      }
    } catch (error) {
      console.error('Dashboard data error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCompletionBadge = (status) => {
    if (status >= 80) return <Badge bg="success">Complete</Badge>;
    if (status >= 50) return <Badge bg="warning">In Progress</Badge>;
    return <Badge bg="secondary">Not Started</Badge>;
  };

  const getHealthScoreColor = (score) => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'warning';
    return 'danger';
  };

  if (loading) {
    return (
      <Container className="mt-4">
        <div className="text-center">
          <div style={{fontSize: '3rem'}}>⏳</div>
          <p>Loading your health dashboard...</p>
        </div>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <Row>
        <Col md={12}>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h2>Welcome back, {user?.name}! 👋</h2>
              <p className="text-muted">Here's your health overview</p>
            </div>
          </div>
        </Col>
      </Row>

      {/* Quick Stats */}
      <Row className="mb-4">
        <Col md={3}>
          <Card className="text-center h-100">
            <Card.Body>
              <div style={{fontSize: '2rem'}}>📋</div>
              <h4>{healthProfile ? `${Math.round(healthProfile.completionPercentage || 0)}%` : '0%'}</h4>
              <small>Profile Complete</small>
              <div className="mt-2">
                {getCompletionBadge(healthProfile?.completionPercentage || 0)}
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center h-100">
            <Card.Body>
              <div style={{fontSize: '2rem'}}>🍽️</div>
              <h4>{recentOrders.length}</h4>
              <small>Food Orders Logged</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center h-100">
            <Card.Body>
              <div style={{fontSize: '2rem'}}>🏥</div>
              <h4>{quickInsights ? Math.round(quickInsights.overall_assessment?.overall_risk_score * 100) : '--'}</h4>
              <small>Overall Health Score</small>
              {quickInsights && (
                <div className="mt-2">
                  <Badge bg={getHealthScoreColor(quickInsights.overall_assessment.overall_risk_score * 100)}>
                    {quickInsights.overall_assessment.health_status.replace('_', ' ').toUpperCase()}
                  </Badge>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center h-100">
            <Card.Body>
              <div style={{fontSize: '2rem'}}>🤖</div>
              <h4>Active</h4>
              <small>AI Insights</small>
              <div className="mt-2">
                <Badge bg="success">Live</Badge>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Recent Activity & Insights */}
      <Row>
        <Col md={6}>
          <Card>
            <Card.Header>
              <h6 className="mb-0">🍽️ Recent Food Orders</h6>
            </Card.Header>
            <Card.Body>
              {recentOrders.length === 0 ? (
                <div className="text-center py-3">
                  <p className="text-muted">No food orders yet</p>
                  <Button href="/food-tracking" variant="primary" size="sm">
                    Log Your First Order
                  </Button>
                </div>
              ) : (
                <div>
                  {recentOrders.slice(0, 3).map((order, index) => (
                    <div key={index} className="d-flex justify-content-between align-items-center mb-2 pb-2 border-bottom">
                      <div>
                        <strong>{order.orderInfo?.restaurant?.name}</strong>
                        <br />
                        <small className="text-muted">{order.items?.length} items • {Math.round(order.analysis?.totalCalories || 0)} calories</small>
                      </div>
                      <Badge bg={getHealthScoreColor(order.analysis?.healthScore || 70)}>
                        {order.analysis?.healthScore || 70}/100
                      </Badge>
                    </div>
                  ))}
                  <div className="text-center mt-3">
                    <Button href="/food-tracking" variant="outline-primary" size="sm">
                      View All Orders
                    </Button>
                  </div>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col md={6}>
          <Card>
            <Card.Header>
              <h6 className="mb-0">🤖 AI Health Insights</h6>
            </Card.Header>
            <Card.Body>
              {!healthProfile || healthProfile.completionPercentage < 50 ? (
                <Alert variant="info">
                  <strong>Complete Your Profile</strong>
                  <p className="mb-2">Get personalized AI insights by completing your health profile.</p>
                  <Button href="/health-profile" variant="primary" size="sm">
                    Complete Profile
                  </Button>
                </Alert>
              ) : quickInsights ? (
                <div>
                  {quickInsights.priority_actions?.slice(0, 3).map((action, index) => (
                    <div key={index} className="mb-2">
                      <div className="d-flex align-items-start">
                        <span className="me-2">💡</span>
                        <small>{action}</small>
                      </div>
                    </div>
                  ))}
                  <div className="text-center mt-3">
                    <Button href="/ml-insights" variant="outline-primary" size="sm">
                      View Full AI Analysis
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-3">
                  <p className="text-muted">Log some food orders to get AI insights</p>
                  <Button href="/food-tracking" variant="primary" size="sm">
                    Start Food Tracking
                  </Button>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Quick Actions */}
      <Row className="mt-4">
        <Col md={12}>
          <Card>
            <Card.Header>
              <h6 className="mb-0">🚀 Quick Actions</h6>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={3} className="text-center mb-3">
                  <Button href="/health-profile" variant="outline-primary" className="w-100">
                    📋 Update Health Profile
                  </Button>
                </Col>
                <Col md={3} className="text-center mb-3">
                  <Button href="/food-tracking" variant="outline-success" className="w-100">
                    🍽️ Log Food Order
                  </Button>
                </Col>
                <Col md={3} className="text-center mb-3">
                  <Button href="/ml-insights" variant="outline-info" className="w-100">
                    🤖 AI Recommendations
                  </Button>
                </Col>
                <Col md={3} className="text-center mb-3">
                  <Button href="/ml-insights" variant="outline-warning" className="w-100">
                    🏥 Health Risk Analysis
                  </Button>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Dashboard;
