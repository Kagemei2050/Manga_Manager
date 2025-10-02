# 🎨 Hướng dẫn Deploy lên Render (Miễn phí mãi mãi)

## ✨ Ưu điểm:
- ✅ **Miễn phí 100%** - không giới hạn thời gian
- ✅ **URL cố định** không đổi
- ✅ **HTTPS** tự động
- ✅ **Deploy tự động** khi push code
- ⚠️ Sleep sau 15 phút không dùng (wake up trong 30-60s)

---

## 📋 Các bước thực hiện:

### **Bước 1: Tạo GitHub Repository**

#### 1.1. Tạo repo mới trên GitHub:
1. Truy cập: https://github.com/new
2. Repository name: `manga-reader-web`
3. Chọn **Public** (Render free chỉ hỗ trợ public repo)
4. Click **Create repository**

#### 1.2. Push code lên GitHub:

```bash
# Mở terminal trong thư mục web_version
cd "i:\new app\CascadeProjects\windsurf-project\web_version"

# Khởi tạo git (nếu chưa có)
git init

# Thêm tất cả file
git add .

# Commit
git commit -m "Initial commit - Manga Reader Web"

# Thêm remote (thay YOUR_USERNAME bằng username GitHub của bạn)
git remote add origin https://github.com/YOUR_USERNAME/manga-reader-web.git

# Push lên GitHub
git branch -M main
git push -u origin main
```

**Lưu ý**: Nếu chưa cài Git, tải tại: https://git-scm.com/download/win

---

### **Bước 2: Tạo tài khoản Render**

1. Truy cập: https://render.com
2. Click **Get Started for Free**
3. Chọn **Sign up with GitHub**
4. Cho phép Render truy cập GitHub của bạn

---

### **Bước 3: Deploy Web Service**

#### 3.1. Tạo Web Service mới:
1. Vào Render Dashboard: https://dashboard.render.com
2. Click **New +** (góc trên bên phải)
3. Chọn **Web Service**

#### 3.2. Connect Repository:
1. Tìm và chọn repository `manga-reader-web`
2. Nếu không thấy, click **Configure account** để cho phép Render truy cập repo

#### 3.3. Cấu hình Web Service:

**Điền các thông tin sau:**

| Field | Value |
|-------|-------|
| **Name** | `manga-reader-web` (hoặc tên bạn thích) |
| **Region** | `Singapore` (gần Việt Nam nhất) |
| **Branch** | `main` |
| **Root Directory** | Để trống |
| **Runtime** | `Python 3` |
| **Build Command** | `pip install -r requirements.txt` |
| **Start Command** | `python app.py` |
| **Instance Type** | `Free` |

#### 3.4. Environment Variables (Tùy chọn):

Click **Advanced** và thêm biến môi trường (nếu cần):

| Key | Value |
|-----|-------|
| `PYTHON_VERSION` | `3.11.0` |

#### 3.5. Deploy:
1. Click **Create Web Service**
2. Render sẽ bắt đầu build và deploy (mất 2-5 phút)
3. Đợi đến khi status là **Live** (màu xanh)

---

### **Bước 4: Lấy URL**

Sau khi deploy xong:
1. Vào Render Dashboard
2. Click vào service `manga-reader-web`
3. URL sẽ hiển thị ở đầu trang

**URL có dạng:**
```
https://manga-reader-web.onrender.com
```

**URL này cố định và hoạt động mãi mãi!**

---

### **Bước 5: Upload Data (Quan trọng!)**

#### Option A: Push data lên GitHub (Đơn giản nhất)

```bash
# Quay lại thư mục gốc
cd "i:\new app\CascadeProjects\windsurf-project"

# Kiểm tra .gitignore không chặn data
# Nếu có dòng "data/" thì xóa đi

# Add data
git add data/
git commit -m "Add manga and novel data"
git push
```

**Render sẽ tự động deploy lại trong vài phút.**

#### Option B: Sử dụng Cloud Storage (Nếu data >100MB)

**Cloudinary** (Miễn phí 25GB):
1. Đăng ký: https://cloudinary.com
2. Upload ảnh lên Cloudinary
3. Sửa code để load từ Cloudinary URL

**Google Drive**:
1. Upload data lên Google Drive
2. Dùng Google Drive API để load file

---

## 🎯 Kiểm tra Deploy:

### 1. Xem Logs:
- Render Dashboard > Service > **Logs**
- Kiểm tra có lỗi không

### 2. Test Web:
- Truy cập URL: `https://manga-reader-web.onrender.com`
- Kiểm tra load được truyện không

### 3. Test từ điện thoại:
- Mở trình duyệt trên điện thoại
- Nhập URL
- Đọc thử truyện

---

## 🔄 Cập nhật Code:

Sau khi deploy, mỗi khi sửa code:

```bash
cd "i:\new app\CascadeProjects\windsurf-project\web_version"

git add .
git commit -m "Update features"
git push
```

**Render sẽ tự động deploy lại trong 2-3 phút.**

---

## 💤 Tránh Sleep (Tùy chọn):

### Phương pháp 1: UptimeRobot (Khuyến nghị)

1. Truy cập: https://uptimerobot.com
2. Đăng ký miễn phí
3. Add New Monitor:
   - **Monitor Type**: HTTP(s)
   - **Friendly Name**: Manga Reader
   - **URL**: `https://manga-reader-web.onrender.com`
   - **Monitoring Interval**: 5 minutes
4. Click **Create Monitor**

**UptimeRobot sẽ ping web mỗi 5 phút → Web không bao giờ sleep!**

### Phương pháp 2: Cron-job.org

1. Truy cập: https://cron-job.org
2. Đăng ký miễn phí
3. Create Cronjob:
   - **Title**: Keep Alive
   - **URL**: `https://manga-reader-web.onrender.com`
   - **Schedule**: Every 10 minutes
4. Save

---

## 📊 Giới hạn Free Plan:

- ✅ **750 giờ/tháng** cho tất cả services (đủ cho 1 web chạy 24/7)
- ✅ **512MB RAM**
- ✅ **Unlimited bandwidth**
- ⚠️ **Sleep sau 15 phút** không dùng
- ⚠️ **Chỉ public GitHub repo**

---

## 🆘 Troubleshooting:

### Lỗi: "Build failed"

**Nguyên nhân**: Thiếu dependencies

**Giải pháp**:
```bash
# Kiểm tra requirements.txt có đủ không
cd web_version
pip freeze > requirements.txt
git add requirements.txt
git commit -m "Update requirements"
git push
```

### Lỗi: "Application failed to respond"

**Nguyên nhân**: Port không đúng

**Giải pháp**: Kiểm tra `app.py` có đoạn này:
```python
if __name__ == '__main__':
    import os
    port = int(os.environ.get('PORT', 5000))
    app.run(debug=False, host='0.0.0.0', port=port)
```

### Lỗi: "Data not found"

**Nguyên nhân**: Thư mục `data` chưa push lên GitHub

**Giải pháp**:
```bash
cd "i:\new app\CascadeProjects\windsurf-project"
git add data/
git commit -m "Add data"
git push
```

### Web bị sleep:

**Giải pháp**: Dùng UptimeRobot để ping mỗi 5 phút (xem phần "Tránh Sleep")

---

## 🎉 Kết quả:

Sau khi hoàn thành:
- ✅ Web chạy 24/7 (không cần mở máy tính)
- ✅ URL cố định: `https://manga-reader-web.onrender.com`
- ✅ Truy cập từ mọi nơi (4G, 5G, WiFi...)
- ✅ HTTPS an toàn
- ✅ Miễn phí mãi mãi
- ⚠️ Sleep sau 15 phút (wake up trong 30-60s)

---

## 📞 Hỗ trợ:

- Render Docs: https://render.com/docs
- Render Community: https://community.render.com
- GitHub Issues: Tạo issue trong repo của bạn

---

## 💡 Tips:

### 1. Custom Domain (Miễn phí):
- Mua domain (.com, .net, .xyz...)
- Render Dashboard > Settings > Custom Domain
- Thêm domain của bạn

### 2. Tăng tốc độ:
- Chọn region gần Việt Nam (Singapore)
- Optimize ảnh trước khi upload
- Sử dụng CDN cho ảnh

### 3. Bảo mật:
- Thêm authentication nếu data riêng tư
- Không commit API keys vào GitHub
- Dùng Environment Variables cho secrets

### 4. Monitoring:
- Dùng UptimeRobot để theo dõi uptime
- Nhận email khi web down
- Xem logs trên Render Dashboard

---

## 🆚 So sánh Render vs Railway:

| Tính năng | Render Free | Railway Free |
|-----------|-------------|--------------|
| **Giá** | Miễn phí mãi | 500h/tháng |
| **Sleep** | 15 phút | Không |
| **Wake time** | 30-60s | N/A |
| **RAM** | 512MB | 512MB |
| **Bandwidth** | Unlimited | Unlimited |
| **GitHub** | Public only | Public/Private |
| **Dùng lâu dài** | ✅ | ❌ (~20 ngày) |

**Khuyến nghị**: Dùng Render cho dự án cá nhân, miễn phí lâu dài!
