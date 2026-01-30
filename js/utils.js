// Các hàm tiện ích cho ứng dụng

// Tính khoảng cách giữa 2 điểm theo tọa độ (Haversine formula)
function calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371; // Bán kính Trái Đất (km)
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
        Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}

// Chuyển khoảng cách thành thời gian di chuyển
function distanceToTime(distanceKm, speedKmph = 40) {
    return (distanceKm / speedKmph) * 60; // phút
}

// Tính thời gian chờ trung bình dựa trên tần suất
function calculateWaitTime(frequency) {
    return frequency / 2; // Trung bình chờ nửa chu kỳ
}

// Format thời gian
function formatTime(minutes) {
    if (minutes < 60) {
        return `${Math.round(minutes)} phút`;
    } else {
        const hours = Math.floor(minutes / 60);
        const mins = Math.round(minutes % 60);
        return `${hours} giờ ${mins} phút`;
    }
}

// Format tiền
function formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(amount);
}

// Lấy màu cho tuyến xe
function getRouteColor(routeId) {
    const route = busSystem.routes.find(r => r.id === routeId);
    return route ? route.color : "#95A5A6";
}

// Kiểm tra xem một đoạn đường có đang tắc không
function checkTrafficCondition(fromStopId, toStopId, currentTime) {
    const segment = busSystem.specialSegments.find(s => 
        (s.from === fromStopId && s.to === toStopId) ||
        (s.from === toStopId && s.to === fromStopId)
    );
    
    if (!segment) return 1.0;
    
    const now = currentTime.split(':').map(Number);
    const nowMinutes = now[0] * 60 + now[1];
    
    let isActive = false;
    segment.activeHours.forEach(timeRange => {
        const [start, end] = timeRange.split('-');
        const [startHour, startMin] = start.split(':').map(Number);
        const [endHour, endMin] = end.split(':').map(Number);
        const startMinutes = startHour * 60 + startMin;
        const endMinutes = endHour * 60 + endMin;
        
        if (nowMinutes >= startMinutes && nowMinutes <= endMinutes) {
            isActive = true;
        }
    });
    
    return isActive ? segment.multiplier : 1.0;
}

// Tìm trạm gần nhất với tọa độ
function findNearestStop(lat, lng) {
    let nearestStop = null;
    let minDistance = Infinity;
    
    Object.values(busSystem.stops).forEach(stop => {
        const distance = calculateDistance(lat, lng, stop.lat, stop.lng);
        if (distance < minDistance) {
            minDistance = distance;
            nearestStop = stop.id;
        }
    });
    
    return nearestStop;
}

// Tạo ID duy nhất
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Hiển thị thông báo
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <span>${message}</span>
        <button onclick="this.parentElement.remove()">×</button>
    `;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'error' ? '#f44336' : type === 'success' ? '#4CAF50' : '#2196F3'};
        color: white;
        padding: 15px 20px;
        border-radius: 5px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        z-index: 1000;
        display: flex;
        justify-content: space-between;
        align-items: center;
        min-width: 300px;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

// Thêm CSS animation
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
`;
document.head.appendChild(style);