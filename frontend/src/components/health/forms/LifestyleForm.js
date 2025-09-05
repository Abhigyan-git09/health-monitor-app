import React, { useState, useEffect } from 'react';
import { Card, Form, Row, Col, Button, Alert } from 'react-bootstrap';

const LifestyleForm = ({ initialData, onSave, loading }) => {
  const [formData, setFormData] = useState({
    activityLevel: '',
    sleepHours: '',
    stressLevel: '',
    occupation: '',
    exerciseFrequency: ''
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData?.lifestyle) {
      setFormData(initialData.lifestyle);
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.activityLevel || !formData.sleepHours || !formData.stressLevel || !formData.exerciseFrequency) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      await onSave(formData);
    } catch (error) {
      setError('Failed to save lifestyle information');
    }
  };

  return (
    <Card>
      <Card.Header>
        <h5 className="mb-0">🏃‍♂️ Lifestyle Information</h5>
      </Card.Header>
      <Card.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        
        <Form onSubmit={handleSubmit}>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Activity Level *</Form.Label>
                <Form.Select
                  name="activityLevel"
                  value={formData.activityLevel}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Activity Level</option>
                  <option value="sedentary">Sedentary (Little to no exercise)</option>
                  <option value="lightly-active">Lightly Active (Light exercise 1-3 days/week)</option>
                  <option value="moderately-active">Moderately Active (Moderate exercise 3-5 days/week)</option>
                  <option value="very-active">Very Active (Hard exercise 6-7 days/week)</option>
                  <option value="extremely-active">Extremely Active (Physical job + exercise)</option>
                </Form.Select>
              </Form.Group>
            </Col>
            
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Average Sleep Hours *</Form.Label>
                <Form.Control
                  type="number"
                  name="sleepHours"
                  value={formData.sleepHours}
                  onChange={handleChange}
                  min="0"
                  max="24"
                  step="0.5"
                  placeholder="e.g., 7.5"
                  required
                />
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Exercise Frequency *</Form.Label>
                <Form.Select
                  name="exerciseFrequency"
                  value={formData.exerciseFrequency}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Frequency</option>
                  <option value="never">Never</option>
                  <option value="rarely">Rarely (Once a month or less)</option>
                  <option value="1-2-times-week">1-2 times per week</option>
                  <option value="3-4-times-week">3-4 times per week</option>
                  <option value="5-6-times-week">5-6 times per week</option>
                  <option value="daily">Daily</option>
                </Form.Select>
              </Form.Group>
            </Col>
            
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Stress Level (1-10) *</Form.Label>
                <Form.Range
                  name="stressLevel"
                  value={formData.stressLevel}
                  onChange={handleChange}
                  min="1"
                  max="10"
                  className="mb-2"
                />
                <div className="d-flex justify-content-between">
                  <small className="text-muted">1 (Very Low)</small>
                  <small className="text-muted">Current: {formData.stressLevel || 1}</small>
                  <small className="text-muted">10 (Very High)</small>
                </div>
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Occupation</Form.Label>
                <Form.Control
                  type="text"
                  name="occupation"
                  value={formData.occupation}
                  onChange={handleChange}
                  placeholder="e.g., Software Developer, Teacher, etc."
                />
              </Form.Group>
            </Col>
          </Row>

          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? 'Saving...' : 'Save Lifestyle Information'}
          </Button>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default LifestyleForm;
