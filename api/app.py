from fastapi import FastAPI

app = FastAPI(title="Performance Regression Gate API")


@app.get("/health")
def health():
    return {"status": "ok"}
