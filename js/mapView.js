// Bản đồ thật - Leaflet / OpenStreetMap

class LeafletMapView {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) return;

        this.map = null;
        this.markers = {};
        this.baseLayers = [];
        this.optimalRouteLayer = null;
        this.startStop = null;
        this.endStop = null;
        this.currentRoute = null;
        this.onNodeClick = null;

        this.init();
    }

    init() {
        // Tâm: khu vực Bình Thạnh (Landmark 81 - Chợ Bà Chiểu)
        const center = [10.798, 106.717];
        const mapId = this.container && this.container.id ? this.container.id : 'leafletMap';
        this.map = L.map(mapId).setView(center, 14);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        }).addTo(this.map);

        this.drawStops();
        this.drawBusRoutes();
        this.drawWalkingConnections();
        // Fit bản đồ để thấy hết trạm (Bình Thạnh, Thủ Đức, Bình Dương)
        const allLatLngs = Object.values(busSystem.stops).map(s => [s.lat, s.lng]);
        if (allLatLngs.length > 0) {
            this.map.fitBounds(allLatLngs, { padding: [30, 30], maxZoom: 12 });
        }
    }

    drawStops() {
        Object.entries(busSystem.stops).forEach(([stopId, stop]) => {
            const isStart = stopId === this.startStop;
            const isEnd = stopId === this.endStop;

            let color = '#3498db';
            let size = 28;
            if (isStart) {
                color = '#27ae60';
                size = 34;
            } else if (isEnd) {
                color = '#e74c3c';
                size = 34;
            }

            const icon = L.divIcon({
                className: 'custom-marker',
                html: `<div style="width:${size}px;height:${size}px;background:${color};border:3px solid white;border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,0.3);"></div>`,
                iconSize: [size, size],
                iconAnchor: [size / 2, size / 2]
            });

            const marker = L.marker([stop.lat, stop.lng], { icon })
                .addTo(this.map)
                .bindPopup(`
                    <strong>${stop.name}</strong><br>
                    <small>${stop.id} · ${stop.address || ''}</small>
                `);

            marker.stopId = stopId;
            marker.on('click', () => {
                if (typeof this.onNodeClick === 'function') {
                    this.onNodeClick(stopId);
                }
            });

            this.markers[stopId] = marker;
        });
    }

    drawBusRoutes() {
        busSystem.routes.forEach(route => {
            const latlngs = route.stops
                .map(id => busSystem.stops[id])
                .filter(Boolean)
                .map(s => [s.lat, s.lng]);

            if (latlngs.length < 2) return;

            const polyline = L.polyline(latlngs, {
                color: route.color || '#3498db',
                weight: 5,
                opacity: 0.7,
                dashArray: null
            }).addTo(this.map);

            polyline.bindPopup(`<strong>Tuyến ${route.number}</strong><br>${route.name}`);
            this.baseLayers.push(polyline);
        });
    }

    drawWalkingConnections() {
        busSystem.walkingConnections.forEach(conn => {
            const from = busSystem.stops[conn.from];
            const to = busSystem.stops[conn.to];
            if (!from || !to) return;

            const polyline = L.polyline(
                [[from.lat, from.lng], [to.lat, to.lng]],
                { color: '#9b59b6', weight: 3, opacity: 0.6, dashArray: '8, 8' }
            ).addTo(this.map);

            polyline.bindPopup(`Đi bộ ~${conn.walkingTime} phút`);
            this.baseLayers.push(polyline);
        });
    }

    updateMarkers(startStop, endStop) {
        this.startStop = startStop;
        this.endStop = endStop;

        Object.entries(this.markers).forEach(([stopId, marker]) => {
            const isStart = stopId === startStop;
            const isEnd = stopId === endStop;
            let color = '#3498db';
            let size = 28;
            if (isStart) {
                color = '#27ae60';
                size = 34;
            } else if (isEnd) {
                color = '#e74c3c';
                size = 34;
            }
            marker.setIcon(L.divIcon({
                className: 'custom-marker',
                html: `<div style="width:${size}px;height:${size}px;background:${color};border:3px solid white;border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,0.3);"></div>`,
                iconSize: [size, size],
                iconAnchor: [size / 2, size / 2]
            }));
        });
    }

    setRoute(route) {
        this.clearRoute();
        if (!route?.path?.length) return;

        this.currentRoute = route;
        const latlngs = route.path
            .map(id => busSystem.stops[id])
            .filter(Boolean)
            .map(s => [s.lat, s.lng]);

        if (latlngs.length < 2) return;

        this.optimalRouteLayer = L.polyline(latlngs, {
            color: '#e67e22',
            weight: 8,
            opacity: 1
        }).addTo(this.map);

        this.optimalRouteLayer.bindPopup('<strong>Tuyến đường tối ưu</strong>');
        this.map.fitBounds(latlngs, { padding: [40, 40], maxZoom: 14 });
    }

    clearRoute() {
        if (this.optimalRouteLayer && this.map.hasLayer(this.optimalRouteLayer)) {
            this.map.removeLayer(this.optimalRouteLayer);
        }
        this.optimalRouteLayer = null;
        this.currentRoute = null;
    }

    drawMap(startStop, endStop, route) {
        this.updateMarkers(startStop || null, endStop || null);
        if (route) this.setRoute(route);
    }

    setNodeClickHandler(fn) {
        this.onNodeClick = fn;
    }
}

// Khởi tạo khi DOM sẵn sàng (main.js sẽ gọi sau)
let leafletMapView = null;

function initLeafletMapView() {
    const id = 'leafletMap';
    if (!document.getElementById(id)) return null;
    leafletMapView = new LeafletMapView(id);
    return leafletMapView;
}
