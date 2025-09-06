import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, roc_auc_score
from typing import Dict, List, Tuple
import joblib
import logging

class HealthRiskPredictor:
    """ML model to predict health risks based on user profile and eating patterns"""
    
    def __init__(self):
        self.diabetes_model = None
        self.hypertension_model = None
        self.obesity_model = None
        self.heart_disease_model = None
        self.scaler = StandardScaler()
        self.feature_names = []
        self.is_trained = False
        self.logger = logging.getLogger(__name__)
    
    def train_models(self, training_data: pd.DataFrame):
        """Train health risk prediction models"""
        self.logger.info("Training health risk prediction models...")
        
        # Prepare features
        feature_columns = [col for col in training_data.columns 
                          if col not in ['diabetes_risk', 'hypertension_risk', 'obesity_risk', 'heart_disease_risk']]
        
        X = training_data[feature_columns]
        self.feature_names = feature_columns
        
        # Scale features
        X_scaled = self.scaler.fit_transform(X)
        
        # Train individual models
        if 'diabetes_risk' in training_data.columns:
            self._train_diabetes_model(X_scaled, training_data['diabetes_risk'])
        
        if 'hypertension_risk' in training_data.columns:
            self._train_hypertension_model(X_scaled, training_data['hypertension_risk'])
        
        if 'obesity_risk' in training_data.columns:
            self._train_obesity_model(X_scaled, training_data['obesity_risk'])
        
        if 'heart_disease_risk' in training_data.columns:
            self._train_heart_disease_model(X_scaled, training_data['heart_disease_risk'])
        
        self.is_trained = True
        self.logger.info("Health risk models trained successfully")
    
    def _train_diabetes_model(self, X: np.ndarray, y: np.ndarray):
        """Train diabetes risk prediction model"""
        self.diabetes_model = GradientBoostingClassifier(
            n_estimators=100,
            max_depth=6,
            learning_rate=0.1,
            random_state=42
        )
        self.diabetes_model.fit(X, y)
    
    def _train_hypertension_model(self, X: np.ndarray, y: np.ndarray):
        """Train hypertension risk prediction model"""
        self.hypertension_model = RandomForestClassifier(
            n_estimators=100,
            max_depth=8,
            random_state=42
        )
        self.hypertension_model.fit(X, y)
    
    def _train_obesity_model(self, X: np.ndarray, y: np.ndarray):
        """Train obesity risk prediction model"""
        self.obesity_model = LogisticRegression(
            random_state=42,
            max_iter=1000
        )
        self.obesity_model.fit(X, y)
    
    def _train_heart_disease_model(self, X: np.ndarray, y: np.ndarray):
        """Train heart disease risk prediction model"""
        self.heart_disease_model = GradientBoostingClassifier(
            n_estimators=150,
            max_depth=6,
            learning_rate=0.05,
            random_state=42
        )
        self.heart_disease_model.fit(X, y)
    
    def predict_health_risks(self, user_features: Dict) -> Dict:
        """Predict health risks for a user"""
        if not self.is_trained:
            return self._get_rule_based_risks(user_features)
        
        try:
            # Prepare features
            feature_vector = self._prepare_feature_vector(user_features)
            feature_vector_scaled = self.scaler.transform([feature_vector])
            
            risks = {}
            
            # Predict diabetes risk
            if self.diabetes_model:
                diabetes_prob = self.diabetes_model.predict_proba(feature_vector_scaled)[0][1]
                risks['diabetes'] = {
                    'risk_level': self._categorize_risk(diabetes_prob),
                    'probability': round(diabetes_prob, 3),
                    'factors': self._get_diabetes_risk_factors(user_features),
                    'recommendations': self._get_diabetes_recommendations(user_features)
                }
            
            # Predict hypertension risk
            if self.hypertension_model:
                hypertension_prob = self.hypertension_model.predict_proba(feature_vector_scaled)[0][1]
                risks['hypertension'] = {
                    'risk_level': self._categorize_risk(hypertension_prob),
                    'probability': round(hypertension_prob, 3),
                    'factors': self._get_hypertension_risk_factors(user_features),
                    'recommendations': self._get_hypertension_recommendations(user_features)
                }
            
            # Predict obesity risk
            if self.obesity_model:
                obesity_prob = self.obesity_model.predict_proba(feature_vector_scaled)[0][1]
                risks['obesity'] = {
                    'risk_level': self._categorize_risk(obesity_prob),
                    'probability': round(obesity_prob, 3),
                    'factors': self._get_obesity_risk_factors(user_features),
                    'recommendations': self._get_obesity_recommendations(user_features)
                }
            
            # Predict heart disease risk
            if self.heart_disease_model:
                heart_prob = self.heart_disease_model.predict_proba(feature_vector_scaled)[0][1]
                risks['heart_disease'] = {
                    'risk_level': self._categorize_risk(heart_prob),
                    'probability': round(heart_prob, 3),
                    'factors': self._get_heart_disease_risk_factors(user_features),
                    'recommendations': self._get_heart_disease_recommendations(user_features)
                }
            
            # Overall risk assessment
            overall_risk = self._calculate_overall_risk(risks)
            
            return {
                'individual_risks': risks,
                'overall_assessment': overall_risk,
                'priority_actions': self._get_priority_actions(risks),
                'model_confidence': 'high' if self.is_trained else 'medium'
            }
            
        except Exception as e:
            self.logger.error(f"Error predicting health risks: {e}")
            return self._get_rule_based_risks(user_features)
    
    def _prepare_feature_vector(self, user_features: Dict) -> np.ndarray:
        """Prepare feature vector for prediction"""
        expected_features = [
            'age', 'gender_male', 'gender_female', 'bmi', 
            'chronic_conditions_count', 'activity_level', 'stress_level',
            'avg_calories_per_order', 'avg_sodium_per_order', 'avg_sugar_per_order'
        ]
        
        vector = []
        for feature in expected_features:
            vector.append(user_features.get(feature, 0))
        
        return np.array(vector)
    
    def _categorize_risk(self, probability: float) -> str:
        """Categorize risk level based on probability"""
        if probability < 0.3:
            return 'low'
        elif probability < 0.6:
            return 'medium'
        elif probability < 0.8:
            return 'high'
        else:
            return 'very_high'
    
    def _get_diabetes_risk_factors(self, user_features: Dict) -> List[str]:
        """Get diabetes risk factors for user"""
        factors = []
        
        if user_features.get('bmi', 22) > 25:
            factors.append('BMI above normal range')
        
        if user_features.get('age', 30) > 45:
            factors.append('Age over 45')
        
        if user_features.get('activity_level', 3) < 3:
            factors.append('Low physical activity')
        
        if user_features.get('avg_sugar_per_order', 0) > 30:
            factors.append('High sugar consumption pattern')
        
        return factors
    
    def _get_diabetes_recommendations(self, user_features: Dict) -> List[str]:
        """Get diabetes prevention recommendations"""
        recommendations = []
        
        if user_features.get('bmi', 22) > 25:
            recommendations.append('Maintain healthy weight through portion control')
        
        if user_features.get('activity_level', 3) < 3:
            recommendations.append('Increase physical activity to at least 150 min/week')
        
        recommendations.append('Choose whole grains over refined carbohydrates')
        recommendations.append('Limit sugary drinks and processed foods')
        
        return recommendations
    
    def _get_hypertension_risk_factors(self, user_features: Dict) -> List[str]:
        """Get hypertension risk factors"""
        factors = []
        
        if user_features.get('avg_sodium_per_order', 0) > 1500:
            factors.append('High sodium intake from food orders')
        
        if user_features.get('stress_level', 5) > 7:
            factors.append('High stress levels')
        
        if user_features.get('bmi', 22) > 25:
            factors.append('Overweight/obesity')
        
        return factors
    
    def _get_hypertension_recommendations(self, user_features: Dict) -> List[str]:
        """Get hypertension prevention recommendations"""
        recommendations = [
            'Reduce sodium intake to less than 2300mg daily',
            'Increase potassium-rich foods (fruits, vegetables)',
            'Maintain regular exercise routine',
            'Practice stress management techniques'
        ]
        
        return recommendations
    
    def _get_obesity_risk_factors(self, user_features: Dict) -> List[str]:
        """Get obesity risk factors"""
        factors = []
        
        if user_features.get('avg_calories_per_order', 600) > 800:
            factors.append('High calorie consumption per meal')
        
        if user_features.get('activity_level', 3) < 3:
            factors.append('Sedentary lifestyle')
        
        if user_features.get('orders_per_week', 0) > 5:
            factors.append('Frequent food ordering')
        
        return factors
    
    def _get_obesity_recommendations(self, user_features: Dict) -> List[str]:
        """Get obesity prevention recommendations"""
        return [
            'Control portion sizes and calorie intake',
            'Increase daily physical activity',
            'Choose nutrient-dense, lower-calorie foods',
            'Cook more meals at home'
        ]
    
    def _get_heart_disease_risk_factors(self, user_features: Dict) -> List[str]:
        """Get heart disease risk factors"""
        factors = []
        
        if user_features.get('age', 30) > 50:
            factors.append('Age over 50')
        
        if user_features.get('avg_sodium_per_order', 0) > 1500:
            factors.append('High sodium consumption')
        
        if user_features.get('activity_level', 3) < 3:
            factors.append('Insufficient physical activity')
        
        return factors
    
    def _get_heart_disease_recommendations(self, user_features: Dict) -> List[str]:
        """Get heart disease prevention recommendations"""
        return [
            'Follow heart-healthy diet (Mediterranean style)',
            'Limit saturated fats and trans fats',
            'Increase omega-3 fatty acids',
            'Maintain regular cardiovascular exercise'
        ]
    
    def _calculate_overall_risk(self, risks: Dict) -> Dict:
        """Calculate overall health risk assessment"""
        risk_scores = []
        high_risk_conditions = []
        
        for condition, risk_data in risks.items():
            prob = risk_data.get('probability', 0)
            risk_scores.append(prob)
            
            if risk_data.get('risk_level') in ['high', 'very_high']:
                high_risk_conditions.append(condition)
        
        avg_risk = np.mean(risk_scores) if risk_scores else 0
        
        return {
            'overall_risk_score': round(avg_risk, 3),
            'risk_category': self._categorize_risk(avg_risk),
            'high_risk_conditions': high_risk_conditions,
            'health_status': 'needs_attention' if high_risk_conditions else 'good'
        }
    
    def _get_priority_actions(self, risks: Dict) -> List[str]:
        """Get priority actions based on risk assessment"""
        actions = []
        
        for condition, risk_data in risks.items():
            if risk_data.get('risk_level') in ['high', 'very_high']:
                actions.extend(risk_data.get('recommendations', [])[:2])  # Top 2 recommendations
        
        # Remove duplicates and return top 5
        unique_actions = list(dict.fromkeys(actions))
        return unique_actions[:5]
    
    def _get_rule_based_risks(self, user_features: Dict) -> Dict:
        """Fallback rule-based risk assessment"""
        risks = {}
        
        # Simple rule-based diabetes risk
        diabetes_risk = 0.2
        if user_features.get('bmi', 22) > 25:
            diabetes_risk += 0.2
        if user_features.get('age', 30) > 45:
            diabetes_risk += 0.3
        
        risks['diabetes'] = {
            'risk_level': self._categorize_risk(diabetes_risk),
            'probability': round(diabetes_risk, 3),
            'factors': self._get_diabetes_risk_factors(user_features),
            'recommendations': self._get_diabetes_recommendations(user_features)
        }
        
        return {
            'individual_risks': risks,
            'overall_assessment': {
                'overall_risk_score': diabetes_risk,
                'risk_category': self._categorize_risk(diabetes_risk),
                'high_risk_conditions': [],
                'health_status': 'assessment_limited'
            },
            'priority_actions': ['Maintain healthy diet', 'Exercise regularly'],
            'model_confidence': 'basic_rules'
        }
