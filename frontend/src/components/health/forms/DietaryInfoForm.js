import React, { useState, useEffect } from 'react';
import { Card, Form, Row, Col, Button, Alert } from 'react-bootstrap';

const DietaryInfoForm = ({ initialData, onSave, loading }) => {
  const [formData, setFormData] = useState({
    dietType: '',
    foodRestrictions: [],
    dislikedFoods: [],
    preferredCuisines: [],
    dailyWaterIntake: '',
    alcoholConsumption: '',
    smokingStatus: ''
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData?.dietaryInfo) {
      setFormData(initialData.dietaryInfo);
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleMultiSelect = (name, value) => {
    setFormData(prev => {
      const currentArray = prev[name] || [];
      if (currentArray.includes(value)) {
        return {
          ...prev,
          [name]: currentArray.filter(item => item !== value)
        };
      } else {
        return {
          ...prev,
          [name]: [...currentArray, value]
        };
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      await onSave(formData);
    } catch (error) {
      setError('Failed to save dietary information');
    }
  };

  const foodRestrictionOptions = [
    'Gluten-free', 'Dairy-free', 'Nut-free', 'Low sodium', 'Low sugar',
    'Halal', 'Kosher', 'No spicy food', 'No seafood', 'No red meat'
  ];

  const cuisineOptions = [
    'Italian', 'Chinese', 'Indian', 'Mexican', 'Japanese', 'Thai',
    'Mediterranean', 'American', 'French', 'Korean', 'Vietnamese', 'Greek'
  ];

  return (
    <Card>
      <Card.Header>
        <h5 className="mb-0">🍎 Dietary Information</h5>
      </Card.Header>
      <Card.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        
        <Form onSubmit={handleSubmit}>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Diet Type *</Form.Label>
                <Form.Select
                  name="dietType"
                  value={formData.dietType}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Diet Type</option>
                  <option value="omnivore">Omnivore</option>
                  <option value="vegetarian">Vegetarian</option>
                  <option value="vegan">Vegan</option>
                  <option value="pescatarian">Pescatarian</option>
                  <option value="keto">Keto</option>
                  <option value="paleo">Paleo</option>
                  <option value="other">Other</option>
                </Form.Select>
              </Form.Group>
            </Col>
            
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Daily Water Intake (Liters)</Form.Label>
                <Form.Control
                  type="number"
                  name="dailyWaterIntake"
                  value={formData.dailyWaterIntake}
                  onChange={handleChange}
                  min="0"
                  step="0.1"
                  placeholder="e.g., 2.5"
                />
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Alcohol Consumption *</Form.Label>
                <Form.Select
                  name="alcoholConsumption"
                  value={formData.alcoholConsumption}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Frequency</option>
                  <option value="none">None</option>
                  <option value="occasional">Occasional (1-2 times/month)</option>
                  <option value="moderate">Moderate (1-2 times/week)</option>
                  <option value="heavy">Heavy (3+ times/week)</option>
                </Form.Select>
              </Form.Group>
            </Col>
            
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Smoking Status *</Form.Label>
                <Form.Select
                  name="smokingStatus"
                  value={formData.smokingStatus}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Status</option>
                  <option value="never">Never smoked</option>
                  <option value="former">Former smoker</option>
                  <option value="current">Current smoker</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          {/* Food Restrictions */}
          <Form.Group className="mb-3">
            <Form.Label>Food Restrictions (Select all that apply)</Form.Label>
            <div className="d-flex flex-wrap gap-2">
              {foodRestrictionOptions.map(restriction => (
                <Form.Check
                  key={restriction}
                  type="checkbox"
                  id={`restriction-${restriction}`}
                  label={restriction}
                  checked={(formData.foodRestrictions || []).includes(restriction)}
                  onChange={() => handleMultiSelect('foodRestrictions', restriction)}
                  className="me-3"
                />
              ))}
            </div>
          </Form.Group>

          {/* Preferred Cuisines */}
          <Form.Group className="mb-3">
            <Form.Label>Preferred Cuisines (Select all that apply)</Form.Label>
            <div className="d-flex flex-wrap gap-2">
              {cuisineOptions.map(cuisine => (
                <Form.Check
                  key={cuisine}
                  type="checkbox"
                  id={`cuisine-${cuisine}`}
                  label={cuisine}
                  checked={(formData.preferredCuisines || []).includes(cuisine)}
                  onChange={() => handleMultiSelect('preferredCuisines', cuisine)}
                  className="me-3"
                />
              ))}
            </div>
          </Form.Group>

          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? 'Saving...' : 'Save Dietary Information'}
          </Button>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default DietaryInfoForm;
