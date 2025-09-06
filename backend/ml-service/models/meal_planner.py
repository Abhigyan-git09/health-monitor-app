import numpy as np
import pandas as pd
from typing import Dict, List, Tuple, Optional
from datetime import datetime, timedelta
import random
import logging

class SmartMealPlanner:
    """AI-powered meal planning system based on user health profile and goals"""
    
    def __init__(self):
        self.logger = logging.getLogger(__name__)
        self.meal_templates = self._initialize_meal_templates()
        self.dietary_constraints = {}
        
    def _initialize_meal_templates(self) -> Dict:
        """Initialize meal templates for different dietary preferences"""
        return {
            'breakfast': {
                'high_protein': [
                    {'name': 'Greek Yogurt with Berries', 'calories': 200, 'protein': 20, 'carbs': 25, 'fat': 5},
                    {'name': 'Scrambled Eggs with Spinach', 'calories': 250, 'protein': 18, 'carbs': 5, 'fat': 18},
                    {'name': 'Protein Smoothie', 'calories': 280, 'protein': 25, 'carbs': 30, 'fat': 8},
                ],
                'low_carb': [
                    {'name': 'Avocado and Eggs', 'calories': 320, 'protein': 15, 'carbs': 8, 'fat': 28},
                    {'name': 'Cheese Omelet', 'calories': 300, 'protein': 22, 'carbs': 3, 'fat': 24},
                ],
                'vegetarian': [
                    {'name': 'Oatmeal with Nuts', 'calories': 350, 'protein': 12, 'carbs': 45, 'fat': 15},
                    {'name': 'Smoothie Bowl', 'calories': 320, 'protein': 10, 'carbs': 50, 'fat': 12},
                ],
                'heart_healthy': [
                    {'name': 'Oatmeal with Berries', 'calories': 280, 'protein': 8, 'carbs': 45, 'fat': 6},
                    {'name': 'Whole Grain Toast with Avocado', 'calories': 260, 'protein': 8, 'carbs': 30, 'fat': 12},
                ]
            },
            'lunch': {
                'high_protein': [
                    {'name': 'Grilled Chicken Salad', 'calories': 400, 'protein': 35, 'carbs': 15, 'fat': 22},
                    {'name': 'Tuna and Quinoa Bowl', 'calories': 450, 'protein': 30, 'carbs': 40, 'fat': 18},
                    {'name': 'Turkey and Hummus Wrap', 'calories': 380, 'protein': 28, 'carbs': 35, 'fat': 16},
                ],
                'low_carb': [
                    {'name': 'Zucchini Noodles with Chicken', 'calories': 350, 'protein': 30, 'carbs': 12, 'fat': 20},
                    {'name': 'Cauliflower Rice Bowl', 'calories': 320, 'protein': 25, 'carbs': 15, 'fat': 18},
                ],
                'vegetarian': [
                    {'name': 'Quinoa Buddha Bowl', 'calories': 420, 'protein': 15, 'carbs': 55, 'fat': 16},
                    {'name': 'Lentil Soup with Bread', 'calories': 380, 'protein': 18, 'carbs': 50, 'fat': 12},
                ],
                'heart_healthy': [
                    {'name': 'Salmon with Vegetables', 'calories': 400, 'protein': 30, 'carbs': 20, 'fat': 22},
                    {'name': 'Mediterranean Bowl', 'calories': 380, 'protein': 12, 'carbs': 45, 'fat': 18},
                ]
            },
            'dinner': {
                'high_protein': [
                    {'name': 'Grilled Fish with Quinoa', 'calories': 450, 'protein': 35, 'carbs': 30, 'fat': 20},
                    {'name': 'Chicken Stir-fry', 'calories': 420, 'protein': 32, 'carbs': 25, 'fat': 22},
                    {'name': 'Lean Beef with Sweet Potato', 'calories': 480, 'protein': 30, 'carbs': 35, 'fat': 24},
                ],
                'low_carb': [
                    {'name': 'Baked Salmon with Broccoli', 'calories': 380, 'protein': 30, 'carbs': 10, 'fat': 25},
                    {'name': 'Chicken with Roasted Vegetables', 'calories': 350, 'protein': 28, 'carbs': 15, 'fat': 20},
                ],
                'vegetarian': [
                    {'name': 'Chickpea Curry with Rice', 'calories': 450, 'protein': 16, 'carbs': 65, 'fat': 14},
                    {'name': 'Vegetable Stir-fry with Tofu', 'calories': 380, 'protein': 20, 'carbs': 35, 'fat': 18},
                ],
                'heart_healthy': [
                    {'name': 'Baked Cod with Quinoa', 'calories': 380, 'protein': 28, 'carbs': 35, 'fat': 12},
                    {'name': 'Vegetable Soup with Whole Grain Roll', 'calories': 320, 'protein': 12, 'carbs': 50, 'fat': 8},
                ]
            },
            'snacks': [
                {'name': 'Apple with Almond Butter', 'calories': 180, 'protein': 6, 'carbs': 20, 'fat': 10},
                {'name': 'Greek Yogurt', 'calories': 100, 'protein': 15, 'carbs': 8, 'fat': 2},
                {'name': 'Mixed Nuts', 'calories': 160, 'protein': 5, 'carbs': 6, 'fat': 14},
                {'name': 'Vegetable Sticks with Hummus', 'calories': 120, 'protein': 4, 'carbs': 12, 'fat': 6},
                {'name': 'Protein Bar', 'calories': 200, 'protein': 20, 'carbs': 15, 'fat': 8},
            ]
        }
    
    def generate_meal_plan(self, user_features: Dict, preferences: Dict, days: int = 7) -> Dict:
        """Generate personalized meal plan"""
        try:
            # Calculate daily nutrition targets
            targets = self._calculate_nutrition_targets(user_features, preferences)
            
            # Determine meal planning strategy
            strategy = self._determine_strategy(user_features, preferences)
            
            # Generate daily meal plans
            weekly_plan = {}
            for day in range(days):
                day_name = self._get_day_name(day)
                daily_plan = self._generate_daily_plan(targets, strategy)
                weekly_plan[day_name] = daily_plan
            
            # Calculate plan summary
            plan_summary = self._calculate_plan_summary(weekly_plan)
            
            return {
                'meal_plan': weekly_plan,
                'nutrition_targets': targets,
                'plan_summary': plan_summary,
                'strategy_used': strategy,
                'adherence_tips': self._get_adherence_tips(user_features)
            }
            
        except Exception as e:
            self.logger.error(f"Error generating meal plan: {e}")
            return self._get_basic_meal_plan(days)
    
    def _calculate_nutrition_targets(self, user_features: Dict, preferences: Dict) -> Dict:
        """Calculate daily nutrition targets based on user profile"""
        # Basic metabolic rate calculation (Mifflin-St Jeor Equation)
        age = user_features.get('age', 30)
        weight_kg = user_features.get('weight', 70)  # Assuming weight is stored in features
        height_cm = user_features.get('height', 170)
        gender = 'male' if user_features.get('gender_male', 0) else 'female'
        
        if gender == 'male':
            bmr = 10 * weight_kg + 6.25 * height_cm - 5 * age + 5
        else:
            bmr = 10 * weight_kg + 6.25 * height_cm - 5 * age - 161
        
        # Activity factor
        activity_level = user_features.get('activity_level', 3)
        activity_factors = {1: 1.2, 2: 1.375, 3: 1.55, 4: 1.725, 5: 1.9}
        activity_factor = activity_factors.get(activity_level, 1.55)
        
        # Daily calorie needs
        daily_calories = bmr * activity_factor
        
        # Adjust for goals
        goal = preferences.get('goal', 'maintain')
        if goal == 'lose_weight':
            daily_calories *= 0.85  # 15% deficit
        elif goal == 'gain_weight':
            daily_calories *= 1.15  # 15% surplus
        
        # Macronutrient distribution
        diet_type = user_features.get('diet_type', 'balanced')
        
        if diet_type == 'high_protein' or user_features.get('activity_level', 3) >= 4:
            protein_ratio = 0.3
            carb_ratio = 0.4
            fat_ratio = 0.3
        elif diet_type == 'low_carb':
            protein_ratio = 0.3
            carb_ratio = 0.2
            fat_ratio = 0.5
        else:  # balanced
            protein_ratio = 0.2
            carb_ratio = 0.5
            fat_ratio = 0.3
        
        return {
            'calories': int(daily_calories),
            'protein': int((daily_calories * protein_ratio) / 4),  # 4 cal/g
            'carbs': int((daily_calories * carb_ratio) / 4),      # 4 cal/g
            'fat': int((daily_calories * fat_ratio) / 9),         # 9 cal/g
            'fiber': max(25, int(daily_calories / 100)),          # Fiber target
            'sodium': min(2300, int(daily_calories))              # Sodium limit
        }
    
    def _determine_strategy(self, user_features: Dict, preferences: Dict) -> str:
        """Determine meal planning strategy based on user profile"""
        # Health condition priorities
        if user_features.get('has_diabetes', 0):
            return 'diabetic_friendly'
        elif user_features.get('has_hypertension', 0):
            return 'heart_healthy'
        elif user_features.get('bmi', 22) > 25:
            return 'weight_management'
        elif user_features.get('activity_level', 3) >= 4:
            return 'high_protein'
        elif user_features.get('diet_vegetarian', 0):
            return 'vegetarian'
        else:
            return 'balanced'
    
    def _generate_daily_plan(self, targets: Dict, strategy: str) -> Dict:
        """Generate meal plan for one day"""
        daily_plan = {
            'breakfast': {},
            'lunch': {},
            'dinner': {},
            'snacks': [],
            'total_nutrition': {'calories': 0, 'protein': 0, 'carbs': 0, 'fat': 0}
        }
        
        # Select meals based on strategy
        meal_categories = self._get_meal_categories_for_strategy(strategy)
        
        # Breakfast (25% of calories)
        breakfast_target = targets['calories'] * 0.25
        daily_plan['breakfast'] = self._select_meal('breakfast', meal_categories, breakfast_target)
        
        # Lunch (35% of calories) 
        lunch_target = targets['calories'] * 0.35
        daily_plan['lunch'] = self._select_meal('lunch', meal_categories, lunch_target)
        
        # Dinner (30% of calories)
        dinner_target = targets['calories'] * 0.30
        daily_plan['dinner'] = self._select_meal('dinner', meal_categories, dinner_target)
        
        # Snacks (10% of calories)
        snack_target = targets['calories'] * 0.10
        daily_plan['snacks'] = self._select_snacks(snack_target)
        
        # Calculate total nutrition
        for meal_type in ['breakfast', 'lunch', 'dinner']:
            meal = daily_plan[meal_type]
            daily_plan['total_nutrition']['calories'] += meal.get('calories', 0)
            daily_plan['total_nutrition']['protein'] += meal.get('protein', 0)
            daily_plan['total_nutrition']['carbs'] += meal.get('carbs', 0)
            daily_plan['total_nutrition']['fat'] += meal.get('fat', 0)
        
        for snack in daily_plan['snacks']:
            daily_plan['total_nutrition']['calories'] += snack.get('calories', 0)
            daily_plan['total_nutrition']['protein'] += snack.get('protein', 0)
            daily_plan['total_nutrition']['carbs'] += snack.get('carbs', 0)
            daily_plan['total_nutrition']['fat'] += snack.get('fat', 0)
        
        return daily_plan
    
    def _get_meal_categories_for_strategy(self, strategy: str) -> List[str]:
        """Get meal categories based on strategy"""
        strategy_mapping = {
            'diabetic_friendly': ['heart_healthy', 'high_protein'],
            'heart_healthy': ['heart_healthy'],
            'weight_management': ['low_carb', 'high_protein'],
            'high_protein': ['high_protein'],
            'vegetarian': ['vegetarian'],
            'balanced': ['heart_healthy', 'high_protein', 'vegetarian']
        }
        return strategy_mapping.get(strategy, ['heart_healthy'])
    
    def _select_meal(self, meal_type: str, categories: List[str], target_calories: float) -> Dict:
        """Select appropriate meal from templates"""
        available_meals = []
        
        for category in categories:
            if category in self.meal_templates[meal_type]:
                available_meals.extend(self.meal_templates[meal_type][category])
        
        if not available_meals:
            # Fallback to heart_healthy
            available_meals = self.meal_templates[meal_type].get('heart_healthy', [])
        
        # Select meal closest to target calories
        best_meal = min(available_meals, 
                       key=lambda x: abs(x.get('calories', 0) - target_calories))
        
        return best_meal.copy()
    
    def _select_snacks(self, target_calories: float) -> List[Dict]:
        """Select appropriate snacks"""
        snacks = []
        remaining_calories = target_calories
        
        available_snacks = self.meal_templates['snacks'].copy()
        
        while remaining_calories > 50 and available_snacks:
            # Select snack that fits remaining calories
            suitable_snacks = [s for s in available_snacks if s.get('calories', 0) <= remaining_calories + 50]
            
            if not suitable_snacks:
                break
            
            selected_snack = random.choice(suitable_snacks)
            snacks.append(selected_snack.copy())
            remaining_calories -= selected_snack.get('calories', 0)
            
            # Remove selected snack to avoid duplicates
            available_snacks.remove(selected_snack)
        
        return snacks
    
    def _get_day_name(self, day: int) -> str:
        """Get day name for meal plan"""
        days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
        return days[day % 7]
    
    def _calculate_plan_summary(self, weekly_plan: Dict) -> Dict:
        """Calculate summary statistics for the meal plan"""
        total_calories = 0
        total_protein = 0
        total_carbs = 0
        total_fat = 0
        total_days = len(weekly_plan)
        
        for day_plan in weekly_plan.values():
            nutrition = day_plan.get('total_nutrition', {})
            total_calories += nutrition.get('calories', 0)
            total_protein += nutrition.get('protein', 0)
            total_carbs += nutrition.get('carbs', 0)
            total_fat += nutrition.get('fat', 0)
        
        return {
            'total_days': total_days,
            'avg_daily_calories': round(total_calories / total_days) if total_days > 0 else 0,
            'avg_daily_protein': round(total_protein / total_days) if total_days > 0 else 0,
            'avg_daily_carbs': round(total_carbs / total_days) if total_days > 0 else 0,
            'avg_daily_fat': round(total_fat / total_days) if total_days > 0 else 0,
            'total_meals': sum(3 + len(day.get('snacks', [])) for day in weekly_plan.values()),
            'variety_score': self._calculate_variety_score(weekly_plan)
        }
    
    def _calculate_variety_score(self, weekly_plan: Dict) -> float:
        """Calculate variety score for meal plan (0-100)"""
        all_meals = []
        
        for day_plan in weekly_plan.values():
            for meal_type in ['breakfast', 'lunch', 'dinner']:
                meal = day_plan.get(meal_type, {})
                if meal.get('name'):
                    all_meals.append(meal['name'])
            
            for snack in day_plan.get('snacks', []):
                if snack.get('name'):
                    all_meals.append(snack['name'])
        
        if not all_meals:
            return 0
        
        unique_meals = len(set(all_meals))
        total_meals = len(all_meals)
        
        return round((unique_meals / total_meals) * 100, 1)
    
    def _get_adherence_tips(self, user_features: Dict) -> List[str]:
        """Get tips to help user stick to meal plan"""
        tips = [
            "Prepare meals in advance when possible",
            "Keep healthy snacks readily available",
            "Stay hydrated throughout the day"
        ]
        
        if user_features.get('stress_level', 5) > 7:
            tips.append("Practice mindful eating to manage stress-related eating")
        
        if user_features.get('activity_level', 3) >= 4:
            tips.append("Time protein intake around workouts for optimal recovery")
        
        if user_features.get('has_diabetes', 0):
            tips.append("Monitor blood sugar levels and adjust portions as needed")
        
        return tips
    
    def _get_basic_meal_plan(self, days: int) -> Dict:
        """Fallback basic meal plan"""
        basic_plan = {}
        
        for day in range(days):
            day_name = self._get_day_name(day)
            basic_plan[day_name] = {
                'breakfast': {'name': 'Oatmeal with Berries', 'calories': 280, 'protein': 8, 'carbs': 45, 'fat': 6},
                'lunch': {'name': 'Grilled Chicken Salad', 'calories': 400, 'protein': 35, 'carbs': 15, 'fat': 22},
                'dinner': {'name': 'Baked Fish with Vegetables', 'calories': 380, 'protein': 28, 'carbs': 20, 'fat': 18},
                'snacks': [{'name': 'Apple with Almond Butter', 'calories': 180, 'protein': 6, 'carbs': 20, 'fat': 10}],
                'total_nutrition': {'calories': 1240, 'protein': 77, 'carbs': 100, 'fat': 56}
            }
        
        return {
            'meal_plan': basic_plan,
            'nutrition_targets': {'calories': 1240, 'protein': 77, 'carbs': 100, 'fat': 56},
            'plan_summary': {'total_days': days, 'avg_daily_calories': 1240},
            'strategy_used': 'basic',
            'adherence_tips': ['Follow the plan as closely as possible', 'Make gradual adjustments']
        }
