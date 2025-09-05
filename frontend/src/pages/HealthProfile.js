import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Nav, Tab, Alert, Spinner, ProgressBar } from 'react-bootstrap';
import { healthAPI } from '../services/api';

// Import form components
import BasicInfoForm from '../components/health/forms/BasicInfoForm';
import MedicalHistoryForm from '../components/health/forms/MedicalHistoryForm';
import DietaryInfoForm from '../components/health/forms/DietaryInfoForm';
import LifestyleForm from '../components/health/forms/LifestyleForm';
import DocumentUpload from '../components/health/forms/DocumentUpload';

const HealthProfile = () => {
  const [healthProfile, setHealthProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('basic-info');

  useEffect(() => {
    fetchHealthProfile();
  }, []);

  const fetchHealthProfile = async () => {
    try {
      const response = await healthAPI.getProfile();
      if (response.success) {
        setHealthProfile(response.data);
      }
    } catch (error) {
      console.error('Fetch health profile error:', error);
      setError('Failed to load health profile');
    } finally {
      setLoading(false);
    }
  };

  const showSuccess = (message) => {
    setSuccess(message);
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleSaveBasicInfo = async (data) => {
    setSaving(true);
    try {
      const response = await healthAPI.updateBasicInfo(data);
      if (response.success) {
        setHealthProfile(response.data);
        showSuccess('Basic information saved successfully!');
      }
    } catch (error) {
      setError('Failed to save basic information');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveMedicalHistory = async (data) => {
    setSaving(true);
    try {
      const response = await healthAPI.updateMedicalHistory(data);
      if (response.success) {
        setHealthProfile(response.data);
        showSuccess('Medical history saved successfully!');
      }
    } catch (error) {
      setError('Failed to save medical history');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveDietaryInfo = async (data) => {
    setSaving(true);
    try {
      const response = await healthAPI.updateDietaryInfo(data);
      if (response.success) {
        setHealthProfile(response.data);
        showSuccess('Dietary information saved successfully!');
      }
    } catch (error) {
      setError('Failed to save dietary information');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveLifestyle = async (data) => {
    setSaving(true);
    try {
      const response = await healthAPI.updateLifestyle(data);
      if (response.success) {
        setHealthProfile(response.data);
        showSuccess('Lifestyle information saved successfully!');
      }
    } catch (error) {
      setError('Failed to save lifestyle information');
    } finally {
      setSaving(false);
    }
  };

  const handleDocumentUpload = async (formData) => {
    setSaving(true);
    try {
      const response = await healthAPI.uploadDocument(formData);
      if (response.success) {
        setHealthProfile(response.data.profile);
        showSuccess('Document uploaded successfully!');
      }
    } catch (error) {
      setError('Failed to upload document');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" role="status" variant="primary" size="lg">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p className="mt-3">Loading your health profile...</p>
      </Container>
    );
  }

  const completionPercentage = healthProfile?.completionStatus?.overallCompletion || 0;

  return (
    <Container className="mt-4">
      <Row>
        <Col md={12}>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2>🏥 Health Profile</h2>
            <div className="text-end">
              <small className="text-muted d-block">Profile Completion</small>
              <div style={{ width: '200px' }}>
                <ProgressBar 
                  now={completionPercentage} 
                  label={`${completionPercentage}%`}
                  variant={completionPercentage < 50 ? 'warning' : 'success'}
                />
              </div>
            </div>
          </div>
        </Col>
      </Row>

      {error && (
        <Row>
          <Col md={12}>
            <Alert variant="danger" dismissible onClose={() => setError('')}>
              {error}
            </Alert>
          </Col>
        </Row>
      )}

      {success && (
        <Row>
          <Col md={12}>
            <Alert variant="success" dismissible onClose={() => setSuccess('')}>
              {success}
            </Alert>
          </Col>
        </Row>
      )}

      <Row>
        <Col md={12}>
          <Card>
            <Card.Header className="bg-white">
              <Nav variant="tabs" activeKey={activeTab} onSelect={setActiveTab}>
                <Nav.Item>
                  <Nav.Link eventKey="basic-info">
                    👤 Basic Info
                    {healthProfile?.completionStatus?.basicInfo && (
                      <span className="text-success ms-1">✓</span>
                    )}
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="medical-history">
                    🏥 Medical History
                    {healthProfile?.completionStatus?.medicalHistory && (
                      <span className="text-success ms-1">✓</span>
                    )}
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="dietary-info">
                    🍎 Dietary Info
                    {healthProfile?.completionStatus?.dietaryInfo && (
                      <span className="text-success ms-1">✓</span>
                    )}
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="lifestyle">
                    🏃‍♂️ Lifestyle
                    {healthProfile?.completionStatus?.lifestyle && (
                      <span className="text-success ms-1">✓</span>
                    )}
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="documents">
                    📄 Documents
                    {healthProfile?.completionStatus?.documents && (
                      <span className="text-success ms-1">✓</span>
                    )}
                  </Nav.Link>
                </Nav.Item>
              </Nav>
            </Card.Header>
            
            <Card.Body>
              <Tab.Content>
                <Tab.Pane active={activeTab === 'basic-info'}>
                  <BasicInfoForm
                    initialData={healthProfile}
                    onSave={handleSaveBasicInfo}
                    loading={saving}
                  />
                </Tab.Pane>
                
                <Tab.Pane active={activeTab === 'medical-history'}>
                  <MedicalHistoryForm
                    initialData={healthProfile}
                    onSave={handleSaveMedicalHistory}
                    loading={saving}
                  />
                </Tab.Pane>
                
                <Tab.Pane active={activeTab === 'dietary-info'}>
                  <DietaryInfoForm
                    initialData={healthProfile}
                    onSave={handleSaveDietaryInfo}
                    loading={saving}
                  />
                </Tab.Pane>
                
                <Tab.Pane active={activeTab === 'lifestyle'}>
                  <LifestyleForm
                    initialData={healthProfile}
                    onSave={handleSaveLifestyle}
                    loading={saving}
                  />
                </Tab.Pane>
                
                <Tab.Pane active={activeTab === 'documents'}>
                  <DocumentUpload
                    documents={healthProfile?.documents || []}
                    onUpload={handleDocumentUpload}
                    loading={saving}
                  />
                </Tab.Pane>
              </Tab.Content>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default HealthProfile;
