const HealthProfile = require('../models/HealthProfile');
const User = require('../models/User');
const multer = require('multer');
const path = require('path');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/medical-documents/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf|doc|docx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only images, PDFs, and documents are allowed'));
    }
  }
}).single('document');

// @desc    Get user health profile
// @route   GET /api/health/profile
// @access  Private
const getHealthProfile = async (req, res) => {
  try {
    let healthProfile = await HealthProfile.findOne({ user: req.user.id });
    
    if (!healthProfile) {
      // Create empty profile if doesn't exist
      healthProfile = await HealthProfile.create({ user: req.user.id });
    }
    
    res.json({
      success: true,
      data: healthProfile
    });
  } catch (error) {
    console.error('Get health profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting health profile'
    });
  }
};

// @desc    Update basic info section
// @route   PUT /api/health/basic-info
// @access  Private
const updateBasicInfo = async (req, res) => {
  try {
    const { age, gender, height, weight, bloodType } = req.body;
    
    let healthProfile = await HealthProfile.findOne({ user: req.user.id });
    
    if (!healthProfile) {
      healthProfile = new HealthProfile({ user: req.user.id });
    }
    
    healthProfile.basicInfo = {
      age,
      gender,
      height,
      weight,
      bloodType
    };
    
    // Mark section as complete if all required fields are filled
    if (age && gender && height?.value && weight?.value) {
      healthProfile.completionStatus.basicInfo = true;
    }
    
    healthProfile.calculateCompletion();
    await healthProfile.save();
    
    res.json({
      success: true,
      data: healthProfile
    });
  } catch (error) {
    console.error('Update basic info error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating basic info'
    });
  }
};

// @desc    Update medical history section
// @route   PUT /api/health/medical-history
// @access  Private
const updateMedicalHistory = async (req, res) => {
  try {
    const { chronicConditions, allergies, medications, surgeries } = req.body;
    
    let healthProfile = await HealthProfile.findOne({ user: req.user.id });
    
    if (!healthProfile) {
      healthProfile = new HealthProfile({ user: req.user.id });
    }
    
    healthProfile.medicalHistory = {
      chronicConditions: chronicConditions || [],
      allergies: allergies || [],
      medications: medications || [],
      surgeries: surgeries || []
    };
    
    healthProfile.completionStatus.medicalHistory = true;
    healthProfile.calculateCompletion();
    await healthProfile.save();
    
    res.json({
      success: true,
      data: healthProfile
    });
  } catch (error) {
    console.error('Update medical history error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating medical history'
    });
  }
};

// @desc    Update dietary info section
// @route   PUT /api/health/dietary-info
// @access  Private
const updateDietaryInfo = async (req, res) => {
  try {
    const { 
      dietType, 
      foodRestrictions, 
      dislikedFoods, 
      preferredCuisines,
      dailyWaterIntake,
      alcoholConsumption,
      smokingStatus 
    } = req.body;
    
    let healthProfile = await HealthProfile.findOne({ user: req.user.id });
    
    if (!healthProfile) {
      healthProfile = new HealthProfile({ user: req.user.id });
    }
    
    healthProfile.dietaryInfo = {
      dietType,
      foodRestrictions: foodRestrictions || [],
      dislikedFoods: dislikedFoods || [],
      preferredCuisines: preferredCuisines || [],
      dailyWaterIntake,
      alcoholConsumption,
      smokingStatus
    };
    
    if (dietType && alcoholConsumption && smokingStatus) {
      healthProfile.completionStatus.dietaryInfo = true;
    }
    
    healthProfile.calculateCompletion();
    await healthProfile.save();
    
    res.json({
      success: true,
      data: healthProfile
    });
  } catch (error) {
    console.error('Update dietary info error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating dietary info'
    });
  }
};

// @desc    Update lifestyle section
// @route   PUT /api/health/lifestyle
// @access  Private
const updateLifestyle = async (req, res) => {
  try {
    const { 
      activityLevel, 
      sleepHours, 
      stressLevel, 
      occupation,
      exerciseFrequency 
    } = req.body;
    
    let healthProfile = await HealthProfile.findOne({ user: req.user.id });
    
    if (!healthProfile) {
      healthProfile = new HealthProfile({ user: req.user.id });
    }
    
    healthProfile.lifestyle = {
      activityLevel,
      sleepHours,
      stressLevel,
      occupation,
      exerciseFrequency
    };
    
    if (activityLevel && sleepHours && stressLevel && exerciseFrequency) {
      healthProfile.completionStatus.lifestyle = true;
    }
    
    healthProfile.calculateCompletion();
    await healthProfile.save();
    
    res.json({
      success: true,
      data: healthProfile
    });
  } catch (error) {
    console.error('Update lifestyle error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating lifestyle'
    });
  }
};

// @desc    Upload medical document
// @route   POST /api/health/upload-document
// @access  Private
const uploadDocument = async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }
    
    try {
      let healthProfile = await HealthProfile.findOne({ user: req.user.id });
      
      if (!healthProfile) {
        healthProfile = new HealthProfile({ user: req.user.id });
      }
      
      const document = {
        fileName: req.file.filename,
        originalName: req.file.originalname,
        fileType: req.file.mimetype,
        fileSize: req.file.size,
        documentType: req.body.documentType || 'other',
        notes: req.body.notes || ''
      };
      
      healthProfile.documents.push(document);
      healthProfile.completionStatus.documents = true;
      healthProfile.calculateCompletion();
      await healthProfile.save();
      
      res.json({
        success: true,
        data: {
          document,
          profile: healthProfile
        }
      });
    } catch (error) {
      console.error('Upload document error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error uploading document'
      });
    }
  });
};

// Add this function to your existing healthController.js
const saveHealthTestResults = async (req, res) => {
  try {
    const { test_results } = req.body;
    const userId = req.user.id;

    if (!test_results) {
      return res.status(400).json({
        success: false,
        message: 'Test results are required'
      });
    }

    // Find user's health profile
    let healthProfile = await HealthProfile.findOne({ user: userId });
    
    if (!healthProfile) {
      // Create new health profile if doesn't exist
      healthProfile = new HealthProfile({
        user: userId,
        basicInfo: {},
        medicalHistory: {},
        dietaryInfo: {},
        lifestyle: {},
        documents: []
      });
    }

    // Add health test results
    healthProfile.healthTestResults = {
      completed_date: test_results.completed_date,
      health_score: test_results.health_score,
      answers: test_results.answers,
      recommendations: test_results.recommendations,
      test_type: test_results.test_type || 'self_assessment'
    };

    // Update completion status
    healthProfile.completionStatus = healthProfile.completionStatus || {};
    healthProfile.completionStatus.healthTest = true;
    
    // Recalculate completion percentage
    const completedSections = Object.values(healthProfile.completionStatus).filter(Boolean).length;
    healthProfile.completionPercentage = (completedSections / 6) * 100; // 6 total sections including health test

    await healthProfile.save();

    res.json({
      success: true,
      message: 'Health test results saved successfully',
      data: healthProfile
    });

  } catch (error) {
    console.error('Save health test error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error saving health test results'
    });
  }
};




module.exports = {
  getHealthProfile,
  updateBasicInfo,
  updateMedicalHistory,
  updateDietaryInfo,
  updateLifestyle,
  uploadDocument,
  saveHealthTestResults
};
