// Dữ liệu trạm xe buýt THỰC TẾ: Bình Thạnh, Thủ Đức, Bình Dương
// Nguồn: xe-buyt.com, BRVT TP.HCM, tuyến 44/30/56/104/08/50/61-77


const busSystem = {
    stops: {
        // ========== BÌNH THẠNH (BS01–BS10) ==========
        "BS01": {
            id: "BS01",
            name: "Hồ Bơi Hải Quân",
            code: "QBTH",
            lat: 10.7935,
            lng: 106.7210,
            address: "22 Nguyễn Hữu Cảnh, Phường 22, Bình Thạnh (gần Landmark 81)"
        },
        "BS02": {
            id: "BS02",
            name: "Chợ Bà Chiểu",
            code: "QBTH",
            lat: 10.8012,
            lng: 106.7125,
            address: "Phan Đăng Lưu - Lê Quang Định, Phường 1, Bình Thạnh"
        },
        "BS03": {
            id: "BS03",
            name: "Chợ Văn Thánh",
            code: "QBTH 037",
            lat: 10.8015,
            lng: 106.7110,
            address: "57-59 Nguyễn Văn Thương, Phường 1, Bình Thạnh"
        },
        "BS04": {
            id: "BS04",
            name: "Trường THPT Hồng Đức",
            code: "QBTH",
            lat: 10.8018,
            lng: 106.7115,
            address: "175 Nguyễn Văn Thương, Phường 1, Bình Thạnh"
        },
        "BS05": {
            id: "BS05",
            name: "Đại học Hutech",
            code: "QBTH 054/059",
            lat: 10.7940,
            lng: 106.7215,
            address: "483 Điện Biên Phủ, Phường 22, Bình Thạnh (gần Landmark 81)"
        },
        "BS06": {
            id: "BS06",
            name: "Bến đò Bình Quới",
            code: "QBTH",
            lat: 10.7965,
            lng: 106.7185,
            address: "Bến đò Bình Quới, Bình Quới, Phường 27, Bình Thạnh"
        },
        "BS07": {
            id: "BS07",
            name: "Chợ Bình Quới",
            code: "QBTH",
            lat: 10.7982,
            lng: 106.7172,
            address: "357 Bình Quới, Phường 27, Bình Thạnh"
        },
        "BS08": {
            id: "BS08",
            name: "Cư xá Thanh Đa",
            code: "QBTH 028",
            lat: 10.7970,
            lng: 106.7180,
            address: "1027 Bình Quới, Phường 27, Bình Thạnh"
        },
        "BS09": {
            id: "BS09",
            name: "Coop Mart Cầu Kinh",
            code: "QBTH",
            lat: 10.8005,
            lng: 106.7160,
            address: "689 Xô Viết Nghệ Tĩnh, Phường 25, Bình Thạnh"
        },
        "BS10": {
            id: "BS10",
            name: "Ngã Ba Hàng Xanh",
            code: "QBTH",
            lat: 10.8020,
            lng: 106.7148,
            address: "334-336 Xô Viết Nghệ Tĩnh, Phường 25, Bình Thạnh"
        },
        // ========== THỦ ĐỨC (BS11–BS15) ==========
        "BS11": {
            id: "BS11",
            name: "Bến xe Miền Đông mới",
            code: "QTD",
            lat: 10.8550,
            lng: 106.7850,
            address: "501 Hoàng Hữu Nam, Long Bình, TP. Thủ Đức (Xa lộ Hà Nội)"
        },
        "BS12": {
            id: "BS12",
            name: "Ga Metro Suối Tiên",
            code: "QTD",
            lat: 10.8630,
            lng: 106.7820,
            address: "Khu vực Suối Tiên, TP. Thủ Đức (kết nối Metro Bến Thành – Suối Tiên)"
        },
        "BS13": {
            id: "BS13",
            name: "Ngã tư Thủ Đức",
            code: "QTD",
            lat: 10.8480,
            lng: 106.7550,
            address: "Ngã tư Thủ Đức, Quốc lộ 1, TP. Thủ Đức"
        },
        "BS14": {
            id: "BS14",
            name: "ĐH Quốc Gia (Linh Trung)",
            code: "QTD",
            lat: 10.8690,
            lng: 106.7510,
            address: "Linh Trung, TP. Thủ Đức (Đại học Quốc gia TP.HCM)"
        },
        "BS15": {
            id: "BS15",
            name: "ĐH Nông Lâm",
            code: "QTD 181",
            lat: 10.8700,
            lng: 106.7480,
            address: "Quốc lộ 1, Linh Trung, TP. Thủ Đức"
        },
        // ========== BÌNH DƯƠNG (BS16–BS17) ==========
        "BS16": {
            id: "BS16",
            name: "GO! Dĩ An",
            code: "BD",
            lat: 10.9050,
            lng: 106.7720,
            address: "Dĩ An, Bình Dương (điểm trung chuyển Bình Dương – TP.HCM)"
        },
        "BS17": {
            id: "BS17",
            name: "TP. mới Bình Dương (Hikari)",
            code: "BD",
            lat: 10.9180,
            lng: 106.7650,
            address: "Thành phố mới Bình Dương, Bình Dương (Hikari)"
        }
    },

    routes: [
        // --- Bình Thạnh ---
        {
            id: "R44",
            name: "Tuyến 44",
            number: "44",
            color: "#E74C3C",
            description: "Cảng Q4 - Bình Quới (đoạn Bình Thạnh)",
            stops: ["BS01", "BS05", "BS09", "BS10", "BS02", "BS07", "BS08", "BS06"],
            frequency: 15,
            operatingHours: { start: "05:00", end: "19:30" },
            fare: 6000,
            speed: 25,
            capacity: 40
        },
        {
            id: "R30",
            name: "Tuyến 30",
            number: "30",
            color: "#3498DB",
            description: "Chợ Tân Hương - ĐH Quốc tế (qua Landmark, Chợ Bà Chiểu)",
            stops: ["BS05", "BS01", "BS10", "BS02", "BS03", "BS04"],
            frequency: 15,
            operatingHours: { start: "05:00", end: "19:00" },
            fare: 7000,
            speed: 28,
            capacity: 45
        },
        {
            id: "R56",
            name: "Tuyến 56",
            number: "56",
            color: "#27AE60",
            description: "ĐH Giao thông Vận tải - Bến xe Chợ Lớn (qua Bình Thạnh)",
            stops: ["BS05", "BS01", "BS09", "BS10", "BS02"],
            frequency: 20,
            operatingHours: { start: "05:00", end: "21:00" },
            fare: 6000,
            speed: 30,
            capacity: 40
        },
        {
            id: "R104",
            name: "Tuyến 104",
            number: "104",
            color: "#9B59B6",
            description: "Bến xe An Sương - ĐH Nông Lâm (qua Hàng Xanh, Bà Chiểu, Thủ Đức)",
            stops: ["BS10", "BS02", "BS03", "BS09", "BS07", "BS13", "BS15"],
            frequency: 20,
            operatingHours: { start: "04:30", end: "20:00" },
            fare: 6000,
            speed: 28,
            capacity: 45
        },
        // --- Thủ Đức ---
        {
            id: "R08",
            name: "Tuyến 08",
            number: "08",
            color: "#16A085",
            description: "Bến xe Q.8 - ĐH Quốc Gia (qua Bến xe Miền Đông mới, Thủ Đức)",
            stops: ["BS11", "BS12", "BS13", "BS14"],
            frequency: 20,
            operatingHours: { start: "05:00", end: "21:00" },
            fare: 7000,
            speed: 30,
            capacity: 45
        },
        {
            id: "R50",
            name: "Tuyến 50",
            number: "50",
            color: "#D35400",
            description: "ĐH Bách Khoa - ĐH Quốc Gia (đoạn Thủ Đức: Ngã tư Thủ Đức - ĐH Nông Lâm)",
            stops: ["BS13", "BS14", "BS15"],
            frequency: 15,
            operatingHours: { start: "05:30", end: "18:30" },
            fare: 7000,
            speed: 28,
            capacity: 80
        },
        // --- Bình Dương – TP.HCM ---
        {
            id: "R6177",
            name: "Tuyến 61-77",
            number: "61-77",
            color: "#8E44AD",
            description: "TP. mới Bình Dương (Hikari) - Bến xe Miền Đông mới (qua Dĩ An)",
            stops: ["BS17", "BS16", "BS11"],
            frequency: 20,
            operatingHours: { start: "05:30", end: "19:00" },
            fare: 8000,
            speed: 35,
            capacity: 45
        },
        // Kết nối Bình Thạnh – Thủ Đức (mô phỏng tuyến qua Xa lộ)
        {
            id: "R52",
            name: "Tuyến 52",
            number: "52",
            color: "#1ABC9C",
            description: "Bến Thành - ĐH Quốc tế (qua Ngã Ba Hàng Xanh, Ngã tư Thủ Đức)",
            stops: ["BS10", "BS13", "BS14"],
            frequency: 25,
            operatingHours: { start: "05:30", end: "19:00" },
            fare: 7000,
            speed: 28,
            capacity: 45
        }
    ],

    walkingConnections: [
        { from: "BS01", to: "BS05", distance: 0.2, walkingTime: 3 },
        { from: "BS02", to: "BS03", distance: 0.15, walkingTime: 2 },
        { from: "BS03", to: "BS04", distance: 0.1, walkingTime: 2 },
        { from: "BS07", to: "BS08", distance: 0.25, walkingTime: 4 },
        { from: "BS09", to: "BS10", distance: 0.2, walkingTime: 3 },
        { from: "BS11", to: "BS12", distance: 0.4, walkingTime: 6 },
        { from: "BS13", to: "BS14", distance: 0.5, walkingTime: 8 },
        { from: "BS14", to: "BS15", distance: 0.3, walkingTime: 5 }
    ],

    specialSegments: [
        {
            from: "BS02",
            to: "BS10",
            condition: "traffic_jam",
            multiplier: 1.8,
            activeHours: ["07:00-09:00", "16:00-18:00"]
        },
        {
            from: "BS05",
            to: "BS01",
            condition: "school_zone",
            multiplier: 1.2,
            activeHours: ["06:30-07:30", "15:30-17:00"]
        },
        {
            from: "BS16",
            to: "BS11",
            condition: "traffic_jam",
            multiplier: 1.5,
            activeHours: ["07:00-08:30", "16:30-18:30"]
        },
        { from: "BS10", to: "BS13", condition: "traffic_jam", multiplier: 1.6, activeHours: ["07:00-09:00", "16:00-18:00"] },
        { from: "BS13", to: "BS11", condition: "traffic_jam", multiplier: 1.5, activeHours: ["07:00-09:00", "16:00-18:00"] },
        { from: "BS11", to: "BS16", condition: "traffic_jam", multiplier: 1.4, activeHours: ["07:00-08:30", "16:30-18:30"] }
    ]
};

if (typeof window !== 'undefined') {
    window.busSystem = busSystem;
}
