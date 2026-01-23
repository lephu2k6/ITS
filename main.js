import { nodes } from "./data/nodes.js";
import { edges } from "./data/edges.js";
import { getTrafficMultiplier, getTrafficLevel } from "./simulation/traffic.js";
import { drawMap, drawRouteInfo, getNodeAtPosition } from "./map/renderer.js";
import { dijkstra, findAllRoutes } from "./algorithms/dijkstra.js";

// Khởi tạo canvas
const canvas = document.getElementById("map");
if (!canvas) {
  console.error("Canvas element not found!");
  throw new Error("Canvas element not found!");
}

const ctx = canvas.getContext("2d");
if (!ctx) {
  console.error("Could not get 2D context!");
  throw new Error("Could not get 2D context!");
}

const width = canvas.width;
const height = canvas.height;

console.log("Canvas initialized:", { width, height });
console.log("Nodes:", nodes);
console.log("Edges:", edges);

// State
let state = {
  startNode: null,
  endNode: null,
  selectedRoute: null,
  allRoutes: [],
  selectedNode: null,
  hour: new Date().getHours(),
  zoom: 1,
  offsetX: 0,
  offsetY: 0,
  isDragging: false,
  dragStart: { x: 0, y: 0 },
  surveyData: {
    totalRoutes: 0,
    totalTime: 0,
    averageTime: 0,
    routes: []
  }
};

// UI Elements
const startSelect = document.getElementById("startNode");
const endSelect = document.getElementById("endNode");
const hourInput = document.getElementById("hour");
const hourDisplay = document.getElementById("hourDisplay");
const trafficLevel = document.getElementById("trafficLevel");
const routeInfo = document.getElementById("routeInfo");
const surveyResults = document.getElementById("surveyResults");
const findRouteBtn = document.getElementById("findRoute");
const resetBtn = document.getElementById("reset");

// Khởi tạo dropdown
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

// Tìm route
function findRoute() {
  if (!state.startNode || !state.endNode || state.startNode === state.endNode) {
    alert("Vui lòng chọn điểm bắt đầu và điểm kết thúc khác nhau!");
    return;
  }

  const traffic = getTrafficMultiplier(state.hour);
  
  // Tìm route tối ưu bằng Dijkstra
  const optimalRoute = dijkstra(nodes, edges, state.startNode, state.endNode, traffic);
  
  // Tìm tất cả các route có thể
  state.allRoutes = findAllRoutes(nodes, edges, state.startNode, state.endNode, traffic, 3);
  state.selectedRoute = optimalRoute;

  // Cập nhật khảo sát
  updateSurvey();

  // Render
  render();
  updateRouteInfo();
}

// Cập nhật thông tin route
function updateRouteInfo() {
  if (!state.selectedRoute || state.selectedRoute.path.length === 0) {
    routeInfo.innerHTML = "<p>Chưa có tuyến đường được chọn</p>";
    return;
  }

  const route = state.selectedRoute;
  const traffic = getTrafficMultiplier(state.hour);
  
  routeInfo.innerHTML = `
    <h4>Tuyến đường được đề xuất</h4>
    <p><strong>Đường đi:</strong> ${route.path.join(" → ")}</p>
    <p><strong>Thời gian:</strong> ${route.time.toFixed(1)} phút</p>
    <p><strong>Hệ số giao thông:</strong> ${traffic.toFixed(2)}x</p>
    <p><strong>Giờ:</strong> ${state.hour}:00</p>
    ${state.allRoutes.length > 1 ? `
      <h5>Các tuyến khác (${state.allRoutes.length - 1}):</h5>
      <ul>
        ${state.allRoutes.slice(1).map((r, idx) => `
          <li>Tuyến ${idx + 2}: ${r.path.join(" → ")} - ${r.time.toFixed(1)} phút</li>
        `).join("")}
      </ul>
    ` : ""}
  `;
}

// Cập nhật khảo sát
function updateSurvey() {
  state.surveyData.totalRoutes = state.allRoutes.length;
  state.surveyData.totalTime = state.allRoutes.reduce((sum, r) => sum + r.time, 0);
  state.surveyData.averageTime = state.surveyData.totalTime / state.surveyData.totalRoutes;
  state.surveyData.routes = state.allRoutes;

  surveyResults.innerHTML = `
    <h4>Kết quả khảo sát</h4>
    <p><strong>Số tuyến đường tìm được:</strong> ${state.surveyData.totalRoutes}</p>
    <p><strong>Thời gian trung bình:</strong> ${state.surveyData.averageTime.toFixed(1)} phút</p>
    <p><strong>Tuyến nhanh nhất:</strong> ${state.allRoutes[0]?.path.join(" → ")} (${state.allRoutes[0]?.time.toFixed(1)} phút)</p>
    <p><strong>Tuyến chậm nhất:</strong> ${state.allRoutes[state.allRoutes.length - 1]?.path.join(" → ")} (${state.allRoutes[state.allRoutes.length - 1]?.time.toFixed(1)} phút)</p>
  `;
}

// Render map
function render() {
  try {
    const highlightPath = state.selectedRoute ? [state.selectedRoute.path] : [];
    
    drawMap(ctx, nodes, edges, highlightPath, {
      width,
      height,
      zoom: state.zoom,
      offsetX: state.offsetX,
      offsetY: state.offsetY,
      selectedNode: state.selectedNode,
      startNode: state.startNode,
      endNode: state.endNode
    });

    if (state.selectedRoute) {
      drawRouteInfo(ctx, state.selectedRoute, width);
    }
  } catch (error) {
    console.error("Error rendering map:", error);
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

hourInput.addEventListener("input", (e) => {
  state.hour = parseInt(e.target.value);
  hourDisplay.textContent = `${state.hour}:00`;
  trafficLevel.textContent = getTrafficLevel(state.hour);
  
  // Tự động tính lại route nếu đã có
  if (state.startNode && state.endNode) {
    findRoute();
  } else {
    render();
  }
});

findRouteBtn.addEventListener("click", findRoute);

resetBtn.addEventListener("click", () => {
  state.startNode = null;
  state.endNode = null;
  state.selectedRoute = null;
  state.allRoutes = [];
  state.selectedNode = null;
  startSelect.value = "";
  endSelect.value = "";
  routeInfo.innerHTML = "";
  surveyResults.innerHTML = "";
  render();
});

// Canvas interactions
canvas.addEventListener("click", (e) => {
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  
  const clickedNode = getNodeAtPosition(x, y, nodes, {
    zoom: state.zoom,
    offsetX: state.offsetX,
    offsetY: state.offsetY
  });

  if (clickedNode) {
    if (!state.startNode) {
      state.startNode = clickedNode;
      startSelect.value = clickedNode;
    } else if (!state.endNode && clickedNode !== state.startNode) {
      state.endNode = clickedNode;
      endSelect.value = clickedNode;
      findRoute();
    } else {
      // Reset và chọn lại
      state.startNode = clickedNode;
      state.endNode = null;
      state.selectedRoute = null;
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
  
  const hoveredNode = getNodeAtPosition(x, y, nodes, {
    zoom: state.zoom,
    offsetX: state.offsetX,
    offsetY: state.offsetY
  });

  state.selectedNode = hoveredNode;
  canvas.style.cursor = hoveredNode ? "pointer" : "default";
  render();
});

// Zoom với scroll
canvas.addEventListener("wheel", (e) => {
  e.preventDefault();
  const delta = e.deltaY > 0 ? 0.9 : 1.1;
  state.zoom = Math.max(0.5, Math.min(2, state.zoom * delta));
  render();
});

// Pan với drag
canvas.addEventListener("mousedown", (e) => {
  if (e.button === 1 || (e.button === 0 && e.ctrlKey)) {
    state.isDragging = true;
    state.dragStart = { x: e.clientX, y: e.clientY };
    canvas.style.cursor = "grabbing";
  }
});

canvas.addEventListener("mousemove", (e) => {
  if (state.isDragging) {
    state.offsetX += (e.clientX - state.dragStart.x) / state.zoom;
    state.offsetY += (e.clientY - state.dragStart.y) / state.zoom;
    state.dragStart = { x: e.clientX, y: e.clientY };
    render();
  }
});

canvas.addEventListener("mouseup", () => {
  state.isDragging = false;
  canvas.style.cursor = "default";
});

canvas.addEventListener("mouseleave", () => {
  state.isDragging = false;
  state.selectedNode = null;
  render();
});

// Hàm tự động căn chỉnh map vào view
function fitMapToView() {
  if (Object.keys(nodes).length === 0) {
    console.warn("No nodes to fit");
    return;
  }
  
  // Tìm min/max tọa độ
  const coords = Object.values(nodes);
  const minX = Math.min(...coords.map(n => n.x));
  const maxX = Math.max(...coords.map(n => n.x));
  const minY = Math.min(...coords.map(n => n.y));
  const maxY = Math.max(...coords.map(n => n.y));
  
  const mapWidth = maxX - minX;
  const mapHeight = maxY - minY;
  
  console.log("Map bounds:", { minX, maxX, minY, maxY, mapWidth, mapHeight });
  console.log("Canvas size:", { width, height });
  
  // Tính zoom và offset để fit vào canvas
  const padding = 80;
  let scaleX = (width - padding * 2) / mapWidth;
  let scaleY = (height - padding * 2) / mapHeight;
  
  // Tránh chia cho 0
  if (mapWidth === 0) scaleX = 1;
  if (mapHeight === 0) scaleY = 1;
  
  state.zoom = Math.min(scaleX, scaleY, 2); // Giới hạn zoom tối đa
  if (state.zoom < 0.1) state.zoom = 1; // Tránh zoom quá nhỏ
  
  // Căn giữa map
  const centerX = (minX + maxX) / 2;
  const centerY = (minY + maxY) / 2;
  state.offsetX = (width / 2) / state.zoom - centerX;
  state.offsetY = (height / 2) / state.zoom - centerY;
  
  console.log("Fit map:", { zoom: state.zoom, offsetX: state.offsetX, offsetY: state.offsetY });
}

// Khởi tạo
initDropdowns();
hourInput.value = state.hour;
hourDisplay.textContent = `${state.hour}:00`;
trafficLevel.textContent = getTrafficLevel(state.hour);
fitMapToView();
render();
