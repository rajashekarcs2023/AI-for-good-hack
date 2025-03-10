def get_similar_areas(location):
    """
    Return mock data for similar urban areas based on location.
    """
    area_data = {
        "downtown": [
            {"name": "Barcelona - Gothic Quarter", "image": "/placeholder.svg?height=100&width=150", "reduction": "3.2°C"},
            {"name": "Madrid - Lavapiés", "image": "/placeholder.svg?height=100&width=150", "reduction": "2.8°C"},
            {"name": "Melbourne - CBD", "image": "/placeholder.svg?height=100&width=150", "reduction": "2.5°C"},
            {"name": "Seoul - Gangnam", "image": "/placeholder.svg?height=100&width=150", "reduction": "2.1°C"},
        ],
        "midtown": [
            {"name": "Paris - Montmartre", "image": "/placeholder.svg?height=100&width=150", "reduction": "2.9°C"},
            {"name": "Chicago - Loop", "image": "/placeholder.svg?height=100&width=150", "reduction": "3.1°C"},
            {"name": "Tokyo - Shibuya", "image": "/placeholder.svg?height=100&width=150", "reduction": "2.4°C"},
            {"name": "Berlin - Mitte", "image": "/placeholder.svg?height=100&width=150", "reduction": "2.6°C"},
        ],
        "industrial district": [
            {"name": "Rotterdam - Port", "image": "/placeholder.svg?height=100&width=150", "reduction": "4.1°C"},
            {"name": "Detroit - Rivertown", "image": "/placeholder.svg?height=100&width=150", "reduction": "3.8°C"},
            {"name": "Shanghai - Pudong", "image": "/placeholder.svg?height=100&width=150", "reduction": "3.5°C"},
            {"name": "Hamburg - HafenCity", "image": "/placeholder.svg?height=100&width=150", "reduction": "3.2°C"},
        ]
    }
    
    return area_data.get(location.lower(), area_data["downtown"])

def get_recommendations(location):
    """
    Return mock recommendations based on location.
    """
    recommendations = {
        "downtown": [
            {
                "title": "Strategic Tree Placement",
                "description": "Place trees along southern building facades for maximum shade impact",
                "confidence": 92,
                "graphScore": 87,
                "vectorScore": 94,
                "type": "trees",
                "locations": [[25, 50], [60, 30], [40, 70]]
            },
            {
                "title": "Green Roof Network",
                "description": "Connect green roofs on adjacent buildings to create cooling corridors",
                "confidence": 85,
                "graphScore": 91,
                "vectorScore": 82,
                "type": "roofs",
                "locations": [[35, 40], [55, 45]]
            },
            {
                "title": "Water Feature Placement",
                "description": "Add water features to central gathering areas for evaporative cooling",
                "confidence": 79,
                "graphScore": 75,
                "vectorScore": 81,
                "type": "water",
                "locations": [[50, 50]]
            }
        ],
        "midtown": [
            {
                "title": "Green Corridor Development",
                "description": "Create connected green spaces along main pedestrian routes",
                "confidence": 88,
                "graphScore": 85,
                "vectorScore": 91,
                "type": "green",
                "locations": [[30, 30], [45, 45], [60, 60]]
            },
            {
                "title": "Reflective Pavement",
                "description": "Replace dark asphalt with high-albedo materials in high-traffic areas",
                "confidence": 82,
                "graphScore": 79,
                "vectorScore": 84,
                "type": "roofs",
                "locations": [[40, 50], [60, 40]]
            },
            {
                "title": "Pocket Parks",
                "description": "Convert small unused spaces into vegetated areas",
                "confidence": 76,
                "graphScore": 72,
                "vectorScore": 79,
                "type": "green",
                "locations": [[35, 65], [70, 30]]
            }
        ],
        "industrial district": [
            {
                "title": "Cool Roof Implementation",
                "description": "Apply reflective coatings to large warehouse roofs",
                "confidence": 94,
                "graphScore": 91,
                "vectorScore": 97,
                "type": "roofs",
                "locations": [[40, 40], [70, 30], [50, 60]]
            },
            {
                "title": "Perimeter Vegetation",
                "description": "Create dense tree buffers around industrial facilities",
                "confidence": 89,
                "graphScore": 87,
                "vectorScore": 90,
                "type": "trees",
                "locations": [[30, 30], [60, 60], [20, 70]]
            },
            {
                "title": "Permeable Parking Areas",
                "description": "Convert employee parking to water-permeable surfaces",
                "confidence": 83,
                "graphScore": 80,
                "vectorScore": 85,
                "type": "green",
                "locations": [[45, 45], [65, 25]]
            }
        ]
    }
    
    return recommendations.get(location.lower(), recommendations["downtown"])

def get_graph_relationships(location):
    """
    Return mock graph relationships based on location.
    """
    relationships = {
        "downtown": [
            {"source": "Central Plaza", "target": "Business District", "relationship": "COOLS", "strength": 0.7},
            {"source": "Main Street", "target": "Residential Area", "relationship": "HEAT_CORRIDOR", "strength": 0.9},
            {"source": "Shopping Mall", "target": "Parking Lot", "relationship": "AMPLIFIES_HEAT", "strength": 0.8}
        ],
        "midtown": [
            {"source": "Park Avenue", "target": "Residential Towers", "relationship": "COOLS", "strength": 0.6},
            {"source": "Transit Hub", "target": "Commercial District", "relationship": "AMPLIFIES_HEAT", "strength": 0.8},
            {"source": "Green Belt", "target": "Office Buildings", "relationship": "REDUCES_TEMPERATURE", "strength": 0.7}
        ],
        "industrial district": [
            {"source": "Factory Complex", "target": "Worker Housing", "relationship": "HEAT_SOURCE", "strength": 0.9},
            {"source": "Rail Yard", "target": "Storage Facilities", "relationship": "AMPLIFIES_HEAT", "strength": 0.8},
            {"source": "Riverfront", "target": "Industrial Zone", "relationship": "COOLS", "strength": 0.6}
        ]
    }
    
    return relationships.get(location.lower(), relationships["downtown"])