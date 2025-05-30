#!/usr/bin/env python3

import ast

def analyze_code_complexity(code: str):
    try:
        # Parse the code into an abstract syntax tree
        tree = ast.parse(code)
        
        # Initialize counters
        variable_count = 0
        function_count = 0
        
        # Keep track of variable names to avoid counting duplicates
        variable_names = set()
        
        # Count variable assignments and function definitions
        for node in ast.walk(tree):
            # Count variable assignments
            if isinstance(node, ast.Assign):
                for target in node.targets:
                    # Handle simple variable assignments (a = 1)
                    if isinstance(target, ast.Name):
                        if target.id not in variable_names:
                            variable_names.add(target.id)
                            variable_count += 1
                    # Handle tuple unpacking assignments (a, b, c = 1, 2, 3)
                    elif isinstance(target, ast.Tuple):
                        for elt in target.elts:
                            if isinstance(elt, ast.Name):
                                if elt.id not in variable_names:
                                    variable_names.add(elt.id)
                                    variable_count += 1
            
            # Count variable declarations in for loops
            elif isinstance(node, ast.For):
                # Handle simple loop variable (for i in range(10))
                if isinstance(node.target, ast.Name):
                    if node.target.id not in variable_names:
                        variable_names.add(node.target.id)
                        variable_count += 1
                # Handle tuple unpacking in loops (for i, j in enumerate(items))
                elif isinstance(node.target, ast.Tuple):
                    for elt in node.target.elts:
                        if isinstance(elt, ast.Name):
                            if elt.id not in variable_names:
                                variable_names.add(elt.id)
                                variable_count += 1
            
            # Count function definitions
            elif isinstance(node, ast.FunctionDef):
                function_count += 1
        
        return {
            "variable_count": variable_count,
            "function_count": function_count
        }
    except SyntaxError as e:
        # If code has syntax errors, return default values
        print(f"Syntax Error: {e}")
        return {
            "variable_count": 0,
            "function_count": 0
        }

# Test realistic student code based on the starter code
realistic_student_code = """
# Import required libraries for data science
import pandas as pd
import numpy as np
import requests

# Import additional libraries
import matplotlib.pyplot as plt
import seaborn as sns

# Load sample data
data = {
    'student_id': [1, 2, 3, 4, 5],
    'name': ['Alice', 'Bob', 'Charlie', 'Diana', 'Eve'],
    'gpa': [3.8, 3.2, 3.9, 3.5, 3.7],
    'major': ['CS', 'Math', 'CS', 'Physics', 'Math']
}

# Create DataFrame
df = pd.DataFrame(data)

# Calculate statistics
mean_gpa = df['gpa'].mean()
max_gpa = df['gpa'].max()
min_gpa = df['gpa'].min()

# Group by major
major_stats = df.groupby('major')['gpa'].mean()

# Print results
print(f"Mean GPA: {mean_gpa}")
print(f"Max GPA: {max_gpa}")
print(f"Min GPA: {min_gpa}")
print("\\nGPA by Major:")
print(major_stats)
"""

print("Testing realistic student code that builds on starter code...")
result = analyze_code_complexity(realistic_student_code)
print(f"Result: {result}")

# This should now give meaningful counts:
# Variables: data, df, mean_gpa, max_gpa, min_gpa, major_stats
# Functions: 0 (but plenty of variables showing understanding)

print(f"Variables found: {result['variable_count']}")
print(f"Functions found: {result['function_count']}")

# Test another realistic example with function
function_example = """
# Import required libraries for data science
import pandas as pd
import numpy as np

def calculate_student_stats(dataframe):
    \"\"\"Calculate basic statistics for student data\"\"\"
    stats = {}
    stats['total_students'] = len(dataframe)
    stats['avg_gpa'] = dataframe['gpa'].mean()
    stats['highest_gpa'] = dataframe['gpa'].max()
    return stats

# Load data
student_data = pd.read_csv("students.csv")

# Process data
results = calculate_student_stats(student_data)
summary_report = f"Total: {results['total_students']}, Avg GPA: {results['avg_gpa']}"

# Display results
print(summary_report)
for key, value in results.items():
    print(f"{key}: {value}")
"""

print("\nTesting code with function definition...")
func_result = analyze_code_complexity(function_example)
print(f"Function example result: {func_result}")
print(f"Variables: {func_result['variable_count']}, Functions: {func_result['function_count']}")
