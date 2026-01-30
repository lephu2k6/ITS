// Đồ thị tuyến - SVG rõ ràng, dễ nhìn

class GraphView {
    constructor(svgId) {
        this.svg = document.getElementById(svgId);
        if (!this.svg) return;

        this.width = 900;
        this.height = 500;
        this.nodePositions = {};
        this.startStop = null;
        this.endStop = null;
        this.currentRoute = null;
        this.onNodeClick = null;

        this.calculateLayout();
        this.render();
        this.attachEvents();
    }

    calculateLayout() {
        const stops = Object.values(busSystem.stops);
        const lats = stops.map(s => s.lat);
        const lngs = stops.map(s => s.lng);
        const minLat = Math.min(...lats);
        const maxLat = Math.max(...lats);
        const minLng = Math.min(...lngs);
        const maxLng = Math.max(...lngs);
        const padLat = (maxLat - minLat) * 0.1 || 0.01;
        const padLng = (maxLng - minLng) * 0.1 || 0.01;
        const rangeLat = maxLat - minLat + padLat * 2 || 0.1;
        const rangeLng = maxLng - minLng + padLng * 2 || 0.1;

        const margin = 80;
        const w = this.width - margin * 2;
        const h = this.height - margin * 2;

        Object.entries(busSystem.stops).forEach(([id, stop]) => {
            const nx = (stop.lng - minLng + padLng) / rangeLng;
            const ny = 1 - (stop.lat - minLat + padLat) / rangeLat;
            this.nodePositions[id] = {
                x: margin + nx * w,
                y: margin + ny * h
            };
        });
    }

    render() {
        if (!this.svg) return;

        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        g.setAttribute('class', 'graph-root');

        // Nền
        const bg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        bg.setAttribute('width', this.width);
        bg.setAttribute('height', this.height);
        bg.setAttribute('fill', '#f8fafc');
        bg.setAttribute('rx', '8');
        g.appendChild(bg);

        // Cạnh đi bộ (vẽ trước, nằm dưới)
        const walkG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        walkG.setAttribute('class', 'edges-walk');
        busSystem.walkingConnections.forEach(conn => {
            const a = this.nodePositions[conn.from];
            const b = this.nodePositions[conn.to];
            if (!a || !b) return;
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', a.x);
            line.setAttribute('y1', a.y);
            line.setAttribute('x2', b.x);
            line.setAttribute('y2', b.y);
            line.setAttribute('stroke', '#9b59b6');
            line.setAttribute('stroke-width', '2');
            line.setAttribute('stroke-dasharray', '6 4');
            line.setAttribute('opacity', '0.8');
            walkG.appendChild(line);
        });
        g.appendChild(walkG);

        // Cạnh tuyến xe bus
        busSystem.routes.forEach(route => {
            const pathG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            for (let i = 0; i < route.stops.length - 1; i++) {
                const a = this.nodePositions[route.stops[i]];
                const b = this.nodePositions[route.stops[i + 1]];
                if (!a || !b) continue;
                const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                line.setAttribute('x1', a.x);
                line.setAttribute('y1', a.y);
                line.setAttribute('x2', b.x);
                line.setAttribute('y2', b.y);
                line.setAttribute('stroke', route.color || '#3498db');
                line.setAttribute('stroke-width', '4');
                line.setAttribute('stroke-linecap', 'round');
                line.setAttribute('opacity', '0.85');
                pathG.appendChild(line);
            }
            g.appendChild(pathG);
        });

        // Tuyến tối ưu (nếu có)
        if (this.currentRoute?.path?.length >= 2) {
            const optG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            optG.setAttribute('class', 'route-optimal');
            for (let i = 0; i < this.currentRoute.path.length - 1; i++) {
                const a = this.nodePositions[this.currentRoute.path[i]];
                const b = this.nodePositions[this.currentRoute.path[i + 1]];
                if (!a || !b) continue;
                const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                line.setAttribute('x1', a.x);
                line.setAttribute('y1', a.y);
                line.setAttribute('x2', b.x);
                line.setAttribute('y2', b.y);
                line.setAttribute('stroke', '#e67e22');
                line.setAttribute('stroke-width', '6');
                line.setAttribute('stroke-linecap', 'round');
                line.setAttribute('opacity', '1');
                optG.appendChild(line);
            }
            g.appendChild(optG);
        }

        // Node (trạm)
        const nodeRadius = 18;
        Object.entries(this.nodePositions).forEach(([stopId, pos]) => {
            const stop = busSystem.stops[stopId];
            const isStart = stopId === this.startStop;
            const isEnd = stopId === this.endStop;
            const inRoute = this.currentRoute?.path?.includes(stopId);

            const nodeG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            nodeG.setAttribute('class', 'graph-node');
            nodeG.setAttribute('data-stop-id', stopId);
            nodeG.style.cursor = 'pointer';

            const r = isStart || isEnd ? 22 : inRoute ? 20 : nodeRadius;
            let fill = '#34495e';
            let stroke = '#2c3e50';
            let strokeWidth = 2;
            if (isStart) {
                fill = '#27ae60';
                stroke = '#1e8449';
                strokeWidth = 3;
            } else if (isEnd) {
                fill = '#e74c3c';
                stroke = '#c0392b';
                strokeWidth = 3;
            } else if (inRoute) {
                fill = '#3498db';
                stroke = '#2980b9';
            }

            const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            circle.setAttribute('cx', pos.x);
            circle.setAttribute('cy', pos.y);
            circle.setAttribute('r', r);
            circle.setAttribute('fill', fill);
            circle.setAttribute('stroke', stroke);
            circle.setAttribute('stroke-width', strokeWidth);
            nodeG.appendChild(circle);

            const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            label.setAttribute('x', pos.x);
            label.setAttribute('y', pos.y + r + 16);
            label.setAttribute('text-anchor', 'middle');
            label.setAttribute('font-size', isStart || isEnd ? '12' : '10');
            label.setAttribute('font-weight', isStart || isEnd ? 'bold' : 'normal');
            label.setAttribute('fill', '#2c3e50');
            label.setAttribute('pointer-events', 'none');
            label.textContent = stop?.name || stopId;
            nodeG.appendChild(label);

            const idLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            idLabel.setAttribute('x', pos.x);
            idLabel.setAttribute('y', pos.y + r + 28);
            idLabel.setAttribute('text-anchor', 'middle');
            idLabel.setAttribute('font-size', '9');
            idLabel.setAttribute('fill', '#7f8c8d');
            idLabel.setAttribute('pointer-events', 'none');
            idLabel.textContent = stopId;
            nodeG.appendChild(idLabel);

            g.appendChild(nodeG);
        });

        this.svg.innerHTML = '';
        this.svg.appendChild(g);
    }

    attachEvents() {
        if (!this.svg) return;
        this.svg.addEventListener('click', (e) => {
            const node = e.target.closest('.graph-node');
            if (node && node.dataset.stopId && typeof this.onNodeClick === 'function') {
                this.onNodeClick(node.dataset.stopId);
            }
        });
    }

    drawMap(startStop, endStop, route) {
        this.startStop = startStop || null;
        this.endStop = endStop || null;
        this.currentRoute = route || null;
        this.render();
    }

    setRoute(route) {
        this.currentRoute = route || null;
        this.render();
    }

    clearRoute() {
        this.currentRoute = null;
        this.render();
    }

    setNodeClickHandler(fn) {
        this.onNodeClick = fn;
    }
}

let graphView = null;

function initGraphView() {
    if (!document.getElementById('graphSvg')) return null;
    graphView = new GraphView('graphSvg');
    return graphView;
}
