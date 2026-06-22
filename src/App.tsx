import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Building, 
  GraduationCap, 
  Users, 
  BookOpen, 
  Wallet, 
  Package, 
  FileText, 
  Settings, 
  Menu, 
  X, 
  LogOut, 
  Bell, 
  BookMarked,
  Landmark,
  ShieldAlert,
  Download,
  Megaphone,
  Mail
} from 'lucide-react';

// Types and Mocks
import { 
  InstitutionProfile, 
  Student, 
  Alumni,
  Teacher, 
  Subject, 
  FinancialTransaction, 
  SppPayment, 
  Asset, 
  DocumentLetter, 
  SystemConfig,
  KalenderEvent
} from './types';
import { 
  initialProfile, 
  initialTeachers, 
  initialStudents, 
  initialAlumni,
  initialSubjects, 
  initialTransactions, 
  initialSppPayments, 
  initialAssets, 
  initialLetters, 
  initialConfig,
  initialKalenderEvents
} from './mockData';

// Views
import DashboardView from './components/DashboardView';
import ProfilLembagaView from './components/ProfilLembagaView';
import KurikulumView from './components/KurikulumView';
import KesiswaanView from './components/KesiswaanView';
import KeuanganView from './components/KeuanganView';
import KepegawaianView from './components/KepegawaianView';
import SaranaView from './components/SaranaView';
import HumasSuratView from './components/HumasSuratView';
import HumasView from './components/HumasView';
import PengaturanView from './components/PengaturanView';
import { User } from 'firebase/auth';
import { initAuth, getAccessToken, appendStudentsToSpreadsheet } from './lib/googleAuth';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);

  // Core Persistent State
  const [profile, setProfile] = useState<InstitutionProfile>(initialProfile);
  const [students, setStudents] = useState<Student[]>(initialStudents);
  const [alumni, setAlumni] = useState<Alumni[]>(initialAlumni);
  const [teachers, setTeachers] = useState<Teacher[]>(initialTeachers);
  const [subjects, setSubjects] = useState<Subject[]>(initialSubjects);
  const [transactions, setTransactions] = useState<FinancialTransaction[]>(initialTransactions);
  const [sppPayments, setSppPayments] = useState<SppPayment[]>(initialSppPayments);
  const [assets, setAssets] = useState<Asset[]>(initialAssets);
  const [letters, setLetters] = useState<DocumentLetter[]>(initialLetters);
  const [config, setConfig] = useState<SystemConfig>(initialConfig);
  const [kalenderEvents, setKalenderEvents] = useState<KalenderEvent[]>(initialKalenderEvents);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');
  const [activeRole, setActiveRole] = useState<'Superuser' | 'Bendahara' | 'Tata Usaha'>('Superuser');

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [googleToken, setGoogleToken] = useState<string | null>(null);

  // Initialize from LocalStorage
  useEffect(() => {
    const savedProfile = localStorage.getItem('madrasah_profile');
    if (savedProfile) setProfile(JSON.parse(savedProfile));

    const savedStudents = localStorage.getItem('madrasah_students');
    if (savedStudents) setStudents(JSON.parse(savedStudents));

    const savedAlumni = localStorage.getItem('madrasah_alumni');
    if (savedAlumni) setAlumni(JSON.parse(savedAlumni));

    const savedTeachers = localStorage.getItem('madrasah_teachers');
    if (savedTeachers) setTeachers(JSON.parse(savedTeachers));

    const savedSubjects = localStorage.getItem('madrasah_subjects');
    if (savedSubjects) setSubjects(JSON.parse(savedSubjects));

    const savedTransactions = localStorage.getItem('madrasah_transactions');
    if (savedTransactions) setTransactions(JSON.parse(savedTransactions));

    const savedSpp = localStorage.getItem('madrasah_sppPayments');
    if (savedSpp) setSppPayments(JSON.parse(savedSpp));

    const savedAssets = localStorage.getItem('madrasah_assets');
    if (savedAssets) setAssets(JSON.parse(savedAssets));

    const savedLetters = localStorage.getItem('madrasah_letters');
    if (savedLetters) setLetters(JSON.parse(savedLetters));

    const savedConfig = localStorage.getItem('madrasah_config');
    if (savedConfig) setConfig(JSON.parse(savedConfig));

    const savedKalender = localStorage.getItem('madrasah_kalender');
    if (savedKalender) setKalenderEvents(JSON.parse(savedKalender));

    const unsubscribe = initAuth(
      (user, token) => {
        setCurrentUser(user);
        setGoogleToken(token);
      },
      () => {
        setCurrentUser(null);
        setGoogleToken(null);
      }
    );
    return () => unsubscribe();
  }, []);

  // Daily Backup Reminder Logic
  useEffect(() => {
    if (config.autoBackupEnabled) {
      const today = new Date().toISOString().split('T')[0];
      if (config.lastBackupDate !== today) {
        setTimeout(() => {
          if (confirm('Berdasarkan pengaturan Pengingat Auto-Backup Anda, disarankan untuk mem-backup data hari ini. Unduh backup sekarang?')) {
            handleExportBackup();
            const updatedConfig = { ...config, lastBackupDate: today };
            setConfig(updatedConfig);
            saveToStorage('madrasah_config', updatedConfig);
          }
        }, 3000);
      }
    }
  }, [config.autoBackupEnabled, config.lastBackupDate]);

  // Save changes to localStorage on any state changes
  const saveToStorage = (key: string, data: any) => {
    localStorage.setItem(key, JSON.stringify(data));
  };

  const checkAccess = (allowedRoles: string[]) => {
    if (activeRole === 'Superuser') return true;
    if (!allowedRoles.includes(activeRole)) {
      alert(`Akses Ditolak: Anda login sebagai "${activeRole}". Operasi ini hanya untuk role: ${allowedRoles.join(' / ')}.`);
      return false;
    }
    return true;
  };

  const handleUpdateProfile = (updated: InstitutionProfile) => {
    if (!checkAccess(['Superuser', 'Tata Usaha'])) return;
    setProfile(updated);
    saveToStorage('madrasah_profile', updated);
  };

  // Student State Methods
  const triggerAppsScriptSync = async (data: Student | Student[], url: string) => {
    setSyncStatus('syncing');
    try {
      const payload = Array.isArray(data) ? data : [data];
      await fetch(url, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify(payload)
      });
      setSyncStatus('success');
      setTimeout(() => setSyncStatus('idle'), 4000);
    } catch (err) {
      console.error('Error syncing student data to Google Sheets:', err);
      setSyncStatus('error');
      setTimeout(() => setSyncStatus('idle'), 5000);
    }
  };

  const triggerGoogleSheetsSync = async (data: Student | Student[], spreadsheetId: string) => {
    setSyncStatus('syncing');
    try {
      const token = googleToken || getAccessToken();
      if (!token) {
        alert("Otorisasi Google tidak aktif. Harap hubungkan akun Google Anda kembali di menu Pengaturan!");
        setSyncStatus('error');
        setTimeout(() => setSyncStatus('idle'), 4000);
        return;
      }
      const payload = Array.isArray(data) ? data : [data];
      await appendStudentsToSpreadsheet(token, spreadsheetId, payload);
      setSyncStatus('success');
      setTimeout(() => setSyncStatus('idle'), 4000);
    } catch (err: any) {
      console.error('Error syncing student data to Google Sheets API:', err);
      setSyncStatus('error');
      setTimeout(() => setSyncStatus('idle'), 5000);
    }
  };

  const handleAddStudent = (student: Student) => {
    if (!checkAccess(['Superuser', 'Tata Usaha'])) return;
    const next = [student, ...students];
    setStudents(next);
    saveToStorage('madrasah_students', next);
    
    if (config.autoSyncToSheets) {
      if ((!config.googleSyncType || config.googleSyncType === 'native') && config.googleSpreadsheetId) {
        triggerGoogleSheetsSync(student, config.googleSpreadsheetId);
      } else if (config.googleSyncType === 'script' && config.appsScriptUrl) {
        triggerAppsScriptSync(student, config.appsScriptUrl);
      }
    }
  };

  const handleUpdateStudent = (updated: Student) => {
    if (!checkAccess(['Superuser', 'Tata Usaha'])) return;
    const next = students.map(s => s.id === updated.id ? updated : s);
    setStudents(next);
    saveToStorage('madrasah_students', next);
  };

  const handleDeleteStudent = (id: string) => {
    if (!checkAccess(['Superuser', 'Tata Usaha'])) return;
    if (confirm('Apakah Anda yakin ingin menghapus siswa ini dari database?')) {
      const next = students.filter(s => s.id !== id);
      setStudents(next);
      saveToStorage('madrasah_students', next);
    }
  };

  // Alumni State Methods
  const handleAddAlumni = (newAlum: Alumni) => {
    if (!checkAccess(['Superuser', 'Tata Usaha'])) return;
    const next = [newAlum, ...alumni];
    setAlumni(next);
    saveToStorage('madrasah_alumni', next);
  };

  const handleUpdateAlumni = (updated: Alumni) => {
    if (!checkAccess(['Superuser', 'Tata Usaha'])) return;
    const next = alumni.map(a => a.id === updated.id ? updated : a);
    setAlumni(next);
    saveToStorage('madrasah_alumni', next);
  };

  const handleDeleteAlumni = (id: string) => {
    if (!checkAccess(['Superuser', 'Tata Usaha'])) return;
    if (confirm('Apakah Anda yakin ingin menghapus alumni ini dari direktori?')) {
      const next = alumni.filter(a => a.id !== id);
      setAlumni(next);
      saveToStorage('madrasah_alumni', next);
    }
  };

  // Teacher State Methods
  const handleAddTeacher = (teacher: Teacher) => {
    if (!checkAccess(['Superuser', 'Tata Usaha'])) return;
    const next = [teacher, ...teachers];
    setTeachers(next);
    saveToStorage('madrasah_teachers', next);
  };

  const handleUpdateTeacher = (updated: Teacher) => {
    if (!checkAccess(['Superuser', 'Tata Usaha'])) return;
    const next = teachers.map(t => t.id === updated.id ? updated : t);
    setTeachers(next);
    saveToStorage('madrasah_teachers', next);
  };

  const handleDeleteTeacher = (id: string) => {
    if (!checkAccess(['Superuser', 'Tata Usaha'])) return;
    if (confirm('Apakah Anda yakin menghapus guru/staff ini?')) {
      const next = teachers.filter(t => t.id !== id);
      setTeachers(next);
      saveToStorage('madrasah_teachers', next);
    }
  };

  // Subject State Methods
  const handleAddSubject = (subject: Subject) => {
    if (!checkAccess(['Superuser', 'Tata Usaha'])) return;
    const next = [subject, ...subjects];
    setSubjects(next);
    saveToStorage('madrasah_subjects', next);
  };

  const handleDeleteSubject = (id: string) => {
    if (!checkAccess(['Superuser', 'Tata Usaha'])) return;
    if (confirm('Apakah Anda yakin menghapus mata pelajaran ini?')) {
      const next = subjects.filter(sub => sub.id !== id);
      setSubjects(next);
      saveToStorage('madrasah_subjects', next);
    }
  };

  // Kalender Event Methods
  const handleAddKalenderEvent = (event: KalenderEvent) => {
    if (!checkAccess(['Superuser', 'Tata Usaha'])) return;
    const next = [...kalenderEvents, event];
    setKalenderEvents(next);
    saveToStorage('madrasah_kalender', next);
  };

  const handleDeleteKalenderEvent = (id: string) => {
    if (!checkAccess(['Superuser', 'Tata Usaha'])) return;
    if (confirm('Apakah Anda yakin menghapus event kalender ini?')) {
      const next = kalenderEvents.filter(ev => ev.id !== id);
      setKalenderEvents(next);
      saveToStorage('madrasah_kalender', next);
    }
  };

  // Financial State Methods
  const handleAddTransaction = (tx: FinancialTransaction) => {
    if (!checkAccess(['Superuser', 'Bendahara'])) return;
    const next = [tx, ...transactions];
    setTransactions(next);
    saveToStorage('madrasah_transactions', next);
  };

  const handleAddSppPayment = (pay: SppPayment) => {
    if (!checkAccess(['Superuser', 'Bendahara'])) return;
    const next = [pay, ...sppPayments];
    setSppPayments(next);
    saveToStorage('madrasah_sppPayments', next);
  };

  const handleUpdateSppStatus = (studentId: string, bulan: string, status: 'Lunas' | 'Belum Lunas') => {
    if (!checkAccess(['Superuser', 'Bendahara'])) return;
    const existingIndex = sppPayments.findIndex(p => p.studentId === studentId && p.bulan === bulan);
    let next: SppPayment[];
    
    if (existingIndex > -1) {
      next = [...sppPayments];
      next[existingIndex] = {
        ...next[existingIndex],
        status,
        tanggalBayar: status === 'Lunas' ? new Date().toISOString().split('T')[0] : undefined
      };
    } else {
      next = [
        ...sppPayments,
        {
          studentId,
          bulan,
          tahun: config.tahunAjaranAktif.split('/')[0],
          status,
          tanggalBayar: status === 'Lunas' ? new Date().toISOString().split('T')[0] : undefined,
          jumlah: 150000
        }
      ];
    }
    
    setSppPayments(next);
    saveToStorage('madrasah_sppPayments', next);
  };

  // Asset State Methods
  const handleAddAsset = (asset: Asset) => {
    if (!checkAccess(['Superuser', 'Tata Usaha'])) return;
    const next = [asset, ...assets];
    setAssets(next);
    saveToStorage('madrasah_assets', next);
  };

  const handleUpdateAsset = (updated: Asset) => {
    if (!checkAccess(['Superuser', 'Tata Usaha'])) return;
    const next = assets.map(a => a.id === updated.id ? updated : a);
    setAssets(next);
    saveToStorage('madrasah_assets', next);
  };

  const handleDeleteAsset = (id: string) => {
    if (!checkAccess(['Superuser', 'Tata Usaha'])) return;
    if (confirm('Hapus aset ini dari daftar inventaris?')) {
      const next = assets.filter(a => a.id !== id);
      setAssets(next);
      saveToStorage('madrasah_assets', next);
    }
  };

  // Letter State Methods
  const handleAddLetter = (letter: DocumentLetter) => {
    if (!checkAccess(['Superuser', 'Tata Usaha'])) return;
    const next = [letter, ...letters];
    setLetters(next);
    saveToStorage('madrasah_letters', next);
  };

  const handleDeleteLetter = (id: string) => {
    if (!checkAccess(['Superuser', 'Tata Usaha'])) return;
    if (confirm('Hapus registrasi surat ini dari arsip?')) {
      const next = letters.filter(l => l.id !== id);
      setLetters(next);
      saveToStorage('madrasah_letters', next);
    }
  };

  // Config State Methods
  const handleUpdateConfig = (updated: SystemConfig) => {
    if (!checkAccess(['Superuser'])) return;
    setConfig(updated);
    saveToStorage('madrasah_config', updated);
  };

  // Resets & Maintenance Methods
  const handleResetToMockData = () => {
    if (!checkAccess(['Superuser'])) return;
    localStorage.clear();
    setProfile(initialProfile);
    setStudents(initialStudents);
    setAlumni(initialAlumni);
    setTeachers(initialTeachers);
    setSubjects(initialSubjects);
    setTransactions(initialTransactions);
    setSppPayments(initialSppPayments);
    setAssets(initialAssets);
    setLetters(initialLetters);
    setConfig(initialConfig);
    setKalenderEvents(initialKalenderEvents);
  };

  const handlePurgeAllData = () => {
    if (!checkAccess(['Superuser'])) return;
    localStorage.clear();
    setProfile({
      nama: 'MTs Tanwiriyyah', nsm: '', npsn: '', akreditasi: '', alamat: '',
      desa: '', kecamatan: '', kabupaten: '', provinsi: '', kepalaMadrasah: '',
      nipKepala: '', kontak: '', email: '', visi: '', misi: [], sejarah: ''
    });
    setStudents([]);
    setAlumni([]);
    setTeachers([]);
    setSubjects([]);
    setTransactions([]);
    setSppPayments([]);
    setAssets([]);
    setLetters([]);
    setKalenderEvents([]);
    setConfig({
      tahunAjaranAktif: '2026/2027', semesterAktif: 'Ganjil',
      namaBendahara: '', nipBendahara: '', ttdKepalaNama: '', ttdKepalaJabatan: '',
      sambutanHeading: 'Selamat Datang', sambutanTeks: ''
    });
  };

  const handleExportBackup = () => {
    const payload = {
      profile, students, alumni, teachers, subjects, transactions, sppPayments, assets, letters, config, kalenderEvents
    };
    
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `backup_mts_tanwiriyyah_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Tab routing mapping
  const renderCurrentView = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <DashboardView 
            students={students} 
            teachers={teachers} 
            transactions={transactions} 
            assets={assets} 
            letters={letters}
            config={config}
            kalenderEvents={kalenderEvents}
            onNavigate={setActiveTab}
          />
        );
      case 'profil':
        return <ProfilLembagaView profile={profile} onUpdateProfile={handleUpdateProfile} />;
      case 'kurikulum':
        return <KurikulumView subjects={subjects} teachers={teachers} kalenderEvents={kalenderEvents} onAddSubject={handleAddSubject} onDeleteSubject={handleDeleteSubject} onAddKalenderEvent={handleAddKalenderEvent} onDeleteKalenderEvent={handleDeleteKalenderEvent} />;
      case 'kesiswaan':
        return (
          <KesiswaanView 
            students={students} 
            alumni={alumni}
            onAddStudent={handleAddStudent} 
            onUpdateStudent={handleUpdateStudent} 
            onDeleteStudent={handleDeleteStudent}
            onAddAlumni={handleAddAlumni}
            onUpdateAlumni={handleUpdateAlumni}
            onDeleteAlumni={handleDeleteAlumni}
            config={config}
            onBulkSyncToSheets={() => {
              const type = config.googleSyncType || 'native';
              if (type === 'native') {
                if (config.googleSpreadsheetId) {
                  triggerGoogleSheetsSync(students, config.googleSpreadsheetId);
                } else {
                  alert("Mohon atur ID Spreadsheet Google terlebih dahulu di menu Pengaturan!");
                }
              } else {
                if (config.appsScriptUrl) {
                  triggerAppsScriptSync(students, config.appsScriptUrl);
                } else {
                  alert("Mohon atur URL Google Apps Script Anda terlebih dahulu di menu Pengaturan!");
                }
              }
            }}
          />
        );
      case 'keuangan':
        return <KeuanganView transactions={transactions} students={students} sppPayments={sppPayments} config={config} onAddTransaction={handleAddTransaction} onAddSppPayment={handleAddSppPayment} onUpdateSppStatus={handleUpdateSppStatus} />;
      case 'kepegawaian':
        return <KepegawaianView teachers={teachers} onAddTeacher={handleAddTeacher} onUpdateTeacher={handleUpdateTeacher} onDeleteTeacher={handleDeleteTeacher} />;
      case 'sarana':
        return <SaranaView assets={assets} onAddAsset={handleAddAsset} onUpdateAsset={handleUpdateAsset} onDeleteAsset={handleDeleteAsset} />;
      case 'humas':
        return <HumasView students={students} teachers={teachers} config={config} />;
      case 'persuratan':
        return <HumasSuratView letters={letters} students={students} teachers={teachers} config={config} onAddLetter={handleAddLetter} onDeleteLetter={handleDeleteLetter} />;
      case 'pengaturan':
        return <PengaturanView config={config} onUpdateConfig={handleUpdateConfig} onResetData={handleResetToMockData} onPurgeData={handlePurgeAllData} onExportBackup={handleExportBackup} />;
      default:
        return <div className="text-slate-400">Section not found.</div>;
    }
  };

  const getTabLabel = (id: string) => {
    switch (id) {
      case 'dashboard': return 'Dashboard';
      case 'profil': return 'Profil Lembaga';
      case 'kurikulum': return 'Kurikulum';
      case 'kesiswaan': return 'Kesiswaan';
      case 'keuangan': return 'Keuangan';
      case 'kepegawaian': return 'Kepegawaian / HR';
      case 'sarana': return 'Sarana & Prasarana';
      case 'humas': return 'Hubungan Masyarakat (Humas)';
      case 'persuratan': return 'Arsip & Persuratan';
      case 'pengaturan': return 'Pengaturan (OPM)';
      default: return '';
    }
  };

  return (
    <div id="school-core-framework" className="min-h-screen bg-slate-50 flex text-slate-900 antialiased font-sans">
      
      {/* LEFT NAVIGATION SIDEBAR */}
      <aside 
        id="framework-sidebar"
        className={`bg-slate-900 text-slate-100 flex flex-col transition-all duration-300 z-40 relative md:static shrink-0 ${sidebarOpen ? 'w-64 max-w-full' : 'w-0 md:w-20 overflow-hidden'}`}
      >
        {/* Title logo block */}
        <div className="h-16 px-5 border-b border-slate-800 flex items-center gap-3">
          <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center font-bold text-white text-md shadow-sm shrink-0 overflow-hidden" id="brand-logo-badge">
            {profile.logoUrl ? (
              <img src={profile.logoUrl} alt="Logo" className="w-full h-full object-cover" />
            ) : (
              <span className="text-emerald-400">T</span>
            )}
          </div>
          {sidebarOpen && (
            <div className="flex flex-col leading-none">
              <strong className="text-white font-bold leading-none tracking-tight block">TANWIRIYYAH</strong>
              <span className="text-emerald-400 text-[10px] uppercase font-bold tracking-widest mt-1 block">Integrated System</span>
            </div>
          )}
        </div>

        {/* Scrollable menu directory groups */}
        <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
          
          {/* GROUP 1: UTAMA */}
          <div className="space-y-1">
            {sidebarOpen && (
              <p className="text-slate-500 text-[10px] font-bold uppercase px-2 mb-3 tracking-wider">
                Utama
              </p>
            )}
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-xs font-semibold tracking-wide transition-all duration-150 group ${activeTab === 'dashboard' ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-600/30' : 'text-slate-400 hover:text-white hover:bg-slate-800/40'}`}
              id="sidebar-dashboard"
            >
              <LayoutDashboard size={16} className={`${activeTab === 'dashboard' ? 'text-emerald-400' : 'text-slate-400 group-hover:text-white transition-colors'}`} />
              {sidebarOpen && <span>Dashboard</span>}
            </button>
          </div>

          {/* GROUP 2: MODUL AKADEMIK */}
          <div className="space-y-1">
            {sidebarOpen && (
              <p className="text-slate-500 text-[10px] font-bold uppercase px-2 mb-3 tracking-wider">
                Modul Akademik
              </p>
            )}
            
            {/* Profil Lembaga */}
            <button
              onClick={() => setActiveTab('profil')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-xs font-semibold tracking-wide transition-all duration-150 group ${activeTab === 'profil' ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-600/30' : 'text-slate-400 hover:text-white hover:bg-slate-800/40'}`}
              id="sidebar-profil"
            >
              <Building size={16} className={`${activeTab === 'profil' ? 'text-emerald-400' : 'text-slate-400 group-hover:text-white transition-colors'}`} />
              {sidebarOpen && <span>Profil Lembaga</span>}
            </button>

            {/* Kurikulum */}
            <button
              onClick={() => setActiveTab('kurikulum')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-xs font-semibold tracking-wide transition-all duration-150 group ${activeTab === 'kurikulum' ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-600/30' : 'text-slate-400 hover:text-white hover:bg-slate-800/40'}`}
              id="sidebar-kurikulum"
            >
              <BookOpen size={16} className={`${activeTab === 'kurikulum' ? 'text-emerald-400' : 'text-slate-400 group-hover:text-white transition-colors'}`} />
              {sidebarOpen && <span>Kurikulum</span>}
            </button>

            {/* Kesiswaan */}
            <button
              onClick={() => setActiveTab('kesiswaan')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-xs font-semibold tracking-wide transition-all duration-150 group ${activeTab === 'kesiswaan' ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-600/30' : 'text-slate-400 hover:text-white hover:bg-slate-800/40'}`}
              id="sidebar-kesiswaan"
            >
              <Users size={16} className={`${activeTab === 'kesiswaan' ? 'text-emerald-400' : 'text-slate-400 group-hover:text-white transition-colors'}`} />
              {sidebarOpen && <span>Kesiswaan</span>}
            </button>
          </div>

          {/* GROUP 3: ADMINISTRASI & OPERASIONAL */}
          <div className="space-y-1">
            {sidebarOpen && (
              <p className="text-slate-500 text-[10px] font-bold uppercase px-2 mb-3 tracking-wider">
                Administrasi & Operasional
              </p>
            )}

            {/* Keuangan */}
            <button
              onClick={() => setActiveTab('keuangan')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-xs font-semibold tracking-wide transition-all duration-150 group ${activeTab === 'keuangan' ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-600/30' : 'text-slate-400 hover:text-white hover:bg-slate-800/40'}`}
              id="sidebar-keuangan"
            >
              <Wallet size={16} className={`${activeTab === 'keuangan' ? 'text-emerald-400' : 'text-slate-400 group-hover:text-white transition-colors'}`} />
              {sidebarOpen && <span>Keuangan</span>}
            </button>

            {/* Kepegawaian */}
            <button
              onClick={() => setActiveTab('kepegawaian')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-xs font-semibold tracking-wide transition-all duration-150 group ${activeTab === 'kepegawaian' ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-600/30' : 'text-slate-400 hover:text-white hover:bg-slate-800/40'}`}
              id="sidebar-kepegawaian"
            >
              <GraduationCap size={16} className={`${activeTab === 'kepegawaian' ? 'text-emerald-400' : 'text-slate-400 group-hover:text-white transition-colors'}`} />
              {sidebarOpen && <span>Kepegawaian</span>}
            </button>

            {/* Sarpras */}
            <button
              onClick={() => setActiveTab('sarana')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-xs font-semibold tracking-wide transition-all duration-150 group ${activeTab === 'sarana' ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-600/30' : 'text-slate-400 hover:text-white hover:bg-slate-800/40'}`}
              id="sidebar-sarana"
            >
              <Package size={16} className={`${activeTab === 'sarana' ? 'text-emerald-400' : 'text-slate-400 group-hover:text-white transition-colors'}`} />
              {sidebarOpen && <span>Sarana & Prasarana</span>}
            </button>

            {/* Humas */}
            <button
              onClick={() => setActiveTab('humas')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-xs font-semibold tracking-wide transition-all duration-150 group ${activeTab === 'humas' ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-600/30' : 'text-slate-400 hover:text-white hover:bg-slate-800/40'}`}
              id="sidebar-humas"
            >
              <Megaphone size={16} className={`${activeTab === 'humas' ? 'text-emerald-400' : 'text-slate-400 group-hover:text-white transition-colors'}`} />
              {sidebarOpen && <span>Humas</span>}
            </button>

            {/* Arsip & Persuratan */}
            <button
              onClick={() => setActiveTab('persuratan')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-xs font-semibold tracking-wide transition-all duration-150 group ${activeTab === 'persuratan' ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-600/30' : 'text-slate-400 hover:text-white hover:bg-slate-800/40'}`}
              id="sidebar-persuratan"
            >
              <FileText size={16} className={`${activeTab === 'persuratan' ? 'text-emerald-400' : 'text-slate-400 group-hover:text-white transition-colors'}`} />
              {sidebarOpen && <span>Arsip & Persuratan</span>}
            </button>
          </div>
        </nav>

        {/* Sidebar Footer credit panel */}
        <div className="p-4 border-t border-slate-800 space-y-3">
          <button
            onClick={() => setActiveTab('pengaturan')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-xs font-medium transition-all duration-150 ${activeTab === 'pengaturan' ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-600/30' : 'text-slate-400 hover:text-white hover:bg-slate-800/40'}`}
            id="sidebar-settings"
          >
            <Settings size={16} className={`${activeTab === 'pengaturan' ? 'text-emerald-400' : 'text-slate-400 hover:text-white'}`} />
            {sidebarOpen && <span>Pengaturan (OPM)</span>}
          </button>
          {sidebarOpen && (
            <div className="px-3 text-[10px] text-slate-500 leading-tight">
              <p className="font-semibold text-slate-400">SIAKAD Tanwiriyyah</p>
              <p className="opacity-75">Tahun Ajaran: {config.tahunAjaranAktif}</p>
            </div>
          )}
        </div>
      </aside>

      {/* CORE CONTENT RIG */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* TOP STATUS HEADER BAR */}
        <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between shadow-xs">
          
          {/* Header left: collapsible triggers and path routing info */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(prev => !prev)}
              className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-slate-50 rounded-lg transition-colors shrink-0"
              id="sidebar-toggle-trigger"
              title="Perkecil Navigasi"
            >
              <Menu size={20} />
            </button>
            <h1 className="text-lg font-semibold text-slate-800 tracking-tight" id="header-title-bar">
              {getTabLabel(activeTab)}
            </h1>
            <span className="hidden sm:inline-block px-2 py-0.5 bg-slate-100 text-slate-500 rounded text-xs font-medium shadow-2xs">
              Semester {config.semesterAktif} {config.tahunAjaranAktif}
            </span>
            {config.autoSyncToSheets && config.appsScriptUrl && (
              <span className="hidden lg:inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-blue-550/10 text-blue-400 border border-blue-500/20 rounded text-[10px] font-extrabold shadow-3xs select-none">
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse shrink-0"></span>
                Spreadsheet Auto-Run
              </span>
            )}
          </div>

          {/* Header right: info for system status */}
          <div className="flex items-center gap-6">
            <div className="relative cursor-pointer text-slate-400 hover:text-slate-600 transition-colors">
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 border-2 border-white rounded-full"></span>
              <Bell size={20} />
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden md:block text-right">
                <p className="text-sm font-semibold text-slate-700 leading-none">{profile.nama.length > 28 ? profile.nama.substring(0, 28) + '...' : profile.nama}</p>
                <select
                  value={activeRole}
                  onChange={(e) => setActiveRole(e.target.value as any)}
                  className="mt-1 text-[10px] text-emerald-600 uppercase font-bold tracking-widest bg-transparent cursor-pointer hover:bg-slate-50 focus:outline-none appearance-none pr-4 text-right"
                  title="Simulasi Hak Akses"
                >
                  <option value="Superuser">Superuser Access</option>
                  <option value="Bendahara">Akses Bendahara</option>
                  <option value="Tata Usaha">Akses Tata Usaha</option>
                </select>
              </div>
              <div className="w-10 h-10 rounded-full bg-emerald-100 border-2 border-emerald-200 flex items-center justify-center text-emerald-700 font-bold italic shadow-sm" id="user-avatar-circle">
                <span>{activeRole === 'Superuser' ? 'OP' : activeRole === 'Bendahara' ? 'BN' : 'TU'}</span>
              </div>
            </div>
          </div>

        </header>

        {/* CORE SCROLLABLE PORTAL CANVAS */}
        <main className="flex-1 overflow-y-auto p-8 max-w-7xl w-full mx-auto space-y-6">
          {renderCurrentView()}
        </main>

        {/* TOAST PANEL FOR REAL-TIME SPREADSHEET SYNC */}
        {syncStatus !== 'idle' && (
          <div className="fixed bottom-6 right-6 z-50 animate-fade-in select-none pointer-events-none text-left">
            {syncStatus === 'syncing' && (
              <div className="bg-slate-900 border border-slate-800 text-slate-200 px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 max-w-sm">
                <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-ping shrink-0"></div>
                <div className="flex-1">
                  <p className="text-xs font-bold font-sans">Menyelaraskan Spreadsheet...</p>
                  <p className="text-[10px] text-slate-400">Menyalin data ke Google Sheets secara real-time.</p>
                </div>
              </div>
            )}
            {syncStatus === 'success' && (
              <div className="bg-emerald-900/95 border border-emerald-700 text-emerald-100 px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 max-w-sm font-sans mb-2">
                <div className="w-5 h-5 bg-emerald-500 text-emerald-950 font-bold rounded-full flex items-center justify-center shrink-0 text-xs">✓</div>
                <div className="flex-1">
                  <p className="text-xs font-bold leading-none">Sinkronisasi Berhasil!</p>
                  <p className="text-[10px] text-emerald-350 mt-1 leading-normal">Data induk siswa telah terekam di Google Spreadsheet Anda.</p>
                </div>
              </div>
            )}
            {syncStatus === 'error' && (
              <div className="bg-rose-950/95 border border-rose-800 text-rose-100 px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 max-w-sm font-sans mb-2">
                <div className="w-5 h-5 bg-rose-500 text-rose-950 font-bold rounded-full flex items-center justify-center shrink-0 text-xs font-serif italic">!</div>
                <div className="flex-1">
                  <p className="text-xs font-bold leading-none">Sinkronisasi Gagal</p>
                  <p className="text-[10px] text-rose-350 mt-1 leading-normal">Terjadi kegagalan komunikasi dengan Web App Script Anda.</p>
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
