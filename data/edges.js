/**
 * Danh sách các cạnh (đường) kết nối các node
 * baseTime: thời gian di chuyển cơ bản (phút) không tính giao thông
 * type: loại đường (highway, main, local)
 */
export const edges = [
  { from: "A", to: "B", baseTime: 5, type: "main" },
  { from: "A", to: "C", baseTime: 4, type: "local" },
  { from: "B", to: "D", baseTime: 3, type: "main" },
  { from: "B", to: "E", baseTime: 6, type: "highway" },
  { from: "C", to: "D", baseTime: 6, type: "local" },
  { from: "C", to: "F", baseTime: 5, type: "local" },
  { from: "D", to: "G", baseTime: 4, type: "main" },
  { from: "E", to: "H", baseTime: 3, type: "highway" },
  { from: "F", to: "G", baseTime: 7, type: "local" },
  { from: "G", to: "H", baseTime: 4, type: "main" }
];