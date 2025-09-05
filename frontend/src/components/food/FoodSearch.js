import React, { useState } from 'react';
import { Card, Form, InputGroup, Button, ListGroup, Spinner, Alert, Badge } from 'react-bootstrap';
import { foodAPI } from '../../services/api';

const FoodSearch = ({ onFoodSelect, selectedFoods = [] }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!searchQuery.trim() || searchQuery.trim().length < 2) {
      setError('Please enter at least 2 characters to search');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await foodAPI.searchFoods(searchQuery.trim());
      setSearchResults(response.data || []);
      
      if (response.data.length === 0) {
        setError('No foods found. Try a different search term.');
      }
    } catch (error) {
      console.error('Food search error:', error);
      setError('Failed to search foods. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatNutrition = (nutrition) => {
    if (!nutrition) return 'Nutrition info unavailable';
    
    return `${Math.round(nutrition.calories || 0)} cal, ${Math.round(nutrition.protein || 0)}g protein, ${Math.round(nutrition.carbs || 0)}g carbs`;
  };

  const isAlreadySelected = (fdcId) => {
    return selectedFoods.some(food => food.fdcId === fdcId);
  };

  return (
    <Card>
      <Card.Header>
        <h5 className="mb-0">🔍 Search Foods</h5>
      </Card.Header>
      <Card.Body>
        <Form onSubmit={handleSearch}>
          <InputGroup className="mb-3">
            <Form.Control
              type="text"
              placeholder="Search for foods (e.g., chicken breast, pizza, salad)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? <Spinner size="sm" /> : 'Search'}
            </Button>
          </InputGroup>
        </Form>

        {error && <Alert variant="warning">{error}</Alert>}

        {searchResults.length > 0 && (
          <div>
            <h6>Search Results ({searchResults.length} foods found)</h6>
            <ListGroup style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {searchResults.map((food, index) => (
                <ListGroup.Item 
                  key={food.fdcId || index}
                  className="d-flex justify-content-between align-items-start"
                >
                  <div className="flex-grow-1">
                    <h6 className="mb-1">{food.name}</h6>
                    <p className="mb-1 text-muted small">
                      {formatNutrition(food.nutrition)}
                    </p>
                    <div>
                      <Badge bg="secondary" className="me-1">{food.category}</Badge>
                      <Badge bg="info">USDA Data</Badge>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant={isAlreadySelected(food.fdcId) ? "success" : "outline-primary"}
                    disabled={isAlreadySelected(food.fdcId)}
                    onClick={() => onFoodSelect(food)}
                  >
                    {isAlreadySelected(food.fdcId) ? '✓ Added' : 'Add'}
                  </Button>
                </ListGroup.Item>
              ))}
            </ListGroup>
          </div>
        )}

        {loading && (
          <div className="text-center py-3">
            <Spinner animation="border" />
            <p className="mt-2 text-muted">Searching USDA database...</p>
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default FoodSearch;
