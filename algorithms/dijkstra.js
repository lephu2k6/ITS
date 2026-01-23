/**
 * Thuật toán Dijkstra để tìm đường đi ngắn nhất
 * @param {Object} nodes - Danh sách các node
 * @param {Array} edges - Danh sách các cạnh
 * @param {string} start - Node bắt đầu
 * @param {string} end - Node kết thúc
 * @param {number} trafficMultiplier - Hệ số giao thông
 * @returns {Object} { path: Array, distance: number, time: number }
 */
export function dijkstra(nodes, edges, start, end, trafficMultiplier = 1.0) {
  // Xây dựng đồ thị
  const graph = {};
  const distances = {};
  const previous = {};
  const unvisited = new Set();

  // Khởi tạo
  Object.keys(nodes).forEach(node => {
    graph[node] = [];
    distances[node] = Infinity;
    previous[node] = null;
    unvisited.add(node);
  });
  distances[start] = 0;

  // Xây dựng danh sách kề
  edges.forEach(edge => {
    const weight = edge.baseTime * trafficMultiplier;
    graph[edge.from].push({ node: edge.to, weight });
    // Đồ thị vô hướng
    if (!graph[edge.to]) graph[edge.to] = [];
    graph[edge.to].push({ node: edge.from, weight });
  });

  // Thuật toán Dijkstra
  while (unvisited.size > 0) {
    // Tìm node có khoảng cách nhỏ nhất
    let current = null;
    let minDistance = Infinity;
    
    unvisited.forEach(node => {
      if (distances[node] < minDistance) {
        minDistance = distances[node];
        current = node;
      }
    });

    if (current === null || current === end) break;
    unvisited.delete(current);

    // Cập nhật khoảng cách cho các node lân cận
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

  // Xây dựng đường đi
  const path = [];
  let current = end;
  
  if (previous[current] === null && current !== start) {
    return { path: [], distance: Infinity, time: Infinity };
  }

  while (current !== null) {
    path.unshift(current);
    current = previous[current];
  }

  return {
    path,
    distance: distances[end],
    time: distances[end]
  };
}

/**
 * Tìm tất cả các route có thể giữa 2 điểm
 * @param {Object} nodes - Danh sách các node
 * @param {Array} edges - Danh sách các cạnh
 * @param {string} start - Node bắt đầu
 * @param {string} end - Node kết thúc
 * @param {number} trafficMultiplier - Hệ số giao thông
 * @param {number} maxRoutes - Số lượng route tối đa
 * @returns {Array} Danh sách các route
 */
export function findAllRoutes(nodes, edges, start, end, trafficMultiplier = 1.0, maxRoutes = 3) {
  const routes = [];
  const graph = {};
  
  // Xây dựng đồ thị
  edges.forEach(edge => {
    if (!graph[edge.from]) graph[edge.from] = [];
    if (!graph[edge.to]) graph[edge.to] = [];
    const weight = edge.baseTime * trafficMultiplier;
    graph[edge.from].push({ node: edge.to, weight });
    graph[edge.to].push({ node: edge.from, weight });
  });

  // DFS để tìm tất cả các đường đi
  function dfs(current, target, visited, path, totalTime) {
    if (current === target) {
      routes.push({
        path: [...path],
        time: totalTime,
        distance: totalTime
      });
      return;
    }

    if (routes.length >= maxRoutes) return;

    if (graph[current]) {
      graph[current].forEach(neighbor => {
        if (!visited.has(neighbor.node)) {
          visited.add(neighbor.node);
          path.push(neighbor.node);
          dfs(neighbor.node, target, visited, path, totalTime + neighbor.weight);
          path.pop();
          visited.delete(neighbor.node);
        }
      });
    }
  }

  const visited = new Set([start]);
  dfs(start, end, visited, [start], 0);

  // Sắp xếp theo thời gian
  routes.sort((a, b) => a.time - b.time);
  return routes.slice(0, maxRoutes);
}

/**
 * Hàm tương thích với code cũ
 */
export function fakeSuggestRoute() {
  return ["A", "B", "D"];
}