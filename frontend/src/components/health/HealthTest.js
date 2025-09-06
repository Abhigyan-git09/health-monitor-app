import React, { useState } from 'react';
import { Card, Form, Button, Alert, ProgressBar, Row, Col, Badge } from 'react-bootstrap';
import { healthAPI } from '../../services/api';

const HealthTest = ({ onTestComplete, onCancel }) => {
  const [currentSection, setCurrentSection] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const testSections = [
    {
      title: "General Health",
      questions: [
        {
          id: 'overall_health',
          text: 'How would you rate your overall health?',
          type: 'radio',
          options: [
            { value: 'excellent', label: 'Excellent' },
            { value: 'very_good', label: 'Very Good' },
            { value: 'good', label: 'Good' },
            { value: 'fair', label: 'Fair' },
            { value: 'poor', label: 'Poor' }
          ]
        },
        {
          id: 'energy_level',
          text: 'How is your energy level throughout the day?',
          type: 'radio',
          options: [
            { value: 'high', label: 'High energy all day' },
            { value: 'moderate', label: 'Moderate, with some ups and downs' },
            { value: 'low', label: 'Often tired or low energy' },
            { value: 'very_low', label: 'Constantly fatigued' }
          ]
        }
      ]
    },
    {
      title: "Physical Symptoms",
      questions: [
        {
          id: 'symptoms',
          text: 'Do you experience any of these symptoms regularly?',
          type: 'checkbox',
          options: [
            { value: 'headaches', label: 'Frequent headaches' },
            { value: 'chest_pain', label: 'Chest pain or discomfort' },
            { value: 'shortness_breath', label: 'Shortness of breath' },
            { value: 'joint_pain', label: 'Joint or muscle pain' },
            { value: 'digestive_issues', label: 'Digestive problems' },
            { value: 'sleep_issues', label: 'Sleep problems' },
            { value: 'none', label: 'None of the above' }
          ]
        }
      ]
    },
    {
      title: "Lifestyle Factors",
      questions: [
        {
          id: 'smoking_status',
          text: 'What is your smoking status?',
          type: 'radio',
          options: [
            { value: 'never', label: 'Never smoked' },
            { value: 'former', label: 'Former smoker' },
            { value: 'current', label: 'Current smoker' }
          ]
        },
        {
          id: 'alcohol_consumption',
          text: 'How often do you consume alcohol?',
          type: 'radio',
          options: [
            { value: 'never', label: 'Never' },
            { value: 'rarely', label: 'Rarely (special occasions)' },
            { value: 'moderate', label: 'Moderate (1-2 drinks per week)' },
            { value: 'regular', label: 'Regular (3-7 drinks per week)' },
            { value: 'heavy', label: 'Heavy (8+ drinks per week)' }
          ]
        }
      ]
    },
    {
      title: "Medical History",
      questions: [
        {
          id: 'family_conditions',
          text: 'Do any of these conditions run in your family?',
          type: 'checkbox',
          options: [
            { value: 'diabetes', label: 'Diabetes' },
            { value: 'heart_disease', label: 'Heart Disease' },
            { value: 'high_blood_pressure', label: 'High Blood Pressure' },
            { value: 'cancer', label: 'Cancer' },
            { value: 'stroke', label: 'Stroke' },
            { value: 'none', label: 'None of the above' }
          ]
        },
        {
          id: 'current_medications',
          text: 'Are you currently taking any medications?',
          type: 'radio',
          options: [
            { value: 'none', label: 'No medications' },
            { value: 'vitamins', label: 'Only vitamins/supplements' },
            { value: 'prescription', label: 'Prescription medications' },
            { value: 'multiple', label: 'Multiple medications' }
          ]
        }
      ]
    }
  ];

  const handleAnswerChange = (questionId, value, isCheckbox = false) => {
    setAnswers(prev => {
      if (isCheckbox) {
        const currentAnswers = prev[questionId] || [];
        if (value === 'none') {
          return { ...prev, [questionId]: ['none'] };
        }
        
        const updatedAnswers = currentAnswers.includes(value)
          ? currentAnswers.filter(v => v !== value)
          : [...currentAnswers.filter(v => v !== 'none'), value];
        
        return { ...prev, [questionId]: updatedAnswers };
      } else {
        return { ...prev, [questionId]: value };
      }
    });
  };

  const nextSection = () => {
    setCurrentSection(prev => prev + 1);
  };

  const previousSection = () => {
    setCurrentSection(prev => prev - 1);
  };

  const calculateHealthScore = () => {
    let score = 50; // Base score

    // Overall health rating
    const healthRating = answers.overall_health;
    if (healthRating === 'excellent') score += 20;
    else if (healthRating === 'very_good') score += 15;
    else if (healthRating === 'good') score += 10;
    else if (healthRating === 'fair') score += 5;
    else if (healthRating === 'poor') score -= 10;

    // Energy level
    const energyLevel = answers.energy_level;
    if (energyLevel === 'high') score += 15;
    else if (energyLevel === 'moderate') score += 10;
    else if (energyLevel === 'low') score -= 5;
    else if (energyLevel === 'very_low') score -= 15;

    // Symptoms (negative impact)
    const symptoms = answers.symptoms || [];
    if (symptoms.includes('none')) score += 10;
    else score -= symptoms.length * 3;

    // Lifestyle factors
    if (answers.smoking_status === 'never') score += 10;
    else if (answers.smoking_status === 'former') score += 5;
    else if (answers.smoking_status === 'current') score -= 15;

    if (answers.alcohol_consumption === 'never' || answers.alcohol_consumption === 'rarely') score += 5;
    else if (answers.alcohol_consumption === 'heavy') score -= 10;

    // Family history risk
    const familyConditions = answers.family_conditions || [];
    if (!familyConditions.includes('none')) {
      score -= familyConditions.length * 2;
    }

    return Math.max(0, Math.min(100, score));
  };

  const generateRecommendations = () => {
    const recommendations = [];
    const healthScore = calculateHealthScore();

    if (healthScore < 60) {
      recommendations.push("Consider consulting with a healthcare provider for a comprehensive health assessment");
    }

    if (answers.energy_level === 'low' || answers.energy_level === 'very_low') {
      recommendations.push("Focus on improving sleep quality and consider checking for vitamin deficiencies");
    }

    if (answers.smoking_status === 'current') {
      recommendations.push("Smoking cessation programs can significantly improve your health outcomes");
    }

    if (answers.symptoms && answers.symptoms.length > 2 && !answers.symptoms.includes('none')) {
      recommendations.push("Multiple symptoms warrant a medical evaluation to rule out underlying conditions");
    }

    const familyConditions = answers.family_conditions || [];
    if (familyConditions.includes('diabetes')) {
      recommendations.push("Regular blood sugar monitoring recommended due to family history of diabetes");
    }
    if (familyConditions.includes('heart_disease') || familyConditions.includes('high_blood_pressure')) {
      recommendations.push("Regular cardiovascular screening recommended due to family history");
    }

    if (recommendations.length === 0) {
      recommendations.push("Continue maintaining your healthy lifestyle habits");
      recommendations.push("Regular preventive health checkups are recommended");
    }

    return recommendations;
  };

  const handleTestComplete = async () => {
    setLoading(true);
    setError('');
    
    try {
      const healthScore = calculateHealthScore();
      const recommendations = generateRecommendations();
      
      const testResults = {
        completed_date: new Date().toISOString(),
        health_score: healthScore,
        answers: answers,
        recommendations: recommendations,
        test_type: 'self_assessment'
      };

      // Save test results to backend
      const response = await healthAPI.saveHealthTestResults(testResults);
      
      if (response.success) {
        console.log('Health test results saved successfully');
      } else {
        console.warn('Failed to save test results to backend');
      }

      // Always call onTestComplete regardless of save status
      onTestComplete(testResults);
      
    } catch (error) {
      console.error('Error processing health test:', error);
      setError('Failed to save test results. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const progress = ((currentSection + 1) / testSections.length) * 100;
  const currentQuestions = testSections[currentSection];

  if (loading) {
    return (
      <Card>
        <Card.Body className="text-center py-5">
          <div style={{fontSize: '3rem'}}>🔄</div>
          <h5>Analyzing Your Health Assessment</h5>
          <p className="text-muted">Generating personalized health insights...</p>
          <ProgressBar animated now={100} />
        </Card.Body>
      </Card>
    );
  }

  return (
    <Card>
      <Card.Header>
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h5 className="mb-0">🩺 Health Assessment Test</h5>
            <small className="text-muted">Section {currentSection + 1} of {testSections.length}: {currentQuestions.title}</small>
          </div>
          <Button variant="outline-secondary" size="sm" onClick={onCancel}>
            Cancel
          </Button>
        </div>
        <div className="mt-2">
          <ProgressBar now={progress} />
          <small className="text-muted">{Math.round(progress)}% complete</small>
        </div>
      </Card.Header>
      
      <Card.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        
        {currentQuestions.questions.map((question, qIndex) => (
          <div key={question.id} className="mb-4">
            <Form.Label className="fw-bold mb-3">{question.text}</Form.Label>
            
            {question.type === 'radio' && (
              <div>
                {question.options.map((option) => (
                  <Form.Check
                    key={option.value}
                    type="radio"
                    name={question.id}
                    id={`${question.id}_${option.value}`}
                    label={option.label}
                    value={option.value}
                    checked={answers[question.id] === option.value}
                    onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                    className="mb-2"
                  />
                ))}
              </div>
            )}
            
            {question.type === 'checkbox' && (
              <div>
                {question.options.map((option) => (
                  <Form.Check
                    key={option.value}
                    type="checkbox"
                    id={`${question.id}_${option.value}`}
                    label={option.label}
                    value={option.value}
                    checked={(answers[question.id] || []).includes(option.value)}
                    onChange={(e) => handleAnswerChange(question.id, e.target.value, true)}
                    className="mb-2"
                  />
                ))}
              </div>
            )}
          </div>
        ))}
      </Card.Body>
      
      <Card.Footer>
        <div className="d-flex justify-content-between">
          <Button 
            variant="outline-secondary" 
            onClick={previousSection}
            disabled={currentSection === 0}
          >
            Previous
          </Button>
          
          <div>
            <Badge bg="primary" className="me-2">
              {currentSection + 1}/{testSections.length}
            </Badge>
          </div>
          
          {currentSection < testSections.length - 1 ? (
            <Button variant="primary" onClick={nextSection}>
              Next
            </Button>
          ) : (
            <Button variant="success" onClick={handleTestComplete}>
              Complete Assessment
            </Button>
          )}
        </div>
      </Card.Footer>
    </Card>
  );
};

export default HealthTest;
