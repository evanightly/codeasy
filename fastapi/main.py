from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import subprocess
import os
import uuid
import matplotlib.pyplot as plt
from typing import Optional, List

app = FastAPI()

# Model untuk input request
class CodeTestInput(BaseModel):
    code: str
    testcases: Optional[List[str]] = None  # misalnya berupa string per testcase

# Endpoint untuk menerima payload dan menjalankan eksekusi

@app.post("/test")
def test_code(input: CodeTestInput):
    outputs = []

    # 1. Simpan kode siswa ke file sementara
    code_filename = f"/tmp/student_code_{uuid.uuid4().hex}.py"
    with open(code_filename, "w") as f:
        f.write(input.code)

    # 2. Eksekusi kode siswa
    try:
        proc = subprocess.run(
            ["python3", code_filename],
            capture_output=True,
            text=True,
            timeout=10
        )
        # Pisahkan stdout per baris, lalu masukkan per baris ke outputs
        lines = proc.stdout.strip().split('\n')
        for line in lines:
            outputs.append({
                "type": "text",
                "content": line
            })
    except Exception as e:
        outputs.append({
            "type": "text",
            "content": f"Error executing code: {str(e)}"
        })

    # 3. Jalankan testcases (jika ada)
    if input.testcases:
        test_filename = f"/tmp/test_student_code_{uuid.uuid4().hex}.py"
        with open(test_filename, "w") as f:
            f.write("import unittest\n")
            f.write("import importlib.util\n")
            f.write("import sys\n\n")
            f.write("spec = importlib.util.spec_from_file_location('student_code', '" + code_filename + "')\n")
            f.write("student_code = importlib.util.module_from_spec(spec)\n")
            f.write("spec.loader.exec_module(student_code)\n\n")
            f.write("class StudentCodeTest(unittest.TestCase):\n")
            for idx, tc in enumerate(input.testcases):
                f.write(f"    def test_case_{idx}(self):\n")
                f.write(f"        {tc}\n")
            f.write("\nif __name__ == '__main__':\n")
            f.write("    unittest.main()\n")

        try:
            proc_test = subprocess.run(
                ["python3", test_filename],
                capture_output=True,
                text=True,
                timeout=10
            )
            test_output = proc_test.stdout + proc_test.stderr
            success = "OK" in test_output
            outputs.append({
                "type": "testcase",
                "content": test_output.strip(),
                "success": success
            })
        except Exception as e:
            outputs.append({
                "type": "testcase",
                "content": f"Error executing testcases: {str(e)}",
                "success": False
            })

        try:
            os.remove(test_filename)
        except:
            pass

    # 4. Buat visualisasi hanya jika kode mengandung plotting
    if "plt" in input.code:
        try:
            visual_dir = "/var/www/html/storage/app/public/visualizations"
            if not os.path.exists(visual_dir):
                os.makedirs(visual_dir)

            plt.figure()
            # Eksekusi ulang kode plotting untuk mendapatkan grafik, atau buat contoh
            # Di sini, contoh mengeksekusi ulang hanya jika user menyisipkan plt
            plt.plot([25, 231, 32])
            plt.title("Visualisasi Siswa")
            image_filename = f"visual_{uuid.uuid4().hex}.png"
            image_path = os.path.join(visual_dir, image_filename)
            plt.savefig(image_path)
            plt.close()

            outputs.append({
                "type": "image",
                "content": f"/storage/visualizations/{image_filename}"
            })
        except Exception as e:
            outputs.append({
                "type": "image",
                "content": f"Error generating visualization: {str(e)}"
            })

    # Bersihkan file kode sementara
    try:
        os.remove(code_filename)
    except:
        pass

    return outputs
