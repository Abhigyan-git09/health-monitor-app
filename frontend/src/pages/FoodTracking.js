import React, { useState } from 'react';
import { Container, Nav, Tab, Row, Col } from 'react-bootstrap';
import OrderForm from '../components/food/OrderForm';
import OrderHistory from '../components/food/OrderHistory';

const FoodTracking = () => {
  const [activeTab, setActiveTab] = useState('log-order');
  const [refreshHistory, setRefreshHistory] = useState(0);

  const handleOrderCreated = (newOrder) => {
    // Switch to history tab and refresh the history
    setActiveTab('order-history');
    setRefreshHistory(prev => prev + 1);
  };

  return (
    <Container className="mt-4">
      <Row>
        <Col md={12}>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2>🍽️ Food Tracking</h2>
            <small className="text-muted">Monitor your food orders and get health insights</small>
          </div>
        </Col>
      </Row>

      <Row>
        <Col md={12}>
          <Tab.Container activeKey={activeTab} onSelect={setActiveTab}>
            <Nav variant="tabs" className="mb-4">
              <Nav.Item>
                <Nav.Link eventKey="log-order">
                  📝 Log New Order
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="order-history">
                  📋 Order History
                </Nav.Link>
              </Nav.Item>
            </Nav>

            <Tab.Content>
              <Tab.Pane eventKey="log-order">
                <OrderForm onOrderCreated={handleOrderCreated} />
              </Tab.Pane>
              
              <Tab.Pane eventKey="order-history">
                <OrderHistory key={refreshHistory} />
              </Tab.Pane>
            </Tab.Content>
          </Tab.Container>
        </Col>
      </Row>
    </Container>
  );
};

export default FoodTracking;
