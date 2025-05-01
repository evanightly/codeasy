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
# Add new imports for neural network and fuzzy logic
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
            
            # Determine cognitive level using selected method
            if classification_type == "topsis":
                level, score = calculate_topsis(all_metrics)
            elif classification_type == "neural":
                level, score = calculate_neural_network(all_metrics)
            elif classification_type == "fuzzy":
                level, score = calculate_fuzzy_logic(all_metrics)
            else:
                # Default to TOPSIS
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