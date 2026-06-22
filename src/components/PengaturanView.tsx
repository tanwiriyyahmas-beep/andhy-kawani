import React, { useState, useEffect } from 'react';
import { SystemConfig } from '../types';
import { Save, AlertTriangle, Download, RefreshCw, Trash2, ShieldCheck, Heart, FileSpreadsheet, Check, Link, AlertCircle, Sparkles, Plus } from 'lucide-react';
import { initAuth, googleSignIn, googleLogout, createNewSpreadsheet, testSpreadsheetConnection } from '../lib/googleAuth';
import { User } from 'firebase/auth';

const DefaultLogoSvg = () => (
  <svg viewBox="0 0 100 100" className="w-12 h-12 sm:w-16 sm:h-16 shrink-0 pointer-events-none select-none">
    <path d="M 30,2 70,2 98,30 98,70 70,98 30,98 2,70 2,30 Z" fill="#1e40af" stroke="#ffffff" strokeWidth="2" />
    <path d="M 32,5 68,5 95,32 95,68 68,95 32,95 5,68 5,32 Z" fill="none" stroke="#2563eb" strokeWidth="1" />
    <circle cx="50" cy="50" r="38" fill="#1d4ed8" stroke="#ffffff" strokeWidth="1.5" />
    <path d="M 40,43 A 11 11 0 1 0 60,43 A 8 8 0 1 1 40,43 Z" fill="#facc15" />
    <polygon points="50,29 52,34 58,34 53,37 55,42 50,39 45,42 47,37 42,34 48,34" fill="#facc15" />
    <path d="M 50,65 C 45,61 38,61 32,63 L 32,54 C 38,52 45,52 50,56 C 55,52 62,52 68,54 L 68,63 C 62,61 55,61 50,65 Z" fill="#ffffff" stroke="#1d4ed8" strokeWidth="1" />
    <path d="M 19,50 C 17,40 21,31 25,26" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" />
    <path d="M 81,50 C 83,40 79,31 75,26" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" />
    <path d="M 17,50 A 33 33 0 1 1 83,50" fill="none" />
    <text className="text-[5.5px] font-black fill-white tracking-widest uppercase">
      <textPath href="#textPathTop" startOffset="50%" textAnchor="middle">
        TSANAWIYAH
      </textPath>
    </text>
  </svg>
);

const BasmalahSvg = () => (
  <div className="w-full text-center py-0.5 select-none pointer-events-none">
    <span className="font-serif italic font-bold text-[16px] sm:text-[18px] text-slate-700 tracking-wider">
      ﷽
    </span>
  </div>
);

const googleAppsScriptTemplate = `/*
 * GOOGLE APPS SCRIPT - AUTO-RUN SPREADSHEET SYNC
 * Tempelkan kode ini di menu "Extensions" -> "Apps Script" pada Google Spreadsheet Anda.
 * 
 * Langkah-langkah Deployment:
 * 1. Simpan script ini (Ctrl+S).
 * 2. Klik tombol "Deploy" di kanan atas -> Pilih "New deployment".
 * 3. Pilih tipe "Web app" (ikon roda gerigi).
 * 4. Atur Konfigurasi:
 *    - Execute as: "Me" (Email Anda)
 *    - Who has access: "Anyone" (Agar aplikasi web diijinkan melakukan POST)
 * 5. Klik "Deploy", beri otorisasi izin akses ketika diminta.
 * 6. Salin "Web app URL" (Tautan Akhiran /exec) dan tempel di form pengaturan ini!
 */

function doPost(e) {
  try {
    var jsonString = e.postData.contents;
    var data = JSON.parse(jsonString);
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    
    // Tulis baris header jika file spreadsheet masih kosong
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        "Waktu Input/Sync", 
        "NISN", 
        "Nama Lengkap", 
        "Gender (L/P)", 
        "Kelas", 
        "Tempat Lahir", 
        "Tanggal Lahir", 
        "Nama Wali", 
        "Kontak Wali",
        "Status Siswa"
      ]);
    }
    
    var timestamp = new Date();
    var timezone = Session.getScriptTimeZone();
    var dateFormatted = Utilities.formatDate(timestamp, timezone, "yyyy-MM-dd HH:mm:ss");
    
    if (Array.isArray(data)) {
      // Input massal (Bulk Sync)
      for (var i = 0; i < data.length; i++) {
        sheet.appendRow([
          dateFormatted,
          data[i].nisn || "",
          data[i].nama || "",
          data[i].gender || "",
          data[i].kelas || "",
          data[i].tempatLahir || "",
          data[i].tanggalLahir || "",
          data[i].namaWali || "",
          data[i].teleponWali || "",
          data[i].status || ""
        ]);
      }
    } else {
      // Input tunggal (Single Student Registration)
      sheet.appendRow([
        dateFormatted,
        data.nisn || "",
        data.nama || "",
        data.gender || "",
        data.kelas || "",
        data.tempatLahir || "",
        data.tanggalLahir || "",
        data.namaWali || "",
        data.teleponWali || "",
        data.status || ""
      ]);
    }
    
    return ContentService.createTextOutput(JSON.stringify({ 
      "status": "success", 
      "message": "Data berhasil masuk otomatis ke Google Spreadsheet!" 
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ 
      "status": "error", 
      "message": error.toString() 
    })).setMimeType(ContentService.MimeType.JSON);
  }
}`;

interface PengaturanViewProps {
  config: SystemConfig;
  onUpdateConfig: (updated: SystemConfig) => void;
  onResetData: () => void;
  onPurgeData: () => void;
  onExportBackup: () => void;
}

export default function PengaturanView({
  config,
  onUpdateConfig,
  onResetData,
  onPurgeData,
  onExportBackup
}: PengaturanViewProps) {
  const [tempConfig, setTempConfig] = useState<SystemConfig>({ ...config });
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  const [googleUser, setGoogleUser] = useState<User | null>(null);
  const [googleToken, setGoogleToken] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isCreatingSheet, setIsCreatingSheet] = useState(false);
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');

  useEffect(() => {
    const unsubscribe = initAuth(
      (user, token) => {
        setGoogleUser(user);
        setGoogleToken(token);
      },
      () => {
        setGoogleUser(null);
        setGoogleToken(null);
      }
    );
    return () => unsubscribe();
  }, []);

  const handleGoogleLogin = async () => {
    setIsLoggingIn(true);
    try {
      const res = await googleSignIn();
      if (res) {
        setGoogleUser(res.user);
        setGoogleToken(res.accessToken);
      }
    } catch (err: any) {
      const errStr = String(err.code || err.message || err);
      if (errStr.includes('popup-closed-by-user') || errStr.includes('cancelled-popup-request')) {
        console.warn('Google Sign-In was cancelled or closed by the user.');
      } else {
        alert(`Gagal masuk menggunakan Google: ${err.message || err}`);
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleGoogleLogout = async () => {
    if (confirm('Apakah Anda yakin ingin memutuskan sambungan akun Google Anda?')) {
      await googleLogout();
      setGoogleUser(null);
      setGoogleToken(null);
    }
  };

  const handleCreateAutoSheets = async () => {
    setIsCreatingSheet(true);
    try {
      const token = googleToken || localStorage.getItem('g_sheets_token') || sessionStorage.getItem('g_sheets_token');
      if (!token) {
        alert('Sesi Google Anda tidak aktif. Mohon klik "Hubungkan ke Akun Google" terlebih dahulu.');
        return;
      }
      const title = `Sirekap Madrasah - Data Santri [${tempConfig.tahunAjaranAktif.replace('/', '-')}]`;
      const sheetsResponse = await createNewSpreadsheet(token, title);
      setTempConfig(prev => ({
        ...prev,
        googleSpreadsheetId: sheetsResponse.spreadsheetId
      }));
      alert(`Sukses! Selesai membuat Spreadsheet baru:\n"${title}"\nID: ${sheetsResponse.spreadsheetId}\n\nHarap menekan tombol "Simpan Konfigurasi" di kanan atas.`);
    } catch (err: any) {
      alert(`Gagal membuat spreadsheet baru: ${err.message || err}`);
    } finally {
      setIsCreatingSheet(false);
    }
  };

  const handleTestAutoSheets = async () => {
    const token = googleToken || localStorage.getItem('g_sheets_token') || sessionStorage.getItem('g_sheets_token');
    if (!token) {
      alert('Sesi Google Anda tidak aktif. Mohon klik "Hubungkan ke Akun Google" terlebih dahulu.');
      return;
    }
    if (!tempConfig.googleSpreadsheetId) {
      alert('Harap ketik atau buat ID Spreadsheet terlebih dahulu untuk menguji koneksi.');
      return;
    }
    setTestStatus('testing');
    try {
      const ok = await testSpreadsheetConnection(token, tempConfig.googleSpreadsheetId);
      if (ok) {
        setTestStatus('success');
        alert('Koneksi Sukses! Spreadsheet telah terdeteksi dan siap digunakan secara langsung.');
      } else {
        setTestStatus('error');
        alert('Koneksi Gagal! Pastikan ID Spreadsheet sudah benar dan akun Anda memiliki akses.');
      }
    } catch (err: any) {
      setTestStatus('error');
      alert(`Terjadi kesalahan pengujian koneksi: ${err.message || err}`);
    } finally {
      setTimeout(() => setTestStatus('idle'), 4000);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setTempConfig(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setTempConfig(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setTempConfig(prev => ({
          ...prev,
          logoUrl: reader.result as string
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleKopGambarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setTempConfig(prev => ({
          ...prev,
          kopSuratGambarUrl: reader.result as string
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateConfig(tempConfig);
    setSaveStatus('Berhasil disimpan!');
    setTimeout(() => setSaveStatus(null), 3000);
  };

  return (
    <div id="pengaturan-viewport" className="space-y-6 animate-fade-in">
      {/* Configuration Form wrapper */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Core Settings column */}
        <form onSubmit={handleSave} className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center border-b border-slate-50 pb-3">
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Parameter Sistem Operasional</h3>
              <p className="text-xs text-slate-400">Pengaturan tahun ajaran aktif, pelaksana fungsionalbendahara & kepala</p>
            </div>
            <button
              type="submit"
              className="bg-emerald-700 hover:bg-emerald-800 text-white font-semibold px-4.5 py-2 rounded-xl text-xs transition duration-150 flex items-center gap-1 shadow-sm"
              id="save-config-btn"
            >
              <Save size={14} /> Simpan Konfigurasi
            </button>
          </div>

          {saveStatus && (
            <div className="bg-emerald-50 border border-emerald-100 text-emerald-800 text-xs py-2 px-3.5 rounded-xl font-semibold animate-pulse">
              {saveStatus}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Tahun Ajaran Aktif</label>
              <input
                type="text"
                name="tahunAjaranAktif"
                value={tempConfig.tahunAjaranAktif || ''}
                onChange={handleInputChange}
                className="w-full text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 focus:ring-1 focus:ring-emerald-500 outline-none"
                required
              />
            </div>

            <div>
              <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Semester Lancar</label>
              <select
                name="semesterAktif"
                value={tempConfig.semesterAktif || 'Ganjil'}
                onChange={handleInputChange}
                className="w-full text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 focus:ring-1 focus:ring-emerald-500 outline-none"
              >
                <option value="Ganjil">Ganjil</option>
                <option value="Genap">Genap</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Nama Bendahara Madrasah</label>
              <input
                type="text"
                name="namaBendahara"
                value={tempConfig.namaBendahara || ''}
                onChange={handleInputChange}
                className="w-full text-xs border border-slate-200 rounded-lg px-2.5 py-1.5"
                required
              />
            </div>

            <div>
              <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">NIP Bendahara</label>
              <input
                type="text"
                name="nipBendahara"
                value={tempConfig.nipBendahara || ''}
                onChange={handleInputChange}
                className="w-full text-xs border border-slate-200 rounded-lg px-2.5 py-1.5"
              />
            </div>

            <div>
              <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Nama Pejabat Penandatangan Surat</label>
              <input
                type="text"
                name="ttdKepalaNama"
                value={tempConfig.ttdKepalaNama || ''}
                onChange={handleInputChange}
                className="w-full text-xs border border-slate-200 rounded-lg px-2.5 py-1.5"
                required
              />
            </div>

            <div>
              <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Jabatan Ttd Dokumen Dinas</label>
              <input
                type="text"
                name="ttdKepalaJabatan"
                value={tempConfig.ttdKepalaJabatan || ''}
                onChange={handleInputChange}
                className="w-full text-xs border border-slate-200 rounded-lg px-2.5 py-1.5"
                required
              />
            </div>

            <div className="sm:col-span-2 border-t border-slate-50 pt-3 space-y-3">
              <h4 className="font-semibold text-slate-800 text-xs">Pesan Panel Sambutan Operator (OPM)</h4>
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Judul Panel</label>
                <input
                  type="text"
                  name="sambutanHeading"
                  value={tempConfig.sambutanHeading || ''}
                  onChange={handleInputChange}
                  className="w-full text-xs border border-slate-200 rounded-lg px-2.5 py-1.5"
                  required
                />
              </div>
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Teks Pemberitahuan</label>
                <textarea
                  name="sambutanTeks"
                  value={tempConfig.sambutanTeks || ''}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full text-xs border border-slate-200 rounded-lg px-3 py-1.5 focus:ring-1 focus:ring-emerald-500 outline-none"
                  required
                />
              </div>
            </div>

            {/* Kop Surat Configuration */}
            <div className="sm:col-span-2 border-t border-slate-50 pt-4 space-y-4">
              <div className="border-l-4 border-amber-500 pl-3">
                <h4 className="font-bold text-slate-800 text-xs">Desain Kop Surat Dinas (Letterhead)</h4>
                <p className="text-[10px] text-slate-400">Pilih tipe kop surat formal dan sesuaikan informasi detail atau berkas pemindai (scanner).</p>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1.5">Tipe Tampilan Kop Surat</label>
                <div className="grid grid-cols-2 gap-3">
                  <label className={`border rounded-xl p-3 flex flex-col justify-between cursor-pointer transition ${tempConfig.kopSuratTipe === 'teks' ? 'border-emerald-500 bg-emerald-50/50' : 'border-slate-200 hover:bg-slate-50'}`}>
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="kopSuratTipe"
                        value="teks"
                        checked={tempConfig.kopSuratTipe === 'teks'}
                        onChange={handleInputChange}
                        className="text-emerald-600 focus:ring-emerald-500"
                      />
                      <span className="font-bold text-slate-700 text-xs text-emerald-950">Desain Digital (Teks HTML)</span>
                    </div>
                    <p className="text-[9px] text-slate-400 mt-1 leading-snug">Menghasilkan kop surat otomatis secara dinamis lengkap dengan logo sekolah dan opsional ornamen kaligrafi Arab.</p>
                  </label>

                  <label className={`border rounded-xl p-3 flex flex-col justify-between cursor-pointer transition ${tempConfig.kopSuratTipe === 'gambar' ? 'border-emerald-500 bg-emerald-50/50' : 'border-slate-200 hover:bg-slate-50'}`}>
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="kopSuratTipe"
                        value="gambar"
                        checked={tempConfig.kopSuratTipe === 'gambar'}
                        onChange={handleInputChange}
                        className="text-emerald-600 focus:ring-emerald-500"
                      />
                      <span className="font-bold text-slate-700 text-xs text-emerald-950">Berkas Kop Utuh (File Gambar)</span>
                    </div>
                    <p className="text-[9px] text-slate-400 mt-1 leading-snug">Menggunakan pindaian gambar/kop resmi yang Anda unggah secara utuh (sangat direkomendasikan jika memiliki dokumen fisik asli).</p>
                  </label>
                </div>
              </div>

              {tempConfig.kopSuratTipe === 'teks' ? (
                <div className="bg-slate-50/50 border border-slate-100 rounded-xl p-4 space-y-3.5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Baris 1: Nama Yayasan / Instansi</label>
                      <input
                        type="text"
                        name="kopSuratYayasan"
                        value={tempConfig.kopSuratYayasan || ''}
                        onChange={handleInputChange}
                        className="w-full text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 focus:ring-1 focus:ring-emerald-500 bg-white"
                        placeholder="YAYASAN MADRASAH TANWIRIYYAH"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Baris 2: Nama Lembaga Pendidikan</label>
                      <input
                        type="text"
                        name="kopSuratMadrasah"
                        value={tempConfig.kopSuratMadrasah || ''}
                        onChange={handleInputChange}
                        className="w-full text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 focus:ring-1 focus:ring-emerald-500 bg-white"
                        placeholder="MADRASAH TSANAWIYAH"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Baris 3: Status Akreditasi • NSM • NPSN</label>
                    <input
                      type="text"
                      name="kopSuratAkreditasiLines"
                      value={tempConfig.kopSuratAkreditasiLines || ''}
                      onChange={handleInputChange}
                      className="w-full text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 focus:ring-1 focus:ring-emerald-500 bg-white"
                      placeholder='TERAKREDITASI "A" - NSM : 121232030051 - NPSN : 20277997'
                    />
                  </div>

                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Baris 4: Informasi Alamat & Telepon</label>
                    <input
                      type="text"
                      name="kopSuratAlamat"
                      value={tempConfig.kopSuratAlamat || ''}
                      onChange={handleInputChange}
                      className="w-full text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 focus:ring-1 focus:ring-emerald-500 bg-white"
                      placeholder="Jl. Aria Wiratanudatar Km. 5 Sindanglaka Karangtengah Cianjur 43281 Telp. (0263) 265414"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="kopSuratShowArabic"
                      name="kopSuratShowArabic"
                      checked={!!tempConfig.kopSuratShowArabic}
                      onChange={handleCheckboxChange}
                      className="text-emerald-600 focus:ring-emerald-500 rounded border-slate-300"
                    />
                    <label htmlFor="kopSuratShowArabic" className="text-[10px] uppercase font-bold text-slate-500 cursor-pointer select-none">
                      Tampilkan Ornamen Kaligrafi Arab Bismillah di Atas Judul
                    </label>
                  </div>

                  <div className="border-t border-slate-200/50 pt-3">
                    <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Logo Sekolah Kiri (PNG / JPEG)</label>
                    <div className="flex items-center gap-3 bg-white p-2.5 rounded-xl border border-slate-150">
                      <div className="w-11 h-11 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-center shrink-0 overflow-hidden">
                        {tempConfig.logoUrl ? (
                          <img src={tempConfig.logoUrl} alt="Logo Preview" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-[10px] text-slate-400 font-serif">Logo</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleLogoUpload}
                          className="text-[10px] text-slate-500 file:mr-2 file:py-1 file:px-2 file:rounded-lg file:border-0 file:text-[9px] file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 cursor-pointer w-full"
                        />
                        <p className="text-[8px] text-slate-400 mt-1">Unggah logo transparan untuk hasil terbaik di lembaran dokumen.</p>
                      </div>
                      {tempConfig.logoUrl && (
                        <button
                          type="button"
                          onClick={() => setTempConfig(prev => ({ ...prev, logoUrl: '' }))}
                          className="text-[9px] text-rose-600 hover:text-rose-700 font-bold uppercase transition focus:outline-none"
                        >
                          Hapus
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-50/50 border border-slate-100 rounded-xl p-4 space-y-3">
                  <label className="text-[10px] uppercase font-bold text-slate-400 block">Unggah Gambar Kop Surat Utuh (Bentuk Spanduk Banner)</label>
                  <div className="border-2 border-dashed border-slate-200 hover:border-emerald-500 bg-white transition rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer text-center relative group">
                    {tempConfig.kopSuratGambarUrl ? (
                      <div className="space-y-2 w-full">
                        <img src={tempConfig.kopSuratGambarUrl} alt="Kop Surat Gambar Preview" className="max-h-24 mx-auto object-contain border rounded-lg shadow-2xs" />
                        <p className="text-[9px] text-slate-500 font-semibold text-center">Gambar kop surat resmi terunggah.</p>
                      </div>
                    ) : (
                      <>
                        <span className="text-2xl mb-1">🖼️</span>
                        <p className="text-xs font-semibold text-slate-600">Klik untuk mengunggah Gambar Kop Surat</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">Disarankan resolusi pindaian lebar minimal 1200px (PNG/JPG)</p>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleKopGambarUpload}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    />
                  </div>
                  {tempConfig.kopSuratGambarUrl && (
                    <button
                      type="button"
                      onClick={() => setTempConfig(prev => ({ ...prev, kopSuratGambarUrl: '' }))}
                      className="text-[10px] text-rose-600 hover:text-rose-700 font-bold uppercase block mx-auto text-center mt-1"
                    >
                      Hapus & Ganti Gambar Kop
                    </button>
                  )}
                </div>
              )}

              {/* REAL-TIME PREVIEW OF THE LETTERHEAD */}
              <div className="mt-4 border border-emerald-100 bg-white rounded-2xl p-4 shadow-3xs space-y-2">
                <span className="text-[10px] uppercase font-bold text-emerald-800 tracking-wider flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                  Pratinjau Kop Surat Cetak (Real-time)
                </span>
                <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/20 overflow-hidden select-none pointer-events-none">
                  {tempConfig.kopSuratTipe === 'gambar' && tempConfig.kopSuratGambarUrl ? (
                    <div className="w-full text-center py-2">
                      <img
                        src={tempConfig.kopSuratGambarUrl}
                        alt="Kop Surat Gambar Utuh"
                        className="w-full h-auto object-contain max-h-24 mx-auto"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 pb-3 border-b-2 border-double border-slate-400">
                      {/* Logo */}
                      <div className="shrink-0 flex items-center justify-center">
                        {tempConfig.logoUrl ? (
                          <img
                            src={tempConfig.logoUrl}
                            alt="Logo Sekolah"
                            className="w-10 h-10 sm:w-12 sm:h-12 object-contain"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <DefaultLogoSvg />
                        )}
                      </div>

                      {/* Header Text */}
                      <div className="flex-1 text-center space-y-0.5">
                        {tempConfig.kopSuratShowArabic !== false && <BasmalahSvg />}
                        <p className="text-slate-800 font-black text-[9px] sm:text-[10px] tracking-wider uppercase leading-none">
                          {tempConfig.kopSuratYayasan || 'YAYASAN MADRASAH TANWIRIYYAH'}
                        </p>
                        <h4 className="text-slate-900 font-extrabold text-[12px] sm:text-sm font-serif tracking-medium leading-none">
                          {tempConfig.kopSuratMadrasah || 'MADRASAH TSANAWIYAH'}
                        </h4>
                        <p className="text-[8px] text-slate-600 font-bold leading-none">
                          {tempConfig.kopSuratAkreditasiLines || 'TERAKREDITASI "A" - NSM : 121232030051 - NPSN : 20277997'}
                        </p>
                        <p className="text-[7.5px] text-slate-500 font-medium leading-relaxed">
                          {tempConfig.kopSuratAlamat || 'Jl. Aria Wiratanudatar Km. 5 Sindanglaka Karangtengah Cianjur 43281 Telp. (0263) 265414'}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
                <p className="text-[9px] text-slate-400 text-center">Bentuk di atas akan otomatis tercetak di lembaran dokumen PDF resmi madrasah.</p>
              </div>

              {/* GOOGLE SPREADSHEET INTEGRATION SUITE */}
              <div className="sm:col-span-2 border-t border-slate-100 pt-5 space-y-5">
                <div className="flex items-center gap-2">
                  <div className="bg-blue-100 text-blue-800 px-2.5 py-1 rounded-md text-[10px] font-black tracking-wider uppercase flex items-center gap-1">
                    <FileSpreadsheet size={10} /> GOOGLE SHEETS
                  </div>
                  <h4 className="font-extrabold text-slate-800 text-xs">Integrasi Kesiswaan dengan Google Spreadsheet</h4>
                </div>

                <p className="text-xs text-slate-500 leading-relaxed">
                  Sambungkan aplikasi langsung ke Google Drive dan Google Sheets untuk menyimpan, menyelaraskan, dan mencadangkan data santri secara seketika (real-time).
                </p>

                {/* GOOGLE SIGN-IN PLATFORM CARD */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <h5 className="font-bold text-slate-800 text-xs text-left">Status Koneksi Akun Google</h5>
                      <p className="text-[11px] text-slate-400 text-left">Sesi authentikasi Anda untuk mengakses spreadsheet di Google Drive Anda.</p>
                    </div>

                    {googleUser ? (
                      <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-xl">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                        <div className="text-left font-sans">
                          <p className="text-[10px] font-bold text-emerald-900 leading-none">{googleUser.displayName || 'Akun Aktif'}</p>
                          <p className="text-[9px] text-emerald-600 font-mono mt-0.5">{googleUser.email}</p>
                        </div>
                        <button
                          type="button"
                          onClick={handleGoogleLogout}
                          className="ml-2 text-[10px] text-rose-600 hover:text-rose-800 font-bold underline cursor-pointer"
                        >
                          Keluar
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={handleGoogleLogin}
                        disabled={isLoggingIn}
                        className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold text-xs px-3.5 py-2 rounded-xl transition flex items-center gap-2 shadow-xs cursor-pointer disabled:opacity-50"
                      >
                        {isLoggingIn ? (
                          <>
                            <RefreshCw size={14} className="animate-spin text-blue-500" />
                            Menyambungkan...
                          </>
                        ) : (
                          <>
                            <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-4 h-4 shrink-0">
                              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                            </svg>
                            Hubungkan Akun Google
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {/* SELECTION OF INTEGRATION TYPES */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1.5">Metode Sinkronisasi</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setTempConfig(prev => ({ ...prev, googleSyncType: 'native' }));
                        }}
                        className={`text-xs px-3 py-2 rounded-xl transition font-bold text-center border cursor-pointer ${
                          tempConfig.googleSyncType === 'native' || !tempConfig.googleSyncType
                            ? 'bg-blue-50 text-blue-800 border-blue-200'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        Direct Sheets API
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setTempConfig(prev => ({ ...prev, googleSyncType: 'script' }));
                        }}
                        className={`text-xs px-3 py-2 rounded-xl transition font-bold text-center border cursor-pointer ${
                          tempConfig.googleSyncType === 'script'
                            ? 'bg-blue-50 text-blue-800 border-blue-200'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        Web Apps Script
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1.5">Penyelarasan Berkelanjutan</label>
                    <div className="flex items-center gap-2.5 h-9">
                      <input
                        type="checkbox"
                        id="autoSyncToSheets"
                        name="autoSyncToSheets"
                        checked={!!tempConfig.autoSyncToSheets}
                        onChange={handleCheckboxChange}
                        className="w-4.5 h-4.5 text-blue-600 rounded-lg border-slate-200 focus:ring-blue-500 shrink-0 cursor-pointer"
                      />
                      <label htmlFor="autoSyncToSheets" className="text-xs font-bold text-slate-700 leading-tight select-none cursor-pointer text-left">
                        Aktifkan Auto-Run Sinkronisasi Otomatis<br/>
                        <span className="text-[9px] text-slate-400 font-normal">Sinkronisasi baris santri baru secara instan saat pendaftaran disimpan.</span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* METHOD SPECIFIC FOR INTERFACES */}
                {(!tempConfig.googleSyncType || tempConfig.googleSyncType === 'native') ? (
                  // NATIVE GOOGLE SHEETS API CONTROLS
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] uppercase font-bold text-slate-600 block mb-1">ID Google Spreadsheet</label>
                        <input
                          type="text"
                          name="googleSpreadsheetId"
                          value={tempConfig.googleSpreadsheetId || ''}
                          onChange={handleInputChange}
                          placeholder="Salin/Tempel kode ID Spreadsheet disini..."
                          className="w-full text-xs border border-slate-200 rounded-lg px-2.5 py-2 bg-white text-slate-800 placeholder-slate-450 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                        />
                        <p className="text-[9px] text-slate-400 mt-1 text-left leading-normal">
                          Contoh ID dari URL Spreadsheet Anda:<br/>
                          https://docs.google.com/spreadsheets/d/<strong className="text-blue-600 font-mono">ID-SPREADSHEET-ANDA</strong>/edit
                        </p>
                      </div>

                      <div className="space-y-2">
                        <span className="text-[10px] uppercase font-bold text-blue-800 tracking-wider flex items-center gap-1.5 justify-start">
                          <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></span>
                          Perangkat Penyiapan Spreadsheet
                        </span>
                        
                        <div className="flex flex-col gap-2 pt-1">
                          <button
                            type="button"
                            onClick={handleCreateAutoSheets}
                            disabled={isCreatingSheet || !googleToken}
                            title={!googleToken ? "Mohon hubungkan akun Google Anda terlebih dahulu" : "Buat berkas spreadsheet baru di akun Google Drive Anda"}
                            className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold text-xs px-3.5 py-2 rounded-xl transition flex items-center justify-center gap-1.5 shadow-5xs disabled:opacity-50 cursor-pointer"
                          >
                            {isCreatingSheet ? (
                              <>
                                <RefreshCw size={13} className="animate-spin text-blue-500" /> Membuat berkas...
                              </>
                            ) : (
                              <>
                                <Plus size={13} /> Buat Spreadsheet Baru otomatis
                              </>
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={handleTestAutoSheets}
                            disabled={testStatus === 'testing' || !googleToken || !tempConfig.googleSpreadsheetId}
                            title={!googleToken ? "Mohon hubungkan akun Google Anda terlebih dahulu" : "Uji otorisasi baca tulis spreadsheet"}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-50 cursor-pointer"
                          >
                            {testStatus === 'testing' ? (
                              <>
                                <RefreshCw size={13} className="animate-spin" /> Menguji koneksi...
                              </>
                            ) : (
                              <>
                                <Check size={13} /> Bersihkan / Uji Koneksi Sheets
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  // ALTERNATIVE GOOGLE APPS SCRIPT WEB APP CONTROLS
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-4">
                    <div>
                      <label className="text-[10px] uppercase font-bold text-slate-600 block mb-1">Tautan Web App Google Apps Script</label>
                      <input
                        type="url"
                        name="appsScriptUrl"
                        value={tempConfig.appsScriptUrl || ''}
                        onChange={handleInputChange}
                        placeholder="https://script.google.com/macros/s/.../exec"
                        className="w-full text-xs border border-slate-200 rounded-lg px-2.5 py-2 bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                      />
                      <p className="text-[9px] text-slate-400 mt-1 text-left">Salin alamat URL Web App Anda dari menu penyebaran (Deployment) Apps Script.</p>
                    </div>

                    <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-900 mt-2">
                      <div className="bg-slate-800 px-4 py-2 border-b border-slate-700 flex items-center justify-between">
                        <span className="text-[10px] font-mono text-slate-300 uppercase tracking-wider font-bold">KODE GOOGLE APPS SCRIPT (Copy-Paste)</span>
                        <button
                          type="button"
                          onClick={() => {
                            window.navigator.clipboard.writeText(googleAppsScriptTemplate);
                            alert("Kode Apps Script berhasil disalin ke papan klip!");
                          }}
                          className="text-[10px] bg-slate-700 hover:bg-slate-600 text-slate-100 font-bold px-2.5 py-1 rounded transition-colors cursor-pointer"
                        >
                          Salin Kode
                        </button>
                      </div>
                      <pre className="p-4 text-[10px] leading-relaxed text-slate-300 font-mono overflow-auto max-h-40 select-all text-left">
                        {googleAppsScriptTemplate}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </form>

        {/* Database backup & maintenance diagnostics */}
        <div className="space-y-6">
          <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-800 text-sm">Pemeliharaan Basis Data</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Seluruh rekap administrasi tersimpan dalam memori penyimpanan lokal browser (localStorage) secara persisten.
            </p>

            <div className="bg-slate-50 border border-slate-100 rounded-lg p-3 mt-3">
              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="autoBackupEnabled"
                  checked={tempConfig.autoBackupEnabled || false}
                  onChange={handleCheckboxChange}
                  className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500"
                />
                <div className="flex-1">
                  <p className="text-xs font-bold text-slate-700">Pengingat Auto-Backup Harian</p>
                  <p className="text-[10px] text-slate-500 leading-relaxed">Sistem akan meminta Anda untuk mengunduh `.json` backup setiap hari secara otomatis.</p>
                </div>
              </label>
            </div>

            <div className="space-y-2.5 pt-2">
              <button
                type="button"
                onClick={onExportBackup}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs p-3 rounded-xl transition flex items-center justify-center gap-2"
                id="export-db-btn"
              >
                <Download size={14} /> Ekspor Backups (.JSON)
              </button>

              <button
                type="button"
                onClick={() => {
                  if (confirm('Apakah Anda yakin ingin memulihkan data bawaan? Seluruh perubahan manual akan tertumpuk.')) {
                    onResetData();
                    alert('Data bawaan berhasil dipulihkan.');
                  }
                }}
                className="w-full bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 font-bold text-xs p-3 rounded-xl transition flex items-center justify-center gap-2"
                id="restore-db-btn"
              >
                <RefreshCw size={14} /> Pulihkan Data Sampel
              </button>

              <button
                type="button"
                onClick={() => {
                  if (confirm('PERINGATAN: Seluruh database (Siswa, Guru, Keuangan, Surat) akan dibersihkan total. Prosedur ini tidak dapat dibatalkan.')) {
                    onPurgeData();
                    alert('Pembersihan database selesai.');
                  }
                }}
                className="w-full hover:bg-rose-100 border border-rose-200/50 text-rose-700 font-bold text-xs p-3 rounded-xl transition flex items-center justify-center gap-2 bg-rose-50/50"
                id="purgue-db-btn"
              >
                <Trash2 size={14} /> Kosongkan Semua Data
              </button>
            </div>
          </div>

          <div className="bg-emerald-950 text-emerald-100 rounded-2xl p-5 shadow-sm space-y-3 relative overflow-hidden">
            <div className="absolute right-0 bottom-0 translate-x-1/4 translate-y-1/4 opacity-10">
              <Heart size={180} />
            </div>
            <h4 className="font-bold text-white flex items-center gap-1.5 text-xs">
              <ShieldCheck size={16} className="text-amber-400" />
              SIAKAD OPM Terintegrasi
            </h4>
            <p className="text-[11px] leading-relaxed opacity-90">
              Version 1.2.0 • Build 2026<br/>
              Terintegrasi penuh dengan standar EMIS Kemenag & Dapodik RI untuk penjenjangan Madrasah Tsanawiyar.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
