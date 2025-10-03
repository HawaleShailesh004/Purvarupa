# Import the main FastAPI app
from main import app

# This file exists for compatibility with existing infrastructure
# The actual app is defined in main.py

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)