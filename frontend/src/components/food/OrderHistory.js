import React, { useState, useEffect } from 'react';
import { Card, Table, Badge, Button, Modal, Row, Col, Spinner, Alert } from 'react-bootstrap';
import { foodAPI } from '../../services/api';
import HealthAnalysis from './HealthAnalysis';

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await foodAPI.getUserOrders({ limit: 20 });
      if (response.success) {
        setOrders(response.data || []);
        setStats(response.stats || null);
      }
    } catch (error) {
      console.error('Fetch orders error:', error);
      setError('Failed to load order history');
    } finally {
      setLoading(false);
    }
  };

  const handleOrderClick = (order) => {
    setSelectedOrder(order);
    setShowModal(true);
  };

  const getHealthScoreColor = (score) => {
    if (!score) return 'secondary';
    if (score >= 80) return 'success';
    if (score >= 60) return 'warning';
    return 'danger';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Date unavailable';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Invalid date';
    }
  };

  if (loading) {
    return (
      <Card>
        <Card.Body className="text-center">
          <Spinner animation="border" />
          <p className="mt-2">Loading your order history...</p>
        </Card.Body>
      </Card>
    );
  }

  return (
    <>
      {stats && stats.last30Days && (
        <Row className="mb-4">
          <Col md={3}>
            <Card className="text-center">
              <Card.Body>
                <h4 className="text-primary">{stats.last30Days.totalOrders || 0}</h4>
                <small>Orders (30 days)</small>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="text-center">
              <Card.Body>
                <h4 className="text-info">{stats.last30Days.avgCaloriesPerOrder || 0}</h4>
                <small>Avg Calories/Order</small>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="text-center">
              <Card.Body>
                <h4 className="text-warning">{stats.last30Days.totalWarnings || 0}</h4>
                <small>Total Warnings</small>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="text-center">
              <Card.Body>
                <h4 className={`text-${getHealthScoreColor(stats.last30Days.avgHealthScore)}`}>
                  {stats.last30Days.avgHealthScore || 0}
                </h4>
                <small>Avg Health Score</small>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      <Card>
        <Card.Header>
          <h5 className="mb-0">Order History</h5>
        </Card.Header>
        <Card.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          
          {orders.length === 0 ? (
            <Alert variant="info">
              No orders found. Start by logging your first food order!
            </Alert>
          ) : (
            <Table responsive hover>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Restaurant</th>
                  <th>Items</th>
                  <th>Calories</th>
                  <th>Health Score</th>
                  <th>Warnings</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order._id || order.id}>
                    <td>{formatDate(order.orderInfo?.orderDate)}</td>
                    <td>
                      <div>
                        <strong>{order.orderInfo?.restaurant?.name || 'Unknown Restaurant'}</strong>
                        {order.orderInfo?.restaurant?.cuisine && (
                          <>
                            <br />
                            <Badge bg="secondary" className="small">
                              {order.orderInfo.restaurant.cuisine}
                            </Badge>
                          </>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className="badge bg-info">{order.items?.length || 0} items</span>
                      {order.items && order.items.length > 0 && (
                        <>
                          <br />
                          <small className="text-muted">
                            {order.items.slice(0, 2).map(item => item.name).join(', ')}
                            {order.items.length > 2 && '...'}
                          </small>
                        </>
                      )}
                    </td>
                    <td>
                      <strong>{Math.round(order.analysis?.totalCalories || 0)}</strong>
                    </td>
                    <td>
                      <Badge bg={getHealthScoreColor(order.analysis?.healthScore)}>
                        {order.analysis?.healthScore || 0}/100
                      </Badge>
                    </td>
                    <td>
                      {order.analysis?.warnings && order.analysis.warnings.length > 0 ? (
                        <Badge bg="warning">
                          {order.analysis.warnings.length} warning{order.analysis.warnings.length !== 1 ? 's' : ''}
                        </Badge>
                      ) : (
                        <Badge bg="success">None</Badge>
                      )}
                    </td>
                    <td>
                      <Button
                        size="sm"
                        variant="outline-primary"
                        onClick={() => handleOrderClick(order)}
                      >
                        View Details
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Order Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedOrder && (
            <>
              <Card className="mb-3">
                <Card.Body>
                  <Row>
                    <Col md={6}>
                      <h6>Restaurant Information</h6>
                      <p><strong>Name:</strong> {selectedOrder.orderInfo?.restaurant?.name || 'Unknown'}</p>
                      {selectedOrder.orderInfo?.restaurant?.cuisine && (
                        <p><strong>Cuisine:</strong> {selectedOrder.orderInfo.restaurant.cuisine}</p>
                      )}
                      {selectedOrder.orderInfo?.restaurant?.location && (
                        <p><strong>Location:</strong> {selectedOrder.orderInfo.restaurant.location}</p>
                      )}
                    </Col>
                    <Col md={6}>
                      <h6>Order Information</h6>
                      <p><strong>Date:</strong> {formatDate(selectedOrder.orderInfo?.orderDate)}</p>
                      <p><strong>Items:</strong> {selectedOrder.items?.length || 0}</p>
                      {selectedOrder.notes && (
                        <p><strong>Notes:</strong> {selectedOrder.notes}</p>
                      )}
                    </Col>
                  </Row>
                </Card.Body>
              </Card>

              <Card className="mb-3">
                <Card.Header>
                  <h6 className="mb-0">Items Ordered</h6>
                </Card.Header>
                <Card.Body>
                  {selectedOrder.items && selectedOrder.items.length > 0 ? (
                    selectedOrder.items.map((item, index) => (
                      <div key={index} className="border-bottom pb-2 mb-2">
                        <Row>
                          <Col md={6}>
                            <strong>{item.name || 'Unknown Item'}</strong>
                            <br />
                            <small>Quantity: {item.quantity || 1}</small>
                          </Col>
                          <Col md={6}>
                            <small>
                              {Math.round(item.nutritionTotal?.calories || 0)} cal, 
                              {' '}{Math.round(item.nutritionTotal?.protein || 0)}g protein,
                              {' '}{Math.round(item.nutritionTotal?.carbs || 0)}g carbs
                            </small>
                          </Col>
                        </Row>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted">No items available</p>
                  )}
                </Card.Body>
              </Card>

              <HealthAnalysis analysis={selectedOrder.analysis} />
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default OrderHistory;
