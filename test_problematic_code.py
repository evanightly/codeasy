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

# Test with actual problematic code samples from the database
problematic_codes = [
    "def pipeline_fetch_and_merge()",
    "isnull().sum(\nduplicated().sum(",
    "pd.merge(\n  on='no_ujian'",
    "pd.read_csv()",
    "requests.get()\nresponse.status_code"
]

print("Testing with actual problematic code samples from database:")
for i, code in enumerate(problematic_codes, 1):
    print(f"\n{i}. Testing: {repr(code)}")
    result = analyze_code_complexity(code)
    print(f"   Result: {result}")

# Test what happens with proper code that would work
proper_code = """
import pandas as pd
import requests

def pipeline_fetch_and_merge():
    response = requests.get('https://api.example.com/data')
    if response.status_code == 200:
        data = pd.read_csv('data.csv')
        merged = pd.merge(data, other_data, on='no_ujian')
        null_count = data.isnull().sum()
        dup_count = data.duplicated().sum()
        return merged
    return None
"""

print(f"\n\nTesting with proper complete code:")
print(f"Result: {analyze_code_complexity(proper_code)}")
