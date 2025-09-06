import requests
import json

# Test data
test_data = {
    "user_id": "test_user_123",
    "health_profile": {
        "basicInfo": {
            "age": 30,
            "gender": "male",
            "height": {"value": 175},
            "weight": {"value": 75}
        },
        "medicalHistory": {
            "chronicConditions": [],
            "allergies": []
        },
        "dietaryInfo": {
            "dietType": "omnivore"
        },
        "lifestyle": {
            "activityLevel": "moderately-active",
            "sleepHours": 7,
            "stressLevel": 5
        }
    },
    "order_history": [],
    "available_foods": [
        {
            "fdcId": "123456",
            "name": "Grilled Chicken Breast",
            "nutrition": {
                "calories": 165,
                "protein": 31,
                "carbs": 0,
                "fat": 3.6,
                "sodium": 74
            },
            "healthFlags": {
                "isHighProtein": True
            }
        }
    ]
}

def test_ml_service():
    base_url = "http://localhost:5001"
    
    # Test health check
    try:
        response = requests.get(f"{base_url}/health")
        print("Health Check:", response.json())
    except Exception as e:
        print("Health check failed:", e)
    
    # Test recommendations
    try:
        response = requests.post(f"{base_url}/recommend", json=test_data)
        print("Recommendations:", json.dumps(response.json(), indent=2))
    except Exception as e:
        print("Recommendations test failed:", e)
    
    # Test health risk assessment
    try:
        risk_data = {
            "user_id": test_data["user_id"],
            "health_profile": test_data["health_profile"], 
            "order_history": test_data["order_history"]
        }
        response = requests.post(f"{base_url}/health-risk", json=risk_data)
        print("Health Risk:", json.dumps(response.json(), indent=2))
    except Exception as e:
        print("Health risk test failed:", e)

if __name__ == "__main__":
    test_ml_service()
