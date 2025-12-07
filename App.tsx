
import React, { useState, useEffect, useRef } from 'react';
import { HashRouter, Routes, Route, Link, Navigate } from 'react-router-dom';
import { LayoutDashboard, Calendar, ShieldCheck, Phone, CheckCircle, XCircle, Menu, X, LogOut, User as UserIcon, Plus, Edit2, Trash2, AlertTriangle, Save, Search, ScanLine, QrCode, UserCheck, Camera, StopCircle, RefreshCw, SwitchCamera, Eye, CreditCard, Info, Clock, MapPin, Users, Lock, EyeOff } from 'lucide-react';
import { BookingWizard } from './components/BookingWizard';
import { AuthModal } from './components/AuthModal';
import { BookingDetails, Shift, BookingStatus, User, AdminData } from './types';
import { generateAdminReport } from './services/geminiService';
import { db, auth, firebaseConfig } from './services/firebase';
import firebase from "firebase/compat/app";

// Add type definition for global html5-qrcode library
declare class Html5Qrcode {
  constructor(elementId: string, config?: any);
  start(cameraIdOrConfig: string | { facingMode: string }, config: any, onScanSuccess: (decodedText: string, decodedResult: any) => void, onScanFailure: (error: any) => void): Promise<void>;
  stop(): Promise<void>;
  clear(): Promise<void>;
  static getCameras(): Promise<Array<{ id: string; label: string }>>;
}

// --- Components defined internally to satisfy file count constraint while keeping code clean ---

// 1. Navbar
const Navbar = ({ user, onLogout, onLoginClick }: { user: User | null, onLogout: () => void, onLoginClick: () => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  const isAdmin = user?.isAdmin;
  
  return (
    <nav className="bg-white shadow-sm sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2">
              <div className="bg-blue-600 text-white p-2 rounded-lg">
                <ShieldCheck size={24} />
              </div>
              <span className="text-xl font-bold text-gray-900">الحكمدار</span>
            </Link>
          </div>
          
          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            <Link to="/" className="text-gray-600 hover:text-blue-600 font-medium">الرئيسية</Link>
            
            {!user && (
              <button 
                onClick={onLoginClick}
                className="text-gray-600 hover:text-blue-600 font-medium transition"
              >
                تسجيل الدخول
              </button>
            )}

            <Link to="/book" className="text-gray-600 hover:text-blue-600 font-medium">حجز موعد</Link>
            
            {isAdmin && (
               <Link to="/admin" className="text-red-600 hover:text-red-700 font-bold flex items-center gap-1">
                 <LayoutDashboard size={18} />
                 الإدارة
               </Link>
            )}

            {user ? (
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-gray-700 flex items-center gap-1">
                  <UserIcon size={16} />
                  {user.displayName || user.phoneNumber || 'مستخدم'}
                  {user.role === 'super_admin' && <span className="text-xs bg-red-100 text-red-600 px-1 rounded">Admin</span>}
                </span>
                <button 
                  onClick={onLogout}
                  className="text-gray-500 hover:text-red-600 transition"
                  title="تسجيل الخروج"
                >
                  <LogOut size={20} />
                </button>
              </div>
            ) : (
              <Link to="/book" className="bg-blue-600 text-white px-5 py-2 rounded-full font-bold hover:bg-blue-700 transition">
                احجز الآن
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button onClick={() => setIsOpen(!isOpen)} className="text-gray-600">
              {isOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-t p-4 space-y-3 shadow-lg">
           <Link to="/" onClick={() => setIsOpen(false)} className="block text-gray-700 py-2">الرئيسية</Link>
           {!user && (
             <button 
               onClick={() => { setIsOpen(false); onLoginClick(); }} 
               className="block w-full text-right text-gray-700 py-2"
             >
               تسجيل الدخول
             </button>
           )}
           <Link to="/book" onClick={() => setIsOpen(false)} className="block text-gray-700 py-2">حجز موعد</Link>
           {isAdmin && (
             <Link to="/admin" onClick={() => setIsOpen(false)} className="block text-red-600 font-bold py-2">الإدارة</Link>
           )}
           {user && (
             <button onClick={onLogout} className="block w-full text-right text-gray-500 py-2">تسجيل الخروج</button>
           )}
        </div>
      )}
    </nav>
  );
};

// 2. Footer
const Footer = () => (
  <footer className="bg-gray-900 text-gray-300 py-12">
    <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
      <div>
        <h3 className="text-white text-lg font-bold mb-4">عن الحكمدار</h3>
        <p className="text-sm leading-relaxed text-gray-400">
          منصة متكاملة لحجز قاعات الامتحانات بأحدث التجهيزات. نوفر بيئة هادئة ومناسبة لجميع الطلاب.
        </p>
      </div>
      <div>
        <h3 className="text-white text-lg font-bold mb-4">روابط سريعة</h3>
        <ul className="space-y-2 text-sm">
          <li><Link to="/book" className="hover:text-white">جدول المواعيد</Link></li>
          <li><Link to="/policy" className="hover:text-white">سياسة الإلغاء</Link></li>
          <li><Link to="/contact" className="hover:text-white">تواصل معنا</Link></li>
        </ul>
      </div>
      <div>
        <h3 className="text-white text-lg font-bold mb-4">تواصل معنا</h3>
        <p className="flex items-center gap-2 mb-2"><Phone size={16} /> 01006588878</p>
        <p className="text-sm text-gray-500">متاح 24 ساعة عبر واتساب</p>
      </div>
    </div>
    <div className="text-center mt-12 border-t border-gray-800 pt-8 text-sm text-gray-500">
      <p>&copy; {new Date().getFullYear()} جميع الحقوق محفوظة لـ الحكمدار.</p>
      <p className="mt-3 text-gray-400 font-bold text-base">إعداد : جرجس رضا</p>
    </div>
  </footer>
);

// 3. Home Page
const HomePage = () => (
  <div className="animate-fade-in">
    {/* Hero Section - Strict 50/50 Split on ALL screens */}
    <div className="flex flex-row min-h-[50vh] lg:min-h-[calc(100vh-64px)] overflow-hidden">
      
      {/* Right Side (Text): Order 1 in RTL = Right */}
      <div className="w-1/2 bg-white flex flex-col justify-center items-start px-4 sm:px-8 lg:px-24 py-8 lg:py-12 text-right order-1 z-10 relative">
        <h1 className="text-xl sm:text-4xl lg:text-6xl font-extrabold mb-3 lg:mb-6 text-gray-900 leading-tight">
          احجز مكانك مع <br />
          <span className="text-blue-600">الحكمدار</span> <br />
          بكل سهولة
        </h1>
        <p className="text-xs sm:text-lg lg:text-xl text-gray-600 mb-6 lg:mb-10 leading-relaxed max-w-lg">
          نظام حجز فوري، دفع إلكتروني، وتأكيد لحظي لضمان مقعدك بدون عناء.
        </p>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 w-full">
          <Link to="/book" className="bg-blue-600 text-white px-4 lg:px-10 py-2 lg:py-4 rounded-full font-bold text-xs sm:text-lg hover:bg-blue-700 transition shadow-xl flex items-center justify-center gap-2">
            احجز الآن <CheckCircle size={16} className="sm:w-5 sm:h-5" />
          </Link>
          <button 
            onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })}
            className="bg-gray-100 text-gray-800 border border-gray-200 px-4 lg:px-10 py-2 lg:py-4 rounded-full font-bold text-xs sm:text-lg hover:bg-gray-200 transition flex items-center justify-center cursor-pointer"
          >
            تعرف المزيد
          </button>
        </div>
      </div>

      {/* Left Side (Image): Order 2 in RTL = Left */}
      <div className="w-1/2 relative order-2 bg-gray-200">
        <img 
          src="https://i.postimg.cc/Qt3jBzsJ/IMG-20251206-WA0013.jpg" 
          alt="قاعة الحكمدار" 
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Mobile Gradient Overlay to make text readable if they overlap? No, we are doing split screen. */}
      </div>
    </div>

    {/* About / Definition Section */}
    <div id="about" className="bg-blue-900 text-white py-16 lg:py-24 px-4 scroll-mt-16">
      <div className="max-w-4xl mx-auto text-center">
        <div className="inline-block bg-blue-600 p-3 rounded-full mb-6">
          <Info size={32} className="text-white" />
        </div>
        <h2 className="text-3xl lg:text-4xl font-bold mb-6">ما هي منصة الحكمدار؟</h2>
        <div className="text-lg lg:text-xl leading-relaxed text-gray-300 space-y-4">
          <p>
            <span className="text-blue-400 font-bold">الحكمدار</span> هي المنصة الرقمية الأولى المتخصصة في إدارة وحجز قاعات الامتحانات بأعلى معايير الجودة والتنظيم.
          </p>
          <p>
            نحن ندرك أهمية التركيز أثناء فترة الامتحانات، لذا قمنا بتجهيز قاعاتنا بأحدث وسائل الراحة، التكييف المركزي، والإضاءة المناسبة، مع نظام حجز ذكي يضمن لك مقعدك بضغطة زر. لا داعي للانتظار أو القلق، نظامنا يتيح لك اختيار الموعد المناسب والدفع إلكترونياً وتأكيد الحجز في ثوانٍ.
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-12 text-center">
            <div className="p-4 bg-gray-800 rounded-lg">
                <Clock className="mx-auto text-blue-400 mb-2" size={24}/>
                <h4 className="font-bold">دقة في المواعيد</h4>
            </div>
            <div className="p-4 bg-gray-800 rounded-lg">
                <MapPin className="mx-auto text-blue-400 mb-2" size={24}/>
                <h4 className="font-bold">موقع متميز</h4>
            </div>
            <div className="p-4 bg-gray-800 rounded-lg">
                <ShieldCheck className="mx-auto text-blue-400 mb-2" size={24}/>
                <h4 className="font-bold">أمان ونظام</h4>
            </div>
        </div>
      </div>
    </div>

    {/* Features */}
    <div id="features" className="py-20 max-w-7xl mx-auto px-4">
      <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">مميزات الحجز معنا</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center hover:shadow-md transition">
          <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Calendar size={32} />
          </div>
          <h3 className="text-xl font-bold mb-2">مرونة في المواعيد</h3>
          <p className="text-gray-600">اختر الشفت المناسب لك من جدول محدث لحظياً.</p>
        </div>
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center hover:shadow-md transition">
          <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Phone size={32} />
          </div>
          <h3 className="text-xl font-bold mb-2">دفع سهل عبر انستا باي</h3>
          <p className="text-gray-600">ادفع من موبايلك في ثواني وأكد حجزك فوراً.</p>
        </div>
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center hover:shadow-md transition">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShieldCheck size={32} />
          </div>
          <h3 className="text-xl font-bold mb-2">بيئة مريحة</h3>
          <p className="text-gray-600">قاعات مكيفة، هادئة، ومجهزة بأفضل المقاعد.</p>
        </div>
      </div>
    </div>
  </div>
);

// 4. Admin Dashboard
const AdminDashboard: React.FC<{ 
  bookings: BookingDetails[], 
  shifts: Shift[],
  adminList: AdminData[],
  currentUserRole?: string,
  onStatusChange: (id: string, status: BookingStatus) => void;
  onDeleteBooking: (id: string) => void;
  onAddShift: (shift: Omit<Shift, 'id' | 'booked'>) => void;
  onUpdateShift: (shift: Shift) => void;
  onDeleteShift: (id: string) => void;
  onMarkAttended: (id: string) => void;
  onAddAdmin: (name: string, email: string, password: string) => Promise<void>;
  onDeleteAdmin: (id: string) => Promise<void>;
}> = ({ bookings, shifts, adminList, currentUserRole, onStatusChange, onDeleteBooking, onAddShift, onUpdateShift, onDeleteShift, onMarkAttended, onAddAdmin, onDeleteAdmin }) => {
  const [report, setReport] = useState<string | null>(null);
  const [loadingReport, setLoadingReport] = useState(false);
  const [activeTab, setActiveTab] = useState<'bookings' | 'shifts' | 'entry' | 'admins'>('bookings');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewingBooking, setViewingBooking] = useState<BookingDetails | null>(null);
  
  // Shift Management States
  const [isShiftModalOpen, setIsShiftModalOpen] = useState(false);
  const [editingShift, setEditingShift] = useState<Shift | null>(null);
  const [shiftFormData, setShiftFormData] = useState({
    date: '',
    startTime: '',
    endTime: '',
    capacity: 50,
    price: 150
  });

  // Admin Management States
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [newAdminData, setNewAdminData] = useState({ name: '', email: '', password: '' });
  const [adminLoading, setAdminLoading] = useState(false);
  const [showAdminPassword, setShowAdminPassword] = useState(false);

  // Entry Check States
  const [entrySearch, setEntrySearch] = useState('');
  const [scannedBooking, setScannedBooking] = useState<BookingDetails | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  // Scanner States
  const [showScanner, setShowScanner] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scannerRunningRef = useRef<boolean>(false);
  const [cameras, setCameras] = useState<Array<{id: string, label: string}>>([]);
  const [currentCameraId, setCurrentCameraId] = useState<string>('');
  const [cameraError, setCameraError] = useState<string>('');

  // Consolidated Confirmation Modal State
  const [confirmationData, setConfirmationData] = useState<{
    type: 'DELETE_SHIFT' | 'DELETE_BOOKING' | 'CHANGE_STATUS' | 'MARK_ATTENDED' | 'DELETE_ADMIN';
    id: string;
    payload?: any; // For status change value
    message: string;
    buttonColor: string;
  } | null>(null);

  // Scanner Effect
  useEffect(() => {
    let isMounted = true;

    const cleanupScanner = async () => {
        if (scannerRef.current) {
            // Only stop if we know it's running
            if (scannerRunningRef.current) {
                try {
                    await scannerRef.current.stop();
                    scannerRunningRef.current = false;
                } catch (error) {
                    console.log("Scanner stop error ignored:", error);
                }
            }
            try {
                await scannerRef.current.clear();
            } catch (error) {
                // Ignore clear errors
            }
            scannerRef.current = null;
        }
    };

    const initScanner = async () => {
        // If scanner shouldn't be running, ensure it's stopped
        if (!showScanner || activeTab !== 'entry') {
            await cleanupScanner();
            return;
        }

        // Wait a bit for DOM to be ready
        await new Promise(resolve => setTimeout(resolve, 300));
        if (!isMounted) return;

        const element = document.getElementById("reader");
        if (!element) return;

        // Cleanup any previous instance defensively
        await cleanupScanner();
        if (!isMounted) return;

        try {
            // @ts-ignore
            // ENABLE NATIVE BARCODE DETECTOR FOR SPEED
            const html5QrCode = new Html5Qrcode("reader", {
                experimentalFeatures: {
                    useBarCodeDetectorIfSupported: true
                },
                verbose: false
            });
            scannerRef.current = html5QrCode;

            // Get cameras if we haven't yet or need to verify
            let cameraId = currentCameraId;
            if (!cameraId) {
                 try {
                    // @ts-ignore
                    const devices = await Html5Qrcode.getCameras();
                    if (devices && devices.length) {
                        setCameras(devices);
                        // Try to pick back camera. Safety check for label existence.
                        const backCam = devices.find((d: any) => d.label && (d.label.toLowerCase().includes('back') || d.label.toLowerCase().includes('environment')));
                        cameraId = backCam ? backCam.id : devices[0].id;
                        setCurrentCameraId(cameraId);
                    }
                 } catch (err) {
                     console.warn("Camera access failed", err);
                 }
            }

            if (!isMounted) {
                await cleanupScanner();
                return;
            }

            if (cameraId) {
                await html5QrCode.start(
                    cameraId,
                    {
                        fps: 20, // INCREASED FPS FOR SPEED
                        qrbox: { width: 300, height: 300 }, // LARGER BOX FOR BETTER DETECTION
                        aspectRatio: 1.0,
                    },
                    (decodedText: string) => {
                        if (isMounted) onScanSuccess(decodedText);
                    },
                    (error: any) => {
                        // ignore frame errors
                    }
                );
                scannerRunningRef.current = true;
                if (isMounted) setCameraError("");
            } else {
                if (isMounted) setCameraError("لم يتم العثور على كاميرا");
            }

        } catch (err: any) {
            console.error("Scanner start error", err);
            if (isMounted) {
                let msg = "فشل تشغيل الكاميرا";
                if (err?.name === 'NotAllowedError' || err?.message?.includes('Permission') || err?.message?.includes('denied')) {
                    msg = "تم رفض إذن الكاميرا. يرجى السماح به من إعدادات المتصفح.";
                } else if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
                    msg = "يجب استخدام HTTPS لتشغيل الكاميرا.";
                }
                setCameraError(msg);
            }
            await cleanupScanner();
        }
    };

    initScanner();

    return () => {
        isMounted = false;
        // Clean up synchronously as possible on unmount
        if (scannerRef.current && scannerRunningRef.current) {
            scannerRef.current.stop().catch(() => {}).then(() => {
                scannerRef.current?.clear().catch(() => {});
                scannerRunningRef.current = false;
            });
        }
    };
  }, [showScanner, activeTab, currentCameraId]);

  const switchCamera = () => {
      if (cameras.length < 2) return;
      const currentIndex = cameras.findIndex(c => c.id === currentCameraId);
      const nextIndex = (currentIndex + 1) % cameras.length;
      setCurrentCameraId(cameras[nextIndex].id);
      // Effect handles the restart automatically
  };

  const onScanSuccess = (decodedText: string) => {
      setEntrySearch(decodedText);
      setShowScanner(false);
      handleScanSearch(decodedText);
  };

  const handleScanSearch = (query: string) => {
     if (!query) return;
     const found = bookings.find(b => 
        (b.ticketNumber && b.ticketNumber.toString() === query) || 
        b.phoneNumber === query
    );

    if (found) {
        setScannedBooking(found);
    } else {
        setScannedBooking(null);
        alert('لم يتم العثور على تذكرة بهذا الرقم.');
    }
  }

  const handleGenerateReport = async () => {
    setLoadingReport(true);
    const result = await generateAdminReport(bookings, shifts);
    setReport(result);
    setLoadingReport(false);
  };

  const openAddModal = () => {
    setEditingShift(null);
    setShiftFormData({ date: '', startTime: '', endTime: '', capacity: 50, price: 150 });
    setIsShiftModalOpen(true);
  };

  const openEditModal = (shift: Shift) => {
    setEditingShift(shift);
    setShiftFormData({
      date: shift.date,
      startTime: shift.startTime,
      endTime: shift.endTime,
      capacity: shift.capacity,
      price: shift.price
    });
    setIsShiftModalOpen(true);
  };

  const handleShiftSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingShift) {
      onUpdateShift({ ...editingShift, ...shiftFormData });
    } else {
      onAddShift(shiftFormData);
    }
    setIsShiftModalOpen(false);
  };

  const handleAddAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminLoading(true);
    try {
      // Auto-append domain to simulate phone auth
      const email = `${newAdminData.email}@examhall.com`;
      await onAddAdmin(newAdminData.name, email, newAdminData.password);
      setNewAdminData({ name: '', email: '', password: '' });
      setIsAdminModalOpen(false);
      alert('تم إنشاء حساب المسؤول بنجاح');
    } catch (error: any) {
      alert('خطأ: ' + error.message);
    } finally {
      setAdminLoading(false);
    }
  };

  const handleEntrySearch = (e: React.FormEvent) => {
    e.preventDefault();
    handleScanSearch(entrySearch);
  };

  const confirmAction = () => {
    if (!confirmationData) return;

    if (confirmationData.type === 'DELETE_SHIFT') {
      onDeleteShift(confirmationData.id);
    } else if (confirmationData.type === 'DELETE_BOOKING') {
      onDeleteBooking(confirmationData.id);
    } else if (confirmationData.type === 'CHANGE_STATUS') {
      onStatusChange(confirmationData.id, confirmationData.payload);
    } else if (confirmationData.type === 'MARK_ATTENDED') {
        onMarkAttended(confirmationData.id);
        if (scannedBooking && scannedBooking.id === confirmationData.id) {
            setScannedBooking({...scannedBooking, attended: true});
        }
    } else if (confirmationData.type === 'DELETE_ADMIN') {
        onDeleteAdmin(confirmationData.id);
    }
    setConfirmationData(null);
  };

  // Safe filtering that prevents 'toLowerCase' errors on undefined properties
  const filteredBookings = bookings.filter(b => 
    (b.fullName || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
    (b.ticketNumber && b.ticketNumber.toString().includes(searchTerm)) ||
    (b.phoneNumber || '').includes(searchTerm) ||
    (b.applicationNumber || '').includes(searchTerm) ||
    (b.senderPhone || '').includes(searchTerm)
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800">لوحة التحكم</h2>
        <div className="flex gap-4">
            <div className="bg-white px-4 py-2 rounded-lg shadow text-center">
                <span className="block text-xs text-gray-500">إجمالي الحجوزات</span>
                <span className="font-bold text-xl">{bookings.length}</span>
            </div>
            <div className="bg-white px-4 py-2 rounded-lg shadow text-center">
                <span className="block text-xs text-gray-500">قيد الانتظار</span>
                <span className="font-bold text-xl text-yellow-600">{bookings.filter(b => b.status === BookingStatus.PENDING).length}</span>
            </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6 overflow-x-auto">
        <button
          onClick={() => setActiveTab('bookings')}
          className={`px-6 py-3 font-medium text-sm transition-colors relative whitespace-nowrap ${
            activeTab === 'bookings' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          إدارة الحجوزات
          {activeTab === 'bookings' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600"></div>}
        </button>
        <button
          onClick={() => setActiveTab('shifts')}
          className={`px-6 py-3 font-medium text-sm transition-colors relative whitespace-nowrap ${
            activeTab === 'shifts' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          إدارة المواعيد
          {activeTab === 'shifts' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600"></div>}
        </button>
        <button
          onClick={() => { setActiveTab('entry'); setTimeout(() => searchInputRef.current?.focus(), 100); }}
          className={`px-6 py-3 font-medium text-sm transition-colors relative whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'entry' ? 'text-purple-600' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <ScanLine size={18} />
          تأكيد الدخول (Scanner)
          {activeTab === 'entry' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-purple-600"></div>}
        </button>
        
        {/* Only show Admins tab for Super Admin */}
        {currentUserRole === 'super_admin' && (
          <button
            onClick={() => setActiveTab('admins')}
            className={`px-6 py-3 font-medium text-sm transition-colors relative whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'admins' ? 'text-red-600' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Users size={18} />
            المسؤولين (Admins)
            {activeTab === 'admins' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-red-600"></div>}
          </button>
        )}
      </div>

      {activeTab === 'bookings' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Bookings List */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
              <h3 className="font-bold text-lg">طلبات الحجز</h3>
              <div className="relative w-full md:w-64">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type="text" 
                  placeholder="بحث بالتذكرة (مثال 1001) أو الهاتف..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-right">
                <thead className="bg-gray-50 text-gray-600">
                  <tr>
                    <th className="p-4">التذكرة / الطالب</th>
                    <th className="p-4">الموعد</th>
                    <th className="p-4">بيانات الدفع</th>
                    <th className="p-4">الحالة</th>
                    <th className="p-4">إجراء</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredBookings.map((booking) => (
                    <tr key={booking.id} className="hover:bg-gray-50">
                      <td className="p-4">
                        <div className="text-sm font-mono font-bold text-blue-700 bg-blue-100 px-3 py-1 inline-block rounded mb-1 border border-blue-200">
                          #{booking.ticketNumber || '---'}
                        </div>
                        <div className="font-medium text-gray-900">{booking.fullName}</div>
                        <div className="text-xs text-gray-500">{booking.phoneNumber}</div>
                         <div className="text-xs text-gray-500 mt-1">
                          <span className="font-bold">رقم الأبلكيشن:</span> {booking.applicationNumber || '-'}
                        </div>
                      </td>
                      <td className="p-4">
                        {shifts.find(s => s.id === booking.shiftId)?.date}
                      </td>
                      <td className="p-4 text-xs">
                        <div><span className="text-gray-500">من:</span> <span className="font-bold text-purple-700">{booking.senderPhone || '-'}</span></div>
                        <div><span className="text-gray-500">رقم العملية:</span> <span className="font-mono">{booking.transactionId || '-'}</span></div>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                          booking.status === BookingStatus.CONFIRMED ? 'bg-green-100 text-green-700' :
                          booking.status === BookingStatus.REJECTED ? 'bg-red-100 text-red-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {booking.status === BookingStatus.CONFIRMED ? 'مؤكد' :
                          booking.status === BookingStatus.REJECTED ? 'مرفوض' : 'انتظار'}
                        </span>
                        {booking.attended && (
                            <div className="mt-1 text-xs font-bold text-purple-600 border border-purple-200 bg-purple-50 rounded px-1 text-center">تم الحضور</div>
                        )}
                      </td>
                      <td className="p-4 flex gap-2 flex-wrap items-center">
                        {/* VIEW DETAILS BUTTON - EXPLICIT AND CLEAR */}
                        <button
                            onClick={() => setViewingBooking(booking)}
                            className="bg-blue-100 text-blue-700 px-3 py-1 rounded-md text-xs font-bold hover:bg-blue-200 flex items-center gap-1 transition"
                            title="عرض التفاصيل الكاملة"
                        >
                            <Eye size={14} />
                            تفاصيل
                        </button>
                        
                        {booking.status === BookingStatus.PENDING && (
                          <>
                            <button 
                              onClick={() => setConfirmationData({
                                type: 'CHANGE_STATUS',
                                id: booking.id,
                                payload: BookingStatus.CONFIRMED,
                                message: 'هل أنت متأكد من الموافقة على هذا الحجز؟',
                                buttonColor: 'bg-green-600'
                              })}
                              className="p-1 text-green-600 hover:bg-green-50 rounded" title="تأكيد"
                            >
                              <CheckCircle size={18} />
                            </button>
                            <button 
                              onClick={() => setConfirmationData({
                                type: 'CHANGE_STATUS',
                                id: booking.id,
                                payload: BookingStatus.REJECTED,
                                message: 'هل أنت متأكد من رفض هذا الحجز؟',
                                buttonColor: 'bg-red-600'
                              })}
                              className="p-1 text-red-600 hover:bg-red-50 rounded" title="رفض"
                            >
                              <XCircle size={18} />
                            </button>
                          </>
                        )}
                        {booking.status === BookingStatus.CONFIRMED && (
                            <span className="text-green-600"><CheckCircle size={18} /></span>
                        )}
                        <button 
                            onClick={() => setConfirmationData({
                              type: 'DELETE_BOOKING',
                              id: booking.id,
                              message: 'هل أنت متأكد من حذف هذا الحجز نهائياً؟',
                              buttonColor: 'bg-red-700'
                            })}
                            className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded" title="حذف"
                        >
                            <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredBookings.length === 0 && (
                      <tr>
                          <td colSpan={5} className="p-8 text-center text-gray-500">لا توجد نتائج مطابقة</td>
                      </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* AI Analysis Sidebar */}
          <div className="bg-white rounded-xl shadow-lg p-6 h-fit">
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white p-2 rounded-lg">
                  <LayoutDashboard size={20} />
              </div>
              <h3 className="font-bold text-lg">تحليل الذكاء الاصطناعي</h3>
            </div>
            
            <p className="text-gray-600 text-sm mb-6">
              استخدم نموذج Gemini لتحليل بيانات الحجز الحالية والحصول على توصيات للإدارة.
            </p>

            {!report && (
              <button
                  onClick={handleGenerateReport}
                  disabled={loadingReport || bookings.length === 0}
                  className={`w-full py-3 rounded-lg font-bold text-white transition ${
                      loadingReport ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 shadow-md'
                  }`}
              >
                  {loadingReport ? 'جاري التحليل...' : 'توليد تقرير ذكي'}
              </button>
            )}

            {report && (
                <div className="mt-4 p-4 bg-indigo-50 rounded-lg border border-indigo-100 text-sm leading-relaxed text-gray-800">
                    <div dangerouslySetInnerHTML={{ __html: report }} />
                    <button 
                      onClick={() => setReport(null)}
                      className="mt-4 text-indigo-600 text-xs font-bold underline hover:text-indigo-800"
                    >
                        تحليل جديد
                    </button>
                </div>
            )}
          </div>
        </div>
      ) : activeTab === 'entry' ? (
        /* ENTRY VERIFICATION TAB */
        <div className="max-w-3xl mx-auto animate-fade-in">
            <div className="bg-white rounded-xl shadow-lg p-8">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <QrCode size={32} />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800">فحص تذاكر الدخول</h2>
                    <p className="text-gray-500">قم بمسح الباركود أو إدخال رقم التذكرة يدوياً</p>
                </div>

                <div className="mb-6">
                    {showScanner ? (
                        <div className="mb-4">
                             <div className="w-full h-80 bg-black rounded-lg overflow-hidden shadow-lg border-2 border-purple-500 relative flex flex-col">
                                {cameraError ? (
                                    <div className="flex-1 flex items-center justify-center text-red-400 p-4 text-center">
                                        <AlertTriangle size={32} className="mb-2 mx-auto" />
                                        {cameraError}
                                    </div>
                                ) : (
                                    <div id="reader" className="w-full h-full"></div>
                                )}
                             </div>
                             
                             <div className="flex gap-2 mt-2">
                                <button 
                                    onClick={() => setShowScanner(false)}
                                    className="flex-1 bg-red-100 text-red-700 py-2 rounded-lg font-bold flex items-center justify-center gap-2"
                                >
                                    <StopCircle size={18} />
                                    إيقاف الكاميرا
                                </button>
                                {cameras.length > 1 && (
                                    <button 
                                        onClick={switchCamera}
                                        className="bg-gray-100 text-gray-700 py-2 px-4 rounded-lg font-bold flex items-center justify-center gap-2"
                                        title="تبديل الكاميرا"
                                    >
                                        <SwitchCamera size={18} />
                                    </button>
                                )}
                             </div>
                        </div>
                    ) : (
                        <button 
                            onClick={() => { setShowScanner(true); setScannedBooking(null); }}
                            className="w-full bg-purple-600 text-white py-3 rounded-xl hover:bg-purple-700 transition font-bold flex items-center justify-center gap-2 mb-4 shadow-md"
                        >
                            <Camera size={20} />
                            تشغيل الكاميرا (Scan)
                        </button>
                    )}
                </div>

                <form onSubmit={handleEntrySearch} className="mb-8">
                    <div className="relative">
                        <input 
                            ref={searchInputRef}
                            type="text" 
                            className="w-full border-2 border-purple-200 rounded-2xl p-4 text-center text-2xl font-mono tracking-widest focus:border-purple-500 focus:outline-none bg-white text-gray-900"
                            placeholder="...أو اكتب الرقم"
                            value={entrySearch}
                            onChange={(e) => setEntrySearch(e.target.value)}
                        />
                        <button 
                            type="submit"
                            className="absolute left-2 top-2 bottom-2 bg-gray-800 text-white px-6 rounded-xl hover:bg-gray-700 transition font-bold"
                        >
                            بحث
                        </button>
                    </div>
                </form>

                {scannedBooking && (
                    <div className="border border-gray-200 rounded-xl p-6 bg-gray-50 animate-fade-in">
                        <div className="flex flex-col md:flex-row gap-6 items-start">
                             <div className={`w-full md:w-32 h-32 rounded-xl flex items-center justify-center text-white text-4xl font-bold ${
                                 scannedBooking.status === BookingStatus.CONFIRMED ? 'bg-green-500' : 'bg-red-500'
                             }`}>
                                {scannedBooking.status === BookingStatus.CONFIRMED ? <CheckCircle size={48} /> : <XCircle size={48} />}
                             </div>
                             
                             <div className="flex-1 space-y-3">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="text-2xl font-bold text-gray-900">{scannedBooking.fullName}</h3>
                                        <p className="text-gray-500">تذكرة رقم: <span className="font-mono font-bold text-gray-800">#{scannedBooking.ticketNumber}</span></p>
                                    </div>
                                    <div className="text-left">
                                        <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                                            scannedBooking.status === BookingStatus.CONFIRMED ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                        }`}>
                                            {scannedBooking.status === BookingStatus.CONFIRMED ? 'صالح للدخول' : 'غير صالح'}
                                        </span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 text-sm bg-white p-4 rounded-lg border border-gray-200">
                                    <div>
                                        <p className="text-gray-500">المجموعة</p>
                                        <p className="font-bold">{scannedBooking.group}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500">الموعد</p>
                                        <p className="font-bold">{shifts.find(s => s.id === scannedBooking.shiftId)?.date}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500">رقم الهاتف</p>
                                        <p className="font-bold">{scannedBooking.phoneNumber}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500">حالة الحضور</p>
                                        <p className={`font-bold ${scannedBooking.attended ? 'text-red-600' : 'text-green-600'}`}>
                                            {scannedBooking.attended ? 'تم الدخول مسبقاً' : 'لم يدخل بعد'}
                                        </p>
                                    </div>
                                </div>

                                {scannedBooking.status === BookingStatus.CONFIRMED && !scannedBooking.attended && (
                                    <button 
                                        onClick={() => setConfirmationData({
                                            type: 'MARK_ATTENDED',
                                            id: scannedBooking.id,
                                            message: 'تأكيد دخول الطالب للقاعة؟',
                                            buttonColor: 'bg-green-600'
                                        })}
                                        className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 transition flex items-center justify-center gap-2 mt-4"
                                    >
                                        <UserCheck size={20} />
                                        تسجيل دخول الطالب (Check-In)
                                    </button>
                                )}

                                {scannedBooking.attended && (
                                    <div className="bg-red-100 text-red-700 p-3 rounded-lg text-center font-bold mt-4 flex items-center justify-center gap-2">
                                        <AlertTriangle size={20} />
                                        تنبيه: هذا الطالب تم تسجيل دخوله بالفعل!
                                    </div>
                                )}
                             </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
      ) : activeTab === 'admins' && currentUserRole === 'super_admin' ? (
        /* ADMIN MANAGEMENT TAB (Super Admin Only) */
        <div className="bg-white rounded-xl shadow-lg overflow-hidden animate-fade-in">
           <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
            <div>
                <h3 className="font-bold text-lg text-gray-800">إدارة المسؤولين</h3>
                <p className="text-xs text-gray-500">هذه القائمة مرئية لك فقط بصفتك المسؤول الرئيسي</p>
            </div>
            <button 
              onClick={() => setIsAdminModalOpen(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2 font-bold text-sm"
            >
              <Plus size={18} />
              إضافة مسؤول جديد
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-right">
              <thead className="bg-gray-100 text-gray-600 font-bold">
                <tr>
                  <th className="p-4">الاسم</th>
                  <th className="p-4">البريد الإلكتروني / الهاتف</th>
                  <th className="p-4">تاريخ الإضافة</th>
                  <th className="p-4 text-center">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {adminList.map((admin) => (
                  <tr key={admin.id} className="hover:bg-blue-50 transition">
                    <td className="p-4 font-bold text-gray-800">{admin.name}</td>
                    <td className="p-4">{admin.email}</td>
                    <td className="p-4 text-gray-500" dir="ltr">{admin.createdAt?.split('T')[0]}</td>
                    <td className="p-4">
                      <div className="flex justify-center gap-2">
                        <button 
                          onClick={() => setConfirmationData({
                            type: 'DELETE_ADMIN',
                            id: admin.id,
                            message: 'هل أنت متأكد من حذف هذا المسؤول؟ سيفقد صلاحية الوصول فوراً.',
                            buttonColor: 'bg-red-600'
                          })}
                          className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition"
                          title="حذف الصلاحية"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {adminList.length === 0 && (
                   <tr><td colSpan={4} className="p-8 text-center text-gray-500">لا يوجد مسؤولين آخرين. أنت المسؤول الوحيد.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* SHIFTS MANAGEMENT TAB */
        <div className="bg-white rounded-xl shadow-lg overflow-hidden animate-fade-in">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
            <h3 className="font-bold text-lg text-gray-800">جدول المواعيد المتاحة</h3>
            <button 
              onClick={openAddModal}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2 font-bold text-sm"
            >
              <Plus size={18} />
              إضافة موعد جديد
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-right">
              <thead className="bg-gray-100 text-gray-600 font-bold">
                <tr>
                  <th className="p-4">التاريخ</th>
                  <th className="p-4">الوقت</th>
                  <th className="p-4">السعر</th>
                  <th className="p-4">السعة (المحجوز)</th>
                  <th className="p-4">الحالة</th>
                  <th className="p-4 text-center">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {shifts.map((shift) => (
                  <tr key={shift.id} className="hover:bg-blue-50 transition">
                    <td className="p-4 font-bold text-gray-800">{shift.date}</td>
                    <td className="p-4 font-mono">{shift.startTime} - {shift.endTime}</td>
                    <td className="p-4 text-green-700 font-bold">{shift.price} ج.م</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${shift.booked >= shift.capacity ? 'bg-red-500' : 'bg-blue-500'}`} 
                            style={{ width: `${Math.min((shift.booked / shift.capacity) * 100, 100)}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-gray-500">{shift.booked} / {shift.capacity}</span>
                      </div>
                    </td>
                    <td className="p-4">
                       {shift.booked >= shift.capacity ? (
                         <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs">مكتمل</span>
                       ) : (
                         <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs">متاح</span>
                       )}
                    </td>
                    <td className="p-4">
                      <div className="flex justify-center gap-2">
                        <button 
                          onClick={() => openEditModal(shift)}
                          className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition"
                          title="تعديل"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button 
                          onClick={() => setConfirmationData({
                            type: 'DELETE_SHIFT',
                            id: shift.id,
                            message: 'هل أنت متأكد؟ سيتم حذف هذا الموعد وجميع الحجوزات المرتبطة به نهائياً.',
                            buttonColor: 'bg-red-600'
                          })}
                          className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition"
                          title="حذف"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {shifts.length === 0 && (
                   <tr><td colSpan={6} className="p-8 text-center text-gray-500">لا توجد مواعيد مضافة حالياً</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add/Edit Shift Modal */}
      {isShiftModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden relative">
            <button 
              onClick={() => setIsShiftModalOpen(false)}
              className="absolute top-4 left-4 text-gray-400 hover:text-gray-600 transition"
            >
              <X size={24} />
            </button>
            <div className="p-6">
              <h3 className="text-xl font-bold mb-4 text-gray-800">
                {editingShift ? 'تعديل موعد' : 'إضافة موعد جديد'}
              </h3>
              <form onSubmit={handleShiftSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">التاريخ</label>
                  <input 
                    type="date" 
                    required
                    value={shiftFormData.date}
                    onChange={(e) => setShiftFormData({...shiftFormData, date: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none bg-white text-gray-900"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">من</label>
                    <input 
                      type="time" 
                      required
                      value={shiftFormData.startTime}
                      onChange={(e) => setShiftFormData({...shiftFormData, startTime: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none bg-white text-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">إلى</label>
                    <input 
                      type="time" 
                      required
                      value={shiftFormData.endTime}
                      onChange={(e) => setShiftFormData({...shiftFormData, endTime: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none bg-white text-gray-900"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">السعة (عدد الطلاب)</label>
                    <input 
                      type="number" 
                      required
                      min="1"
                      value={shiftFormData.capacity}
                      onChange={(e) => setShiftFormData({...shiftFormData, capacity: parseInt(e.target.value)})}
                      className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none bg-white text-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">السعر (ج.م)</label>
                    <input 
                      type="number" 
                      required
                      min="0"
                      value={shiftFormData.price}
                      onChange={(e) => setShiftFormData({...shiftFormData, price: parseInt(e.target.value)})}
                      className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none bg-white text-gray-900"
                    />
                  </div>
                </div>
                <button 
                  type="submit" 
                  className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition flex justify-center items-center gap-2 mt-4"
                >
                  <Save size={18} />
                  {editingShift ? 'حفظ التعديلات' : 'إضافة الموعد'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Add Admin Modal */}
      {isAdminModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden relative">
             <button 
              onClick={() => setIsAdminModalOpen(false)}
              className="absolute top-4 left-4 text-gray-400 hover:text-gray-600 transition"
            >
              <X size={24} />
            </button>
            <div className="p-8">
               <h3 className="text-xl font-bold mb-6 text-gray-800 flex items-center gap-2">
                 <ShieldCheck className="text-blue-600" />
                 إنشاء حساب مسؤول جديد
               </h3>
               <form onSubmit={handleAddAdminSubmit} className="space-y-4">
                   <div>
                       <label className="block text-sm font-medium text-gray-700 mb-1">الاسم</label>
                       <input 
                           type="text" 
                           required 
                           value={newAdminData.name}
                           onChange={(e) => setNewAdminData({...newAdminData, name: e.target.value})}
                           className="w-full border border-gray-300 rounded-lg p-2 outline-none focus:border-blue-500 bg-white text-gray-900"
                       />
                   </div>
                   <div>
                       <label className="block text-sm font-medium text-gray-700 mb-1">رقم الهاتف</label>
                       <input 
                           type="tel" 
                           required 
                           value={newAdminData.email}
                           onChange={(e) => setNewAdminData({...newAdminData, email: e.target.value})}
                           className="w-full border border-gray-300 rounded-lg p-2 outline-none focus:border-blue-500 bg-white text-gray-900 text-right"
                           dir="ltr"
                           placeholder="01xxxxxxxxx"
                       />
                   </div>
                   <div>
                       <label className="block text-sm font-medium text-gray-700 mb-1">كلمة المرور</label>
                       <div className="relative">
                          <input 
                              type={showAdminPassword ? "text" : "password"} 
                              required 
                              value={newAdminData.password}
                              onChange={(e) => setNewAdminData({...newAdminData, password: e.target.value})}
                              className="w-full border border-gray-300 rounded-lg p-2 outline-none focus:border-blue-500 bg-white text-gray-900"
                              dir="ltr"
                              minLength={6}
                          />
                          <button
                              type="button"
                              onClick={() => setShowAdminPassword(!showAdminPassword)}
                              className="absolute top-1/2 -translate-y-1/2 left-3 text-gray-400 hover:text-gray-600"
                          >
                              {showAdminPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                          </button>
                       </div>
                   </div>
                   <button 
                       type="submit" 
                       disabled={adminLoading}
                       className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition mt-4"
                   >
                       {adminLoading ? 'جاري الإنشاء...' : 'إنشاء الحساب'}
                   </button>
               </form>
            </div>
          </div>
        </div>
      )}

      {/* Booking Details Modal */}
      {viewingBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
           <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden relative max-h-[90vh] flex flex-col">
              <div className="p-4 border-b flex justify-between items-center bg-gray-50">
                 <h3 className="text-xl font-bold text-gray-800">تفاصيل الحجز #{viewingBooking.ticketNumber}</h3>
                 <button onClick={() => setViewingBooking(null)} className="text-gray-500 hover:text-gray-700">
                    <X size={24} />
                 </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6">
                 {/* Layout: Flex Row even on Mobile as requested - Strict Side-by-Side */}
                 <div className="flex flex-row gap-4 sm:gap-6">
                    {/* Text Details */}
                    <div className="flex-1 min-w-0 space-y-4 text-sm text-gray-700">
                       <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                          <h4 className="font-bold text-blue-600 mb-3 flex items-center gap-2"><UserIcon size={16}/> بيانات الطالب</h4>
                          <div className="grid grid-cols-1 gap-2">
                             <p className="flex justify-between border-b border-gray-100 pb-1"><span className="text-gray-500">الاسم:</span> <span className="font-bold text-gray-900">{viewingBooking.fullName}</span></p>
                             <p className="flex justify-between border-b border-gray-100 pb-1"><span className="text-gray-500">الهاتف:</span> <span className="font-bold text-gray-900" dir="ltr">{viewingBooking.phoneNumber}</span></p>
                             <p className="flex justify-between border-b border-gray-100 pb-1"><span className="text-gray-500">المجموعة:</span> <span className="font-bold text-gray-900">{viewingBooking.group}</span></p>
                             <p className="flex justify-between border-b border-gray-100 pb-1"><span className="text-gray-500">الأبلكيشن:</span> <span className="font-bold text-gray-900">{viewingBooking.applicationNumber}</span></p>
                             {viewingBooking.nationalId && <p className="flex justify-between"><span className="text-gray-500">الرقم القومي:</span> <span className="font-bold text-gray-900">{viewingBooking.nationalId}</span></p>}
                          </div>
                       </div>

                       <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                          <h4 className="font-bold text-blue-600 mb-3 flex items-center gap-2"><Calendar size={16}/> الموعد</h4>
                          <div className="grid grid-cols-1 gap-2">
                             {(() => {
                                const shift = shifts.find(s => s.id === viewingBooking.shiftId);
                                return shift ? (
                                    <>
                                        <p className="flex justify-between border-b border-gray-100 pb-1"><span className="text-gray-500">التاريخ:</span> <span className="font-bold text-gray-900">{shift.date}</span></p>
                                        <p className="flex justify-between border-b border-gray-100 pb-1"><span className="text-gray-500">الوقت:</span> <span className="font-bold text-gray-900" dir="ltr">{shift.startTime} - {shift.endTime}</span></p>
                                        <p className="flex justify-between"><span className="text-gray-500">السعر:</span> <span className="font-bold text-green-700">{shift.price} ج.م</span></p>
                                    </>
                                ) : <p className="text-red-500">الموعد غير موجود (محذوف)</p>;
                             })()}
                          </div>
                       </div>

                       <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                          <h4 className="font-bold text-purple-600 mb-3 flex items-center gap-2"><CreditCard size={16}/> بيانات الدفع</h4>
                          <div className="grid grid-cols-1 gap-2">
                             <p className="flex justify-between border-b border-gray-100 pb-1"><span className="text-gray-500">محول من:</span> <span className="font-bold text-gray-900" dir="ltr">{viewingBooking.senderPhone}</span></p>
                             <p className="flex justify-between"><span className="text-gray-500">عملية رقم:</span> <span className="font-mono text-gray-900">{viewingBooking.transactionId || '---'}</span></p>
                          </div>
                       </div>
                    </div>

                    {/* Image Section - Strict Side-by-Side */}
                    <div className="w-[120px] sm:w-[300px] flex-shrink-0 flex flex-col gap-2">
                        <div className="font-bold text-sm text-gray-500 mb-1">صورة الإيصال:</div>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg overflow-hidden bg-gray-50 shadow-sm relative group h-auto min-h-[200px] flex items-center justify-center">
                            {viewingBooking.receiptImage ? (
                                <a href={viewingBooking.receiptImage} target="_blank" rel="noopener noreferrer" className="block w-full h-full">
                                    <img 
                                        src={viewingBooking.receiptImage} 
                                        alt="Receipt" 
                                        className="w-full h-full object-contain hover:scale-105 transition duration-300"
                                    />
                                </a>
                            ) : (
                                <div className="text-gray-400 text-xs text-center p-2 flex flex-col items-center">
                                    <AlertTriangle size={24} className="mb-2" />
                                    لا توجد صورة
                                </div>
                            )}
                        </div>
                        {viewingBooking.receiptImage && (
                            <a 
                                href={viewingBooking.receiptImage} 
                                download={`receipt_${viewingBooking.ticketNumber}.png`}
                                className="text-center w-full bg-gray-800 text-white py-2 rounded text-xs hover:bg-gray-700 transition"
                            >
                                تحميل الصورة
                            </a>
                        )}
                    </div>
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* Unified Action Confirmation Modal */}
      {confirmationData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6 text-center">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${confirmationData.type.includes('DELETE') ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
              <AlertTriangle size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">تأكيد الإجراء</h3>
            <p className="text-gray-500 mb-6">{confirmationData.message}</p>
            <div className="flex gap-3 justify-center">
              <button 
                onClick={() => setConfirmationData(null)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
              >
                إلغاء
              </button>
              <button 
                onClick={confirmAction}
                className={`px-4 py-2 text-white rounded-lg transition ${confirmationData.buttonColor}`}
              >
                نعم، نفذ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const AppWrapper = () => {
  const [user, setUser] = useState<User | null>(null);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [bookings, setBookings] = useState<BookingDetails[]>([]);
  const [admins, setAdmins] = useState<AdminData[]>([]);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Data Listeners
  useEffect(() => {
    const shiftsRef = db.ref('shifts');
    const bookingsRef = db.ref('bookings');
    const adminsRef = db.ref('admins');

    const handleShifts = (snapshot: any) => {
      const data = snapshot.val();
      const loadedShifts: Shift[] = [];
      for (const id in data) {
        loadedShifts.push({ id, ...data[id] });
      }
      setShifts(loadedShifts);
    };

    const handleBookings = (snapshot: any) => {
      const data = snapshot.val();
      const loadedBookings: BookingDetails[] = [];
      for (const id in data) {
        // Ensure ID is set correctly to the key
        loadedBookings.push({ ...data[id], id: id }); 
      }
      setBookings(loadedBookings.reverse()); // Newest first
    };

    const handleAdmins = (snapshot: any) => {
        const data = snapshot.val();
        const loadedAdmins: AdminData[] = [];
        for (const id in data) {
            loadedAdmins.push({ id, ...data[id] });
        }
        setAdmins(loadedAdmins);
    };

    shiftsRef.on('value', handleShifts);
    bookingsRef.on('value', handleBookings);
    adminsRef.on('value', handleAdmins);

    return () => {
      shiftsRef.off('value', handleShifts);
      bookingsRef.off('value', handleBookings);
      adminsRef.off('value', handleAdmins);
    };
  }, []);

  // Auth Listener with Admin Check
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((firebaseUser) => {
      if (firebaseUser) {
        // Check if super admin (Hardcoded original owner)
        const isSuperAdmin = firebaseUser.email === '01205168851@examhall.com';
        
        // Check if regular admin (In database)
        // We use the already loaded admins state if available, but inside this callback we might need to fetch if state isn't ready
        // Ideally we should wait for admins to load, but for simplicity we'll assume admins loaded fast or check efficiently
        // Since `admins` state might be stale in this closure, we rely on the realtime listener updating the UI
        // But for setting the user object initially, we can do a quick check against the DB if needed, 
        // OR simpler: just update the user state whenever admins state changes (separate effect).
        
        let role: 'super_admin' | 'admin' | 'user' = 'user';
        if (isSuperAdmin) {
            role = 'super_admin';
        } 
        
        setUser({
          uid: firebaseUser.uid,
          displayName: firebaseUser.displayName,
          email: firebaseUser.email,
          phoneNumber: firebaseUser.phoneNumber, 
          isAdmin: false, // Will be updated by effect below
          role: role
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Sync Admin Role with Database
  useEffect(() => {
      if (user) {
          const isSuperAdmin = user.email === '01205168851@examhall.com';
          const isSubAdmin = admins.some(a => a.email.toLowerCase() === user.email?.toLowerCase());
          
          let newRole = user.role;
          let isAdmin = false;

          if (isSuperAdmin) {
              newRole = 'super_admin';
              isAdmin = true;
          } else if (isSubAdmin) {
              newRole = 'admin';
              isAdmin = true;
          }

          if (user.role !== newRole || user.isAdmin !== isAdmin) {
              setUser(prev => prev ? ({ ...prev, role: newRole as any, isAdmin }) : null);
          }
      }
  }, [admins, user?.email]); // Re-run when admins list changes

  const handleBook = async (booking: BookingDetails): Promise<string> => {
    // 1. Get a ticket number using a transaction
    const counterRef = db.ref('metadata/ticketCounter');
    let ticketNumber = 1000;
    
    await counterRef.transaction((currentValue) => {
      return (currentValue || 1000) + 1;
    }, (error, committed, snapshot) => {
      if (committed && snapshot) {
        ticketNumber = snapshot.val();
      }
    });

    // 2. Prepare booking data
    // Remove the 'id' field if it exists to avoid saving empty string as part of object
    const { id, ...bookingData } = booking;
    const finalBooking = {
      ...bookingData,
      ticketNumber: ticketNumber,
      createdAt: new Date().toISOString()
    };

    // 3. Save booking
    const newBookingRef = db.ref('bookings').push();
    await newBookingRef.set(finalBooking);

    // 4. Update shift capacity
    const shiftRef = db.ref(`shifts/${booking.shiftId}`);
    shiftRef.transaction((shift) => {
      if (shift) {
        shift.booked = (shift.booked || 0) + 1;
      }
      return shift;
    });

    return newBookingRef.key as string;
  };

  const handleStatusChange = async (id: string, status: BookingStatus) => {
     if (!id) return;
     
     const booking = bookings.find(b => b.id === id);
     if (!booking) return;

     const oldStatus = booking.status;
     
     // Update status
     await db.ref(`bookings/${id}`).update({ status });

     // Handle capacity adjustments if status changes affect it
     if (oldStatus !== BookingStatus.REJECTED && status === BookingStatus.REJECTED) {
         // Free up spot
         db.ref(`shifts/${booking.shiftId}/booked`).transaction(booked => (booked || 0) - 1);
     } else if (oldStatus === BookingStatus.REJECTED && status !== BookingStatus.REJECTED) {
         // Take spot back
         db.ref(`shifts/${booking.shiftId}/booked`).transaction(booked => (booked || 0) + 1);
     }
  };

  const handleDeleteBooking = async (id: string) => {
    if (!id) return;
    const booking = bookings.find(b => b.id === id);
    if (booking) {
        // If it wasn't rejected, it was taking up a spot. Free it.
        if (booking.status !== BookingStatus.REJECTED) {
            db.ref(`shifts/${booking.shiftId}/booked`).transaction(booked => (booked || 0) - 1);
        }
        await db.ref(`bookings/${id}`).remove();
    }
  };

  const handleMarkAttended = async (id: string) => {
      if (!id) return;
      await db.ref(`bookings/${id}`).update({ attended: true });
  };

  const handleAddShift = async (shiftData: any) => {
      await db.ref('shifts').push({ ...shiftData, booked: 0 });
  };

  const handleUpdateShift = async (shift: Shift) => {
      const { id, ...data } = shift;
      await db.ref(`shifts/${id}`).update(data);
  };

  const handleDeleteShift = async (id: string) => {
      // Logic to delete bookings for this shift could be added here, 
      // but for now just delete the shift.
      await db.ref(`shifts/${id}`).remove();
  };

  // --- ADMIN MANAGEMENT HANDLERS ---
  const handleAddAdmin = async (name: string, email: string, password: string) => {
      // 1. Create User in Firebase Auth using a secondary app instance
      // This prevents the current Super Admin from being logged out
      const secondaryApp = firebase.initializeApp(firebaseConfig, "Secondary");
      
      try {
          const userCredential = await secondaryApp.auth().createUserWithEmailAndPassword(email, password);
          if (userCredential.user) {
              await userCredential.user.updateProfile({ displayName: name });
              
              // 2. Add to 'admins' database
              await db.ref('admins').push({
                  email: email,
                  name: name,
                  createdAt: new Date().toISOString()
              });
          }
      } catch (error: any) {
          if (error.code === 'auth/email-already-in-use') {
             // If user exists, just add them to the admins table (grant access)
             // But we can't set their password.
             // For this simple implementation, we assume we want to create new users.
             throw new Error("هذا البريد الإلكتروني مسجل بالفعل.");
          }
          throw error;
      } finally {
          // Clean up secondary app
          secondaryApp.delete();
      }
  };

  const handleDeleteAdmin = async (id: string) => {
      // We only remove from the DB, essentially revoking access.
      // Deleting the actual Auth user requires Cloud Functions or Admin SDK which we can't use on client-side easily.
      await db.ref(`admins/${id}`).remove();
  };

  const logout = () => {
    auth.signOut();
  };

  if (loading) return <div className="flex items-center justify-center h-screen"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div></div>;

  return (
    <HashRouter>
      <div className="min-h-screen bg-gray-50 font-sans text-right" dir="rtl">
        <Navbar user={user} onLogout={logout} onLoginClick={() => setIsAuthOpen(true)} />
        
        <Routes>
          <Route path="/" element={
            <>
              <HomePage />
              <Footer />
            </>
          } />
          
          <Route path="/book" element={
            <>
              <div className="py-12 px-4">
                   <BookingWizard shifts={shifts} onBook={handleBook} />
                </div>
                <Footer />
            </>
          } />
          
          <Route path="/admin" element={
            user?.isAdmin ? (
               <AdminDashboard 
                 bookings={bookings} 
                 shifts={shifts}
                 adminList={admins}
                 currentUserRole={user.role}
                 onStatusChange={handleStatusChange}
                 onDeleteBooking={handleDeleteBooking}
                 onAddShift={handleAddShift}
                 onUpdateShift={handleUpdateShift}
                 onDeleteShift={handleDeleteShift}
                 onMarkAttended={handleMarkAttended}
                 onAddAdmin={handleAddAdmin}
                 onDeleteAdmin={handleDeleteAdmin}
               />
            ) : (
               <div className="h-[80vh] flex flex-col items-center justify-center">
                   <h2 className="text-2xl font-bold text-gray-800 mb-4">يجب تسجيل الدخول كمسؤول للوصول لهذه الصفحة</h2>
                   <button 
                     onClick={() => setIsAuthOpen(true)}
                     className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold"
                   >
                     تسجيل الدخول
                   </button>
               </div>
            )
          } />
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

        <AuthModal 
          isOpen={isAuthOpen} 
          onClose={() => setIsAuthOpen(false)} 
          onSuccess={() => setIsAuthOpen(false)}
        />
      </div>
    </HashRouter>
  );
};

export default AppWrapper;
