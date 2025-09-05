import React, { useState, useEffect } from 'react';
import { Card, Form, Row, Col, Button, Alert, Badge } from 'react-bootstrap';

const MedicalHistoryForm = ({ initialData, onSave, loading }) => {
  const [formData, setFormData] = useState({
    chronicConditions: [],
    allergies: [],
    medications: [],
    surgeries: []
  });
  const [error, setError] = useState('');
  
  // Form states for adding new items
  const [newCondition, setNewCondition] = useState({ condition: '', diagnosedDate: '', severity: 'mild' });
  const [newAllergy, setNewAllergy] = useState({ allergen: '', severity: 'mild', reaction: '' });
  const [newMedication, setNewMedication] = useState({ name: '', dosage: '', frequency: '', startDate: '' });

  useEffect(() => {
    if (initialData?.medicalHistory) {
      setFormData(initialData.medicalHistory);
    }
  }, [initialData]);

  const addCondition = () => {
    if (newCondition.condition.trim()) {
      setFormData(prev => ({
        ...prev,
        chronicConditions: [...prev.chronicConditions, { ...newCondition }]
      }));
      setNewCondition({ condition: '', diagnosedDate: '', severity: 'mild' });
    }
  };

  const removeCondition = (index) => {
    setFormData(prev => ({
      ...prev,
      chronicConditions: prev.chronicConditions.filter((_, i) => i !== index)
    }));
  };

  const addAllergy = () => {
    if (newAllergy.allergen.trim()) {
      setFormData(prev => ({
        ...prev,
        allergies: [...prev.allergies, { ...newAllergy }]
      }));
      setNewAllergy({ allergen: '', severity: 'mild', reaction: '' });
    }
  };

  const removeAllergy = (index) => {
    setFormData(prev => ({
      ...prev,
      allergies: prev.allergies.filter((_, i) => i !== index)
    }));
  };

  const addMedication = () => {
    if (newMedication.name.trim()) {
      setFormData(prev => ({
        ...prev,
        medications: [...prev.medications, { ...newMedication }]
      }));
      setNewMedication({ name: '', dosage: '', frequency: '', startDate: '' });
    }
  };

  const removeMedication = (index) => {
    setFormData(prev => ({
      ...prev,
      medications: prev.medications.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      await onSave(formData);
    } catch (error) {
      setError('Failed to save medical history');
    }
  };

  return (
    <Card>
      <Card.Header>
        <h5 className="mb-0">🏥 Medical History</h5>
      </Card.Header>
      <Card.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        
        <Form onSubmit={handleSubmit}>
          {/* Chronic Conditions Section */}
          <div className="mb-4">
            <h6>Chronic Conditions</h6>
            
            {/* Display existing conditions */}
            <div className="mb-3">
              {formData.chronicConditions.map((condition, index) => (
                <Badge 
                  key={index} 
                  bg="info" 
                  className="me-2 mb-2 p-2"
                  style={{ fontSize: '0.9rem' }}
                >
                  {condition.condition} 
                  <span 
                    className="ms-2" 
                    style={{ cursor: 'pointer' }}
                    onClick={() => removeCondition(index)}
                  >
                    ×
                  </span>
                </Badge>
              ))}
            </div>
            
            {/* Add new condition */}
            <Row>
              <Col md={4}>
                <Form.Control
                  type="text"
                  placeholder="Condition name"
                  value={newCondition.condition}
                  onChange={(e) => setNewCondition(prev => ({ ...prev, condition: e.target.value }))}
                />
              </Col>
              <Col md={3}>
                <Form.Control
                  type="date"
                  value={newCondition.diagnosedDate}
                  onChange={(e) => setNewCondition(prev => ({ ...prev, diagnosedDate: e.target.value }))}
                />
              </Col>
              <Col md={3}>
                <Form.Select
                  value={newCondition.severity}
                  onChange={(e) => setNewCondition(prev => ({ ...prev, severity: e.target.value }))}
                >
                  <option value="mild">Mild</option>
                  <option value="moderate">Moderate</option>
                  <option value="severe">Severe</option>
                </Form.Select>
              </Col>
              <Col md={2}>
                <Button variant="outline-primary" onClick={addCondition} size="sm">
                  Add
                </Button>
              </Col>
            </Row>
          </div>

          {/* Allergies Section */}
          <div className="mb-4">
            <h6>Allergies</h6>
            
            {/* Display existing allergies */}
            <div className="mb-3">
              {formData.allergies.map((allergy, index) => (
                <Badge 
                  key={index} 
                  bg="warning" 
                  className="me-2 mb-2 p-2"
                  style={{ fontSize: '0.9rem' }}
                >
                  {allergy.allergen} ({allergy.severity})
                  <span 
                    className="ms-2" 
                    style={{ cursor: 'pointer' }}
                    onClick={() => removeAllergy(index)}
                  >
                    ×
                  </span>
                </Badge>
              ))}
            </div>
            
            {/* Add new allergy */}
            <Row>
              <Col md={3}>
                <Form.Control
                  type="text"
                  placeholder="Allergen"
                  value={newAllergy.allergen}
                  onChange={(e) => setNewAllergy(prev => ({ ...prev, allergen: e.target.value }))}
                />
              </Col>
              <Col md={3}>
                <Form.Select
                  value={newAllergy.severity}
                  onChange={(e) => setNewAllergy(prev => ({ ...prev, severity: e.target.value }))}
                >
                  <option value="mild">Mild</option>
                  <option value="moderate">Moderate</option>
                  <option value="severe">Severe</option>
                  <option value="life-threatening">Life-threatening</option>
                </Form.Select>
              </Col>
              <Col md={4}>
                <Form.Control
                  type="text"
                  placeholder="Typical reaction"
                  value={newAllergy.reaction}
                  onChange={(e) => setNewAllergy(prev => ({ ...prev, reaction: e.target.value }))}
                />
              </Col>
              <Col md={2}>
                <Button variant="outline-warning" onClick={addAllergy} size="sm">
                  Add
                </Button>
              </Col>
            </Row>
          </div>

          {/* Current Medications Section */}
          <div className="mb-4">
            <h6>Current Medications</h6>
            
            {/* Display existing medications */}
            <div className="mb-3">
              {formData.medications.map((medication, index) => (
                <Badge 
                  key={index} 
                  bg="success" 
                  className="me-2 mb-2 p-2"
                  style={{ fontSize: '0.9rem' }}
                >
                  {medication.name} - {medication.dosage}
                  <span 
                    className="ms-2" 
                    style={{ cursor: 'pointer' }}
                    onClick={() => removeMedication(index)}
                  >
                    ×
                  </span>
                </Badge>
              ))}
            </div>
            
            {/* Add new medication */}
            <Row>
              <Col md={3}>
                <Form.Control
                  type="text"
                  placeholder="Medication name"
                  value={newMedication.name}
                  onChange={(e) => setNewMedication(prev => ({ ...prev, name: e.target.value }))}
                />
              </Col>
              <Col md={3}>
                <Form.Control
                  type="text"
                  placeholder="Dosage (e.g., 10mg)"
                  value={newMedication.dosage}
                  onChange={(e) => setNewMedication(prev => ({ ...prev, dosage: e.target.value }))}
                />
              </Col>
              <Col md={3}>
                <Form.Control
                  type="text"
                  placeholder="Frequency (e.g., twice daily)"
                  value={newMedication.frequency}
                  onChange={(e) => setNewMedication(prev => ({ ...prev, frequency: e.target.value }))}
                />
              </Col>
              <Col md={3}>
                <Button variant="outline-success" onClick={addMedication} size="sm">
                  Add
                </Button>
              </Col>
            </Row>
          </div>

          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? 'Saving...' : 'Save Medical History'}
          </Button>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default MedicalHistoryForm;
