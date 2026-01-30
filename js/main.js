// Main application file

class BusRouteApp {
    constructor() {
        this.startStop = null;
        this.endStop = null;
        this.currentCriteria = 'time';
        this.departureTime = '08:00';
        this.currentRoute = null;
        this.leafletMap = null;
        this.graphView = null;

        this.init();
    }

    init() {
        this.initDropdowns();
        this.initViews();
        this.setupEventListeners();
        this.syncViews();
        setTimeout(() => {
            showNotification('Hệ thống đã sẵn sàng! Chọn điểm xuất phát và điểm đến để bắt đầu.', 'success');
        }, 1000);
    }

    initViews() {
        this.leafletMap = initLeafletMapView && initLeafletMapView();
        this.graphView = initGraphView && initGraphView();
        const self = this;
        if (this.leafletMap) {
            this.leafletMap.setNodeClickHandler(function(id) { self.handleNodeClick(id); });
        }
        if (this.graphView) {
            this.graphView.setNodeClickHandler(function(id) { self.handleNodeClick(id); });
        }
    }

    syncViews() {
        const route = this.currentRoute || (busRouteSystem && busRouteSystem.currentRoute) || null;
        if (this.leafletMap) {
            this.leafletMap.drawMap(this.startStop, this.endStop, route);
        }
        if (this.graphView) {
            this.graphView.drawMap(this.startStop, this.endStop, route);
        }
    }
    
    initDropdowns() {
        const startSelect = document.getElementById('startPoint');
        const endSelect = document.getElementById('endPoint');
        
        // Clear existing options
        startSelect.innerHTML = '<option value="">-- Chọn điểm xuất phát --</option>';
        endSelect.innerHTML = '<option value="">-- Chọn điểm đến --</option>';
        
        // Thêm các trạm vào dropdown
        Object.entries(busSystem.stops).forEach(([stopId, stop]) => {
            const option1 = document.createElement('option');
            option1.value = stopId;
            option1.textContent = `${stopId} - ${stop.name}`;
            startSelect.appendChild(option1);
            
            const option2 = document.createElement('option');
            option2.value = stopId;
            option2.textContent = `${stopId} - ${stop.name}`;
            endSelect.appendChild(option2);
        });
    }
    
    setupEventListeners() {
        // Tab chuyển đổi: Bản đồ thật / Đồ thị
        document.querySelectorAll('.view-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                const view = tab.dataset.view;
                document.querySelectorAll('.view-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                document.getElementById('mapView').classList.toggle('active', view === 'map');
                document.getElementById('graphView').classList.toggle('active', view === 'graph');
                if (view === 'map' && this.leafletMap && this.leafletMap.map) {
                    setTimeout(() => this.leafletMap.map.invalidateSize(), 100);
                }
            });
        });

        // Dropdown changes
        document.getElementById('startPoint').addEventListener('change', (e) => {
            this.startStop = e.target.value || null;
            this.syncViews();
        });

        document.getElementById('endPoint').addEventListener('change', (e) => {
            this.endStop = e.target.value || null;
            this.syncViews();
        });
        
        // Criteria changes
        document.querySelectorAll('input[name="criteria"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.currentCriteria = e.target.value;
            });
        });
        
        // Departure time
        document.getElementById('departureTime').addEventListener('change', (e) => {
            this.departureTime = e.target.value;
        });
        
        // Max wait time slider
        const waitTimeSlider = document.getElementById('maxWaitTime');
        const waitTimeValue = document.getElementById('waitTimeValue');
        
        waitTimeSlider.addEventListener('input', (e) => {
            const value = e.target.value;
            waitTimeValue.textContent = `${value} phút`;
            busRouteSystem.settings.maxWaitTime = parseInt(value);
        });
        
        // Find route button
        document.getElementById('findRouteBtn').addEventListener('click', () => {
            this.findRoute();
        });
        
        // Reset button
        document.getElementById('resetBtn').addEventListener('click', () => {
            this.reset();
        });
        
        // Compare button
        document.getElementById('compareBtn').addEventListener('click', () => {
            this.showComparison();
        });
    }
    
    handleNodeClick(nodeId) {
        if (!this.startStop) {
            // Set as start point
            this.startStop = nodeId;
            document.getElementById('startPoint').value = nodeId;
            showNotification(`Đã chọn điểm xuất phát: ${busSystem.stops[nodeId].name}`, 'info');
        } else if (!this.endStop && nodeId !== this.startStop) {
            // Set as end point
            this.endStop = nodeId;
            document.getElementById('endPoint').value = nodeId;
            showNotification(`Đã chọn điểm đến: ${busSystem.stops[nodeId].name}`, 'info');
            
            // Tự động tìm route
            setTimeout(() => this.findRoute(), 500);
        } else {
            // Reset và chọn lại
            this.startStop = nodeId;
            this.endStop = null;
            document.getElementById('startPoint').value = nodeId;
            document.getElementById('endPoint').value = '';
            showNotification(`Đã chọn điểm xuất phát mới: ${busSystem.stops[nodeId].name}`, 'info');
        }
        
        this.syncViews();
    }

    findRoute() {
        if (!this.startStop || !this.endStop) {
            showNotification('Vui lòng chọn cả điểm xuất phát và điểm đến!', 'error');
            return;
        }
        
        if (this.startStop === this.endStop) {
            showNotification('Điểm xuất phát và điểm đến không thể giống nhau!', 'error');
            return;
        }
        
        // Hiển thị loading
        showNotification('Đang tìm tuyến đường tối ưu...', 'info');
        
        // Tìm route
        const route = busRouteSystem.findOptimalRoute(
            this.startStop,
            this.endStop,
            this.currentCriteria,
            this.departureTime
        );
        
        if (!route) {
            return;
        }
        
        this.currentRoute = route;
        this.syncViews();
        this.displayRouteResults(route);
        
        showNotification(`Đã tìm thấy tuyến đường tối ưu! Thời gian: ${formatTime(route.summary.time)}`, 'success');
    }
    
    displayRouteResults(route) {
        // Kiểm tra route hợp lệ
        if (!route || !route.summary) {
            console.error('Route không hợp lệ:', route);
            showNotification('Lỗi: Thông tin tuyến đường không hợp lệ', 'error');
            return;
        }
        
        // Hiển thị panel kết quả
        const resultPanel = document.getElementById('resultPanel');
        if (resultPanel) {
            resultPanel.classList.remove('hidden');
        }
        
        // Render route summary
        RouteRenderer.renderRouteSummary(route, 'routeSummary');
        
        // Hiển thị chi tiết hành trình
        const routeDetails = document.getElementById('routeDetails');
        if (routeDetails) {
            routeDetails.classList.remove('hidden');
        }
        
        // Render step by step
        if (route.stepDetails && Array.isArray(route.stepDetails)) {
            RouteRenderer.renderStepByStep(route.stepDetails, 'stepByStep');
        } else {
            document.getElementById('stepByStep').innerHTML = '<div class="no-steps">Không có thông tin chi tiết</div>';
        }
        
        // Cập nhật stats - kiểm tra từng element
        const totalTimeEl = document.getElementById('totalTime');
        const transferCountEl = document.getElementById('transferCount');
        const totalFareEl = document.getElementById('totalFare');
        const totalDistanceEl = document.getElementById('totalDistance');
        
        if (totalTimeEl) totalTimeEl.textContent = formatTime(route.summary.time || 0);
        if (transferCountEl) transferCountEl.textContent = (route.summary.transfers || 0).toString();
        if (totalFareEl) totalFareEl.textContent = formatCurrency(route.summary.fare || 0);
        if (totalDistanceEl) totalDistanceEl.textContent = `${(route.summary.distance || 0).toFixed(2)} km`;
    }
    
    reset() {
        this.startStop = null;
        this.endStop = null;
        
        document.getElementById('startPoint').value = '';
        document.getElementById('endPoint').value = '';
        
        document.getElementById('resultPanel').classList.add('hidden');
        document.getElementById('routeDetails').classList.add('hidden');

        this.currentRoute = null;
        if (this.leafletMap) this.leafletMap.clearRoute();
        if (this.graphView) this.graphView.clearRoute();
        this.syncViews();

        showNotification('Đã đặt lại tất cả lựa chọn', 'info');
    }
    
    showComparison() {
        if (!busRouteSystem.currentRoute) {
            showNotification('Vui lòng tìm một tuyến đường trước!', 'error');
            return;
        }
        
        if (busRouteSystem.alternativeRoutes.length === 0) {
            showNotification('Không có tuyến thay thế nào được tìm thấy', 'info');
            return;
        }
        
        // Tạo modal để hiển thị so sánh
        this.createComparisonModal();
    }
    
    createComparisonModal() {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3><i class="fas fa-balance-scale"></i> So Sánh Các Tuyến Đường</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="comparison-grid">
                        <!-- Current route -->
                        <div class="comparison-card current">
                            <div class="card-header">
                                <h4>TUYẾN HIỆN TẠI</h4>
                                <span class="badge badge-success">TỐI ƯU</span>
                            </div>
                            <div class="card-stats">
                                <div class="stat">
                                    <div class="stat-label">Thời gian</div>
                                    <div class="stat-value">${formatTime(busRouteSystem.currentRoute.summary.time)}</div>
                                </div>
                                <div class="stat">
                                    <div class="stat-label">Chuyển xe</div>
                                    <div class="stat-value">${busRouteSystem.currentRoute.summary.transfers}</div>
                                </div>
                                <div class="stat">
                                    <div class="stat-label">Chi phí</div>
                                    <div class="stat-value">${formatCurrency(busRouteSystem.currentRoute.summary.fare)}</div>
                                </div>
                                <div class="stat">
                                    <div class="stat-label">Khoảng cách</div>
                                    <div class="stat-value">${busRouteSystem.currentRoute.summary.distance.toFixed(2)} km</div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Alternative routes -->
                        ${busRouteSystem.alternativeRoutes.map((route, index) => `
                            <div class="comparison-card alternative">
                                <div class="card-header">
                                    <h4>PHƯƠNG ÁN ${index + 1}</h4>
                                    <span class="badge ${route.difference.time > 0 ? 'badge-warning' : 'badge-info'}">
                                        ${route.difference.time > 0 ? '+' : ''}${formatTime(route.difference.time)}
                                    </span>
                                </div>
                                <div class="card-stats">
                                    <div class="stat">
                                        <div class="stat-label">Thời gian</div>
                                        <div class="stat-value">${formatTime(route.summary.time)}</div>
                                    </div>
                                    <div class="stat">
                                        <div class="stat-label">Chuyển xe</div>
                                        <div class="stat-value">${route.summary.transfers}</div>
                                    </div>
                                    <div class="stat">
                                        <div class="stat-label">Chi phí</div>
                                        <div class="stat-value">${formatCurrency(route.summary.fare)}</div>
                                    </div>
                                    <div class="stat">
                                        <div class="stat-label">Khoảng cách</div>
                                        <div class="stat-value">${route.summary.distance.toFixed(2)} km</div>
                                    </div>
                                </div>
                                <button class="btn-select" onclick="app.selectAlternativeRoute(${index})">
                                    <i class="fas fa-check"></i> Chọn tuyến này
                                </button>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Thêm CSS cho modal
        const style = document.createElement('style');
        style.textContent = `
            .modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.5);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 1000;
            }
            .modal-content {
                background: white;
                border-radius: 10px;
                width: 90%;
                max-width: 1200px;
                max-height: 90vh;
                overflow-y: auto;
            }
            .modal-header {
                background: linear-gradient(90deg, #2c3e50, #4a6491);
                color: white;
                padding: 20px;
                display: flex;
                justify-content: space-between;
                align-items: center;
                border-radius: 10px 10px 0 0;
            }
            .modal-close {
                background: none;
                border: none;
                color: white;
                font-size: 24px;
                cursor: pointer;
            }
            .modal-body {
                padding: 20px;
            }
            .comparison-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                gap: 20px;
                margin-top: 20px;
            }
            .comparison-card {
                background: #f8f9fa;
                border-radius: 8px;
                padding: 20px;
                border: 2px solid #ddd;
            }
            .comparison-card.current {
                border-color: #2ECC71;
                background: #f0fff4;
            }
            .comparison-card.alternative {
                border-color: #3498DB;
            }
            .card-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 15px;
            }
            .badge {
                padding: 5px 10px;
                border-radius: 20px;
                font-size: 12px;
                font-weight: bold;
            }
            .badge-success {
                background: #2ECC71;
                color: white;
            }
            .badge-warning {
                background: #F39C12;
                color: white;
            }
            .badge-info {
                background: #3498DB;
                color: white;
            }
            .card-stats {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 10px;
                margin-bottom: 15px;
            }
            .stat {
                background: white;
                padding: 10px;
                border-radius: 5px;
            }
            .stat-label {
                font-size: 12px;
                color: #666;
                margin-bottom: 5px;
            }
            .stat-value {
                font-weight: bold;
                color: #2C3E50;
            }
            .btn-select {
                width: 100%;
                padding: 10px;
                background: #3498DB;
                color: white;
                border: none;
                border-radius: 5px;
                cursor: pointer;
                display: flex;
                justify-content: center;
                align-items: center;
                gap: 8px;
                font-weight: bold;
            }
            .btn-select:hover {
                background: #2980B9;
            }
        `;
        document.head.appendChild(style);
        
        // Close modal
        modal.querySelector('.modal-close').addEventListener('click', () => {
            document.body.removeChild(modal);
            document.head.removeChild(style);
        });
        
        // Close modal khi click bên ngoài
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
                document.head.removeChild(style);
            }
        });
    }
    
    selectAlternativeRoute(index) {
        const route = busRouteSystem.alternativeRoutes[index];
        if (!route) return;
        
        // Cập nhật route hiện tại
        busRouteSystem.currentRoute = route;
        
        this.currentRoute = route;
        this.syncViews();
        this.displayRouteResults(route);
        
        // Close modal nếu có
        const modal = document.querySelector('.modal');
        if (modal) {
            document.body.removeChild(modal);
        }
        
        showNotification(`Đã chọn phương án thay thế ${index + 1}`, 'success');
    }
}

// Khởi tạo ứng dụng khi trang load
let app;
window.addEventListener('DOMContentLoaded', () => {
    app = new BusRouteApp();
});

// Hàm global để gọi từ HTML
window.selectAlternativeRoute = function(index) {
    if (app) {
        app.selectAlternativeRoute(index);
    }
};