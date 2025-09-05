require('dotenv').config();
const usdaService = require('./services/usdaService');

const testUSDA = async () => {
  try {
    console.log('Testing USDA API...');
    
    // Test search
    const searchResults = await usdaService.searchFoods('chicken breast', 5);
    console.log('Search Results:', searchResults.foods?.length || 0, 'foods found');
    
    if (searchResults.foods && searchResults.foods.length > 0) {
      const firstFood = searchResults.foods[0];
      console.log('First food:', firstFood.description);
      
      // Test details
      const details = await usdaService.getFoodDetails(firstFood.fdcId);
      const converted = usdaService.convertToOurFormat(details);
      console.log('Converted food:', converted);
    }
    
    console.log('✅ USDA API test successful!');
  } catch (error) {
    console.error('❌ USDA API test failed:', error.message);
  }
};

testUSDA();
