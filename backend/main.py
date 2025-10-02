import os
import logging
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional
from dotenv import load_dotenv
import openrouteservice
from openrouteservice.exceptions import ApiError
from fastapi.encoders import jsonable_encoder
from fastapi.responses import RedirectResponse

# Import solver functions
from vrp_solver import get_distance_matrix, solve_cvrp_without_restrictions, compute_route_geometries

# Logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# Load env vars
from dotenv import load_dotenv
import os

load_dotenv()  # optional in Render
ORS_API_KEY = os.getenv("ORS_API_KEY")

if not ORS_API_KEY:
    raise RuntimeError("ORS_API_KEY not set")


# FastAPI app
app = FastAPI()

# ---------- Root & Health ----------
@app.get("/")
def read_root():
    return {"status": "ok", "message": "Backend is running on Render!"}

@app.head("/")
def root_head():
    return {"status": "ok"}

@app.get("/health")
def health():
    return {"status": "healthy"}
from fastapi.responses import RedirectResponse

from fastapi import Request

@app.post("/")
async def root_post(request: Request):
    return {"status": "error", "message": "Use POST /optimize instead"}

# ---------- CORS ----------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # update with your frontend domain in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------- Pydantic Models ----------
class Location(BaseModel):
    name: str
    latitude: float
    longitude: float

class Vehicle(BaseModel):
    id: str
    capacity: int
    fuel_cost_per_km: Optional[float] = None
    driver_cost_per_km: Optional[float] = None
    type: Optional[str] = None

class OptimizeRequest(BaseModel):
    locations: List[Location] = Field(..., min_items=2, description="List of locations. First must be depot.")
    vehicles: List[Vehicle] = Field(..., min_items=1)
    demands: List[int]
    include_geometry: Optional[bool] = True
    time_limit_seconds: Optional[int] = 15

# ---------- API Endpoint ----------
@app.post("/optimize")
def optimize(req: OptimizeRequest):
    if not ORS_API_KEY:
        raise HTTPException(status_code=500, detail="ORS_API_KEY not set")

    if len(req.demands) != len(req.locations):
        raise HTTPException(status_code=400, detail="Mismatch between demands and locations")

    if req.demands[0] != 0:
        raise HTTPException(status_code=400, detail="Depot must have 0 demand")

    vehicle_capacities = [v.capacity for v in req.vehicles]
    if any(d > max(vehicle_capacities) for d in req.demands):
        raise HTTPException(status_code=400, detail="Some demand exceeds vehicle capacity")

    try:
        client = openrouteservice.Client(key=ORS_API_KEY)
        locations_coords = [(loc.latitude, loc.longitude) for loc in req.locations]
        location_names = [loc.name for loc in req.locations]
        vehicles_dict = jsonable_encoder(req.vehicles)

        distance_matrix = get_distance_matrix(locations_coords)
        optimized = solve_cvrp_without_restrictions(
            distance_matrix,
            vehicles_dict,
            req.demands,
            location_names,
            time_limit_seconds=req.time_limit_seconds
        )

        if not optimized:
            raise HTTPException(status_code=500, detail="No solution found")

        if req.include_geometry:
            optimized = compute_route_geometries(client, locations_coords, optimized)

        return jsonable_encoder({
            "result": optimized,
            "summary": {
                "vehicles_used": len(optimized),
                "total_distance_km": round(sum(v.get("Distance (km)", 0) for v in optimized), 2),
                "total_load": sum(v.get("Load Carried", 0) for v in optimized)
            }
        })
    except ApiError as e:
        raise HTTPException(status_code=503, detail=f"ORS API error: {e}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unexpected error: {e}")
