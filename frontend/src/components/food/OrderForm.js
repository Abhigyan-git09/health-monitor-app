import React, { useState } from 'react';
import { Card, Form, Row, Col, Button, Alert } from 'react-bootstrap';
import FoodSearch from './FoodSearch';
import FoodItem from './FoodItem';
import { foodAPI } from '../../services/api';

const OrderForm = ({ onOrderCreated }) => {
  const [selectedFoods, setSelectedFoods] = useState([]);
  const [restaurant, setRestaurant] = useState({
    name: '',
    cuisine: '',
    location: ''
  });
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleFoodSelect = (food) => {
    const newFood = {
      ...food,
      quantity: 1,
      id: Date.now() // Temporary ID for React keys
    };
    setSelectedFoods([...selectedFoods, newFood]);
  };

  const handleQuantityChange = (index, newQuantity) => {
    const updatedFoods = [...selectedFoods];
    updatedFoods[index].quantity = newQuantity;
    setSelectedFoods(updatedFoods);
  };

  const handleRemoveFood = (index) => {
    const updatedFoods = selectedFoods.filter((_, i) => i !== index);
    setSelectedFoods(updatedFoods);
  };

  const handleRestaurantChange = (e) => {
    const { name, value } = e.target;
    setRestaurant(prev => ({ ...prev, [name]: value }));
  };

  const calculateTotalNutrition = () => {
    return selectedFoods.reduce((total, food) => {
      const nutrition = food.nutrition || {};
      const quantity = food.quantity || 1;
      
      return {
        calories: total.calories + ((nutrition.calories || 0) * quantity),
        protein: total.protein + ((nutrition.protein || 0) * quantity),
        carbs: total.carbs + ((nutrition.carbs || 0) * quantity),
        fat: total.fat + ((nutrition.fat || 0) * quantity),
        sodium: total.sodium + ((nutrition.sodium || 0) * quantity)
      };
    }, { calories: 0, protein: 0, carbs: 0, fat: 0, sodium: 0 });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // Validation
    if (!restaurant.name.trim()) {
      setError('Restaurant name is required');
      setLoading(false);
      return;
    }

    if (selectedFoods.length === 0) {
      setError('Please add at least one food item');
      setLoading(false);
      return;
    }

    try {
      // Prepare order data
      const orderData = {
        restaurant: {
          name: restaurant.name.trim(),
          cuisine: restaurant.cuisine || 'other',
          location: restaurant.location.trim()
        },
        items: selectedFoods.map(food => ({
          name: food.name,
          fdcId: food.fdcId,
          quantity: food.quantity,
          nutritionTotal: {
            calories: (food.nutrition?.calories || 0) * food.quantity,
            protein: (food.nutrition?.protein || 0) * food.quantity,
            carbs: (food.nutrition?.carbs || 0) * food.quantity,
            fat: (food.nutrition?.fat || 0) * food.quantity,
            sodium: (food.nutrition?.sodium || 0) * food.quantity
          }
        })),
        notes: notes.trim()
      };

      const response = await foodAPI.createOrder(orderData);
      
      if (response.success) {
        setSuccess('Order logged successfully! Health analysis complete.');
        
        // Reset form
        setSelectedFoods([]);
        setRestaurant({ name: '', cuisine: '', location: '' });
        setNotes('');
        
        // Notify parent component
        if (onOrderCreated) {
          onOrderCreated(response.data);
        }
        
        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (error) {
      console.error('Create order error:', error);
      setError('Failed to log order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const totalNutrition = calculateTotalNutrition();

  return (
    <div>
      <Row>
        <Col md={6}>
          <FoodSearch 
            onFoodSelect={handleFoodSelect}
            selectedFoods={selectedFoods}
          />
        </Col>
        
        <Col md={6}>
          <Card>
            <Card.Header>
              <h5 className="mb-0">🍽️ Log Food Order</h5>
            </Card.Header>
            <Card.Body>
              {error && <Alert variant="danger">{error}</Alert>}
              {success && <Alert variant="success">{success}</Alert>}
              
              <Form onSubmit={handleSubmit}>
                {/* Restaurant Information */}
                <Row>
                  <Col md={8}>
                    <Form.Group className="mb-3">
                      <Form.Label>Restaurant Name *</Form.Label>
                      <Form.Control
                        type="text"
                        name="name"
                        value={restaurant.name}
                        onChange={handleRestaurantChange}
                        placeholder="e.g., McDonald's, Olive Garden"
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Cuisine Type</Form.Label>
                      <Form.Select
                        name="cuisine"
                        value={restaurant.cuisine}
                        onChange={handleRestaurantChange}
                      >
                        <option value="">Select</option>
                        <option value="american">American</option>
                        <option value="italian">Italian</option>
                        <option value="chinese">Chinese</option>
                        <option value="indian">Indian</option>
                        <option value="mexican">Mexican</option>
                        <option value="thai">Thai</option>
                        <option value="japanese">Japanese</option>
                        <option value="mediterranean">Mediterranean</option>
                        <option value="french">French</option>
                        <option value="korean">Korean</option>
                        <option value="other">Other</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Label>Location (Optional)</Form.Label>
                  <Form.Control
                    type="text"
                    name="location"
                    value={restaurant.location}
                    onChange={handleRestaurantChange}
                    placeholder="e.g., Downtown, 123 Main St"
                  />
                </Form.Group>

                {/* Selected Foods */}
                <div className="mb-3">
                  <Form.Label>Selected Items ({selectedFoods.length})</Form.Label>
                  {selectedFoods.length === 0 ? (
                    <Alert variant="info">
                      Search and add foods from the left panel
                    </Alert>
                  ) : (
                    <div>
                      {selectedFoods.map((food, index) => (
                        <FoodItem
                          key={food.id}
                          food={food}
                          quantity={food.quantity}
                          onQuantityChange={(newQuantity) => handleQuantityChange(index, newQuantity)}
                          onRemove={() => handleRemoveFood(index)}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* Nutrition Summary */}
                {selectedFoods.length > 0 && (
                  <Card className="mb-3 bg-light">
                    <Card.Body>
                      <h6>Order Summary</h6>
                      <Row className="text-center">
                        <Col>
                          <strong>{Math.round(totalNutrition.calories)}</strong>
                          <br/><small>Calories</small>
                        </Col>
                        <Col>
                          <strong>{Math.round(totalNutrition.protein)}g</strong>
                          <br/><small>Protein</small>
                        </Col>
                        <Col>
                          <strong>{Math.round(totalNutrition.carbs)}g</strong>
                          <br/><small>Carbs</small>
                        </Col>
                        <Col>
                          <strong>{Math.round(totalNutrition.fat)}g</strong>
                          <br/><small>Fat</small>
                        </Col>
                        <Col>
                          <strong>{Math.round(totalNutrition.sodium)}mg</strong>
                          <br/><small>Sodium</small>
                        </Col>
                      </Row>
                    </Card.Body>
                  </Card>
                )}

                {/* Notes */}
                <Form.Group className="mb-3">
                  <Form.Label>Notes (Optional)</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Any additional notes about this order..."
                  />
                </Form.Group>

                <Button 
                  type="submit" 
                  variant="primary" 
                  disabled={loading || selectedFoods.length === 0}
                  className="w-100"
                >
                  {loading ? 'Logging Order...' : 'Log Order & Analyze Health Impact'}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default OrderForm;
