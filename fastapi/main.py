from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from jupyter_client import KernelManager
from typing import Optional, List
import os
import uuid
import base64

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
            test_code = """
import unittest
class TestCode(unittest.TestCase):
    def runTest(self):
"""
            for tc in input.testcases:
                test_code += f"        {tc}\n"
            
            test_outputs = kernel_mgr.execute_code(test_code)
            outputs.extend(test_outputs)
            
        return outputs
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))