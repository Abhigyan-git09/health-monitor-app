import React from 'react';
import { Card, Alert, Badge, Row, Col, ProgressBar } from 'react-bootstrap';

const HealthAnalysis = ({ analysis }) => {
  if (!analysis) {
    return (
      <Card>
        <Card.Body>
          <p className="text-muted">No health analysis available</p>
        </Card.Body>
      </Card>
    );
  }

  const getScoreColor = (score) => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'warning';
    return 'danger';
  };

  const getSeverityBadge = (severity) => {
    const colors = {
      'critical': 'danger',
      'high': 'warning',
      'medium': 'info',
      'low': 'secondary'
    };
    return colors[severity] || 'secondary';
  };

  const getSeverityIcon = (severity) => {
    const icons = {
      'critical': '🚨',
      'high': '⚠️',
      'medium': '💡',
      'low': 'ℹ️'
    };
    return icons[severity] || 'ℹ️';
  };

  return (
    <Card>
      <Card.Header>
        <h5 className="mb-0">🏥 Health Analysis</h5>
      </Card.Header>
      <Card.Body>
        {/* Health Score */}
        <div className="mb-4">
          <Row className="align-items-center">
            <Col md={8}>
              <h6>Overall Health Score</h6>
              <ProgressBar 
                now={analysis.healthScore} 
                variant={getScoreColor(analysis.healthScore)}
                label={`${analysis.healthScore}/100`}
              />
            </Col>
            <Col md={4} className="text-center">
              <div style={{ fontSize: '2rem' }}>
                {analysis.healthScore >= 80 ? '😊' : 
                 analysis.healthScore >= 60 ? '😐' : '😟'}
              </div>
              <small className="text-muted">
                {analysis.healthScore >= 80 ? 'Great Choice!' : 
                 analysis.healthScore >= 60 ? 'Okay Choice' : 'Consider Alternatives'}
              </small>
            </Col>
          </Row>
        </div>

        {/* Warnings */}
        {analysis.warnings && analysis.warnings.length > 0 && (
          <div className="mb-4">
            <h6>⚠️ Health Warnings ({analysis.warnings.length})</h6>
            {analysis.warnings.map((warning, index) => (
              <Alert 
                key={index} 
                variant={getSeverityBadge(warning.severity)}
                className="mb-2"
              >
                <div className="d-flex align-items-start">
                  <span className="me-2">{getSeverityIcon(warning.severity)}</span>
                  <div className="flex-grow-1">
                    <div className="d-flex justify-content-between align-items-start mb-1">
                      <strong>{warning.message}</strong>
                      <Badge bg={getSeverityBadge(warning.severity)}>
                        {warning.severity.toUpperCase()}
                      </Badge>
                    </div>
                    {warning.recommendation && (
                      <small className="d-block">
                        <strong>Recommendation:</strong> {warning.recommendation}
                      </small>
                    )}
                  </div>
                </div>
              </Alert>
            ))}
          </div>
        )}

        {/* Recommendations */}
        {analysis.recommendations && analysis.recommendations.length > 0 && (
          <div className="mb-3">
            <h6>💡 Recommendations</h6>
            {analysis.recommendations.map((recommendation, index) => (
              <Alert key={index} variant="info" className="mb-2 py-2">
                <small>✓ {recommendation}</small>
              </Alert>
            ))}
          </div>
        )}

        {/* Nutrition Summary */}
        <div className="mb-3">
          <h6>📊 Nutrition Summary</h6>
          <Row className="text-center">
            <Col>
              <div className="border rounded p-2">
                <strong>{Math.round(analysis.totalCalories || 0)}</strong>
                <br/><small>Calories</small>
              </div>
            </Col>
            <Col>
              <div className="border rounded p-2">
                <strong>{Math.round(analysis.totalProtein || 0)}g</strong>
                <br/><small>Protein</small>
              </div>
            </Col>
            <Col>
              <div className="border rounded p-2">
                <strong>{Math.round(analysis.totalCarbs || 0)}g</strong>
                <br/><small>Carbs</small>
              </div>
            </Col>
            <Col>
              <div className="border rounded p-2">
                <strong>{Math.round(analysis.totalFat || 0)}g</strong>
                <br/><small>Fat</small>
              </div>
            </Col>
            <Col>
              <div className="border rounded p-2">
                <strong>{Math.round(analysis.totalSodium || 0)}mg</strong>
                <br/><small>Sodium</small>
              </div>
            </Col>
          </Row>
        </div>

        {/* No Issues Message */}
        {(!analysis.warnings || analysis.warnings.length === 0) && 
         (!analysis.recommendations || analysis.recommendations.length === 0) && (
          <Alert variant="success">
            <span className="me-2">✅</span>
            No health concerns detected with this order! Keep up the healthy choices.
          </Alert>
        )}
      </Card.Body>
    </Card>
  );
};

export default HealthAnalysis;
