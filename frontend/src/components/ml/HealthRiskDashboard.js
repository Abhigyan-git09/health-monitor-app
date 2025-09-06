import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Alert, Spinner, Badge, ProgressBar } from 'react-bootstrap';
import { mlAPI } from '../../services/api';

const HealthRiskDashboard = () => {
  const [riskAssessment, setRiskAssessment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchHealthRisk();
  }, []);

  const fetchHealthRisk = async () => {
    try {
      const response = await mlAPI.getHealthRiskAssessment();
      if (response.success) {
        setRiskAssessment(response.risk_assessment);
      } else {
        setError('Health risk assessment unavailable');
      }
    } catch (error) {
      console.error('Health risk error:', error);
      setError('Unable to load health risk assessment');
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (riskLevel) => {
    switch(riskLevel) {
      case 'low': return 'success';
      case 'medium': return 'warning';
      case 'high': return 'danger';
      case 'very_high': return 'danger';
      default: return 'secondary';
    }
  };

  const getRiskIcon = (riskLevel) => {
    switch(riskLevel) {
      case 'low': return '✅';
      case 'medium': return '⚠️';
      case 'high': return '🚨';
      case 'very_high': return '🚨';
      default: return 'ℹ️';
    }
  };

  if (loading) {
    return (
      <Card>
        <Card.Body className="text-center py-4">
          <Spinner animation="border" />
          <p className="mt-2">Analyzing your health risks...</p>
        </Card.Body>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <Card.Header>
          <h5 className="mb-0">🏥 Health Risk Assessment</h5>
        </Card.Header>
        <Card.Body>
          <Alert variant="info">
            <h6>Complete Your Profile for Risk Assessment</h6>
            <p>To get personalized health risk insights, please complete your health profile with medical history and dietary information.</p>
          </Alert>
        </Card.Body>
      </Card>
    );
  }

  const { individual_risks, overall_assessment, priority_actions } = riskAssessment;

  return (
    <Card>
      <Card.Header>
        <h5 className="mb-0">🏥 AI Health Risk Assessment</h5>
        <small className="text-muted">Based on your health profile and eating patterns</small>
      </Card.Header>
      <Card.Body>
        {/* Overall Risk */}
        <Card className="mb-4 border-0 bg-light">
          <Card.Body className="text-center">
            <h6>Overall Health Status</h6>
            <div className="mb-2">
              <Badge bg={getRiskColor(overall_assessment.risk_category)} className="p-2" style={{fontSize: '1rem'}}>
                {getRiskIcon(overall_assessment.risk_category)} {overall_assessment.health_status.replace('_', ' ').toUpperCase()}
              </Badge>
            </div>
            <ProgressBar 
              now={overall_assessment.overall_risk_score * 100}
              variant={getRiskColor(overall_assessment.risk_category)}
              style={{height: '8px'}}
            />
            <small className="text-muted">
              Risk Score: {Math.round(overall_assessment.overall_risk_score * 100)}/100
            </small>
          </Card.Body>
        </Card>

        {/* Individual Risk Factors */}
        <h6 className="mb-3">Individual Risk Factors</h6>
        <Row>
          {Object.entries(individual_risks).map(([condition, riskData]) => (
            <Col md={6} key={condition} className="mb-3">
              <Card className="h-100 border-0 shadow-sm">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <h6 className="mb-0" style={{textTransform: 'capitalize'}}>
                      {condition.replace('_', ' ')}
                    </h6>
                    <Badge bg={getRiskColor(riskData.risk_level)}>
                      {getRiskIcon(riskData.risk_level)} {riskData.risk_level.toUpperCase()}
                    </Badge>
                  </div>
                  
                  <div className="mb-2">
                    <small className="text-muted">Risk Probability</small>
                    <ProgressBar 
                      now={riskData.probability * 100}
                      variant={getRiskColor(riskData.risk_level)}
                      size="sm"
                    />
                    <small className="text-muted">{Math.round(riskData.probability * 100)}%</small>
                  </div>

                  {riskData.factors && riskData.factors.length > 0 && (
                    <div className="mb-2">
                      <small className="text-muted d-block">Risk Factors:</small>
                      <ul className="small mb-0" style={{paddingLeft: '1rem'}}>
                        {riskData.factors.slice(0, 2).map((factor, idx) => (
                          <li key={idx}>{factor}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>

        {/* Priority Actions */}
        {priority_actions && priority_actions.length > 0 && (
          <Card className="mt-4 border-warning">
            <Card.Body>
              <h6 className="text-warning">🎯 Priority Actions</h6>
              <ul className="mb-0">
                {priority_actions.slice(0, 5).map((action, idx) => (
                  <li key={idx} className="mb-1">{action}</li>
                ))}
              </ul>
            </Card.Body>
          </Card>
        )}

        <div className="text-center mt-3">
          <small className="text-muted">
            Risk assessment updates as you log food orders and update your health profile
          </small>
        </div>
      </Card.Body>
    </Card>
  );
};

export default HealthRiskDashboard;
