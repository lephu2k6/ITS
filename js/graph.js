// Xây dựng đồ thị từ hệ thống xe bus

function buildBusGraph(criteria = 'time', departureTime = '08:00') {
    const graph = {};
    
    // Khởi tạo các node (trạm xe bus)
    Object.keys(busSystem.stops).forEach(stopId => {
        graph[stopId] = [];
    });
    
    // Thêm các cạnh "đi xe bus"
    busSystem.routes.forEach(route => {
        for (let i = 0; i < route.stops.length - 1; i++) {
            const fromStop = route.stops[i];
            const toStop = route.stops[i + 1];
            
            // Tính khoảng cách
            const fromCoord = busSystem.stops[fromStop];
            const toCoord = busSystem.stops[toStop];
            const distance = calculateDistance(
                fromCoord.lat, fromCoord.lng,
                toCoord.lat, toCoord.lng
            );
            
            // Tính thời gian di chuyển
            let travelTime = distanceToTime(distance, route.speed);
            
            // Áp dụng hệ số giao thông nếu có
            const trafficMultiplier = checkTrafficCondition(fromStop, toStop, departureTime);
            travelTime *= trafficMultiplier;
            
            // Thời gian chờ thực tế theo tần suất tuyến
            const rawWaitTime = calculateWaitTime(route.frequency);
            const maxWait = (typeof busRouteSystem !== 'undefined' && busRouteSystem.settings)
                ? busRouteSystem.settings.maxWaitTime
                : 15;
            // Ràng buộc cứng: chỉ thêm cạnh nếu thời gian chờ <= thời gian chờ tối đa người dùng chọn
            if (rawWaitTime > maxWait) continue;

            const waitTime = rawWaitTime;

            // Tính trọng số theo tiêu chí (time = thời gian di chuyển + thời gian chờ)
            let weight;
            switch(criteria) {
                case 'time':
                    weight = travelTime + waitTime;
                    break;
                case 'fare':
                    weight = route.fare;
                    break;
                case 'transfers':
                    weight = 1; // Mỗi chặng = 1 lần đi xe
                    break;
                default:
                    weight = travelTime;
            }
            
            // Thêm cạnh có hướng
            graph[fromStop].push({
                node: toStop,
                weight: weight,
                type: 'BUS',
                routeId: route.id,
                routeName: route.name,
                routeNumber: route.number,
                routeColor: route.color,
                travelTime: travelTime,
                waitTime: waitTime,
                fare: route.fare,
                distance: distance,
                trafficMultiplier: trafficMultiplier
            });
            
            // Thêm cạnh ngược lại (đồ thị vô hướng)
            graph[toStop].push({
                node: fromStop,
                weight: weight,
                type: 'BUS',
                routeId: route.id,
                routeName: route.name,
                routeNumber: route.number,
                routeColor: route.color,
                travelTime: travelTime,
                waitTime: waitTime,
                fare: route.fare,
                distance: distance,
                trafficMultiplier: trafficMultiplier
            });
        }
    });
    
    // Thêm các cạnh "đi bộ"
    busSystem.walkingConnections.forEach(connection => {
        const fromStop = busSystem.stops[connection.from];
        const toStop = busSystem.stops[connection.to];
        
        let weight;
        switch(criteria) {
            case 'time':
                weight = connection.walkingTime;
                break;
            case 'fare':
                weight = 0; // Đi bộ miễn phí
                break;
            case 'transfers':
                weight = 0.5; // Phạt nhẹ cho việc đi bộ
                break;
            default:
                weight = connection.walkingTime;
        }
        
        // Thêm cạnh đi bộ có hướng
        graph[connection.from].push({
            node: connection.to,
            weight: weight,
            type: 'WALK',
            travelTime: connection.walkingTime,
            distance: connection.distance,
            fare: 0
        });
        
        // Cạnh ngược lại
        graph[connection.to].push({
            node: connection.from,
            weight: weight,
            type: 'WALK',
            travelTime: connection.walkingTime,
            distance: connection.distance,
            fare: 0
        });
    });
    
    return graph;
}

// Xây dựng đồ thị đa trọng số (cho so sánh)
function buildMultiWeightGraph(departureTime = '08:00') {
    const graph = {};
    
    Object.keys(busSystem.stops).forEach(stopId => {
        graph[stopId] = [];
    });
    
    // Thêm cạnh với đa trọng số
    busSystem.routes.forEach(route => {
        for (let i = 0; i < route.stops.length - 1; i++) {
            const fromStop = route.stops[i];
            const toStop = route.stops[i + 1];
            
            const fromCoord = busSystem.stops[fromStop];
            const toCoord = busSystem.stops[toStop];
            const distance = calculateDistance(
                fromCoord.lat, fromCoord.lng,
                toCoord.lat, toCoord.lng
            );
            
            let travelTime = distanceToTime(distance, route.speed);
            const trafficMultiplier = checkTrafficCondition(fromStop, toStop, departureTime);
            travelTime *= trafficMultiplier;
            
            const waitTime = calculateWaitTime(route.frequency);
            
            // Trọng số cho các tiêu chí khác nhau
            const weights = {
                time: travelTime,
                transfers: 1,
                fare: route.fare
            };
            
            graph[fromStop].push({
                node: toStop,
                weights: weights,
                type: 'BUS',
                routeId: route.id,
                routeName: route.name,
                routeNumber: route.number,
                routeColor: route.color,
                travelTime: travelTime,
                waitTime: waitTime,
                fare: route.fare,
                distance: distance
            });
            
            graph[toStop].push({
                node: fromStop,
                weights: weights,
                type: 'BUS',
                routeId: route.id,
                routeName: route.name,
                routeNumber: route.number,
                routeColor: route.color,
                travelTime: travelTime,
                waitTime: waitTime,
                fare: route.fare,
                distance: distance
            });
        }
    });
    
    // Thêm cạnh đi bộ
    busSystem.walkingConnections.forEach(connection => {
        const walkWeights = {
            time: connection.walkingTime,
            transfers: 0.5,
            fare: 0
        };
        
        graph[connection.from].push({
            node: connection.to,
            weights: walkWeights,
            type: 'WALK',
            travelTime: connection.walkingTime,
            distance: connection.distance,
            fare: 0
        });
        
        graph[connection.to].push({
            node: connection.from,
            weights: walkWeights,
            type: 'WALK',
            travelTime: connection.walkingTime,
            distance: connection.distance,
            fare: 0
        });
    });
    
    return graph;
}

// Lấy thông tin chi tiết của một cạnh
function getEdgeInfo(graph, fromNode, toNode) {
    if (!graph[fromNode]) return null;
    
    return graph[fromNode].find(edge => edge.node === toNode);
}