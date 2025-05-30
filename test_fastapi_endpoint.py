#!/usr/bin/env python3

import requests
import json

# Test the FastAPI analyze_code_complexity endpoint
def test_fastapi_endpoint():
    url = "http://localhost:8001/analyze_code_complexity"
    
    # Test with realistic student code
    realistic_code = """
# Import required libraries for data science
import pandas as pd
import numpy as np
import requests

# Load sample data
data = {
    'student_id': [1, 2, 3, 4, 5],
    'name': ['Alice', 'Bob', 'Charlie', 'Diana', 'Eve'],
    'gpa': [3.8, 3.2, 3.9, 3.5, 3.7]
}

# Create DataFrame
df = pd.DataFrame(data)

# Calculate statistics
mean_gpa = df['gpa'].mean()
max_gpa = df['gpa'].max()
min_gpa = df['gpa'].min()

print(f"Mean GPA: {mean_gpa}")
"""
    
    payload = {"code": realistic_code}
    
    try:
        response = requests.post(url, json=payload)
        if response.status_code == 200:
            result = response.json()
            print("FastAPI endpoint test successful!")
            print(f"Response: {result}")
            print(f"Variables: {result.get('variable_count', 0)}")
            print(f"Functions: {result.get('function_count', 0)}")
            return True
        else:
            print(f"FastAPI endpoint error: {response.status_code}")
            print(f"Response: {response.text}")
            return False
    except requests.exceptions.ConnectionError:
        print("Could not connect to FastAPI server at localhost:8001")
        print("Make sure the FastAPI server is running")
        return False
    except Exception as e:
        print(f"Error testing FastAPI endpoint: {e}")
        return False

if __name__ == "__main__":
    test_fastapi_endpoint()
