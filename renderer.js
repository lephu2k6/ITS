/**
 * Renderer.js - Map Visualization
 * 
 * This simulates how Google Maps renders the map on screen:
 * - Converts GPS coordinates to screen coordinates
 * - Draws roads with traffic colors (green/yellow/red)
 * - Highlights the optimal route
 * - Shows nodes (locations) on the map
 */

/**
 * Get traffic color based on traffic status
 * This simulates Google Maps traffic color coding
 * 
 * @param {string} status - 'green', 'yellow', or 'red'
 * @returns {string} Hex color code
 */
function getTrafficColor(status) {
  switch (status) {
    case 'green':
      return '#4CAF50'; // Light traffic
    case 'yellow':
      return '#FFC107'; // Moderate traffic
    case 'red':
      return '#F44336'; // Heavy traffic
    default:
      return '#95A5A6'; // Unknown
  }
}

/**
 * Get traffic multiplier based on status
 * This simulates how traffic affects travel time
 * 
 * @param {string} status - Traffic status
 * @returns {number} Multiplier (1.0 = normal, higher = slower)
 */
export function getTrafficMultiplier(status) {
  switch (status) {
    case 'green':
      return 1.0; // Normal speed
    case 'yellow':
      return 1.5; // 50% slower
    case 'red':
      return 2.5; // 150% slower
    default:
      return 1.0;
  }
}

/**
 * Draw the map with nodes, edges, and route
 * 
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {Object} nodes - Nodes with GPS coordinates
 * @param {Array} edges - Edges with traffic status
 * @param {Array} routePath - Path to highlight (optimal route)
 * @param {Object} bounds - GPS bounds for coordinate conversion
 * @param {Object} options - Rendering options
 */
export function drawMap(ctx, nodes, edges, routePath = [], bounds, options = {}) {
  const {
    width = 800,
    height = 600,
    startNode = null,
    endNode = null,
    selectedNode = null
  } = options;

  // Clear canvas
  ctx.clearRect(0, 0, width, height);

  // Draw background
  ctx.fillStyle = "#f8f9fa";
  ctx.fillRect(0, 0, width, height);

  // Convert GPS to canvas coordinates with padding
  const padding = 50; // Padding around map
  const nodePositions = {};
  const latRange = bounds.maxLat - bounds.minLat;
  const lngRange = bounds.maxLng - bounds.minLng;
  const mapWidth = width - padding * 2;
  const mapHeight = height - padding * 2;
  
  Object.keys(nodes).forEach(nodeId => {
    const node = nodes[nodeId];
    
    // Normalize coordinates (0 to 1)
    const normalizedLat = (bounds.maxLat - node.lat) / latRange;
    const normalizedLng = (node.lng - bounds.minLng) / lngRange;
    
    // Convert to canvas coordinates with padding
    nodePositions[nodeId] = {
      x: padding + normalizedLng * mapWidth,
      y: padding + normalizedLat * mapHeight
    };
  });

  // Draw edges (roads) first
  edges.forEach(edge => {
    const fromPos = nodePositions[edge.from];
    const toPos = nodePositions[edge.to];
    
    if (!fromPos || !toPos) return;

    // Check if this edge is part of the optimal route
    const isInRoute = routePath.length > 0 && 
      routePath.some((node, idx) => 
        idx < routePath.length - 1 &&
        ((node === edge.from && routePath[idx + 1] === edge.to) ||
         (node === edge.to && routePath[idx + 1] === edge.from))
      );

    // Choose color and width
    let color, lineWidth;
    if (isInRoute) {
      // Highlight optimal route in blue (like Google Maps)
      color = "#4285F4";
      lineWidth = 5;
    } else {
      // Use traffic color
      color = getTrafficColor(edge.trafficStatus);
      lineWidth = edge.roadType === 'highway' ? 4 : 
                  edge.roadType === 'main' ? 3 : 2;
    }

    // Draw road
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.beginPath();
    ctx.moveTo(fromPos.x, fromPos.y);
    ctx.lineTo(toPos.x, toPos.y);
    ctx.stroke();

    // Draw arrow on route
    if (isInRoute) {
      const midX = (fromPos.x + toPos.x) / 2;
      const midY = (fromPos.y + toPos.y) / 2;
      const angle = Math.atan2(toPos.y - fromPos.y, toPos.x - fromPos.x);
      
      ctx.save();
      ctx.translate(midX, midY);
      ctx.rotate(angle);
      ctx.fillStyle = "#4285F4";
      ctx.beginPath();
      ctx.moveTo(8, 0);
      ctx.lineTo(-4, -4);
      ctx.lineTo(-4, 4);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
  });

  // Draw nodes (locations)
  Object.entries(nodes).forEach(([nodeId, node]) => {
    const pos = nodePositions[nodeId];
    if (!pos) return;

    // Determine node color and size
    let nodeColor = "#3498DB";
    let nodeSize = 10;
    
    if (nodeId === startNode) {
      nodeColor = "#2ECC71"; // Green - start
      nodeSize = 14;
    } else if (nodeId === endNode) {
      nodeColor = "#E74C3C"; // Red - end
      nodeSize = 14;
    } else if (nodeId === selectedNode) {
      nodeColor = "#F39C12"; // Orange - selected
      nodeSize = 12;
    }

    // Draw node circle
    ctx.fillStyle = nodeColor;
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, nodeSize, 0, Math.PI * 2);
    ctx.fill();

    // Draw white border
    ctx.strokeStyle = "#FFFFFF";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw label
    ctx.fillStyle = "#2C3E50";
    ctx.font = "bold 18px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "bottom";
    ctx.fillText(nodeId, pos.x, pos.y - nodeSize - 5);

    // Draw name if selected
    if (node.name && (nodeId === startNode || nodeId === endNode || nodeId === selectedNode)) {
      ctx.fillStyle = "#34495E";
      ctx.font = "14px Arial";
      ctx.fillText(node.name, pos.x, pos.y + nodeSize + 15);
    }
  });
}

/**
 * Draw route information overlay
 * 
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {Object} routeInfo - Route information
 * @param {number} width - Canvas width
 */
export function drawRouteInfo(ctx, routeInfo, width) {
  if (!routeInfo || !routeInfo.path || routeInfo.path.length === 0) return;

  const padding = 10;
  const boxHeight = 80;
  
  // Draw info box with rounded corners
  ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
  ctx.strokeStyle = "#DDD";
  ctx.lineWidth = 1;
  const radius = 8;
  const x = padding;
  const y = padding;
  const w = width - padding * 2;
  const h = boxHeight;
  
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + w - radius, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
  ctx.lineTo(x + w, y + h - radius);
  ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
  ctx.lineTo(x + radius, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Draw text
  ctx.fillStyle = "#2C3E50";
  ctx.font = "bold 14px Arial";
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  
  const routeText = `Tuyến đường: ${routeInfo.path.join(" → ")}`;
  ctx.fillText(routeText, padding + 15, padding + 15);

  ctx.font = "12px Arial";
  const timeText = `Thời gian: ${routeInfo.time.toFixed(1)} phút`;
  ctx.fillText(timeText, padding + 15, padding + 40);

  if (routeInfo.distance !== undefined) {
    const distText = `Khoảng cách: ${routeInfo.distance.toFixed(2)} km`;
    ctx.fillText(distText, padding + 200, padding + 40);
  }
}

/**
 * Check if a point (mouse click) is near a node
 * 
 * @param {number} x - Mouse X coordinate
 * @param {number} y - Mouse Y coordinate
 * @param {Object} nodes - All nodes
 * @param {Object} bounds - GPS bounds
 * @param {number} width - Canvas width
 * @param {number} height - Canvas height
 * @returns {string|null} Node ID or null
 */
export function getNodeAtPosition(x, y, nodes, bounds, width, height) {
  const nodeRadius = 20; // Increased for easier clicking
  const padding = 50;

  for (const [nodeId, node] of Object.entries(nodes)) {
    const latRange = bounds.maxLat - bounds.minLat;
    const lngRange = bounds.maxLng - bounds.minLng;
    const mapWidth = width - padding * 2;
    const mapHeight = height - padding * 2;
    
    const normalizedLat = (bounds.maxLat - node.lat) / latRange;
    const normalizedLng = (node.lng - bounds.minLng) / lngRange;
    
    const nodeX = padding + normalizedLng * mapWidth;
    const nodeY = padding + normalizedLat * mapHeight;
    
    const distance = Math.sqrt((x - nodeX) ** 2 + (y - nodeY) ** 2);
    
    if (distance <= nodeRadius) {
      return nodeId;
    }
  }
  
  return null;
}
