from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os

app = FastAPI(title="Motion Portfolio Engine")

# Root directory path
base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Serve root HTML files
@app.get("/")
def home():
    return FileResponse(os.path.join(base_dir, "login.html"))

@app.get("/{filename}.html")
def get_html(filename: str):
    file_path = os.path.join(base_dir, f"{filename}.html")
    if os.path.exists(file_path):
        return FileResponse(file_path)
    return {"error": "Page not found"}