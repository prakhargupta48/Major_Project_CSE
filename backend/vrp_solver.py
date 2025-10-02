import logging
from ortools.constraint_solver import pywrapcp, routing_enums_pb2
from math import radians, sin, cos, sqrt, atan2

def get_distance_matrix(locations):
    """Haversine formula based distance matrix"""
    def _haversine(lat1, lon1, lat2, lon2):
        R = 6371000
        dlat, dlon = radians(lat2-lat1), radians(lon2-lon1)
        a = sin(dlat/2)**2 + cos(radians(lat1))*cos(radians(lat2))*sin(dlon/2)**2
        return int(R * 2 * atan2(sqrt(a), sqrt(1-a)))

    n = len(locations)
    matrix = {}
    for i in range(n):
        matrix[i] = {}
        for j in range(n):
            if i == j: matrix[i][j] = 0
            else: matrix[i][j] = _haversine(*locations[i], *locations[j])
    return matrix

def solve_cvrp_without_restrictions(distance_matrix, vehicles, demands, location_names, time_limit_seconds=15):
    n, m = len(distance_matrix), len(vehicles)
    manager = pywrapcp.RoutingIndexManager(n, m, 0)
    routing = pywrapcp.RoutingModel(manager)

    def dist_cb(f, t): return distance_matrix[manager.IndexToNode(f)][manager.IndexToNode(t)]
    transit_idx = routing.RegisterTransitCallback(dist_cb)
    routing.SetArcCostEvaluatorOfAllVehicles(transit_idx)

    def demand_cb(f): return demands[manager.IndexToNode(f)]
    demand_idx = routing.RegisterUnaryTransitCallback(demand_cb)
    routing.AddDimensionWithVehicleCapacity(demand_idx, 0, [v["capacity"] for v in vehicles], True, "Capacity")

    params = pywrapcp.DefaultRoutingSearchParameters()
    params.time_limit.seconds = time_limit_seconds
    params.local_search_metaheuristic = routing_enums_pb2.LocalSearchMetaheuristic.GUIDED_LOCAL_SEARCH
    params.first_solution_strategy = routing_enums_pb2.FirstSolutionStrategy.PATH_CHEAPEST_ARC

    sol = routing.SolveWithParameters(params)
    if not sol: return None

    results = []
    for v_id in range(m):
        idx = routing.Start(v_id)
        if routing.IsEnd(sol.Value(routing.NextVar(idx))): continue

        path, load, dist = [], 0, 0
        while not routing.IsEnd(idx):
            node = manager.IndexToNode(idx)
            path.append(node)
            if node != 0: load += demands[node]
            idx = sol.Value(routing.NextVar(idx))
        path.append(manager.IndexToNode(idx))

        for i in range(len(path)-1):
            dist += distance_matrix[path[i]][path[i+1]]

        data = vehicles[v_id]
        if len(path) > 2:
            results.append({
                "Vehicle ID": data["id"],
                "Vehicle Type": data.get("type", "N/A"),
                "Vehicle Capacity": data["capacity"],
                "Route": " → ".join(location_names[p] for p in path),
                "Route Indices": path,
                "Load Carried": load,
                "Distance (km)": round(dist/1000, 2),
            })
    return results

def compute_route_geometries(client, locations, optimized_data):
    for route in optimized_data:
        idxs = route.get("Route Indices", [])
        if len(idxs) < 2:
            route["Route Geometry"] = []
            continue
        try:
            coords = [(locations[i][1], locations[i][0]) for i in idxs]
            res = client.directions(coords, profile='driving-car', format='geojson')
            geom = res['features'][0]['geometry']['coordinates']
            route["Route Geometry"] = [[c[1], c[0]] for c in geom]
        except:
            route["Route Geometry"] = [[locations[i][0], locations[i][1]] for i in idxs]
    return optimized_data
