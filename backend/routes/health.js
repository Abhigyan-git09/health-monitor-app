const express = require('express');
const {
  getHealthProfile,
  updateBasicInfo,
  updateMedicalHistory,
  updateDietaryInfo,
  updateLifestyle,
  uploadDocument
} = require('../controllers/healthController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All routes are protected
router.use(protect);

router.get('/profile', getHealthProfile);
router.put('/basic-info', updateBasicInfo);
router.put('/medical-history', updateMedicalHistory);
router.put('/dietary-info', updateDietaryInfo);
router.put('/lifestyle', updateLifestyle);
router.post('/upload-document', uploadDocument);

module.exports = router;
