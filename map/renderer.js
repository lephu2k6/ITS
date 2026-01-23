/**
 * Render bản đồ với các tính năng nâng cao
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {Object} nodes - Danh sách nodes
 * @param {Array} edges - Danh sách edges
 * @param {Array} highlightPath - Đường đi được highlight
 * @param {Object} options - Tùy chọn render
 */
export function drawMap(ctx, nodes, edges, highlightPath = [], options = {}) {
  const {
    width = 800,
    height = 600,
    zoom = 1,
    offsetX = 0,
    offsetY = 0,
    selectedNode = null,
    startNode = null,
    endNode = null
  } = options;

  ctx.clearRect(0, 0, width, height);

  // Vẽ nền
  ctx.fillStyle = "#f8f9fa";
  ctx.fillRect(0, 0, width, height);
  
  // Vẽ grid nhẹ để dễ nhìn (tùy chọn)
  ctx.strokeStyle = "#e9ecef";
  ctx.lineWidth = 0.5;
  const gridSize = 50;
  for (let i = 0; i < width; i += gridSize) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i, height);
    ctx.stroke();
  }
  for (let i = 0; i < height; i += gridSize) {
    ctx.beginPath();
    ctx.moveTo(0, i);
    ctx.lineTo(width, i);
    ctx.stroke();
  }

  // Hàm transform tọa độ với zoom và pan
  // Đảm bảo tọa độ luôn nằm trong canvas
  const transform = (x, y) => {
    const tx = (x + offsetX) * zoom;
    const ty = (y + offsetY) * zoom;
    return { x: tx, y: ty };
  };

  // Vẽ đường
  if (!edges || edges.length === 0) {
    console.warn("No edges to draw");
  }
  
  edges.forEach(e => {
    const from = nodes[e.from];
    const to = nodes[e.to];
    if (!from || !to) {
      console.warn(`Missing node for edge ${e.from} -> ${e.to}`);
      return;
    }

    const fromPos = transform(from.x, from.y);
    const toPos = transform(to.x, to.y);

    // Kiểm tra xem edge có trong highlight path không
    const isHighlighted = highlightPath.some(path => {
      const pathStr = Array.isArray(path) ? path.join("") : path;
      return pathStr.includes(e.from + e.to) || pathStr.includes(e.to + e.from);
    });

    // Màu sắc và độ dày theo loại đường và highlight
    let color, lineWidth;
    if (isHighlighted) {
      color = "#4285F4"; // Google Maps blue
      lineWidth = 5;
    } else {
      switch (e.type) {
        case "highway":
          color = "#FF6B6B";
          lineWidth = 4;
          break;
        case "main":
          color = "#4ECDC4";
          lineWidth = 3;
          break;
        default:
          color = "#95A5A6";
          lineWidth = 2;
      }
    }

    // Kiểm tra xem edge có nằm trong viewport không
    const isInView = (
      (fromPos.x >= -100 && fromPos.x <= width + 100) ||
      (toPos.x >= -100 && toPos.x <= width + 100)
    ) && (
      (fromPos.y >= -100 && fromPos.y <= height + 100) ||
      (toPos.y >= -100 && toPos.y <= height + 100)
    );
    
    if (!isInView) return; // Bỏ qua edge nằm ngoài viewport
    
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.beginPath();
    ctx.moveTo(fromPos.x, fromPos.y);
    ctx.lineTo(toPos.x, toPos.y);
    ctx.stroke();

    // Vẽ mũi tên chỉ hướng (nếu cần)
    if (isHighlighted) {
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

  // Vẽ node
  if (!nodes || Object.keys(nodes).length === 0) {
    console.warn("No nodes to draw");
    return;
  }
  
  Object.entries(nodes).forEach(([key, node]) => {
    if (!node || node.x === undefined || node.y === undefined) {
      console.warn(`Invalid node: ${key}`, node);
      return;
    }
    
    const pos = transform(node.x, node.y);
    
    // Kiểm tra xem node có nằm trong viewport không
    if (pos.x < -50 || pos.x > width + 50 || pos.y < -50 || pos.y > height + 50) {
      return; // Bỏ qua node nằm ngoài viewport
    }
    
    // Xác định màu node
    let nodeColor = "#3498DB";
    let nodeSize = 10;
    
    if (key === startNode) {
      nodeColor = "#2ECC71"; // Xanh lá - điểm bắt đầu
      nodeSize = 14;
    } else if (key === endNode) {
      nodeColor = "#E74C3C"; // Đỏ - điểm kết thúc
      nodeSize = 14;
    } else if (key === selectedNode) {
      nodeColor = "#F39C12"; // Cam - node được chọn
      nodeSize = 12;
    }

    // Vẽ vòng tròn ngoài
    ctx.fillStyle = nodeColor;
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, nodeSize, 0, Math.PI * 2);
    ctx.fill();

    // Vẽ viền trắng
    ctx.strokeStyle = "#FFFFFF";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Vẽ nhãn
    ctx.fillStyle = "#2C3E50";
    ctx.font = "bold 12px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "bottom";
    ctx.fillText(key, pos.x, pos.y - nodeSize - 5);

    // Vẽ tên địa điểm nếu có
    if (node.name && (key === startNode || key === endNode || key === selectedNode)) {
      ctx.fillStyle = "#34495E";
      ctx.font = "10px Arial";
      ctx.fillText(node.name, pos.x, pos.y + nodeSize + 15);
    }
  });
}

/**
 * Vẽ thông tin route
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {Object} routeInfo - Thông tin route
 * @param {number} width - Chiều rộng canvas
 */
export function drawRouteInfo(ctx, routeInfo, width) {
  if (!routeInfo || !routeInfo.path || routeInfo.path.length === 0) return;

  const padding = 10;
  const boxHeight = 80;
  
  // Vẽ khung thông tin (với rounded corners)
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

  // Vẽ text
  ctx.fillStyle = "#2C3E50";
  ctx.font = "bold 14px Arial";
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  
  const routeText = `Tuyến: ${routeInfo.path.join(" → ")}`;
  ctx.fillText(routeText, padding + 15, padding + 15);

  ctx.font = "12px Arial";
  const timeText = `Thời gian: ${routeInfo.time.toFixed(1)} phút`;
  ctx.fillText(timeText, padding + 15, padding + 40);

  if (routeInfo.distance !== undefined) {
    const distText = `Khoảng cách: ${routeInfo.distance.toFixed(1)} km`;
    ctx.fillText(distText, padding + 200, padding + 40);
  }
}

/**
 * Kiểm tra xem một điểm có nằm trong node không
 * @param {number} x - Tọa độ x chuột
 * @param {number} y - Tọa độ y chuột
 * @param {Object} nodes - Danh sách nodes
 * @param {Object} options - Tùy chọn (zoom, offset)
 * @returns {string|null} ID của node hoặc null
 */
export function getNodeAtPosition(x, y, nodes, options = {}) {
  const { zoom = 1, offsetX = 0, offsetY = 0 } = options;
  const nodeRadius = 15;

  for (const [key, node] of Object.entries(nodes)) {
    const nodeX = (node.x + offsetX) * zoom;
    const nodeY = (node.y + offsetY) * zoom;
    const distance = Math.sqrt((x - nodeX) ** 2 + (y - nodeY) ** 2);
    
    if (distance <= nodeRadius) {
      return key;
    }
  }
  
  return null;
}