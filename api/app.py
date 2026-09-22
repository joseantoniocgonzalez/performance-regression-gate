import time

from fastapi import FastAPI, Query

app = FastAPI(title="Performance Regression Gate API")


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/work")
def work(mode: str = Query(default="normal")):
    if mode == "degraded":
        time.sleep(1)

    return {
        "status": "ok",
        "mode": mode,
    }
