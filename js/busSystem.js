// Quản lý hệ thống xe bus và các chức năng liên quan

class BusRouteSystem {
    constructor() {
        this.currentRoute = null;
        this.alternativeRoutes = [];
        this.history = [];
        this.settings = {
            maxWalkDistance: 1.0,
            maxWaitTime: 15,
            preferAirConditioned: true,
            avoidCongestion: true
        };
    }

    /**
     * Tìm tuyến đường tối ưu từ trạm xuất phát đến trạm đích.
     * @param {string} startStopId - ID trạm xuất phát
     * @param {string} endStopId - ID trạm đích
     * @param {string} criteria - Tiêu chí: 'time' | 'fare' | 'transfers'
     * @param {string} departureTime - Giờ xuất phát 'HH:mm'
     * @returns {Object|null} Chi tiết tuyến đường hoặc null nếu không tìm thấy
     */
    findOptimalRoute(startStopId, endStopId, criteria = 'time', departureTime = '08:00', maxWaitTime = null) {
        if (maxWaitTime != null) this.settings.maxWaitTime = maxWaitTime;
        const graph = buildBusGraph(criteria, departureTime);
        const result = dijkstraMultiCriteria(graph, startStopId, endStopId, criteria);

        if (!result?.path?.length) {
            showNotification('Không tìm thấy tuyến đường phù hợp!', 'error');
            return null;
        }

        const detailedResult = this.calculateRouteDetails(result, departureTime);
        if (!detailedResult) {
            showNotification('Không thể tính toán chi tiết tuyến đường!', 'error');
            return null;
        }

        this.currentRoute = detailedResult;
        this.history.unshift({
            ...detailedResult,
            timestamp: new Date(),
            criteria
        });

        this.findAlternativeRoutes(startStopId, endStopId, criteria, departureTime);
        return detailedResult;
    }

    /** Lấy thời gian chờ đã giới hạn theo thiết lập người dùng (dùng khi hiển thị chi tiết). */
    getCappedWaitTime(edgeWaitTime) {
        const max = this.settings.maxWaitTime;
        if (edgeWaitTime == null) return 0;
        return Math.min(Number(edgeWaitTime), max);
    }

    /**
     * Tính toán chi tiết từng bước của lộ trình (đi bộ, chờ xe, đi xe).
     */
    calculateRouteDetails(routeResult, departureTime) {
        if (!routeResult?.path?.length || !routeResult?.details?.length) {
            console.error('routeResult không hợp lệ:', routeResult);
            return null;
        }

        const steps = [];
        const summary = { time: 0, fare: 0, distance: 0, transfers: 0 };
        let currentTime = departureTime;
        let currentRouteId = null;
        let stepNumber = 1;
        const { path, details } = routeResult;

        for (let i = 0; i < details.length; i++) {
            const edge = details[i];
            const fromStop = path[i];
            const toStop = path[i + 1];

            if (!fromStop || !toStop) continue;

            const fromInfo = busSystem.stops[fromStop];
            const toInfo = busSystem.stops[toStop];
            if (!fromInfo || !toInfo) {
                console.warn(`Trạm không tồn tại: ${fromStop} -> ${toStop}`);
                continue;
            }

            if (edge.type === 'WALK') {
                const step = this._buildWalkStep(edge, fromInfo, toInfo, stepNumber++, currentTime);
                currentTime = step.arrivalTime;
                summary.time += step.duration;
                summary.distance += step.distance;
                steps.push(step);
            } else if (edge.type === 'BUS') {
                const route = busSystem.routes.find(r => r.id === edge.routeId);
                if (!route) continue;

                if (currentRouteId && currentRouteId !== edge.routeId) {
                    summary.transfers++;
                    const waitTime = this.getCappedWaitTime(edge.waitTime);
                    const waitStep = {
                        number: stepNumber++,
                        type: 'WAIT',
                        description: `Chờ xe tuyến ${route.number} tại ${fromInfo.name}`,
                        duration: waitTime,
                        icon: '⏱️',
                        color: '#f39c12',
                        arrivalTime: this.addMinutes(currentTime, waitTime)
                    };
                    currentTime = waitStep.arrivalTime;
                    summary.time += waitTime;
                    steps.push(waitStep);
                }

                const step = this._buildBusStep(edge, route, fromInfo, toInfo, stepNumber++, currentTime);
                currentTime = step.arrivalTime;
                currentRouteId = edge.routeId;
                summary.time += step.duration;
                summary.fare += step.fare || 0;
                summary.distance += step.distance;
                steps.push(step);
            } else {
                const step = this._buildGenericStep(edge, fromInfo, toInfo, stepNumber++, currentTime);
                currentTime = step.arrivalTime;
                summary.time += step.duration;
                summary.distance += step.distance || 0;
                steps.push(step);
            }
        }

        if (steps.length === 0) return null;

        return {
            ...routeResult,
            stepDetails: steps,
            summary,
            departureTime,
            arrivalTime: currentTime
        };
    }

    _buildWalkStep(edge, fromInfo, toInfo, number, currentTime) {
        const duration = edge.travelTime || 0;
        return {
            number,
            type: 'WALK',
            from: fromInfo.id,
            to: toInfo.id,
            fromName: fromInfo.name,
            toName: toInfo.name,
            description: `Đi bộ từ ${fromInfo.name} đến ${toInfo.name}`,
            duration,
            distance: edge.distance || 0,
            icon: '🚶',
            color: '#9b59b6',
            arrivalTime: this.addMinutes(currentTime, duration)
        };
    }

    _buildBusStep(edge, route, fromInfo, toInfo, number, currentTime) {
        const duration = edge.travelTime || 0;
        const trafficMultiplier = edge.trafficMultiplier != null ? edge.trafficMultiplier : 1;
        return {
            number,
            type: 'BUS',
            from: fromInfo.id,
            to: toInfo.id,
            fromName: fromInfo.name,
            toName: toInfo.name,
            description: `Lên xe tuyến ${route.number} (${route.name})`,
            duration,
            distance: edge.distance || 0,
            fare: edge.fare || 0,
            routeNumber: route.number,
            routeColor: route.color,
            icon: '🚌',
            color: route.color,
            arrivalTime: this.addMinutes(currentTime, duration),
            trafficMultiplier
        };
    }

    _buildGenericStep(edge, fromInfo, toInfo, number, currentTime) {
        const duration = edge.travelTime || 0;
        return {
            number,
            type: edge.type || 'UNKNOWN',
            from: fromInfo.id,
            to: toInfo.id,
            fromName: fromInfo.name,
            toName: toInfo.name,
            description: `Di chuyển từ ${fromInfo.name} đến ${toInfo.name}`,
            duration,
            distance: edge.distance || 0,
            icon: '🚗',
            color: '#95A5A6',
            arrivalTime: this.addMinutes(currentTime, duration)
        };
    }

    findAlternativeRoutes(startStopId, endStopId, criteria, departureTime) {
        const graph = buildBusGraph(criteria, departureTime);
        const allPaths = kShortestPaths(graph, startStopId, endStopId, 3);

        this.alternativeRoutes = allPaths
            .slice(1)
            .map(route => {
                const edgeDetails = this.extractEdgeDetails(graph, route.path);
                const detailed = this.calculateRouteDetails(
                    { path: route.path, details: edgeDetails },
                    departureTime
                );
                if (!detailed || !this.currentRoute?.summary) return null;
                return {
                    ...detailed,
                    difference: {
                        time: detailed.summary.time - this.currentRoute.summary.time,
                        fare: detailed.summary.fare - this.currentRoute.summary.fare,
                        transfers: detailed.summary.transfers - this.currentRoute.summary.transfers
                    }
                };
            })
            .filter(Boolean);
    }

    extractEdgeDetails(graph, path) {
        const details = [];
        for (let i = 0; i < path.length - 1; i++) {
            const edge = graph[path[i]]?.find(e => e.node === path[i + 1]);
            if (edge) details.push(edge);
        }
        return details;
    }

    addMinutes(timeStr, minutes) {
        const [h, m] = timeStr.split(':').map(Number);
        let total = (h * 60 + m + minutes) % (24 * 60);
        const hh = Math.floor(total / 60);
        const mm = total % 60;
        return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
    }

    getStopInfo(stopId) {
        return busSystem.stops[stopId] ?? null;
    }

    getRouteInfo(routeId) {
        return busSystem.routes.find(r => r.id === routeId) ?? null;
    }

    isRouteActive(routeId, currentTime) {
        const route = this.getRouteInfo(routeId);
        if (!route) return false;
        const [h, m] = currentTime.split(':').map(Number);
        const now = h * 60 + m;
        const [sh, sm] = route.operatingHours.start.split(':').map(Number);
        const [eh, em] = route.operatingHours.end.split(':').map(Number);
        const start = sh * 60 + sm;
        const end = eh * 60 + em;
        return now >= start && now <= end;
    }
}

const busRouteSystem = new BusRouteSystem();
