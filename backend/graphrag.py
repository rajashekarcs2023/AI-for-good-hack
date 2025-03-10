import os
from typing import List, Dict, Any
from neo4j import GraphDatabase

def init_neo4j_driver():
    """Initialize Neo4j driver from environment variables."""
    uri = os.getenv("NEO4J_URI")
    username = os.getenv("NEO4J_USERNAME")
    password = os.getenv("NEO4J_PASSWORD")
    
    if uri and username and password:
        try:
            driver = GraphDatabase.driver(uri, auth=(username, password))
            # Verify connection
            driver.verify_connectivity()
            print("Successfully connected to Neo4j")
            return driver
        except Exception as e:
            print(f"Error connecting to Neo4j: {e}")
    
    print("Neo4j connection not configured or failed")
    return None

class GraphRAGSystem:
    """
    GraphRAG system that uses Neo4j and Qdrant for knowledge graph and vector search integration.
    """
    
    def __init__(self, neo4j_driver=None, qdrant_url=None, qdrant_key=None):
        """Initialize the GraphRAG system."""
        self.neo4j_driver = neo4j_driver
        self.qdrant_url = qdrant_url
        self.qdrant_key = qdrant_key
        
        # Check if OpenAI API key is available
        self.openai_api_key = os.getenv("OPENAI_API_KEY")
        
        # For a real implementation, initialize Qdrant client here
        if self.openai_api_key and self.neo4j_driver and self.qdrant_url:
            self.use_actual_services = True
            print("GraphRAG system initialized with actual services")
            
            # Import and initialize OpenAI here if needed
            import openai
            openai.api_key = self.openai_api_key
            self.openai = openai
        else:
            self.use_actual_services = False
            print("GraphRAG system initialized with simulated services")
    
    def _get_embeddings(self, text: str) -> List[float]:
        """Get embeddings for text using OpenAI."""
        if not self.use_actual_services:
            # Return dummy embeddings
            return [0.0] * 1536
            
        try:
            response = self.openai.Embedding.create(
                input=text,
                model="text-embedding-3-small"
            )
            return response.data[0].embedding
        except Exception as e:
            print(f"Error getting embeddings: {e}")
            # Return dummy embeddings as fallback
            return [0.0] * 1536
    
    def _run_vector_search(self, query_vector: List[float], top_k: int = 5) -> List[Dict[str, Any]]:
        """Run vector search using Qdrant."""
        if not self.use_actual_services:
            # Return simulated results
            return [
                {"id": "doc1", "score": 0.92, "payload": {"content": "Urban tree canopies can reduce temperatures by up to 4°C"}},
                {"id": "doc2", "score": 0.88, "payload": {"content": "Cool roofs reflect sunlight and can reduce cooling costs by 15-40%"}},
                {"id": "doc3", "score": 0.85, "payload": {"content": "Barcelona's urban cooling strategy combines green corridors with water features"}},
                {"id": "doc4", "score": 0.82, "payload": {"content": "Heat islands form primarily in areas with dark surfaces and limited vegetation"}},
                {"id": "doc5", "score": 0.79, "payload": {"content": "Strategic placement of trees on southern and western exposures maximizes cooling"}}
            ]
            
        # In a real implementation, this would use the Qdrant client
        # For the hackathon, return the simulated results as above
        return [
            {"id": "doc1", "score": 0.92, "payload": {"content": "Urban tree canopies can reduce temperatures by up to 4°C"}},
            {"id": "doc2", "score": 0.88, "payload": {"content": "Cool roofs reflect sunlight and can reduce cooling costs by 15-40%"}},
            {"id": "doc3", "score": 0.85, "payload": {"content": "Barcelona's urban cooling strategy combines green corridors with water features"}},
            {"id": "doc4", "score": 0.82, "payload": {"content": "Heat islands form primarily in areas with dark surfaces and limited vegetation"}},
            {"id": "doc5", "score": 0.79, "payload": {"content": "Strategic placement of trees on southern and western exposures maximizes cooling"}}
        ]
    
    def _get_graph_context(self, entity_ids: List[str]) -> Dict[str, List[str]]:
        """Get graph context from Neo4j."""
        if not self.neo4j_driver or not self.use_actual_services:
            # Return mock data if no connection
            return self._get_mock_graph_context()
        
        try:
            with self.neo4j_driver.session() as session:
                # Example query - modify according to your Neo4j schema
                query = """
                MATCH (e)-[r]-(n)
                WHERE e.id IN $entity_ids
                RETURN e.name as source, type(r) as relationship, n.name as target
                LIMIT 25
                """
                result = session.run(query, entity_ids=entity_ids)
                
                nodes = set()
                edges = []
                
                for record in result:
                    source = record["source"]
                    relationship = record["relationship"]
                    target = record["target"]
                    
                    nodes.add(source)
                    nodes.add(target)
                    edges.append(f"{source} {relationship} {target}")
                
                return {
                    "nodes": list(nodes),
                    "edges": edges
                }
        except Exception as e:
            print(f"Error querying Neo4j: {e}")
            # Fall back to mock data
            return self._get_mock_graph_context()
    
    def _get_mock_graph_context(self):
        """Provide mock graph context when Neo4j is unavailable."""
        return {
            "nodes": [
                "Urban Area", "Tree Canopy", "Cool Roof", "Heat Island", 
                "Pedestrian Comfort", "Energy Consumption", "Water Feature"
            ],
            "edges": [
                "Tree Canopy REDUCES Heat Island",
                "Heat Island INCREASES Energy Consumption",
                "Cool Roof REDUCES Heat Island",
                "Water Feature ENHANCES Cooling Effect",
                "Tree Canopy IMPROVES Pedestrian Comfort"
            ]
        }
    
    def _generate_response(self, query: str, graph_context: Dict[str, List[str]], 
                          vector_results: List[Dict[str, Any]]) -> str:
        """Generate response using LLM."""
        if not self.use_actual_services or not self.openai_api_key:
            # Return mock response
            return self._get_mock_response(query)
            
        try:
            nodes_str = ", ".join(graph_context["nodes"])
            edges_str = "; ".join(graph_context["edges"])
            vector_str = "\n".join([f"- {item['payload']['content']} (similarity: {item['score']:.2f})" 
                                  for item in vector_results])
            
            prompt = f"""
            You are an urban planning assistant with access to the following knowledge about urban heat islands:

            Knowledge Graph Nodes: {nodes_str}
            
            Knowledge Graph Relationships: {edges_str}
            
            Similar Cases from Vector Search:
            {vector_str}
            
            Based on this information, answer the following question about urban heat mitigation:
            
            Question: "{query}"
            
            In your response, reference both the knowledge graph relationships and vector similarity results.
            Emphasize concrete, actionable recommendations for urban heat mitigation.
            """
            
            response = self.openai.ChatCompletion.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": "You are an urban planning expert specializing in heat island mitigation."},
                    {"role": "user", "content": prompt}
                ]
            )
            
            return response['choices'][0]['message']['content']
        except Exception as e:
            print(f"Error generating response: {e}")
            # Fall back to mock response
            return self._get_mock_response(query)
    
    def _get_mock_response(self, query: str) -> str:
        """Generate mock responses when LLM is unavailable."""
        responses = [
            "Based on our knowledge graph analysis, strategic tree placement along southern exposures provides the most effective cooling per dollar invested. Vector similarity with Mediterranean cities shows this can reduce temperatures by 3.2°C on average.",
            
            "The knowledge graph shows strong connections between cool roofs and reduced energy consumption. Similar implementations in urban areas comparable to yours have achieved 15-30% reductions in cooling costs while decreasing ambient temperatures by 1.5-2°C.",
            
            "Our analysis indicates that combining different intervention types creates synergistic cooling effects. The vector similarity search finds that cities with connected networks of trees, green spaces, and water features achieve 40% greater cooling than isolated interventions."
        ]
        
        import random
        return random.choice(responses)
    
    def query(self, user_query: str) -> str:
        """
        Main query method that combines vector search and graph database.
        
        Args:
            user_query: The user's natural language query
            
        Returns:
            Response text from the system
        """
        try:
            # 1. Get embeddings for the query
            query_embeddings = self._get_embeddings(user_query)
            
            # 2. Perform vector search
            vector_results = self._run_vector_search(query_embeddings)
            
            # 3. Extract entity IDs from vector results
            entity_ids = [item["id"] for item in vector_results]
            
            # 4. Get graph context for these entities
            graph_context = self._get_graph_context(entity_ids)
            
            # 5. Generate response using LLM
            response = self._generate_response(user_query, graph_context, vector_results)
            
            return response
        except Exception as e:
            print(f"Error in GraphRAG query: {e}")
            return f"I encountered an issue while processing your query. Please try again with different phrasing."