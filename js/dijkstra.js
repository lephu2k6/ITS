// Thuật toán Dijkstra và các biến thể

class PriorityQueue {
    constructor() {
        this.heap = [];
    }
    
    enqueue(node, priority) {
        this.heap.push({ node, priority });
        this.bubbleUp(this.heap.length - 1);
    }
    
    dequeue() {
        const min = this.heap[0];
        const end = this.heap.pop();
        if (this.heap.length > 0) {
            this.heap[0] = end;
            this.sinkDown(0);
        }
        return min;
    }
    
    isEmpty() {
        return this.heap.length === 0;
    }
    
    bubbleUp(index) {
        const element = this.heap[index];
        while (index > 0) {
            const parentIndex = Math.floor((index - 1) / 2);
            const parent = this.heap[parentIndex];
            if (element.priority >= parent.priority) break;
            this.heap[parentIndex] = element;
            this.heap[index] = parent;
            index = parentIndex;
        }
    }
    
    sinkDown(index) {
        const length = this.heap.length;
        const element = this.heap[index];
        
        while (true) {
            let leftChildIndex = 2 * index + 1;
            let rightChildIndex = 2 * index + 2;
            let leftChild, rightChild;
            let swap = null;
            
            if (leftChildIndex < length) {
                leftChild = this.heap[leftChildIndex];
                if (leftChild.priority < element.priority) {
                    swap = leftChildIndex;
                }
            }
            
            if (rightChildIndex < length) {
                rightChild = this.heap[rightChildIndex];
                if (
                    (swap === null && rightChild.priority < element.priority) ||
                    (swap !== null && rightChild.priority < leftChild.priority)
                ) {
                    swap = rightChildIndex;
                }
            }
            
            if (swap === null) break;
            this.heap[index] = this.heap[swap];
            this.heap[swap] = element;
            index = swap;
        }
    }
}

// Dijkstra cơ bản
function dijkstra(graph, start, end) {
    const distances = {};
    const previous = {};
    const visited = {};
    const pq = new PriorityQueue();
    
    // Khởi tạo
    Object.keys(graph).forEach(node => {
        distances[node] = Infinity;
        previous[node] = null;
    });
    distances[start] = 0;
    pq.enqueue(start, 0);
    
    while (!pq.isEmpty()) {
        const { node: current } = pq.dequeue();
        
        if (current === end) break;
        if (visited[current]) continue;
        visited[current] = true;
        
        graph[current].forEach(neighbor => {
            const alt = distances[current] + neighbor.weight;
            if (alt < distances[neighbor.node]) {
                distances[neighbor.node] = alt;
                previous[neighbor.node] = {
                    node: current,
                    edgeInfo: neighbor
                };
                pq.enqueue(neighbor.node, alt);
            }
        });
    }
    
    // Xây dựng đường đi
    const path = [];
    const edgeDetails = [];
    let current = end;
    
    while (current !== null) {
        path.unshift(current);
        if (previous[current]) {
            edgeDetails.unshift(previous[current].edgeInfo);
            current = previous[current].node;
        } else {
            current = null;
        }
    }
    
    if (path.length === 1 && path[0] !== start) {
        return { path: [], details: [], totalWeight: Infinity };
    }
    
    return {
        path: path,
        details: edgeDetails,
        totalWeight: distances[end]
    };
}

// Dijkstra đa tiêu chí
function dijkstraMultiCriteria(graph, start, end, criteria = 'time') {
    // Kiểm tra đầu vào
    if (!graph || !graph[start] || !graph[end]) {
        console.error('Graph hoặc node không hợp lệ');
        return {
            path: [],
            details: [],
            totalTime: Infinity,
            totalFare: Infinity,
            totalDistance: Infinity,
            transfers: Infinity,
            totalWeight: Infinity
        };
    }
    
    const distances = {};
    const previous = {};
    const visited = {};
    const pq = new PriorityQueue();
    
    // Khởi tạo
    Object.keys(graph).forEach(node => {
        distances[node] = Infinity;
        previous[node] = null;
    });
    distances[start] = 0;
    pq.enqueue(start, 0);
    
    // Biến để theo dõi số lần chuyển xe
    const transferCount = {};
    Object.keys(graph).forEach(node => {
        transferCount[node] = 0;
    });
    transferCount[start] = 0;
    
    let lastRouteId = null;
    
    while (!pq.isEmpty()) {
        const { node: current } = pq.dequeue();
        
        if (current === end) break;
        if (visited[current]) continue;
        visited[current] = true;
        
        // Kiểm tra nếu current có trong graph
        if (!graph[current]) continue;
        
        graph[current].forEach(neighbor => {
            if (!neighbor || !neighbor.node) return;
            
            let alt;
            const currentEdgeWeight = neighbor.weights ? neighbor.weights[criteria] : (neighbor.weight || 0);
            
            if (criteria === 'transfers') {
                alt = transferCount[current];
                
                if (neighbor.type === 'BUS' && lastRouteId && 
                    neighbor.routeId !== lastRouteId && 
                    previous[current] && previous[current].edgeInfo &&
                    previous[current].edgeInfo.routeId !== neighbor.routeId) {
                    alt += 1;
                }
            } else {
                alt = distances[current] + currentEdgeWeight;
            }
            
            if (alt < distances[neighbor.node]) {
                distances[neighbor.node] = alt;
                transferCount[neighbor.node] = alt;
                
                previous[neighbor.node] = {
                    node: current,
                    edgeInfo: neighbor,
                    transferCount: alt
                };
                
                pq.enqueue(neighbor.node, alt);
                
                if (neighbor.type === 'BUS') {
                    lastRouteId = neighbor.routeId;
                }
            }
        });
    }
    
    // Xây dựng đường đi
    const path = [];
    const edgeDetails = [];
    let current = end;
    let totalTime = 0;
    let totalFare = 0;
    let totalDistance = 0;
    let transfers = 0;
    let currentRouteId = null;
    
    // Kiểm tra nếu không tìm được đường
    if (distances[end] === Infinity) {
        return {
            path: [],
            details: [],
            totalTime: Infinity,
            totalFare: Infinity,
            totalDistance: Infinity,
            transfers: Infinity,
            totalWeight: Infinity
        };
    }
    
    while (current !== null) {
        path.unshift(current);
        if (previous[current]) {
            const edge = previous[current].edgeInfo;
            if (edge) {
                edgeDetails.unshift(edge);
                
                if (edge.travelTime) totalTime += edge.travelTime;
                if (edge.waitTime && edgeDetails.length === 1) totalTime += edge.waitTime;
                if (edge.fare) totalFare += edge.fare;
                if (edge.distance) totalDistance += edge.distance;
                
                if (edge.type === 'BUS' && currentRouteId && 
                    edge.routeId !== currentRouteId) {
                    transfers++;
                }
                if (edge.type === 'BUS') {
                    currentRouteId = edge.routeId;
                }
            }
            current = previous[current].node;
        } else {
            current = null;
        }
    }
    
    return {
        path: path,
        details: edgeDetails,
        totalTime: totalTime,
        totalFare: totalFare,
        totalDistance: totalDistance,
        transfers: transfers,
        totalWeight: distances[end]
    };
}


// Tìm K đường đi ngắn nhất
function kShortestPaths(graph, start, end, k = 3) {
    const paths = [];
    const deviations = new PriorityQueue();
    
    // Tìm đường đi ngắn nhất đầu tiên
    const shortestPath = dijkstra(graph, start, end);
    if (shortestPath.path.length === 0) return [];
    
    paths.push(shortestPath);
    
    // Tìm các đường đi khác
    for (let i = 0; i < k - 1; i++) {
        const prevPath = paths[i];
        
        for (let j = 0; j < prevPath.path.length - 1; j++) {
            const spurNode = prevPath.path[j];
            const rootPath = prevPath.path.slice(0, j + 1);
            
            // Tạm thời xóa các cạnh
            const removedEdges = [];
            paths.forEach(path => {
                if (path.path.slice(0, j + 1).toString() === rootPath.toString()) {
                    const from = path.path[j];
                    const to = path.path[j + 1];
                    const edgeIndex = graph[from].findIndex(e => e.node === to);
                    if (edgeIndex !== -1) {
                        removedEdges.push({ from, to, edge: graph[from][edgeIndex] });
                        graph[from].splice(edgeIndex, 1);
                    }
                }
            });
            
            // Tìm đường từ spurNode đến end
            const spurPath = dijkstra(graph, spurNode, end);
            
            if (spurPath.path.length > 0) {
                const totalPath = rootPath.slice(0, -1).concat(spurPath.path);
                const totalWeight = calculatePathWeight(graph, totalPath);
                
                deviations.enqueue({
                    path: totalPath,
                    weight: totalWeight
                }, totalWeight);
            }
            
            // Khôi phục các cạnh
            removedEdges.forEach(({ from, edge }) => {
                graph[from].push(edge);
            });
        }
        
        if (deviations.isEmpty()) break;
        
        const nextPath = deviations.dequeue().node;
        paths.push({
            path: nextPath.path,
            weight: nextPath.weight
        });
    }
    
    return paths;
}

// Tính trọng số của một đường đi
function calculatePathWeight(graph, path) {
    let totalWeight = 0;
    for (let i = 0; i < path.length - 1; i++) {
        const from = path[i];
        const to = path[i + 1];
        const edge = graph[from].find(e => e.node === to);
        if (edge) {
            totalWeight += edge.weight;
        }
    }
    return totalWeight;
}