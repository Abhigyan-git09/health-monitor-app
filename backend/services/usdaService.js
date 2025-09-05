const axios = require('axios');

class USDAService {
  constructor() {
    this.baseURL = 'https://api.nal.usda.gov/fdc/v1';
    this.apiKey = process.env.USDA_API_KEY;
  }

  // Search for foods in USDA database
  async searchFoods(query, pageSize = 25, pageNumber = 1) {
    try {
      const response = await axios.post(`${this.baseURL}/foods/search`, {
        query: query,
        pageSize: pageSize,
        pageNumber: pageNumber,
        sortBy: 'dataType.keyword',
        sortOrder: 'asc'
      }, {
        params: {
          api_key: this.apiKey
        }
      });

      return response.data;
    } catch (error) {
      console.error('USDA API search error:', error.response?.data || error.message);
      throw new Error('Failed to search USDA food database');
    }
  }

  // Get detailed food information by FDC ID
  async getFoodDetails(fdcId) {
    try {
      const response = await axios.get(`${this.baseURL}/food/${fdcId}`, {
        params: {
          api_key: this.apiKey
        }
      });

      return response.data;
    } catch (error) {
      console.error('USDA API details error:', error.response?.data || error.message);
      throw new Error('Failed to get food details from USDA');
    }
  }

  // Convert USDA food data to our format
  convertToOurFormat(usdaFood) {
    const nutrients = {};
    
    // Map USDA nutrients to our format
    if (usdaFood.foodNutrients) {
      usdaFood.foodNutrients.forEach(nutrient => {
        const name = nutrient.nutrient.name.toLowerCase();
        const value = nutrient.amount || 0;
        
        if (name.includes('energy') || name.includes('calorie')) {
          nutrients.calories = value;
        } else if (name.includes('protein')) {
          nutrients.protein = value;
        } else if (name.includes('carbohydrate')) {
          nutrients.carbs = value;
        } else if (name.includes('total lipid') || name.includes('fat')) {
          nutrients.fat = value;
        } else if (name.includes('fiber')) {
          nutrients.fiber = value;
        } else if (name.includes('sugars')) {
          nutrients.sugar = value;
        } else if (name.includes('sodium')) {
          nutrients.sodium = value;
        } else if (name.includes('cholesterol')) {
          nutrients.cholesterol = value;
        }
      });
    }

    return {
      fdcId: usdaFood.fdcId,
      name: usdaFood.description || usdaFood.lowercaseDescription,
      category: this.categorizeFood(usdaFood),
      nutrition: {
        calories: nutrients.calories || 0,
        protein: nutrients.protein || 0,
        carbs: nutrients.carbs || 0,
        fat: nutrients.fat || 0,
        fiber: nutrients.fiber || 0,
        sugar: nutrients.sugar || 0,
        sodium: nutrients.sodium || 0,
        cholesterol: nutrients.cholesterol || 0
      },
      ingredients: usdaFood.ingredients ? [usdaFood.ingredients] : [],
      source: 'usda'
    };
  }

  // Basic food categorization
  categorizeFood(usdaFood) {
    const name = (usdaFood.description || '').toLowerCase();
    
    if (name.includes('pizza') || name.includes('burger') || name.includes('fries')) {
      return 'fast-food';
    } else if (name.includes('salad') || name.includes('vegetable')) {
      return 'healthy';
    } else if (name.includes('chicken') || name.includes('beef') || name.includes('fish')) {
      return 'main-course';
    } else if (name.includes('cake') || name.includes('ice cream') || name.includes('cookie')) {
      return 'dessert';
    } else if (name.includes('coffee') || name.includes('tea') || name.includes('juice')) {
      return 'beverage';
    } else {
      return 'main-course';
    }
  }
}

module.exports = new USDAService();
