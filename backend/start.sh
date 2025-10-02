#!/bin/bash
# Load environment variables (only needed if using .env locally)
export ORS_API_KEY=$ORS_API_KEY

# Start FastAPI using the port Render provides
uvicorn main:app --host 0.0.0.0 --port $PORT
