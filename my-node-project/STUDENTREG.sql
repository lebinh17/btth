-- STUDENTREG SQL Schema and Seed Data

-- 1. Create Student Table
CREATE TABLE IF NOT EXISTS STUDENT (
    SID INTEGER PRIMARY KEY AUTOINCREMENT,
    SName TEXT NOT NULL,
    Gender TEXT,
    Birthday TEXT,
    Major TEXT
);

-- 2. Create Module Table
CREATE TABLE IF NOT EXISTS MODULE (
    MID INTEGER PRIMARY KEY AUTOINCREMENT,
    MName TEXT NOT NULL,
    Credits INTEGER
);

-- 3. Create Student Enrollment Table
CREATE TABLE IF NOT EXISTS STUDENT_ENROLEMENT (
    SID INTEGER,
    MID INTEGER,
    EnrollDate TEXT DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (SID, MID),
    FOREIGN KEY (SID) REFERENCES STUDENT(SID) ON DELETE CASCADE,
    FOREIGN KEY (MID) REFERENCES MODULE(MID) ON DELETE CASCADE
);

-- Insert Seed Data for STUDENTS
-- Setting explicit IDs to match course slide examples
INSERT OR IGNORE INTO STUDENT (SID, SName, Gender, Birthday, Major) VALUES
(1007, 'Nguyễn Văn An', 'Nam', '2004-05-15', 'Công nghệ thông tin'),
(1008, 'Trần Thị Bình', 'Nữ', '2004-08-20', 'An toàn thông tin'),
(1009, 'Lê Xuân Cường', 'Nam', '2003-12-10', 'Khoa học máy tính'),
(1010, 'Phạm Minh Đăng', 'Nam', '2004-01-25', 'Hệ thống thông tin');

-- Insert Seed Data for MODULES
INSERT OR IGNORE INTO MODULE (MID, MName, Credits) VALUES
(117, 'Lập trình Web nâng cao', 3),
(120, 'Cơ sở dữ liệu', 3),
(121, 'Trí tuệ nhân tạo', 4),
(122, 'Phát triển ứng dụng di động', 3);

-- Insert Seed Data for STUDENT_ENROLEMENT
INSERT OR IGNORE INTO STUDENT_ENROLEMENT (SID, MID, EnrollDate) VALUES
(1007, 117, '2026-08-30'),
(1007, 120, '2026-08-31'),
(1008, 120, '2026-08-31'),
(1009, 121, '2026-08-29');
