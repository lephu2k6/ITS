/**
 * Graph.js - Graph Data Structure and Dijkstra Algorithm
 * 
 * This simulates how Google Maps models the road network as a weighted graph:
 * - Nodes (vertices) = Intersections/Locations
 * - Edges = Roads connecting locations
 * - Edge weights = Travel time (affected by distance + traffic)
 * 
 * Google Maps uses Dijkstra's algorithm (and variants like A*) to find
 * the shortest/fastest path between two points.
 */

/**
 * Build adjacency list representation of the graph
 * This is how Google Maps internally represents the road network
 * 
 * @param {Object} nodes - All nodes in the graph
 * @param {Array} edges - All edges (roads) in the graph
 * @returns {Object} Adjacency list: {nodeId: [{node: string, weight: number}, ...]}
 */
export function buildGraph(nodes, edges) {
  const graph = {};
  
  // Initialize all nodes
  Object.keys(nodes).forEach(nodeId => {
    graph[nodeId] = [];
  });
  
  // Add edges (roads are bidirectional)
  edges.forEach(edge => {
    graph[edge.from].push({
      node: edge.to,
      weight: edge.weight // Travel time in minutes
    });
    graph[edge.to].push({
      node: edge.from,
      weight: edge.weight
    });
  });
  
  return graph;
}

/**
 * Dijkstra's Algorithm - Find shortest path
 * 
 * This is the core algorithm Google Maps uses to find optimal routes.
 * It finds the path with minimum total travel time.
 * 
 * Algorithm steps:
 * 1. Initialize distances: all nodes = Infinity, start = 0
 * 2. Visit unvisited node with smallest distance
 * 3. Update distances to neighbors
 * 4. Repeat until destination is reached
 * 
 * @param {Object} graph - Adjacency list representation
 * @param {string} start - Starting node ID
 * @param {string} end - Destination node ID
 * @returns {Object} {path: Array, time: number, distance: number}
 */
export function dijkstra(graph, start, end) {
  // Distance from start to each node
  const distances = {};
  // Previous node in optimal path
  const previous = {};
  // Unvisited nodes
  const unvisited = new Set();
  
  // Initialize
  Object.keys(graph).forEach(node => {
    distances[node] = Infinity;
    previous[node] = null;
    unvisited.add(node);
  });
  distances[start] = 0;
  
  // Main algorithm loop
  while (unvisited.size > 0) {
    // Find unvisited node with smallest distance
    let current = null;
    let minDistance = Infinity;
    
    unvisited.forEach(node => {
      if (distances[node] < minDistance) {
        minDistance = distances[node];
        current = node;
      }
    });
    
    // If no path exists or we reached destination
    if (current === null || current === end) {
      break;
    }
    
    unvisited.delete(current);
    
    // Update distances to neighbors
    graph[current].forEach(neighbor => {
      if (unvisited.has(neighbor.node)) {
        const alt = distances[current] + neighbor.weight;
        if (alt < distances[neighbor.node]) {
          distances[neighbor.node] = alt;
          previous[neighbor.node] = current;
        }
      }
    });
  }
  
  // Reconstruct path
  const path = [];
  let current = end;
  
  // Check if path exists
  if (previous[current] === null && current !== start) {
    return {
      path: [],
      time: Infinity,
      distance: Infinity
    };
  }
  
  // Build path from end to start
  while (current !== null) {
    path.unshift(current);
    current = previous[current];
  }
  
  return {
    path,
    time: distances[end],
    distance: distances[end] // In this simulation, time = distance (minutes)
  };
}

/**
 * Calculate total distance of a path
 * @param {Array} path - Array of node IDs
 * @param {Object} nodes - All nodes with GPS coordinates
 * @param {Array} edges - All edges
 * @returns {number} Total distance in kilometers
 */
export function calculatePathDistance(path, nodes, edges) {
  let totalDistance = 0;
  
  for (let i = 0; i < path.length - 1; i++) {
    const from = path[i];
    const to = path[i + 1];
    
    // Find edge
    const edge = edges.find(e => 
      (e.from === from && e.to === to) || 
      (e.from === to && e.to === from)
    );
    
    if (edge && edge.distance) {
      totalDistance += edge.distance;
    }
  }
  
  return totalDistance;
}
