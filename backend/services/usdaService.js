const axios = require('axios');

class USDAService {
  constructor() {
    this.baseURL = 'https://api.nal.usda.gov/fdc/v1';
    this.apiKey = process.env.USDA_API_KEY;
    console.log('USDA API Key loaded:', this.apiKey ? 'YES' : 'NO');
  }

  async searchFoods(query, pageSize = 25, pageNumber = 1) {
    try {
      console.log(`🔍 USDA Search: "${query}" with key: ${this.apiKey}`);
      
      const requestPayload = {
        query: query,
        pageSize: pageSize,
        pageNumber: pageNumber,
        sortBy: 'dataType.keyword',
        sortOrder: 'asc'
      };

      console.log('📤 USDA Request:', requestPayload);

      const response = await axios.post(`${this.baseURL}/foods/search?api_key=${this.apiKey}`, requestPayload, {
        timeout: 15000,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log('📥 USDA Response Status:', response.status);
      console.log('📥 USDA Response Data:', {
        totalHits: response.data?.totalHits,
        foodCount: response.data?.foods?.length,
        firstFood: response.data?.foods?.[0]?.description
      });

      return response.data;
    } catch (error) {
      console.error('❌ USDA API Error:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      return { foods: [], totalHits: 0 };
    }
  }

  convertToOurFormat(usdaFood) {
    if (!usdaFood) return null;

    const nutrients = {};
    
    if (usdaFood.foodNutrients && Array.isArray(usdaFood.foodNutrients)) {
      usdaFood.foodNutrients.forEach(nutrient => {
        if (!nutrient?.nutrient?.name) return;
        
        const name = nutrient.nutrient.name.toLowerCase();
        const value = nutrient.amount || 0;
        
        if (name.includes('energy')) nutrients.calories = value;
        else if (name.includes('protein')) nutrients.protein = value;
        else if (name.includes('carbohydrate')) nutrients.carbs = value;
        else if (name.includes('total lipid')) nutrients.fat = value;
        else if (name.includes('fiber')) nutrients.fiber = value;
        else if (name.includes('sugars')) nutrients.sugar = value;
        else if (name.includes('sodium')) nutrients.sodium = value;
      });
    }

    return {
      fdcId: usdaFood.fdcId,
      name: usdaFood.description || 'Unknown Food',
      category: 'main-course',
      nutrition: {
        calories: nutrients.calories || 0,
        protein: nutrients.protein || 0,
        carbs: nutrients.carbs || 0,
        fat: nutrients.fat || 0,
        fiber: nutrients.fiber || 0,
        sugar: nutrients.sugar || 0,
        sodium: nutrients.sodium || 0
      },
      source: 'usda'
    };
  }
}

module.exports = new USDAService();
