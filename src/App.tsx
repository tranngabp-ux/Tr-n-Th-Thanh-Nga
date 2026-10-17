import React, { useState, useEffect } from 'react';
import {
  Beaker, FlaskConical, Calendar, ClipboardList, CheckCircle, AlertTriangle,
  Users, ShieldCheck, QrCode, FileText, Settings, LogOut, Plus, Search,
  Filter, Trash2, Edit, Camera, Check, X, Lock, Printer, Download,
  RefreshCw, AlertCircle, Package, Box, Clock, UserCheck, ShieldAlert, BookOpen
} from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const [activeTab, setActiveTab] = useState('dashboard');
  const [dbData, setDbData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Form states for new borrow request
  const [borrowForm, setBorrowForm] = useState({
    grade: '10',
    className: '10A1',
    period: 'Tiết 1-2',
    borrowDate: new Date().toISOString().split('T')[0],
    lessonName: '',
    note: '',
    selectedItems: [] as any[]
  });

  // Modal states
  const [modalType, setModalType] = useState<string | null>(null); // 'newChemical', 'returnReport', 'procurement', 'qrModal', 'userEdit'
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [returnReportData, setReturnReportData] = useState({
    conditionNote: '',
    photoUrl: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&w=600&q=80',
    chemicalUsed: true,
    brokenItems: ''
  });
  const [newChemicalForm, setNewChemicalForm] = useState({
    name: '', formula: '', unit: 'lọ (500g)', quantity: 10, minQuantity: 5, location: 'Tủ A', entryDate: new Date().toISOString().split('T')[0], expiryDate: '2028-01-01', isHazardous: false, hazardNote: ''
  });
  const [procurementForm, setProcurementForm] = useState({ itemName: '', quantity: 5, estimatedCost: '500,000 VNĐ', reason: '' });
  const [qrItem, setQrItem] = useState<any>(null);
  const [rejectReasonText, setRejectReasonText] = useState('');
  const [selectedUserForEdit, setSelectedUserForEdit] = useState<any>(null);
  const [newPassText, setNewPassText] = useState('');

  // Fetch initial data
  const fetchData = async () => {
    try {
      const res = await fetch('/api/data');
      const data = await res.json();
      setDbData(data);
      setLoading(false);
    } catch (err) {
      console.error('Failed to load data', err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: loginUsername, password: loginPassword })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setCurrentUser(data.user);
      } else {
        setLoginError(data.error || 'Đăng nhập thất bại');
      }
    } catch (err) {
      setLoginError('Lỗi kết nối máy chủ');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setLoginUsername('');
    setLoginPassword('');
  };

  // Submit borrow request
  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!borrowForm.lessonName) {
      alert('Vui lòng chọn hoặc nhập tên bài học.');
      return;
    }
    if (borrowForm.selectedItems.length === 0) {
      alert('Vui lòng chọn ít nhất một hóa chất hoặc dụng cụ cần mượn.');
      return;
    }

    try {
      const res = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teacherId: currentUser.id,
          teacherName: currentUser.name,
          className: borrowForm.className,
          period: borrowForm.period,
          borrowDate: borrowForm.borrowDate,
          bookSeries: 'Kết nối tri thức',
          grade: borrowForm.grade,
          lessonName: borrowForm.lessonName,
          items: borrowForm.selectedItems,
          note: borrowForm.note
        })
      });
      if (res.ok) {
        alert('Đã gửi phiếu đăng ký mượn thành công! Vui lòng chờ Cô Nga duyệt.');
        setBorrowForm({
          grade: '10',
          className: '10A1',
          period: 'Tiết 1-2',
          borrowDate: new Date().toISOString().split('T')[0],
          lessonName: '',
          note: '',
          selectedItems: []
        });
        fetchData();
        setActiveTab('requests');
      }
    } catch (err) {
      alert('Lỗi khi tạo phiếu mượn.');
    }
  };

  // Admin update request status
  const updateRequestStatus = async (id: string, status: string, safetyConfirmed = false) => {
    let rejectReason = '';
    if (status === 'TuChoi') {
      rejectReason = prompt('Nhập lý do từ chối phiếu mượn:') || 'Không rõ lý do';
    }

    try {
      const res = await fetch(`/api/requests/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, rejectReason, safetyConfirmed, adminName: currentUser.name })
      });
      if (res.ok) {
        fetchData();
      }
    } catch (err) {
      alert('Lỗi cập nhật trạng thái');
    }
  };

  // Return report submission
  const submitReturnReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequest) return;
    try {
      const res = await fetch(`/api/requests/${selectedRequest.id}/return`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teacherName: currentUser.name,
          returnReport: returnReportData
        })
      });
      if (res.ok) {
        alert('Đã gửi báo cáo trả thiết bị thành công! Đang chờ Cô Nga xác nhận nhận lại.');
        setModalType(null);
        setSelectedRequest(null);
        fetchData();
      }
    } catch (err) {
      alert('Lỗi gửi báo cáo trả.');
    }
  };

  // Confirm return by admin
  const confirmReturnByAdmin = async (id: string) => {
    if (!confirm('Xác nhận đã nhận đủ thiết bị và cập nhật trừ tồn kho chính thức?')) return;
    try {
      const res = await fetch(`/api/requests/${id}/confirm-return`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminName: currentUser.name })
      });
      const data = await res.json();
      if (res.ok) {
        alert('Đã xác nhận thành công và cập nhật tồn kho!');
        fetchData();
      } else {
        alert(data.error);
      }
    } catch (err) {
      alert('Lỗi xác nhận trả đồ.');
    }
  };

  // Add chemical
  const handleAddChemical = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/chemicals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newChemicalForm, userName: currentUser.name })
      });
      if (res.ok) {
        alert('Đã thêm hóa chất vào kho thành công!');
        setModalType(null);
        fetchData();
      }
    } catch (err) {
      alert('Lỗi thêm hóa chất');
    }
  };

  // Procurement request
  const handleAddProcurement = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/procurement', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...procurementForm, requestedBy: currentUser.name })
      });
      if (res.ok) {
        alert('Đã gửi đề nghị mua sắm thành công!');
        setModalType(null);
        fetchData();
      }
    } catch (err) {
      alert('Lỗi gửi đề nghị mua sắm');
    }
  };

  // Reset user password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserForEdit || !newPassText) return;
    try {
      const res = await fetch(`/api/users/${selectedUserForEdit.id}/password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword: newPassText })
      });
      if (res.ok) {
        alert(`Đã đổi mật khẩu thành công cho ${selectedUserForEdit.name}!`);
        setModalType(null);
        setSelectedUserForEdit(null);
        setNewPassText('');
        fetchData();
      }
    } catch (err) {
      alert('Lỗi đổi mật khẩu');
    }
  };

  if (loading || !dbData) {
    return (
      <div className="min-h-screen bg-emerald-950 flex flex-col items-center justify-center text-white font-sans">
        <FlaskConical className="w-16 h-16 animate-bounce text-emerald-400 mb-4" />
        <h2 className="text-xl font-bold">Đang tải hệ thống Phòng Thực Hành Hóa...</h2>
        <p className="text-emerald-300 text-sm mt-2">Trường THCS&THPT Võ Thị Sáu - Đồng Nai</p>
      </div>
    );
  }

  // Login screen
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-teal-900 to-slate-900 flex items-center justify-center p-4 font-sans">
        <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl w-full max-w-md p-8 border border-emerald-100">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-600 rounded-2xl text-white mb-4 shadow-lg">
              <FlaskConical className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">PHÒNG THỰC HÀNH HÓA</h1>
            <p className="text-sm font-medium text-emerald-700 mt-1">Trường THCS&THPT Võ Thị Sáu - Tỉnh Đồng Nai</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">Tên đăng nhập</label>
              <input
                type="text"
                value={loginUsername}
                onChange={(e) => setLoginUsername(e.target.value)}
                placeholder="Ví dụ: nga, truoc, huong, hoai_anh"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-600 text-sm transition"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">Mật khẩu</label>
              <input
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="Mật khẩu do Cô Nga cấp (mặc định: 123)"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-600 text-sm transition"
                required
              />
            </div>

            {loginError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-medium flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl shadow-lg shadow-emerald-700/30 transition duration-200 flex items-center justify-center space-x-2"
            >
              <span>Đăng nhập hệ thống</span>
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-500 font-medium">Tài khoản mặc định: <span className="text-emerald-700 font-bold">nga</span> (Cô Nga), <span className="text-emerald-700 font-bold">truoc</span> (Thầy Trước), <span className="text-emerald-700 font-bold">huong</span> (Cô Hường), <span className="text-emerald-700 font-bold">hoai_anh</span> (Cô Hoài Anh). Mật khẩu: <span className="font-bold">123</span></p>
          </div>
        </div>
      </div>
    );
  }

  // Dashboard metrics
  const lowChemicals = dbData.chemicals.filter((c: any) => c.quantity <= c.minQuantity);
  const pendingRequests = dbData.requests.filter((r: any) => r.status === 'ChoDuyet');
  const todaySchedule = dbData.schedule.filter((s: any) => s.date === new Date().toISOString().split('T')[0] || s.status === 'Đã duyệt');

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col">
      {/* Top Header */}
      <header className="bg-emerald-900 text-white shadow-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-emerald-700 rounded-xl flex items-center justify-center shadow">
              <FlaskConical className="w-6 h-6 text-emerald-200" />
            </div>
            <div>
              <h1 className="font-bold text-base sm:text-lg tracking-tight leading-tight">Phòng Thực Hành Hóa</h1>
              <p className="text-xs text-emerald-300 font-medium">THCS&THPT Võ Thị Sáu - Đồng Nai</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-sm font-bold text-white">{currentUser.name}</span>
              <span className="text-xs text-emerald-300 font-medium">{currentUser.title}</span>
            </div>
            <button
              onClick={handleLogout}
              className="p-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-emerald-100 transition flex items-center space-x-1.5 text-xs font-semibold"
              title="Đăng xuất"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden md:inline">Thoát</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full flex flex-col md:flex-row gap-6">
        {/* Sidebar Navigation */}
        <aside className="w-full md:w-64 shrink-0">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-3 space-y-1 sticky top-20">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold transition ${activeTab === 'dashboard' ? 'bg-emerald-700 text-white shadow-md shadow-emerald-700/20' : 'text-slate-600 hover:bg-slate-100'}`}
            >
              <Beaker className="w-5 h-5" />
              <span>Tổng quan (Dashboard)</span>
            </button>

            <button
              onClick={() => setActiveTab('chemicals')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold transition ${activeTab === 'chemicals' ? 'bg-emerald-700 text-white shadow-md shadow-emerald-700/20' : 'text-slate-600 hover:bg-slate-100'}`}
            >
              <Package className="w-5 h-5" />
              <span>Kho Hóa chất</span>
              {lowChemicals.length > 0 && (
                <span className="ml-auto bg-amber-100 text-amber-800 text-xs px-2 py-0.5 rounded-full font-bold">
                  {lowChemicals.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('equipment')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold transition ${activeTab === 'equipment' ? 'bg-emerald-700 text-white shadow-md shadow-emerald-700/20' : 'text-slate-600 hover:bg-slate-100'}`}
            >
              <Box className="w-5 h-5" />
              <span>Dụng cụ & Thiết bị</span>
            </button>

            <button
              onClick={() => setActiveTab('borrow')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold transition ${activeTab === 'borrow' ? 'bg-emerald-700 text-white shadow-md shadow-emerald-700/20' : 'text-slate-600 hover:bg-slate-100'}`}
            >
              <ClipboardList className="w-5 h-5" />
              <span>Đăng ký mượn mới</span>
            </button>

            <button
              onClick={() => setActiveTab('requests')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold transition ${activeTab === 'requests' ? 'bg-emerald-700 text-white shadow-md shadow-emerald-700/20' : 'text-slate-600 hover:bg-slate-100'}`}
            >
              <CheckCircle className="w-5 h-5" />
              <span>Quản lý & Duyệt phiếu</span>
              {pendingRequests.length > 0 && currentUser.role === 'admin' && (
                <span className="ml-auto bg-red-100 text-red-700 text-xs px-2 py-0.5 rounded-full font-bold">
                  {pendingRequests.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('schedule')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold transition ${activeTab === 'schedule' ? 'bg-emerald-700 text-white shadow-md shadow-emerald-700/20' : 'text-slate-600 hover:bg-slate-100'}`}
            >
              <Calendar className="w-5 h-5" />
              <span>Lịch phòng thí nghiệm</span>
            </button>

            <button
              onClick={() => setActiveTab('safety')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold transition ${activeTab === 'safety' ? 'bg-emerald-700 text-white shadow-md shadow-emerald-700/20' : 'text-slate-600 hover:bg-slate-100'}`}
            >
              <ShieldCheck className="w-5 h-5" />
              <span>An toàn & Chất thải</span>
            </button>

            <button
              onClick={() => setActiveTab('reports')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold transition ${activeTab === 'reports' ? 'bg-emerald-700 text-white shadow-md shadow-emerald-700/20' : 'text-slate-600 hover:bg-slate-100'}`}
            >
              <FileText className="w-5 h-5" />
              <span>Báo cáo & Thống kê</span>
            </button>

            {currentUser.role === 'admin' && (
              <button
                onClick={() => setActiveTab('admin')}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold transition ${activeTab === 'admin' ? 'bg-emerald-700 text-white shadow-md shadow-emerald-700/20' : 'text-slate-600 hover:bg-slate-100'}`}
              >
                <Settings className="w-5 h-5" />
                <span>Quản trị hệ thống</span>
              </button>
            )}
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1 w-full">
          {/* TAB 1: DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* Welcome banner */}
              <div className="bg-gradient-to-r from-emerald-800 to-teal-700 rounded-2xl p-6 text-white shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black">Xin chào, {currentUser.name}!</h2>
                  <p className="text-emerald-100 text-sm mt-1">Hệ thống quản lý phòng thí nghiệm Hóa học Trường THCS&THPT Võ Thị Sáu sẵn sàng hoạt động.</p>
                </div>
                <div className="flex items-center space-x-3 shrink-0">
                  <button
                    onClick={() => setActiveTab('borrow')}
                    className="px-4 py-2.5 bg-white text-emerald-900 rounded-xl font-bold text-xs shadow hover:bg-emerald-50 transition flex items-center space-x-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Đăng ký mượn ngay</span>
                  </button>
                </div>
              </div>

              {/* Stats Overview */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Hóa chất trong kho</span>
                    <Package className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div className="mt-3 flex items-baseline justify-between">
                    <span className="text-3xl font-black text-slate-800">{dbData.chemicals.length}</span>
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-lg">Đã kiểm kê</span>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Dụng cụ thiết bị</span>
                    <Box className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="mt-3 flex items-baseline justify-between">
                    <span className="text-3xl font-black text-slate-800">{dbData.equipment.length}</span>
                    <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-1 rounded-lg">Có tem QR</span>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Cảnh báo tồn ít</span>
                    <AlertTriangle className="w-5 h-5 text-amber-600" />
                  </div>
                  <div className="mt-3 flex items-baseline justify-between">
                    <span className="text-3xl font-black text-amber-600">{lowChemicals.length}</span>
                    <span className="text-xs font-bold text-amber-800 bg-amber-50 px-2 py-1 rounded-lg">Cần mua bổ sung</span>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Phiếu chờ duyệt</span>
                    <Clock className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div className="mt-3 flex items-baseline justify-between">
                    <span className="text-3xl font-black text-indigo-600">{pendingRequests.length}</span>
                    <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-1 rounded-lg">Cần xử lý</span>
                  </div>
                </div>
              </div>

              {/* Low stock & Hazards alerts */}
              {lowChemicals.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
                  <div className="flex items-center space-x-3 mb-3">
                    <ShieldAlert className="w-6 h-6 text-amber-600" />
                    <h3 className="font-bold text-amber-900 text-base">Cảnh báo hóa chất sắp hết (dưới 5 lọ)</h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {lowChemicals.map((chem: any) => (
                      <div key={chem.id} className="bg-white p-3 rounded-xl border border-amber-200 shadow-sm flex items-center justify-between">
                        <div>
                          <p className="font-bold text-sm text-slate-800">{chem.name}</p>
                          <p className="text-xs text-slate-500">Vị trí: {chem.location}</p>
                        </div>
                        <span className="px-2.5 py-1 bg-amber-100 text-amber-800 text-xs font-black rounded-lg">
                          {chem.quantity} {chem.unit}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recent Requests & Today schedule */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-slate-800 text-base flex items-center space-x-2">
                      <ClipboardList className="w-5 h-5 text-emerald-600" />
                      <span>Phiếu mượn gần đây</span>
                    </h3>
                    <button onClick={() => setActiveTab('requests')} className="text-xs font-bold text-emerald-700 hover:underline">Xem tất cả</button>
                  </div>
                  <div className="space-y-3">
                    {dbData.requests.slice(0, 3).map((req: any) => (
                      <div key={req.id} className="p-3.5 rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-between">
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-sm text-slate-800">{req.teacherName}</span>
                            <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">Lớp {req.className}</span>
                          </div>
                          <p className="text-xs text-slate-600 mt-1">{req.lessonName}</p>
                        </div>
                        <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${req.status === 'ChoDuyet' ? 'bg-amber-100 text-amber-800' : req.status === 'DaDuyet' ? 'bg-blue-100 text-blue-800' : 'bg-emerald-100 text-emerald-800'}`}>
                          {req.status === 'ChoDuyet' ? 'Chờ duyệt' : req.status === 'DaDuyet' ? 'Đã duyệt' : req.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-slate-800 text-base flex items-center space-x-2">
                      <Calendar className="w-5 h-5 text-emerald-600" />
                      <span>Lịch sử dụng phòng Hóa</span>
                    </h3>
                    <button onClick={() => setActiveTab('schedule')} className="text-xs font-bold text-emerald-700 hover:underline">Xem lịch</button>
                  </div>
                  <div className="space-y-3">
                    {dbData.schedule.slice(0, 3).map((sch: any) => (
                      <div key={sch.id} className="p-3.5 rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-between">
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-sm text-slate-800">{sch.date} ({sch.period})</span>
                            <span className="text-xs bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded font-bold">{sch.className}</span>
                          </div>
                          <p className="text-xs text-slate-600 mt-1">{sch.teacherName} - {sch.lessonName}</p>
                        </div>
                        <span className="text-xs text-emerald-700 font-bold bg-emerald-50 px-2 py-1 rounded-lg">
                          {sch.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CHEMICALS */}
          {activeTab === 'chemicals' && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-800">Quản lý kho hóa chất</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Danh mục hóa chất theo chương trình Kết nối tri thức & TT 39/2021/TT-BGDĐT</p>
                </div>
                {currentUser.role === 'admin' && (
                  <button
                    onClick={() => setModalType('newChemical')}
                    className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow transition flex items-center space-x-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Thêm hóa chất mới</span>
                  </button>
                )}
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider bg-slate-50">
                      <th className="p-3.5">Tên hóa chất & CTTQ</th>
                      <th className="p-3.5">Số lượng</th>
                      <th className="p-3.5">Vị trí (Tủ / Ngăn)</th>
                      <th className="p-3.5">Hạn dùng</th>
                      <th className="p-3.5">Trạng thái & An toàn</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {dbData.chemicals.map((chem: any) => (
                      <tr key={chem.id} className="hover:bg-slate-50/80 transition">
                        <td className="p-3.5">
                          <div className="font-bold text-slate-800">{chem.name}</div>
                          <div className="text-xs font-mono text-emerald-700">CT: {chem.formula}</div>
                        </td>
                        <td className="p-3.5">
                          <span className={`font-black px-2.5 py-1 rounded-lg text-xs ${chem.quantity <= chem.minQuantity ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}`}>
                            {chem.quantity} {chem.unit}
                          </span>
                        </td>
                        <td className="p-3.5 text-xs text-slate-600 font-medium">{chem.location}</td>
                        <td className="p-3.5 text-xs text-slate-600">{chem.expiryDate}</td>
                        <td className="p-3.5">
                          <div className="flex flex-col space-y-1">
                            <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold w-fit ${chem.isHazardous ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-700'}`}>
                              {chem.status}
                            </span>
                            {chem.hazardNote && <span className="text-[11px] text-red-600 font-medium">{chem.hazardNote}</span>}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: EQUIPMENT */}
          {activeTab === 'equipment' && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-800">Quản lý dụng cụ & thiết bị</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Theo dõi số lượng, tình trạng và tem QR kiểm tra nhanh</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {dbData.equipment.map((eq: any) => (
                  <div key={eq.id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-mono font-bold bg-slate-100 text-slate-700 px-2 py-1 rounded">{eq.code}</span>
                        <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">{eq.condition}</span>
                      </div>
                      <h3 className="font-bold text-slate-800 text-sm mb-1">{eq.name}</h3>
                      <p className="text-xs text-slate-500">Vị trí: {eq.location}</p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                      <div>
                        <span className="text-slate-500">Tồn: </span>
                        <span className="font-black text-slate-800">{eq.quantity} / {eq.totalQuantity}</span>
                      </div>
                      <button
                        onClick={() => { setQrItem(eq); setModalType('qrModal'); }}
                        className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold rounded-lg transition flex items-center space-x-1"
                      >
                        <QrCode className="w-3.5 h-3.5" />
                        <span>Mã QR</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: BORROW REQUEST */}
          {activeTab === 'borrow' && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6 max-w-3xl mx-auto">
              <div>
                <h2 className="text-xl font-bold text-slate-800">Đăng ký mượn thiết bị & hóa chất thí nghiệm</h2>
                <p className="text-xs text-slate-500 mt-0.5">Theo chương trình sách Kết nối tri thức (Lớp 10, 11, 12). Cần đăng ký trước ít nhất 2 ngày.</p>
              </div>

              <form onSubmit={handleCreateRequest} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">Khối lớp</label>
                    <select
                      value={borrowForm.grade}
                      onChange={(e) => setBorrowForm({ ...borrowForm, grade: e.target.value, lessonName: '' })}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-600"
                    >
                      <option value="10">Hóa học 10</option>
                      <option value="11">Hóa học 11</option>
                      <option value="12">Hóa học 12</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">Lớp thực hành</label>
                    <input
                      type="text"
                      value={borrowForm.className}
                      onChange={(e) => setBorrowForm({ ...borrowForm, className: e.target.value })}
                      placeholder="Ví dụ: 10A1"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-600"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">Ngày thực hành</label>
                    <input
                      type="date"
                      value={borrowForm.borrowDate}
                      onChange={(e) => setBorrowForm({ ...borrowForm, borrowDate: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-600"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">Tiết học theo TKB</label>
                    <input
                      type="text"
                      value={borrowForm.period}
                      onChange={(e) => setBorrowForm({ ...borrowForm, period: e.target.value })}
                      placeholder="Ví dụ: Tiết 3-4 (Thứ Hai)"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-600"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">Chọn bài học (Kết nối tri thức)</label>
                  <select
                    value={borrowForm.lessonName}
                    onChange={(e) => setBorrowForm({ ...borrowForm, lessonName: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-600"
                    required
                  >
                    <option value="">-- Chọn bài học thí nghiệm --</option>
                    {dbData.knttLessons[borrowForm.grade]?.map((lesson: string, idx: number) => (
                      <option key={idx} value={lesson}>{lesson}</option>
                    ))}
                  </select>
                </div>

                {/* Select items */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">Chọn dụng cụ & hóa chất mượn nhanh</label>
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3 max-h-60 overflow-y-auto">
                    <p className="text-xs font-bold text-emerald-700">Hóa chất gợi ý:</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {dbData.chemicals.map((chem: any) => (
                        <label key={chem.id} className="flex items-center space-x-2 bg-white p-2.5 rounded-lg border border-slate-200 text-xs cursor-pointer hover:border-emerald-600">
                          <input
                            type="checkbox"
                            checked={borrowForm.selectedItems.some((i: any) => i.id === chem.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setBorrowForm({
                                  ...borrowForm,
                                  selectedItems: [...borrowForm.selectedItems, { type: 'chemical', id: chem.id, name: chem.name, requestedQty: '1 lọ' }]
                                });
                              } else {
                                setBorrowForm({
                                  ...borrowForm,
                                  selectedItems: borrowForm.selectedItems.filter((i: any) => i.id !== chem.id)
                                });
                              }
                            }}
                            className="rounded text-emerald-600 focus:ring-emerald-500"
                          />
                          <span className="font-bold text-slate-800">{chem.name}</span>
                        </label>
                      ))}
                    </div>

                    <p className="text-xs font-bold text-blue-700 pt-2">Dụng cụ thiết bị:</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {dbData.equipment.map((eq: any) => (
                        <label key={eq.id} className="flex items-center space-x-2 bg-white p-2.5 rounded-lg border border-slate-200 text-xs cursor-pointer hover:border-blue-600">
                          <input
                            type="checkbox"
                            checked={borrowForm.selectedItems.some((i: any) => i.id === eq.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setBorrowForm({
                                  ...borrowForm,
                                  selectedItems: [...borrowForm.selectedItems, { type: 'equipment', id: eq.id, name: eq.name, requestedQty: '5 cái' }]
                                });
                              } else {
                                setBorrowForm({
                                  ...borrowForm,
                                  selectedItems: borrowForm.selectedItems.filter((i: any) => i.id !== eq.id)
                                });
                              }
                            }}
                            className="rounded text-blue-600 focus:ring-blue-500"
                          />
                          <span className="font-bold text-slate-800">{eq.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">Ghi chú cho Cô Nga</label>
                  <textarea
                    value={borrowForm.note}
                    onChange={(e) => setBorrowForm({ ...borrowForm, note: e.target.value })}
                    placeholder="Lưu ý đặc biệt (nếu có)..."
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-600 h-24"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl shadow-lg shadow-emerald-700/30 transition flex items-center justify-center space-x-2"
                >
                  <ClipboardList className="w-5 h-5" />
                  <span>Gửi phiếu đăng ký mượn</span>
                </button>
              </form>
            </div>
          )}

          {/* TAB 5: REQUESTS & APPROVALS */}
          {activeTab === 'requests' && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
              <div>
                <h2 className="text-xl font-bold text-slate-800">Quản lý phiếu mượn & Phê duyệt</h2>
                <p className="text-xs text-slate-500 mt-0.5">Quy trình: Chờ duyệt → Đã duyệt → Đã giao → Chờ xác nhận trả → Hoàn thành</p>
              </div>

              <div className="space-y-4">
                {dbData.requests.map((req: any) => (
                  <div key={req.id} className="p-5 rounded-2xl border border-slate-200 bg-white shadow-sm space-y-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                      <div>
                        <div className="flex items-center space-x-3">
                          <span className="font-black text-slate-800 text-base">{req.teacherName}</span>
                          <span className="text-xs bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-lg font-bold">Lớp {req.className}</span>
                          <span className="text-xs text-slate-500 font-medium">{req.borrowDate} ({req.period})</span>
                        </div>
                        <p className="text-xs font-bold text-slate-700 mt-1">{req.lessonName}</p>
                      </div>

                      <span className={`text-xs px-3 py-1.5 rounded-full font-bold ${
                        req.status === 'ChoDuyet' ? 'bg-amber-100 text-amber-800' :
                        req.status === 'DaDuyet' ? 'bg-blue-100 text-blue-800' :
                        req.status === 'DaGiao' ? 'bg-indigo-100 text-indigo-800' :
                        req.status === 'ChoXacNhanTra' ? 'bg-purple-100 text-purple-800' :
                        req.status === 'HoanThanh' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {req.status === 'ChoDuyet' ? 'Chờ duyệt' :
                         req.status === 'DaDuyet' ? 'Đã duyệt' :
                         req.status === 'DaGiao' ? 'Đã giao đồ' :
                         req.status === 'ChoXacNhanTra' ? 'Chờ xác nhận trả' :
                         req.status === 'HoanThanh' ? 'Hoàn thành' : 'Đã từ chối'}
                      </span>
                    </div>

                    <div className="bg-slate-50 p-3 rounded-xl space-y-1">
                      <p className="text-xs font-bold text-slate-700">Thiết bị & Hóa chất mượn:</p>
                      <ul className="list-disc list-inside text-xs text-slate-600 space-y-0.5">
                        {req.items.map((item: any, idx: number) => (
                          <li key={idx}><span className="font-bold">{item.name}</span> ({item.requestedQty})</li>
                        ))}
                      </ul>
                      {req.note && <p className="text-xs text-slate-500 italic mt-1">Ghi chú: {req.note}</p>}
                    </div>

                    {/* Return report section if submitted */}
                    {req.returnReport && (
                      <div className="bg-purple-50 border border-purple-200 p-3.5 rounded-xl space-y-2">
                        <p className="text-xs font-bold text-purple-900">Báo cáo trả đồ từ giáo viên:</p>
                        <p className="text-xs text-slate-700">Tình trạng: {req.returnReport.conditionNote}</p>
                        {req.returnReport.brokenItems && <p className="text-xs text-red-600 font-bold">Hỏng vỡ: {req.returnReport.brokenItems}</p>}
                        <img src={req.returnReport.photoUrl} alt="Return photo" className="w-24 h-24 object-cover rounded-lg border border-purple-200" />
                      </div>
                    )}

                    {/* Action buttons based on role & status */}
                    <div className="flex flex-wrap items-center gap-2 pt-2">
                      {currentUser.role === 'admin' && req.status === 'ChoDuyet' && (
                        <>
                          <button
                            onClick={() => updateRequestStatus(req.id, 'DaDuyet', true)}
                            className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow transition flex items-center space-x-1.5"
                          >
                            <Check className="w-4 h-4" />
                            <span>Phê duyệt mượn</span>
                          </button>
                          <button
                            onClick={() => updateRequestStatus(req.id, 'TuChoi')}
                            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow transition"
                          >
                            Từ chối
                          </button>
                        </>
                      )}

                      {currentUser.role === 'admin' && req.status === 'DaDuyet' && (
                        <button
                          onClick={() => updateRequestStatus(req.id, 'DaGiao')}
                          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow transition"
                        >
                          Xác nhận đã giao đồ cho GV
                        </button>
                      )}

                      {currentUser.id === req.teacherId && req.status === 'DaGiao' && (
                        <button
                          onClick={() => { setSelectedRequest(req); setModalType('returnReport'); }}
                          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow transition flex items-center space-x-1.5"
                        >
                          <Camera className="w-4 h-4" />
                          <span>Báo trả kèm ảnh & lượng dùng</span>
                        </button>
                      )}

                      {currentUser.role === 'admin' && req.status === 'ChoXacNhanTra' && (
                        <button
                          onClick={() => confirmReturnByAdmin(req.id)}
                          className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow transition"
                        >
                          Xác nhận nhận trả & Trừ tồn kho chính thức
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: SCHEDULE */}
          {activeTab === 'schedule' && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
              <div>
                <h2 className="text-xl font-bold text-slate-800">Lịch sử dụng phòng thực hành hóa học</h2>
                <p className="text-xs text-slate-500 mt-0.5">Lịch thực hành theo ngày, tuần và tiết học</p>
              </div>

              <div className="space-y-3">
                {dbData.schedule.map((sch: any) => (
                  <div key={sch.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
                    <div>
                      <div className="flex items-center space-x-3">
                        <span className="font-bold text-sm text-slate-800">{sch.date}</span>
                        <span className="text-xs bg-indigo-100 text-indigo-800 px-2.5 py-1 rounded-lg font-bold">{sch.period}</span>
                        <span className="text-xs bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-lg font-bold">Lớp {sch.className}</span>
                      </div>
                      <p className="text-xs text-slate-700 mt-1 font-medium">Giáo viên: {sch.teacherName} — Bài: {sch.lessonName}</p>
                    </div>
                    <span className="text-xs font-bold text-emerald-700 bg-white border border-emerald-200 px-3 py-1 rounded-lg shadow-sm">
                      {sch.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 7: SAFETY & WASTE */}
          {activeTab === 'safety' && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
                <h2 className="text-xl font-bold text-slate-800 flex items-center space-x-2">
                  <ShieldCheck className="w-6 h-6 text-emerald-600" />
                  <span>Nội quy phòng thực hành Hóa học</span>
                </h2>
                <div className="space-y-3">
                  {dbData.safetyRules.map((rule: any) => (
                    <div key={rule.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                      <h3 className="font-bold text-sm text-slate-800">{rule.title}</h3>
                      <p className="text-xs text-slate-600 mt-1">{rule.content}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-slate-800">Sổ ghi nhận chất thải thí nghiệm</h3>
                  {currentUser.role === 'admin' && (
                    <button
                      onClick={() => {
                        const chemName = prompt('Nhập tên chất thải:');
                        const qty = prompt('Nhập số lượng / thể tích:');
                        if (chemName && qty) {
                          fetch('/api/waste', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ date: new Date().toISOString().split('T')[0], chemicalName: chemName, quantity: qty, treatedBy: currentUser.name, note: 'Xử lý định kì' })
                          }).then(() => fetchData());
                        }
                      }}
                      className="px-3.5 py-2 bg-emerald-700 text-white font-bold text-xs rounded-xl shadow"
                    >
                      + Ghi sổ chất thải
                    </button>
                  )}
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 text-xs font-bold text-slate-500 uppercase bg-slate-50">
                        <th className="p-3">Ngày</th>
                        <th className="p-3">Tên chất thải</th>
                        <th className="p-3">Số lượng</th>
                        <th className="p-3">Người xử lý</th>
                        <th className="p-3">Ghi chú</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm">
                      {dbData.wasteLog.map((w: any) => (
                        <tr key={w.id} className="hover:bg-slate-50">
                          <td className="p-3 text-xs text-slate-600">{w.date}</td>
                          <td className="p-3 font-bold text-slate-800">{w.chemicalName}</td>
                          <td className="p-3 text-xs text-slate-600">{w.quantity}</td>
                          <td className="p-3 text-xs font-medium text-emerald-700">{w.treatedBy}</td>
                          <td className="p-3 text-xs text-slate-500">{w.note}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 8: REPORTS & STATS */}
          {activeTab === 'reports' && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-800">Báo cáo & Thống kê phòng thí nghiệm</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Báo cáo tháng, học kỳ, thống kê lượt mượn dụng cụ và hóa chất</p>
                </div>
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-xl shadow flex items-center space-x-2"
                >
                  <Printer className="w-4 h-4" />
                  <span>In báo cáo / Xuất PDF</span>
                </button>
              </div>

              {/* Printable Report Section */}
              <div className="border border-slate-200 rounded-2xl p-6 bg-white space-y-6 print:border-none print:shadow-none">
                <div className="text-center space-y-1 pb-4 border-b border-slate-200">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-600">SỞ GIÁO DỤC VÀ ĐÀO TẠO TỈNH ĐỒNG NAI</p>
                  <h3 className="text-lg font-black text-slate-900">TRƯỜNG THCS&THPT VÕ THỊ SÁU</h3>
                  <h4 className="text-base font-bold text-emerald-800 pt-2">BÁO CÁO CÔNG TÁC PHÒNG THỰC HÀNH HÓA HỌC THÁNG 10/2026</h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <p className="text-xs font-bold text-slate-500 uppercase">Tổng số tiết thí nghiệm</p>
                    <p className="text-2xl font-black text-slate-800 mt-1">18 tiết</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <p className="text-xs font-bold text-slate-500 uppercase">Hóa chất đã xuất dùng</p>
                    <p className="text-2xl font-black text-emerald-700 mt-1">12 loại</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <p className="text-xs font-bold text-slate-500 uppercase">Dụng cụ hỏng vỡ</p>
                    <p className="text-2xl font-black text-amber-600 mt-1">3 ống nghiệm</p>
                  </div>
                </div>

                {/* Signature lines */}
                <div className="grid grid-cols-2 gap-8 pt-12 text-center text-sm font-bold">
                  <div>
                    <p className="text-slate-600">TỔ TRƯỞNG CHUYÊN MÔN</p>
                    <p className="text-xs font-normal text-slate-500">(Ký, ghi rõ họ tên)</p>
                    <div className="h-20"></div>
                    <p className="text-slate-800">........................................</p>
                  </div>
                  <div>
                    <p className="text-slate-600">PHÓ HIỆU TRƯỞNG DUYỆT</p>
                    <p className="text-xs font-normal text-slate-500">(Ký, đóng dấu)</p>
                    <div className="h-20"></div>
                    <p className="text-slate-800">........................................</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 9: ADMIN */}
          {activeTab === 'admin' && currentUser.role === 'admin' && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-slate-800">Quản lý tài khoản giáo viên</h2>
                    <p className="text-xs text-slate-500 mt-0.5">Cấp và đặt lại mật khẩu đăng nhập cho giáo viên trong tổ Hóa</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {dbData.users.map((u: any) => (
                    <div key={u.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
                      <div>
                        <h3 className="font-bold text-sm text-slate-800">{u.name}</h3>
                        <p className="text-xs text-slate-500">Tên đăng nhập: <span className="font-mono font-bold text-emerald-700">{u.username}</span></p>
                        <p className="text-xs text-slate-500 mt-0.5">{u.title}</p>
                      </div>
                      <button
                        onClick={() => { setSelectedUserForEdit(u); setModalType('userEdit'); }}
                        className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-lg transition shadow-sm"
                      >
                        Đổi mật khẩu
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Procurement requests management */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-slate-800">Đề nghị mua sắm bổ sung hóa chất & dụng cụ</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Lập tờ trình gửi Ban giám hiệu trường</p>
                  </div>
                  <button
                    onClick={() => setModalType('procurement')}
                    className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow"
                  >
                    + Tạo đề nghị mua sắm
                  </button>
                </div>

                <div className="space-y-3">
                  {dbData.procurement.map((p: any) => (
                    <div key={p.id} className="p-4 rounded-xl border border-slate-200 bg-white flex items-center justify-between shadow-sm">
                      <div>
                        <h4 className="font-bold text-sm text-slate-800">{p.itemName} (SL: {p.quantity})</h4>
                        <p className="text-xs text-slate-600 mt-0.5">Lý do: {p.reason}</p>
                        <p className="text-xs text-emerald-700 font-bold mt-1">Dự kiến kinh phí: {p.estimatedCost}</p>
                      </div>
                      <span className="text-xs bg-amber-100 text-amber-800 px-3 py-1 rounded-full font-bold">
                        {p.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* MODALS */}
      {modalType === 'newChemical' && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-lg text-slate-800">Thêm hóa chất mới vào kho</h3>
              <button onClick={() => setModalType(null)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleAddChemical} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Tên hóa chất</label>
                <input
                  type="text"
                  value={newChemicalForm.name}
                  onChange={(e) => setNewChemicalForm({ ...newChemicalForm, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Công thức hóa học</label>
                  <input
                    type="text"
                    value={newChemicalForm.formula}
                    onChange={(e) => setNewChemicalForm({ ...newChemicalForm, formula: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Đơn vị</label>
                  <input
                    type="text"
                    value={newChemicalForm.unit}
                    onChange={(e) => setNewChemicalForm({ ...newChemicalForm, unit: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Số lượng</label>
                  <input
                    type="number"
                    value={newChemicalForm.quantity}
                    onChange={(e) => setNewChemicalForm({ ...newChemicalForm, quantity: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Vị trí (Tủ / Ngăn)</label>
                  <input
                    type="text"
                    value={newChemicalForm.location}
                    onChange={(e) => setNewChemicalForm({ ...newChemicalForm, location: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
                    required
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2 pt-2">
                <input
                  type="checkbox"
                  checked={newChemicalForm.isHazardous}
                  onChange={(e) => setNewChemicalForm({ ...newChemicalForm, isHazardous: e.target.checked })}
                  className="rounded text-emerald-600"
                />
                <span className="text-xs font-bold text-slate-700">Hóa chất nguy hiểm (cần cảnh báo an toàn)</span>
              </div>
              <div className="flex justify-end space-x-3 pt-3">
                <button type="button" onClick={() => setModalType(null)} className="px-4 py-2.5 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl">Hủy</button>
                <button type="submit" className="px-5 py-2.5 bg-emerald-700 text-white font-bold text-xs rounded-xl shadow">Lưu hóa chất</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {modalType === 'returnReport' && selectedRequest && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-lg text-slate-800">Báo cáo trả thiết bị & hóa chất</h3>
              <button onClick={() => setModalType(null)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={submitReturnReport} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Tình trạng thực tế khi trả</label>
                <textarea
                  value={returnReportData.conditionNote}
                  onChange={(e) => setReturnReportData({ ...returnReportData, conditionNote: e.target.value })}
                  placeholder="Ví dụ: Đã dùng hết dung dịch HCl, dụng cụ sạch sẽ, không vỡ..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm h-24"
                  required
                ></textarea>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Dụng cụ hỏng vỡ (nếu có)</label>
                <input
                  type="text"
                  value={returnReportData.brokenItems}
                  onChange={(e) => setReturnReportData({ ...returnReportData, brokenItems: e.target.value })}
                  placeholder="Ví dụ: Vỡ 1 ống nghiệm"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Đính kèm ảnh thực tế (Bắt buộc)</label>
                <input
                  type="text"
                  value={returnReportData.photoUrl}
                  onChange={(e) => setReturnReportData({ ...returnReportData, photoUrl: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-mono text-xs"
                />
                <img src={returnReportData.photoUrl} alt="Preview" className="w-24 h-24 object-cover rounded-xl mt-2 border" />
              </div>
              <div className="flex justify-end space-x-3 pt-3">
                <button type="button" onClick={() => setModalType(null)} className="px-4 py-2.5 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl">Hủy</button>
                <button type="submit" className="px-5 py-2.5 bg-purple-600 text-white font-bold text-xs rounded-xl shadow">Gửi báo cáo trả đồ</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {modalType === 'procurement' && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-lg text-slate-800">Tạo đề nghị mua sắm bổ sung</h3>
              <button onClick={() => setModalType(null)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleAddProcurement} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Tên thiết bị / hóa chất cần mua</label>
                <input
                  type="text"
                  value={procurementForm.itemName}
                  onChange={(e) => setProcurementForm({ ...procurementForm, itemName: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Số lượng</label>
                  <input
                    type="number"
                    value={procurementForm.quantity}
                    onChange={(e) => setProcurementForm({ ...procurementForm, quantity: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Dự kiến kinh phí</label>
                  <input
                    type="text"
                    value={procurementForm.estimatedCost}
                    onChange={(e) => setProcurementForm({ ...procurementForm, estimatedCost: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Lý do đề nghị</label>
                <textarea
                  value={procurementForm.reason}
                  onChange={(e) => setProcurementForm({ ...procurementForm, reason: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm h-20"
                  required
                ></textarea>
              </div>
              <div className="flex justify-end space-x-3 pt-3">
                <button type="button" onClick={() => setModalType(null)} className="px-4 py-2.5 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl">Hủy</button>
                <button type="submit" className="px-5 py-2.5 bg-emerald-700 text-white font-bold text-xs rounded-xl shadow">Gửi tờ trình</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {modalType === 'qrModal' && qrItem && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl text-center space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base text-slate-800">Tem QR Kiểm Tra Nhanh</h3>
              <button onClick={() => setModalType(null)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl inline-block">
              <QrCode className="w-32 h-32 text-slate-800 mx-auto" />
              <p className="font-mono font-bold text-xs text-slate-700 mt-2">{qrItem.code}</p>
            </div>
            <div>
              <p className="font-bold text-sm text-slate-800">{qrItem.name}</p>
              <p className="text-xs text-slate-500 mt-0.5">Vị trí: {qrItem.location}</p>
            </div>
            <button onClick={() => setModalType(null)} className="w-full py-2.5 bg-slate-800 text-white font-bold text-xs rounded-xl">Đóng</button>
          </div>
        </div>
      )}

      {modalType === 'userEdit' && selectedUserForEdit && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base text-slate-800">Đặt lại mật khẩu</h3>
              <button onClick={() => setModalType(null)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500"><X className="w-5 h-5" /></button>
            </div>
            <p className="text-xs text-slate-600">Đổi mật khẩu cho giáo viên: <span className="font-bold text-slate-800">{selectedUserForEdit.name}</span></p>
            <form onSubmit={handleResetPassword} className="space-y-3">
              <input
                type="text"
                value={newPassText}
                onChange={(e) => setNewPassText(e.target.value)}
                placeholder="Nhập mật khẩu mới..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
                required
              />
              <div className="flex justify-end space-x-2 pt-2">
                <button type="button" onClick={() => setModalType(null)} className="px-3.5 py-2 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl">Hủy</button>
                <button type="submit" className="px-4 py-2 bg-emerald-700 text-white font-bold text-xs rounded-xl">Xác nhận đổi</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
