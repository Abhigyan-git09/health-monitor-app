import React from 'react';
import { Container, Row, Col, Tab, Nav } from 'react-bootstrap';
import PersonalizedRecommendations from '../components/ml/PersonalizedRecommendations';
import HealthRiskDashboard from '../components/ml/HealthRiskDashboard';

const MLInsights = () => {
  return (
    <Container className="mt-4">
      <Row>
        <Col md={12}>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h2>🤖 AI Health Insights</h2>
              <p className="text-muted mb-0">Personalized recommendations powered by machine learning</p>
            </div>
            <div className="text-end">
              <small className="text-muted">Powered by AI & ML</small>
            </div>
          </div>
        </Col>
      </Row>

      <Row>
        <Col md={12}>
          <Tab.Container defaultActiveKey="recommendations">
            <Nav variant="tabs" className="mb-4">
              <Nav.Item>
                <Nav.Link eventKey="recommendations">
                  🍎 Smart Recommendations
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="health-risks">
                  🏥 Health Risk Assessment
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="insights">
                  📊 Health Analytics
                </Nav.Link>
              </Nav.Item>
            </Nav>

            <Tab.Content>
              <Tab.Pane eventKey="recommendations">
                <PersonalizedRecommendations />
              </Tab.Pane>
              
              <Tab.Pane eventKey="health-risks">
                <HealthRiskDashboard />
              </Tab.Pane>
              
              <Tab.Pane eventKey="insights">
                <div className="text-center py-5">
                  <div style={{fontSize: '4rem', opacity: 0.3}}>📈</div>
                  <h5 className="text-muted">Advanced Analytics Coming Soon</h5>
                  <p className="text-muted">
                    Comprehensive health trends, prediction charts, and personalized insights will be available in the next update.
                  </p>
                </div>
              </Tab.Pane>
            </Tab.Content>
          </Tab.Container>
        </Col>
      </Row>
    </Container>
  );
};

export default MLInsights;
