import React, { useState } from 'react';
import { Card, Form, Button, Alert, ListGroup, Badge } from 'react-bootstrap';

const DocumentUpload = ({ documents = [], onUpload, loading }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [documentType, setDocumentType] = useState('medical-report');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB');
        return;
      }
      
      // Check file type
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
      setError('Please select a file to upload');
      return;
    }

    const formData = new FormData();
    formData.append('document', selectedFile);
    formData.append('documentType', documentType);
    formData.append('notes', notes);

    try {
      await onUpload(formData);
      
      // Reset form
      setSelectedFile(null);
      setNotes('');
      setError('');
      
      // Reset file input
      const fileInput = document.getElementById('document-upload');
      if (fileInput) fileInput.value = '';
      
    } catch (error) {
      setError('Failed to upload document');
    }
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
    <Card>
      <Card.Header>
        <h5 className="mb-0">📄 Medical Documents</h5>
      </Card.Header>
      <Card.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        
        {/* Upload Form */}
        <Form onSubmit={handleUpload} className="mb-4">
          <Form.Group className="mb-3">
            <Form.Label>Upload Medical Document</Form.Label>
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

        {/* Uploaded Documents List */}
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

        {documents.length === 0 && (
          <div className="text-center py-4">
            <div style={{fontSize: '3rem', opacity: 0.3}}>📄</div>
            <p className="text-muted">No documents uploaded yet</p>
            <small className="text-muted">Upload your medical reports, test results, or prescriptions</small>
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default DocumentUpload;
