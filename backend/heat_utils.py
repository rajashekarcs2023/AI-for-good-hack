import numpy as np
import random

def generate_heat_map(width=100, height=100, location="downtown"):
    """
    Generate a simulated heat map for a given location.
    
    Returns a list of [x, y, temperature] points.
    """
    heat_map = []
    
    # Create different heat patterns based on location
    if location.lower() == "downtown":
        # Downtown has concentrated heat islands
        hotspots = [
            {"x": 45, "y": 35, "intensity": 10, "radius": 30},
            {"x": 75, "y": 25, "intensity": 8, "radius": 25},
            {"x": 30, "y": 60, "intensity": 7, "radius": 20},
            {"x": 60, "y": 70, "intensity": 9, "radius": 28},
        ]
    elif location.lower() == "midtown":
        # Midtown has more distributed heat
        hotspots = [
            {"x": 30, "y": 30, "intensity": 7, "radius": 35},
            {"x": 60, "y": 40, "intensity": 6, "radius": 30},
            {"x": 45, "y": 70, "intensity": 8, "radius": 25},
        ]
    elif location.lower() == "industrial district":
        # Industrial areas have intense heat sources
        hotspots = [
            {"x": 40, "y": 40, "intensity": 12, "radius": 20},
            {"x": 70, "y": 30, "intensity": 11, "radius": 15},
            {"x": 50, "y": 60, "intensity": 10, "radius": 25},
            {"x": 20, "y": 70, "intensity": 9, "radius": 18},
        ]
    else:
        # Default pattern for other areas
        hotspots = [
            {"x": 50, "y": 50, "intensity": 8, "radius": 40},
            {"x": 30, "y": 30, "intensity": 6, "radius": 25},
            {"x": 70, "y": 70, "intensity": 7, "radius": 30},
        ]
    
    # Generate points with base temperature + hotspot effects
    for x in range(width):
        for y in range(height):
            # Base temperature (28-30°C)
            temp = 28 + random.random() * 2
            
            # Add heat from hotspots
            for spot in hotspots:
                distance = np.sqrt((x - spot["x"])**2 + (y - spot["y"])**2)
                if distance < spot["radius"]:
                    # Heat diminishes with distance from center
                    temp += spot["intensity"] * (1 - distance / spot["radius"])
            
            # Add some random variation (±1°C)
            temp += random.random() * 2 - 1
            
            heat_map.append([x, y, temp])
    
    return heat_map

def apply_interventions(base_heat_map, interventions):
    """
    Apply cooling interventions to a heat map.
    
    Args:
        base_heat_map: List of [x, y, temperature] points
        interventions: List of intervention objects with type, x, y
        
    Returns:
        Tuple of (modified heat map, statistics dictionary)
    """
    # Define intervention effects
    effects = {
        'trees': {"radius": 15, "cooling": -0.5, "cost": 500},
        'roofs': {"radius": 10, "cooling": -0.3, "cost": 1200},
        'green': {"radius": 20, "cooling": -0.7, "cost": 2000},
        'water': {"radius": 25, "cooling": -0.8, "cost": 5000},
        'shade': {"radius": 12, "cooling": -0.4, "cost": 3000},
    }
    
    # Deep copy the original heat map
    new_heat_map = [point.copy() for point in base_heat_map]
    
    # Calculate statistics
    total_cost = 0
    max_temp_reduction = 0
    total_reduction = 0
    
    # Apply each intervention's effect
    for intervention in interventions:
        intervention_type = intervention.get("type")
        if intervention_type not in effects:
            continue
            
        effect = effects[intervention_type]
        total_cost += effect["cost"]
        
        # Get coordinates
        center_x = intervention.get("x", 0)
        center_y = intervention.get("y", 0)
        
        # For percentage coordinates (0-100), convert to absolute
        if center_x <= 100 and isinstance(center_x, float):
            center_x = center_x * len(new_heat_map) / 100
        if center_y <= 100 and isinstance(center_y, float):
            center_y = center_y * len(new_heat_map) / 100
        
        # Apply cooling effect to points within radius
        for i, point in enumerate(new_heat_map):
            x, y, temp = point
            distance = np.sqrt((x - center_x)**2 + (y - center_y)**2)
            
            if distance <= effect["radius"]:
                # Cooling effect diminishes with distance
                cooling = effect["cooling"] * (1 - distance/effect["radius"])
                new_heat_map[i][2] += cooling
                
                # Track statistics
                total_reduction -= cooling  # negative because cooling reduces temperature
                max_temp_reduction = max(max_temp_reduction, -cooling)
    
    # Calculate average reduction
    avg_reduction = total_reduction / len(new_heat_map) if interventions else 0
    
    # Generate statistics
    statistics = {
        "totalCost": total_cost,
        "maxTempReduction": max_temp_reduction,
        "averageTempReduction": avg_reduction,
        "energySavings": round(total_cost * 0.15),  # Estimated energy savings
        "healthBenefits": round(total_cost * 0.25)  # Estimated health benefits
    }
    
    return new_heat_map, statistics