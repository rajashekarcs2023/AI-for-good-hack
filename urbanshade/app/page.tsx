"use client"

import { DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useState, useRef, useEffect, useCallback } from "react"
import {
  ChevronDown,
  ChevronUp,
  Download,
  FilePlus,
  Layers,
  Play,
  Save,
  BarChart3,
  Wand2,
  MousePointer,
  TreesIcon as Tree,
  Home,
  Droplets,
  Umbrella,
  Database,
  BrainCircuit,
  X,
  Filter,
  Info,
  Network,
  Sparkles,
  Mic,
  CornerDownRight,
  ArrowRight,
  Repeat,
  PlusCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { VoiceVisualizer } from "@/components/voice-visualizer"

// Import API functions
import { fetchHeatMap, runSimulation, runAdvancedAnalysis, processVoiceCommand, queryGraphRAG } from "@/lib/api"

export default function UrbanShade() {
  // Base state variables
  const [isBottomPanelExpanded, setIsBottomPanelExpanded] = useState(false)
  const [selectedTool, setSelectedTool] = useState("select")
  const [totalCost, setTotalCost] = useState(0)
  const [tempReduction, setTempReduction] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 })
  const [isInsightsPanelOpen, setIsInsightsPanelOpen] = useState(false)
  const [aiInsightsEnabled, setAiInsightsEnabled] = useState(true)
  const [isAnalysisRunning, setIsAnalysisRunning] = useState(false)
  const [selectedFilters, setSelectedFilters] = useState({
    climate: true,
    density: true,
    materials: false,
    demographics: false,
  })

  // Voice assistant states
  const [voiceState, setVoiceState] = useState("inactive") // inactive, listening, processing, responding
  const [isVoicePanelOpen, setIsVoicePanelOpen] = useState(false)
  const [transcription, setTranscription] = useState("")
  const [commandHistory, setCommandHistory] = useState([
    { text: "Show me the hottest areas in downtown", timestamp: "2 min ago" },
    { text: "Where should we add trees for maximum impact?", timestamp: "5 min ago" },
  ])
  const [assistantResponse, setAssistantResponse] = useState("")
  const [isAssistantSpeaking, setIsAssistantSpeaking] = useState(false)
  const [highlightedAreas, setHighlightedAreas] = useState<Array<{x: number, y: number, radius: number, color: string}>>([])
  const [suggestedCommands, setSuggestedCommands] = useState([
    "Where should we add trees?",
    "Show hottest areas",
    "What's the cost-benefit of green roofs?",
    "Compare with similar neighborhoods",
  ])

  // Data state variables
  const [selectedNeighborhood, setSelectedNeighborhood] = useState("Downtown")
  const [heatMap, setHeatMap] = useState<any[]>([])
  const [interventions, setInterventions] = useState<Array<{type: string, x: number, y: number}>>([])
  const [similarAreasData, setSimilarAreasData] = useState([
    { name: "Phoenix - Roosevelt Row", image: "/placeholder.svg?height=100&width=150", reduction: "3.2°C" },
    { name: "Madrid - Lavapiés", image: "/placeholder.svg?height=100&width=150", reduction: "2.8°C" },
    { name: "Melbourne - CBD", image: "/placeholder.svg?height=100&width=150", reduction: "2.5°C" },
    { name: "Seoul - Gangnam", image: "/placeholder.svg?height=100&width=150", reduction: "2.1°C" },
  ])
  const [recommendationsData, setRecommendationsData] = useState([
    {
      title: "Strategic Tree Placement",
      description: "Place trees along southern building facades for maximum shade impact",
      confidence: 92,
      graphScore: 87,
      vectorScore: 94,
    },
    {
      title: "Green Roof Network",
      description: "Connect green roofs on adjacent buildings to create cooling corridors",
      confidence: 85,
      graphScore: 91,
      vectorScore: 82,
    },
    {
      title: "Permeable Pavement",
      description: "Replace concrete in plaza areas with permeable surfaces",
      confidence: 79,
      graphScore: 75,
      vectorScore: 81,
    },
  ])

  const mapRef = useRef<HTMLDivElement>(null)
  const transcriptionTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const responseTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const tools = [
    { id: "select", name: "Select", icon: MousePointer, effectiveness: null },
    { id: "trees", name: "Place Trees", icon: Tree, effectiveness: 92 },
    { id: "roofs", name: "Add Cool Roof", icon: Home, effectiveness: 78 },
    { id: "green", name: "Add Green Space", icon: Layers, effectiveness: 85 },
    { id: "water", name: "Add Water Feature", icon: Droplets, effectiveness: 89 },
    { id: "shade", name: "Add Shade Structure", icon: Umbrella, effectiveness: 76 },
  ]

  const neighborhoods = ["Downtown", "Midtown", "Westside", "Eastside", "Northside", "Industrial District"]

  const dataSources = [
    { type: "Knowledge Graph", name: "Urban Heat Island Neo4j Graph", nodes: "12,450", relationships: "45,320" },
    { type: "Vector Database", name: "Climate Research Qdrant DB", vectors: "250,000", dimensions: "1,536" },
    { type: "Document Store", name: "Urban Planning Case Studies", documents: "3,250", pages: "42,800" },
    { type: "Sensor Data", name: "City Temperature Monitoring", sensors: "342", readings: "15M/year" },
  ]
  // Fetch initial heat map when component mounts or neighborhood changes
  useEffect(() => {
    async function loadHeatMap() {
      try {
        const data = await fetchHeatMap(selectedNeighborhood);
        if (data && data.heatMap) {
          setHeatMap(data.heatMap);
        }
      } catch (error) {
        console.error("Failed to load heat map:", error);
      }
    }
    
    loadHeatMap();
  }, [selectedNeighborhood]);

  // Add element to map and run simulation
  const addElementToMap = async (toolId: string, x: number, y: number) => {
    // Calculate percentage position for map
    const rect = mapRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const percentX = (x / rect.width) * 100;
    const percentY = (y / rect.height) * 100;
    
    // Create a new intervention
    const newIntervention = { type: toolId, x: percentX, y: percentY };
    const updatedInterventions = [...interventions, newIntervention];
    setInterventions(updatedInterventions);
    
    // Run simulation
    try {
      const result = await runSimulation(selectedNeighborhood, updatedInterventions, heatMap);
      if (result.newHeatMap) setHeatMap(result.newHeatMap);
      if (result.statistics) {
        setTotalCost(result.statistics.totalCost);
        setTempReduction(result.statistics.averageTempReduction);
      }
    } catch (error) {
      console.error("Simulation failed:", error);
      
      // Update UI with local calculations
      let cost = 0;
      let tempEffect = 0;

      switch (toolId) {
        case "trees":
          cost = 500;
          tempEffect = 0.2;
          break;
        case "roofs":
          cost = 5000;
          tempEffect = 0.5;
          break;
        case "green":
          cost = 10000;
          tempEffect = 0.8;
          break;
        case "water":
          cost = 15000;
          tempEffect = 1.0;
          break;
        case "shade":
          cost = 8000;
          tempEffect = 0.6;
          break;
      }

      setTotalCost((prev) => prev + cost);
      setTempReduction((prev) => prev + tempEffect);
    }
  };

  // Handle neighborhood selection
  const handleNeighborhoodChange = (neighborhood: string) => {
    setSelectedNeighborhood(neighborhood);
    // Reset interventions when changing neighborhoods
    setInterventions([]);
    setTotalCost(0);
    setTempReduction(0);
  };

  // Run advanced analysis with GraphRAG
  const handleRunAdvancedAnalysis = async () => {
    setIsAnalysisRunning(true);
    
    try {
      const result = await runAdvancedAnalysis(
        selectedNeighborhood, 
        interventions,
        {
          climate: selectedFilters.climate,
          density: selectedFilters.density,
          materials: selectedFilters.materials,
          demographics: selectedFilters.demographics
        }
      );
      
      // Update UI with results
      if (result.similarAreas) setSimilarAreasData(result.similarAreas);
      if (result.recommendations) setRecommendationsData(result.recommendations);
      
      setIsInsightsPanelOpen(true);
    } catch (error) {
      console.error("Advanced analysis failed:", error);
    } finally {
      setIsAnalysisRunning(false);
    }
  };

  // Run simulation
  const handleRunSimulation = async () => {
    try {
      const result = await runSimulation(selectedNeighborhood, interventions, heatMap);
      if (result.newHeatMap) setHeatMap(result.newHeatMap);
      if (result.statistics) {
        setTotalCost(result.statistics.totalCost);
        setTempReduction(result.statistics.averageTempReduction);
      }
    } catch (error) {
      console.error("Simulation failed:", error);
    }
  };

  // Process voice command
  const handleVoiceCommand = useCallback(async (command: string) => {
    setVoiceState("processing");
    
    // Add to command history
    setCommandHistory((prev) => [{ text: command, timestamp: "Just now" }, ...prev.slice(0, 4)]);
    
    try {
      // Determine if the query is complex enough for GraphRAG
      const isComplexQuery = 
        command.includes("why") || 
        command.includes("how") || 
        command.includes("explain") ||
        command.includes("detail") ||
        command.length > 50;
      
      let result;
      
      if (isComplexQuery) {
        // Use GraphRAG for complex queries
        const graphResult = await queryGraphRAG(command);
        
        // Convert GraphRAG response to the format expected by the UI
        result = {
          response: graphResult.response,
          action: "none",
          parameters: {}
        };
      } else {
        // Use regular voice processing for simpler commands
        result = await processVoiceCommand(command);
      }
      
      setAssistantResponse(result.response);
      
      // Handle actions
      if (result.action === "highlight" && result.parameters?.areas) {
        const areas = result.parameters.areas.map(([x, y]: number[]) => ({
          x,
          y,
          radius: 40,
          color: result.parameters.type === "heat" 
            ? "rgba(255, 0, 0, 0.3)" 
            : "rgba(0, 255, 0, 0.3)"
        }));
        
        setHighlightedAreas(areas);
      }
      
      setVoiceState("responding");
      simulateAssistantSpeaking(result.response);
    } catch (error) {
      console.error("Voice command processing failed:", error);
      setAssistantResponse("I'm sorry, I had trouble processing that request.");
      setVoiceState("responding");
    }
  }, []);
  // Simulated voice recognition with actual API integration
  const startVoiceRecognition = () => {
    setVoiceState("listening")
    setIsVoicePanelOpen(true)
    setTranscription("")

    // Simulate transcription typing effect
    let fullText = ""
    const possibleQueries = [
      "Where are the hottest areas in downtown?",
      "What interventions would work best near the central plaza?",
      "Show me where to add trees for maximum impact",
      "How much would it cost to reduce temperature by 2 degrees?",
    ]
    const selectedQuery = possibleQueries[Math.floor(Math.random() * possibleQueries.length)]

    let charIndex = 0
    transcriptionTimeoutRef.current = setInterval(() => {
      if (charIndex < selectedQuery.length) {
        fullText += selectedQuery[charIndex]
        setTranscription(fullText)
        charIndex++
      } else {
        if (transcriptionTimeoutRef.current) {
          clearInterval(transcriptionTimeoutRef.current)
        }
        handleVoiceCommand(selectedQuery)
      }
    }, 50)
  }

  const simulateAssistantSpeaking = (text: string) => {
    setIsAssistantSpeaking(true)

    // Simulate the duration of speaking based on text length
    const speakingDuration = Math.min(text.length * 30, 8000)

    responseTimeoutRef.current = setTimeout(() => {
      setIsAssistantSpeaking(false)
    }, speakingDuration)
  }

  const stopVoiceRecognition = () => {
    if (transcriptionTimeoutRef.current) {
      clearInterval(transcriptionTimeoutRef.current)
    }
    if (responseTimeoutRef.current) {
      clearTimeout(responseTimeoutRef.current)
    }
    setVoiceState("inactive")
    setIsAssistantSpeaking(false)
  }

  const closeVoicePanel = () => {
    stopVoiceRecognition()
    setIsVoicePanelOpen(false)
    setHighlightedAreas([])
  }

  const repeatLastResponse = () => {
    simulateAssistantSpeaking(assistantResponse)
  }

  const expandResponse = () => {
    const expandedResponse =
      assistantResponse +
      " Additionally, our GraphRAG analysis shows that combining these interventions with green roofs on commercial buildings could create a network effect, enhancing cooling by an additional 0.8°C across the entire district."
    setAssistantResponse(expandedResponse)
    simulateAssistantSpeaking(expandedResponse)
  }

  const useSuggestedCommand = useCallback(
    (command: string) => {
      setTranscription(command)
      handleVoiceCommand(command)
    },
    [handleVoiceCommand],
  )

  const handleToolDragStart = (e: React.DragEvent<HTMLDivElement>, tool: {id: string, name: string, icon: any, effectiveness: number | null}) => {
    e.preventDefault()
    setIsDragging(true)
    setSelectedTool(tool.id)
  }

  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (selectedTool !== "select" && mapRef.current) {
      const rect = mapRef.current.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      // Add the element to the map
      addElementToMap(selectedTool, x, y)
    }
  }

  const handleMapMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isDragging && mapRef.current) {
      const rect = mapRef.current.getBoundingClientRect()
      setDragPosition({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      })
    }
  }

  const handleMapDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
  }

  const handleMapDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)

    if (mapRef.current) {
      const rect = mapRef.current.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      addElementToMap(selectedTool, x, y)
    }
  }

  const toggleFilter = (filter: keyof typeof selectedFilters) => {
    setSelectedFilters((prev) => ({
      ...prev,
      [filter]: !prev[filter],
    }))
  }

  // Clean up timeouts on unmount
  useEffect(() => {
    return () => {
      if (transcriptionTimeoutRef.current) {
        clearInterval(transcriptionTimeoutRef.current)
      }
      if (responseTimeoutRef.current) {
        clearTimeout(responseTimeoutRef.current)
      }
    }
  }, [])
  // Function to generate heat map visualization
  const renderHeatMap = () => {
    if (!heatMap || heatMap.length === 0) return null;
    
    // Create a simplified heatmap visualization
    const width = 100;
    const height = 100;
    const cellSize = 10;
    
    return (
      <div className="absolute inset-0 pointer-events-none">
        <svg width="100%" height="100%" viewBox={`0 0 ${width * cellSize} ${height * cellSize}`} preserveAspectRatio="none">
          <defs>
            <radialGradient id="heatGradient" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
              <stop offset="0%" stopColor="rgba(255, 0, 0, 0.7)" />
              <stop offset="100%" stopColor="rgba(255, 0, 0, 0)" />
            </radialGradient>
          </defs>
          
          {heatMap.slice(0, 200).map((point, index) => {
            const temp = point[2];
            const normalizedTemp = Math.min(Math.max((temp - 25) / 15, 0), 1); // normalize to 0-1
            
            if (normalizedTemp < 0.5) return null; // Only show hot spots
            
            const x = point[0] * cellSize;
            const y = point[1] * cellSize;
            const radius = normalizedTemp * 40;
            
            return (
              <circle 
                key={index} 
                cx={x} 
                cy={y} 
                r={radius}
                fill="url(#heatGradient)"
                opacity={normalizedTemp * 0.8}
              />
            );
          })}
        </svg>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50">
      {/* Top Navigation Bar */}
      <header className="flex items-center justify-between px-4 py-2 bg-white border-b shadow-sm">
        <div className="flex items-center space-x-2">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-md bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-white font-bold">
              US
            </div>
            <h1 className="ml-2 text-xl font-semibold text-slate-800">UrbanShade</h1>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm">
                  <FilePlus className="w-4 h-4 mr-1" />
                  New Plan
                </Button>
              </TooltipTrigger>
              <TooltipContent>Create a new mitigation plan</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm">
                  <Save className="w-4 h-4 mr-1" />
                  Save Scenario
                </Button>
              </TooltipTrigger>
              <TooltipContent>Save current scenario</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm">
                  <BarChart3 className="w-4 h-4 mr-1" />
                  Compare
                </Button>
              </TooltipTrigger>
              <TooltipContent>Compare different scenarios</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm">
                  <Wand2 className="w-4 h-4 mr-1" />
                  Optimize
                </Button>
                </TooltipTrigger>
              <TooltipContent>Optimize current plan</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-1" />
                  Export
                </Button>
              </TooltipTrigger>
              <TooltipContent>Export report</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                {selectedNeighborhood} <ChevronDown className="w-4 h-4 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {neighborhoods.map((neighborhood) => (
                <DropdownMenuItem 
                  key={neighborhood}
                  onClick={() => handleNeighborhoodChange(neighborhood)}
                >
                  {neighborhood}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Knowledge Filters Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4 mr-1" />
                Knowledge Filters
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Prioritize Similarity</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem
                checked={selectedFilters.climate}
                onCheckedChange={() => toggleFilter("climate")}
              >
                Similar Climate Regions
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={selectedFilters.density}
                onCheckedChange={() => toggleFilter("density")}
              >
                Similar Urban Density
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={selectedFilters.materials}
                onCheckedChange={() => toggleFilter("materials")}
              >
                Similar Building Materials
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={selectedFilters.demographics}
                onCheckedChange={() => toggleFilter("demographics")}
              >
                Similar Demographic Profiles
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Voice Assistant Button */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={voiceState !== "inactive" ? "default" : "outline"}
                  size="sm"
                  className={`relative ${voiceState !== "inactive" ? "bg-indigo-600 hover:bg-indigo-700" : ""}`}
                  onClick={voiceState === "inactive" ? startVoiceRecognition : stopVoiceRecognition}
                >
                  <Mic className="w-4 h-4" />
                  {voiceState === "listening" && (
                    <span className="absolute inset-0 rounded-md animate-pulse bg-indigo-400/30"></span>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>Ask Shade Guide</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <aside className="w-64 bg-white border-r shadow-sm flex flex-col">
          <div className="p-4 border-b">
            <div className="flex items-center justify-between">
              <h2 className="font-medium text-slate-800">Tools</h2>
              <div className="flex items-center space-x-2">
                <Label htmlFor="ai-insights" className="text-xs text-slate-500">
                  AI Insights
                </Label>
                <Switch id="ai-insights" checked={aiInsightsEnabled} onCheckedChange={setAiInsightsEnabled} />
              </div>
            </div>
          </div>

          <div className="p-4 flex flex-col space-y-2">
            {tools.map((tool) => (
              <TooltipProvider key={tool.id}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div
                      className={`flex items-center p-2 rounded-md cursor-pointer ${selectedTool === tool.id ? "bg-blue-50 text-blue-600" : "hover:bg-slate-100"}`}
                      onClick={() => setSelectedTool(tool.id)}
                      draggable={tool.id !== "select"}
                      onDragStart={(e) => handleToolDragStart(e, tool)}
                    >
                      <tool.icon className="w-5 h-5 mr-2" />
                      <span className="text-sm">{tool.name}</span>
                      {aiInsightsEnabled && tool.effectiveness && (
                        <Badge variant={tool.effectiveness > 85 ? "default" : "secondary"} className="ml-auto text-xs">
                          {tool.effectiveness}%
                        </Badge>
                      )}
                    </div>
                  </TooltipTrigger>
                  {aiInsightsEnabled && tool.effectiveness && (
                    <TooltipContent side="right" className="max-w-xs">
                      <div className="space-y-2">
                        <p className="font-medium">Why this is recommended:</p>
                        {tool.id === "trees" && (
                          <p className="text-xs">
                            Trees provide both shade and evaporative cooling. Graph analysis shows 92% effectiveness in
                            similar urban contexts with comparable building heights and street widths.
                          </p>
                        )}
                        {tool.id === "roofs" && (
                          <p className="text-xs">
                            Cool roofs reflect more sunlight and absorb less heat. Vector similarity with 24 case
                            studies shows 78% effectiveness in similar climate zones.
                          </p>
                        )}
                        {tool.id === "green" && (
                          <p className="text-xs">
                            Green spaces create cooling islands. Knowledge graph connections to 15 similar urban areas
                            show 85% effectiveness when implemented at this scale.
                          </p>
                        )}
                        {tool.id === "water" && (
                          <p className="text-xs">
                            Water features provide evaporative cooling. Combined graph and vector analysis shows 89%
                            effectiveness in similar humidity conditions.
                          </p>
                        )}
                        {tool.id === "shade" && (
                          <p className="text-xs">
                            Shade structures block direct sunlight. Analysis of 32 similar implementations shows 76%
                            effectiveness in comparable sun exposure conditions.
                          </p>
                        )}
                      </div>
                    </TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>
            ))}
          </div>
          <Separator />

          <div className="p-4 mt-auto">
            <h3 className="text-sm font-medium text-slate-800 mb-2">Cost Calculator</h3>
            <div className="flex justify-between mb-1">
              <span className="text-sm text-slate-600">Total Cost:</span>
              <span className="text-sm font-medium">${totalCost.toLocaleString()}</span>
            </div>

            <h3 className="text-sm font-medium text-slate-800 mt-4 mb-2">Temperature Impact</h3>
            <div className="flex justify-between mb-1">
              <span className="text-sm text-slate-600">Reduction:</span>
              <span className="text-sm font-medium text-emerald-600">-{tempReduction.toFixed(1)}°C</span>
            </div>
            <Progress value={tempReduction * 10} max={10} className="h-2 mt-1" />
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 relative overflow-hidden">
          {/* Map */}
          <div
            ref={mapRef}
            className="w-full h-full relative cursor-crosshair bg-slate-100"
            onClick={handleMapClick}
            onMouseMove={handleMapMouseMove}
            onDragOver={handleMapDragOver}
            onDrop={handleMapDrop}
          >
            {/* Base map - use a satellite or map image */}
            <img 
              src="/placeholder.svg?height=1080&width=1920" 
              alt="Map" 
              className="w-full h-full object-cover" 
              style={{ opacity: 0.9 }}
            />

            {/* Render dynamic heat map */}
            {renderHeatMap()}

            {/* Heat map overlay - this creates a more realistic heat effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 via-orange-400/5 to-blue-300/5 pointer-events-none"></div>

            {/* City buildings outline overlay - this would be more detailed in a real implementation */}
            <div className="absolute inset-0 pointer-events-none">
              {/* This would be a more detailed SVG of city outlines in a real app */}
              <svg width="100%" height="100%" viewBox="0 0 1000 1000" preserveAspectRatio="none">
                <g stroke="rgba(0,0,0,0.2)" strokeWidth="1" fill="none">
                  {/* Mock city blocks */}
                  <rect x="100" y="100" width="200" height="150" />
                  <rect x="350" y="100" width="150" height="100" />
                  <rect x="550" y="120" width="180" height="130" />
                  <rect x="100" y="300" width="300" height="200" />
                  <rect x="450" y="280" width="250" height="180" />
                  <rect x="150" y="550" width="220" height="150" />
                  <rect x="420" y="520" width="200" height="180" />
                  <rect x="650" y="500" width="150" height="220" />
                  {/* Streets */}
                  <line x1="0" y1="250" x2="1000" y2="250" />
                  <line x1="0" y1="500" x2="1000" y2="500" />
                  <line x1="0" y1="750" x2="1000" y2="750" />
                  <line x1="250" y1="0" x2="250" y2="1000" />
                  <line x1="500" y1="0" x2="500" y2="1000" />
                  <line x1="750" y1="0" x2="750" y2="1000" />
                </g>
              </svg>
            </div>

            {/* Interventions visualized */}
            {interventions.map((intervention, index) => {
              // Different visual for each intervention type
              let Icon = Tree;
              let bgColor = "bg-green-500";
              
              switch (intervention.type) {
                case "trees":
                  Icon = Tree;
                  bgColor = "bg-green-500";
                  break;
                case "roofs":
                  Icon = Home;
                  bgColor = "bg-slate-400";
                  break;
                case "green":
                  Icon = Layers;
                  bgColor = "bg-emerald-500";
                  break;
                case "water":
                  Icon = Droplets;
                  bgColor = "bg-blue-500";
                  break;
                case "shade":
                  Icon = Umbrella;
                  bgColor = "bg-amber-500";
                  break;
              }
              
              return (
                <div
                  key={index}
                  className={`absolute rounded-full ${bgColor} flex items-center justify-center text-white`}
                  style={{
                    left: `${intervention.x}%`,
                    top: `${intervention.y}%`,
                    width: '24px',
                    height: '24px',
                    transform: 'translate(-50%, -50%)',
                  }}
                >
                  <Icon className="w-4 h-4" />
                  <div className={`absolute inset-0 ${bgColor}/20 rounded-full animate-ping opacity-75`}></div>
                </div>
              );
            })}

            {/* Highlighted areas from voice commands */}
            {highlightedAreas.map((area, index) => (
              <div
                key={index}
                className="absolute rounded-full animate-pulse pointer-events-none"
                style={{
                  left: `${area.x}%`,
                  top: `${area.y}%`,
                  width: `${area.radius}px`,
                  height: `${area.radius}px`,
                  backgroundColor: area.color,
                  transform: "translate(-50%, -50%)",
                }}
              />
            ))}

            {/* Dragging preview */}
            {isDragging && (
              <div
                className="absolute pointer-events-none w-8 h-8 bg-blue-500/50 rounded-full transform -translate-x-1/2 -translate-y-1/2"
                style={{ left: dragPosition.x, top: dragPosition.y }}
              >
                <div className="absolute inset-0 bg-blue-500/20 rounded-full animate-ping"></div>
              </div>
            )}
          </div>

          {/* Floating Action Buttons */}
          <div className="absolute bottom-4 right-4 flex flex-col space-y-2">
            <Button
              className="rounded-full shadow-lg bg-indigo-600 hover:bg-indigo-700"
              size="lg"
              onClick={handleRunAdvancedAnalysis}
              disabled={isAnalysisRunning}
            >
              {isAnalysisRunning ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Processing...
                </>
              ) : (
                <>
                  <BrainCircuit className="w-5 h-5 mr-1" />
                  Run Advanced Analysis
                </>
              )}
            </Button>

            <Button className="rounded-full shadow-lg" size="lg" onClick={handleRunSimulation}>
              <Play className="w-5 h-5 mr-1" />
              Run Simulation
            </Button>
          </div>
          {/* Voice Interaction Panel */}
          {isVoicePanelOpen && (
            <div className="absolute top-0 right-0 h-full w-80 bg-white shadow-lg border-l transform transition-transform duration-300 ease-in-out overflow-y-auto z-20">
              <div className="flex items-center justify-between p-3 border-b bg-slate-50 sticky top-0">
                <div className="flex items-center">
                  <Avatar className="h-8 w-8 mr-2">
                    <AvatarImage src="/placeholder.svg?height=40&width=40" alt="Shade Guide" />
                    <AvatarFallback className="bg-indigo-100 text-indigo-700">SG</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-medium text-sm">Shade Guide</h3>
                    <p className="text-xs text-slate-500">Voice Assistant</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={closeVoicePanel}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Live Transcription */}
              <div className="p-4 border-b">
                <div className="flex items-start">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center mr-2 ${voiceState === "listening" ? "bg-indigo-100" : "bg-slate-100"}`}
                  >
                    <Mic className={`h-4 w-4 ${voiceState === "listening" ? "text-indigo-600" : "text-slate-400"}`} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium mb-1">Listening...</p>
                    <div className="bg-slate-50 rounded-lg p-3 relative">
                      <p className="text-sm">
                        {transcription || "Speak now..."}
                        {voiceState === "listening" && <span className="animate-pulse">|</span>}
                      </p>
                      {voiceState === "listening" && (
                        <div className="absolute right-3 bottom-3">
                          <div className="flex space-x-1">
                            {[1, 2, 3, 4].map((i) => (
                              <div
                                key={i}
                                className="w-1 bg-indigo-400 rounded-full animate-pulse"
                                style={{
                                  height: `${6 + Math.random() * 10}px`,
                                  animationDelay: `${i * 0.1}s`,
                                }}
                              ></div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Assistant Response */}
              {assistantResponse && (
                <div className="p-4 border-b">
                  <div className="flex items-start">
                    <Avatar className="h-8 w-8 mr-2">
                      <AvatarImage src="/placeholder.svg?height=40&width=40" alt="Shade Guide" />
                      <AvatarFallback className="bg-indigo-100 text-indigo-700">SG</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="bg-indigo-50 rounded-lg p-3 relative">
                        <p className="text-sm">{assistantResponse}</p>
                        {isAssistantSpeaking && (
                          <div className="absolute right-3 bottom-3">
                            <VoiceVisualizer isActive={isAssistantSpeaking} />
                          </div>
                        )}
                      </div>
                      <div className="flex mt-2 space-x-2">
                        <Button variant="outline" size="sm" onClick={repeatLastResponse}>
                          <Repeat className="h-3 w-3 mr-1" />
                          Repeat
                        </Button>
                        <Button variant="outline" size="sm" onClick={expandResponse}>
                          <PlusCircle className="h-3 w-3 mr-1" />
                          More Details
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Suggested Commands */}
              <div className="p-4">
                <h4 className="text-xs font-medium text-slate-500 mb-2">Try asking:</h4>
                <div className="space-y-2">
                  {suggestedCommands.map((command, index) => (
                    <button
                      key={index}
                      className="flex items-center w-full text-left p-2 rounded-md text-sm hover:bg-slate-50 transition-colors"
                      onClick={() => useSuggestedCommand(command)}
                    >
                      <CornerDownRight className="h-3 w-3 mr-2 text-slate-400" />
                      {command}
                    </button>
                  ))}
                </div>
              </div>

              {/* Command History */}
              {commandHistory.length > 0 && (
                <div className="p-4 border-t bg-slate-50">
                  <h4 className="text-xs font-medium text-slate-500 mb-2">Recent commands:</h4>
                  <div className="space-y-2">
                    {commandHistory.map((command, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <button
                          className="flex items-center text-left text-xs text-slate-600 hover:text-indigo-600 transition-colors truncate max-w-[80%]"
                          onClick={() => useSuggestedCommand(command.text)}
                        >
                          <ArrowRight className="h-3 w-3 mr-1 flex-shrink-0" />
                          <span className="truncate">{command.text}</span>
                        </button>
                        <span className="text-xs text-slate-400">{command.timestamp}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Insights Panel (slides in from right) */}
          <div
            className={`absolute top-0 right-0 h-full w-80 bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${
              isInsightsPanelOpen ? "translate-x-0" : "translate-x-full"
            }`}
          >
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="font-medium text-slate-800 flex items-center">
                <Sparkles className="w-4 h-4 mr-2 text-indigo-500" />
                GraphRAG Insights
              </h2>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setIsInsightsPanelOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="p-4 overflow-y-auto h-full pb-20">
              {/* Similar Urban Areas */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-slate-800 mb-3">Similar Urban Areas</h3>
                <div className="grid grid-cols-2 gap-2">
                  {similarAreasData.map((area, index) => (
                    <div key={index} className="rounded-md border overflow-hidden">
                      <img
                        src={area.image || "/placeholder.svg"}
                        alt={area.name}
                        className="w-full h-20 object-cover"
                      />
                      <div className="p-2">
                        <p className="text-xs font-medium truncate">{area.name}</p>
                        <p className="text-xs text-emerald-600">-{area.reduction}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Knowledge Graph Visualization */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-slate-800 mb-3">Knowledge Graph</h3>
                <div className="rounded-md border p-2 bg-slate-50 h-48 flex items-center justify-center relative overflow-hidden">
                  {/* Simplified knowledge graph visualization */}
                  <div className="absolute inset-0 opacity-10">
                    <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
                      <defs>
                        <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                          <path d="M 10 0 L 0 0 0 10" fill="none" stroke="gray" strokeWidth="0.5" />
                        </pattern>
                      </defs>
                      <rect width="100%" height="100%" fill="url(#grid)" />
                    </svg>
                  </div>

                  {/* Simplified network visualization */}
                  <Network className="w-full h-full text-indigo-500 opacity-20 absolute" />

                  {/* Central node */}
                  <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white z-10 relative">
                    <Home className="w-6 h-6" />
                  </div>

                  {/* Connected nodes */}
                  <div className="absolute top-1/4 left-1/4 w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white">
                    <Tree className="w-4 h-4" />
                  </div>
                  <div className="absolute bottom-1/4 left-1/3 w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center text-white">
                    <Umbrella className="w-4 h-4" />
                  </div>
                  <div className="absolute top-1/3 right-1/4 w-8 h-8 rounded-full bg-cyan-500 flex items-center justify-center text-white">
                    <Droplets className="w-4 h-4" />
                  </div>

                  {/* Connection lines */}
                  <svg className="absolute inset-0 w-full h-full" style={{ pointerEvents: "none" }}>
                    <line x1="50%" y1="50%" x2="25%" y2="25%" stroke="green" strokeWidth="2" strokeDasharray="2" />
                    <line x1="50%" y1="50%" x2="33%" y2="75%" stroke="orange" strokeWidth="2" strokeDasharray="2" />
                    <line x1="50%" y1="50%" x2="75%" y2="33%" stroke="cyan" strokeWidth="2" strokeDasharray="2" />
                  </svg>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Showing relationships between urban elements and cooling strategies
                </p>
              </div>

              {/* Recommended Interventions */}
              <div>
                <h3 className="text-sm font-medium text-slate-800 mb-3">Recommended Interventions</h3>
                <div className="space-y-3">
                  {recommendationsData.map((rec, index) => (
                    <Card key={index}>
                      <CardHeader className="p-3 pb-0">
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-sm">{rec.title}</CardTitle>
                          <Badge variant="outline" className="ml-2">
                            {rec.confidence}%
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="p-3 pt-2">
                        <p className="text-xs text-slate-600">{rec.description}</p>
                        <div className="mt-2 flex items-center space-x-2">
                          <div className="flex-1">
                            <div className="flex justify-between text-xs">
                              <span>Graph</span>
                              <span>{rec.graphScore}%</span>
                            </div>
                            <Progress value={rec.graphScore} className="h-1" />
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between text-xs">
                              <span>Vector</span>
                              <span>{rec.vectorScore}%</span>
                            </div>
                            <Progress value={rec.vectorScore} className="h-1" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Bottom Panel */}
      <div
        className={`bg-white border-t shadow-md transition-all duration-300 ${isBottomPanelExpanded ? "h-64" : "h-10"}`}
      >
        <div
          className="flex items-center justify-between px-4 h-10 cursor-pointer"
          onClick={() => setIsBottomPanelExpanded(!isBottomPanelExpanded)}
        >
          <h3 className="font-medium text-slate-800">Analysis & Metrics</h3>
          <Button variant="ghost" size="sm">
            {isBottomPanelExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </Button>
        </div>

        {isBottomPanelExpanded && (
          <div className="p-4">
            <Tabs defaultValue="comparison">
              <TabsList className="mb-4">
                <TabsTrigger value="comparison">Temperature Comparison</TabsTrigger>
                <TabsTrigger value="cost">Cost-Benefit Analysis</TabsTrigger>
                <TabsTrigger value="timeline">Implementation Timeline</TabsTrigger>
                <TabsTrigger value="datasources">Data Sources</TabsTrigger>
              </TabsList>

              <TabsContent value="comparison" className="flex space-x-4">
                <Card className="flex-1">
                  <CardContent className="p-4">
                    <h4 className="text-sm font-medium mb-2">Before Mitigation</h4>
                    <div className="flex items-center">
                      <div className="w-full h-4 bg-gradient-to-r from-red-500 to-orange-400 rounded-md"></div>
                      <span className="ml-2 font-medium">32.5°C</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="flex-1">
                  <CardContent className="p-4">
                    <h4 className="text-sm font-medium mb-2">After Mitigation</h4>
                    <div className="flex items-center">
                      <div className="w-full h-4 bg-gradient-to-r from-orange-400 to-green-400 rounded-md"></div>
                      <span className="ml-2 font-medium">{(32.5 - tempReduction).toFixed(1)}°C</span>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="cost">
                <div className="grid grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <h4 className="text-sm font-medium mb-2">Initial Investment</h4>
                      <p className="text-2xl font-bold">${totalCost.toLocaleString()}</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <h4 className="text-sm font-medium mb-2">Energy Savings (Annual)</h4>
                      <p className="text-2xl font-bold text-emerald-600">
                        ${Math.round(totalCost * 0.15).toLocaleString()}
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <h4 className="text-sm font-medium mb-2">Health Benefits (Annual)</h4>
                      <p className="text-2xl font-bold text-emerald-600">
                        ${Math.round(totalCost * 0.25).toLocaleString()}
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="timeline">
                <div className="relative h-16 bg-slate-100 rounded-md p-2">
                  <div className="absolute left-0 top-0 bottom-0 w-1/4 bg-blue-500/20 border-r-2 border-blue-500 flex items-center justify-center">
                    <span className="text-xs font-medium">
                      Planning
                      <br />3 months
                    </span>
                  </div>
                  <div className="absolute left-1/4 top-0 bottom-0 w-1/4 bg-green-500/20 border-r-2 border-green-500 flex items-center justify-center">
                    <span className="text-xs font-medium">
                      Procurement
                      <br />2 months
                    </span>
                  </div>
                  <div className="absolute left-2/4 top-0 bottom-0 w-1/4 bg-amber-500/20 border-r-2 border-amber-500 flex items-center justify-center">
                    <span className="text-xs font-medium">
                      Implementation
                      <br />6 months
                    </span>
                  </div>
                  <div className="absolute left-3/4 top-0 bottom-0 w-1/4 bg-purple-500/20 flex items-center justify-center">
                    <span className="text-xs font-medium">
                      Monitoring
                      <br />
                      Ongoing
                    </span>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="datasources">
                <div className="grid grid-cols-2 gap-4">
                  {dataSources.map((source, index) => (
                    <Card key={index}>
                      <CardContent className="p-4">
                        <div className="flex items-start">
                          <div className="mr-3 mt-1">
                            <Database className="h-5 w-5 text-indigo-500" />
                          </div>
                          <div>
                            <h4 className="text-sm font-medium">{source.name}</h4>
                            <p className="text-xs text-slate-500">{source.type}</p>
                            <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1">
                              {Object.entries(source)
                                .filter(([key]) => !["name", "type"].includes(key))
                                .map(([key, value]) => (
                                  <div key={key} className="flex justify-between">
                                    <span className="text-xs capitalize">{key}:</span>
                                    <span className="text-xs font-medium">{value}</span>
                                  </div>
                                ))}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                <div className="mt-4 p-3 bg-slate-50 rounded-md border">
                  <div className="flex items-center">
                    <Info className="h-4 w-4 text-slate-400 mr-2" />
                    <p className="text-xs text-slate-600">
                      GraphRAG combines knowledge graph relationships with vector similarity to provide more
                      contextually relevant recommendations.
                    </p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>
    </div>
  )
}