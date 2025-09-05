const mongoose = require('mongoose');

const foodSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  category: {
    type: String,
    required: true,
    enum: [
      'appetizer', 'main-course', 'dessert', 'beverage', 'snack',
      'breakfast', 'lunch', 'dinner', 'fast-food', 'healthy'
    ]
  },
  cuisine: {
    type: String,
    required: true,
    enum: [
      'italian', 'chinese', 'indian', 'mexican', 'american', 'thai',
      'japanese', 'mediterranean', 'french', 'korean', 'other'
    ]
  },
  
  // Nutritional Information (per 100g)
  nutrition: {
    calories: { type: Number, required: true },
    protein: { type: Number, default: 0 }, // grams
    carbs: { type: Number, default: 0 }, // grams
    fat: { type: Number, default: 0 }, // grams
    fiber: { type: Number, default: 0 }, // grams
    sugar: { type: Number, default: 0 }, // grams
    sodium: { type: Number, default: 0 }, // mg
    cholesterol: { type: Number, default: 0 }, // mg
    saturatedFat: { type: Number, default: 0 }, // grams
  },
  
  // Health Flags
  healthFlags: {
    isVegetarian: { type: Boolean, default: false },
    isVegan: { type: Boolean, default: false },
    isGlutenFree: { type: Boolean, default: false },
    isDairyFree: { type: Boolean, default: false },
    isLowSodium: { type: Boolean, default: false },
    isHighProtein: { type: Boolean, default: false },
    isLowCarb: { type: Boolean, default: false },
    isKeto: { type: Boolean, default: false }
  },
  
  // Allergens
  allergens: [{
    type: String,
    enum: [
      'nuts', 'dairy', 'eggs', 'soy', 'wheat', 'shellfish', 
      'fish', 'sesame', 'sulfites', 'gluten'
    ]
  }],
  
  // Ingredients
  ingredients: [String],
  
  // Risk Factors
  riskFactors: [{
    type: String,
    enum: [
      'high-sodium', 'high-sugar', 'high-fat', 'high-cholesterol',
      'processed', 'fried', 'high-calorie', 'artificial-additives'
    ]
  }],
  
  // Restaurant/Source info
  restaurants: [{
    name: String,
    chain: Boolean,
    priceRange: {
      type: String,
      enum: ['$', '$$', '$$$', '$$$$']
    }
  }],
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Text search index
foodSchema.index({ name: 'text', ingredients: 'text' });

module.exports = mongoose.model('Food', foodSchema);
