import React from 'react';
import { Card, Row, Col, Badge, Button, Form } from 'react-bootstrap'; // Add Form here

const FoodItem = ({ food, quantity = 1, onQuantityChange, onRemove, showRemove = true }) => {
  const nutrition = food.nutrition || {};
  
  const calculateNutrition = (value, qty) => {
    return Math.round((value || 0) * qty);
  };

  return (
    <Card className="mb-2">
      <Card.Body>
        <Row className="align-items-center">
          <Col md={4}>
            <h6 className="mb-1">{food.name}</h6>
            <div>
              <Badge bg="secondary" className="me-1">{food.category}</Badge>
              {food.source === 'usda' && <Badge bg="info">USDA</Badge>}
            </div>
          </Col>
          
          <Col md={2}>
            <Form.Group>
              <Form.Label className="small">Quantity</Form.Label>
              <Form.Control
                type="number"
                min="0.1"
                step="0.1"
                value={quantity}
                onChange={(e) => onQuantityChange && onQuantityChange(parseFloat(e.target.value) || 1)}
                size="sm"
              />
            </Form.Group>
          </Col>
          
          <Col md={5}>
            <div className="small">
              <Row>
                <Col xs={6}>
                  <strong>{calculateNutrition(nutrition.calories, quantity)} cal</strong>
                </Col>
                <Col xs={6}>
                  <span>{calculateNutrition(nutrition.protein, quantity)}g protein</span>
                </Col>
              </Row>
              <Row>
                <Col xs={6}>
                  <span>{calculateNutrition(nutrition.carbs, quantity)}g carbs</span>
                </Col>
                <Col xs={6}>
                  <span>{calculateNutrition(nutrition.fat, quantity)}g fat</span>
                </Col>
              </Row>
              {nutrition.sodium > 0 && (
                <Row>
                  <Col xs={12}>
                    <span className="text-warning">{calculateNutrition(nutrition.sodium, quantity)}mg sodium</span>
                  </Col>
                </Row>
              )}
            </div>
          </Col>
          
          {showRemove && (
            <Col md={1}>
              <Button 
                variant="outline-danger" 
                size="sm"
                onClick={onRemove}
              >
                ×
              </Button>
            </Col>
          )}
        </Row>
      </Card.Body>
    </Card>
  );
};

export default FoodItem;
