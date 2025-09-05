const mongoose = require('mongoose');

const healthProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  // Basic Information
  basicInfo: {
    age: {
      type: Number,
      min: 1,
      max: 120
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other', 'prefer-not-to-say']
    },
    height: {
      value: Number,  // in cm
      unit: {
        type: String,
        default: 'cm'
      }
    },
    weight: {
      value: Number,  // in kg
      unit: {
        type: String,
        default: 'kg'
      }
    },
    bloodType: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'unknown']
    }
  },
  
  // Medical History
  medicalHistory: {
    chronicConditions: [{
      condition: String,
      diagnosedDate: Date,
      severity: {
        type: String,
        enum: ['mild', 'moderate', 'severe']
      }
    }],
    allergies: [{
      allergen: String,
      severity: {
        type: String,
        enum: ['mild', 'moderate', 'severe', 'life-threatening']
      },
      reaction: String
    }],
    medications: [{
      name: String,
      dosage: String,
      frequency: String,
      startDate: Date,
      endDate: Date
    }],
    surgeries: [{
      procedure: String,
      date: Date,
      complications: String
    }]
  },
  
  // Dietary Information
  dietaryInfo: {
    dietType: {
      type: String,
      enum: ['omnivore', 'vegetarian', 'vegan', 'pescatarian', 'keto', 'paleo', 'other']
    },
    foodRestrictions: [String],
    dislikedFoods: [String],
    preferredCuisines: [String],
    dailyWaterIntake: Number, // in liters
    alcoholConsumption: {
      type: String,
      enum: ['none', 'occasional', 'moderate', 'heavy']
    },
    smokingStatus: {
      type: String,
      enum: ['never', 'former', 'current']
    }
  },
  
  // Lifestyle Information
  lifestyle: {
    activityLevel: {
      type: String,
      enum: ['sedentary', 'lightly-active', 'moderately-active', 'very-active', 'extremely-active']
    },
    sleepHours: {
      type: Number,
      min: 0,
      max: 24
    },
    stressLevel: {
      type: Number,
      min: 1,
      max: 10
    },
    occupation: String,
    exerciseFrequency: {
      type: String,
      enum: ['never', 'rarely', '1-2-times-week', '3-4-times-week', '5-6-times-week', 'daily']
    }
  },
  
  // Health Goals
  healthGoals: [{
    goal: String,
    targetDate: Date,
    priority: {
      type: String,
      enum: ['low', 'medium', 'high']
    }
  }],
  
  // Medical Documents
  documents: [{
    fileName: String,
    originalName: String,
    fileType: String,
    uploadDate: {
      type: Date,
      default: Date.now
    },
    fileSize: Number,
    documentType: {
      type: String,
      enum: ['blood-test', 'x-ray', 'prescription', 'medical-report', 'other']
    },
    notes: String
  }],
  
  // Completion Tracking
  completionStatus: {
    basicInfo: {
      type: Boolean,
      default: false
    },
    medicalHistory: {
      type: Boolean,
      default: false
    },
    dietaryInfo: {
      type: Boolean,
      default: false
    },
    lifestyle: {
      type: Boolean,
      default: false
    },
    documents: {
      type: Boolean,
      default: false
    },
    overallCompletion: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    }
  },
  
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
healthProfileSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Calculate completion percentage
healthProfileSchema.methods.calculateCompletion = function() {
  let completedSections = 0;
  const totalSections = 5;
  
  if (this.completionStatus.basicInfo) completedSections++;
  if (this.completionStatus.medicalHistory) completedSections++;
  if (this.completionStatus.dietaryInfo) completedSections++;
  if (this.completionStatus.lifestyle) completedSections++;
  if (this.completionStatus.documents) completedSections++;
  
  this.completionStatus.overallCompletion = Math.round((completedSections / totalSections) * 100);
  return this.completionStatus.overallCompletion;
};

module.exports = mongoose.model('HealthProfile', healthProfileSchema);
