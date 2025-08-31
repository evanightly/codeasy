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
    testcase_ids: Optional[List[int]] = None  # Add test case IDs for tracking
    type: Optional[str] = None
    question_id: Optional[int] = None
    student_id: Optional[int] = None  # Add student ID for isolation

class QuestionData(BaseModel):
    question_id: int
    question_name: str
    order_number: int
    metrics: Dict[str, Any]

class MaterialData(BaseModel):
    material_id: int
    material_name: str
    questions: List[Dict[str, Any]]

class StudentData(BaseModel):
    user_id: int
    materials: List[Dict[str, Any]]

class ClassificationRequest(BaseModel):
    student_data: List[StudentData]
    classification_type: str = "topsis"

class ClassificationResult(BaseModel):
    user_id: int
    material_id: Optional[int] = None
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
        # Remove shared kernel - we'll create per-request kernels
        pass

    def execute_code_isolated(self, code: str, is_sandbox: bool = False, student_id: Optional[int] = None):
        """Execute code in an isolated kernel instance to prevent student interference"""
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
        
        # Create a new isolated kernel for this request
        km = None
        kc = None
        
        try:
            # Create fresh kernel instance
            km = KernelManager(kernel_name='python3')
            km.start_kernel()
            kc = km.client()
            kc.start_channels()
            
            # Wait for kernel to be ready
            kc.wait_for_ready(timeout=30)
            
            # Execute the code in the isolated kernel
            msg_id = kc.execute(code)
            
            while True:
                msg = kc.get_iopub_msg(timeout=10)
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
                        # Add student_id and sandbox prefix for file isolation
                        prefix = f"sandbox_{student_id}_" if is_sandbox else f"visual_{student_id}_"
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
        finally:
            # Always clean up the kernel to prevent resource leaks
            if kc:
                try:
                    kc.stop_channels()
                except:
                    pass
            if km:
                try:
                    km.shutdown_kernel()
                except:
                    pass

        return outputs

kernel_mgr = JupyterKernelManager()

@app.post("/test")
async def test_code(input: CodeInput):
    try:
        is_sandbox = input.type == "sandbox"
        
        # Simple console logging for request tracking
        print("=" * 80)
        print(f"📝 FASTAPI REQUEST - Student ID: {input.student_id or 'unknown'}")
        print(f"🔧 Type: {input.type or 'normal'}")
        print(f"❓ Question ID: {input.question_id or 'unknown'}")
        print(f"📄 Code Length: {len(input.code)} characters")
        print(f"🧪 Test Cases Count: {len(input.testcases) if input.testcases else 0}")
        print(f"💻 Student Code:")
        print("-" * 40)
        print(input.code)
        print("-" * 40)
        if input.testcases:
            print(f"🧪 Test Cases:")
            for i, tc in enumerate(input.testcases):
                print(f"  Test {i+1}: {tc}")
        print("=" * 80)
        
        # Analyze code complexity
        code_analysis = analyze_code_complexity(input.code)
        
        # Execute the code with proper isolation using student_id
        outputs = kernel_mgr.execute_code_isolated(
            input.code, 
            is_sandbox, 
            input.student_id
        )
        
        # Add code complexity metrics
        outputs.append({
            "type": "code_metrics",
            "variable_count": code_analysis["variable_count"],
            "function_count": code_analysis["function_count"]
        })
        
        if input.testcases:
            # Build complete test code that runs in a single isolated kernel
            # This ensures all test setup, test methods, and execution happen in the same context
            
            # Escape the student code properly
            escaped_code = input.code.replace("\\", "\\\\").replace("'", "\\'").replace('"', '\\"')
            
            # Build test methods dynamically with tracking
            test_methods = []
            test_case_ids = input.testcase_ids if input.testcase_ids else list(range(len(input.testcases)))
            
            for i, tc in enumerate(input.testcases):
                test_case_id = test_case_ids[i] if i < len(test_case_ids) else i
                test_method = f"""
    def test_{i}(self):
        # The test case can access student_code directly
        # student_code contains the raw code as a string for string-based assertions
        global passed_test_case_ids
        try:
            {tc}
            # If test passes, record the test case ID
            passed_test_case_ids.append({test_case_id})
        except Exception as e:
            # Test failed, don't add to passed list
            raise e"""
                test_methods.append(test_method)
            
            # Combine all test code into a single execution block
            complete_test_code = f"""
import unittest
import io
import sys
import json

# Global list to track passed test case IDs
passed_test_case_ids = []

# Store student code in a variable for tests to access
student_code = '''{escaped_code}'''

class TestUserCode(unittest.TestCase):
{''.join(test_methods)}

# Run tests
stream = io.StringIO()
runner = unittest.TextTestRunner(stream=stream)
result = runner.run(unittest.makeSuite(TestUserCode))

# Combine test stats and results
test_output = stream.getvalue()
combined_results = {{
    "stats": {{
        "type": "test_stats", 
        "total_tests": result.testsRun,
        "success": result.testsRun - len(result.failures) - len(result.errors),
        "fail": len(result.failures) + len(result.errors),
        "passed_test_case_ids": passed_test_case_ids
    }},
    "results": {{
        "type": "test_result",
        "status": "passed" if result.wasSuccessful() else "failed",
        "content": test_output
    }}
}}

# Print as single JSON string
print("TEST_OUTPUT:" + json.dumps(combined_results))
"""
            
            # Execute all test code in a single isolated kernel
            test_outputs = kernel_mgr.execute_code_isolated(complete_test_code, is_sandbox, input.student_id)
            
            # Process outputs
            test_stats = None
            for output in test_outputs:
                if output['type'] == 'text' and output['content'].startswith('TEST_OUTPUT:'):
                    results = json.loads(output['content'][12:])  # Skip "TEST_OUTPUT:"
                    test_stats = results['stats']
                    outputs.append(results['stats'])
                    outputs.append(results['results'])
            
            # Log test results
            if test_stats:
                print(f"✅ TEST RESULTS - Student {input.student_id or 'unknown'}: "
                      f"{test_stats.get('success', 0)}/{test_stats.get('total_tests', 0)} passed")
        
        # Log final response summary
        error_count = sum(1 for output in outputs if output.get('type') == 'error')
        text_count = sum(1 for output in outputs if output.get('type') == 'text')
        print(f"📤 RESPONSE - Student {input.student_id or 'unknown'}: "
              f"{len(outputs)} outputs, {text_count} text, {error_count} errors")
        
        return outputs
        
    except Exception as e:
        print(f"❌ ERROR - Student {input.student_id or 'unknown'}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

def calculate_course_level_classification(material_classifications):
    """
    Calculate course-level classification based on mode and highest cognitive level
    from all material classifications.
    
    Args:
        material_classifications: List of material classification results with 'level' field
        
    Returns:
        dict: Course-level classification with level, score, and reasoning
    """
    try:
        if not material_classifications:
            return {"level": "Remember", "score": 0.0, "reasoning": "No materials found"}
        
        # Extract cognitive levels from materials
        cognitive_levels = [classification['level'] for classification in material_classifications]
        
        # Define cognitive level hierarchy (C1 = lowest, C6 = highest)
        level_hierarchy = {
            "Remember": 1,
            "Understand": 2,  
            "Apply": 3,
            "Analyze": 4,
            "Evaluate": 5,
            "Create": 6
        }
        
        # Calculate mode (most frequent level)
        level_counts = {}
        for level in cognitive_levels:
            level_counts[level] = level_counts.get(level, 0) + 1
        
        # Find the most frequent level(s)
        max_count = max(level_counts.values())
        mode_levels = [level for level, count in level_counts.items() if count == max_count]
        
        # If there's a tie in mode, pick the higher level
        mode_level = max(mode_levels, key=lambda x: level_hierarchy.get(x, 0))
        
        # Calculate highest cognitive level achieved
        highest_level = max(cognitive_levels, key=lambda x: level_hierarchy.get(x, 0))
        
        # Decision logic: Choose between mode and highest based on your business rule
        # Based on the case study image, it seems to balance between mode and highest
        mode_rank = level_hierarchy.get(mode_level, 0)
        highest_rank = level_hierarchy.get(highest_level, 0)
        
        # Business logic: If mode and highest are close (within 1 level), use mode
        # If highest is significantly higher (2+ levels), use a middle ground
        if abs(highest_rank - mode_rank) <= 1:
            final_level = mode_level
            reasoning = f"{mode_level} is the mode and the highest cognitive level"
        elif highest_rank - mode_rank == 2:
            # Use the level between mode and highest
            middle_rank = (mode_rank + highest_rank) // 2
            final_level = next(level for level, rank in level_hierarchy.items() if rank == middle_rank)
            reasoning = f"{final_level} is chosen as a balance between mode ({mode_level}) and highest ({highest_level})"
        else:
            # For larger gaps, lean more towards the mode but bump up one level
            middle_rank = min(mode_rank + 1, 6)
            final_level = next(level for level, rank in level_hierarchy.items() if rank == middle_rank)
            reasoning = f"{final_level} is chosen as an advancement from mode ({mode_level}) considering highest ({highest_level})"
        
        # Calculate average score across materials for the final score
        avg_score = sum(classification['score'] for classification in material_classifications) / len(material_classifications)
        
        return {
            "level": final_level,
            "score": float(avg_score),
            "reasoning": reasoning,
            "mode_level": mode_level,
            "highest_level": highest_level,
            "material_count": len(material_classifications),
            "level_distribution": level_counts
        }
        
    except Exception as e:
        print(f"Course-level classification error: {str(e)}")
        return {"level": "Remember", "score": 0.0, "reasoning": f"Error: {str(e)}"}

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
            user_id = student.user_id
            materials = student.materials
            
            # Store material classifications for this student
            student_material_classifications = []
            
            # Process each material separately (Revision 1)
            for material in materials:
                material_id = material.get('material_id')
                material_name = material.get('material_name')
                questions = material.get('questions', [])
                
                # Create a matrix with rows for each question in this material
                decision_matrix = []
                raw_metrics = []
                
                for question in questions:
                    question_id = question.get('question_id')
                    question_name = question.get('question_name', f"Question {question.get('order_number', 0)}")
                    metrics = question.get('metrics', {})
                    
                    # Add a row for this question with all its metrics
                    row = [
                        float(metrics.get('compile_count', 0)),
                        float(metrics.get('coding_time', 0)),
                        float(metrics.get('completion_status', 0)),
                        float(metrics.get('trial_status', 0)),
                        float(metrics.get('variable_count', 0)),
                        float(metrics.get('function_count', 0)),
                        float(metrics.get('test_case_completion_rate', 0))
                    ]
                    
                    decision_matrix.append(row)
                    raw_metrics.append({
                        'question_id': question_id,
                        'question_name': question_name,
                        'order_number': question.get('order_number', 0),
                        'compile_count': metrics.get('compile_count', 0),
                        'coding_time': metrics.get('coding_time', 0),
                        'completion_status': metrics.get('completion_status', 0),
                        'trial_status': metrics.get('trial_status', 0),
                        'variable_count': metrics.get('variable_count', 0),
                        'function_count': metrics.get('function_count', 0),
                        'test_case_complete_count': metrics.get('test_case_complete_count', 0),
                        'test_case_total_count': metrics.get('test_case_total_count', 0),
                        'test_case_completion_rate': metrics.get('test_case_completion_rate', 0)
                    })
                
                # Skip empty materials
                if not decision_matrix:
                    continue
                
                # Get classification results for this material
                calculation_details = {}
                if classification_type == "topsis":
                    # Note: Here we pass 1 as the question_count since we've restructured the data
                    # Each row is a question, not a material, so we don't need to multiply by question count
                    level, score, calculation_details = calculate_topsis_by_material(decision_matrix, 1)
                elif classification_type == "neural":
                    level, score = calculate_neural_network(decision_matrix)
                    calculation_details = {"method": "neural_network"}
                elif classification_type == "fuzzy":
                    level, score = calculate_fuzzy_logic(decision_matrix)
                    calculation_details = {"method": "fuzzy_logic"}
                else:
                    level, score, calculation_details = calculate_topsis_by_material(decision_matrix, 1)
                
                # Final sanity check for JSON serialization
                if np.isnan(score) or np.isinf(score):
                    score = 0.0
                
                # Generate recommendations based on metrics
                recommendations = generate_recommendations(raw_metrics, level, score)
                
                # Identify weak areas for targeted improvement
                weak_areas = identify_weak_areas(raw_metrics)
                
                # Create raw data with question-level metrics for generating recommendations
                raw_data = {
                    "material_id": material_id,
                    "material_name": material_name,
                    "question_metrics": raw_metrics,
                    "method": classification_type,
                    "classification_level": level,
                    "classification_score": float(score),
                    "calculation_details": calculation_details,
                    "recommendations": recommendations,
                    "weak_areas": weak_areas
                }
                
                # Store for course-level calculation
                student_material_classifications.append({
                    "level": level,
                    "score": float(score),
                    "material_id": material_id,
                    "material_name": material_name
                })
                
                # Create classification result for this material
                classifications.append(
                    ClassificationResult(
                        user_id=user_id,
                        material_id=material_id,  # New field for material ID
                        level=level,
                        score=float(score),
                        raw_data=raw_data
                    )
                )
            
            # Add course-level classification for this student
            if student_material_classifications:
                course_classification = calculate_course_level_classification(student_material_classifications)
                
                # Create course-level raw data
                course_raw_data = {
                    "method": f"{classification_type}_course_level",
                    "classification_level": course_classification["level"],
                    "classification_score": course_classification["score"],
                    "reasoning": course_classification["reasoning"],
                    "mode_level": course_classification["mode_level"],
                    "highest_level": course_classification["highest_level"],
                    "material_count": course_classification["material_count"],
                    "level_distribution": course_classification["level_distribution"],
                    "material_classifications": student_material_classifications
                }
                
                # Add course-level classification result (material_id = None indicates course-level)
                classifications.append(
                    ClassificationResult(
                        user_id=user_id,
                        material_id=None,  # None indicates course-level classification
                        level=course_classification["level"],
                        score=course_classification["score"],
                        raw_data=course_raw_data
                    )
                )
        
        return ClassificationResponse(
            classifications=classifications
        )
        
    except Exception as e:
        print(f"Classification error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Function to generate recommendations based on metrics
def generate_recommendations(raw_metrics, level, score):
    recommendations = []
    
    # Define thresholds for different metrics
    thresholds = {
        'variable_count': {'low': 2, 'high': 5},
        'function_count': {'low': 1, 'high': 3},
        'compile_count': {'low': 2, 'high': 8},
        'coding_time': {'low': 5, 'high': 30}, # in minutes
        'test_case_completion_rate': {'low': 0.6, 'high': 0.9} # 60% to 90% completion rate
    }
    
    # Analyze each question's metrics and provide targeted recommendations
    for i, metrics in enumerate(raw_metrics):
        question_num = metrics.get('order_number', i + 1)
        question_name = metrics.get('question_name', f"Question {question_num}")
        
        # Check completion status first
        if metrics['completion_status'] == 0:
            recommendations.append(f"Complete '{question_name}' to improve your overall score.")
            continue
            
        # Check variable usage
        if metrics['variable_count'] < thresholds['variable_count']['low']:
            recommendations.append(f"In '{question_name}', try to use more variables to better organize your code.")
        
        # Check function usage
        if metrics['function_count'] < thresholds['function_count']['low']:
            recommendations.append(f"Consider breaking down your solution for '{question_name}' into more functions for better modularity.")
        
        # Check compile count
        if metrics['compile_count'] > thresholds['compile_count']['high']:
            recommendations.append(f"You compiled your code {metrics['compile_count']} times for '{question_name}'. Try to review your code more carefully before compiling.")
        
        # Check coding time
        if metrics['coding_time'] > thresholds['coding_time']['high']:
            recommendations.append(f"You spent {metrics['coding_time']} minutes on '{question_name}'. Try to improve your problem-solving speed with more practice.")
        
        # Check test case completion rate
        if 'test_case_completion_rate' in metrics and metrics['test_case_completion_rate'] < thresholds['test_case_completion_rate']['low']:
            test_complete = metrics.get('test_case_complete_count', 0)
            test_total = metrics.get('test_case_total_count', 0)
            if test_total > 0:
                recommendations.append(f"Your test case passing rate for '{question_name}' is only {test_complete}/{test_total}. Focus on improving your solution to pass more test cases.")
    
    # Add general recommendation based on the cognitive level
    if level == "Remember":
        recommendations.append("Focus on understanding basic concepts before proceeding to more complex tasks.")
    elif level == "Understand":
        recommendations.append("Try to not just memorize, but understand the underlying principles of the code you write.")
    elif level == "Apply":
        recommendations.append("Practice applying your knowledge in different contexts to strengthen your skills.")
    elif level == "Analyze":
        recommendations.append("Work on breaking down complex problems into smaller, manageable parts.")
    elif level == "Evaluate":
        recommendations.append("Challenge yourself by evaluating different approaches to the same problem.")
    elif level == "Create":
        recommendations.append("Excellent work! Continue developing your creative problem-solving skills.")
    
    # Limit to 5 most important recommendations to avoid overwhelming the student
    if len(recommendations) > 5:
        recommendations = recommendations[:5]
    
    return recommendations

# Function to identify weak areas based on metrics
def identify_weak_areas(raw_metrics):
    weak_areas = []
    
    # Calculate averages for each metric
    avg_completion = sum(q['completion_status'] for q in raw_metrics) / max(1, len(raw_metrics))
    avg_variables = sum(q['variable_count'] for q in raw_metrics) / max(1, len(raw_metrics))
    avg_functions = sum(q['function_count'] for q in raw_metrics) / max(1, len(raw_metrics))
    avg_compile = sum(q['compile_count'] for q in raw_metrics) / max(1, len(raw_metrics))
    avg_time = sum(q['coding_time'] for q in raw_metrics) / max(1, len(raw_metrics))
    
    # Calculate average test case completion rate, only if available
    test_case_metrics = [q for q in raw_metrics if 'test_case_completion_rate' in q and q['test_case_completion_rate'] > 0]
    avg_test_case_rate = sum(q['test_case_completion_rate'] for q in test_case_metrics) / max(1, len(test_case_metrics)) if test_case_metrics else 0
    
    # Check for weak areas
    if avg_completion < 0.7:
        weak_areas.append("task completion")
    
    if avg_variables < 3:
        weak_areas.append("variable usage")
    
    if avg_functions < 1.5:
        weak_areas.append("function usage")
    
    if avg_compile > 10:
        weak_areas.append("code efficiency")
    
    if avg_time > 25:
        weak_areas.append("problem-solving speed")
    
    if avg_test_case_rate < 0.6:
        weak_areas.append("test case success rate")
    
    return weak_areas

def calculate_topsis_by_material(decision_matrix, question_count):
    try:
        if not decision_matrix or len(decision_matrix) == 0:
            return "Remember", 0.0, {}
        
        # Define criteria types for each metric (benefits and costs)
        # Each row is a question with metrics in this order: 
        # compile_count(cost), coding_time(cost), completion_status(benefit), 
        # trial_status(benefit), variable_count(benefit), function_count(benefit),
        # test_case_completion_rate(benefit)
        benefits = [2, 3, 4, 5, 6]  # completion_status, trial_status, variable_count, function_count, test_case_completion_rate
        costs = [0, 1]     # compile_count, coding_time
        
        # Convert to numpy array for calculations
        decision_matrix = np.array(decision_matrix)
        
        calculation_details = {
            "criteria": {
                "benefits": ["completion_status", "trial_status", "variable_count", "function_count", "test_case_completion_rate"],
                "costs": ["compile_count", "coding_time"]
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
        benefits = ['completion_status', 'trial_status', 'variable_count', 'function_count']
        
        decision_matrix = []
        for metrics in metrics_list:
            row = []
            # Add costs first
            for cost in costs:  # compile_count and coding_time
                row.append(float(metrics.get(cost, 0)))
            # Then benefits
            for benefit in benefits:  # completion_status, trial_status, variable_count, function_count
                row.append(float(metrics.get(benefit, 0)))
                
            decision_matrix.append(row)
        
        if not decision_matrix:
            return "Remember", 0.0, {}
            
        decision_matrix = np.array(decision_matrix)
        calculation_details = {
            "criteria": {
                "benefits": ['completion_status', 'trial_status', 'variable_count', 'function_count'],
                "costs": ['compile_count', 'coding_time']
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
        # First handle costs (compile_count, coding_time)
        for i in range(len(costs)):
            ideal_best[i] = np.min(weighted_matrix[:, i])
            ideal_worst[i] = np.max(weighted_matrix[:, i])
        # Then handle benefits (completion_status, trial_status, variable_count, function_count)
        for i in range(len(benefits)):
            j = i + len(costs)
            ideal_best[j] = np.max(weighted_matrix[:, j])
            ideal_worst[j] = np.min(weighted_matrix[:, j])
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
        benefits = ['completion_status', 'trial_status', 'variable_count', 'function_count']
        costs = ['compile_count', 'coding_time']
        
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

class TestCaseDebugInput(BaseModel):
    student_code: str
    test_case_code: str
    language: str = "python"

@app.post("/debug-test-case")
async def debug_test_case(input: TestCaseDebugInput):
    # Properly indent all test case lines for method scope
    test_case_lines = input.test_case_code.strip().split('\n')
    # Filter out empty lines and properly indent each line
    indented_lines = []
    for line in test_case_lines:
        if line.strip():  # Only process non-empty lines
            # Add proper indentation for method scope (8 spaces)
            indented_lines.append('        ' + line.strip())
    indented_test_case = '\n'.join(indented_lines)

    # Format the test code with unittest structure
    test_code = f"""
import unittest
import io
import sys

# Store the student code as a string for test assertions
student_code = '''
{input.student_code}
'''

# Try to execute student code in global scope, but ignore errors
try:
    exec(student_code)
except Exception as e:
    # Print error but continue
    print(f'Student code execution error: {{e}}')

# Create test case class
class TestUserCode(unittest.TestCase):
    def setUp(self):
        # Make student_code available as instance variable
        self.student_code = student_code
    def test_case(self):
        # The student code is already executed in global scope
        # so all functions and variables are available here
        # Make student_code available in local scope for convenience
        student_code = self.student_code
{indented_test_case}

# Run the test using a test runner instead of unittest.main()
stream = io.StringIO()
runner = unittest.TextTestRunner(stream=stream)
result = runner.run(unittest.makeSuite(TestUserCode))

# Print the results in a format we can parse
print("TEST_RESULT:", "SUCCESS" if result.wasSuccessful() else "FAILURE")
print("TEST_OUTPUT:", stream.getvalue())
"""

    # Execute the test code
    outputs = kernel_mgr.execute_code_isolated(test_code, False, None)

    # Process the test results
    test_results = []
    success = False

    for output in outputs:
        if output['type'] == 'text' and 'TEST_RESULT: SUCCESS' in output['content']:
            success = True
        # Add all outputs to results
        test_results.append(output)

    return {
        "results": test_results,
        "success": success
    }