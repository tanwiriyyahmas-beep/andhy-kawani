import React, { useState } from 'react';
import { Student, Alumni, SystemConfig } from '../types';
import { Search, Plus, Filter, Edit, Trash, PlusCircle, UserCheck, Phone, Map, Users, CheckCircle, Upload, FileSpreadsheet, X, RefreshCw } from 'lucide-react';

interface KesiswaanViewProps {
  students: Student[];
  alumni: Alumni[];
  onAddStudent: (student: Student) => void;
  onUpdateStudent: (student: Student) => void;
  onDeleteStudent: (id: string) => void;
  onAddAlumni: (alum: Alumni) => void;
  onUpdateAlumni: (alum: Alumni) => void;
  onDeleteAlumni: (id: string) => void;
  config?: SystemConfig;
  onBulkSyncToSheets?: () => void;
}

export default function KesiswaanView({
  students,
  alumni = [],
  onAddStudent,
  onUpdateStudent,
  onDeleteStudent,
  onAddAlumni,
  onUpdateAlumni,
  onDeleteAlumni,
  config,
  onBulkSyncToSheets
}: KesiswaanViewProps) {
  const [activeSubTab, setActiveSubTab] = useState<'daftar' | 'absensi' | 'alumni'>('daftar');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterClass, setFilterClass] = useState('Semua');
  const [filterStatus, setFilterStatus] = useState('Semua');
  
  // Student Form Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  // Bulk Import Student State
  const [showImportModal, setShowImportModal] = useState(false);
  const [importText, setImportText] = useState('');
  const [importFeedback, setImportFeedback] = useState('');

  // Alumni Search / Filter State
  const [alumniSearch, setAlumniSearch] = useState('');
  const [alumniFilterStatus, setAlumniFilterStatus] = useState('Semua');
  const [alumniFilterYear, setAlumniFilterYear] = useState('Semua');
  const [showAlumniModal, setShowAlumniModal] = useState(false);
  const [editingAlumni, setEditingAlumni] = useState<Alumni | null>(null);

  // Alumni Form State
  const [alumniFormData, setAlumniFormData] = useState<Omit<Alumni, 'id'>>({
    nisn: '',
    nama: '',
    gender: 'Laki-laki',
    tahunLulus: '2025',
    statusPascaLulus: 'Melanjutkan Studi',
    detailInstansi: '',
    telepon: '',
    kesanPesan: ''
  });

  // Form State
  const [formData, setFormData] = useState<Omit<Student, 'id' | 'absensi'>>({
    nisn: '',
    nama: '',
    gender: 'Laki-laki',
    kelas: 'VII-A',
    tempatLahir: '',
    tanggalLahir: '',
    namaWali: '',
    teleponWali: '',
    alamat: '',
    status: 'Aktif'
  });

  // Extract unique classes dynamically
  const uniqueClasses = Array.from(new Set(students.map(s => s.kelas).filter(Boolean))).sort();

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.nama.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          student.nisn.includes(searchQuery);
    const matchesClass = filterClass === 'Semua' || student.kelas === filterClass;
    const matchesStatus = filterStatus === 'Semua' || student.status === filterStatus;
    return matchesSearch && matchesClass && matchesStatus;
  });

  // Calculate high level summaries
  const totalSiswa = students.length;
  const totalLaki = students.filter(s => s.gender === 'Laki-laki').length;
  const totalPerempuan = students.filter(s => s.gender === 'Perempuan').length;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nama || !formData.nisn || !formData.kelas) return;

    if (editingStudent) {
      // Update action
      onUpdateStudent({
        ...editingStudent,
        ...formData
      });
      setEditingStudent(null);
    } else {
      // Add action
      onAddStudent({
        id: 'S_' + Date.now(),
        ...formData,
        absensi: { hadir: 90, sakit: 0, izin: 0, alfa: 0 }
      });
    }

    // Reset Form
    setFormData({
      nisn: '',
      nama: '',
      gender: 'Laki-laki',
      kelas: 'VII-A',
      tempatLahir: '',
      tanggalLahir: '',
      namaWali: '',
      teleponWali: '',
      alamat: '',
      status: 'Aktif'
    });
    setShowAddModal(false);
  };

  const handleStartEdit = (student: Student) => {
    setEditingStudent(student);
    setFormData({
      nisn: student.nisn,
      nama: student.nama,
      gender: student.gender,
      kelas: student.kelas,
      tempatLahir: student.tempatLahir,
      tanggalLahir: student.tanggalLahir,
      namaWali: student.namaWali,
      teleponWali: student.teleponWali,
      alamat: student.alamat || '',
      status: student.status
    });
    setShowAddModal(true);
  };

  // Adjust roll-call statistics dynamically
  const incrementAbsensi = (studentId: string, type: 'hadir' | 'sakit' | 'izin' | 'alfa') => {
    const target = students.find(s => s.id === studentId);
    if (target) {
      const updated = {
        ...target,
        absensi: {
          ...target.absensi,
          [type]: target.absensi[type] + 1
        }
      };
      onUpdateStudent(updated);
    }
  };

  const getPercentageAttendance = (student: Student) => {
    const total = student.absensi.hadir + student.absensi.sakit + student.absensi.izin + student.absensi.alfa;
    if (total === 0) return 0;
    return Math.round((student.absensi.hadir / total) * 100);
  };

  // Alumni filtering & submission logic
  const filteredAlumni = alumni.filter(al => {
    const matchesSearch = al.nama.toLowerCase().includes(alumniSearch.toLowerCase()) || 
                          al.nisn.includes(alumniSearch);
    const matchesStatus = alumniFilterStatus === 'Semua' || al.statusPascaLulus === alumniFilterStatus;
    const matchesYear = alumniFilterYear === 'Semua' || al.tahunLulus === alumniFilterYear;
    return matchesSearch && matchesStatus && matchesYear;
  });

  const handleStartEditAlumni = (al: Alumni) => {
    setEditingAlumni(al);
    setAlumniFormData({
      nisn: al.nisn,
      nama: al.nama,
      gender: al.gender,
      tahunLulus: al.tahunLulus,
      statusPascaLulus: al.statusPascaLulus,
      detailInstansi: al.detailInstansi,
      telepon: al.telepon,
      kesanPesan: al.kesanPesan || ''
    });
    setShowAlumniModal(true);
  };

  const handleAlumniSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!alumniFormData.nama || !alumniFormData.nisn) return;

    if (editingAlumni) {
      onUpdateAlumni({
        ...editingAlumni,
        ...alumniFormData
      });
      setEditingAlumni(null);
    } else {
      onAddAlumni({
        id: 'AL_' + Date.now(),
        ...alumniFormData
      });
    }

    setShowAlumniModal(false);
  };

  const handleBulkImportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!importText.trim()) {
      setImportFeedback('Data kosong. Ketikkan atau tempelkan data terlebih dahulu.');
      return;
    }

    try {
      let parsedStudents: any[] = [];
      const trimmedText = importText.trim();
      
      if (trimmedText.startsWith('[') && trimmedText.endsWith(']')) {
        // Try JSON parsing
        const array = JSON.parse(trimmedText);
        if (Array.isArray(array)) {
          parsedStudents = array.map(item => ({
            nisn: String(item.nisn || '').trim(),
            nama: String(item.nama || '').trim(),
            gender: item.gender === 'Perempuan' || item.gender === 'P' || item.gender === 'perempuan' || item.genderChar === 'p' ? 'Perempuan' : 'Laki-laki',
            kelas: String(item.kelas || 'VII-A').trim(),
            tempatLahir: String(item.tempatLahir || 'Cianjur').trim(),
            tanggalLahir: String(item.tanggalLahir || '2013-01-01').trim(),
            namaWali: String(item.namaWali || 'Wali Santri').trim(),
            teleponWali: String(item.teleponWali || '0812-0000-0000').trim(),
            status: 'Aktif'
          }));
        }
      } else {
        // Parse CSV or Spreadsheet paste (tab / semicolon / comma delimited)
        const lines = trimmedText.split(/\r?\n/);
        for (const line of lines) {
          if (!line.trim()) continue;
          
          // Skip header rows if present
          if (line.toLowerCase().includes('nisn') || line.toLowerCase().includes('nama lengkap')) {
            continue;
          }

          const cols = line.split(/[,;\t]/);
          if (cols.length < 2) continue; // Needs at least NISN and name

          const nisn = cols[0] ? cols[0].trim() : '';
          const name = cols[1] ? cols[1].trim() : '';
          const genderInput = cols[2] ? cols[2].trim().toLowerCase() : 'l';
          const gender = (genderInput === 'perempuan' || genderInput === 'p' || genderInput === 'f' || genderInput === 'perempuan') ? 'Perempuan' as const : 'Laki-laki' as const;
          const kelas = cols[3] ? cols[3].trim() : 'VII-A';
          const tempatLahir = cols[4] ? cols[4].trim() : 'Cianjur';
          const tanggalLahir = cols[5] ? cols[5].trim() : '2013-01-01';
          const namaWali = cols[6] ? cols[6].trim() : 'Wali Santri';
          const teleponWali = cols[7] ? cols[7].trim() : '0812-0000-0000';

          if (nisn && name) {
            parsedStudents.push({
              nisn,
              nama: name,
              gender,
              kelas,
              tempatLahir,
              tanggalLahir,
              namaWali,
              teleponWali,
              status: 'Aktif' as const
            });
          }
        }
      }

      if (parsedStudents.length === 0) {
        setImportFeedback('Gagal memproses data. Mohon pastikan data terisi dengan benar (min. kolom NISN & Nama).');
        return;
      }

      let countAdded = 0;
      parsedStudents.forEach((stud, idx) => {
        // Prevent duplication of existing NISNs
        const alreadyExists = students.some(s => s.nisn === stud.nisn);
        if (!alreadyExists) {
          onAddStudent({
            id: 'S_' + (Date.now() + idx),
            ...stud,
            absensi: { hadir: 90, sakit: 0, izin: 0, alfa: 0 }
          });
          countAdded++;
        }
      });

      alert(`Sukses mengimpor ${countAdded} data siswa baru ke dalam database! ${parsedStudents.length - countAdded} data dilewati karena duplikasi NISN.`);
      setShowImportModal(false);
      setImportText('');
      setImportFeedback('');
    } catch (error: any) {
      setImportFeedback('Kesalahan parsing data: ' + error.message);
    }
  };

  const handleImportFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        if (evt.target?.result) {
          setImportText(evt.target.result as string);
        }
      };
      reader.readAsText(file);
    }
  };

  const handlePrintDirectory = () => {
    const printWin = window.open('', '_blank');
    if (printWin) {
      printWin.document.write(`
        <html>
          <head>
            <title>DIREKTORI ALUMNI & TRACER STUDY - TANWIRIYYAH</title>
            <style>
              body { font-family: 'Segoe UI', system-ui, sans-serif; padding: 40px; color: #1e293b; background-color: #fff; }
              .header { text-align: center; border-bottom: 3px double #0f766e; padding-bottom: 20px; margin-bottom: 30px; }
              .header h1 { font-size: 22px; color: #115e59; margin: 0 0 5px 0; text-transform: uppercase; font-weight: 800; letter-spacing: 0.5px; }
              .header p { font-size: 11px; color: #64748b; margin: 0; font-weight: 500; }
              table { width: 100%; border-collapse: collapse; margin-top: 10px; }
              th { background-color: #0f766e; color: white; padding: 10px 14px; text-align: left; font-size: 10px; text-transform: uppercase; letter-spacing: 1px; font-weight: bold; }
              td { padding: 12px 14px; border-bottom: 1px solid #e2e8f0; font-size: 11px; color: #334155; }
              tr:nth-child(even) { background-color: #f8fafc; }
              .font-mono { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; }
              .badge { display: inline-block; padding: 2px 7px; border-radius: 9999px; font-size: 9px; font-weight: 700; background-color: #f1f5f9; color: #475569; text-transform: uppercase; }
              .badge-studi { background-color: #e0f2fe; color: #0369a1; }
              .badge-pondok { background-color: #d1fae5; color: #065f46; }
              .badge-wira { background-color: #fef3c7; color: #92400e; }
              .footer { text-align: right; margin-top: 40px; font-size: 10px; color: #64748b; border-top: 1px solid #e2e8f0; padding-top: 15px; }
              .instansi { font-weight: 700; color: #0f766e; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>Madrasah Tsanawiyar Tanwiriyyah Cianjur</h1>
              <p>DIREKTORI KELULUSAN & LAPORAN PENELUSURAN ALUMNI (TRACER STUDY)</p>
              <p style="margin-top: 6px; font-weight: bold; color: #0f766e;">Status Akreditasi: A (Unggul) • Tanggal Rilis: ${new Date().toLocaleDateString('id-ID', {day: 'numeric', month: 'long', year: 'numeric'})}</p>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Nama Lengkap</th>
                  <th>NISN</th>
                  <th>L/P</th>
                  <th>Angkatan</th>
                  <th>Status Pasca Lulus</th>
                  <th>Instansi / Tempat Beraktivitas</th>
                  <th>Kontak Alumni</th>
                </tr>
              </thead>
              <tbody>
                ${filteredAlumni.map(a => `
                  <tr>
                    <td><strong>${a.nama}</strong></td>
                    <td class="font-mono">${a.nisn}</td>
                    <td>${a.gender === 'Laki-laki' ? 'L' : 'P'}</td>
                    <td style="font-weight: bold; color: #1e293b;">${a.tahunLulus}</td>
                    <td>
                      <span class="badge ${
                        a.statusPascaLulus === 'Melanjutkan Studi' ? 'badge-studi' :
                        a.statusPascaLulus === 'Pondok / Mengabdi' ? 'badge-pondok' :
                        a.statusPascaLulus === 'Wirausaha' ? 'badge-wira' : ''
                      }">${a.statusPascaLulus}</span>
                    </td>
                    <td><span class="instansi">${a.detailInstansi}</span></td>
                    <td class="font-mono">${a.telepon}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
            <div class="footer">
              Laporan resmi Sistem Akademik Terpadu (SIAKAD) Yayasan PP Tanwiriyyah Cianjur
            </div>
            <script>window.print();</script>
          </body>
        </html>
      `);
      printWin.document.close();
    }
  };

  return (
    <div id="kesiswaan-viewport" className="space-y-6 animate-fade-in">
      {/* Dynamic Visual KPI Mini Ratios depending on active view */}
      {activeSubTab === 'alumni' ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 animate-fade-in">
          <div className="bg-white border border-slate-100 p-4 rounded-2xl flex items-center gap-3 shadow-sm">
            <div className="bg-emerald-50 text-emerald-700 p-3 rounded-xl shrink-0">
              <Users size={18} />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Total Database Alumni</span>
              <span className="text-xl font-bold font-mono text-slate-800">{alumni.length} Santri</span>
            </div>
          </div>
          <div className="bg-sky-50 border border-sky-100/50 p-4 rounded-2xl flex items-center gap-3 shadow-sm">
            <div className="bg-sky-100 text-sky-800 p-3 rounded-xl shrink-0">
              <Users size={18} />
            </div>
            <div>
              <span className="text-[10px] text-sky-600 font-bold uppercase tracking-wider block">Melanjutkan Studi</span>
              <span className="text-xl font-bold font-mono text-slate-800">
                {alumni.filter(a => a.statusPascaLulus === 'Melanjutkan Studi').length} Alumni
              </span>
            </div>
          </div>
          <div className="bg-indigo-50 border border-indigo-100/50 p-4 rounded-2xl flex items-center gap-3 shadow-sm">
            <div className="bg-indigo-100 text-indigo-800 p-3 rounded-xl shrink-0">
              <Users size={18} />
            </div>
            <div>
              <span className="text-[10px] text-indigo-600 font-bold uppercase tracking-wider block">Pondok / Pesantren</span>
              <span className="text-xl font-bold font-mono text-slate-800">
                {alumni.filter(a => a.statusPascaLulus === 'Pondok / Mengabdi').length} Alumni
              </span>
            </div>
          </div>
          <div className="bg-amber-50 border border-amber-100/50 p-4 rounded-2xl flex items-center gap-3 shadow-sm">
            <div className="bg-amber-100 text-amber-800 p-3 rounded-xl shrink-0">
              <CheckCircle size={18} />
            </div>
            <div>
              <span className="text-[10px] text-amber-600 font-bold uppercase tracking-wider block">Bekerja & Berwirausaha</span>
              <span className="text-xl font-bold font-mono text-slate-800">
                {alumni.filter(a => a.statusPascaLulus === 'Bekerja' || a.statusPascaLulus === 'Wirausaha').length} Alumni
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white border border-slate-100 p-4 rounded-2xl flex items-center gap-3 shadow-sm">
            <div className="bg-emerald-50 text-emerald-700 p-3 rounded-xl shrink-0">
              <Users size={18} />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Total Database Siswa</span>
              <span className="text-xl font-bold text-slate-800">{totalSiswa} Siswa</span>
            </div>
          </div>
          <div className="bg-white border border-slate-100 p-4 rounded-2xl flex items-center gap-3 shadow-sm">
            <div className="bg-teal-50 text-teal-700 p-3 rounded-xl shrink-0">
              <CheckCircle size={18} />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Jumlah Santri Putra (Laki-laki)</span>
              <span className="text-xl font-bold text-slate-800">{totalLaki} Santri</span>
            </div>
          </div>
          <div className="bg-white border border-slate-100 p-4 rounded-2xl flex items-center gap-3 shadow-sm">
            <div className="bg-amber-50 text-amber-700 p-3 rounded-xl shrink-0">
              <UserCheck size={18} />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Jumlah Santri Putri (Perempuan)</span>
              <span className="text-xl font-bold text-slate-800">{totalPerempuan} Santri</span>
            </div>
          </div>
        </div>
      )}

      {/* Sub menu tabs */}
      <div className="flex border-b border-slate-100 gap-1 mt-2">
        <button
          onClick={() => setActiveSubTab('daftar')}
          className={`px-4 py-2.5 text-xs font-semibold rounded-t-xl transition-all ${activeSubTab === 'daftar' ? 'bg-white border border-slate-100 border-b-white text-emerald-800 font-bold' : 'text-slate-500 hover:text-emerald-700 hover:bg-slate-50/50'}`}
        >
          Daftar Roster Siswa
        </button>
        <button
          onClick={() => setActiveSubTab('absensi')}
          className={`px-4 py-2.5 text-xs font-semibold rounded-t-xl transition-all ${activeSubTab === 'absensi' ? 'bg-white border border-slate-100 border-b-white text-emerald-800 font-bold' : 'text-slate-500 hover:text-emerald-700 hover:bg-slate-50/50'}`}
        >
          Perekaman Presensi (Roll-Call)
        </button>
        <button
          onClick={() => setActiveSubTab('alumni')}
          className={`px-4 py-2.5 text-xs font-semibold rounded-t-xl transition-all ${activeSubTab === 'alumni' ? 'bg-white border border-slate-100 border-b-white text-emerald-800 font-bold' : 'text-slate-500 hover:text-emerald-700 hover:bg-slate-50/50'}`}
        >
          Penelusuran Alumni (Tracer Study)
        </button>
      </div>

      {/* Table & Controls wrapper */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden p-5 space-y-4">
        
        {/* Dynamic Controls Row Based on activeSubTab */}
        {activeSubTab === 'alumni' ? (
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
            <div className="flex flex-1 flex-wrap gap-2 w-full">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                <input
                  type="text"
                  value={alumniSearch}
                  onChange={e => setAlumniSearch(e.target.value)}
                  placeholder="Cari nama alumni atau NISN..."
                  className="w-full text-xs border border-slate-100 bg-slate-50/50 rounded-xl pl-9 pr-3 py-2 outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center gap-1.5 min-w-[120px]">
                <select
                  value={alumniFilterStatus}
                  onChange={e => setAlumniFilterStatus(e.target.value)}
                  className="text-xs border border-slate-100 bg-slate-50/50 rounded-xl px-2.5 py-2 outline-none focus:ring-1 focus:ring-emerald-500 w-full font-medium"
                >
                  <option value="Semua">Semua Status Karir</option>
                  <option value="Melanjutkan Studi">Melanjutkan Studi</option>
                  <option value="Pondok / Mengabdi">Pondok / Mengabdi</option>
                  <option value="Bekerja">Bekerja</option>
                  <option value="Wirausaha">Wirausaha</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>

              <div className="flex items-center gap-1.5 min-w-[110px]">
                <select
                  value={alumniFilterYear}
                  onChange={e => setAlumniFilterYear(e.target.value)}
                  className="text-xs border border-slate-100 bg-slate-50/50 rounded-xl px-2.5 py-2 outline-none focus:ring-1 focus:ring-emerald-500 w-full font-medium"
                >
                  <option value="Semua">Semua Angkatan</option>
                  <option value="2025">Lulusan 2025</option>
                  <option value="2024">Lulusan 2024</option>
                  <option value="2023">Lulusan 2023</option>
                  <option value="2022">Lulusan 2022</option>
                </select>
              </div>
            </div>

            <div className="flex gap-2 w-full md:w-auto shrink-0">
              <button
                onClick={() => {
                  setEditingAlumni(null);
                  setAlumniFormData({
                    nisn: '',
                    nama: '',
                    gender: 'Laki-laki',
                    tahunLulus: '2025',
                    statusPascaLulus: 'Melanjutkan Studi',
                    detailInstansi: '',
                    telepon: '',
                    kesanPesan: ''
                  });
                  setShowAlumniModal(true);
                }}
                className="bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 flex-1 md:flex-none justify-center shadow-xs"
              >
                <PlusCircle size={14} /> Daftarkan Alumni Baru
              </button>
              <button
                onClick={handlePrintDirectory}
                className="bg-amber-500 hover:bg-amber-600 text-emerald-950 font-extrabold text-xs px-3.5 py-2 rounded-xl transition flex items-center gap-1.5"
                title="Cetak Laporan Direktori Lulusan Resmi"
              >
                Cetak Laporan
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
            <div className="flex flex-1 flex-wrap gap-2.5 w-full md:max-w-xl">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Cari nomor NISN atau nama siswa..."
                  className="w-full text-xs border border-slate-100 bg-slate-50/50 rounded-xl pl-9 pr-3 py-2 outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              {/* Class filter dropdown */}
              <div className="flex items-center gap-1.5 min-w-[120px]">
                <Filter size={14} className="text-slate-400 shrink-0" />
                <select
                  value={filterClass}
                  onChange={e => setFilterClass(e.target.value)}
                  className="text-xs border border-slate-100 bg-slate-50/50 rounded-xl px-2 py-2 outline-none focus:ring-1 focus:ring-emerald-500 w-full"
                >
                  <option value="Semua">Semua Kelas</option>
                  {uniqueClasses.map(cls => (
                    <option key={cls} value={cls}>Kelas {cls}</option>
                  ))}
                </select>
              </div>

              {activeSubTab === 'daftar' && (
                <div className="flex items-center gap-1.5 min-w-[120px]">
                  <select
                    value={filterStatus}
                    onChange={e => setFilterStatus(e.target.value)}
                    className="text-xs border border-slate-100 bg-slate-50/50 rounded-xl px-2 py-2 outline-none focus:ring-1 focus:ring-emerald-500 w-full"
                  >
                    <option value="Semua">Semua Status</option>
                    <option value="Aktif">Aktif</option>
                    <option value="Lulus">Lulus</option>
                    <option value="Pindahan">Pindahan</option>
                    <option value="Keluar">Keluar</option>
                  </select>
                </div>
              )}
            </div>

            {activeSubTab === 'daftar' && (
              <div className="flex flex-col sm:flex-row gap-2 self-stretch md:self-auto w-full md:w-auto shrink-0">
                {config?.appsScriptUrl && (
                  <button
                    type="button"
                    onClick={onBulkSyncToSheets}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition flex items-center justify-center gap-1.5 shadow-xs"
                    title="Sinkronisasi massal seluruh data siswa ke Google Spreadsheet"
                  >
                    <RefreshCw size={14} /> Sinkron Spreadsheet
                  </button>
                )}
                <button
                  onClick={() => {
                    setImportText('');
                    setImportFeedback('');
                    setShowImportModal(true);
                  }}
                  className="bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold text-xs px-3.5 py-2 rounded-xl transition flex items-center justify-center gap-1.5 shadow-xs"
                  id="import-siswa-btn"
                >
                  <Upload size={14} /> Impor Data Induk (Excel)
                </button>
                <button
                  onClick={() => {
                    setEditingStudent(null);
                    setFormData({
                      nisn: '',
                      nama: '',
                      gender: 'Laki-laki',
                      kelas: 'VII-A',
                      tempatLahir: '',
                      tanggalLahir: '',
                      namaWali: '',
                      teleponWali: '',
                      status: 'Aktif'
                    });
                    setShowAddModal(true);
                  }}
                  className="bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs px-3.5 py-2 rounded-xl transition flex items-center gap-1 shadow-xs shrink-0 justify-center"
                  id="add-siswa-trigger-btn"
                >
                  <Plus size={14} /> Daftarkan Siswa Baru
                </button>
              </div>
            )}
          </div>
        )}

        {/* Dynamic content rendering based on active tab */}
        {activeSubTab === 'daftar' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Siswa</th>
                  <th className="py-3 px-4">Kelas & Gender</th>
                  <th className="py-3 px-4">TTL (Tempat, Tgl Lahir)</th>
                  <th className="py-3 px-4">Kontak Wali / Orang Tua</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-center">Tindakan</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.length > 0 ? (
                  filteredStudents.map(student => (
                    <tr key={student.id} className="border-b border-slate-50 hover:bg-slate-50/30 transition-colors">
                      <td className="py-3 px-4">
                        <div>
                          <strong className="text-slate-800 text-sm font-semibold block">{student.nama}</strong>
                          <span className="text-[10px] text-slate-400 font-mono tracking-wider">NISN: {student.nisn}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        <div className="space-y-0.5">
                          <span className="font-semibold text-slate-700 block">{student.kelas}</span>
                          <span className="text-[11px] text-slate-400">{student.gender}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-slate-600 block">{student.tempatLahir}</span>
                        <span className="text-[10px] text-slate-400 block">{student.tanggalLahir}</span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="space-y-0.5 text-slate-600">
                          <span className="block font-medium text-slate-700">{student.namaWali}</span>
                          <span className="text-slate-400 text-[11px] flex items-center gap-1">
                            <Phone size={10} /> {student.teleponWali}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full ${student.status === 'Aktif' ? 'bg-emerald-50 text-emerald-800' : student.status === 'Lulus' ? 'bg-sky-50 text-sky-800' : 'bg-slate-100 text-slate-500'}`}>
                          {student.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-1.5 justify-center">
                          <button
                            onClick={() => handleStartEdit(student)}
                            className="flex items-center gap-1.5 px-2.5 py-1.5 text-[10px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-all"
                            title="Edit Data Siswa"
                          >
                            <Edit size={12} /> Edit
                          </button>
                          <button
                            onClick={() => {
                              if(window.confirm('Yakin ingin menghapus data siswa ini?')) {
                                onDeleteStudent(student.id);
                              }
                            }}
                            className="flex items-center gap-1.5 px-2.5 py-1.5 text-[10px] font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg transition-all"
                            title="Hapus Data Siswa"
                          >
                            <Trash size={12} /> Hapus
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-slate-400 bg-slate-50/50 rounded-xl">
                      Tidak ada siswa yang terdaftar dalam kategori pencatatan ini.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        ) : activeSubTab === 'absensi' ? (
          /* Absensi Presensi Roll-Call View */
          <div className="space-y-4">
            <div className="bg-emerald-50 border border-emerald-100 text-emerald-800 text-xs p-3.5 rounded-2xl">
              💡 <strong>Instruksi Operator OPM:</strong> Klik tombol tambah (+1) di samping nama siswa untuk mencatat kehadiran harian secara seketika. Persentase kehadiran akan otomatis beradaptasi.
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-widest text-[9px]">
                    <th className="py-3 px-4">Siswa & Kelas</th>
                    <th className="py-3 px-4 text-center">Hadir</th>
                    <th className="py-3 px-4 text-center">Sakit</th>
                    <th className="py-3 px-4 text-center">Izin</th>
                    <th className="py-3 px-4 text-center">Alfa</th>
                    <th className="py-3 px-5 text-center">Kehadiran (%)</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.length > 0 ? (
                    filteredStudents.map(student => (
                      <tr key={student.id} className="border-b border-slate-50 hover:bg-slate-50/30 transition-colors">
                        <td className="py-3.5 px-4 font-semibold text-slate-700">
                          <div>
                            <span className="text-slate-800 font-bold text-sm block">{student.nama}</span>
                            <span className="text-[10px] text-slate-400 font-medium tracking-normal">{student.kelas} • NISN: {student.nisn}</span>
                          </div>
                        </td>
                        
                        {/* Hadir controls */}
                        <td className="py-3.5 px-4 text-center">
                          <button
                            onClick={() => incrementAbsensi(student.id, 'hadir')}
                            className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold text-xs px-2.5 py-1 rounded-lg flex items-center gap-1 mx-auto transition"
                          >
                            <span className="font-mono text-xs">{student.absensi.hadir}</span>
                            <span className="font-light text-[10px] opacity-75">+1</span>
                          </button>
                        </td>
 
                        {/* Sakit controls */}
                        <td className="py-3.5 px-4 text-center">
                          <button
                            onClick={() => incrementAbsensi(student.id, 'sakit')}
                            className="bg-sky-50 text-sky-700 hover:bg-sky-100 font-bold text-xs px-2.5 py-1 rounded-lg flex items-center gap-1 mx-auto transition"
                          >
                            <span className="font-mono text-xs">{student.absensi.sakit}</span>
                            <span className="font-light text-[10px] opacity-75">+1</span>
                          </button>
                        </td>
 
                        {/* Izin controls */}
                        <td className="py-3.5 px-4 text-center">
                          <button
                            onClick={() => incrementAbsensi(student.id, 'izin')}
                            className="bg-amber-50 text-amber-700 hover:bg-amber-100 font-bold text-xs px-2.5 py-1 rounded-lg flex items-center gap-1 mx-auto transition"
                          >
                            <span className="font-mono text-xs">{student.absensi.izin}</span>
                            <span className="font-light text-[10px] opacity-75">+1</span>
                          </button>
                        </td>
 
                        {/* Alfa controls */}
                        <td className="py-3.5 px-4 text-center">
                          <button
                            onClick={() => incrementAbsensi(student.id, 'alfa')}
                            className="bg-rose-50 text-rose-700 hover:bg-rose-100 font-bold text-xs px-2.5 py-1 rounded-lg flex items-center gap-1 mx-auto transition"
                          >
                            <span className="font-mono text-xs">{student.absensi.alfa}</span>
                            <span className="font-light text-[10px] opacity-75">+1</span>
                          </button>
                        </td>
 
                        <td className="py-3.5 px-5 text-center">
                          <div className="flex flex-col items-center gap-1.5 justify-center w-full max-w-[80px] mx-auto">
                            <span className="font-bold font-mono text-slate-800 text-xs">{getPercentageAttendance(student)}%</span>
                            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-300 ${getPercentageAttendance(student) >= 90 ? 'bg-emerald-600' : getPercentageAttendance(student) >= 75 ? 'bg-amber-500' : 'bg-rose-600'}`}
                                style={{ width: `${getPercentageAttendance(student)}%` }}
                              ></div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-slate-400 bg-slate-50/50 rounded-xl">
                        Tidak ada siswa yang terdaftar dalam kelas seleksi ini.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* TRACER STUDY ALUMNI DIRECTORY TAB */
          <div className="space-y-4 animate-fade-in">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-extrabold uppercase tracking-wider text-[9.5px] bg-slate-50/40">
                    <th className="py-3 px-4 rounded-l-xl">Nama / NISN</th>
                    <th className="py-3 px-4 text-center">Angkatan Kelulusan</th>
                    <th className="py-3 px-4">Aktivitas Keasramaan & Pekerjaan</th>
                    <th className="py-3 px-4 text-center">Informasi Telepon No. HP</th>
                    <th className="py-3 px-4 max-w-xs">Pesan & Testimoni Santri terhadap Madrasah</th>
                    <th className="py-3 px-4 text-center rounded-r-xl">Tindakan Administrasi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAlumni.length > 0 ? (
                    filteredAlumni.map(al => (
                      <tr key={al.id} className="border-b border-slate-50 hover:bg-slate-50/40 transition-colors">
                        <td className="py-4 px-4 font-semibold text-slate-700">
                          <div>
                            <span className="text-slate-800 font-bold text-sm block">{al.nama}</span>
                            <span className="text-[10px] text-slate-400 font-semibold tracking-wider font-mono">NISN: {al.nisn} • {al.gender}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-center text-slate-700 font-black font-mono">
                          <span className="bg-slate-100/75 border border-slate-200/50 px-2.5 py-1 rounded-lg">
                            Kelulusan {al.tahunLulus}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <div className="space-y-1">
                            <span className={`inline-block text-[9px] font-extrabold px-2 py-0.5 rounded-full ${
                              al.statusPascaLulus === 'Melanjutkan Studi' ? 'bg-sky-50 text-sky-800 border border-sky-100' :
                              al.statusPascaLulus === 'Pondok / Mengabdi' ? 'bg-emerald-50 text-emerald-800 border border-emerald-100' :
                              al.statusPascaLulus === 'Wirausaha' ? 'bg-amber-50 text-amber-800 border border-amber-100' : 
                              'bg-indigo-50 text-indigo-800 border border-indigo-100'
                            }`}>
                              {al.statusPascaLulus}
                            </span>
                            <span className="block text-slate-700 font-bold text-xs truncate max-w-[200px]">{al.detailInstansi}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-center font-mono font-bold text-slate-600">
                          {al.telepon}
                        </td>
                        <td className="py-4 px-4 max-w-xs text-[11px] text-slate-500 italic leading-relaxed">
                          "{al.kesanPesan || '-'}"
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex gap-1.5 justify-center items-center">
                            <button
                              onClick={() => handleStartEditAlumni(al)}
                              className="flex items-center gap-1.5 px-2.5 py-1.5 text-[10px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-all"
                              title="Sunting berkas lulusan"
                            >
                              <Edit size={12} /> Edit
                            </button>
                            <button
                              onClick={() => {
                                if(window.confirm('Yakin ingin menghapus data alumni ini?')) {
                                  onDeleteAlumni(al.id);
                                }
                              }}
                              className="flex items-center gap-1.5 px-2.5 py-1.5 text-[10px] font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg transition-all"
                              title="Hapus berkas alumni"
                            >
                              <Trash size={12} /> Hapus
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="text-center py-10 text-slate-500 bg-slate-50/50 rounded-xl font-medium">
                        Direktori kosong / data penelusuran tidak cocok dengan kata kunci filter pencarian.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Registry Student Popup Form */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4 transition-all animate-fade-in" id="student-modal">
          <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-100 shadow-xl overflow-hidden animate-slide-up flex flex-col max-h-[90vh]">
            <div className="bg-emerald-800 text-white p-5 flex justify-between items-center">
              <h3 className="font-bold text-md flex items-center gap-2">
                <Users size={20} />
                {editingStudent ? 'Perbarui Profil Siswa/Santri' : 'Registrasi Formulir Siswa Baru'}
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-emerald-100 hover:text-white font-bold"
              >
                &times; Close
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">NISN (Nomor Induk Siswa Nasional)</label>
                  <input
                    type="text"
                    name="nisn"
                    value={formData.nisn}
                    onChange={handleInputChange}
                    placeholder="misal: 0098171615"
                    className="w-full text-xs border border-slate-200 rounded-lg px-3 py-1.5 focus:ring-1 focus:ring-emerald-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Nama Lengkap Siswa / Murid</label>
                  <input
                    type="text"
                    name="nama"
                    value={formData.nama}
                    onChange={handleInputChange}
                    placeholder="Siti Jubaedah"
                    className="w-full text-xs border border-slate-200 rounded-lg px-3 py-1.5 focus:ring-1 focus:ring-emerald-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Jenis Jenis Kelamin</label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    className="w-full text-xs border border-slate-200 rounded-lg px-3 py-1.5 focus:ring-1 focus:ring-emerald-500 outline-none"
                  >
                    <option value="Laki-laki">Laki-laki (Putra)</option>
                    <option value="Perempuan">Perempuan (Putri)</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Alokasi Penempatan Kelas</label>
                  <input
                    type="text"
                    name="kelas"
                    list="class-list"
                    value={formData.kelas}
                    onChange={handleInputChange}
                    placeholder="misal: VII-A atau ketik kelas baru"
                    className="w-full text-xs border border-slate-200 rounded-lg px-3 py-1.5 focus:ring-1 focus:ring-emerald-500 outline-none"
                    required
                  />
                  <datalist id="class-list">
                    {uniqueClasses.map(cls => (
                      <option key={cls} value={cls} />
                    ))}
                  </datalist>
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Tempat Lahir</label>
                  <input
                    type="text"
                    name="tempatLahir"
                    value={formData.tempatLahir}
                    onChange={handleInputChange}
                    placeholder="misal: Cianjur"
                    className="w-full text-xs border border-slate-200 rounded-lg px-3 py-1.5"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Tanggal Lahir</label>
                  <input
                    type="date"
                    name="tanggalLahir"
                    value={formData.tanggalLahir}
                    onChange={handleInputChange}
                    className="w-full text-xs border border-slate-200 rounded-lg px-3 py-1.5"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Nama Orang Tua / Wali Siswa</label>
                  <input
                    type="text"
                    name="namaWali"
                    value={formData.namaWali}
                    onChange={handleInputChange}
                    placeholder="misal: H. Yusuf Mansur"
                    className="w-full text-xs border border-slate-200 rounded-lg px-3 py-1.5"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Nomor Seluler Wali Siswa</label>
                  <input
                    type="text"
                    name="teleponWali"
                    value={formData.teleponWali}
                    onChange={handleInputChange}
                    placeholder="misal: 0812-3232-4141"
                    className="w-full text-xs border border-slate-200 rounded-lg px-3 py-1.5"
                    required
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Alamat Lengkap</label>
                  <textarea
                    name="alamat"
                    value={formData.alamat}
                    onChange={handleInputChange}
                    placeholder="misal: Jl. Raya Cibeber Km. 5, Kampung Sindanglaka"
                    rows={2}
                    className="w-full text-xs border border-slate-200 rounded-lg px-3 py-1.5 focus:ring-1 focus:ring-emerald-500 outline-none resize-none"
                    required
                  ></textarea>
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Status Keaktifan Sekolah</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full text-xs border border-slate-200 rounded-lg px-3 py-1.5 focus:ring-1 focus:ring-emerald-500 outline-none"
                  >
                    <option value="Aktif">Aktif</option>
                    <option value="Lulus">Lulus</option>
                    <option value="Pindahan">Pindahan</option>
                    <option value="Keluar">Keluar</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs px-4 py-2 rounded-xl transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs px-5 py-2 rounded-xl transition shadow-xs"
                >
                  {editingStudent ? 'Simpan Perubahan' : 'Daftarkan Santri'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Alumni Registry Modal */}
      {showAlumniModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4 transition-all animate-fade-in" id="alumni-modal">
          <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-100 shadow-xl overflow-hidden animate-slide-up flex flex-col max-h-[90vh]">
            <div className="bg-emerald-800 text-white p-5 flex justify-between items-center">
              <h3 className="font-bold text-md flex items-center gap-2">
                <Users size={20} />
                {editingAlumni ? 'Perbarui Profil Alumni' : 'Registrasi Berkas Alumni Baru'}
              </h3>
              <button
                type="button"
                onClick={() => setShowAlumniModal(false)}
                className="text-emerald-100 hover:text-white font-bold"
              >
                &times; Close
              </button>
            </div>

            <form onSubmit={handleAlumniSubmit} className="p-6 space-y-4 overflow-y-auto flex-1 text-left">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">NISN Alumni</label>
                  <input
                    type="text"
                    required
                    pattern="[0-9]{10}"
                    title="NISN harus berupa 10 digit angka"
                    value={alumniFormData.nisn}
                    onChange={e => setAlumniFormData(prev => ({ ...prev, nisn: e.target.value }))}
                    className="w-full text-xs font-semibold border border-slate-200 rounded-xl px-3 py-2 outline-none focus:ring-1 focus:ring-emerald-500"
                    placeholder="Contoh: 0082391024"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Nama Lengkap Alumni</label>
                  <input
                    type="text"
                    required
                    value={alumniFormData.nama}
                    onChange={e => setAlumniFormData(prev => ({ ...prev, nama: e.target.value }))}
                    className="w-full text-xs font-semibold border border-slate-200 rounded-xl px-3 py-2 outline-none focus:ring-1 focus:ring-emerald-500"
                    placeholder="Nama Lengkap Santri"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Jenis Kelamin</label>
                  <select
                    value={alumniFormData.gender}
                    onChange={e => setAlumniFormData(prev => ({ ...prev, gender: e.target.value as any }))}
                    className="w-full text-xs font-semibold border border-slate-200 rounded-xl px-3 py-2 outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="Laki-laki">Laki-laki</option>
                    <option value="Perempuan">Perempuan</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Tahun Kelulusan</label>
                  <select
                    value={alumniFormData.tahunLulus}
                    onChange={e => setAlumniFormData(prev => ({ ...prev, tahunLulus: e.target.value }))}
                    className="w-full text-xs font-semibold border border-slate-200 rounded-xl px-3 py-2 outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="2025">2025</option>
                    <option value="2024">2024</option>
                    <option value="2023">2023</option>
                    <option value="2022">2022</option>
                    <option value="2021">2021</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Status Aktivitas</label>
                  <select
                    value={alumniFormData.statusPascaLulus}
                    onChange={e => setAlumniFormData(prev => ({ ...prev, statusPascaLulus: e.target.value as any }))}
                    className="w-full text-xs font-semibold border border-slate-200 rounded-xl px-3 py-2 outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="Melanjutkan Studi">Melanjutkan Studi</option>
                    <option value="Pondok / Mengabdi">Pondok / Mengabdi</option>
                    <option value="Bekerja">Bekerja</option>
                    <option value="Wirausaha">Wirausaha</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Pekerjaan / Bidang Instansi</label>
                  <input
                    type="text"
                    required
                    value={alumniFormData.detailInstansi}
                    onChange={e => setAlumniFormData(prev => ({ ...prev, detailInstansi: e.target.value }))}
                    className="w-full text-xs font-semibold border border-slate-200 rounded-xl px-3 py-2 outline-none focus:ring-1 focus:ring-emerald-500"
                    placeholder="Contoh: MAN 1 Cianjur / PT Telkom"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">No. HP / Kontak Utama</label>
                  <input
                    type="text"
                    required
                    value={alumniFormData.telepon}
                    onChange={e => setAlumniFormData(prev => ({ ...prev, telepon: e.target.value }))}
                    className="w-full text-xs font-semibold border border-slate-200 rounded-xl px-3 py-2 outline-none focus:ring-1 focus:ring-emerald-500"
                    placeholder="Format: 0812-xxxx-xxxx"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Kesan Pesan / Testimoni Selama Sekolah</label>
                <textarea
                  rows={3}
                  value={alumniFormData.kesanPesan}
                  onChange={e => setAlumniFormData(prev => ({ ...prev, kesanPesan: e.target.value }))}
                  className="w-full text-xs font-semibold border border-slate-200 rounded-xl px-3 py-1.5 focus:ring-1 focus:ring-emerald-500 outline-none"
                  placeholder="Kesan pesan testimoni yang menginspirasi santri lain..."
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAlumniModal(false)}
                  className="px-4 py-2 hover:bg-slate-50 text-slate-500 text-xs font-bold rounded-xl transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="bg-emerald-800 hover:bg-emerald-950 text-white font-bold text-xs px-5 py-2 rounded-xl shadow-xs"
                >
                  {editingAlumni ? 'Simpan Perubahan' : 'Registrasi Alumni'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* BULK IMPORT STUDENT MODAL */}
      {showImportModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-100 max-w-2xl w-full max-h-[90vh] flex flex-col">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="text-amber-500" size={20} />
                <h3 className="font-bold text-slate-800 text-md">Impor Data Induk Siswa (Bulk)</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowImportModal(false)}
                className="p-1 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-slate-600 transition"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleBulkImportSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="bg-amber-50/75 border border-amber-200/50 rounded-xl p-4 text-xs text-amber-900 space-y-2">
                <p className="font-bold">Format Kolom Data:</p>
                <p className="leading-relaxed">
                  Gunakan pemisah <strong>koma (,)</strong> atau <strong>Tab (copy-paste dari Excel)</strong> dengan urutan kolom berikut:
                </p>
                <code className="block bg-amber-100/40 p-2 rounded-lg font-mono text-[10px] text-amber-950 font-semibold select-all">
                  NISN, Nama Lengkap, Gender (L/P), Kelas, Tempat Lahir, Tanggal Lahir (YYYY-MM-DD), Nama Wali, No HP Wali
                </code>
                <p className="text-[10px] opacity-90 leading-normal">
                  * Catatan: Kolom 3 s.d 8 opsional, jika kosong akan diisi nilai bawaan. NISN wajib 10 digit angka dan unik.
                </p>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-500 block">
                  Unggah Berkas CSV / TXT
                </label>
                <div className="border-2 border-dashed border-slate-200 hover:border-emerald-500 transition rounded-xl p-4 flex flex-col items-center justify-center bg-slate-50/50 cursor-pointer text-center relative group">
                  <Upload size={24} className="text-slate-400 group-hover:text-emerald-600 transition mb-2" />
                  <p className="text-xs font-semibold text-slate-600">Klik untuk upload berkas CSV excel</p>
                  <p className="text-[10px] text-slate-400 mt-1">Hanya mendukung file teks .csv atau .txt</p>
                  <input 
                    type="file" 
                    accept=".csv, .txt, text/plain" 
                    onChange={handleImportFileChange}
                    className="absolute inset-x-0 top-0 bottom-0 opacity-0 cursor-pointer whitespace-nowrap" 
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-400 block flex justify-between">
                  <span>Konten Data Induk (Atau Paste langsung dari Excel / Word)</span>
                  {importText && (
                    <button
                      type="button"
                      onClick={() => setImportText('')}
                      className="text-rose-600 hover:text-rose-700 font-bold lowercase normal-case text-[9px]"
                    >
                      Bereskan Teks
                    </button>
                  )}
                </label>
                <textarea
                  rows={8}
                  value={importText}
                  onChange={(e) => setImportText(e.target.value)}
                  className="w-full text-xs font-mono font-semibold border border-slate-200 rounded-xl p-3 focus:ring-1 focus:ring-emerald-500 outline-none leading-relaxed"
                  placeholder="Contoh:&#10;0098231001,Ahmad Maulana,L,VII-A,Cianjur,2013-05-12,Mulyadi,081234567801&#10;0098231002,Siti Rahmawati,P,VII-A,Cianjur,2013-08-20,Sulaiman,081234567802"
                />
              </div>

              {importFeedback && (
                <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 text-xs text-rose-700 font-semibold">
                  {importFeedback}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowImportModal(false)}
                  className="px-4 py-2 hover:bg-slate-50 text-slate-500 text-xs font-bold rounded-xl transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="bg-emerald-800 hover:bg-emerald-950 text-white font-bold text-xs px-5 py-2 rounded-xl shadow-xs"
                >
                  Proses Impor Siswa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
