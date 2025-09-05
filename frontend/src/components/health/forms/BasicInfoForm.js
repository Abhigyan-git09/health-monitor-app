import React, { useState, useEffect } from 'react';
import { Card, Form, Row, Col, Button, Alert } from 'react-bootstrap';

const BasicInfoForm = ({ initialData, onSave, loading }) => {
  const [formData, setFormData] = useState({
    age: '',
    gender: '',
    height: { value: '', unit: 'cm' },
    weight: { value: '', unit: 'kg' },
    bloodType: ''
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData?.basicInfo) {
      setFormData({
        age: initialData.basicInfo.age || '',
        gender: initialData.basicInfo.gender || '',
        height: initialData.basicInfo.height || { value: '', unit: 'cm' },
        weight: initialData.basicInfo.weight || { value: '', unit: 'kg' },
        bloodType: initialData.basicInfo.bloodType || ''
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Basic validation
    if (!formData.age || !formData.gender || !formData.height.value || !formData.weight.value) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      await onSave(formData);
    } catch (error) {
      setError('Failed to save basic information');
    }
  };

  return (
    <Card>
      <Card.Header>
        <h5 className="mb-0">👤 Basic Information</h5>
      </Card.Header>
      <Card.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        
        <Form onSubmit={handleSubmit}>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Age *</Form.Label>
                <Form.Control
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  min="1"
                  max="120"
                  required
                />
              </Form.Group>
            </Col>
            
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Gender *</Form.Label>
                <Form.Select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                  <option value="prefer-not-to-say">Prefer not to say</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Height *</Form.Label>
                <Row>
                  <Col xs={8}>
                    <Form.Control
                      type="number"
                      name="height.value"
                      value={formData.height.value}
                      onChange={handleChange}
                      placeholder="Enter height"
                      required
                    />
                  </Col>
                  <Col xs={4}>
                    <Form.Select
                      name="height.unit"
                      value={formData.height.unit}
                      onChange={handleChange}
                    >
                      <option value="cm">cm</option>
                      <option value="ft">ft</option>
                    </Form.Select>
                  </Col>
                </Row>
              </Form.Group>
            </Col>
            
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Weight *</Form.Label>
                <Row>
                  <Col xs={8}>
                    <Form.Control
                      type="number"
                      name="weight.value"
                      value={formData.weight.value}
                      onChange={handleChange}
                      placeholder="Enter weight"
                      required
                    />
                  </Col>
                  <Col xs={4}>
                    <Form.Select
                      name="weight.unit"
                      value={formData.weight.unit}
                      onChange={handleChange}
                    >
                      <option value="kg">kg</option>
                      <option value="lbs">lbs</option>
                    </Form.Select>
                  </Col>
                </Row>
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Blood Type</Form.Label>
                <Form.Select
                  name="bloodType"
                  value={formData.bloodType}
                  onChange={handleChange}
                >
                  <option value="">Select Blood Type</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                  <option value="unknown">Unknown</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? 'Saving...' : 'Save Basic Information'}
          </Button>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default BasicInfoForm;
