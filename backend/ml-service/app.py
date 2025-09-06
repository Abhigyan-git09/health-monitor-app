from flask import Flask, request, jsonify
from flask_cors import CORS
import logging
import os
import sys
import traceback
from datetime import datetime
import numpy as np

# Add current directory to path for imports
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from data.feature_engineering import HealthFeatureEngineer
from models.recommendation_model import FoodRecommendationEngine
from models.health_risk_model import HealthRiskPredictor
from models.meal_planner import SmartMealPlanner

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Global ML model instances
feature_engineer = HealthFeatureEngineer()
recommendation_engine = FoodRecommendationEngine()
risk_predictor = HealthRiskPredictor()
meal_planner = SmartMealPlanner()

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'service': 'HealthMonitor ML Service',
        'version': '1.0.0'
    })

@app.route('/recommend', methods=['POST'])
def get_food_recommendations():
    """Get personalized food recommendations for user"""
    try:
        data = request.get_json()
        
        # Extract required data
        user_id = data.get('user_id')
        health_profile = data.get('health_profile', {})
        order_history = data.get('order_history', [])
        available_foods = data.get('available_foods', [])
        n_recommendations = data.get('n_recommendations', 10)
        
        if not user_id or not available_foods:
            return jsonify({
                'error': 'user_id and available_foods are required'
            }), 400
        
        # Extract features
        user_features = feature_engineer.extract_user_features(health_profile)
        order_features = feature_engineer.extract_order_features(order_history)
        combined_features = feature_engineer.combine_features(user_features, order_features)
        
        # Get recommendations
        recommendations = recommendation_engine.get_recommendations(
            user_id=user_id,
            user_features=combined_features,
            available_foods=available_foods,
            n_recommendations=n_recommendations
        )
        
        # Format response
        formatted_recommendations = []
        for rec in recommendations:
            formatted_recommendations.append({
                'food': rec['food'],
                'confidence_score': round(rec['score'], 3),
                'health_score': round(rec.get('content_score', 0), 3),
                'popularity_score': round(rec.get('collaborative_score', 0), 3),
                'health_boost': round(rec.get('health_boost', 0), 3),
                'reasoning': rec.get('reasoning', 'Recommended based on your profile'),
                'recommendation_type': 'ml_powered' if recommendation_engine.is_trained else 'rule_based'
            })
        
        return jsonify({
            'success': True,
            'user_id': user_id,
            'recommendations': formatted_recommendations,
            'total_found': len(formatted_recommendations),
            'model_status': 'trained' if recommendation_engine.is_trained else 'fallback',
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"Error in get_food_recommendations: {e}")
        logger.error(traceback.format_exc())
        return jsonify({
            'error': 'Internal server error',
            'details': str(e)
        }), 500

@app.route('/health-risk', methods=['POST'])
def assess_health_risk():
    """Assess health risks based on user profile and eating patterns"""
    try:
        data = request.get_json()
        
        user_id = data.get('user_id')
        health_profile = data.get('health_profile', {})
        order_history = data.get('order_history', [])
        
        if not user_id:
            return jsonify({'error': 'user_id is required'}), 400
        
        # Extract features
        user_features = feature_engineer.extract_user_features(health_profile)
        order_features = feature_engineer.extract_order_features(order_history)
        combined_features = feature_engineer.combine_features(user_features, order_features)
        
        # Predict health risks
        risk_assessment = risk_predictor.predict_health_risks(combined_features)
        
        return jsonify({
            'success': True,
            'user_id': user_id,
            'risk_assessment': risk_assessment,
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"Error in assess_health_risk: {e}")
        return jsonify({
            'error': 'Internal server error',
            'details': str(e)
        }), 500

@app.route('/meal-plan', methods=['POST'])
def generate_meal_plan():
    """Generate personalized meal plan"""
    try:
        data = request.get_json()
        
        user_id = data.get('user_id')
        health_profile = data.get('health_profile', {})
        preferences = data.get('preferences', {})
        days = data.get('days', 7)
        
        if not user_id:
            return jsonify({'error': 'user_id is required'}), 400
        
        # Extract features
        user_features = feature_engineer.extract_user_features(health_profile)
        
        # Generate meal plan
        meal_plan = meal_planner.generate_meal_plan(
            user_features=user_features,
            preferences=preferences,
            days=days
        )
        
        return jsonify({
            'success': True,
            'user_id': user_id,
            'meal_plan': meal_plan,
            'duration_days': days,
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"Error in generate_meal_plan: {e}")
        return jsonify({
            'error': 'Internal server error',
            'details': str(e)
        }), 500

@app.route('/analyze-order', methods=['POST'])
def analyze_food_order():
    """Analyze a food order and provide detailed insights"""
    try:
        data = request.get_json()
        
        user_id = data.get('user_id')
        health_profile = data.get('health_profile', {})
        order_items = data.get('order_items', [])
        
        if not user_id or not order_items:
            return jsonify({'error': 'user_id and order_items are required'}), 400
        
        # Extract user features
        user_features = feature_engineer.extract_user_features(health_profile)
        
        # Analyze order
        analysis = {
            'nutritional_summary': _calculate_order_nutrition(order_items),
            'health_warnings': _generate_health_warnings(order_items, user_features),
            'improvement_suggestions': _generate_improvement_suggestions(order_items, user_features),
            'health_score': _calculate_health_score(order_items, user_features)
        }
        
        return jsonify({
            'success': True,
            'user_id': user_id,
            'analysis': analysis,
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"Error in analyze_food_order: {e}")
        return jsonify({
            'error': 'Internal server error',
            'details': str(e)
        }), 500

def _calculate_order_nutrition(order_items):
    """Calculate total nutrition for order"""
    total = {
        'calories': 0,
        'protein': 0,
        'carbs': 0,
        'fat': 0,
        'fiber': 0,
        'sugar': 0,
        'sodium': 0
    }
    
    for item in order_items:
        nutrition = item.get('nutrition', {})
        quantity = item.get('quantity', 1)
        
        for nutrient in total.keys():
            total[nutrient] += nutrition.get(nutrient, 0) * quantity
    
    return total

def _generate_health_warnings(order_items, user_features):
    """Generate health warnings based on user profile"""
    warnings = []
    
    nutrition_total = _calculate_order_nutrition(order_items)
    
    # High calorie warning
    if nutrition_total['calories'] > 800:
        warnings.append({
            'type': 'high_calories',
            'severity': 'medium',
            'message': f"High calorie meal ({nutrition_total['calories']:.0f} cal)",
            'suggestion': 'Consider sharing or having smaller portions'
        })
    
    # High sodium warning for hypertension
    if user_features.get('has_hypertension', 0) and nutrition_total['sodium'] > 1500:
        warnings.append({
            'type': 'high_sodium_hypertension',
            'severity': 'high',
            'message': f"High sodium content ({nutrition_total['sodium']:.0f}mg) may affect blood pressure",
            'suggestion': 'Choose low-sodium alternatives and drink plenty of water'
        })
    
    # High sugar warning for diabetes
    if user_features.get('has_diabetes', 0) and nutrition_total['sugar'] > 25:
        warnings.append({
            'type': 'high_sugar_diabetes',
            'severity': 'high',
            'message': f"High sugar content ({nutrition_total['sugar']:.0f}g) may affect blood glucose",
            'suggestion': 'Monitor blood sugar levels and consider sugar-free options'
        })
    
    return warnings

def _generate_improvement_suggestions(order_items, user_features):
    """Generate suggestions to improve order healthiness"""
    suggestions = []
    
    nutrition_total = _calculate_order_nutrition(order_items)
    
    # Low protein suggestion
    if nutrition_total['protein'] < 20 and user_features.get('activity_level', 3) >= 4:
        suggestions.append({
            'type': 'increase_protein',
            'message': 'Add protein-rich foods to support your active lifestyle',
            'examples': ['grilled chicken', 'fish', 'beans', 'Greek yogurt']
        })
    
    # Low fiber suggestion
    if nutrition_total['fiber'] < 10:
        suggestions.append({
            'type': 'increase_fiber',
            'message': 'Add more fiber-rich foods for better digestion',
            'examples': ['vegetables', 'fruits', 'whole grains', 'legumes']
        })
    
    # BMI-based suggestions
    if user_features.get('bmi', 22) > 25:
        suggestions.append({
            'type': 'weight_management',
            'message': 'Consider lower-calorie options to support weight management',
            'examples': ['salads', 'grilled items', 'vegetable soups', 'fresh fruits']
        })
    
    return suggestions

def _calculate_health_score(order_items, user_features):
    """Calculate overall health score for the order"""
    score = 70  # Base score
    
    nutrition_total = _calculate_order_nutrition(order_items)
    
    # Calorie evaluation
    if nutrition_total['calories'] < 600:
        score += 10
    elif nutrition_total['calories'] > 1000:
        score -= 15
    
    # Protein evaluation
    if nutrition_total['protein'] > 25:
        score += 10
    elif nutrition_total['protein'] < 10:
        score -= 10
    
    # Fiber evaluation
    if nutrition_total['fiber'] > 10:
        score += 15
    elif nutrition_total['fiber'] < 5:
        score -= 10
    
    # Sodium evaluation
    if nutrition_total['sodium'] < 800:
        score += 10
    elif nutrition_total['sodium'] > 2000:
        score -= 20
    
    # Sugar evaluation
    if nutrition_total['sugar'] < 15:
        score += 5
    elif nutrition_total['sugar'] > 40:
        score -= 15
    
    # User-specific adjustments
    if user_features.get('has_diabetes', 0) and nutrition_total['sugar'] > 20:
        score -= 25
    
    if user_features.get('has_hypertension', 0) and nutrition_total['sodium'] > 1500:
        score -= 20
    
    return max(0, min(100, score))

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5001))
    debug = os.environ.get('DEBUG', 'True').lower() == 'true'
    
    logger.info(f"Starting HealthMonitor ML Service on port {port}")
    app.run(host='0.0.0.0', port=port, debug=debug)
