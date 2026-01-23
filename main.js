/**
 * Main.js - Google Maps Simulation Main Application
 * 
 * This simulates how Google Maps works:
 * 1. Uses GPS coordinates (lat/lng) to represent locations
 * 2. Models road network as a weighted graph
 * 3. Calculates travel time based on distance + traffic
 * 4. Uses Dijkstra algorithm to find fastest route
 * 5. Visualizes map with traffic colors (green/yellow/red)
 * 
 * This is a SIMULATION for educational/research purposes.
 * It does NOT use real Google Maps API or real GPS data.
 */

import { nodes, edges } from './data.js';
import { calculateDistance, distanceToTime, getBounds } from './gps.js';
import { buildGraph, dijkstra, calculatePathDistance } from './graph.js';
import { drawMap, drawRouteInfo, getNodeAtPosition, getTrafficMultiplier } from './renderer.js';

// Initialize canvas
const canvas = document.getElementById("map");
if (!canvas) {
  console.error("Canvas element not found!");
  throw new Error("Canvas element not found!");
}

const ctx = canvas.getContext("2d");
const width = canvas.width;
const height = canvas.height;

console.log("Google Maps Simulation initialized");
console.log("Nodes:", nodes);
console.log("Edges:", edges);

// Calculate edge weights (travel time) based on distance and traffic
// This simulates how Google Maps calculates travel time
function calculateEdgeWeights(edges, nodes) {
  return edges.map(edge => {
    const fromNode = nodes[edge.from];
    const toNode = nodes[edge.to];
    
    // Calculate distance from GPS coordinates
    const distance = calculateDistance(
      { lat: fromNode.lat, lng: fromNode.lng },
      { lat: toNode.lat, lng: toNode.lng }
    );
    
    // Convert distance to base time
    const baseTime = distanceToTime(distance, edge.roadType);
    
    // Apply traffic multiplier
    const trafficMultiplier = getTrafficMultiplier(edge.trafficStatus);
    const weight = baseTime * trafficMultiplier;
    
    return {
      ...edge,
      distance,
      weight // Travel time in minutes
    };
  });
}

// Calculate edge weights
const weightedEdges = calculateEdgeWeights(edges, nodes);

// Build graph
const graph = buildGraph(nodes, weightedEdges);

// Get GPS bounds for coordinate conversion
const bounds = getBounds(nodes);

// Application state
let state = {
  startNode: null,
  endNode: null,
  route: null,
  selectedNode: null
};

// UI Elements
const startSelect = document.getElementById("startNode");
const endSelect = document.getElementById("endNode");
const findRouteBtn = document.getElementById("findRoute");
const resetBtn = document.getElementById("reset");
const routeInfo = document.getElementById("routeInfo");
const trafficControls = document.querySelectorAll('input[name="traffic"]');

// Initialize dropdowns
function initDropdowns() {
  Object.keys(nodes).forEach(key => {
    const option1 = document.createElement("option");
    option1.value = key;
    option1.textContent = `${key} - ${nodes[key].name}`;
    startSelect.appendChild(option1);

    const option2 = document.createElement("option");
    option2.value = key;
    option2.textContent = `${key} - ${nodes[key].name}`;
    endSelect.appendChild(option2);
  });
}

// Find optimal route using Dijkstra algorithm
function findRoute() {
  if (!state.startNode || !state.endNode || state.startNode === state.endNode) {
    alert("Vui lòng chọn điểm xuất phát và điểm đích khác nhau!");
    return;
  }

  // Use Dijkstra algorithm to find shortest path
  // This is how Google Maps finds optimal routes
  const result = dijkstra(graph, state.startNode, state.endNode);
  
  if (result.path.length === 0) {
    alert("Không tìm thấy tuyến đường!");
    return;
  }

  // Calculate total distance
  const totalDistance = calculatePathDistance(result.path, nodes, weightedEdges);
  
  state.route = {
    ...result,
    distance: totalDistance
  };

  // Update UI
  updateRouteInfo();
  render();
}

// Update route information display
function updateRouteInfo() {
  if (!state.route) {
    routeInfo.innerHTML = "<p>Chưa chọn tuyến đường</p>";
    return;
  }

  const route = state.route;
  
  routeInfo.innerHTML = `
    <h4>Tuyến đường tối ưu đã tìm thấy</h4>
    <p><strong>Đường đi:</strong> ${route.path.join(" → ")}</p>
    <p><strong>Thời gian di chuyển:</strong> ${route.time.toFixed(1)} phút</p>
    <p><strong>Khoảng cách:</strong> ${route.distance.toFixed(2)} km</p>
    <p><strong>Thuật toán:</strong> Thuật toán Dijkstra</p>
  `;
}

// Render the map
function render() {
  const routePath = state.route ? state.route.path : [];
  
  drawMap(ctx, nodes, weightedEdges, routePath, bounds, {
    width,
    height,
    startNode: state.startNode,
    endNode: state.endNode,
    selectedNode: state.selectedNode
  });

  if (state.route) {
    drawRouteInfo(ctx, state.route, width);
  }
}

// Event listeners
startSelect.addEventListener("change", (e) => {
  state.startNode = e.target.value;
  render();
});

endSelect.addEventListener("change", (e) => {
  state.endNode = e.target.value;
  render();
});

findRouteBtn.addEventListener("click", findRoute);

resetBtn.addEventListener("click", () => {
  state.startNode = null;
  state.endNode = null;
  state.route = null;
  state.selectedNode = null;
  startSelect.value = "";
  endSelect.value = "";
  routeInfo.innerHTML = "<p>Chưa chọn tuyến đường</p>";
  render();
});

// Canvas interactions
canvas.addEventListener("click", (e) => {
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  
  const clickedNode = getNodeAtPosition(x, y, nodes, bounds, width, height);

  if (clickedNode) {
    if (!state.startNode) {
      state.startNode = clickedNode;
      startSelect.value = clickedNode;
    } else if (!state.endNode && clickedNode !== state.startNode) {
      state.endNode = clickedNode;
      endSelect.value = clickedNode;
      findRoute(); // Auto-find route when both selected
    } else {
      // Reset and select new start
      state.startNode = clickedNode;
      state.endNode = null;
      state.route = null;
      startSelect.value = clickedNode;
      endSelect.value = "";
      render();
    }
  }
});

canvas.addEventListener("mousemove", (e) => {
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  
  const hoveredNode = getNodeAtPosition(x, y, nodes, bounds, width, height);
  state.selectedNode = hoveredNode;
  canvas.style.cursor = hoveredNode ? "pointer" : "default";
  render();
});

// Traffic control (simulate changing traffic conditions)
// This would update in real-time in actual Google Maps
trafficControls.forEach(control => {
  control.addEventListener("change", (e) => {
    const edgeId = e.target.dataset.edge;
    const newStatus = e.target.value;
    
    // Update traffic status
    const edge = weightedEdges.find(e => 
      `${e.from}-${e.to}` === edgeId || `${e.to}-${e.from}` === edgeId
    );
    
    if (edge) {
      edge.trafficStatus = newStatus;
      // Recalculate weight
      const trafficMultiplier = getTrafficMultiplier(newStatus);
      edge.weight = (edge.distance / (edge.roadType === 'highway' ? 100 : 
                     edge.roadType === 'main' ? 60 : 40)) * 60 * trafficMultiplier;
      
      // Rebuild graph
      const newGraph = buildGraph(nodes, weightedEdges);
      Object.assign(graph, newGraph);
      
      // Recalculate route if one exists
      if (state.route) {
        findRoute();
      } else {
        render();
      }
    }
  });
});

// Initialize
initDropdowns();
render();

console.log(`
=== Google Maps Simulation ===
This simulation demonstrates:
1. GPS coordinates (lat/lng) represent locations
2. Road network modeled as weighted graph
3. Travel time = distance + traffic conditions
4. Dijkstra algorithm finds optimal route
5. Traffic colors: Green (light), Yellow (moderate), Red (heavy)
`);
