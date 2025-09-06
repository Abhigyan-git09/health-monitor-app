import React, { useState } from 'react';
import { Card, Form, Button, Alert, ListGroup, Badge, Modal } from 'react-bootstrap';
import HealthTest from '../HealthTest';

const DocumentUpload = ({ documents = [], onUpload, loading }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [documentType, setDocumentType] = useState('medical-report');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [showHealthTest, setShowHealthTest] = useState(false);
  const [testResults, setTestResults] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB');
        return;
      }
      
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(file.type)) {
        setError('Only images, PDFs, and Word documents are allowed');
        return;
      }
      
      setSelectedFile(file);
      setError('');
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    
    if (!selectedFile) {
      setError('Please select a file to upload or take the health test instead');
      return;
    }

    const formData = new FormData();
    formData.append('document', selectedFile);
    formData.append('documentType', documentType);
    formData.append('notes', notes);

    try {
      await onUpload(formData);
      
      setSelectedFile(null);
      setNotes('');
      setError('');
      
      const fileInput = document.getElementById('document-upload');
      if (fileInput) fileInput.value = '';
      
    } catch (error) {
      setError('Failed to upload document');
    }
  };

  const handleTestComplete = (results) => {
    setTestResults(results);
    setShowHealthTest(false);
    
    // You could save test results to backend here
    console.log('Health test results:', results);
    
    // Show success message
    Alert.success = true;
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getDocumentTypeLabel = (type) => {
    const types = {
      'blood-test': 'Blood Test',
      'x-ray': 'X-Ray',
      'prescription': 'Prescription',
      'medical-report': 'Medical Report',
      'other': 'Other'
    };
    return types[type] || 'Other';
  };

  const getDocumentTypeColor = (type) => {
    const colors = {
      'blood-test': 'danger',
      'x-ray': 'info',
      'prescription': 'warning',
      'medical-report': 'primary',
      'other': 'secondary'
    };
    return colors[type] || 'secondary';
  };

  return (
    <>
      <Card>
        <Card.Header>
          <h5 className="mb-0">📄 Medical Documents or Health Assessment</h5>
        </Card.Header>
        <Card.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          
          {testResults && (
            <Alert variant="success" className="mb-4">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <strong>✅ Health Assessment Completed!</strong>
                  <br />
                  <small>Health Score: {testResults.health_score}/100 | {testResults.recommendations.length} recommendations provided</small>
                </div>
                <Badge bg="success">Assessment Done</Badge>
              </div>
            </Alert>
          )}
          
          {/* Two Options Section */}
          <div className="mb-4">
            <h6>Choose an option to provide health information:</h6>
            <div className="d-grid gap-2 d-md-flex">
              <div className="flex-fill">
                <Card className="border-primary h-100">
                  <Card.Body className="text-center">
                    <div style={{fontSize: '2rem'}}>📄</div>
                    <h6>Upload Medical Document</h6>
                    <p className="small text-muted">If you have medical reports, test results, or prescriptions</p>
                  </Card.Body>
                </Card>
              </div>
              <div className="text-center align-self-center">
                <strong>OR</strong>
              </div>
              <div className="flex-fill">
                <Card className="border-success h-100">
                  <Card.Body className="text-center">
                    <div style={{fontSize: '2rem'}}>🩺</div>
                    <h6>Take Health Assessment</h6>
                    <p className="small text-muted">Answer questions about your current health status</p>
                    <Button 
                      variant="success" 
                      onClick={() => setShowHealthTest(true)}
                      disabled={loading}
                      className="w-100"
                    >
                      Start Health Test
                    </Button>
                  </Card.Body>
                </Card>
              </div>
            </div>
          </div>

          {/* Upload Form */}
          <Form onSubmit={handleUpload} className="mb-4">
            <h6>Upload Medical Document (Optional)</h6>
            
            <Form.Group className="mb-3">
              <Form.Label>Select Medical Document</Form.Label>
              <Form.Control
                type="file"
                id="document-upload"
                onChange={handleFileChange}
                accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
              />
              <Form.Text className="text-muted">
                Accepted formats: JPG, PNG, PDF, DOC, DOCX (Max 10MB)
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Document Type</Form.Label>
              <Form.Select
                value={documentType}
                onChange={(e) => setDocumentType(e.target.value)}
              >
                <option value="medical-report">Medical Report</option>
                <option value="blood-test">Blood Test</option>
                <option value="x-ray">X-Ray</option>
                <option value="prescription">Prescription</option>
                <option value="other">Other</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Notes (Optional)</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any notes about this document..."
              />
            </Form.Group>

            <Button type="submit" variant="primary" disabled={loading || !selectedFile}>
              {loading ? 'Uploading...' : 'Upload Document'}
            </Button>
          </Form>

          {/* Documents List */}
          {documents.length > 0 && (
            <>
              <hr />
              <h6>Uploaded Documents ({documents.length})</h6>
              <ListGroup>
                {documents.map((doc, index) => (
                  <ListGroup.Item key={index} className="d-flex justify-content-between align-items-center">
                    <div>
                      <div className="fw-bold">{doc.originalName}</div>
                      <small className="text-muted">
                        Uploaded on {new Date(doc.uploadDate).toLocaleDateString()}
                        {doc.notes && ` • ${doc.notes}`}
                      </small>
                      <div className="mt-1">
                        <Badge bg={getDocumentTypeColor(doc.documentType)} className="me-2">
                          {getDocumentTypeLabel(doc.documentType)}
                        </Badge>
                        <small className="text-muted">{formatFileSize(doc.fileSize)}</small>
                      </div>
                    </div>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </>
          )}

          {documents.length === 0 && !testResults && (
            <div className="text-center py-4">
              <div style={{fontSize: '3rem', opacity: 0.3}}>📄</div>
              <p className="text-muted">No health information provided yet</p>
              <small className="text-muted">Upload medical documents or take the health assessment to get started</small>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Health Test Modal */}
      <Modal 
        show={showHealthTest} 
        onHide={() => setShowHealthTest(false)} 
        size="lg"
        backdrop="static"
      >
        <Modal.Body className="p-0">
          <HealthTest 
            onTestComplete={handleTestComplete}
            onCancel={() => setShowHealthTest(false)}
          />
        </Modal.Body>
      </Modal>
    </>
  );
};

export default DocumentUpload;
