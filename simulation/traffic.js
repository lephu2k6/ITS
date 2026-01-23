/**
 * Tính hệ số giao thông dựa trên giờ trong ngày
 * @param {number} hour - Giờ trong ngày (0-23)
 * @returns {number} Hệ số nhân thời gian di chuyển
 */
export function getTrafficMultiplier(hour) {
  if (hour >= 7 && hour <= 9) return 1.8;   // cao điểm sáng
  if (hour >= 17 && hour <= 19) return 2.0; // cao điểm chiều
  if (hour >= 12 && hour <= 13) return 1.3; // giờ trưa
  if (hour >= 20 && hour <= 22) return 1.2; // tối muộn
  if (hour >= 0 && hour <= 5) return 0.8;  // đêm khuya, ít xe
  return 1.0; // giờ bình thường
}

/**
 * Tính hệ số giao thông cho từng loại đường
 * @param {string} roadType - Loại đường (highway, main, local)
 * @param {number} hour - Giờ trong ngày
 * @returns {number} Hệ số nhân
 */
export function getTrafficMultiplierByRoadType(roadType, hour) {
  const baseMultiplier = getTrafficMultiplier(hour);
  
  switch (roadType) {
    case "highway":
      return baseMultiplier * 0.9; // Đường cao tốc ít bị ảnh hưởng hơn
    case "main":
      return baseMultiplier;
    case "local":
      return baseMultiplier * 1.1; // Đường nhỏ bị ảnh hưởng nhiều hơn
    default:
      return baseMultiplier;
  }
}

/**
 * Lấy mức độ giao thông dạng text
 * @param {number} hour - Giờ trong ngày
 * @returns {string} Mô tả mức độ giao thông
 */
export function getTrafficLevel(hour) {
  const multiplier = getTrafficMultiplier(hour);
  if (multiplier >= 1.8) return "Rất đông";
  if (multiplier >= 1.3) return "Đông";
  if (multiplier >= 1.0) return "Bình thường";
  return "Thông thoáng";
}