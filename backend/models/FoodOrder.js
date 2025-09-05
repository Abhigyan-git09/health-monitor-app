const mongoose = require('mongoose');

const foodOrderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Order Details
  orderInfo: {
    restaurant: {
      name: { type: String, required: true },
      cuisine: String,
      location: String
    },
    orderDate: { type: Date, default: Date.now },
    deliveryTime: Date,
    totalAmount: Number,
    orderSource: {
      type: String,
      enum: ['manual', 'uber-eats', 'doordash', 'grubhub', 'other'],
      default: 'manual'
    }
  },
  
  // Food Items
  items: [{
    food: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Food'
    },
    name: { type: String, required: true }, // In case food not in DB
    quantity: { type: Number, default: 1 },
    price: Number,
    customizations: [String], // "Extra spicy", "No onions", etc.
    
    // Nutritional totals for this item
    nutritionTotal: {
      calories: Number,
      protein: Number,
      carbs: Number,
      fat: Number,
      sodium: Number
    }
  }],
  
  // Analysis Results
  analysis: {
    totalCalories: { type: Number, default: 0 },
    totalProtein: { type: Number, default: 0 },
    totalCarbs: { type: Number, default: 0 },
    totalFat: { type: Number, default: 0 },
    totalSodium: { type: Number, default: 0 },
    
    // Health Warnings
    warnings: [{
      type: {
        type: String,
        enum: ['allergy', 'dietary-restriction', 'health-condition', 'high-calorie', 'high-sodium']
      },
      severity: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical']
      },
      message: String,
      recommendation: String
    }],
    
    // Health Score (1-100)
    healthScore: { type: Number, min: 0, max: 100 },
    
    // Recommendations
    recommendations: [String]
  },
  
  // User Notes
  notes: String,
  rating: { type: Number, min: 1, max: 5 },
  
  createdAt: { type: Date, default: Date.now }
});

// Calculate nutrition totals before saving
foodOrderSchema.pre('save', function(next) {
  let totalCalories = 0, totalProtein = 0, totalCarbs = 0, totalFat = 0, totalSodium = 0;
  
  this.items.forEach(item => {
    if (item.nutritionTotal) {
      totalCalories += item.nutritionTotal.calories || 0;
      totalProtein += item.nutritionTotal.protein || 0;
      totalCarbs += item.nutritionTotal.carbs || 0;
      totalFat += item.nutritionTotal.fat || 0;
      totalSodium += item.nutritionTotal.sodium || 0;
    }
  });
  
  this.analysis.totalCalories = totalCalories;
  this.analysis.totalProtein = totalProtein;
  this.analysis.totalCarbs = totalCarbs;
  this.analysis.totalFat = totalFat;
  this.analysis.totalSodium = totalSodium;
  
  next();
});

module.exports = mongoose.model('FoodOrder', foodOrderSchema);
