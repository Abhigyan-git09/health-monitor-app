const Food = require('../models/Food');
const FoodOrder = require('../models/FoodOrder');
const HealthProfile = require('../models/HealthProfile');
const usdaService = require('../services/usdaService');

// @desc    Search foods (USDA + Local DB)
// @route   GET /api/food/search?q=query
// @access  Private
const searchFoods = async (req, res) => {
  try {
    const { q, limit = 20 } = req.query;
    
    if (!q || q.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Search query must be at least 2 characters'
      });
    }

    // Search USDA database
    const usdaResults = await usdaService.searchFoods(q, parseInt(limit));
    
    // Convert USDA results to our format
    const foods = usdaResults.foods ? usdaResults.foods.map(food => 
      usdaService.convertToOurFormat(food)
    ) : [];
    
    res.json({
      success: true,
      data: foods,
      count: foods.length,
      source: 'usda',
      totalHits: usdaResults.totalHits || 0
    });
  } catch (error) {
    console.error('Search foods error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error searching foods'
    });
  }
};

// @desc    Get food details from USDA
// @route   GET /api/food/usda/:fdcId
// @access  Private
const getUSDAFoodDetails = async (req, res) => {
  try {
    const { fdcId } = req.params;
    
    const usdaFood = await usdaService.getFoodDetails(fdcId);
    const food = usdaService.convertToOurFormat(usdaFood);
    
    res.json({
      success: true,
      data: food
    });
  } catch (error) {
    console.error('Get USDA food error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting food details'
    });
  }
};

// @desc    Create food order with analysis
// @route   POST /api/food/order
// @access  Private
const createFoodOrder = async (req, res) => {
  try {
    const { restaurant, items, notes } = req.body;
    
    // Validate required fields
    if (!restaurant?.name || !items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Restaurant name and items are required'
      });
    }

    // Calculate nutrition for each item
    const processedItems = await Promise.all(items.map(async (item) => {
      let nutritionTotal = {
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        sodium: 0
      };

      // If item has USDA FDC ID, get detailed nutrition
      if (item.fdcId) {
        try {
          const usdaFood = await usdaService.getFoodDetails(item.fdcId);
          const foodData = usdaService.convertToOurFormat(usdaFood);
          
          // Calculate nutrition based on quantity (assuming 100g serving)
          const quantity = item.quantity || 1;
          nutritionTotal = {
            calories: (foodData.nutrition.calories || 0) * quantity,
            protein: (foodData.nutrition.protein || 0) * quantity,
            carbs: (foodData.nutrition.carbs || 0) * quantity,
            fat: (foodData.nutrition.fat || 0) * quantity,
            sodium: (foodData.nutrition.sodium || 0) * quantity
          };
        } catch (error) {
          console.error('Error fetching USDA data for item:', error.message);
        }
      }

      return {
        ...item,
        nutritionTotal
      };
    }));
    
    // Create order
    const order = new FoodOrder({
      user: req.user.id,
      orderInfo: {
        restaurant,
        orderDate: new Date()
      },
      items: processedItems,
      notes
    });
    
    // Get user's health profile for analysis
    const healthProfile = await HealthProfile.findOne({ user: req.user.id });
    
    // Analyze order against health profile
    if (healthProfile) {
      order.analysis = await analyzeOrderForUser(order, healthProfile);
    } else {
      // Basic analysis without health profile
      order.analysis = await basicOrderAnalysis(order);
    }
    
    await order.save();
    
    res.status(201).json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating order'
    });
  }
};

// @desc    Get user's food orders with analytics
// @route   GET /api/food/orders
// @access  Private
const getUserOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10, startDate, endDate } = req.query;
    
    let query = { user: req.user.id };
    
    if (startDate || endDate) {
      query['orderInfo.orderDate'] = {};
      if (startDate) query['orderInfo.orderDate'].$gte = new Date(startDate);
      if (endDate) query['orderInfo.orderDate'].$lte = new Date(endDate);
    }
    
    const orders = await FoodOrder.find(query)
      .sort({ 'orderInfo.orderDate': -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await FoodOrder.countDocuments(query);
    
    // Calculate summary statistics
    const stats = await calculateUserFoodStats(req.user.id);
    
    res.json({
      success: true,
      data: orders,
      stats: stats,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting orders'
    });
  }
};

// @desc    Basic order analysis without health profile
const basicOrderAnalysis = async (order) => {
  const analysis = {
    warnings: [],
    recommendations: [],
    healthScore: 70
  };
  
  // Check high calorie content
  if (order.analysis.totalCalories > 800) {
    analysis.warnings.push({
      type: 'high-calorie',
      severity: 'medium',
      message: 'This is a high-calorie meal (800+ calories)',
      recommendation: 'Consider sharing or saving half for later'
    });
    analysis.healthScore -= 10;
  }
  
  // Check high sodium
  if (order.analysis.totalSodium > 2000) {
    analysis.warnings.push({
      type: 'high-sodium',
      severity: 'medium',
      message: 'High sodium content detected (2000mg+)',
      recommendation: 'Drink plenty of water and limit sodium for the rest of the day'
    });
    analysis.healthScore -= 10;
  }
  
  // Positive feedback
  if (order.analysis.totalCalories < 500) {
    analysis.recommendations.push('Great choice! This is a moderate-calorie meal.');
    analysis.healthScore += 10;
  }
  
  return analysis;
};

// @desc    Advanced analysis with health profile
const analyzeOrderForUser = async (order, healthProfile) => {
  // Start with basic analysis
  const analysis = await basicOrderAnalysis(order);
  
  // Add health profile specific analysis
  if (healthProfile.medicalHistory.allergies.length > 0) {
    const allergyKeywords = healthProfile.medicalHistory.allergies.map(a => 
      a.allergen.toLowerCase()
    );
    
    order.items.forEach(item => {
      const itemName = item.name.toLowerCase();
      const matchingAllergies = allergyKeywords.filter(allergen => 
        itemName.includes(allergen) || 
        (item.ingredients && item.ingredients.some(ing => 
          ing.toLowerCase().includes(allergen)
        ))
      );
      
      if (matchingAllergies.length > 0) {
        analysis.warnings.push({
          type: 'allergy',
          severity: 'critical',
          message: `⚠️ ALLERGY ALERT: ${item.name} may contain ${matchingAllergies.join(', ')}`,
          recommendation: 'Please verify ingredients before consuming'
        });
        analysis.healthScore -= 30;
      }
    });
  }
  
  // Check dietary preferences
  if (healthProfile.dietaryInfo.dietType === 'vegetarian') {
    order.items.forEach(item => {
      const itemName = item.name.toLowerCase();
      if (itemName.includes('chicken') || itemName.includes('beef') || 
          itemName.includes('pork') || itemName.includes('fish')) {
        analysis.warnings.push({
          type: 'dietary-restriction',
          severity: 'medium',
          message: `${item.name} may not align with your vegetarian diet`,
          recommendation: 'Consider vegetarian alternatives'
        });
        analysis.healthScore -= 15;
      }
    });
  }
  
  return analysis;
};

// @desc    Calculate user food statistics
const calculateUserFoodStats = async (userId) => {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const orders = await FoodOrder.find({
    user: userId,
    'orderInfo.orderDate': { $gte: thirtyDaysAgo }
  });
  
  let totalCalories = 0;
  let totalOrders = orders.length;
  let warningCount = 0;
  let avgHealthScore = 0;
  
  orders.forEach(order => {
    totalCalories += order.analysis.totalCalories || 0;
    warningCount += order.analysis.warnings ? order.analysis.warnings.length : 0;
    avgHealthScore += order.analysis.healthScore || 0;
  });
  
  return {
    last30Days: {
      totalOrders,
      avgCaloriesPerOrder: totalOrders > 0 ? Math.round(totalCalories / totalOrders) : 0,
      totalWarnings: warningCount,
      avgHealthScore: totalOrders > 0 ? Math.round(avgHealthScore / totalOrders) : 0
    }
  };
};

module.exports = {
  searchFoods,
  getUSDAFoodDetails,
  createFoodOrder,
  getUserOrders,
  getOrderById: async (req, res) => {
    try {
      const order = await FoodOrder.findOne({
        _id: req.params.id,
        user: req.user.id
      });
      
      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Order not found'
        });
      }
      
      res.json({
        success: true,
        data: order
      });
    } catch (error) {
      console.error('Get order error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error getting order'
      });
    }
  }
};
