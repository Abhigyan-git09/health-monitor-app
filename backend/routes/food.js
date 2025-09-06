const express = require('express');
const {
  searchFoods,
  getUSDAFoodDetails,
  createFoodOrder,
  getUserOrders,
  getOrderById,
  getMLRecommendations,        // Make sure this is imported
  getHealthRiskAssessment      // Make sure this is imported
} = require('../controllers/foodController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All routes are protected
router.use(protect);

// Food search and details
router.get('/search', searchFoods);
router.get('/usda/:fdcId', getUSDAFoodDetails);

// ML-powered features - ADD THESE IF MISSING
router.post('/recommendations', getMLRecommendations);     
router.get('/health-risk', getHealthRiskAssessment);       

// Order management
router.post('/order', createFoodOrder);
router.get('/orders', getUserOrders);
router.get('/order/:id', getOrderById);

module.exports = router;
