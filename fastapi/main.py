from fastapi import FastAPI

app = FastAPI()

@app.get("/test")
def test_endpoint():
    return 'okoky'
