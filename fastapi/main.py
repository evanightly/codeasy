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
from pydantic import BaseModel

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
    formatted_lines = []
    for line in lines:
        line = line.rstrip()
        if line:
            formatted_lines.append(line)
    
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
                
                elif msg_type == 'display_data' or msg_type == 'execute_result':
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
            # Collect all metrics across all materials and questions
            all_metrics = []
            material_metrics = {}
            
            # Process each material
            for material in student.materials:
                material_id = material.get('material_id')
                material_metrics[material_id] = {}
                
                # Process each question in the material
                for question in material.get('questions', []):
                    question_id = question.get('question_id')
                    metrics = question.get('metrics', {})
                    
                    # Store metrics for this question
                    material_metrics[material_id][question_id] = metrics
                    all_metrics.append(metrics)
            
            # Determine cognitive level using TOPSIS
            if classification_type == "topsis":
                level, score = calculate_topsis(all_metrics)
            else:
                # Default to TOPSIS for now
                level, score = calculate_topsis(all_metrics)
            
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
                        "method": classification_type
                    }
                )
            )
        
        return ClassificationResponse(
            classifications=classifications
        )
        
    except Exception as e:
        print(f"Classification error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

def calculate_topsis(metrics_list):
    try:
        if not metrics_list:
            return "Remember", 0.0
            
        # Extract benefit and cost criteria
        benefits = ['completion_status', 'variable_count', 'function_count']
        costs = ['trial_status', 'compile_count', 'coding_time']
        
        # Create decision matrix
        decision_matrix = []
        for metrics in metrics_list:
            row = []
            # Add benefit criteria
            for benefit in benefits:
                row.append(float(metrics.get(benefit, 0)))
            # Add cost criteria
            for cost in costs:
                row.append(float(metrics.get(cost, 0)))
            decision_matrix.append(row)
        
        # Convert to numpy array for calculations
        if not decision_matrix:
            return "Remember", 0.0
            
        decision_matrix = np.array(decision_matrix)
        
        # If we have only one row, we can't perform TOPSIS
        if len(decision_matrix) == 1:
            # Determine level based on completion status
            completion = decision_matrix[0][0]  # First benefit is completion_status
            if completion > 0:
                return "Apply", 0.45
            else:
                return "Remember", 0.2
        
        # Calculate column sums for normalization
        col_sums = np.sqrt(np.sum(decision_matrix**2, axis=0))
        
        # Handle zeros in col_sums
        col_sums[col_sums == 0] = 1
        
        # Normalize the decision matrix
        normalized_matrix = decision_matrix / col_sums
        
        # Define weights (equal weights for simplicity)
        num_criteria = len(benefits) + len(costs)
        weights = np.ones(num_criteria) / num_criteria
        
        # Apply weights
        weighted_matrix = normalized_matrix * weights
        
        # Determine ideal and negative-ideal solutions
        ideal_best = np.zeros(num_criteria)
        ideal_worst = np.zeros(num_criteria)
        
        # For benefit criteria, max is best; for cost criteria, min is best
        for i in range(len(benefits)):
            ideal_best[i] = np.max(weighted_matrix[:, i])
            ideal_worst[i] = np.min(weighted_matrix[:, i])
        
        for i in range(len(costs)):
            j = i + len(benefits)
            ideal_best[j] = np.min(weighted_matrix[:, j])
            ideal_worst[j] = np.max(weighted_matrix[:, j])
        
        # Calculate separation measures
        separation_best = np.sqrt(np.sum((weighted_matrix - ideal_best)**2, axis=1))
        separation_worst = np.sqrt(np.sum((weighted_matrix - ideal_worst)**2, axis=1))
        
        # Calculate performance score - Safely handle division by zero
        performance = np.zeros_like(separation_best)
        non_zero_indices = (separation_best + separation_worst) > 0
        performance[non_zero_indices] = separation_worst[non_zero_indices] / (separation_best[non_zero_indices] + separation_worst[non_zero_indices])
        
        # Calculate average performance and handle NaN/Infinity values
        avg_performance = float(np.nanmean(performance))
        
        # Final check for NaN/Infinity values
        if np.isnan(avg_performance) or np.isinf(avg_performance):
            avg_performance = 0.0
        
        # Map to Bloom's Taxonomy based on the rule base
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
        
        return level, float(avg_performance)
        
    except Exception as e:
        print(f"TOPSIS calculation error: {str(e)}")
        return "Remember", 0.0