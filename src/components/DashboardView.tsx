import React from 'react';
import { 
  Users, 
  GraduationCap, 
  Wallet, 
  Package, 
  FileText, 
  PlusCircle, 
  Bell, 
  Calendar as CalendarIcon,
  DollarSign,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { Student, Teacher, FinancialTransaction, Asset, DocumentLetter, SystemConfig, KalenderEvent } from '../types';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell
} from 'recharts';

interface DashboardViewProps {
  students: Student[];
  teachers: Teacher[];
  transactions: FinancialTransaction[];
  assets: Asset[];
  letters: DocumentLetter[];
  config: SystemConfig;
  kalenderEvents: KalenderEvent[];
  onNavigate: (tab: string) => void;
}

export default function DashboardView({
  students,
  teachers,
  transactions,
  assets,
  letters,
  config,
  kalenderEvents,
  onNavigate
}: DashboardViewProps) {
  // Calculations
  const activeStudents = students.filter(s => s.status === 'Aktif').length;
  const totalTeachers = teachers.length;
  
  const totalIncome = transactions
    .filter(t => t.tipe === 'Pemasukan')
    .reduce((sum, t) => sum + t.jumlah, 0);
    
  const totalExpense = transactions
    .filter(t => t.tipe === 'Pengeluaran')
    .reduce((sum, t) => sum + t.jumlah, 0);
    
  const netBalance = totalIncome - totalExpense;
  const totalAssets = assets.reduce((sum, a) => sum + a.jumlah, 0);
  const totalLetters = letters.length;

  // Formatting currency
  const formatIDR = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(num);
  };

  // Pre-calculate custom chart data for income vs expense
  // We can simulate data based on logged transactions grouped by category or recent months
  const recentTransactions = [...transactions].sort((a, b) => b.tanggal.localeCompare(a.tanggal)).slice(0, 4);

  return (
    <div id="dashboard-viewport" className="space-y-6 animate-fade-in">
      {/* Welcome Board */}
      <div id="welcome-board" className="relative overflow-hidden bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 text-white rounded-2xl p-6 shadow-md">
        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none transform translate-x-1/4 translate-y-1/4">
          <GraduationCap size={320} />
        </div>
        <div className="relative z-10 max-w-3xl space-y-2">
          <span className="inline-block bg-emerald-600/50 backdrop-blur-md text-emerald-200 text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider">
            Tahun Pelajaran: {config.tahunAjaranAktif} ({config.semesterAktif})
          </span>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            {config.sambutanHeading}
          </h1>
          <p className="text-emerald-100 text-sm md:text-base leading-relaxed font-light">
            {config.sambutanTeks}
          </p>
          <div className="pt-2 flex flex-wrap gap-2">
            <button 
              onClick={() => onNavigate('kesiswaan')} 
              className="bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-emerald-950 font-semibold px-4 py-2 rounded-xl text-xs transition duration-150 flex items-center gap-1.5 shadow-sm"
              id="quick-siswa-btn"
            >
              <Users size={14} /> Kelola Siswa
            </button>
            <button 
              onClick={() => onNavigate('keuangan')} 
              className="bg-white/10 hover:bg-white/20 active:bg-white/30 text-white font-medium px-4 py-2 rounded-xl text-xs backdrop-blur-sm transition duration-150 flex items-center gap-1.5"
              id="quick-keu-btn"
            >
              <Wallet size={14} /> Keuangan Kas
            </button>
          </div>
        </div>
      </div>

      {/* Grid KPI Cards */}
      <div id="kpi-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        {/* Siswa Card */}
        <div 
          onClick={() => onNavigate('kesiswaan')}
          className="bg-white p-5 rounded-xl border border-slate-200 hover:border-emerald-500 hover:shadow-md transition-all duration-200 cursor-pointer shadow-sm group"
          id="kpi-siswa"
        >
          <div className="flex justify-between items-start">
            <div className="space-y-1 font-sans">
              <span className="text-slate-500 text-[10px] font-bold uppercase tracking-wider block">Total Siswa Aktif</span>
              <span className="text-2xl font-bold text-slate-800 block group-hover:text-emerald-600 transition-colors">{activeStudents}</span>
            </div>
            <div className="bg-emerald-50 text-emerald-600 p-2.5 rounded-lg group-hover:bg-emerald-600 group-hover:text-white transition-all duration-200 shrink-0">
              <Users size={16} />
            </div>
          </div>
          <p className="text-[10px] text-slate-400 mt-3 flex items-center gap-1">
            <span className="text-emerald-500 font-semibold">+12%</span> kuota terisi
          </p>
        </div>

        {/* Guru Staf Card */}
        <div 
          onClick={() => onNavigate('kepegawaian')}
          className="bg-white p-5 rounded-xl border border-slate-200 hover:border-emerald-500 hover:shadow-md transition-all duration-200 cursor-pointer shadow-sm group"
          id="kpi-kepegawaian"
        >
          <div className="flex justify-between items-start">
            <div className="space-y-1 font-sans">
              <span className="text-slate-500 text-[10px] font-bold uppercase tracking-wider block">Tenaga Pengajar</span>
              <span className="text-2xl font-bold text-slate-800 block group-hover:text-emerald-600 transition-colors">{totalTeachers}</span>
            </div>
            <div className="bg-emerald-50 text-emerald-600 p-2.5 rounded-lg group-hover:bg-emerald-600 group-hover:text-white transition-all duration-200 shrink-0">
              <GraduationCap size={16} />
            </div>
          </div>
          <p className="text-[10px] text-slate-400 mt-3 flex items-center gap-1">
            PTK Terdaftar
          </p>
        </div>

        {/* Keuangan Card */}
        <div 
          onClick={() => onNavigate('keuangan')}
          className="bg-white p-5 rounded-xl border border-slate-200 hover:border-emerald-500 hover:shadow-md transition-all duration-200 cursor-pointer shadow-sm group sm:col-span-2 lg:col-span-1"
          id="kpi-keuangan"
        >
          <div className="flex justify-between items-start">
            <div className="space-y-1 font-sans">
              <span className="text-slate-500 text-[10px] font-bold uppercase tracking-wider block">Saldo Kas Bersih</span>
              <span className={`text-[19px] font-bold tracking-tight block group-hover:text-emerald-600 transition-colors truncate max-w-full ${netBalance >= 0 ? 'text-slate-800' : 'text-rose-600'}`}>
                {formatIDR(netBalance)}
              </span>
            </div>
            <div className={`p-2.5 rounded-lg transition-all duration-200 shrink-0 ${netBalance >= 0 ? 'bg-amber-50 text-amber-600 group-hover:bg-amber-500 group-hover:text-white' : 'bg-rose-50 text-rose-600'}`}>
              <Wallet size={16} />
            </div>
          </div>
          <p className="text-[10px] text-slate-400 mt-3 flex items-center gap-1 truncate">
            <TrendingUp size={12} className="text-emerald-500 inline shrink-0" />
            <span className="text-emerald-500 font-semibold">{formatIDR(totalIncome).substring(0, 10)}..</span> masuk
          </p>
        </div>

        {/* Sarpras Card */}
        <div 
          onClick={() => onNavigate('sarana')}
          className="bg-white p-5 rounded-xl border border-slate-200 hover:border-emerald-500 hover:shadow-md transition-all duration-200 cursor-pointer shadow-sm group"
          id="kpi-sarana"
        >
          <div className="flex justify-between items-start">
            <div className="space-y-1 font-sans">
              <span className="text-slate-500 text-[10px] font-bold uppercase tracking-wider block">Inventaris Sarana</span>
              <span className="text-2xl font-bold text-slate-800 block group-hover:text-emerald-600 transition-colors">{totalAssets}</span>
            </div>
            <div className="bg-emerald-50 text-emerald-600 p-2.5 rounded-lg group-hover:bg-emerald-600 group-hover:text-white transition-all duration-200 shrink-0">
              <Package size={16} />
            </div>
          </div>
          <p className="text-[10px] text-slate-400 mt-3 flex items-center gap-1">
            Kondisi baik optimal
          </p>
        </div>

        {/* Surat & Humas Card */}
        <div 
          onClick={() => onNavigate('humas')}
          className="bg-white p-5 rounded-xl border border-slate-200 hover:border-emerald-500 hover:shadow-md transition-all duration-200 cursor-pointer shadow-sm group"
          id="kpi-humas"
        >
          <div className="flex justify-between items-start">
            <div className="space-y-1 font-sans">
              <span className="text-slate-500 text-[10px] font-bold uppercase tracking-wider block">Kehadiran / Surat</span>
              <span className="text-2xl font-bold text-slate-800 block group-hover:text-emerald-600 transition-colors">{totalLetters}</span>
            </div>
            <div className="bg-emerald-50 text-emerald-600 p-2.5 rounded-lg group-hover:bg-emerald-600 group-hover:text-white transition-all duration-200 shrink-0">
              <FileText size={16} />
            </div>
          </div>
          <p className="text-[10px] text-slate-400 mt-3 flex items-center gap-1">
            Surat masuk &amp; keluar
          </p>
        </div>
      </div>

      {/* Main Analysis and Recent Action Section */}
      <div id="analysis-grid" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Rekapitulasi Jumlah Siswa */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <div className="font-sans">
                <h3 className="font-bold text-slate-800 text-sm">Rekapitulasi Jumlah Siswa</h3>
                <p className="text-xs text-slate-400">Total siswa berdasarkan kelas dan jenis kelamin</p>
              </div>
            </div>
            <div className="h-64 mt-4 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={Array.from(new Set(students.map(s => s.kelas).filter(Boolean))).sort().map(kelas => ({
                    name: `Kelas ${kelas}`,
                    LakiLaki: students.filter(s => s.kelas === kelas && s.gender === 'Laki-laki').length,
                    Perempuan: students.filter(s => s.kelas === kelas && s.gender === 'Perempuan').length,
                  }))}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '11px' }}
                    cursor={{ fill: '#f8fafc' }}
                  />
                  <Bar dataKey="LakiLaki" name="Laki-laki" fill="#10b981" radius={[4, 4, 0, 0]} barSize={24} />
                  <Bar dataKey="Perempuan" name="Perempuan" fill="#f59e0b" radius={[4, 4, 0, 0]} barSize={24} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Interactive Visual Graph (SVG Custom rendered) */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <div className="font-sans">
              <h3 className="font-bold text-slate-800 text-sm">Ikhtisar Laporan Keuangan</h3>
              <p className="text-xs text-slate-400">Analisis pengisian kas dan dana hibah MTs Tanwiriyyah</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-semibold text-slate-500">
              <div className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
                <span>Pemasukan</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span>
                <span>Pengeluaran</span>
              </div>
            </div>
          </div>

          {/* Render Vector Bar Chart */}
          <div className="relative h-64 w-full bg-slate-50 rounded-xl p-4 flex flex-col justify-end">
            {/* Background grids */}
            <div className="absolute inset-x-0 top-1/4 border-t border-slate-200/50"></div>
            <div className="absolute inset-x-0 top-2/4 border-t border-slate-200/50"></div>
            <div className="absolute inset-x-0 top-3/4 border-t border-slate-200/50"></div>
            
            <div className="relative z-10 w-full h-full flex items-end justify-around pt-6">
              {/* Bar 1 - Januari */}
              <div className="flex flex-col items-center gap-2 group cursor-pointer w-12">
                <div className="flex items-end gap-1 h-36">
                  <div className="w-3.5 bg-emerald-500 rounded-t-sm h-16 group-hover:opacity-90 transition-all duration-250 relative">
                    <span className="absolute -top-7 left-1/2 -translate-x-1/2 text-[9px] bg-slate-900 text-white px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">Rp 12jt</span>
                  </div>
                  <div className="w-3.5 bg-amber-500 rounded-t-sm h-8 group-hover:opacity-90 transition-all duration-250 relative">
                    <span className="absolute -top-7 left-1/2 -translate-x-1/2 text-[9px] bg-slate-900 text-white px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">Rp 6jt</span>
                  </div>
                </div>
                <span className="text-[10px] font-semibold text-slate-500">Jan</span>
              </div>

              {/* Bar 2 - Februari */}
              <div className="flex flex-col items-center gap-2 group cursor-pointer w-12">
                <div className="flex items-end gap-1 h-36">
                  <div className="w-3.5 bg-emerald-500 rounded-t-sm h-20 group-hover:opacity-90 transition-all duration-250 relative">
                    <span className="absolute -top-7 left-1/2 -translate-x-1/2 text-[9px] bg-slate-900 text-white px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">Rp 16jt</span>
                  </div>
                  <div className="w-3.5 bg-amber-500 rounded-t-sm h-12 group-hover:opacity-90 transition-all duration-250 relative">
                    <span className="absolute -top-7 left-1/2 -translate-x-1/2 text-[9px] bg-slate-900 text-white px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">Rp 9jt</span>
                  </div>
                </div>
                <span className="text-[10px] font-semibold text-slate-500">Feb</span>
              </div>

              {/* Bar 3 - Maret */}
              <div className="flex flex-col items-center gap-2 group cursor-pointer w-12">
                <div className="flex items-end gap-1 h-36">
                  <div className="w-3.5 bg-emerald-500 rounded-t-sm h-28 group-hover:opacity-90 transition-all duration-250 relative">
                    <span className="absolute -top-7 left-1/2 -translate-x-1/2 text-[9px] bg-slate-900 text-white px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">Rp 24jt</span>
                  </div>
                  <div className="w-3.5 bg-amber-500 rounded-t-sm h-14 group-hover:opacity-90 transition-all duration-250 relative">
                    <span className="absolute -top-7 left-1/2 -translate-x-1/2 text-[9px] bg-slate-900 text-white px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">Rp 11jt</span>
                  </div>
                </div>
                <span className="text-[10px] font-semibold text-slate-500">Mar</span>
              </div>

              {/* Bar 4 - April */}
              <div className="flex flex-col items-center gap-2 group cursor-pointer w-12">
                <div className="flex items-end gap-1 h-36">
                  <div className="w-3.5 bg-emerald-500 rounded-t-sm h-14 group-hover:opacity-90 transition-all duration-250 relative">
                    <span className="absolute -top-7 left-1/2 -translate-x-1/2 text-[9px] bg-slate-900 text-white px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">Rp 10jt</span>
                  </div>
                  <div className="w-3.5 bg-amber-500 rounded-t-sm h-10 group-hover:opacity-90 transition-all duration-250 relative">
                    <span className="absolute -top-7 left-1/2 -translate-x-1/2 text-[9px] bg-slate-900 text-white px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">Rp 8jt</span>
                  </div>
                </div>
                <span className="text-[10px] font-semibold text-slate-500">Apr</span>
              </div>

              {/* Bar 5 - Mei */}
              <div className="flex flex-col items-center gap-2 group cursor-pointer w-12">
                <div className="flex items-end gap-1 h-36">
                  <div className="w-3.5 bg-emerald-500 rounded-t-sm h-22 group-hover:opacity-90 transition-all duration-250 relative">
                    <span className="absolute -top-7 left-1/2 -translate-x-1/2 text-[9px] bg-slate-900 text-white px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">Rp 18jt</span>
                  </div>
                  <div className="w-3.5 bg-amber-500 rounded-t-sm h-16 group-hover:opacity-90 transition-all duration-250 relative">
                    <span className="absolute -top-7 left-1/2 -translate-x-1/2 text-[9px] bg-slate-900 text-white px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">Rp 13jt</span>
                  </div>
                </div>
                <span className="text-[10px] font-semibold text-slate-500">Mei</span>
              </div>

              {/* Bar 6 - Juni (Current) */}
              <div className="flex flex-col items-center gap-2 group cursor-pointer w-12">
                <div className="flex items-end gap-1 h-36">
                  {/* Scale BOS pencairan + SPP */}
                  <div className="w-3.5 bg-emerald-600 rounded-t-sm h-32 group-hover:bg-emerald-700 transition-all duration-250 relative">
                    <span className="absolute -top-7 left-1/2 -translate-x-1/2 text-[9px] bg-slate-900 text-white px-1.5 py-0.5 rounded opacity-100 whitespace-nowrap z-50">{formatIDR(totalIncome).substring(0, 8)}..</span>
                  </div>
                  <div className="w-3.5 bg-amber-600 rounded-t-sm h-16 group-hover:bg-amber-700 transition-all duration-250 relative">
                    <span className="absolute -top-7 left-1/2 -translate-x-1/2 text-[9px] bg-slate-900 text-white px-1.5 py-0.5 rounded opacity-100 whitespace-nowrap z-50">{formatIDR(totalExpense).substring(0, 8)}..</span>
                  </div>
                </div>
                <span className="text-[10px] font-semibold text-emerald-800">Jun</span>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-t border-slate-100 pt-3 text-[11px] text-slate-400 gap-2 font-sans">
            <span>Siklus Pelaporan Keuangan: <strong className="text-slate-600">Bulanan</strong></span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
              Sinkronisasi basis data real-time aktif
            </span>
          </div>
        </div>
        </div>

        {/* Right timeline and schedule log */}
        <div className="space-y-6">
          {/* Recent activities in financial / operation */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-800 text-sm">Transaksional Terbaru</h3>
            <div className="space-y-3">
              {recentTransactions.map((tx) => (
                <div key={tx.id} className="flex gap-3 items-start border-b border-slate-50 last:border-none pb-2.5 last:pb-0 font-sans">
                  <div className={`p-1.5 rounded text-xs font-semibold shrink-0 ${tx.tipe === 'Pemasukan' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                    {tx.tipe === 'Pemasukan' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-700 truncate">{tx.keterangan}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{tx.tanggal} • {tx.kategori}</p>
                  </div>
                  <span className={`text-xs font-bold whitespace-nowrap shrink-0 ${tx.tipe === 'Pemasukan' ? 'text-emerald-700' : 'text-amber-700'}`}>
                    {tx.tipe === 'Pemasukan' ? '+' : '-'}{tx.jumlah >= 1000000 ? `${(tx.jumlah / 1000000).toFixed(1)}jt` : formatIDR(tx.jumlah)}
                  </span>
                </div>
              ))}
            </div>
            <button 
              onClick={() => onNavigate('keuangan')}
              className="text-slate-500 hover:text-emerald-700 font-bold text-xs w-full text-center hover:underline pt-1.5 block border-t border-slate-50"
            >
              Lihat Arus Kas Lengkap &rarr;
            </button>
          </div>

          {/* Agenda & Pengumuman */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex justify-between items-center font-sans">
              <h3 className="font-bold text-slate-800 flex items-center gap-1.5 text-sm">
                <CalendarIcon size={16} className="text-amber-500 shrink-0" />
                Agenda Madrasah
              </h3>
              <button 
                onClick={() => onNavigate('kurikulum')}
                className="text-[9px] font-bold text-amber-600 bg-amber-50 hover:bg-amber-100 transition-colors px-2 py-0.5 rounded"
              >
                Lihat Semua
              </button>
            </div>
            <div className="space-y-3 font-sans">
              {kalenderEvents.length > 0 ? (
                kalenderEvents.slice(0, 4).map((ev, idx) => {
                  // We can just format based on what is stored in tanggalStr.
                  // For UI we can just show a generic calendar box or try to parse
                  return (
                    <div key={ev.id} className={`flex gap-3 ${idx > 1 ? 'opacity-60' : ''}`}>
                      <div className={`flex flex-col items-center ${idx % 2 === 0 ? 'bg-slate-50 border-slate-100 text-slate-800' : 'bg-emerald-50 border-emerald-100 text-emerald-800'} font-semibold rounded px-2.5 py-1 text-center min-w-[42px] max-h-[44px] justify-center shadow-2xs border`}>
                        <span className={`text-[9px] leading-tight uppercase ${idx % 2 === 0 ? 'text-slate-400' : 'text-emerald-600 font-bold'}`}>Agn</span>
                        <span className={`text-xs leading-tight font-extrabold ${idx % 2 === 0 ? 'text-slate-700' : 'text-emerald-700'}`}>{idx + 1}</span>
                      </div>
                      <div className="flex-1">
                        <h4 className="text-xs font-bold text-slate-700 line-clamp-1">{ev.nama}</h4>
                        <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">{ev.tanggalStr}</p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-4 text-slate-400 text-xs">Belum ada agenda bulan ini.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
