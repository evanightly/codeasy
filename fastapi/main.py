from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import subprocess
import os
import uuid
import matplotlib.pyplot as plt

app = FastAPI()

# Model untuk input request
class CodeTestInput(BaseModel):
    code: str
    testcases: list[str]  # misalnya berupa string per testcase

# Endpoint untuk menerima payload dan menjalankan eksekusi
@app.post("/test")
def test_code(input: CodeTestInput):
    outputs = []

    # 1. Simpan kode siswa ke file sementara
    code_filename = f"/tmp/student_code_{uuid.uuid4().hex}.py"
    with open(code_filename, "w") as f:
        f.write(input.code)
    
    # 2. Eksekusi kode siswa dan capture output (misalnya output print)
    try:
        proc = subprocess.run(
            ["python3", code_filename],
            capture_output=True,
            text=True,
            timeout=10
        )
        outputs.append({
            "type": "text",
            "content": proc.stdout.strip()
        })
    except Exception as e:
        outputs.append({
            "type": "text",
            "content": f"Error executing code: {str(e)}"
        })

    # 3. Jalankan testcases menggunakan unittest
    # Buat file test sementara
    test_filename = f"/tmp/test_student_code_{uuid.uuid4().hex}.py"
    with open(test_filename, "w") as f:
        # Asumsikan file kode siswa harus diimport. Kita salin file kode ke direktori sementara dengan nama 'student_code.py'
        f.write("import unittest\n")
        f.write("import importlib.util\n")
        f.write("import sys\n\n")
        f.write("# Load module dari file kode siswa\n")
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
        # Tandai sukses jika terdapat "OK" (bisa disesuaikan)
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

    # 4. Proses visualisasi: jika terdapat indikasi pemanggilan fungsi plot,
    #    FastAPI membuat file gambar di storage Laravel (misal storage/public/visualizations)
    #    Kita asumsikan visualisasi selalu dihasilkan (atau bisa dicek dari kode)
    try:
        visual_dir = "/var/www/html/storage/public/visualizations"
        if not os.path.exists(visual_dir):
            os.makedirs(visual_dir)
        # Misalnya, kita buat plot contoh (atau FastAPI bisa mengeksekusi ulang bagian kode yang menghasilkan plot)
        plt.figure()
        plt.plot([25, 231, 32])
        plt.title("Visualisasi Siswa")
        image_filename = f"visual_{uuid.uuid4().hex}.png"
        image_path = os.path.join(visual_dir, image_filename)
        plt.savefig(image_path)
        plt.close()
        # URL file gambar (asumsikan Laravel menyajikan storage/public sebagai /storage)
        outputs.append({
            "type": "image",
            "content": f"/storage/visualizations/{image_filename}"
        })
    except Exception as e:
        outputs.append({
            "type": "image",
            "content": f"Error generating visualization: {str(e)}"
        })

    # Bersihkan file sementara
    try:
        os.remove(code_filename)
        os.remove(test_filename)
    except:
        pass

    return outputs
