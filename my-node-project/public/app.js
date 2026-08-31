// Frontend app state management and API integration

// Data Cache
let studentsList = [];
let modulesList = [];
let enrollmentsList = [];

// DOM Elements
const studentsTableBody = document.getElementById('students-table-body');
const enrollmentsTableBody = document.getElementById('enrollments-table-body');

const studentModal = document.getElementById('student-modal-backup');
const studentModalTitle = document.getElementById('student-modal-title');
const studentForm = document.getElementById('student-form');
const studentIdInput = document.getElementById('student-id');
const studentNameInput = document.getElementById('student-name');
const studentGenderInput = document.getElementById('student-gender');
const studentBirthdayInput = document.getElementById('student-birthday');
const studentMajorInput = document.getElementById('student-major');

const enrollmentModal = document.getElementById('enrollment-modal-backup');
const enrollmentForm = document.getElementById('enrollment-form');
const enrollmentStudentSelect = document.getElementById('enrollment-student');
const enrollmentModuleSelect = document.getElementById('enrollment-module');
const enrollmentDateInput = document.getElementById('enrollment-date');

const editEnrollmentModal = document.getElementById('edit-enrollment-modal-backup');
const editEnrollmentForm = document.getElementById('edit-enrollment-form');
const editEnrollSidInput = document.getElementById('edit-enroll-sid');
const editEnrollOldMidInput = document.getElementById('edit-enroll-old-mid');
const editEnrollStudentNameInput = document.getElementById('edit-enroll-student-name');
const editEnrollNewModuleSelect = document.getElementById('edit-enrollment-new-module');

const toastContainer = document.getElementById('toast-container');

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    // Load initial data
    loadData();

    // Event Listeners for Student Modal
    document.getElementById('btn-add-student').addEventListener('click', () => openStudentModal());
    document.getElementById('student-modal-close').addEventListener('click', () => closeStudentModal());
    document.getElementById('student-modal-cancel').addEventListener('click', () => closeStudentModal());
    studentForm.addEventListener('submit', handleStudentSubmit);

    // Event Listeners for Enrollment Modal
    document.getElementById('btn-add-enrollment').addEventListener('click', () => openEnrollmentModal());
    document.getElementById('enrollment-modal-close').addEventListener('click', () => closeEnrollmentModal());
    document.getElementById('enrollment-modal-cancel').addEventListener('click', () => closeEnrollmentModal());
    enrollmentForm.addEventListener('submit', handleEnrollmentSubmit);

    // Event Listeners for Edit Enrollment Modal
    document.getElementById('edit-enrollment-modal-close').addEventListener('click', () => closeEditEnrollmentModal());
    document.getElementById('edit-enrollment-modal-cancel').addEventListener('click', () => closeEditEnrollmentModal());
    editEnrollmentForm.addEventListener('submit', handleEditEnrollmentSubmit);

    // Close modals on clicking backdrop
    [studentModal, enrollmentModal, editEnrollmentModal].forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });
    });
});

// Toast Helper
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    // Add appropriate icon based on type
    const icon = type === 'success' ? '✓' : '✗';
    toast.innerHTML = `<span>${icon}</span> <div>${message}</div>`;
    
    toastContainer.appendChild(toast);
    
    // Auto remove toast
    setTimeout(() => {
        toast.style.animation = 'slideIn 0.3s reverse forwards';
        setTimeout(() => toast.remove(), 300);
    }, 3500);
}

// ----------------------------------------------------
// API & DATA LOADERS
// ----------------------------------------------------

async function loadData() {
    try {
        await Promise.all([
            fetchStudents(),
            fetchModules(),
            fetchEnrollments()
        ]);
        renderStudents();
        renderEnrollments();
        populateFormDropdowns();
    } catch (error) {
        showToast('Không thể kết nối đến máy chủ CSDL', 'error');
        console.error(error);
    }
}

async function fetchStudents() {
    const res = await fetch('/api/students');
    studentsList = await res.json();
}

async function fetchModules() {
    const res = await fetch('/api/modules');
    modulesList = await res.json();
}

async function fetchEnrollments() {
    const res = await fetch('/api/enrollments');
    enrollmentsList = await res.json();
}

// ----------------------------------------------------
// RENDER FUNCTIONS
// ----------------------------------------------------

function renderStudents() {
    studentsTableBody.innerHTML = '';
    if (studentsList.length === 0) {
        studentsTableBody.innerHTML = `<tr><td colspan="6" class="empty-state">Chưa có sinh viên nào.</td></tr>`;
        return;
    }

    studentsList.forEach(student => {
        const tr = document.createElement('tr');
        const genderClass = student.Gender && student.Gender.toLowerCase() === 'nữ' ? 'nu' : 'nam';
        
        tr.innerHTML = `
            <td><strong>#${student.SID}</strong></td>
            <td>${student.SName}</td>
            <td><span class="badge badge-gender-${genderClass}">${student.Gender || 'Khác'}</span></td>
            <td>${student.Birthday ? formatDate(student.Birthday) : '-'}</td>
            <td>${student.Major || '-'}</td>
            <td>
                <div class="actions-cell">
                    <button class="btn btn-secondary btn-sm" onclick="editStudent(${student.SID})">Sửa</button>
                    <button class="btn btn-danger btn-sm" onclick="deleteStudent(${student.SID})">Xóa</button>
                </div>
            </td>
        `;
        studentsTableBody.appendChild(tr);
    });
}

function renderEnrollments() {
    enrollmentsTableBody.innerHTML = '';
    if (enrollmentsList.length === 0) {
        enrollmentsTableBody.innerHTML = `<tr><td colspan="5" class="empty-state">Chưa có học phần nào được đăng ký.</td></tr>`;
        return;
    }

    enrollmentsList.forEach(enroll => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>
                <div><strong>${enroll.SName}</strong></div>
                <small style="color: var(--text-muted)">MSSV: #${enroll.SID}</small>
            </td>
            <td>
                <div><strong>${enroll.MName}</strong></div>
                <small style="color: var(--text-muted)">Mã HP: #${enroll.MID}</small>
            </td>
            <td><span class="badge badge-credit">${enroll.Credits} tín chỉ</span></td>
            <td>${enroll.EnrollDate ? formatDate(enroll.EnrollDate) : '-'}</td>
            <td>
                <div class="actions-cell">
                    <button class="btn btn-secondary btn-sm" onclick="openEditEnrollment(${enroll.SID}, ${enroll.MID}, '${escapeJsString(enroll.SName)}')">Đổi học phần</button>
                    <button class="btn btn-danger btn-sm" onclick="deleteEnrollment(${enroll.SID}, ${enroll.MID})">Hủy đăng ký</button>
                </div>
            </td>
        `;
        enrollmentsTableBody.appendChild(tr);
    });
}

function populateFormDropdowns() {
    // Populate Student Select dropdown in Enrollment modal
    enrollmentStudentSelect.innerHTML = '<option value="">-- Chọn sinh viên --</option>';
    studentsList.forEach(student => {
        const opt = document.createElement('option');
        opt.value = student.SID;
        opt.textContent = `${student.SName} (MSSV: #${student.SID})`;
        enrollmentStudentSelect.appendChild(opt);
    });

    // Populate Module Select dropdown in Enrollment modal
    enrollmentModuleSelect.innerHTML = '<option value="">-- Chọn học phần --</option>';
    modulesList.forEach(mod => {
        const opt = document.createElement('option');
        opt.value = mod.MID;
        opt.textContent = `${mod.MName} (${mod.Credits} tín chỉ)`;
        enrollmentModuleSelect.appendChild(opt);
    });
}

// ----------------------------------------------------
// MODAL CONTROLLERS & SUBMISSIONS
// ----------------------------------------------------

// 1. Student Modal
function openStudentModal(student = null) {
    if (student) {
        studentModalTitle.textContent = 'Cập nhật thông tin Sinh viên';
        studentIdInput.value = student.SID;
        studentNameInput.value = student.SName;
        studentGenderInput.value = student.Gender || 'Nam';
        studentBirthdayInput.value = student.Birthday || '';
        studentMajorInput.value = student.Major || '';
    } else {
        studentModalTitle.textContent = 'Thêm Sinh viên mới';
        studentForm.reset();
        studentIdInput.value = '';
        // Default date to 20 years ago
        const defaultDate = new Date();
        defaultDate.setFullYear(defaultDate.getFullYear() - 20);
        studentBirthdayInput.value = defaultDate.toISOString().split('T')[0];
    }
    studentModal.classList.add('active');
}

function closeStudentModal() {
    studentModal.classList.remove('active');
}

async function handleStudentSubmit(e) {
    e.preventDefault();
    const id = studentIdInput.value;
    const studentData = {
        SName: studentNameInput.value,
        Gender: studentGenderInput.value,
        Birthday: studentBirthdayInput.value,
        Major: studentMajorInput.value
    };

    try {
        let response;
        if (id) {
            // Update mode
            response = await fetch(`/api/students/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(studentData)
            });
        } else {
            // Create mode
            response = await fetch('/api/students', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(studentData)
            });
        }

        const data = await response.json();
        if (response.ok) {
            showToast(id ? 'Cập nhật sinh viên thành công!' : 'Thêm sinh viên thành công!');
            closeStudentModal();
            loadData();
        } else {
            showToast(data.error || 'Có lỗi xảy ra', 'error');
        }
    } catch (err) {
        showToast('Lỗi mạng, vui lòng thử lại', 'error');
        console.error(err);
    }
}

// 2. Enrollment Modal
function openEnrollmentModal() {
    enrollmentForm.reset();
    enrollmentDateInput.value = new Date().toISOString().split('T')[0];
    enrollmentModal.classList.add('active');
}

function closeEnrollmentModal() {
    enrollmentModal.classList.remove('active');
}

async function handleEnrollmentSubmit(e) {
    e.preventDefault();
    const enrollData = {
        SID: parseInt(enrollmentStudentSelect.value),
        MID: parseInt(enrollmentModuleSelect.value),
        EnrollDate: enrollmentDateInput.value
    };

    try {
        const response = await fetch('/api/enrollments', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(enrollData)
        });

        const data = await response.json();
        if (response.ok) {
            showToast('Đăng ký học phần thành công!');
            closeEnrollmentModal();
            loadData();
        } else {
            showToast(data.error || 'Đăng ký học phần thất bại', 'error');
        }
    } catch (err) {
        showToast('Lỗi mạng, vui lòng thử lại', 'error');
        console.error(err);
    }
}

// 3. Edit Enrollment Modal (Update)
function openEditEnrollment(sid, currentMid, studentName) {
    editEnrollSidInput.value = sid;
    editEnrollOldMidInput.value = currentMid;
    editEnrollStudentNameInput.value = studentName;
    
    // Fill course select
    editEnrollNewModuleSelect.innerHTML = '';
    modulesList.forEach(mod => {
        const opt = document.createElement('option');
        opt.value = mod.MID;
        opt.textContent = `${mod.MName} (${mod.Credits} TC)`;
        if (mod.MID === currentMid) {
            opt.selected = true;
        }
        editEnrollNewModuleSelect.appendChild(opt);
    });

    editEnrollmentModal.classList.add('active');
}

function closeEditEnrollmentModal() {
    editEnrollmentModal.classList.remove('active');
}

async function handleEditEnrollmentSubmit(e) {
    e.preventDefault();
    const sid = editEnrollSidInput.value;
    const oldMid = editEnrollOldMidInput.value;
    const newMid = editEnrollNewModuleSelect.value;

    if (oldMid === newMid) {
        closeEditEnrollmentModal();
        return;
    }

    try {
        const response = await fetch(`/api/enrollments/${sid}/${oldMid}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ newMID: parseInt(newMid) })
        });

        const data = await response.json();
        if (response.ok) {
            showToast('Thay đổi học phần thành công!');
            closeEditEnrollmentModal();
            loadData();
        } else {
            showToast(data.error || 'Thay đổi học phần thất bại', 'error');
        }
    } catch (err) {
        showToast('Lỗi mạng, vui lòng thử lại', 'error');
        console.error(err);
    }
}

// ----------------------------------------------------
// EDIT / DELETE ACTIONS
// ----------------------------------------------------

window.editStudent = function(sid) {
    const student = studentsList.find(s => s.SID === sid);
    if (student) {
        openStudentModal(student);
    }
};

window.deleteStudent = async function(sid) {
    if (!confirm('Bạn có chắc chắn muốn xóa sinh viên này? Các học phần đã đăng ký liên quan cũng sẽ bị xóa.')) {
        return;
    }

    try {
        const response = await fetch(`/api/students/${sid}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            showToast('Đã xóa sinh viên thành công!');
            loadData();
        } else {
            const data = await response.json();
            showToast(data.error || 'Xóa sinh viên thất bại', 'error');
        }
    } catch (err) {
        showToast('Lỗi mạng, vui lòng thử lại', 'error');
        console.error(err);
    }
};

window.deleteEnrollment = async function(sid, mid) {
    if (!confirm('Bạn có chắc chắn muốn hủy đăng ký học phần này?')) {
        return;
    }

    try {
        const response = await fetch(`/api/enrollments/${sid}/${mid}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            showToast('Đã hủy đăng ký học phần thành công!');
            loadData();
        } else {
            const data = await response.json();
            showToast(data.error || 'Hủy đăng ký thất bại', 'error');
        }
    } catch (err) {
        showToast('Lỗi mạng, vui lòng thử lại', 'error');
        console.error(err);
    }
};

// ----------------------------------------------------
// HELPER UTILS
// ----------------------------------------------------

function formatDate(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    const d = String(date.getDate()).padStart(2, '0');
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const y = date.getFullYear();
    return `${d}/${m}/${y}`;
}

function escapeJsString(str) {
    return str.replace(/'/g, "\\'");
}
