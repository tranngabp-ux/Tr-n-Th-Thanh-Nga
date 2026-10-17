import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

// Initial seed data for Võ Thị Sáu school lab
const initialData = {
  users: [
    { id: 'u1', username: 'nga', name: 'Cô Trần Thị Thanh Nga', role: 'admin', title: 'Quản trị viên / Quản lý phòng thí nghiệm', password: '123' },
    { id: 'u2', username: 'truoc', name: 'Thầy Nguyễn Văn Trước', role: 'teacher', title: 'Giáo viên Hóa học', password: '123' },
    { id: 'u3', username: 'huong', name: 'Cô Lê Thị Hường', role: 'teacher', title: 'Giáo viên Hóa học', password: '123' },
    { id: 'u4', username: 'hoai_anh', name: 'Cô Nguyễn Thị Hoài Anh', role: 'teacher', title: 'Giáo viên Hóa học', password: '123' },
  ],
  chemicals: [
    { id: 'c1', name: 'Natri (Na) kim loại', formula: 'Na', unit: 'lọ (25g)', quantity: 2, minQuantity: 5, location: 'Tủ A - Ngăn 3 (Khóa kín, ngập dầu hỏa)', entryDate: '2024-09-10', expiryDate: '2027-09-10', status: 'Nguy hiểm cao', aiEstimate: 2, verifiedCount: 2, isHazardous: true, hazardNote: 'Chất dễ cháy nổ khi gặp nước, bảo quản ngập trong dầu hỏa.' },
    { id: 'c2', name: 'Axit Clohydric (HCl 37%)', formula: 'HCl', unit: 'chai (500ml)', quantity: 4, minQuantity: 5, location: 'Tủ B - Ngăn 1 (Chống axit)', entryDate: '2024-08-15', expiryDate: '2026-08-15', status: 'Bình thường', aiEstimate: 4, verifiedCount: 4, isHazardous: true, hazardNote: 'Axit mạnh, gây bỏng nặng, có khí mùi xốc.' },
    { id: 'c3', name: 'Axit Sunfuric (H2SO4 98%)', formula: 'H2SO4', unit: 'chai (500ml)', quantity: 3, minQuantity: 5, location: 'Tủ B - Ngăn 2 (Chống axit)', entryDate: '2024-08-15', expiryDate: '2027-08-15', status: 'Bình thường', aiEstimate: 3, verifiedCount: 3, isHazardous: true, hazardNote: 'Axit đặc háo nước, gây bỏng nặng.' },
    { id: 'c4', name: 'Natri Hydroxit (NaOH hạt)', formula: 'NaOH', unit: 'lọ (500g)', quantity: 6, minQuantity: 5, location: 'Tủ B - Ngăn 3 (Base)', entryDate: '2024-09-01', expiryDate: '2026-09-01', status: 'Bình thường', aiEstimate: 6, verifiedCount: 6, isHazardous: true, hazardNote: 'Base mạnh, ăn mòn da và thủy tinh khi đun nóng.' },
    { id: 'c5', name: 'Đồng(II) Sunfat (CuSO4.5H2O)', formula: 'CuSO4.5H2O', unit: 'lọ (500g)', quantity: 8, minQuantity: 5, location: 'Tủ C - Ngăn 1', entryDate: '2024-09-01', expiryDate: '2028-01-01', status: 'Bình thường', aiEstimate: 8, verifiedCount: 8, isHazardous: false, hazardNote: 'Muối đồng độc hại khi nuốt phải.' },
    { id: 'c6', name: 'Kali Pemanganat (Thuốc tím)', formula: 'KMnO4', unit: 'lọ (250g)', quantity: 3, minQuantity: 5, location: 'Tủ C - Ngăn 2 (Chất oxy hóa)', entryDate: '2024-07-20', expiryDate: '2026-06-15', status: 'Sắp hết hạn', aiEstimate: 3, verifiedCount: 3, isHazardous: true, hazardNote: 'Chất oxy hóa mạnh, dễ cháy nổ khi trộn chất hữu cơ.' },
    { id: 'c7', name: 'Amoniac dung dịch (NH3 25%)', formula: 'NH3', unit: 'chai (500ml)', quantity: 5, minQuantity: 5, location: 'Tủ D - Ngăn 1 (Có mùi)', entryDate: '2024-10-01', expiryDate: '2026-10-01', status: 'Bình thường', aiEstimate: 5, verifiedCount: 5, isHazardous: true, hazardNote: 'Khí độc, mùi xốc khai đặc trưng, thao tác tủ hút.' },
    { id: 'c8', name: 'Amoni Clorua (NH4Cl)', formula: 'NH4Cl', unit: 'lọ (500g)', quantity: 7, minQuantity: 5, location: 'Tủ C - Ngăn 3', entryDate: '2024-09-15', expiryDate: '2029-09-15', status: 'Bình thường', aiEstimate: 7, verifiedCount: 7, isHazardous: false, hazardNote: '' },
    { id: 'c9', name: 'Phenolphthalein chỉ thị', formula: 'C20H14O4', unit: 'lọ (100ml)', quantity: 4, minQuantity: 3, location: 'Tủ A - Ngăn 1', entryDate: '2024-05-10', expiryDate: '2026-05-10', status: 'Bình thường', aiEstimate: 4, verifiedCount: 4, isHazardous: false, hazardNote: '' },
    { id: 'c10', name: 'Canxi Cácbua (Đất đèn - CaC2)', formula: 'CaC2', unit: 'lọ (500g)', quantity: 2, minQuantity: 5, location: 'Tủ D - Ngăn 2', entryDate: '2024-04-12', expiryDate: '2026-04-12', status: 'Cần kiểm tra nắp', aiEstimate: 2, verifiedCount: 2, isHazardous: true, hazardNote: 'Tác dụng với nước sinh khí C2H2 dễ cháy.' }
  ],
  equipment: [
    { id: 'eq1', name: 'Ống nghiệm thủy tinh 16x160mm', code: 'ON-16160', quantity: 120, totalQuantity: 150, brokenQuantity: 12, lostQuantity: 3, location: 'Kệ Dụng Cụ 1 - Ngăn A', condition: 'Tốt (Đã kiểm đếm)' },
    { id: 'eq2', name: 'Đèn cồn thủy tinh 100ml', code: 'DC-100', quantity: 18, totalQuantity: 25, brokenQuantity: 5, lostQuantity: 2, location: 'Kệ Dụng Cụ 1 - Ngăn B', condition: 'Cần bổ sung bấc' },
    { id: 'eq3', name: 'Cốc thủy tinh chịu nhiệt 250ml (Beaker)', code: 'CT-250', quantity: 40, totalQuantity: 45, brokenQuantity: 4, lostQuantity: 1, location: 'Kệ Dụng Cụ 2 - Ngăn A', condition: 'Tốt' },
    { id: 'eq4', name: 'Buret 25ml có khóa PTFE', code: 'BR-25', quantity: 15, totalQuantity: 20, brokenQuantity: 3, lostQuantity: 2, location: 'Kệ Dụng Cụ 3 - Ngăn C', condition: 'Tốt' },
    { id: 'eq5', name: 'Pipet vạch 10ml', code: 'PP-10', quantity: 28, totalQuantity: 30, brokenQuantity: 2, lostQuantity: 0, location: 'Kệ Dụng Cụ 3 - Ngăn D', condition: 'Tốt' },
    { id: 'eq6', name: 'Giá gỗ để ống nghiệm (12 lỗ)', code: 'GGO-12', quantity: 22, totalQuantity: 25, brokenQuantity: 2, lostQuantity: 1, location: 'Kệ Dụng Cụ 4 - Ngăn A', condition: 'Tốt' },
    { id: 'eq7', name: 'Cân điện tử phân tích 4 số lẻ', code: 'CE-001', quantity: 4, totalQuantity: 4, brokenQuantity: 0, lostQuantity: 0, location: 'Bàn trung tâm - Tủ kính khóa', condition: 'Rất tốt' },
    { id: 'eq8', name: 'Nhiệt kế thủy ngân (-10 đến 110°C)', code: 'NK-110', quantity: 20, totalQuantity: 30, brokenQuantity: 8, lostQuantity: 2, location: 'Kệ Dụng Cụ 5 - Ngăn B', condition: 'Cần cẩn thận' }
  ],
  requests: [
    {
      id: 'req-101',
      teacherId: 'u2',
      teacherName: 'Thầy Nguyễn Văn Trước',
      className: '10A1',
      period: 'Tiết 3-4 (Thứ Hai, 20/10/2026)',
      borrowDate: '2026-10-20',
      bookSeries: 'Kết nối tri thức',
      grade: '10',
      lessonName: 'Bài 14: Tính biến thiên enthalpy phản ứng hóa học',
      items: [
        { type: 'chemical', id: 'c5', name: 'Đồng(II) Sunfat (CuSO4.5H2O)', requestedQty: '100g' },
        { type: 'equipment', id: 'eq3', name: 'Cốc thủy tinh chịu nhiệt 250ml', requestedQty: '8 cái' },
        { type: 'equipment', id: 'eq2', name: 'Đèn cồn thủy tinh 100ml', requestedQty: '4 cái' }
      ],
      status: 'ChoDuyet', // ChoDuyet, DaDuyet, DaGiao, ChoXacNhanTra, HoanThanh, TuChoi
      note: 'Dạy thí nghiệm nhiệt phản ứng theo SGK KNTT 10.',
      createdAt: '2026-10-17T08:00:00Z',
      rejectReason: '',
      safetyConfirmed: false,
      returnReport: null
    },
    {
      id: 'req-102',
      teacherId: 'u3',
      teacherName: 'Cô Lê Thị Hường',
      className: '11A2',
      period: 'Tiết 1-2 (Thứ Ba, 21/10/2026)',
      borrowDate: '2026-10-21',
      bookSeries: 'Kết nối tri thức',
      grade: '11',
      lessonName: 'Bài 7: Ammonia và một số hợp chất ammonium',
      items: [
        { type: 'chemical', id: 'c7', name: 'Amoniac dung dịch (NH3 25%)', requestedQty: '50ml' },
        { type: 'chemical', id: 'c2', name: 'Axit Clohydric (HCl 37%)', requestedQty: '50ml' },
        { type: 'equipment', id: 'eq1', name: 'Ống nghiệm thủy tinh 16x160mm', requestedQty: '15 ống' }
      ],
      status: 'DaDuyet',
      note: 'Thí nghiệm khói trắng ammonium clorua.',
      createdAt: '2026-10-16T14:30:00Z',
      rejectReason: '',
      safetyConfirmed: true,
      returnReport: null
    }
  ],
  schedule: [
    { id: 'sch-1', date: '2026-10-20', period: 'Tiết 3-4', teacherName: 'Thầy Nguyễn Văn Trước', className: '10A1', lessonName: 'Bài 14: Tính biến thiên enthalpy', status: 'Đã đăng kí' },
    { id: 'sch-2', date: '2026-10-21', period: 'Tiết 1-2', teacherName: 'Cô Lê Thị Hường', className: '11A2', lessonName: 'Bài 7: Ammonia và muối ammonium', status: 'Đã duyệt' }
  ],
  safetyRules: [
    { id: 's1', title: '1. Trang phục và bảo hộ', content: 'Luôn mặc áo blouse trắng sạch sẽ, đeo kính bảo hộ, găng tay khi làm việc với hóa chất mạnh hoặc axit/base đặc.' },
    { id: 's2', title: '2. Cấm ăn uống và đùa nghịch', content: 'Tuyệt đối không ăn uống, hút thuốc hoặc đùa giỡn trong phòng thực hành hóa học.' },
    { id: 's3', title: '3. Kiểm tra nhãn hóa chất', content: 'Đọc kĩ nhãn hóa chất ít nhất 2 lần trước khi lấy. Không dùng hóa chất không rõ nhãn mác.' },
    { id: 's4', title: '4. Xử lý axit đặc và chất độc', content: 'Khi pha loãng axit sunfuric đặc, luôn đổ từ từ axit vào nước, tuyệt đối không làm ngược lại. Các thí nghiệm sinh khí độc phải thực hiện trong tủ hút.' },
    { id: 's5', title: '5. Xử lý sự cố và chất thải', content: 'Khi bị hóa chất dây vào da hoặc mắt, rửa ngay bằng nước sạch nhiều lần và báo cáo giáo viên. Chất thải hóa học phải đổ vào bình thu gom đúng quy định.' }
  ],
  wasteLog: [
    { id: 'w1', date: '2026-10-15', chemicalName: 'Dung dịch chứa ion kim loại nặng (Cu, Ba)', quantity: '500ml', treatedBy: 'Cô Nga', note: 'Đã trung hòa và lưu kho chất thải nguy hại' }
  ],
  procurement: [
    { id: 'p1', itemName: 'Đèn cồn thủy tinh 100ml', quantity: 10, estimatedCost: '700,000 VNĐ', reason: 'Bổ sung cho các nhóm học sinh thực hành', status: 'Đã duyệt đề nghị', requestedBy: 'Cô Nga' },
    { id: 'p2', itemName: 'Giấy quỳ tím chuẩn', quantity: 20, estimatedCost: '400,000 VNĐ', reason: 'Quỳ tím cũ đã ngả màu, không chính xác', status: 'Chờ Ban giám hiệu duyệt', requestedBy: 'Cô Nga' }
  ],
  logs: [
    { id: 'l1', timestamp: '2026-10-17T08:00:00Z', user: 'Cô Trần Thị Thanh Nga', action: 'Khởi động hệ thống phòng thực hành hóa học', details: 'Nạp dữ liệu mẫu thành công.' }
  ],
  knttLessons: {
    '10': [
      'Bài 1: Nhập môn hóa học',
      'Bài 2: Cấu tạo nguyên tử',
      'Bài 3: Nguyên tố hóa học',
      'Bài 4: Cấu hình electron',
      'Bài 5: Bảng tuần hoàn các nguyên tố hóa học',
      'Bài 6: Xu hướng biến đổi tính chất các nguyên tố',
      'Bài 7: Liên kết ion',
      'Bài 8: Liên kết cộng hóa trị',
      'Bài 9: Liên kết hydrogen và tương tác van der Waals',
      'Bài 10: Phản ứng oxi hóa - khử',
      'Bài 11: Enthalpy phản ứng và biến thiên enthalpy',
      'Bài 12: Ý nghĩa và cách tính biến thiên enthalpy',
      'Bài 13: Tốc độ phản ứng hóa học',
      'Bài 14: Các yếu tố ảnh hưởng đến tốc độ phản ứng'
    ],
    '11': [
      'Bài 1: Sự điện lí',
      'Bài 2: Brønsted - Lowry về axit và base',
      'Bài 3: Don nitrogen và đơn chất nitrogen',
      'Bài 4: Ammonia và một số hợp chất ammonium',
      'Bài 5: Nitric acid và muối nitrate',
      'Bài 6: Sulfur và sulfur dioxide',
      'Bài 7: Sulfuric acid và muối sulfate',
      'Bài 8: Hóa học về hydrocarbon (Alkane, Alkene, Alkyne)',
      'Bài 9: Dẫn xuất halogen - Alcohol - Phenol',
      'Bài 10: Hợp chất carbonyl (Aldehyde - Ketone) và Carboxylic acid'
    ],
    '12': [
      'Bài 1: Ester - Lipid',
      'Bài 2: Carbohydrate (Glucose, Fructose, Saccharose, Tinh bột, Cellulose)',
      'Bài 3: Protein và peptide',
      'Bài 4: Polymer và vật liệu polymer',
      'Bài 5: Đại cương về kim loại',
      'Bài 6: Hợp kim và sự ăn mòn kim loại',
      'Bài 7: Kim loại nhóm IA, IIA',
      'Bài 8: Sắt và hợp chất của sắt',
      'Bài 9: Crom, niken, kẽm và đồng',
      'Bài 10: Phức chất'
    ]
  }
};

function loadDb() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), 'utf-8');
  }
  try {
    const data = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    return initialData;
  }
}

function saveDb(data: any) {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '10mb' }));

  // API Routes
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // Login
  app.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body;
    const db = loadDb();
    const user = db.users.find((u: any) => u.username === username && u.password === password);
    if (!user) {
      return res.status(401).json({ error: 'Tên đăng nhập hoặc mật khẩu không chính xác.' });
    }
    res.json({ success: true, user });
  });

  // Get all data
  app.get('/api/data', (req, res) => {
    const db = loadDb();
    res.json(db);
  });

  // Chemicals
  app.post('/api/chemicals', (req, res) => {
    const db = loadDb();
    const newChem = {
      id: 'c_' + Date.now(),
      ...req.body,
      quantity: Number(req.body.quantity || 0),
      minQuantity: Number(req.body.minQuantity || 5),
    };
    db.chemicals.push(newChem);
    db.logs.push({
      id: 'l_' + Date.now(),
      timestamp: new Date().toISOString(),
      user: req.body.userName || 'Quản trị viên',
      action: `Thêm hóa chất mới: ${newChem.name}`,
      details: `Số lượng: ${newChem.quantity} ${newChem.unit}, vị trí: ${newChem.location}`
    });
    saveDb(db);
    res.json({ success: true, chemical: newChem });
  });

  app.put('/api/chemicals/:id', (req, res) => {
    const { id } = req.params;
    const db = loadDb();
    const index = db.chemicals.findIndex((c: any) => c.id === id);
    if (index === -1) return res.status(404).json({ error: 'Không tìm thấy hóa chất' });
    
    db.chemicals[index] = { ...db.chemicals[index], ...req.body };
    db.logs.push({
      id: 'l_' + Date.now(),
      timestamp: new Date().toISOString(),
      user: req.body.userName || 'Quản trị viên',
      action: `Cập nhật hóa chất: ${db.chemicals[index].name}`,
      details: `Số lượng tồn: ${db.chemicals[index].quantity}`
    });
    saveDb(db);
    res.json({ success: true, chemical: db.chemicals[index] });
  });

  // Equipment
  app.post('/api/equipment', (req, res) => {
    const db = loadDb();
    const newEq = {
      id: 'eq_' + Date.now(),
      ...req.body,
      quantity: Number(req.body.quantity || 0),
      totalQuantity: Number(req.body.totalQuantity || req.body.quantity || 0)
    };
    db.equipment.push(newEq);
    saveDb(db);
    res.json({ success: true, equipment: newEq });
  });

  app.put('/api/equipment/:id', (req, res) => {
    const { id } = req.params;
    const db = loadDb();
    const index = db.equipment.findIndex((e: any) => e.id === id);
    if (index === -1) return res.status(404).json({ error: 'Không tìm thấy dụng cụ' });
    db.equipment[index] = { ...db.equipment[index], ...req.body };
    saveDb(db);
    res.json({ success: true, equipment: db.equipment[index] });
  });

  // Borrow Requests
  app.post('/api/requests', (req, res) => {
    const db = loadDb();
    const newReq = {
      id: 'req_' + Date.now(),
      ...req.body,
      status: 'ChoDuyet',
      createdAt: new Date().toISOString(),
      rejectReason: '',
      safetyConfirmed: false,
      returnReport: null
    };
    db.requests.unshift(newReq);
    
    // Also add to schedule if approved or pending preview
    db.schedule.push({
      id: 'sch_' + Date.now(),
      date: newReq.borrowDate,
      period: newReq.period,
      teacherName: newReq.teacherName,
      className: newReq.className,
      lessonName: newReq.lessonName,
      status: 'Chờ duyệt'
    });

    db.logs.push({
      id: 'l_' + Date.now(),
      timestamp: new Date().toISOString(),
      user: newReq.teacherName,
      action: `Tạo phiếu mượn thiết bị lớp ${newReq.className}`,
      details: `Bài: ${newReq.lessonName}`
    });

    saveDb(db);
    res.json({ success: true, request: newReq });
  });

  app.put('/api/requests/:id/status', (req, res) => {
    const { id } = req.params;
    const { status, rejectReason, safetyConfirmed, adminName } = req.body;
    const db = loadDb();
    const reqObj = db.requests.find((r: any) => r.id === id);
    if (!reqObj) return res.status(404).json({ error: 'Không tìm thấy phiếu mượn' });

    reqObj.status = status;
    if (rejectReason !== undefined) reqObj.rejectReason = rejectReason;
    if (safetyConfirmed !== undefined) reqObj.safetyConfirmed = safetyConfirmed;

    // Update schedule status
    const sch = db.schedule.find((s: any) => s.date === reqObj.borrowDate && s.teacherName === reqObj.teacherName && s.className === reqObj.className);
    if (sch) {
      if (status === 'DaDuyet') sch.status = 'Đã duyệt';
      else if (status === 'DaGiao') sch.status = 'Đang thực hành';
      else if (status === 'TuChoi') sch.status = 'Đã từ chối';
      else if (status === 'HoanThanh') sch.status = 'Hoàn thành';
    }

    db.logs.push({
      id: 'l_' + Date.now(),
      timestamp: new Date().toISOString(),
      user: adminName || 'Cô Nga (Quản lý)',
      action: `Cập nhật trạng thái phiếu ${id}: ${status}`,
      details: rejectReason ? `Lý do: ${rejectReason}` : ''
    });

    saveDb(db);
    res.json({ success: true, request: reqObj });
  });

  // Return report by teacher
  app.post('/api/requests/:id/return', (req, res) => {
    const { id } = req.params;
    const { returnReport, teacherName } = req.body; // { conditionNote, photoUrl, chemicalUsed, brokenItems }
    const db = loadDb();
    const reqObj = db.requests.find((r: any) => r.id === id);
    if (!reqObj) return res.status(404).json({ error: 'Không tìm thấy phiếu mượn' });

    reqObj.status = 'ChoXacNhanTra';
    reqObj.returnReport = returnReport;

    db.logs.push({
      id: 'l_' + Date.now(),
      timestamp: new Date().toISOString(),
      user: teacherName,
      action: `Báo cáo trả thiết bị phiếu ${id}`,
      details: `Tình trạng: ${returnReport.conditionNote}`
    });

    saveDb(db);
    res.json({ success: true, request: reqObj });
  });

  // Confirm return by Admin (updates inventory properly once!)
  app.post('/api/requests/:id/confirm-return', (req, res) => {
    const { id } = req.params;
    const { adminName } = req.body;
    const db = loadDb();
    const reqObj = db.requests.find((r: any) => r.id === id);
    if (!reqObj) return res.status(404).json({ error: 'Không tìm thấy phiếu' });
    if (reqObj.status === 'HoanThanh') {
      return res.status(400).json({ error: 'Phiếu này đã được xác nhận trả và cập nhật kho trước đó.' });
    }

    reqObj.status = 'HoanThanh';

    // Deduct chemical quantities based on return report or requested qty
    if (reqObj.returnReport && reqObj.returnReport.chemicalUsed) {
      // Process chemical usage deduction safely
      for (const item of reqObj.items) {
        if (item.type === 'chemical') {
          const chem = db.chemicals.find((c: any) => c.id === item.id);
          if (chem) {
            // parse numeric amount or reduce by 1 unit if applicable
            chem.quantity = Math.max(0, chem.quantity - 1);
          }
        }
      }
    }

    const sch = db.schedule.find((s: any) => s.date === reqObj.borrowDate && s.teacherName === reqObj.teacherName);
    if (sch) sch.status = 'Hoàn thành';

    db.logs.push({
      id: 'l_' + Date.now(),
      timestamp: new Date().toISOString(),
      user: adminName || 'Cô Nga',
      action: `Xác nhận nhận trả và hoàn thành phiếu ${id}`,
      details: 'Đã cập nhật tồn kho chính thức.'
    });

    saveDb(db);
    res.json({ success: true, request: reqObj });
  });

  // Waste log
  app.post('/api/waste', (req, res) => {
    const db = loadDb();
    const entry = { id: 'w_' + Date.now(), ...req.body };
    db.wasteLog.unshift(entry);
    saveDb(db);
    res.json({ success: true, entry });
  });

  // Procurement
  app.post('/api/procurement', (req, res) => {
    const db = loadDb();
    const item = { id: 'p_' + Date.now(), ...req.body, status: 'Chờ Ban giám hiệu duyệt' };
    db.procurement.unshift(item);
    saveDb(db);
    res.json({ success: true, item });
  });

  // User password reset
  app.put('/api/users/:id/password', (req, res) => {
    const { id } = req.params;
    const { newPassword } = req.body;
    const db = loadDb();
    const user = db.users.find((u: any) => u.id === id);
    if (!user) return res.status(404).json({ error: 'Không tìm thấy người dùng' });
    user.password = newPassword;
    saveDb(db);
    res.json({ success: true });
  });

  // Setup Vite middleware in development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: false },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const PORT = 3000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Phòng Thực Hành Hóa running on http://localhost:${PORT}`);
  });
}

startServer();
