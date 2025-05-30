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

# Test with sample code that should have variables and functions
test_code = """
# Sample Python code for testing
def calculate_average(numbers):
    total = sum(numbers)
    count = len(numbers)
    if count > 0:
        return total / count
    return 0

def process_data(data):
    result = []
    for item in data:
        processed = item * 2
        result.append(processed)
    return result

# Main execution
numbers = [1, 2, 3, 4, 5]
average = calculate_average(numbers)
processed_numbers = process_data(numbers)

print(f"Average: {average}")
print(f"Processed: {processed_numbers}")
"""

print("Testing analyze_code_complexity function...")
result = analyze_code_complexity(test_code)
print(f"Result: {result}")

# Expected: 
# - Functions: 2 (calculate_average, process_data)
# - Variables: numbers, average, processed_numbers, total, count, result, item, processed

print(f"Expected Functions: 2, Got: {result['function_count']}")
print(f"Expected Variables: ~8, Got: {result['variable_count']}")

# Test with simpler code
simple_code = """
x = 10
y = 20
result = x + y
print(result)
"""

print("\nTesting with simple code...")
simple_result = analyze_code_complexity(simple_code)
print(f"Simple result: {simple_result}")
print(f"Expected Variables: 3 (x, y, result), Got: {simple_result['variable_count']}")
