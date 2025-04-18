from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from jupyter_client import KernelManager
from typing import Optional, List
import os
import uuid
import base64
import json
import re

app = FastAPI()

class CodeInput(BaseModel):
    code: str
    testcases: Optional[List[str]] = None
    type: Optional[str] = None

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
        outputs = kernel_mgr.execute_code(input.code, is_sandbox)
        
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