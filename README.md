# Hệ thống tìm tuyến xe bus tối ưu

Ứng dụng web tìm lộ trình xe bus tối ưu cho **Bình Thạnh, Thủ Đức (TP.HCM)** và **Bình Dương**, sử dụng thuật toán **Dijkstra** và đồ thị đa trọng số. Dữ liệu trạm và tuyến dựa trên nguồn thực tế (xe-buyt.com, BRVT TP.HCM).

---

## Mục lục

- [Tính năng](#tính-năng)
- [Cách chạy](#cách-chạy)
- [Hướng dẫn sử dụng](#hướng-dẫn-sử-dụng)
- [Danh sách trạm xe bus](#danh-sách-trạm-xe-bus)
- [Danh sách tuyến xe bus](#danh-sách-tuyến-xe-bus)
- [Đoạn đi bộ chuyển tuyến](#đoạn-đi-bộ-chuyển-tuyến)
- [Cấu trúc thư mục](#cấu-trúc-thư-mục)
- [Công nghệ](#công-nghệ)
- [Chỉnh sửa dữ liệu](#chỉnh-sửa-dữ-liệu)
- [Lưu ý](#lưu-ý)

---

## Tính năng

- **Tìm tuyến tối ưu** theo 3 tiêu chí: thời gian ngắn nhất, ít chuyển xe nhất, giá vé rẻ nhất  
- **Bản đồ thật** (Leaflet / OpenStreetMap): xem trạm và tuyến trên nền bản đồ  
- **Đồ thị tuyến**: sơ đồ mạng lưới trạm và cung đường dễ đọc  
- **Chi tiết hành trình**: từng bước đi bộ, chờ xe, đi xe kèm thời gian và chi phí  
- **So sánh tuyến**: xem các phương án thay thế và chọn tuyến khác  

---

## Cách chạy

### Yêu cầu

- Trình duyệt (Chrome, Firefox, Edge,…)  
- Kết nối internet (Leaflet, OpenStreetMap, Font Awesome)  

### Chạy ứng dụng

**Cách 1: Mở trực tiếp file**

1. Mở thư mục dự án.  
2. Double-click file `index.html` (hoặc kéo thả vào trình duyệt).  

**Cách 2: Server cục bộ (nên dùng nếu bị lỗi CORS)**

```bash
# Trong thư mục traffic-routing-system

# Python 3
python -m http.server 8080

# Hoặc Node.js
npx serve -p 8080
```

Sau đó mở trình duyệt: **http://localhost:8080**

---

## Hướng dẫn sử dụng

1. **Chọn điểm xuất phát và điểm đến**  
   Dùng dropdown hoặc click trực tiếp lên marker (bản đồ thật) / node (đồ thị tuyến). Lần click đầu = xuất phát, lần thứ hai = điểm đến (tự tìm tuyến).

2. **Chọn tiêu chí**  
   Thời gian ngắn nhất / Ít chuyển xe nhất / Giá vé rẻ nhất.

3. **Giờ xuất phát** (tùy chọn)  
   Chọn giờ và thời gian chờ tối đa (5–30 phút).

4. **Bấm "Tìm Tuyến Đường"**  
   Xem kết quả trên bản đồ (đường cam), đồ thị và panel chi tiết hành trình.

5. **Tab "Bản đồ thật" / "Đồ thị tuyến"**  
   Chuyển giữa bản đồ OpenStreetMap và sơ đồ SVG.

6. **"So Sánh"**  
   Sau khi có tuyến, bấm để xem và chọn phương án thay thế.

7. **"Đặt Lại"**  
   Xóa điểm xuất phát, điểm đến và kết quả.

---

## Danh sách trạm xe bus

Tọa độ GPS gần đúng theo địa chỉ thực tế. Mã trạm QBTH = Quận Bình Thạnh, QTD = Thủ Đức, BD = Bình Dương.

### Bình Thạnh (BS01 – BS10)

| Mã  | Tên trạm              | Mã trạm      | Địa chỉ |
|-----|------------------------|--------------|---------|
| BS01 | Hồ Bơi Hải Quân        | QBTH         | 22 Nguyễn Hữu Cảnh, P.22, Bình Thạnh (gần Landmark 81) |
| BS02 | Chợ Bà Chiểu           | QBTH         | Phan Đăng Lưu - Lê Quang Định, P.1, Bình Thạnh |
| BS03 | Chợ Văn Thánh          | QBTH 037     | 57-59 Nguyễn Văn Thương, P.1, Bình Thạnh |
| BS04 | Trường THPT Hồng Đức   | QBTH         | 175 Nguyễn Văn Thương, P.1, Bình Thạnh |
| BS05 | Đại học Hutech         | QBTH 054/059 | 483 Điện Biên Phủ, P.22, Bình Thạnh (gần Landmark 81) |
| BS06 | Bến đò Bình Quới       | QBTH         | Bến đò Bình Quới, Bình Quới, P.27, Bình Thạnh |
| BS07 | Chợ Bình Quới          | QBTH         | 357 Bình Quới, P.27, Bình Thạnh |
| BS08 | Cư xá Thanh Đa         | QBTH 028     | 1027 Bình Quới, P.27, Bình Thạnh |
| BS09 | Coop Mart Cầu Kinh     | QBTH         | 689 Xô Viết Nghệ Tĩnh, P.25, Bình Thạnh |
| BS10 | Ngã Ba Hàng Xanh       | QBTH         | 334-336 Xô Viết Nghệ Tĩnh, P.25, Bình Thạnh |

### Thủ Đức (BS11 – BS15)

| Mã  | Tên trạm                 | Mã trạm  | Địa chỉ |
|-----|---------------------------|----------|---------|
| BS11 | Bến xe Miền Đông mới     | QTD      | 501 Hoàng Hữu Nam, Long Bình, TP. Thủ Đức (Xa lộ Hà Nội) |
| BS12 | Ga Metro Suối Tiên       | QTD      | Khu vực Suối Tiên, TP. Thủ Đức (Metro Bến Thành – Suối Tiên) |
| BS13 | Ngã tư Thủ Đức           | QTD      | Ngã tư Thủ Đức, Quốc lộ 1, TP. Thủ Đức |
| BS14 | ĐH Quốc Gia (Linh Trung) | QTD      | Linh Trung, TP. Thủ Đức |
| BS15 | ĐH Nông Lâm              | QTD 181  | Quốc lộ 1, Linh Trung, TP. Thủ Đức |

### Bình Dương (BS16 – BS17)

| Mã  | Tên trạm                     | Mã trạm | Địa chỉ |
|-----|------------------------------|---------|---------|
| BS16 | GO! Dĩ An                    | BD      | Dĩ An, Bình Dương (trung chuyển Bình Dương – TP.HCM) |
| BS17 | TP. mới Bình Dương (Hikari)  | BD      | Thành phố mới Bình Dương, Bình Dương |

---

## Danh sách tuyến xe bus

Thứ tự trạm trong bảng là thứ tự đi qua trên tuyến (chiều đi).

| Số tuyến | Tên / mô tả ngắn | Trạm đi qua (theo thứ tự) | Giờ hoạt động | Giá vé |
|----------|------------------|---------------------------|----------------|--------|
| **44**   | Cảng Q4 - Bình Quới (đoạn Bình Thạnh) | BS01 → BS05 → BS09 → BS10 → BS02 → BS07 → BS08 → BS06 | 05:00 – 19:30 | 6.000đ |
| **30**   | Chợ Tân Hương - ĐH Quốc tế (qua Landmark, Chợ Bà Chiểu) | BS05 → BS01 → BS10 → BS02 → BS03 → BS04 | 05:00 – 19:00 | 7.000đ |
| **56**   | ĐH Giao thông Vận tải - Bến xe Chợ Lớn (qua Bình Thạnh) | BS05 → BS01 → BS09 → BS10 → BS02 | 05:00 – 21:00 | 6.000đ |
| **104**  | Bến xe An Sương - ĐH Nông Lâm (qua Hàng Xanh, Bà Chiểu, Thủ Đức) | BS10 → BS02 → BS03 → BS09 → BS07 → BS13 → BS15 | 04:30 – 20:00 | 6.000đ |
| **08**   | Bến xe Q.8 - ĐH Quốc Gia (qua Bến xe Miền Đông mới, Thủ Đức) | BS11 → BS12 → BS13 → BS14 | 05:00 – 21:00 | 7.000đ |
| **50**   | ĐH Bách Khoa - ĐH Quốc Gia (đoạn Thủ Đức) | BS13 → BS14 → BS15 | 05:30 – 18:30 | 7.000đ |
| **61-77**| TP. mới Bình Dương (Hikari) - Bến xe Miền Đông mới (qua Dĩ An) | BS17 → BS16 → BS11 | 05:30 – 19:00 | 8.000đ |
| **52**   | Bến Thành - ĐH Quốc tế (qua Ngã Ba Hàng Xanh, Ngã tư Thủ Đức) | BS10 → BS13 → BS14 | 05:30 – 19:00 | 7.000đ |

---

## Đoạn đi bộ chuyển tuyến

Có thể đi bộ giữa các trạm sau để chuyển tuyến (khoảng cách và thời gian đi bộ gần đúng):

| Từ trạm | Đến trạm | Khoảng cách | Thời gian đi bộ |
|---------|----------|-------------|-----------------|
| BS01    | BS05     | 0,2 km      | 3 phút          |
| BS02    | BS03     | 0,15 km     | 2 phút          |
| BS03    | BS04     | 0,1 km      | 2 phút          |
| BS07    | BS08     | 0,25 km     | 4 phút          |
| BS09    | BS10     | 0,2 km      | 3 phút          |
| BS11    | BS12     | 0,4 km      | 6 phút          |
| BS13    | BS14     | 0,5 km      | 8 phút          |
| BS14    | BS15     | 0,3 km      | 5 phút          |

---

## Cấu trúc thư mục

```
traffic-routing-system/
├── index.html          # Trang chính, giao diện
├── style.css           # Giao diện (tab, bản đồ, đồ thị, form)
├── README.md           # File hướng dẫn này
├── data/
│   └── busData.js      # Dữ liệu trạm, tuyến, đi bộ (Bình Thạnh, Thủ Đức, Bình Dương)
└── js/
    ├── utils.js        # Hàm tiện ích (khoảng cách, format thời gian/tiền, thông báo)
    ├── graph.js        # Xây dựng đồ thị từ busData (cạnh xe bus, đi bộ)
    ├── dijkstra.js     # Thuật toán Dijkstra, K đường đi ngắn nhất
    ├── busSystem.js    # Logic tìm tuyến, chi tiết lộ trình, tuyến thay thế
    ├── mapView.js      # Bản đồ thật (Leaflet), marker, polyline
    ├── graphView.js    # Đồ thị SVG (node, cạnh, nhãn)
    ├── renderer.js     # Hiển thị kết quả (tóm tắt, từng bước hành trình)
    └── main.js         # Khởi tạo app, sự kiện, đồng bộ hai view
```

---

## Công nghệ

- **HTML5, CSS3, JavaScript** (ES6+)  
- **Leaflet 1.9.4** – bản đồ (OpenStreetMap)  
- **Font Awesome 6** – icon  
- Thuật toán **Dijkstra** và **K shortest paths** trên đồ thị có trọng số  

---

## Chỉnh sửa dữ liệu

Dữ liệu trong `data/busData.js`:

- **`busSystem.stops`** – từng trạm: `id`, `name`, `code`, `lat`, `lng`, `address`  
- **`busSystem.routes`** – từng tuyến: `id`, `name`, `number`, `color`, `description`, `stops` (mảng id trạm theo thứ tự), `frequency`, `operatingHours`, `fare`, `speed`, `capacity`  
- **`busSystem.walkingConnections`** – đoạn đi bộ: `from`, `to`, `distance` (km), `walkingTime` (phút)  
- **`busSystem.specialSegments`** – đoạn đặc biệt (tắc đường, v.v.): `from`, `to`, `condition`, `multiplier`, `activeHours`  

Thêm/sửa/xóa trạm hoặc tuyến trong `busData.js` rồi tải lại trang để áp dụng.

---

## Lưu ý

- Cần **internet** để load bản đồ (OpenStreetMap) và thư viện (Leaflet, Font Awesome).  
- Nếu mở bằng `file://` mà gặp lỗi, chạy qua server cục bộ (xem [Cách chạy](#cách-chạy)).  
- Tọa độ và lộ trình trong app là **gần đúng** so với thực tế; thông tin chính thức xem tại BRVT TP.HCM và xe-buyt.com.
