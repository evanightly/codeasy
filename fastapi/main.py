from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from jupyter_client import KernelManager
from typing import Optional, List, Dict, Any
import os
import uuid
import base64
import json
import re
import ast
import numpy as np
from sklearn.neural_network import MLPClassifier
from sklearn.preprocessing import MinMaxScaler
import skfuzzy as fuzz
from skfuzzy import control as ctrl

app = FastAPI()

class CodeInput(BaseModel):
    code: str
    testcases: Optional[List[str]] = None
    type: Optional[str] = None
    question_id: Optional[int] = None

class StudentData(BaseModel):
    user_id: int
    materials: List[Dict[str, Any]]

class ClassificationRequest(BaseModel):
    student_data: List[StudentData]
    classification_type: str = "topsis"

class ClassificationResult(BaseModel):
    user_id: int
    level: str
    score: float
    raw_data: Dict[str, Any]

class ClassificationResponse(BaseModel):
    classifications: List[ClassificationResult]

# Function to count variables and functions in Python code
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
    except SyntaxError:
        # If code has syntax errors, return default values
        return {
            "variable_count": 0,
            "function_count": 0
        }

# Function to strip ANSI color codes
def strip_ansi_codes(text):
    ansi_escape = re.compile(r'\x1B(?:[@-Z\\-_]|\[[0-?]*[ -/]*[@-~])')
    return ansi_escape.sub('', text)

# Function to format error message
def format_error_message(traceback_text):
    # Strip ANSI color codes
    clean_text = strip_ansi_codes(traceback_text)
    
    # Split into lines for better formatting
    lines = clean_text.split('\n')
    
    # Format the traceback to be more readable
    formatted_lines = [line.rstrip() for line in lines if line.rstrip()]
    return '\n'.join(formatted_lines)

# Function to detect input() usage in code
def contains_input_function(code):
    # Check for input() call patterns using regex
    input_pattern = re.compile(r'(?<![a-zA-Z0-9_])input\s*\(')
    return bool(input_pattern.search(code))

class JupyterKernelManager:
    def __init__(self):
        self.km = KernelManager(kernel_name='python3')
        self.km.start_kernel()
        self.kc = self.km.client()
        self.kc.start_channels()

    def execute_code(self, code: str, is_sandbox: bool = False):
        outputs = []
        
        # Check for input() usage and reject if found
        if contains_input_function(code):
            outputs.append({
                "type": "error",
                "error_type": "InputFunctionNotSupported",
                "error_msg": "The input() function is not supported in the sandbox environment",
                "content": "The Python sandbox doesn't support interactive input. Please modify your code to use hardcoded values instead of input() calls.\n\nExample:\n# Instead of: name = input('Enter your name: ')\n# Use: name = 'John'  # hardcoded value"
            })
            return outputs
        
        msg_id = self.kc.execute(code)
        
        try:
            while True:
                msg = self.kc.get_iopub_msg(timeout=10)
                msg_type = msg['msg_type']
                content = msg['content']

                if msg_type == 'stream':
                    # Split stream outputs by newlines to separate print statements
                    text_content = content['text'].strip()
                    if text_content:
                        lines = text_content.split('\n')
                        for line in lines:
                            if line.strip():  # Only add non-empty lines
                                outputs.append({
                                    "type": "text",
                                    "content": line.strip()
                                })
                elif msg_type in ['display_data', 'execute_result']:
                    if 'image/png' in content.get('data', {}):
                        image_data = content['data']['image/png']
                        # Add sandbox_ prefix for temporary files
                        prefix = "sandbox_" if is_sandbox else "visual_"
                        image_filename = f"{prefix}{uuid.uuid4().hex}.png"

                        # Create visualization directory if it doesn't exist
                        visualization_dir = "/var/www/html/storage/app/public/visualizations"
                        if not os.path.exists(visualization_dir):
                            os.makedirs(visualization_dir, exist_ok=True)

                        image_path = f"/var/www/html/storage/app/public/visualizations/{image_filename}"
                        
                        # Decode base64 image data correctly
                        image_bytes = base64.b64decode(image_data)
                        with open(image_path, 'wb') as f:
                            f.write(image_bytes)
                        
                        outputs.append({
                            "type": "image",
                            "content": f"/storage/visualizations/{image_filename}",
                            "is_temporary": is_sandbox
                        })
                    elif 'text/plain' in content.get('data', {}):
                        outputs.append({
                            "type": "text",
                            "content": content['data']['text/plain']
                        })

                elif msg_type == 'error':
                    # Check for EOFError specifically to provide a better message
                    if "EOFError" in content.get('ename', '') and "reading a line" in content.get('evalue', ''):
                        outputs.append({
                            "type": "error",
                            "content": "The input() function is not supported in this environment. Please modify your code to use hardcoded values instead.",
                            "error_type": "InputFunctionNotSupported",
                            "error_msg": "Interactive input is not supported"
                        })
                    else:
                        # Format the error message properly
                        error_content = format_error_message('\n'.join(content['traceback']))
                        outputs.append({
                            "type": "error",
                            "content": error_content,
                            "error_type": content.get('ename', 'Error'),
                            "error_msg": content.get('evalue', '')
                        })

                if msg_type == 'status' and content['execution_state'] == 'idle':
                    break

        except Exception as e:
            outputs.append({
                "type": "error",
                "content": str(e),
                "error_type": type(e).__name__,
                "error_msg": str(e)
            })

        return outputs

kernel_mgr = JupyterKernelManager()

@app.post("/test")
async def test_code(input: CodeInput):
    try:
        is_sandbox = input.type == "sandbox"
        
        # Analyze code complexity
        code_analysis = analyze_code_complexity(input.code)
        
        # Execute the code
        outputs = kernel_mgr.execute_code(input.code, is_sandbox)
        
        # Add code complexity metrics
        outputs.append({
            "type": "code_metrics",
            "variable_count": code_analysis["variable_count"],
            "function_count": code_analysis["function_count"]
        })
        
        if input.testcases:
            # Setup test environment
            setup_code = """
            import unittest
            import io
            import sys
            import json

            # Store student code in a variable for tests to access
            student_code = '''{}'''

            class TestUserCode(unittest.TestCase):
                pass
            """.format(input.code.replace("\\", "\\\\").replace("'", "\\'").replace('"', '\\"'))
            
            kernel_mgr.execute_code(setup_code)
            
            # Add test methods
            for i, tc in enumerate(input.testcases):
                test_method = f"""
                def test_{i}(self):
                    {tc}
                TestUserCode.test_{i} = test_{i}
                """
                kernel_mgr.execute_code(test_method)
            
            # Run tests with combined JSON output
            run_code = """
            # Run tests
            stream = io.StringIO()
            runner = unittest.TextTestRunner(stream=stream)
            result = runner.run(unittest.makeSuite(TestUserCode))

            # Combine test stats and results
            test_output = stream.getvalue()
            combined_results = {
                "stats": {
                    "type": "test_stats",
                    "total_tests": result.testsRun,
                    "success": result.testsRun - len(result.failures) - len(result.errors),
                    "fail": len(result.failures) + len(result.errors)
                },
                "results": {
                    "type": "test_result",
                    "status": "passed" if result.wasSuccessful() else "failed",
                    "content": test_output
                }
            }

            # Print as single JSON string
            print("TEST_OUTPUT:" + json.dumps(combined_results))
            """
            test_outputs = kernel_mgr.execute_code(run_code)
            
            # Process outputs
            for output in test_outputs:
                if output['type'] == 'text' and output['content'].startswith('TEST_OUTPUT:'):
                    results = json.loads(output['content'][12:])  # Skip "TEST_OUTPUT:"
                    outputs.append(results['stats'])
                    outputs.append(results['results'])
        
        return outputs
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/classify", response_model=ClassificationResponse)
async def classify_students(request: ClassificationRequest):
    try:
        # Extract all student data
        student_data = request.student_data
        classification_type = request.classification_type
        
        # Prepare the result
        classifications = []
        
        # Process each student
        for student in student_data:
            # Restructure the metrics for TOPSIS calculation - by material rather than by question
            material_metrics = {}
            
            # Get list of all materials
            materials = student.materials
            
            # Create decision matrix (each row is a material, columns are metrics for each question)
            decision_matrix = []
            
            for material in materials:
                material_id = material.get('material_id')
                material_metrics[material_id] = {}
                
                # Prepare row for this material (will contain metrics for all questions)
                material_row = []
                
                # Add all metrics for each question in this material
                for question in material.get('questions', []):
                    question_id = question.get('question_id')
                    metrics = question.get('metrics', {})
                    material_metrics[material_id][question_id] = metrics
                    
                    # Append each metric for this question to the material row in the new order
                    material_row.append(float(metrics.get('compile_count', 0)))
                    material_row.append(float(metrics.get('coding_time', 0)))
                    material_row.append(float(metrics.get('completion_status', 0)))
                    material_row.append(float(metrics.get('trial_status', 0)))
                    material_row.append(float(metrics.get('variable_count', 0)))
                    material_row.append(float(metrics.get('function_count', 0)))
                
                # Add this material's row to the decision matrix
                decision_matrix.append(material_row)
            
            # Get classification results
            calculation_details = {}
            if classification_type == "topsis":
                level, score, calculation_details = calculate_topsis_by_material(decision_matrix, len(materials[0].get('questions', [])))
            elif classification_type == "neural":
                level, score = calculate_neural_network(decision_matrix)
                calculation_details = {"method": "neural_network"}
            elif classification_type == "fuzzy":
                level, score = calculate_fuzzy_logic(decision_matrix)
                calculation_details = {"method": "fuzzy_logic"}
            else:
                level, score, calculation_details = calculate_topsis_by_material(decision_matrix, len(materials[0].get('questions', [])))
            
            # Final sanity check for JSON serialization
            if np.isnan(score) or np.isinf(score):
                score = 0.0
            
            # Create classification result
            classifications.append(
                ClassificationResult(
                    user_id=student.user_id,
                    level=level,
                    score=float(score),
                    raw_data={
                        "materials": material_metrics,
                        "method": classification_type,
                        "calculation_details": calculation_details
                    }
                )
            )
        
        return ClassificationResponse(
            classifications=classifications
        )
        
    except Exception as e:
        print(f"Classification error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

def calculate_topsis_by_material(decision_matrix, question_count):
    try:
        if not decision_matrix or len(decision_matrix) == 0:
            return "Remember", 0.0, {}
            
        # Define criteria types for each metric (benefits and costs)
        # Each question has 6 metrics in this new order: 
        # compile_count, coding_time, completion_status, trial_status, variable_count, function_count
        benefits = []
        costs = []
        
        # For each question, define which metrics are benefits and which are costs
        for q in range(question_count):
            # Indices for this question's metrics
            q_start = q * 6
            
            # Costs: compile_count, coding_time
            costs.extend([q_start, q_start + 1])
            
            # Benefits: completion_status
            benefits.extend([q_start + 2])
            
            # Costs: trial_status
            costs.extend([q_start + 3])
            
            # Benefits: variable_count, function_count
            benefits.extend([q_start + 4, q_start + 5])
        
        # Convert to numpy array for calculations
        decision_matrix = np.array(decision_matrix)
        
        calculation_details = {
            "criteria": {
                "benefits": ["completion_status", "variable_count", "function_count"] * question_count,
                "costs": ["compile_count", "coding_time", "trial_status"] * question_count
            },
            "decision_matrix": decision_matrix.tolist(),
            "steps": []
        }
        
        # Handle single row case
        single_row_case = len(decision_matrix) == 1
        if single_row_case:
            row_copy = decision_matrix[0].copy()
            small_variation = np.random.uniform(0.01, 0.05, size=row_copy.shape)
            row_copy = np.maximum(0, row_copy - small_variation)
            decision_matrix = np.vstack([decision_matrix, row_copy])
            calculation_details["steps"].append({
                "name": "Handle Single Row Case",
                "description": "Duplicated the single row with slight variation to enable TOPSIS calculation",
                "duplicated_matrix": decision_matrix.tolist()
            })
            
        # Normalization step
        col_sums = np.sqrt(np.sum(decision_matrix**2, axis=0))
        col_sums[col_sums == 0] = 1  # Avoid division by zero
        
        calculation_details["steps"].append({
            "name": "Calculate Column Sums",
            "description": "Square root of sum of squares for each column",
            "column_sums": col_sums.tolist()
        })
        
        normalized_matrix = decision_matrix / col_sums
        
        calculation_details["steps"].append({
            "name": "Normalize Decision Matrix",
            "description": "Divide each value by its column sum",
            "normalized_matrix": normalized_matrix.tolist()
        })
        
        # Equal weights for all criteria
        num_criteria = len(benefits) + len(costs)
        weights = np.ones(normalized_matrix.shape[1]) / normalized_matrix.shape[1]
        
        calculation_details["steps"].append({
            "name": "Define Weights",
            "description": "Equal weights for all criteria",
            "weights": weights.tolist()
        })
        
        # Apply weights
        weighted_matrix = normalized_matrix * weights
        
        calculation_details["steps"].append({
            "name": "Apply Weights",
            "description": "Multiply normalized matrix by weights",
            "weighted_matrix": weighted_matrix.tolist()
        })
        
        # Ideal solutions
        ideal_best = np.zeros(weighted_matrix.shape[1])
        ideal_worst = np.zeros(weighted_matrix.shape[1])
        
        # Set ideal values for benefits (max is best)
        for i in benefits:
            if i < weighted_matrix.shape[1]:
                ideal_best[i] = np.max(weighted_matrix[:, i])
                ideal_worst[i] = np.min(weighted_matrix[:, i])
        
        # Set ideal values for costs (min is best)
        for i in costs:
            if i < weighted_matrix.shape[1]:
                ideal_best[i] = np.min(weighted_matrix[:, i])
                ideal_worst[i] = np.max(weighted_matrix[:, i])
        
        calculation_details["steps"].append({
            "name": "Determine Ideal Solutions",
            "description": "Best values (max for benefits, min for costs) and worst values (min for benefits, max for costs)",
            "ideal_best": ideal_best.tolist(),
            "ideal_worst": ideal_worst.tolist()
        })
        
        # Calculate separation measures
        separation_best = np.sqrt(np.sum((weighted_matrix - ideal_best)**2, axis=1))
        separation_worst = np.sqrt(np.sum((weighted_matrix - ideal_worst)**2, axis=1))
        
        calculation_details["steps"].append({
            "name": "Calculate Separation Measures",
            "description": "Euclidean distance from each alternative to ideal best and ideal worst solutions",
            "separation_best": separation_best.tolist(),
            "separation_worst": separation_worst.tolist()
        })
        
        # Calculate performance scores
        performance = np.zeros_like(separation_best)
        non_zero_indices = (separation_best + separation_worst) > 0
        performance[non_zero_indices] = separation_worst[non_zero_indices] / (separation_best[non_zero_indices] + separation_worst[non_zero_indices])
        
        calculation_details["steps"].append({
            "name": "Calculate Performance Score",
            "description": "Relative closeness to the ideal solution: S- / (S+ + S-)",
            "performance_scores": performance.tolist()
        })
        
        # Handle single row case for final score
        if single_row_case:
            avg_performance = float(performance[0])
            calculation_details["steps"].append({
                "name": "Single Row Handling",
                "description": "Using only the original row's performance score",
                "final_score": avg_performance
            })
        else:
            avg_performance = float(np.nanmean(performance))
            calculation_details["steps"].append({
                "name": "Calculate Average Performance",
                "description": "Mean of all performance scores",
                "final_score": avg_performance
            })
        
        # Handle NaN or infinity
        if np.isnan(avg_performance) or np.isinf(avg_performance):
            avg_performance = 0.0
            calculation_details["steps"].append({
                "name": "Error Handling",
                "description": "NaN or Infinity detected, defaulting to 0.0",
                "final_score": 0.0
            })
        
        # Map to Bloom's Taxonomy level
        if avg_performance >= 0.85:
            level = "Create"
        elif avg_performance >= 0.70:
            level = "Evaluate"
        elif avg_performance >= 0.55:
            level = "Analyze"
        elif avg_performance >= 0.40:
            level = "Apply"
        elif avg_performance >= 0.25:
            level = "Understand"
        else:
            level = "Remember"
            
        calculation_details["steps"].append({
            "name": "Map to Bloom's Taxonomy",
            "description": "Mapping performance score to cognitive level",
            "rules": {
                "Create": "CC >= 0.85",
                "Evaluate": "0.70 <= CC < 0.85",
                "Analyze": "0.55 <= CC < 0.70",
                "Apply": "0.40 <= CC < 0.55",
                "Understand": "0.25 <= CC < 0.40",
                "Remember": "CC < 0.25"
            },
            "final_level": level,
            "final_score": float(avg_performance)
        })
        
        return level, float(avg_performance), calculation_details
    except Exception as e:
        print(f"TOPSIS calculation error: {str(e)}")
        return "Remember", 0.0, {"error": str(e)}

# Also update the original calculate_topsis function for backward compatibility
def calculate_topsis(metrics_list):
    try:
        if not metrics_list:
            return "Remember", 0.0, {}
        
        # Updated order: compile, coding_time, completion_status, trial_status, variable_count, function_count
        costs = ['compile_count', 'coding_time']
        benefits = ['completion_status']
        costs.append('trial_status')
        benefits.extend(['variable_count', 'function_count'])
        
        decision_matrix = []
        for metrics in metrics_list:
            row = []
            # Add costs first
            for cost in costs[:2]:  # compile_count and coding_time
                row.append(float(metrics.get(cost, 0)))
            # Then benefits
            row.append(float(metrics.get('completion_status', 0)))
            # Then costs
            row.append(float(metrics.get('trial_status', 0)))
            # Then remaining benefits
            for benefit in benefits[1:]:  # variable_count and function_count
                row.append(float(metrics.get(benefit, 0)))
                
            decision_matrix.append(row)
        
        if not decision_matrix:
            return "Remember", 0.0, {}
            
        decision_matrix = np.array(decision_matrix)
        calculation_details = {
            "criteria": {
                "benefits": ['completion_status', 'variable_count', 'function_count'],
                "costs": ['compile_count', 'coding_time', 'trial_status']
            },
            "decision_matrix": decision_matrix.tolist(),
            "steps": []
        }
        
        # Handle single row case
        single_row_case = len(decision_matrix) == 1
        if single_row_case:
            row_copy = decision_matrix[0].copy()
            small_variation = np.random.uniform(0.01, 0.05, size=row_copy.shape)
            row_copy = np.maximum(0, row_copy - small_variation)
            decision_matrix = np.vstack([decision_matrix, row_copy])
            calculation_details["steps"].append({
                "name": "Handle Single Row Case",
                "description": "Duplicated the single row with slight variation to enable TOPSIS calculation",
                "duplicated_matrix": decision_matrix.tolist()
            })
        
        col_sums = np.sqrt(np.sum(decision_matrix**2, axis=0))
        col_sums[col_sums == 0] = 1
        calculation_details["steps"].append({
            "name": "Calculate Column Sums",
            "description": "Square root of sum of squares for each column",
            "column_sums": col_sums.tolist()
        })
        normalized_matrix = decision_matrix / col_sums
        calculation_details["steps"].append({
            "name": "Normalize Decision Matrix",
            "description": "Divide each value by its column sum",
            "normalized_matrix": normalized_matrix.tolist()
        })
        num_criteria = len(benefits) + len(costs)
        weights = np.ones(num_criteria) / num_criteria
        calculation_details["steps"].append({
            "name": "Define Weights",
            "description": "Equal weights for all criteria",
            "weights": weights.tolist()
        })
        weighted_matrix = normalized_matrix * weights
        calculation_details["steps"].append({
            "name": "Apply Weights",
            "description": "Multiply normalized matrix by weights",
            "weighted_matrix": weighted_matrix.tolist()
        })
        ideal_best = np.zeros(num_criteria)
        ideal_worst = np.zeros(num_criteria)
        for i in range(len(benefits)):
            ideal_best[i] = np.max(weighted_matrix[:, i])
            ideal_worst[i] = np.min(weighted_matrix[:, i])
        for i in range(len(costs)):
            j = i + len(benefits)
            ideal_best[j] = np.min(weighted_matrix[:, j])
            ideal_worst[j] = np.max(weighted_matrix[:, j])
        calculation_details["steps"].append({
            "name": "Determine Ideal Solutions",
            "description": "Best values (max for benefits, min for costs) and worst values (min for benefits, max for costs)",
            "ideal_best": ideal_best.tolist(),
            "ideal_worst": ideal_worst.tolist()
        })
        separation_best = np.sqrt(np.sum((weighted_matrix - ideal_best)**2, axis=1))
        separation_worst = np.sqrt(np.sum((weighted_matrix - ideal_worst)**2, axis=1))
        calculation_details["steps"].append({
            "name": "Calculate Separation Measures",
            "description": "Euclidean distance from each alternative to ideal best and ideal worst solutions",
            "separation_best": separation_best.tolist(),
            "separation_worst": separation_worst.tolist()
        })
        performance = np.zeros_like(separation_best)
        non_zero_indices = (separation_best + separation_worst) > 0
        performance[non_zero_indices] = separation_worst[non_zero_indices] / (separation_best[non_zero_indices] + separation_worst[non_zero_indices])
        calculation_details["steps"].append({
            "name": "Calculate Performance Score",
            "description": "Relative closeness to the ideal solution: S- / (S+ + S-)",
            "performance_scores": performance.tolist()
        })
        if single_row_case:
            avg_performance = float(performance[0])
            calculation_details["steps"].append({
                "name": "Single Row Handling",
                "description": "Using only the original row's performance score",
                "final_score": avg_performance
            })
        else:
            avg_performance = float(np.nanmean(performance))
            calculation_details["steps"].append({
                "name": "Calculate Average Performance",
                "description": "Mean of all performance scores",
                "final_score": avg_performance
            })
        if np.isnan(avg_performance) or np.isinf(avg_performance):
            avg_performance = 0.0
            calculation_details["steps"].append({
                "name": "Error Handling",
                "description": "NaN or Infinity detected, defaulting to 0.0",
                "final_score": 0.0
            })
        if avg_performance >= 0.85:
            level = "Create"
        elif avg_performance >= 0.70:
            level = "Evaluate"
        elif avg_performance >= 0.55:
            level = "Analyze"
        elif avg_performance >= 0.40:
            level = "Apply"
        elif avg_performance >= 0.25:
            level = "Understand"
        else:
            level = "Remember"
        calculation_details["steps"].append({
            "name": "Map to Bloom's Taxonomy",
            "description": "Mapping performance score to cognitive level",
            "rules": {
                "Create": "CC >= 0.85",
                "Evaluate": "0.70 <= CC < 0.85",
                "Analyze": "0.55 <= CC < 0.70",
                "Apply": "0.40 <= CC < 0.55",
                "Understand": "0.25 <= CC < 0.40",
                "Remember": "CC < 0.25"
            },
            "final_level": level,
            "final_score": float(avg_performance)
        })
        return level, float(avg_performance), calculation_details
    except Exception as e:
        print(f"TOPSIS calculation error: {str(e)}")
        return "Remember", 0.0, {"error": str(e)}

def calculate_neural_network(metrics_list):
    try:
        if not metrics_list:
            return "Remember", 0.0
            
        # Extract benefit and cost criteria
        benefits = ['completion_status', 'variable_count', 'function_count']
        costs = ['trial_status', 'compile_count', 'coding_time']
        
        # Create feature matrix
        X = []
        for metrics in metrics_list:
            features = []
            # Add benefit criteria
            for benefit in benefits:
                features.append(float(metrics.get(benefit, 0)))
            # Add cost criteria
            for cost in costs:
                features.append(float(metrics.get(cost, 0)))
            X.append(features)
        
        # Convert to numpy array
        if not X:
            return "Remember", 0.0
            
        X = np.array(X)
        
        # Handle single row case
        if len(X) == 1:
            # Determine level based on completion status
            completion = X[0][0]  # First benefit is completion_status
            if completion > 0:
                return "Apply", 0.45
            else:
                return "Remember", 0.2
        
        # Normalize features using Min-Max scaling
        scaler = MinMaxScaler()
        X_scaled = scaler.fit_transform(X)
        
        # Invert cost criteria (lower is better for costs)
        for i in range(len(benefits), len(benefits) + len(costs)):
            X_scaled[:, i] = 1 - X_scaled[:, i]
        
        # Since we don't have labeled data, we use a simple approach:
        # 1. Calculate mean values for each feature
        # 2. Use that as a score
        avg_scores = np.mean(X_scaled, axis=0)
        
        # Apply weights (equal weights for simplicity)
        weights = np.ones(len(benefits) + len(costs)) / (len(benefits) + len(costs))
        score = np.sum(avg_scores * weights)
        
        # Calculate final neural network score using a sigmoid function to map to 0-1
        final_score = 1 / (1 + np.exp(-5 * (score - 0.5)))
        
        # Map to Bloom's Taxonomy based on the rule base
        if final_score >= 0.85:
            level = "Create"
        elif final_score >= 0.70:
            level = "Evaluate"
        elif final_score >= 0.55:
            level = "Analyze"
        elif final_score >= 0.40:
            level = "Apply"
        elif final_score >= 0.25:
            level = "Understand"
        else:
            level = "Remember"
        
        return level, float(final_score)
        
    except Exception as e:
        print(f"Neural network calculation error: {str(e)}")
        return "Remember", 0.0

def calculate_fuzzy_logic(metrics_list):
    try:
        if not metrics_list:
            return "Remember", 0.0
            
        # Define variables to track for fuzzy logic
        avg_completion = 0.0
        avg_trial = 0.0
        avg_compile = 0.0
        avg_coding_time = 0.0
        avg_variables = 0.0
        avg_functions = 0.0
        
        # Count valid metrics
        valid_count = 0
        
        # Calculate averages of all metrics
        for metrics in metrics_list:
            if any(metrics.values()):
                avg_completion += float(metrics.get('completion_status', 0))
                avg_trial += float(metrics.get('trial_status', 0))
                avg_compile += float(metrics.get('compile_count', 0))
                avg_coding_time += float(metrics.get('coding_time', 0))
                avg_variables += float(metrics.get('variable_count', 0))
                avg_functions += float(metrics.get('function_count', 0))
                valid_count += 1
        
        # Check if we have any valid metrics
        if valid_count == 0:
            return "Remember", 0.0
            
        # Calculate averages
        avg_completion /= valid_count
        avg_trial /= valid_count
        avg_compile /= valid_count
        avg_coding_time /= valid_count
        avg_variables /= valid_count
        avg_functions /= valid_count
        
        # Normalize compile count and coding time (higher is worse)
        # Assuming reasonable bounds for normalization
        norm_compile = min(1.0, avg_compile / 20.0)  # Normalize to 0-1, assume max 20 compiles
        norm_coding_time = min(1.0, avg_coding_time / 60.0)  # Normalize to 0-1, assume max 60 minutes
        
        # Fuzzy logic scoring approach
        # Calculate a weighted score based on fuzzy rules
        
        # Define membership degrees for each metric
        # Completion status (higher is better)
        completion_low = max(0, 1 - (avg_completion * 2.5))
        completion_high = min(1, avg_completion * 2.5)
        
        # Trial status (trying questions is important)
        trial_low = 1 - avg_trial
        trial_high = avg_trial
        
        # Compile count (lower is better - shows efficiency)
        compile_low = 1 - norm_compile
        compile_high = norm_compile
        
        # Coding time (medium is ideal - not too quick, not too slow)
        time_low = max(0, 1 - (norm_coding_time * 2.5))
        time_medium = 1 - abs(2 * norm_coding_time - 1)
        time_high = max(0, (norm_coding_time * 2.5) - 1)
        
        # Variables (higher is better - shows complexity understanding)
        vars_low = max(0, 1 - (avg_variables / 5.0))
        vars_high = min(1, avg_variables / 5.0)
        
        # Functions (higher is better - shows higher order thinking)
        funcs_low = max(0, 1 - (avg_functions / 3.0))
        funcs_high = min(1, avg_functions / 3.0)
        
        # Calculate fuzzy rules
        # Rule 1: If completion is high AND variables is high AND functions is high -> Create level
        rule1 = min(completion_high, vars_high, funcs_high)
        
        # Rule 2: If completion is high AND variables is high -> Evaluate level 
        rule2 = min(completion_high, vars_high)
        
        # Rule 3: If completion is high AND compile is low -> Analyze level
        rule3 = min(completion_high, compile_low)
        
        # Rule 4: If completion is medium AND trial is high -> Apply level
        rule4 = min(time_medium, trial_high)
        
        # Rule 5: If trial is high BUT completion is low -> Understand level
        rule5 = min(trial_high, completion_low)
        
        # Rule 6: If trial is low OR completion is very low -> Remember level
        rule6 = max(trial_low, completion_low * 2)
        
        # Calculate final fuzzy score with rule weights
        create_weight = 0.95
        evaluate_weight = 0.75
        analyze_weight = 0.6
        apply_weight = 0.45
        understand_weight = 0.3
        remember_weight = 0.1
        numerator = (rule1 * create_weight +
                     rule2 * evaluate_weight +
                     rule3 * analyze_weight +
                     rule4 * apply_weight +
                     rule5 * understand_weight +
                     rule6 * remember_weight)
        denominator = (rule1 + rule2 + rule3 + rule4 + rule5 + rule6)
        
        # Avoid division by zero
        if denominator == 0:
            fuzzy_score = 0.25  # Default to Remember level
        else:
            fuzzy_score = numerator / denominator
        
        # Ensure score is in 0-1 range
        fuzzy_score = max(0.0, min(1.0, fuzzy_score))
        
        # Map to Bloom's Taxonomy based on the rule base
        if fuzzy_score >= 0.85:
            level = "Create"
        elif fuzzy_score >= 0.70:
            level = "Evaluate"
        elif fuzzy_score >= 0.55:
            level = "Analyze"
        elif fuzzy_score >= 0.40:
            level = "Apply"
        elif fuzzy_score >= 0.25:
            level = "Understand"
        else:
            level = "Remember"
        
        return level, float(fuzzy_score)
        
    except Exception as e:
        print(f"Fuzzy logic calculation error: {str(e)}")
        return "Remember", 0.0