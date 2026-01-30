// Vẽ bản đồ và giao diện

class MapRenderer {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        
        this.selectedNode = null;
        this.hoverNode = null;
        this.route = null;
        
        // Tọa độ bounds cho mapping
        this.bounds = this.calculateBounds();
        
        // Tỷ lệ zoom
        this.zoom = 1;
        this.pan = { x: 0, y: 0 };
        
        // Tọa độ các node trên canvas
        this.nodePositions = this.calculateNodePositions();
        
        // Thêm sự kiện
        this.setupEventListeners();
    }
    
    // Tính bounds dựa trên tọa độ các trạm
    calculateBounds() {
        const stops = Object.values(busSystem.stops);
        const lats = stops.map(s => s.lat);
        const lngs = stops.map(s => s.lng);
        
        const padding = 0.01; // Độ padding
        
        return {
            minLat: Math.min(...lats) - padding,
            maxLat: Math.max(...lats) + padding,
            minLng: Math.min(...lngs) - padding,
            maxLng: Math.max(...lngs) + padding
        };
    }
    
    // Tính vị trí các node trên canvas
    calculateNodePositions() {
        const positions = {};
        const bounds = this.bounds;
        
        const latRange = bounds.maxLat - bounds.minLat;
        const lngRange = bounds.maxLng - bounds.minLng;
        
        const padding = 80;
        const mapWidth = this.width - padding * 2;
        const mapHeight = this.height - padding * 2;
        
        Object.entries(busSystem.stops).forEach(([stopId, stop]) => {
            // Normalize tọa độ
            const normalizedLat = (bounds.maxLat - stop.lat) / latRange;
            const normalizedLng = (stop.lng - bounds.minLng) / lngRange;
            
            positions[stopId] = {
                x: padding + normalizedLng * mapWidth + this.pan.x,
                y: padding + normalizedLat * mapHeight + this.pan.y
            };
        });
        
        return positions;
    }
    
    // Vẽ bản đồ
    drawMap(startNode = null, endNode = null, route = null) {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.width, this.height);
        
        // Background
        this.ctx.fillStyle = '#f8f9fa';
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        // Vẽ các cạnh (đường đi)
        this.drawEdges();
        
        // Vẽ route nếu có
        if (route && route.path.length > 0) {
            this.drawRoute(route);
        }
        
        // Vẽ các node
        this.drawNodes(startNode, endNode);
        
        // Vẽ thông tin
        this.drawInfo();
    }
    
    // Vẽ các cạnh (đường đi giữa các trạm)
    drawEdges() {
        // Vẽ các tuyến xe bus
        busSystem.routes.forEach(route => {
            this.ctx.strokeStyle = route.color;
            this.ctx.lineWidth = 4;
            this.ctx.lineCap = 'round';
            this.ctx.setLineDash([]);
            
            // Vẽ từng đoạn của tuyến
            for (let i = 0; i < route.stops.length - 1; i++) {
                const fromStop = route.stops[i];
                const toStop = route.stops[i + 1];
                
                const fromPos = this.nodePositions[fromStop];
                const toPos = this.nodePositions[toStop];
                
                if (!fromPos || !toPos) continue;
                
                this.ctx.beginPath();
                this.ctx.moveTo(fromPos.x, fromPos.y);
                this.ctx.lineTo(toPos.x, toPos.y);
                this.ctx.stroke();
                
                // Vẽ mũi tên
                this.drawArrow(fromPos, toPos, route.color);
            }
        });
        
        // Vẽ các kết nối đi bộ
        this.ctx.strokeStyle = '#9b59b6';
        this.ctx.lineWidth = 2;
        this.ctx.setLineDash([5, 5]);
        
        busSystem.walkingConnections.forEach(connection => {
            const fromPos = this.nodePositions[connection.from];
            const toPos = this.nodePositions[connection.to];
            
            if (!fromPos || !toPos) return;
            
            this.ctx.beginPath();
            this.ctx.moveTo(fromPos.x, fromPos.y);
            this.ctx.lineTo(toPos.x, toPos.y);
            this.ctx.stroke();
        });
        
        this.ctx.setLineDash([]);
    }
    
    // Vẽ route được chọn
    drawRoute(route) {
        if (!route || !route.path || route.path.length < 2) return;
        
        this.ctx.strokeStyle = '#FFD700'; // Màu vàng cho route
        this.ctx.lineWidth = 6;
        this.ctx.lineCap = 'round';
        
        // Vẽ đường đi
        for (let i = 0; i < route.path.length - 1; i++) {
            const fromStop = route.path[i];
            const toStop = route.path[i + 1];
            
            const fromPos = this.nodePositions[fromStop];
            const toPos = this.nodePositions[toStop];
            
            if (!fromPos || !toPos) continue;
            
            this.ctx.beginPath();
            this.ctx.moveTo(fromPos.x, fromPos.y);
            this.ctx.lineTo(toPos.x, toPos.y);
            this.ctx.stroke();
            
            // Vẽ mũi tên lớn hơn cho route
            this.drawArrow(fromPos, toPos, '#FFD700', 15);
        }
        
        // Đánh số các bước
        route.path.forEach((stopId, index) => {
            const pos = this.nodePositions[stopId];
            if (!pos) return;
            
            // Vẽ số thứ tự
            this.ctx.fillStyle = '#FFD700';
            this.ctx.beginPath();
            this.ctx.arc(pos.x, pos.y, 15, 0, Math.PI * 2);
            this.ctx.fill();
            
            this.ctx.fillStyle = '#2C3E50';
            this.ctx.font = 'bold 14px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText((index + 1).toString(), pos.x, pos.y);
        });
    }
    
    // Vẽ các node (trạm xe bus)
    drawNodes(startNode, endNode) {
        Object.entries(this.nodePositions).forEach(([stopId, pos]) => {
            // Xác định màu và kích thước
            let color, radius, borderColor;
            
            if (stopId === startNode) {
                color = '#2ECC71'; // Xanh lá - điểm bắt đầu
                radius = 20;
                borderColor = '#27AE60';
            } else if (stopId === endNode) {
                color = '#E74C3C'; // Đỏ - điểm kết thúc
                radius = 20;
                borderColor = '#C0392B';
            } else if (stopId === this.hoverNode) {
                color = '#F39C12'; // Cam - đang hover
                radius = 18;
                borderColor = '#D35400';
            } else if (this.route && this.route.path.includes(stopId)) {
                color = '#3498DB'; // Xanh dương - trong route
                radius = 16;
                borderColor = '#2980B9';
            } else {
                color = '#34495E'; // Xám đậm - bình thường
                radius = 14;
                borderColor = '#2C3E50';
            }
            
            // Vẽ node
            this.ctx.fillStyle = color;
            this.ctx.beginPath();
            this.ctx.arc(pos.x, pos.y, radius, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Viền
            this.ctx.strokeStyle = borderColor;
            this.ctx.lineWidth = 3;
            this.ctx.stroke();
            
            // Tên trạm (chỉ hiển thị với node đặc biệt)
            if (stopId === startNode || stopId === endNode || stopId === this.hoverNode) {
                const stopInfo = busSystem.stops[stopId];
                this.ctx.fillStyle = '#2C3E50';
                this.ctx.font = 'bold 14px Arial';
                this.ctx.textAlign = 'center';
                this.ctx.textBaseline = 'bottom';
                this.ctx.fillText(stopInfo.name, pos.x, pos.y - radius - 5);
                
                // ID trạm
                this.ctx.font = 'bold 16px Arial';
                this.ctx.textBaseline = 'top';
                this.ctx.fillText(stopId, pos.x, pos.y + radius + 5);
            }
        });
    }
    
    // Vẽ mũi tên
    drawArrow(fromPos, toPos, color, size = 10) {
        const angle = Math.atan2(toPos.y - fromPos.y, toPos.x - fromPos.x);
        const midX = (fromPos.x + toPos.x) / 2;
        const midY = (fromPos.y + toPos.y) / 2;
        
        this.ctx.save();
        this.ctx.translate(midX, midY);
        this.ctx.rotate(angle);
        
        this.ctx.fillStyle = color;
        this.ctx.beginPath();
        this.ctx.moveTo(size, 0);
        this.ctx.lineTo(-size/2, -size/2);
        this.ctx.lineTo(-size/2, size/2);
        this.ctx.closePath();
        this.ctx.fill();
        
        this.ctx.restore();
    }
    
    // Vẽ thông tin
    drawInfo() {
        // Vẽ legend
        this.drawLegend();
        
        // Vẽ thông tin route nếu có
        if (this.route) {
            this.drawRouteInfo();
        }
    }
    
    // Vẽ legend
    drawLegend() {
        const legendItems = [
            { color: '#2ECC71', text: 'Điểm xuất phát' },
            { color: '#E74C3C', text: 'Điểm đến' },
            { color: '#3498DB', text: 'Trạm trong tuyến' },
            { color: '#FFD700', text: 'Tuyến đường tối ưu' }
        ];
        
        const startX = this.width - 200;
        const startY = 20;
        const itemHeight = 25;
        
        // Background
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        this.ctx.fillRect(startX - 10, startY - 10, 190, legendItems.length * itemHeight + 20);
        this.ctx.strokeStyle = '#DDD';
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(startX - 10, startY - 10, 190, legendItems.length * itemHeight + 20);
        
        // Items
        legendItems.forEach((item, index) => {
            const y = startY + index * itemHeight;
            
            // Color box
            this.ctx.fillStyle = item.color;
            this.ctx.fillRect(startX, y, 20, 15);
            this.ctx.strokeStyle = '#2C3E50';
            this.ctx.lineWidth = 1;
            this.ctx.strokeRect(startX, y, 20, 15);
            
            // Text
            this.ctx.fillStyle = '#2C3E50';
            this.ctx.font = '12px Arial';
            this.ctx.textAlign = 'left';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(item.text, startX + 30, y + 7.5);
        });
    }
    
    // Vẽ thông tin route
    drawRouteInfo() {
        if (!this.route || !this.route.summary) return;
        
        const summary = this.route.summary;
        const startX = 20;
        const startY = 20;
        
        // Background
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
        this.ctx.fillRect(startX - 10, startY - 10, 250, 100);
        this.ctx.strokeStyle = '#3498DB';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(startX - 10, startY - 10, 250, 100);
        
        // Title
        this.ctx.fillStyle = '#2C3E50';
        this.ctx.font = 'bold 16px Arial';
        this.ctx.textAlign = 'left';
        this.ctx.fillText('THÔNG TIN TUYẾN ĐƯỜNG', startX, startY + 15);
        
        // Info
        this.ctx.font = '14px Arial';
        this.ctx.fillText(`Thời gian: ${formatTime(summary.time)}`, startX, startY + 40);
        this.ctx.fillText(`Khoảng cách: ${summary.distance.toFixed(2)} km`, startX, startY + 60);
        this.ctx.fillText(`Chuyển xe: ${summary.transfers} lần`, startX, startY + 80);
        this.ctx.fillText(`Chi phí: ${formatCurrency(summary.fare)}`, startX, startY + 100);
    }
    
    // Setup event listeners
    setupEventListeners() {
        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            this.hoverNode = this.getNodeAtPosition(x, y);
            this.drawMap();
        });
        
        this.canvas.addEventListener('click', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const clickedNode = this.getNodeAtPosition(x, y);
            if (clickedNode) {
                this.onNodeClick(clickedNode);
            }
        });
        
        this.canvas.addEventListener('wheel', (e) => {
            e.preventDefault();
            const zoomFactor = 0.1;
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            if (e.deltaY < 0) {
                this.zoom *= (1 + zoomFactor);
            } else {
                this.zoom *= (1 - zoomFactor);
            }
            
            this.zoom = Math.max(0.5, Math.min(3, this.zoom));
            this.updateNodePositions();
            this.drawMap();
        });
    }
    
    // Lấy node tại vị trí click
    getNodeAtPosition(x, y) {
        for (const [stopId, pos] of Object.entries(this.nodePositions)) {
            const distance = Math.sqrt(
                Math.pow(x - pos.x, 2) + Math.pow(y - pos.y, 2)
            );
            if (distance <= 20) {
                return stopId;
            }
        }
        return null;
    }
    
    // Xử lý khi click vào node
    onNodeClick(nodeId) {
        // Tạo custom event để thông báo cho main.js
        const event = new CustomEvent('nodeclick', { 
            detail: { nodeId: nodeId } 
        });
        this.canvas.dispatchEvent(event);
    }
    
    // Cập nhật vị trí node khi zoom/pan
    updateNodePositions() {
        this.nodePositions = this.calculateNodePositions();
    }
    
    // Set route để vẽ
    setRoute(route) {
        this.route = route;
        this.drawMap();
    }
    
    // Clear route
    clearRoute() {
        this.route = null;
        this.drawMap();
    }
}

// Class để render thông tin route
class RouteRenderer {
    static renderRouteSummary(route, containerId) {
        const container = document.getElementById(containerId);
        if (!container || !route) {
            console.warn('Container hoặc route không tồn tại');
            return;
        }
        
        // Kiểm tra route.summary
        if (!route.summary) {
            console.error('Route không có summary:', route);
            container.innerHTML = '<div class="error">Lỗi: Không có thông tin tuyến đường</div>';
            return;
        }
        
        const summary = route.summary;
        
        container.innerHTML = `
            <div class="summary-card">
                <div class="summary-header">
                    <h4><i class="fas fa-route"></i> Tuyến Đường Tối Ưu</h4>
                    <span class="badge time-badge">${formatTime(summary.time || 0)}</span>
                </div>
                
                <div class="summary-stats">
                    <div class="stat-row">
                        <span class="stat-label"><i class="fas fa-exchange-alt"></i> Số lần chuyển xe:</span>
                        <span class="stat-value">${summary.transfers || 0}</span>
                    </div>
                    <div class="stat-row">
                        <span class="stat-label"><i class="fas fa-money-bill-wave"></i> Tổng chi phí:</span>
                        <span class="stat-value">${formatCurrency(summary.fare || 0)}</span>
                    </div>
                    <div class="stat-row">
                        <span class="stat-label"><i class="fas fa-road"></i> Khoảng cách:</span>
                        <span class="stat-value">${(summary.distance || 0).toFixed(2)} km</span>
                    </div>
                </div>
                
                <div class="summary-path">
                    <h5><i class="fas fa-map-signs"></i> Lộ trình:</h5>
                    <div class="path-steps">
                        ${(route.path || []).map((stopId, index) => `
                            <div class="path-step ${index === 0 ? 'first' : index === (route.path.length - 1) ? 'last' : ''}">
                                <span class="step-number">${index + 1}</span>
                                <span class="step-name">${busSystem.stops[stopId] ? busSystem.stops[stopId].name : stopId}</span>
                                ${index < (route.path.length - 1) ? '<span class="step-arrow">→</span>' : ''}
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    }
    static renderStepByStep(steps, containerId) {
        const container = document.getElementById(containerId);
        if (!container || !steps || !Array.isArray(steps)) {
            console.warn('Container hoặc steps không hợp lệ');
            return;
        }
        
        if (steps.length === 0) {
            container.innerHTML = '<div class="no-steps">Không có thông tin chi tiết</div>';
            return;
        }
        
        container.innerHTML = steps.map(step => {
            const trafficNote = (step.trafficMultiplier != null && step.trafficMultiplier > 1)
                ? `<span class="traffic-note" title="Giờ cao điểm"> <i class="fas fa-traffic-light"></i> ×${step.trafficMultiplier.toFixed(1)}</span>`
                : '';
            return `
            <div class="step-item ${(step.type || '').toLowerCase()}">
                <div class="step-icon">
                    ${step.icon || (step.type === 'BUS' ? '🚌' : step.type === 'WALK' ? '🚶' : '⏱️')}
                </div>
                <div class="step-content">
                    <div class="step-title">${step.description || 'Di chuyển'}${trafficNote}</div>
                    <div class="step-details">
                        ${step.distance ? `<span><i class="fas fa-ruler"></i> ${(step.distance || 0).toFixed(2)} km</span>` : ''}
                        ${step.routeNumber ? `<span><i class="fas fa-bus"></i> Tuyến ${step.routeNumber}</span>` : ''}
                    </div>
                </div>
                <div class="step-time">
                    ${step.duration ? formatTime(step.duration) : ''}
                    ${step.arrivalTime ? `<div class="arrival-time">${step.arrivalTime}</div>` : ''}
                </div>
            </div>
        `;
        }).join('');
    }

    
    static renderAlternativeRoutes(routes, containerId) {
        const container = document.getElementById(containerId);
        if (!container || !routes.length) return;
        
        container.innerHTML = `
            <h4><i class="fas fa-route"></i> Các Tuyến Thay Thế</h4>
            <div class="alternatives-grid">
                ${routes.map((route, index) => `
                    <div class="alternative-card">
                        <div class="alt-header">
                            <h5>Phương án ${index + 1}</h5>
                            <span class="badge ${route.difference.time > 0 ? 'badge-warning' : 'badge-success'}">
                                ${route.difference.time > 0 ? '+' : ''}${formatTime(route.difference.time)}
                            </span>
                        </div>
                        <div class="alt-stats">
                            <div><i class="fas fa-clock"></i> ${formatTime(route.summary.time)}</div>
                            <div><i class="fas fa-exchange-alt"></i> ${route.summary.transfers} chuyển</div>
                            <div><i class="fas fa-money-bill-wave"></i> ${formatCurrency(route.summary.fare)}</div>
                        </div>
                        <button class="btn-small" onclick="selectAlternativeRoute(${index})">
                            <i class="fas fa-eye"></i> Xem chi tiết
                        </button>
                    </div>
                `).join('')}
            </div>
        `;
    }
}