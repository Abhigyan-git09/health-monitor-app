import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.preprocessing import StandardScaler
from typing import Dict, List, Tuple, Optional
import joblib
import logging

class FoodRecommendationEngine:
    """ML-powered food recommendation system"""
    
    def __init__(self):
        self.collaborative_model = None
        self.content_model = None
        self.scaler = StandardScaler()
        self.is_trained = False
        self.logger = logging.getLogger(__name__)
    
    def train_models(self, user_features_df: pd.DataFrame, food_features_df: pd.DataFrame, 
                    interactions_df: pd.DataFrame):
        """Train recommendation models"""
        self.logger.info("Training food recommendation models...")
        
        # Train content-based model
        self._train_content_based_model(user_features_df, food_features_df, interactions_df)
        
        # Train collaborative filtering model
        self._train_collaborative_model(interactions_df)
        
        self.is_trained = True
        self.logger.info("Models trained successfully")
    
    def _train_content_based_model(self, user_features_df: pd.DataFrame, 
                                 food_features_df: pd.DataFrame, interactions_df: pd.DataFrame):
        """Train content-based recommendation model"""
        # Prepare training data
        training_data = []
        
        for _, interaction in interactions_df.iterrows():
            user_id = interaction['user_id']
            food_id = interaction['food_id']
            rating = interaction['health_score']  # Use health score as rating
            
            if user_id in user_features_df.index and food_id in food_features_df.index:
                user_features = user_features_df.loc[user_id].values
                food_features = food_features_df.loc[food_id].values
                combined_features = np.concatenate([user_features, food_features])
                training_data.append(np.concatenate([combined_features, [rating]]))
        
        if not training_data:
            self.logger.warning("No training data available for content-based model")
            return
        
        training_array = np.array(training_data)
        X = training_array[:, :-1]
        y = training_array[:, -1]
        
        # Scale features
        X_scaled = self.scaler.fit_transform(X)
        
        # Train Random Forest model
        self.content_model = RandomForestRegressor(
            n_estimators=100,
            max_depth=10,
            random_state=42,
            n_jobs=-1
        )
        self.content_model.fit(X_scaled, y)
    
    def _train_collaborative_model(self, interactions_df: pd.DataFrame):
        """Train collaborative filtering model using user-item matrix"""
        # Create user-item matrix
        self.user_item_matrix = interactions_df.pivot_table(
            index='user_id', 
            columns='food_id', 
            values='health_score',
            fill_value=0
        )
        
        # Calculate user similarity matrix
        self.user_similarity = cosine_similarity(self.user_item_matrix)
        self.user_similarity_df = pd.DataFrame(
            self.user_similarity,
            index=self.user_item_matrix.index,
            columns=self.user_item_matrix.index
        )
    
    def get_recommendations(self, user_id: str, user_features: Dict, 
                          available_foods: List[Dict], n_recommendations: int = 10) -> List[Dict]:
        """Get personalized food recommendations for user"""
        if not self.is_trained:
            return self._get_fallback_recommendations(available_foods, user_features, n_recommendations)
        
        try:
            # Get content-based recommendations
            content_scores = self._get_content_based_scores(user_features, available_foods)
            
            # Get collaborative filtering recommendations
            collaborative_scores = self._get_collaborative_scores(user_id, available_foods)
            
            # Combine scores (weighted ensemble)
            final_scores = []
            for i, food in enumerate(available_foods):
                content_score = content_scores[i] if i < len(content_scores) else 0.5
                collab_score = collaborative_scores.get(food.get('fdcId'), 0.5)
                
                # Weighted combination (70% content, 30% collaborative)
                final_score = 0.7 * content_score + 0.3 * collab_score
                
                # Add health preference boost
                health_boost = self._calculate_health_boost(food, user_features)
                final_score += health_boost
                
                final_scores.append({
                    'food': food,
                    'score': final_score,
                    'content_score': content_score,
                    'collaborative_score': collab_score,
                    'health_boost': health_boost,
                    'reasoning': self._generate_reasoning(food, user_features, final_score)
                })
            
            # Sort by score and return top N
            final_scores.sort(key=lambda x: x['score'], reverse=True)
            return final_scores[:n_recommendations]
            
        except Exception as e:
            self.logger.error(f"Error generating recommendations: {e}")
            return self._get_fallback_recommendations(available_foods, user_features, n_recommendations)
    
    def _get_content_based_scores(self, user_features: Dict, available_foods: List[Dict]) -> List[float]:
        """Get content-based recommendation scores"""
        if not self.content_model:
            return [0.5] * len(available_foods)
        
        scores = []
        user_feature_vector = self._dict_to_vector(user_features)
        
        for food in available_foods:
            food_features = self._extract_food_features(food)
            food_feature_vector = self._dict_to_vector(food_features)
            
            # Combine user and food features
            combined_features = np.concatenate([user_feature_vector, food_feature_vector])
            combined_features_scaled = self.scaler.transform([combined_features])
            
            # Predict score
            predicted_score = self.content_model.predict(combined_features_scaled)[0]
            normalized_score = max(0, min(1, predicted_score / 100))  # Normalize to 0-1
            scores.append(normalized_score)
        
        return scores
    
    def _get_collaborative_scores(self, user_id: str, available_foods: List[Dict]) -> Dict[str, float]:
        """Get collaborative filtering recommendation scores"""
        if not hasattr(self, 'user_similarity_df') or user_id not in self.user_similarity_df.index:
            return {}
        
        # Find similar users
        user_similarities = self.user_similarity_df.loc[user_id].sort_values(ascending=False)
        similar_users = user_similarities.head(10).index.tolist()
        
        # Calculate recommendations based on similar users' preferences
        scores = {}
        for food in available_foods:
            food_id = food.get('fdcId')
            if not food_id:
                continue
            
            weighted_rating = 0
            similarity_sum = 0
            
            for similar_user in similar_users:
                if similar_user == user_id:
                    continue
                
                if food_id in self.user_item_matrix.columns:
                    rating = self.user_item_matrix.loc[similar_user, food_id]
                    similarity = user_similarities[similar_user]
                    
                    if rating > 0:  # User has rated this food
                        weighted_rating += similarity * rating
                        similarity_sum += similarity
            
            if similarity_sum > 0:
                predicted_rating = weighted_rating / similarity_sum
                scores[food_id] = max(0, min(1, predicted_rating / 100))
            
        return scores
    
    def _calculate_health_boost(self, food: Dict, user_features: Dict) -> float:
        """Calculate health-based boost for food recommendation"""
        boost = 0
        nutrition = food.get('nutrition', {})
        
        # BMI-based recommendations
        bmi = user_features.get('bmi', 22)
        if bmi > 25:  # Overweight/obese
            if nutrition.get('calories', 0) < 400:  # Low calorie
                boost += 0.1
            if nutrition.get('fiber', 0) > 5:  # High fiber
                boost += 0.1
        
        # Diabetes-friendly boost
        if user_features.get('has_diabetes', 0):
            if nutrition.get('sugar', 0) < 10:  # Low sugar
                boost += 0.15
            if nutrition.get('fiber', 0) > 3:  # Good fiber
                boost += 0.1
        
        # Hypertension-friendly boost
        if user_features.get('has_hypertension', 0):
            if nutrition.get('sodium', 0) < 600:  # Low sodium
                boost += 0.15
        
        # High protein for active users
        if user_features.get('activity_level', 3) >= 4:
            if nutrition.get('protein', 0) > 20:  # High protein
                boost += 0.1
        
        # Vegetarian alignment
        if user_features.get('diet_vegetarian', 0):
            if food.get('healthFlags', {}).get('isVegetarian', False):
                boost += 0.2
        
        return min(boost, 0.5)  # Cap boost at 0.5
    
    def _generate_reasoning(self, food: Dict, user_features: Dict, score: float) -> str:
        """Generate explanation for why food was recommended"""
        reasons = []
        
        if score > 0.8:
            reasons.append("Excellent match for your health profile")
        elif score > 0.6:
            reasons.append("Good match for your dietary preferences")
        else:
            reasons.append("Moderate match based on your history")
        
        # Health-specific reasons
        if user_features.get('has_diabetes', 0) and food.get('nutrition', {}).get('sugar', 0) < 10:
            reasons.append("Low sugar content suitable for diabetes management")
        
        if user_features.get('has_hypertension', 0) and food.get('nutrition', {}).get('sodium', 0) < 600:
            reasons.append("Low sodium content good for blood pressure")
        
        if user_features.get('bmi', 22) > 25 and food.get('nutrition', {}).get('calories', 0) < 400:
            reasons.append("Lower calorie option to support weight management")
        
        if user_features.get('activity_level', 3) >= 4 and food.get('nutrition', {}).get('protein', 0) > 20:
            reasons.append("High protein content ideal for your active lifestyle")
        
        return "; ".join(reasons[:3])  # Limit to top 3 reasons
    
    def _extract_food_features(self, food: Dict) -> Dict:
        """Extract numerical features from food data"""
        nutrition = food.get('nutrition', {})
        health_flags = food.get('healthFlags', {})
        
        return {
            'calories': nutrition.get('calories', 0),
            'protein': nutrition.get('protein', 0),
            'carbs': nutrition.get('carbs', 0),
            'fat': nutrition.get('fat', 0),
            'fiber': nutrition.get('fiber', 0),
            'sugar': nutrition.get('sugar', 0),
            'sodium': nutrition.get('sodium', 0),
            'is_vegetarian': 1 if health_flags.get('isVegetarian', False) else 0,
            'is_vegan': 1 if health_flags.get('isVegan', False) else 0,
            'is_gluten_free': 1 if health_flags.get('isGlutenFree', False) else 0,
            'is_low_sodium': 1 if health_flags.get('isLowSodium', False) else 0,
            'is_high_protein': 1 if health_flags.get('isHighProtein', False) else 0,
        }
    
    def _dict_to_vector(self, feature_dict: Dict) -> np.ndarray:
        """Convert feature dictionary to numpy vector"""
        # Define expected feature order
        expected_features = [
            'age', 'gender_male', 'gender_female', 'bmi', 'bmi_category_underweight',
            'bmi_category_normal', 'bmi_category_overweight', 'bmi_category_obese',
            'chronic_conditions_count', 'allergies_count', 'medications_count',
            'has_diabetes', 'has_hypertension', 'has_heart_disease',
            'diet_vegetarian', 'diet_keto', 'diet_paleo', 'activity_level',
            'sleep_hours', 'stress_level', 'exercise_frequency'
        ]
        
        vector = []
        for feature in expected_features:
            vector.append(feature_dict.get(feature, 0))
        
        return np.array(vector)
    
    def _get_fallback_recommendations(self, available_foods: List[Dict], 
                                   user_features: Dict, n_recommendations: int) -> List[Dict]:
        """Fallback recommendations when ML models aren't available"""
        recommendations = []
        
        for food in available_foods:
            score = 0.5  # Base score
            
            # Simple rule-based scoring
            nutrition = food.get('nutrition', {})
            
            # Prefer healthier options
            if nutrition.get('calories', 0) < 500:
                score += 0.1
            if nutrition.get('protein', 0) > 15:
                score += 0.1
            if nutrition.get('fiber', 0) > 3:
                score += 0.1
            if nutrition.get('sodium', 0) < 800:
                score += 0.1
            
            # User-specific preferences
            if user_features.get('diet_vegetarian', 0) and food.get('healthFlags', {}).get('isVegetarian', False):
                score += 0.2
            
            recommendations.append({
                'food': food,
                'score': min(score, 1.0),
                'content_score': score,
                'collaborative_score': 0,
                'health_boost': 0,
                'reasoning': 'Basic health-focused recommendation'
            })
        
        recommendations.sort(key=lambda x: x['score'], reverse=True)
        return recommendations[:n_recommendations]
    
    def save_models(self, filepath: str):
        """Save trained models to disk"""
        model_data = {
            'content_model': self.content_model,
            'scaler': self.scaler,
            'user_item_matrix': getattr(self, 'user_item_matrix', None),
            'user_similarity_df': getattr(self, 'user_similarity_df', None),
            'is_trained': self.is_trained
        }
        joblib.dump(model_data, filepath)
        self.logger.info(f"Models saved to {filepath}")
    
    def load_models(self, filepath: str):
        """Load trained models from disk"""
        try:
            model_data = joblib.load(filepath)
            self.content_model = model_data['content_model']
            self.scaler = model_data['scaler']
            self.user_item_matrix = model_data.get('user_item_matrix')
            self.user_similarity_df = model_data.get('user_similarity_df')
            self.is_trained = model_data.get('is_trained', False)
            self.logger.info(f"Models loaded from {filepath}")
        except Exception as e:
            self.logger.error(f"Error loading models: {e}")
            self.is_trained = False
