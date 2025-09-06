import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from typing import Dict, List, Tuple, Optional

class HealthFeatureEngineer:
    """Extract features from user health profile and order history for ML models"""
    
    def __init__(self):
        self.categorical_encoders = {}
        self.numerical_scalers = {}
    
    def extract_user_features(self, health_profile: Dict) -> Dict:
        """Extract features from user health profile"""
        features = {}
        
        # Basic demographic features
        features['age'] = health_profile.get('basicInfo', {}).get('age', 30)
        features['gender_male'] = 1 if health_profile.get('basicInfo', {}).get('gender') == 'male' else 0
        features['gender_female'] = 1 if health_profile.get('basicInfo', {}).get('gender') == 'female' else 0
        
        # BMI calculation
        height_cm = health_profile.get('basicInfo', {}).get('height', {}).get('value', 170)
        weight_kg = health_profile.get('basicInfo', {}).get('weight', {}).get('value', 70)
        features['bmi'] = weight_kg / ((height_cm / 100) ** 2) if height_cm > 0 else 22
        features['bmi_category_underweight'] = 1 if features['bmi'] < 18.5 else 0
        features['bmi_category_normal'] = 1 if 18.5 <= features['bmi'] < 25 else 0
        features['bmi_category_overweight'] = 1 if 25 <= features['bmi'] < 30 else 0
        features['bmi_category_obese'] = 1 if features['bmi'] >= 30 else 0
        
        # Medical history features
        medical_history = health_profile.get('medicalHistory', {})
        features['chronic_conditions_count'] = len(medical_history.get('chronicConditions', []))
        features['allergies_count'] = len(medical_history.get('allergies', []))
        features['medications_count'] = len(medical_history.get('medications', []))
        
        # Risk flags
        features['has_diabetes'] = self._has_condition(medical_history, 'diabetes')
        features['has_hypertension'] = self._has_condition(medical_history, ['hypertension', 'blood pressure'])
        features['has_heart_disease'] = self._has_condition(medical_history, ['heart', 'cardiac'])
        
        # Dietary preferences
        dietary_info = health_profile.get('dietaryInfo', {})
        diet_type = dietary_info.get('dietType', 'omnivore')
        features['diet_vegetarian'] = 1 if diet_type in ['vegetarian', 'vegan'] else 0
        features['diet_keto'] = 1 if diet_type == 'keto' else 0
        features['diet_paleo'] = 1 if diet_type == 'paleo' else 0
        
        # Lifestyle features
        lifestyle = health_profile.get('lifestyle', {})
        features['activity_level'] = self._encode_activity_level(lifestyle.get('activityLevel', 'moderately-active'))
        features['sleep_hours'] = lifestyle.get('sleepHours', 7)
        features['stress_level'] = lifestyle.get('stressLevel', 5)
        features['exercise_frequency'] = self._encode_exercise_frequency(lifestyle.get('exerciseFrequency', '3-4-times-week'))
        
        return features
    
    def extract_order_features(self, orders: List[Dict], days: int = 30) -> Dict:
        """Extract features from user's food order history"""
        if not orders:
            return self._get_default_order_features()
        
        # Filter recent orders
        cutoff_date = datetime.now() - timedelta(days=days)
        recent_orders = [
            order for order in orders 
            if datetime.fromisoformat(order.get('orderInfo', {}).get('orderDate', '').replace('Z', '+00:00')) > cutoff_date
        ]
        
        if not recent_orders:
            return self._get_default_order_features()
        
        features = {}
        
        # Order frequency features
        features['orders_per_week'] = len(recent_orders) * 7 / days
        features['total_orders'] = len(recent_orders)
        
        # Nutritional aggregates
        total_calories = sum(order.get('analysis', {}).get('totalCalories', 0) for order in recent_orders)
        total_protein = sum(order.get('analysis', {}).get('totalProtein', 0) for order in recent_orders)
        total_carbs = sum(order.get('analysis', {}).get('totalCarbs', 0) for order in recent_orders)
        total_fat = sum(order.get('analysis', {}).get('totalFat', 0) for order in recent_orders)
        total_sodium = sum(order.get('analysis', {}).get('totalSodium', 0) for order in recent_orders)
        
        features['avg_calories_per_order'] = total_calories / len(recent_orders)
        features['avg_protein_per_order'] = total_protein / len(recent_orders)
        features['avg_carbs_per_order'] = total_carbs / len(recent_orders)
        features['avg_fat_per_order'] = total_fat / len(recent_orders)
        features['avg_sodium_per_order'] = total_sodium / len(recent_orders)
        
        # Health score features
        health_scores = [order.get('analysis', {}).get('healthScore', 70) for order in recent_orders]
        features['avg_health_score'] = np.mean(health_scores)
        features['health_score_trend'] = self._calculate_trend(health_scores)
        
        # Warning patterns
        warning_counts = [len(order.get('analysis', {}).get('warnings', [])) for order in recent_orders]
        features['avg_warnings_per_order'] = np.mean(warning_counts)
        features['total_warnings'] = sum(warning_counts)
        
        # Cuisine diversity
        cuisines = [order.get('orderInfo', {}).get('restaurant', {}).get('cuisine', 'other') for order in recent_orders]
        unique_cuisines = len(set(cuisines))
        features['cuisine_diversity'] = unique_cuisines / len(recent_orders)
        
        # Popular cuisines (top 3)
        cuisine_counts = pd.Series(cuisines).value_counts()
        for i, (cuisine, count) in enumerate(cuisine_counts.head(3).items()):
            features[f'prefers_{cuisine}'] = count / len(recent_orders)
        
        return features
    
    def _has_condition(self, medical_history: Dict, condition_keywords: List[str]) -> int:
        """Check if user has specific medical condition"""
        if isinstance(condition_keywords, str):
            condition_keywords = [condition_keywords]
        
        conditions = medical_history.get('chronicConditions', [])
        for condition_obj in conditions:
            condition_name = condition_obj.get('condition', '').lower()
            for keyword in condition_keywords:
                if keyword.lower() in condition_name:
                    return 1
        return 0
    
    def _encode_activity_level(self, activity_level: str) -> int:
        """Encode activity level to numerical value"""
        mapping = {
            'sedentary': 1,
            'lightly-active': 2,
            'moderately-active': 3,
            'very-active': 4,
            'extremely-active': 5
        }
        return mapping.get(activity_level, 3)
    
    def _encode_exercise_frequency(self, exercise_frequency: str) -> int:
        """Encode exercise frequency to numerical value"""
        mapping = {
            'never': 0,
            'rarely': 1,
            '1-2-times-week': 2,
            '3-4-times-week': 4,
            '5-6-times-week': 6,
            'daily': 7
        }
        return mapping.get(exercise_frequency, 4)
    
    def _calculate_trend(self, values: List[float]) -> float:
        """Calculate trend in values (positive = improving, negative = declining)"""
        if len(values) < 2:
            return 0
        
        x = np.arange(len(values))
        z = np.polyfit(x, values, 1)
        return z[0]  # slope
    
    def _get_default_order_features(self) -> Dict:
        """Return default features when no order history available"""
        return {
            'orders_per_week': 0,
            'total_orders': 0,
            'avg_calories_per_order': 600,
            'avg_protein_per_order': 25,
            'avg_carbs_per_order': 75,
            'avg_fat_per_order': 20,
            'avg_sodium_per_order': 1000,
            'avg_health_score': 70,
            'health_score_trend': 0,
            'avg_warnings_per_order': 0,
            'total_warnings': 0,
            'cuisine_diversity': 0,
        }
    
    def combine_features(self, user_features: Dict, order_features: Dict) -> Dict:
        """Combine all features into single feature vector"""
        combined = {**user_features, **order_features}
        
        # Add interaction features
        combined['bmi_x_activity'] = combined['bmi'] * combined['activity_level']
        combined['age_x_health_score'] = combined['age'] * combined['avg_health_score']
        combined['stress_x_warnings'] = combined['stress_level'] * combined['avg_warnings_per_order']
        
        return combined
