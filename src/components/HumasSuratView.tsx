import React, { useState } from 'react';
import { DocumentLetter, Student, Teacher, SystemConfig } from '../types';
import { Mail, Search, PlusCircle, Printer, FileText, Check, ArrowUpRight, ArrowDownRight, Eye, RefreshCw, PenTool, Download } from 'lucide-react';

const DefaultLogoSvg = () => (
  <svg viewBox="0 0 100 100" className="w-16 h-16 sm:w-20 sm:h-20 shrink-0 pointer-events-none select-none">
    {/* Outer blue octagon star */}
    <path d="M 30,2 70,2 98,30 98,70 70,98 30,98 2,70 2,30 Z" fill="#1e40af" stroke="#ffffff" strokeWidth="2" />
    <path d="M 32,5 68,5 95,32 95,68 68,95 32,95 5,68 5,32 Z" fill="none" stroke="#2563eb" strokeWidth="1" />
    {/* Inner circle border */}
    <circle cx="50" cy="50" r="38" fill="#1d4ed8" stroke="#ffffff" strokeWidth="1.5" />
    {/* Yellow Crescent and Star */}
    <path d="M 40,43 A 11 11 0 1 0 60,43 A 8 8 0 1 1 40,43 Z" fill="#facc15" />
    <polygon points="50,29 52,34 58,34 53,37 55,42 50,39 45,42 47,37 42,34 48,34" fill="#facc15" />
    {/* Open Book in White */}
    <path d="M 50,65 C 45,61 38,61 32,63 L 32,54 C 38,52 45,52 50,56 C 55,52 62,52 68,54 L 68,63 C 62,61 55,61 50,65 Z" fill="#ffffff" stroke="#1d4ed8" strokeWidth="1" />
    {/* Green Ears of Wheat and Rice */}
    <path d="M 19,50 C 17,40 21,31 25,26" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" />
    <path d="M 81,50 C 83,40 79,31 75,26" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" />
    {/* Curved Text Path */}
    <path id="textPathTop" d="M 17,50 A 33 33 0 1 1 83,50" fill="none" />
    <text className="text-[5.5px] font-black fill-white tracking-widest uppercase">
      <textPath href="#textPathTop" startOffset="50%" textAnchor="middle">
        TSANAWIYAH
      </textPath>
    </text>
  </svg>
);

const BasmalahSvg = () => (
  <div className="w-full text-center py-1 select-none pointer-events-none">
    <span className="font-serif italic font-bold text-[18px] sm:text-[22px] text-slate-800 tracking-wider">
      ﷽
    </span>
  </div>
);

interface HumasSuratProps {
  letters: DocumentLetter[];
  students: Student[];
  teachers: Teacher[];
  config: SystemConfig;
  onAddLetter: (letter: DocumentLetter) => void;
  onDeleteLetter: (id: string) => void;
}

export default function HumasSuratView({
  letters,
  students,
  teachers,
  config,
  onAddLetter,
  onDeleteLetter
}: HumasSuratProps) {
  const [activeSubTab, setActiveSubTab] = useState<'agenda' | 'generator'>('agenda');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('Semua');

  // Letter Log form status
  const [showAddLetter, setShowAddLetter] = useState(false);
  const [logLetter, setLogLetter] = useState<Omit<DocumentLetter, 'id'>>({
    nomorSurat: '',
    perihal: '',
    penerimaPengirim: '',
    tanggal: new Date().toISOString().split('T')[0],
    tipe: 'Keluar',
    kategori: 'Pemberitahuan',
    keterangan: ''
  });

  // Generator State
  const [templateType, setTemplateType] = useState<'keterangan-aktif' | 'undangan-wali' | 'panggilan-disiplin'>('keterangan-aktif');
  const [genNomorSurat, setGenNomorSurat] = useState('090/MTs.T/PP.01/06/2026');
  const [selectedStudentId, setSelectedStudentId] = useState(students[0]?.id || '');
  const [meetingDate, setMeetingDate] = useState('Kamis, 25 Juni 2026');
  const [meetingTime, setMeetingTime] = useState('09:00 WIB - Selesai');
  const [meetingAgenda, setMeetingAgenda] = useState('Pembagian Buku Rapor Semester Ganjil & Sosialisasi Matsama');
  const [infractionReason, setInfractionReason] = useState('Sering terlambat masuk jam pelajaran sabaq diniyyah subuh');
  
  // Print preview layout
  const [showLetterPreview, setShowLetterPreview] = useState(false);

  const filteredLetters = letters.filter(l => {
    const matchesSearch = l.perihal.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          l.nomorSurat.includes(searchQuery) ||
                          l.penerimaPengirim.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'Semua' || l.tipe === filterType;
    return matchesSearch && matchesType;
  });

   const handleLetterFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogLetter(prev => ({
          ...prev,
          arsipUrl: reader.result as string
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogLetterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!logLetter.nomorSurat || !logLetter.perihal) return;

    onAddLetter({
      id: 'L_' + Date.now(),
      ...logLetter
    });

    // Reset
    setLogLetter({
      nomorSurat: '',
      perihal: '',
      penerimaPengirim: '',
      tanggal: new Date().toISOString().split('T')[0],
      tipe: 'Keluar',
      kategori: 'Pemberitahuan',
      keterangan: '',
      arsipUrl: undefined
    });
    setShowAddLetter(false);
  };

  // Find meta for compiled letter
  const getSelectedStudent = () => {
    return students.find(s => s.id === selectedStudentId) || students[0];
  };

  return (
    <div id="humas-viewport" className="space-y-6 animate-fade-in">
      {/* Sub menu tabs */}
      <div className="flex border-b border-slate-100 gap-1">
        <button
          onClick={() => {
            setActiveSubTab('agenda');
            setShowLetterPreview(false);
          }}
          className={`px-4 py-2 text-xs font-semibold rounded-t-xl transition-all ${activeSubTab === 'agenda' ? 'bg-white border border-slate-100 border-b-white text-emerald-800 font-bold' : 'text-slate-500 hover:text-emerald-700'}`}
        >
          Buku Agenda Arsip Surat Dinas
        </button>
        <button
          onClick={() => setActiveSubTab('generator')}
          className={`px-4 py-2 text-xs font-semibold rounded-t-xl transition-all ${activeSubTab === 'generator' ? 'bg-white border border-slate-100 border-b-white text-emerald-800 font-bold' : 'text-slate-500 hover:text-emerald-700'}`}
        >
          Generator Kop Surat Resmi (Cetak instan)
        </button>
      </div>

      {activeSubTab === 'agenda' ? (
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 bg-white p-4 border border-slate-100 rounded-2xl shadow-sm">
            <div className="flex flex-1 flex-wrap gap-2.5 w-full">
              <div className="relative w-full max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Cari perihal, nomor surat, instansi..."
                  className="w-full text-xs border border-slate-100 bg-slate-50/50 rounded-xl pl-9 pr-3 py-2 outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="flex gap-1">
                {['Semua', 'Masuk', 'Keluar'].map(t => (
                  <button
                    key={t}
                    onClick={() => setFilterType(t)}
                    className={`text-xs px-3 py-1.5 rounded-lg font-medium transition ${filterType === t ? 'bg-emerald-700 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'}`}
                  >
                    {t === 'Semua' ? 'Semua Arah' : `Surat ${t}`}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => setShowAddLetter(prev => !prev)}
              className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition flex items-center gap-1 w-full md:w-auto justify-center shadow-xs"
              id="add-letter-btn"
            >
              <PlusCircle size={14} /> Catat Agenda Surat
            </button>
          </div>

          {showAddLetter && (
            <form onSubmit={handleLogLetterSubmit} className="bg-white border-2 border-emerald-100 rounded-2xl p-5 shadow-sm space-y-4 animate-slide-up">
              <h3 className="font-bold text-slate-800 text-sm">Pencatatan Berkas Masuk / Keluar</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Arah Surat</label>
                  <select
                    value={logLetter.tipe}
                    onChange={e => setLogLetter(prev => ({ ...prev, tipe: e.target.value as 'Masuk' | 'Keluar' }))}
                    className="w-full text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 focus:ring-1 focus:ring-emerald-500 outline-none"
                  >
                    <option value="Keluar">Surat Keluar (Diterbitkan Internal)</option>
                    <option value="Masuk">Surat Masuk (Instansi Eksternal)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Nomor Registrasi Surat</label>
                  <input
                    type="text"
                    value={logLetter.nomorSurat}
                    onChange={e => setLogLetter(prev => ({ ...prev, nomorSurat: e.target.value }))}
                    placeholder="Contoh: 045/MTs.T/VI/2026"
                    className="w-full text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 focus:ring-1 focus:ring-emerald-500 outline-none"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Judul Perihal / Hal Utama</label>
                  <input
                    type="text"
                    value={logLetter.perihal}
                    onChange={e => setLogLetter(prev => ({ ...prev, perihal: e.target.value }))}
                    placeholder="misal: Edaran Libur Hari Raya Santri"
                    className="w-full text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 focus:ring-1 focus:ring-emerald-500 outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Penerima (Keluar) / Pengirim (Masuk)</label>
                  <input
                    type="text"
                    value={logLetter.penerimaPengirim}
                    onChange={e => setLogLetter(prev => ({ ...prev, penerimaPengirim: e.target.value }))}
                    placeholder="misal: Kantor Depag Kab. Cianjur"
                    className="w-full text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 focus:ring-1 focus:ring-emerald-500 outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Klasifikasi Kategori</label>
                  <select
                    value={logLetter.kategori}
                    onChange={e => setLogLetter(prev => ({ ...prev, kategori: e.target.value as DocumentLetter['kategori'] }))}
                    className="w-full text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 focus:ring-1 focus:ring-emerald-500 outline-none"
                  >
                    <option value="Undangan">Undangan Resmi</option>
                    <option value="Pemberitahuan">Pemberitahuan / Maklumat</option>
                    <option value="Permohonan">Permohonan Bantuan/Sinergi</option>
                    <option value="Surat Keputusan (SK)">Surat Keputusan Dinas (SK)</option>
                    <option value="Lain-lain">Klasifikasi Umum / Lainnya</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Tanggal Berkas</label>
                  <input
                    type="date"
                    value={logLetter.tanggal}
                    onChange={e => setLogLetter(prev => ({ ...prev, tanggal: e.target.value }))}
                    className="w-full text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 focus:ring-1 focus:ring-emerald-500"
                    required
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Keterangan / Lokasi Map Fisik (Arsip)</label>
                  <input
                    type="text"
                    value={logLetter.keterangan}
                    onChange={e => setLogLetter(prev => ({ ...prev, keterangan: e.target.value }))}
                    placeholder="Map Binder Humas Biru Rak 2"
                    className="w-full text-xs border border-slate-200 rounded-lg px-2.5 py-1.5"
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold text-emerald-600 block mb-1">Unggah Berkas Dokumen</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                      onChange={handleLetterFileChange}
                      className="text-[10px] text-slate-500 file:mr-2 file:py-1 file:px-2 file:rounded-lg file:border-0 file:text-[9px] file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 cursor-pointer w-full"
                    />
                    {logLetter.arsipUrl && (
                      <span className="text-[8px] bg-emerald-50 text-emerald-700 font-bold px-1.5 py-0.5 rounded-full border border-emerald-100 shrink-0">
                        OK
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setShowAddLetter(false)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3.5 py-1.5 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="bg-emerald-700 hover:bg-emerald-800 text-white font-semibold px-4 py-1.5 rounded-lg shadow-sm"
                >
                  Simpan Arsip Surat
                </button>
              </div>
            </form>
          )}

          {/* Table display */}
          <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden p-5">
            <h4 className="font-bold text-slate-800 mb-3 text-sm">Buku Agenda Dokumentasi Humas</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-widest text-[9px]">
                    <th className="py-3 px-4">Tanggal Arsip</th>
                    <th className="py-3 px-4">Nomor & Arah Surat</th>
                    <th className="py-3 px-4">Hal / Subjek Perihal</th>
                    <th className="py-3 px-4">Diterbitkan Oleh / Kepada</th>
                    <th className="py-3 px-4">Lokasi Arsip / Keterangan</th>
                    <th className="py-3 px-4 text-center">Tindakan</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLetters.map(letter => (
                    <tr key={letter.id} className="border-b border-slate-50 hover:bg-slate-50/20 transition-colors">
                      <td className="py-3 px-4 font-mono text-slate-500 whitespace-nowrap">{letter.tanggal}</td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className={`p-1 rounded-sm text-[10px] font-bold shrink-0 ${letter.tipe === 'Masuk' ? 'bg-sky-50 text-sky-700' : 'bg-emerald-50 text-emerald-700'}`}>
                            {letter.tipe === 'Masuk' ? 'MASUK' : 'KELUAR'}
                          </span>
                          <span className="font-mono text-slate-700">{letter.nomorSurat}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-slate-800 block text-xs">{letter.perihal}</span>
                        <span className="text-[10px] text-slate-400">Arsip: {letter.kategori}</span>
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-600">{letter.penerimaPengirim}</td>
                      <td className="py-3 px-4 text-slate-400 italic text-[11px]">{letter.keterangan || 'Map Kotak Humas'}</td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2 justify-center items-center">
                          {letter.arsipUrl && (
                            <a
                              href={letter.arsipUrl}
                              download={`arsip_surat_${letter.nomorSurat.replace(/[\/\\?%*:|"<>\s]/g, '_')}`}
                              className="p-1 px-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded text-[11px] font-bold flex items-center gap-1 shrink-0 transition"
                              title="Unduh Lembar Berkas"
                            >
                              <Download size={11} /> Lihat Berkas
                            </a>
                          )}
                          <button
                            onClick={() => onDeleteLetter(letter.id)}
                            className="p-1 px-2 text-rose-600 hover:bg-rose-50 hover:text-rose-700 rounded text-[11px] font-semibold transition"
                          >
                            Hapus Log
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* Generator of official printable letters */
        <div className="space-y-6">
          <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm space-y-4">
            <h3 className="font-bold text-slate-800 text-base">Alat Penulisan & Generator Kop Surat Otomatis</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Pilih Template Surat</label>
                <select
                  value={templateType}
                  onChange={e => {
                    const type = e.target.value as any;
                    setTemplateType(type);
                    setGenNomorSurat(
                      type === 'keterangan-aktif' ? '120/MTs.T/S.Ket/06/2026' :
                      type === 'undangan-wali' ? '048/MTs.T/Und/VI/2026' : '051/MTs.T/PP.00/V/2026'
                    );
                  }}
                  className="w-full text-xs border border-slate-200 rounded-lg px-2.5 py-2 focus:ring-1 focus:ring-emerald-500 outline-none"
                >
                  <option value="keterangan-aktif">Surat Keterangan Aktif Belajar Siswa</option>
                  <option value="undangan-wali">Surat Undangan Wali Siswa / Rapot</option>
                  <option value="panggilan-disiplin">Surat Panggilan Orang Tua (Tertib Santri)</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Nomor Registrasi Dinas</label>
                <input
                  type="text"
                  value={genNomorSurat}
                  onChange={e => setGenNomorSurat(e.target.value)}
                  className="w-full text-xs border border-slate-200 rounded-lg px-2.5 py-2 focus:ring-1 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Siswa Penerima / Subjek Utama</label>
                <select
                  value={selectedStudentId}
                  onChange={e => setSelectedStudentId(e.target.value)}
                  className="w-full text-xs border border-slate-200 rounded-lg px-2.5 py-2 focus:ring-1 focus:ring-emerald-500 outline-none"
                >
                  {students.map(s => (
                    <option key={s.id} value={s.id}>{s.nama} (Kelas {s.kelas})</option>
                  ))}
                </select>
              </div>

              {/* Conditional templates inputs */}
              {templateType === 'undangan-wali' && (
                <>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Hari & Tanggal Pertemuan</label>
                    <input
                      type="text"
                      value={meetingDate}
                      onChange={e => setMeetingDate(e.target.value)}
                      className="w-full text-xs border border-slate-200 rounded-lg px-2.5 py-1.5"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Jam Waktu Acara</label>
                    <input
                      type="text"
                      value={meetingTime}
                      onChange={e => setMeetingTime(e.target.value)}
                      className="w-full text-xs border border-slate-200 rounded-lg px-2.5 py-1.5"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Agenda Pembahasan Utama</label>
                    <input
                      type="text"
                      value={meetingAgenda}
                      onChange={e => setMeetingAgenda(e.target.value)}
                      className="w-full text-xs border border-slate-200 rounded-lg px-2.5 py-1.5"
                    />
                  </div>
                </>
              )}

              {templateType === 'panggilan-disiplin' && (
                <div className="md:col-span-3">
                  <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Alasan Penindakan Disiplin</label>
                  <input
                    type="text"
                    value={infractionReason}
                    onChange={e => setInfractionReason(e.target.value)}
                    placeholder="Sebutkan pelanggaran ketertiban asrama atau madrasah"
                    className="w-full text-xs border border-slate-200 rounded-lg px-2.5 py-2 focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              )}
            </div>

            <div className="flex gap-2.5 justify-end">
              <button
                onClick={() => setShowLetterPreview(true)}
                className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition flex items-center gap-1.5"
              >
                <Eye size={14} /> Render Kop Surat & Pratinjau
              </button>
            </div>
          </div>

          {/* Letter On-Screen Styled Preview resembling official stamp paper */}
          {showLetterPreview && (
            <div className="bg-white border-2 border-slate-100 rounded-3xl p-8 max-w-3xl mx-auto shadow-lg space-y-6 animate-fade-in relative transition-all" id="official-printable-letter">
              
              {/* Floating Action Button to prompt screen print */}
              <div className="absolute right-5 top-5 print:hidden">
                <button
                  onClick={() => window.print()}
                  className="bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-emerald-950 font-extrabold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1 shadow-sm transition"
                >
                  <Printer size={12} /> CETAK SEKARANG (PDF / Kertas)
                </button>
              </div>              {/* 1. Official Islamic Madrasah Letterhead (Kop Surat) */}
              {config.kopSuratTipe === 'gambar' && config.kopSuratGambarUrl ? (
                <div className="w-full text-center pb-2 border-b-4 border-double border-slate-800">
                  <img
                    src={config.kopSuratGambarUrl}
                    alt="Kop Surat Resmi"
                    className="w-full h-auto object-contain max-h-40 mx-auto"
                    referrerPolicy="no-referrer"
                  />
                </div>
              ) : (
                <div className="flex items-center gap-4 pb-4 border-b-4 border-double border-slate-900 relative">
                  {/* Left hand logo */}
                  <div className="shrink-0 flex items-center justify-center">
                    {config.logoUrl ? (
                      <img
                        src={config.logoUrl}
                        alt="Logo Madrasah"
                        className="w-16 h-16 sm:w-20 sm:h-20 object-contain"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <DefaultLogoSvg />
                    )}
                  </div>

                  {/* Header text */}
                  <div className="flex-1 text-center space-y-0.5">
                    {config.kopSuratShowArabic !== false && <BasmalahSvg />}
                    <p className="text-slate-800 font-extrabold text-[11px] sm:text-xs tracking-wider uppercase leading-none">
                      {config.kopSuratYayasan || 'YAYASAN MADRASAH TANWIRIYYAH'}
                    </p>
                    <h4 className="text-slate-950 font-black text-base sm:text-lg md:text-xl font-serif tracking-wide leading-tight">
                      {config.kopSuratMadrasah || 'MADRASAH TSANAWIYAH'}
                    </h4>
                    <p className="text-[10px] text-slate-700 font-bold leading-normal">
                      {config.kopSuratAkreditasiLines || 'TERAKREDITASI "A" - NSM : 121232030051 - NPSN : 20277997'}
                    </p>
                    <p className="text-[9px] text-slate-500 font-medium leading-relaxed">
                      {config.kopSuratAlamat || 'Jl. Aria Wiratanudatar Km. 5 Sindanglaka Karangtengah Cianjur 43281 Telp. (0263) 265414'}
                    </p>
                  </div>
                </div>
              )}

              {/* 2. Date and Letter reference values */}
              <div className="flex justify-between items-start text-xs pt-2">
                <div className="space-y-0.5">
                  <p>Nomor : {genNomorSurat}</p>
                  <p>Lampiran : -</p>
                  <p>Sifat : Penting / Resmi</p>
                  <p>Perihal : {
                    templateType === 'keterangan-aktif' ? 'Surat Keterangan Aktif Sekolah' :
                    templateType === 'undangan-wali' ? 'Undangan Rapat Wali Siswa' : 'Pemanggilan Wali Siswa Insidental'
                  }</p>
                </div>
                <div>
                  <p>Cianjur, {new Date().toLocaleDateString('id-ID', {day: 'numeric', month: 'long', year: 'numeric'})}</p>
                </div>
              </div>

              {/* 3. Salutation & Greeting */}
              <div className="text-xs text-slate-800 space-y-4">
                {templateType === 'keterangan-aktif' ? (
                  <>
                    <h5 className="text-center font-black text-slate-800 text-sm tracking-wide underline uppercase">SURAT KETERANGAN AKTIF BELAJAR</h5>
                    <p className="leading-relaxed">
                      Yang bertanda tangan di bawah ini, Kepala Madrasah Tsanawiyar Tanwiriyyah Cianjur, menerangkan dengan sesungguhnya bahwa siswa/santri berikut di bawah ini:
                    </p>
                    <div className="pl-6 grid grid-cols-3 gap-y-1.5 max-w-lg font-medium">
                      <div>Nama Lengkap</div><div>: <strong className="text-slate-900">{getSelectedStudent()?.nama}</strong></div><div></div>
                      <div>Nomor NISN</div><div>: <span className="font-mono">{getSelectedStudent()?.nisn}</span></div><div></div>
                      <div>Kelas Penempatan</div><div>: {getSelectedStudent()?.kelas}</div><div></div>
                      <div>Status Keaktifan</div><div>: <span className="text-emerald-700 font-bold">Aktif Mengikuti Pembelajaran</span></div><div></div>
                    </div>
                    <p className="leading-relaxed pt-2">
                      Nama tersebut di atas adalah benar-benar siswa aktif yang terdaftar di Madrasah Tsanawiyah Tanwiriyyah Cianjur pada Tahun Ajaran {config.tahunAjaranAktif} semester {config.semesterAktif} dan senantiasa menaati seluruh tata tertib madrasah formal maupun pesantren salafiyah.
                    </p>
                    <p className="leading-relaxed">
                      Demikian surat keterangan aktif belajar ini kami terbitkan dengan penuh tanggung jawab agar dapat dipergunakan sebagai rujukan keperluan beasiswa, kepasporan, maupun penunjang asuransi yang sah.
                    </p>
                  </>
                ) : templateType === 'undangan-wali' ? (
                  <>
                    <div className="space-y-1 font-medium">
                      <p>Kepada Yth,</p>
                      <p>Bapak/Ibu Orang Tua / Wali dari : <strong>{getSelectedStudent()?.nama}</strong></p>
                      <p>di Tempat</p>
                    </div>

                    <p className="italic font-semibold text-slate-800">Assalamu&apos;alaikum Warahmatullahi Wabarakatuh,</p>
                    <p className="leading-relaxed">
                      Segala puji bagi Allah SWT yang senantiasa melimpahkan hidayah dan barokah-Nya kepada kita semua. Sholawat serta salam semoga tercurah limpahkan kepada Baginda Nabi Muhammad SAW.
                    </p>
                    <p className="leading-relaxed">
                      Sehubungan dengan berakhirnya kalender kegiatan belajar mengajar Semester Ganjil, kami bermaksud mengundang Bapak/Ibu Wali Murid untuk bersurat-temu sekaligus silaturahmi guna membahas laporan prestasi anak yang akan diselenggarakan pada:
                    </p>
                    <div className="pl-6 grid grid-cols-3 gap-y-1 max-w-md font-semibold bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <div>Hari / Tanggal</div><div>: {meetingDate}</div><div></div>
                      <div>Waktu / Jam</div><div>: {meetingTime}</div><div></div>
                      <div>Tempat Acara</div><div>: Aula Serbaguna Lantai 1 Madrasah</div><div></div>
                      <div>Agenda Utama</div><div>: {meetingAgenda}</div><div></div>
                    </div>
                    <p className="leading-relaxed pt-1">
                      Mengingat pentingnya agenda musyawarah pendidikan santri di atas, kehadiran Bapak/Ibu Wali Santri sangat kami harapkan tepat pada waktunya.
                    </p>
                    <p className="italic font-semibold text-slate-800">Wassalamu&apos;alaikum Warahmatullahi Wabarakatuh,</p>
                  </>
                ) : (
                  <>
                    <div className="space-y-1 font-medium">
                      <p>Kepada Yth,</p>
                      <p>Bapak/Ibu Orang Tua / Wali dari : <strong>{getSelectedStudent()?.nama}</strong></p>
                      <p>di Tempat</p>
                    </div>

                    <p className="italic font-semibold text-slate-800">Assalamu&apos;alaikum Warahmatullahi Wabarakatuh,</p>
                    <p className="leading-relaxed">
                      Melalui surat kedinasan ini, kami Dewan Kesantrian dan Tata Tertib Madrasah Tanwiriyyah memohon kesediaan waktu Bapak/Ibu Wali Siswa untuk hadir di Madrasah guna melakukan klarifikasi serta pendampingan musyawarah khusus terkait putra/putri Bapak/Ibu.
                    </p>
                    <p className="leading-relaxed">
                      Adapun rujukan pemanggilan ini dikonsentrasikan sehubungan dengan pelanggaran tertib berikut:
                    </p>
                    <blockquote className="pl-4 py-2 border-l-4 border-amber-500 bg-amber-50/50 text-slate-700 italic font-medium rounded-r-lg">
                      &ldquo;{infractionReason}&rdquo;
                    </blockquote>
                    <p className="leading-relaxed">
                      Bapak/Ibu diharapkan hadir berkonsultasi dangan Kepala Litbang Keagamaan dan Dewan Guru Wali Kelas pada jam kerja operasional madrasah (Senin s.d Kamis jam 08:00 - 13:00 WIB). Sinergi Bapak/Ibu sangat berharga untuk pembinaan karakter santri selanjutnya. 
                    </p>
                    <p className="italic font-semibold text-slate-800">Wassalamu&apos;alaikum Warahmatullahi Wabarakatuh,</p>
                  </>
                )}
              </div>

              {/* 4. Signature Block (Tanda Tangan) */}
              <div className="pt-2 flex justify-end text-xs">
                <div className="text-center space-y-12">
                  <div className="space-y-0.5">
                    <p>Hormat Kami,</p>
                    <p className="font-bold">{config.ttdKepalaJabatan}</p>
                  </div>
                  <div className="space-y-0.5">
                    <p className="font-extrabold text-slate-800 underline uppercase">{config.ttdKepalaNama}</p>
                    <p className="text-[10px] text-slate-400 font-mono">NIP: 197412152002121003</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
