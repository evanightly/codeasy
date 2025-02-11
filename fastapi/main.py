from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from jupyter_client import KernelManager
from typing import Optional, List
import os
import uuid
import base64
import json

app = FastAPI()

class CodeInput(BaseModel):
    code: str
    testcases: Optional[List[str]] = None

class JupyterKernelManager:
    def __init__(self):
        self.km = KernelManager(kernel_name='python3')
        self.km.start_kernel()
        self.kc = self.km.client()
        self.kc.start_channels()

    def execute_code(self, code: str):
        outputs = []
        msg_id = self.kc.execute(code)
        
        try:
            while True:
                msg = self.kc.get_iopub_msg(timeout=10)
                msg_type = msg['msg_type']
                content = msg['content']

                if msg_type == 'stream':
                    outputs.append({
                        "type": "text",
                        "content": content['text'].strip()
                    })
                
                elif msg_type == 'display_data' or msg_type == 'execute_result':
                    if 'image/png' in content.get('data', {}):
                        image_data = content['data']['image/png']
                        image_filename = f"visual_{uuid.uuid4().hex}.png"
                        image_path = f"/var/www/html/storage/app/public/visualizations/{image_filename}"
                        
                        # Decode base64 image data correctly
                        image_bytes = base64.b64decode(image_data)
                        with open(image_path, 'wb') as f:
                            f.write(image_bytes)
                        
                        outputs.append({
                            "type": "image",
                            "content": f"/storage/visualizations/{image_filename}"
                        })
                    elif 'text/plain' in content.get('data', {}):
                        outputs.append({
                            "type": "text",
                            "content": content['data']['text/plain']
                        })

                elif msg_type == 'error':
                    outputs.append({
                        "type": "error",
                        "content": '\n'.join(content['traceback'])
                    })

                if msg_type == 'status' and content['execution_state'] == 'idle':
                    break

        except Exception as e:
            outputs.append({
                "type": "error",
                "content": str(e)
            })

        return outputs

kernel_mgr = JupyterKernelManager()

@app.post("/test")
async def test_code(input: CodeInput):
    try:
        outputs = kernel_mgr.execute_code(input.code)
        
        if input.testcases:
            # Setup test environment
            setup_code = """
            import unittest
            import io
            import sys
            import json

            class TestUserCode(unittest.TestCase):
                pass
            """
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