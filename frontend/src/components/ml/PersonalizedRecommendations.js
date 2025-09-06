import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Button, Spinner, Alert, Badge, ProgressBar } from 'react-bootstrap';
import { mlAPI, foodAPI } from '../../services/api';

const PersonalizedRecommendations = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [modelStatus, setModelStatus] = useState('unknown');

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    setLoading(true);
    setError('');

    try {
      // Get sample foods for recommendations
      const foodQueries = ['chicken', 'salmon', 'broccoli', 'quinoa', 'avocado'];
      const allFoods = [];
      
      for (const query of foodQueries) {
        try {
          const searchResult = await foodAPI.searchFoods(query, 10);
          if (searchResult.data) {
            allFoods.push(...searchResult.data.slice(0, 5));
          }
        } catch (err) {
          console.log(`Search failed for ${query}`);
        }
      }

      if (allFoods.length === 0) {
        setError('No foods available for recommendations');
        return;
      }

      // Get ML recommendations
      const response = await mlAPI.getRecommendations(allFoods, 8);
      
      if (response.success) {
        setRecommendations(response.recommendations);
        setModelStatus(response.model_status);
      } else {
        setError('Failed to get personalized recommendations');
      }

    } catch (error) {
      console.error('Recommendations error:', error);
      setError('Unable to load personalized recommendations. Please ensure your health profile is complete.');
    } finally {
      setLoading(false);
    }
  };

  const getConfidenceColor = (score) => {
    if (score >= 0.8) return 'success';
    if (score >= 0.6) return 'info';  
    if (score >= 0.4) return 'warning';
    return 'secondary';
  };

  const getConfidenceText = (score) => {
    if (score >= 0.8) return 'Highly Recommended';
    if (score >= 0.6) return 'Good Match';
    if (score >= 0.4) return 'Moderate Match';
    return 'Basic Match';
  };

  if (loading) {
    return (
      <Card>
        <Card.Body className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3">🤖 AI is analyzing your health profile...</p>
          <small className="text-muted">Generating personalized recommendations</small>
        </Card.Body>
      </Card>
    );
  }

  return (
    <Card>
      <Card.Header className="d-flex justify-content-between align-items-center">
        <div>
          <h5 className="mb-0">🤖 AI-Powered Food Recommendations</h5>
          <small className="text-muted">Personalized for your health profile</small>
        </div>
        <div>
          <Badge bg={modelStatus === 'trained' ? 'success' : 'warning'} className="me-2">
            {modelStatus === 'trained' ? 'ML Model Active' : 'Basic Matching'}
          </Badge>
          <Button variant="outline-primary" size="sm" onClick={fetchRecommendations}>
            🔄 Refresh
          </Button>
        </div>
      </Card.Header>
      <Card.Body>
        {error && (
          <Alert variant="warning" className="d-flex align-items-center">
            <div>
              <strong>⚠️ Limited Recommendations</strong><br/>
              {error}
            </div>
          </Alert>
        )}
        
        {recommendations.length === 0 && !error ? (
          <Alert variant="info" className="text-center">
            <h6>Complete Your Health Profile</h6>
            <p>Get personalized AI recommendations by completing your health profile with dietary preferences and health goals.</p>
            <Button variant="primary" href="/health-profile">Complete Profile</Button>
          </Alert>
        ) : (
          <>
            {modelStatus !== 'trained' && (
              <Alert variant="info" className="mb-3">
                <small>
                  <strong>🚀 Upgrade Available:</strong> Complete more food orders to unlock advanced AI recommendations with machine learning!
                </small>
              </Alert>
            )}
            
            <Row>
              {recommendations.map((rec, index) => (
                <Col md={6} lg={4} key={index} className="mb-3">
                  <Card className="h-100 border-0 shadow-sm hover-card" style={{transition: 'transform 0.2s'}}
                        onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0px)'}>
                    <Card.Body>
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <h6 className="card-title mb-1" style={{fontSize: '0.95rem', lineHeight: '1.3'}}>
                          {rec.food.name}
                        </h6>
                        <Badge bg={getConfidenceColor(rec.confidence_score)} className="ms-2">
                          {Math.round(rec.confidence_score * 100)}%
                        </Badge>
                      </div>
                      
                      <div className="mb-2">
                        <small className="text-muted">{getConfidenceText(rec.confidence_score)}</small>
                        <ProgressBar 
                          now={rec.confidence_score * 100} 
                          variant={getConfidenceColor(rec.confidence_score)}
                          size="sm"
                          style={{height: '4px'}}
                        />
                      </div>

                      {rec.food.nutrition && (
                        <div className="mb-2 p-2 bg-light rounded">
                          <div className="row text-center">
                            <div className="col-6">
                              <strong style={{fontSize: '0.85rem'}}>{Math.round(rec.food.nutrition.calories || 0)}</strong>
                              <br/><small className="text-muted">calories</small>
                            </div>
                            <div className="col-6">
                              <strong style={{fontSize: '0.85rem'}}>{Math.round(rec.food.nutrition.protein || 0)}g</strong>
                              <br/><small className="text-muted">protein</small>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="mb-2">
                        <small className="text-muted d-block mb-1">💡 Why recommended:</small>
                        <p className="small mb-0" style={{fontSize: '0.8rem', lineHeight: '1.3'}}>
                          {rec.reasoning}
                        </p>
                      </div>

                      <div className="d-flex justify-content-between align-items-center">
                        {rec.health_boost > 0 && (
                          <Badge bg="success" style={{fontSize: '0.7rem'}}>
                            ⚡ +{Math.round(rec.health_boost * 100)} Health Boost
                          </Badge>
                        )}
                        <small className="text-muted">
                          {rec.recommendation_type === 'ml_powered' ? '🤖 ML' : '📝 Rule-based'}
                        </small>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          </>
        )}

        {recommendations.length > 0 && (
          <div className="text-center mt-3">
            <small className="text-muted">
              Recommendations update as you log more food orders and complete your health profile
            </small>
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default PersonalizedRecommendations;
