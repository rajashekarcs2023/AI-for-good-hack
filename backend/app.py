from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import os
import json
import numpy as np
from dotenv import load_dotenv
import asyncio
import random

# Import utility modules
from heat_utils import generate_heat_map, apply_interventions
from mock_data import get_similar_areas, get_recommendations, get_graph_relationships
from graphrag import GraphRAGSystem, init_neo4j_driver

# Load environment variables
load_dotenv()
try:
    import groq
    groq_client = groq.Groq(api_key=os.getenv("GROQ_API_KEY"))
except:
    print("Warning: Groq API integration failed. Voice commands will be simulated.")
    groq_client = None

# Initialize Neo4j driver
neo4j_driver = init_neo4j_driver()

# Initialize GraphRAG system
use_actual_graphrag = bool(neo4j_driver) and os.getenv("QDRANT_URL")
if use_actual_graphrag:
    print("Initializing actual GraphRAG with Neo4j and Qdrant...")
    graphrag_system = GraphRAGSystem(
        neo4j_driver=neo4j_driver,
        qdrant_url=os.getenv("QDRANT_URL"),
        qdrant_key=os.getenv("QDRANT_KEY")
    )
else:
    print("Using simulated GraphRAG functionality.")
    graphrag_system = GraphRAGSystem()

# Create FastAPI app
app = FastAPI(title="UrbanShade API")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For production, specify your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Clean up resources on shutdown
@app.on_event("shutdown")
async def shutdown_event():
    if neo4j_driver:
        neo4j_driver.close()

# Pydantic models for request/response validation
class HeatmapParams(BaseModel):
    location: Optional[str] = "downtown"

class InterventionPoint(BaseModel):
    type: str
    x: float
    y: float

class SimulationRequest(BaseModel):
    location: str
    interventions: List[InterventionPoint]
    baseHeatMap: Optional[List[List[float]]] = None

class VoiceRequest(BaseModel):
    text: str

class GraphRAGRequest(BaseModel):
    query: str

class AnalysisRequest(BaseModel):
    location: str
    interventions: List[InterventionPoint]
    filters: Optional[Dict[str, bool]] = None

# API Routes
@app.get("/")
async def root():
    return {"message": "UrbanShade API is running. See /docs for API documentation."}

@app.get("/api/heatmap")
async def get_heatmap(location: str = "downtown"):
    """
    Generate a heat map for the specified location.
    """
    try:
        heat_map = generate_heat_map(location=location)
        return {
            "location": location,
            "baseTemperature": 32.5,
            "heatMap": heat_map
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating heat map: {str(e)}")

@app.post("/api/simulate")
async def run_simulation(request: SimulationRequest):
    """
    Simulate the effect of interventions on urban heat.
    """
    try:
        # If no base heat map is provided, generate one
        if not request.baseHeatMap or len(request.baseHeatMap) == 0:
            base_heat_map = generate_heat_map(location=request.location)
        else:
            base_heat_map = request.baseHeatMap
        
        # Apply interventions to the heat map
        new_heat_map, statistics = apply_interventions(
            base_heat_map, 
            [intervention.dict() for intervention in request.interventions]
        )
        
        return {
            "newHeatMap": new_heat_map,
            "statistics": statistics
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Simulation failed: {str(e)}")

@app.post("/api/voice")
async def process_voice(request: VoiceRequest):
    """
    Process voice commands and return appropriate responses.
    """
    try:
        # Check for common query patterns
        common_responses = {
            "where should we add trees": {
                "response": "Based on our knowledge graph analysis, adding trees along Main Street and around the central plaza would have the greatest cooling impact. The graph shows strong connections between these areas and peak temperature nodes. Vector similarity with successful projects in Barcelona suggests these placements could reduce temperatures by up to 5°C.",
                "action": "highlight",
                "parameters": {"areas": [[25, 50], [60, 30], [40, 70]], "type": "trees"}
            },
            "show hottest areas": {
                "response": "The knowledge graph identifies the central parking lot and commercial zone to the northeast as critical heat nodes with multiple amplifying connections. These areas show surface temperatures reaching 45°C during peak hours according to our vector database of thermal imagery.",
                "action": "highlight",
                "parameters": {"areas": [[45, 35], [75, 25]], "type": "heat"}
            },
            "compare cool roofs and trees": {
                "response": "Our GraphRAG analysis shows that trees provide more cooling per dollar invested than cool roofs in this specific urban context. The knowledge graph reveals trees have stronger cooling relationships with pedestrian areas, while vector similarity with 24 case studies indicates trees offer an average of 3°C reduction versus 1.5°C for cool roofs. However, cool roofs can be implemented on existing buildings without taking up ground space.",
                "action": "compare",
                "parameters": {"interventions": ["trees", "roofs"]}
            }
        }
        
        # Check if this is a common query
        for key, value in common_responses.items():
            if key in request.text.lower():
                return value
        
        # Use Groq API for processing if available
        if groq_client:
            system_prompt = """You are Shade Guide, an AI assistant for the UrbanShade urban heat mitigation planning tool 
            powered by GraphRAG technology, which combines knowledge graphs with vector search.

            Your role is to help urban planners identify optimal cooling interventions for cities experiencing urban heat island effects.

            Respond in JSON format with the following structure:
            {
              "response": "Your detailed response text here",
              "action": "One of: highlight, compare, recommend, or none",
              "parameters": {
                // Action-specific parameters:
                // For highlight: areas (array of coordinates), type (string)
                // For compare: interventions (array of strings)
                // For recommend: interventionType (string), locations (array)
              }
            }

            Your responses should mention both knowledge graph relationships and vector similarity where relevant.
            For example: "According to our knowledge graph, trees planted along southern exposures are connected to a 30% greater cooling effect" or
            "Vector similarity analysis shows this area is most comparable to Barcelona's La Rambla district, which achieved a 4°C reduction through similar interventions."

            Keep responses focused on urban heat mitigation strategies including:
            - Tree placement and green spaces
            - Cool roofs and reflective surfaces
            - Water features
            - Shade structures
            - Permeable pavements

            Base your recommendations on established urban cooling research."""
            
            try:
                completion = await asyncio.to_thread(
                    groq_client.chat.completions.create,
                    messages=[
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": request.text}
                    ],
                    model="llama3-8b-8192",
                    response_format={"type": "json_object"}
                )
                
                response_content = completion.choices[0].message.content
                return json.loads(response_content)
            except Exception as e:
                print(f"Groq error: {e}")
                # Fall back to simulated response if Groq fails
        
        # Use simulated responses when Groq is unavailable
        simulated_responses = [
            {
                "response": "Based on my analysis of the urban heat patterns, the most effective intervention would be to create a network of shade trees along Main Street. This could reduce temperatures by approximately 2.8°C during peak hours. The knowledge graph shows a strong cooling relationship between mature trees and pedestrian corridors.",
                "action": "highlight",
                "parameters": {"areas": [[30, 40], [50, 45]], "type": "trees"}
            },
            {
                "response": "The commercial district would benefit most from a combination of cool roofs and vertical gardens. Our vector similarity analysis found comparable implementations in Madrid that achieved a 3.2°C reduction in surface temperatures. The graph data suggests this area is a critical heat node affecting surrounding neighborhoods.",
                "action": "highlight",
                "parameters": {"areas": [[60, 30]], "type": "roofs"}
            },
            {
                "response": "For optimal cooling with your budget constraints, I'd recommend focusing on the central plaza area. The knowledge graph indicates this is a key connection point between multiple heat corridors. Similar urban spaces in Melbourne implemented permeable paving and shade structures to achieve a 4°C temperature reduction.",
                "action": "highlight",
                "parameters": {"areas": [[45, 50]], "type": "shade"}
            }
        ]
        
        return random.choice(simulated_responses)
        
    except Exception as e:
        print(f"Error processing voice command: {e}")
        return {
            "response": "I'm sorry, I couldn't process that request. Could you try asking in a different way?",
            "action": "none",
            "parameters": {}
        }

@app.post("/api/graphrag")
async def query_graphrag(request: GraphRAGRequest):
    """
    Process a query through the GraphRAG system.
    """
    try:
        if graphrag_system and use_actual_graphrag:
            # Use actual GraphRAG if available
            response = await asyncio.to_thread(graphrag_system.query, request.query)
            return {"response": response}
        else:
            # Simulate GraphRAG response
            simulated_responses = [
                "Based on our knowledge graph analysis of urban heat patterns, strategic tree placement along southern exposures provides the most effective cooling per investment dollar. Vector similarity with 24 case studies from Mediterranean cities shows an average temperature reduction of 3.2°C when trees are placed to maximize afternoon shade. The graph relationships indicate strong cooling connections between mature trees and pedestrian areas.",
                
                "The knowledge graph shows that commercial districts with high building density create the most significant heat islands in your urban context. Similar urban areas in our vector database have successfully implemented a combination of cool roofs (reducing temperatures by 1.5°C) and green corridors (additional 2.1°C reduction). The graph structure reveals that interventions in this district would propagate cooling effects to surrounding residential areas.",
                
                "Analysis of your city's thermal patterns through our knowledge graph reveals that interconnected interventions are more effective than isolated ones. Successful case studies with 87% vector similarity to your urban morphology demonstrate that creating 'cool pathways' connecting parks, water features, and tree-lined streets can reduce temperatures by up to 4.5°C while improving pedestrian comfort by 60%."
            ]
            
            return {"response": random.choice(simulated_responses)}
            
    except Exception as e:
        return {"response": f"Error processing GraphRAG query: {str(e)}"}

@app.post("/api/analysis")
async def run_analysis(request: AnalysisRequest):
    """
    Run advanced analysis on the urban area and provide recommendations.
    """
    try:
        # Apply filters if provided
        filters = request.filters or {}
        
        # Get similar areas data
        similar_areas = get_similar_areas(request.location)
        
        # Get recommendations
        recommendations = get_recommendations(request.location)
        
        # Get graph relationships
        relationships = get_graph_relationships(request.location)
        
        # Simulate processing delay
        await asyncio.sleep(2)
        
        return {
            "similarAreas": similar_areas,
            "recommendations": recommendations,
            "structuralInsights": relationships
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

# Run the app with uvicorn
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)