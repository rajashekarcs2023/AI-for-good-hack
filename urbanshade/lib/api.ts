// lib/api.ts

// Base URL for the Python backend
const API_BASE_URL = 'http://localhost:8000';

// Default data to use if API calls fail
const DEFAULT_HEAT_MAP = Array.from({ length: 100 }, (_, i) => {
  return Array.from({ length: 100 }, (_, j) => {
    const x = i;
    const y = j;
    // Generate a simple heat pattern for visualization
    const distFromCenter = Math.sqrt(Math.pow(x - 50, 2) + Math.pow(y - 50, 2));
    const temp = 30 + 10 * Math.exp(-distFromCenter / 20) + Math.random() * 2;
    return [x, y, temp];
  });
}).flat();

// Fetch initial heat map data
export async function fetchHeatMap(location: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/heatmap?location=${location.toLowerCase()}`);
    if (!response.ok) throw new Error('Failed to fetch heat map');
    return await response.json();
  } catch (error) {
    console.error("Heat map API error:", error);
    // Return fallback data
    return {
      location,
      baseTemperature: 32.5,
      heatMap: DEFAULT_HEAT_MAP
    };
  }
}

// Run simulation with interventions
export async function runSimulation(location: string, interventions: any[], baseHeatMap: any[]) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/simulate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        location,
        interventions,
        baseHeatMap
      })
    });
    
    if (!response.ok) throw new Error('Simulation failed');
    return await response.json();
  } catch (error) {
    console.error("Simulation API error:", error);
    
    // Generate simple response with dummy data
    let totalCost = 0;
    let totalCooling = 0;
    
    interventions.forEach(intervention => {
      const costs = {
        'trees': 500,
        'roofs': 5000,
        'green': 10000,
        'water': 15000,
        'shade': 8000
      };
      
      const cooling = {
        'trees': 0.2,
        'roofs': 0.5,
        'green': 0.8,
        'water': 1.0,
        'shade': 0.6
      };
      
      totalCost += costs[intervention.type as keyof typeof costs] || 0;
      totalCooling += cooling[intervention.type as keyof typeof cooling] || 0;
    });
    
    return {
      newHeatMap: baseHeatMap,
      statistics: {
        totalCost,
        maxTempReduction: totalCooling,
        averageTempReduction: totalCooling,
        energySavings: Math.round(totalCost * 0.15),
        healthBenefits: Math.round(totalCost * 0.25)
      }
    };
  }
}

// Run advanced analysis
export async function runAdvancedAnalysis(location: string, interventions: any[], filters: any = {}) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/analysis`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        location,
        interventions,
        filters
      })
    });
    
    if (!response.ok) throw new Error('Analysis failed');
    return await response.json();
  } catch (error) {
    console.error("Analysis API error:", error);
    
    // Return default mock data
    return {
      similarAreas: [
        { name: "Phoenix - Roosevelt Row", image: "/placeholder.svg?height=100&width=150", reduction: "3.2°C" },
        { name: "Madrid - Lavapiés", image: "/placeholder.svg?height=100&width=150", reduction: "2.8°C" },
        { name: "Melbourne - CBD", image: "/placeholder.svg?height=100&width=150", reduction: "2.5°C" },
        { name: "Seoul - Gangnam", image: "/placeholder.svg?height=100&width=150", reduction: "2.1°C" },
      ],
      structuralInsights: [
        {"source": "Central Plaza", "target": "Business District", "relationship": "COOLS", "strength": 0.7},
        {"source": "Main Street", "target": "Residential Area", "relationship": "HEAT_CORRIDOR", "strength": 0.9},
        {"source": "Shopping Mall", "target": "Parking Lot", "relationship": "AMPLIFIES_HEAT", "strength": 0.8}
      ],
      recommendations: [
        {
          title: "Strategic Tree Placement",
          description: "Place trees along southern building facades for maximum shade impact",
          confidence: 92,
          graphScore: 87,
          vectorScore: 94,
          type: "trees",
          locations: [[25, 50], [60, 30], [40, 70]]
        },
        {
          title: "Green Roof Network",
          description: "Connect green roofs on adjacent buildings to create cooling corridors",
          confidence: 85,
          graphScore: 91,
          vectorScore: 82,
          type: "roofs",
          locations: [[35, 40], [55, 45]]
        },
        {
          title: "Water Feature Placement",
          description: "Add water features to central gathering areas for evaporative cooling",
          confidence: 79,
          graphScore: 75,
          vectorScore: 81,
          type: "water",
          locations: [[50, 50]]
        }
      ]
    };
  }
}

// Process voice command
export async function processVoiceCommand(text: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/voice`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text })
    });
    
    if (!response.ok) throw new Error('Voice processing failed');
    return await response.json();
  } catch (error) {
    console.error("Voice API error:", error);
    
    // Generate simple response based on keywords
    let response = "I'm sorry, I couldn't process that request. The voice service might be unavailable.";
    let action = "none";
    let parameters = {};
    
    if (text.includes("hottest areas")) {
      response = "Based on our thermal analysis, the hottest areas are concentrated around the central business district. These areas show temperatures up to 4.2°C higher than surrounding neighborhoods due to high building density and dark surface materials.";
      action = "highlight";
      parameters = { areas: [[45, 35]], type: "heat" };
    } else if (text.includes("trees")) {
      response = "For maximum cooling impact, I recommend adding trees along the southern edge of Central Plaza. This strategic placement would provide shade during peak heat hours.";
      action = "highlight";
      parameters = { areas: [[60, 50], [30, 60]], type: "trees" };
    }
    
    return { response, action, parameters };
  }
}

// Query GraphRAG
export async function queryGraphRAG(query: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/graphrag`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query })
    });
    
    if (!response.ok) throw new Error('GraphRAG query failed');
    return await response.json();
  } catch (error) {
    console.error("GraphRAG API error:", error);
    
    return {
      response: "Based on our knowledge graph analysis, urban areas with similar building density and climate profiles have achieved significant cooling through strategic tree placement and cool roof implementation. Vector similarity analysis with case studies from Mediterranean cities suggests a potential temperature reduction of 2.8-3.5°C with these combined interventions."
    };
  }
}