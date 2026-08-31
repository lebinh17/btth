# Bài Tập Kết Nối Cơ Sở Dữ Liệu và Thực Hiện CRUD (Node.js & SQLite)

Dự án này là ứng dụng web quản lý Sinh viên đăng ký môn học (STUDENTREG) sử dụng **Node.js, Express và SQLite**. Hệ thống hỗ trợ đầy đủ các tính năng CRUD (Thêm, Đọc, Sửa, Xóa) trên cơ sở dữ liệu quan hệ cục bộ.

---

## 1. Kiến Trúc và Các Thành Phần Của Dự Án

Dự án được tổ chức trong thư mục [`my-node-project`](file:///c:/Users/Binh/New%20folder/btth/my-node-project) bao gồm các tệp tin sau:

- **[`my-node-project/STUDENTREG.sql`](file:///c:/Users/Binh/New%20folder/btth/my-node-project/STUDENTREG.sql)**: Chứa định nghĩa schema cho 3 bảng quan hệ: `STUDENT` (Sinh viên), `MODULE` (Học phần), và `STUDENT_ENROLEMENT` (Đăng ký học), cùng dữ liệu mẫu ban đầu.
- **[`my-node-project/init_db.js`](file:///c:/Users/Binh/New%20folder/btth/my-node-project/init_db.js)**: Script khởi tạo cơ sở dữ liệu SQLite (`studentreg.db`) từ tệp tin SQL gốc.
- **[`my-node-project/db.js`](file:///c:/Users/Binh/New%20folder/btth/my-node-project/db.js)**: Chứa các hàm dùng chung để kết nối CSDL và thực thi câu lệnh SQL (`query`, `commitQuery`, `endConnection`) dưới dạng Promise.
- **[`my-node-project/index.js`](file:///c:/Users/Binh/New%20folder/btth/my-node-project/index.js)**: Express Server cung cấp các API endpoint thực hiện CRUD và phục vụ thư mục frontend tĩnh.
- **Thư mục [`my-node-project/public`](file:///c:/Users/Binh/New%20folder/btth/my-node-project/public)**: Giao diện Web tương tác cao cấp (Dark Mode, Glassmorphism, Responsive và Toast Notification).

---

## 2. Hướng Dẫn Cài Đặt và Khởi Chạy

Do môi trường chạy Node.js nằm tại đường dẫn tùy chỉnh trong hệ thống của bạn, hãy sử dụng các lệnh dưới đây trong PowerShell/Command Prompt:

### Bước 1: Di chuyển vào thư mục dự án
```powershell
cd "c:\Users\Binh\New folder\btth\my-node-project"
```

### Bước 2: Khởi tạo cơ sở dữ liệu
Lệnh này sẽ tạo ra tệp cơ sở dữ liệu `studentreg.db` và nạp dữ liệu mẫu ban đầu từ file `STUDENTREG.sql`.
```powershell
& "C:\Program Files\Microsoft Visual Studio\2022\Community\MSBuild\Microsoft\VisualStudio\NodeJs\node.exe" init_db.js
```

### Bước 3: Khởi động máy chủ Express
```powershell
& "C:\Program Files\Microsoft Visual Studio\2022\Community\MSBuild\Microsoft\VisualStudio\NodeJs\node.exe" index.js
```

Khi màn hình hiển thị `Express server running on http://localhost:3000`, hãy mở trình duyệt và truy cập [**http://localhost:3000**](http://localhost:3000) để trải nghiệm giao diện.

---

## 3. Mã Nguồn CRUD Thực Hiện Trong Dự Án (Dành Cho Ảnh Chụp Màn Hình Code)

### A. Kết nối CSDL chung ([`db.js`](file:///c:/Users/Binh/New%20folder/btth/my-node-project/db.js))
Được viết dưới dạng Promise để hỗ trợ bất đồng bộ `async/await` hoặc `.then().catch()` mượt mà:
```javascript
const sqlite3 = require('sqlite3').verbose();
const connection = new sqlite3.Database(dbPath);

const query = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        connection.all(sql, params, (error, rows) => {
            if (error) return reject(error);
            resolve(rows);
        });
    });
};
```

### B. Router CRUD trên Express Backend ([`index.js`](file:///c:/Users/Binh/New%20folder/btth/my-node-project/index.js))

- **CREATE (Thêm học phần đăng ký mới):**
  ```javascript
  app.post('/api/enrollments', (req, res) => {
      const { SID, MID, EnrollDate } = req.body;
      const sql = 'INSERT INTO STUDENT_ENROLEMENT (SID, MID, EnrollDate) VALUES (?, ?, ?)';
      db.query(sql, [SID, MID, EnrollDate])
          .then(() => res.status(201).json({ message: 'Thành công' }))
          .catch(err => res.status(500).json({ error: err.message }));
  });
  ```

- **READ (Đọc danh sách sinh viên & đăng ký):**
  ```javascript
  app.get('/api/students', (req, res) => {
      db.query('SELECT * FROM STUDENT ORDER BY SID DESC')
          .then(results => res.json(results))
          .catch(err => res.status(500).json({ error: err.message }));
  });
  ```

- **UPDATE (Cập nhật môn học đăng ký - khớp ví dụ slide):**
  ```javascript
  app.put('/api/enrollments/:sid/:mid', (req, res) => {
      const { sid, mid } = req.params;
      const { newMID } = req.body;
      const sql = 'UPDATE STUDENT_ENROLEMENT SET MID = ? WHERE SID = ? AND MID = ?';
      db.query(sql, [newMID, sid, mid])
          .then(() => res.json({ message: 'Cập nhật thành công' }))
          .catch(err => res.status(500).json({ error: err.message }));
  });
  ```

- **DELETE (Hủy đăng ký học phần):**
  ```javascript
  app.delete('/api/enrollments/:sid/:mid', (req, res) => {
      const { sid, mid } = req.params;
      const sql = 'DELETE FROM STUDENT_ENROLEMENT WHERE SID = ? AND MID = ?';
      db.query(sql, [sid, mid])
          .then(() => res.json({ message: 'Xóa thành công' }))
          .catch(err => res.status(500).json({ error: err.message }));
  });
  ```

---

## 4. Hướng Dẫn Chụp Ảnh Màn Hình Kiểm Thử CRUD bằng Trình Duyệt / Postman / Thunder Client

Bạn có thể chạy thử các URL dưới đây và chụp lại màn hình kết quả phản hồi của API (dạng JSON) để làm báo cáo:

### 1. Kiểm thử READ (Đọc danh sách Sinh viên)
- **Phương thức:** `GET`
- **URL:** `http://localhost:3000/api/students`
- **Kết quả mong đợi:** Danh sách JSON chứa các sinh viên như `Nguyễn Văn An`, `Trần Thị Bình`...

### 2. Kiểm thử READ (Đọc danh sách Đăng ký)
- **Phương thức:** `GET`
- **URL:** `http://localhost:3000/api/enrollments`
- **Kết quả mong đợi:** Chi tiết đăng ký học phần bao gồm Tên sinh viên, Tên môn học, Số tín chỉ và Ngày đăng ký.

### 3. Kiểm thử CREATE (Đăng ký môn học mới)
- **Phương thức:** `POST`
- **URL:** `http://localhost:3000/api/enrollments`
- **Headers:** `Content-Type: application/json`
- **Body (JSON):**
  ```json
  {
      "SID": 1008,
      "MID": 122,
      "EnrollDate": "2026-08-31"
  }
  ```

### 4. Kiểm thử UPDATE (Thay đổi học phần đăng ký của sinh viên 1007 từ môn 117 sang 122)
- **Phương thức:** `PUT`
- **URL:** `http://localhost:3000/api/enrollments/1007/117`
- **Headers:** `Content-Type: application/json`
- **Body (JSON):**
  ```json
  {
      "newMID": 122
  }
  ```

### 5. Kiểm thử DELETE (Hủy đăng ký học phần)
- **Phương thức:** `DELETE`
- **URL:** `http://localhost:3000/api/enrollments/1007/120`