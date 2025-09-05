import React from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', minHeight: '90vh', paddingTop: '50px' }}>
      <Container>
        <Row className="justify-content-center">
          <Col md={10} lg={8}>
            <Card className="text-center shadow-lg border-0">
              <Card.Body className="py-5">
                <div style={{fontSize: '4rem', marginBottom: '20px'}}>🏥</div>
                <h1 className="display-4 mb-4">HealthMonitor</h1>
                <p className="lead mb-4">
                  AI-Powered Health & Food Tracking System
                </p>
                <p className="text-muted mb-4">
                  Monitor your health, track your food orders, and get personalized 
                  warnings about foods that might not be suitable for your health condition.
                </p>
                <div className="d-grid gap-2 d-md-flex justify-content-md-center">
                  <Button as={Link} to="/register" variant="primary" size="lg" className="px-4">
                    Get Started Free
                  </Button>
                  <Button as={Link} to="/login" variant="outline-primary" size="lg" className="px-4">
                    Login
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
        
        <Row className="mt-5">
          <Col md={4} className="mb-4">
            <Card className="h-100 shadow-sm border-0">
              <Card.Body className="text-center py-4">
                <div style={{fontSize: '3rem', marginBottom: '20px'}}>📊</div>
                <Card.Title>Health Tracking</Card.Title>
                <Card.Text>
                  Upload your medical reports or fill out our comprehensive health 
                  questionnaire to get personalized health insights and recommendations.
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4} className="mb-4">
            <Card className="h-100 shadow-sm border-0">
              <Card.Body className="text-center py-4">
                <div style={{fontSize: '3rem', marginBottom: '20px'}}>🍔</div>
                <Card.Title>Smart Food Monitoring</Card.Title>
                <Card.Text>
                  Automatically track your food orders from popular delivery apps and 
                  get real-time warnings about potentially harmful foods for your health.
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4} className="mb-4">
            <Card className="h-100 shadow-sm border-0">
              <Card.Body className="text-center py-4">
                <div style={{fontSize: '3rem', marginBottom: '20px'}}>🤖</div>
                <Card.Title>AI-Powered Insights</Card.Title>
                <Card.Text>
                  Get personalized food recommendations, health tips, and warnings 
                  powered by advanced machine learning algorithms.
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Home;
