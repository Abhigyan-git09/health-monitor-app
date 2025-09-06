const express = require('express');
const upload = require('../middleware/upload'); // Import upload middleware
const {
  getHealthProfile,
  updateBasicInfo,
  updateMedicalHistory,
  updateDietaryInfo,
  updateLifestyle,
  saveHealthTestResults,
  uploadDocument
} = require('../controllers/healthController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All routes are protected
router.use(protect);

// Health profile routes
router.get('/profile', getHealthProfile);
router.put('/basic-info', updateBasicInfo);
router.put('/medical-history', updateMedicalHistory);
router.put('/dietary-info', updateDietaryInfo);
router.put('/lifestyle', updateLifestyle);
router.post('/health-test', saveHealthTestResults);

// Document upload route with multer middleware
router.post('/document', upload.single('document'), uploadDocument);

module.exports = router;
