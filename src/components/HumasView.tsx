import React, { useState, useEffect } from 'react';
import { Student, Teacher, SystemConfig } from '../types';
import { 
  Megaphone, 
  Send, 
  MessageSquare, 
  Calendar, 
  Plus, 
  Trash, 
  CheckCircle, 
  MessageCircle, 
  UserCheck, 
  Bell, 
  Heart, 
  HelpCircle,
  Clock,
  ExternalLink,
  ChevronRight
} from 'lucide-react';

interface HumasViewProps {
  students: Student[];
  teachers: Teacher[];
  config: SystemConfig;
}

interface Announcement {
  id: string;
  judul: string;
  tanggal: string;
  target: 'Semua Wali' | 'Kelas VII-A' | 'Guru & Staff' | 'Umum / Publik';
  kategori: 'Akademik' | 'Kegiatan' | 'Keuangan' | 'Informasi Sosialisasi';
  konten: string;
  dibacaCount: number;
}

interface Aspirasi {
  id: string;
  namaPengirim: string;
  peran: string; // e.g., "Wali Santri Ahmad Rafli", "Komite Sekolah", "Warga Bojongherang"
  konten: string;
  tanggal: string;
  status: 'Menunggu' | 'Ditindaklanjuti' | 'Selesai';
  balasanAdmin?: string;
}

const defaultAnnouncements: Announcement[] = [
  {
    id: 'AN_1',
    judul: 'Edaran Libur Akhir Semester Genap & Batas Penyerahan Santri',
    tanggal: '2026-06-18',
    target: 'Semua Wali',
    kategori: 'Akademik',
    konten: 'Diberitahukan kepada seluruh wali santri MTs Tanwiriyyah bahwa libur akhir semester genap dimulai dari tanggal 21 Juni s.d 11 Juli 2026. Santri wajib dijemput oleh orang tua/wali kandung masing-masing ke komplek asrama dengan menunjukkan kartu wali sah.',
    dibacaCount: 145
  },
  {
    id: 'AN_2',
    judul: 'Sosialisasi Program Matsama (Masa Ta\'aruf Siswa Madrasah) Ajaran Baru',
    tanggal: '2026-06-14',
    target: 'Umum / Publik',
    kategori: 'Informasi Sosialisasi',
    konten: 'Bagi seluruh calon wali murid baru kelas VII, pelaksanaan Matsama terpadu akan digelar pada 13 - 15 Juli 2026. Pembekalan perlengkapan kitab kuning penunjang dan seragam dapat diserahkan di Kantor TU Utama.',
    dibacaCount: 98
  },
  {
    id: 'AN_3',
    judul: 'Penggalangan Wakaf Ranjang & Kasur Susun Asrama Putri Al-Kautsar',
    tanggal: '2026-06-10',
    target: 'Semua Wali',
    kategori: 'Keuangan',
    konten: 'Dalam rangka meningkatkan kenyamanan ibadah dan belajar, kami komite madrasah membuka program wakaf bersama pembangunan fasilitas ranjang kokoh di gedung asrama baru. Partisipasi dapat dikoordinasikan langsung dangan bendahara asrama.',
    dibacaCount: 210
  }
];

const defaultAspirasi: Aspirasi[] = [
  {
    id: 'ASP_1',
    namaPengirim: 'Bapak H. Mulyadi',
    peran: 'Wali Santri Ahmad Rafli',
    konten: 'Mohon agar jadwal sabaq setoran dzikir subuh santri dikomunikasikan via kartu kontrol fisik bulanan agar wali bisa sinkron memantau saat liburan di rumah.',
    tanggal: '2026-06-19',
    status: 'Ditindaklanjuti',
    balasanAdmin: 'Terima kasih usulan Bapak H. Mulyadi. Mulai semester baru tim kesantrian asrama sedang menyusun "Buku Saku Mutaba\'ah Terpadu" yang dibawa pulang oleh santri.'
  },
  {
    id: 'ASP_2',
    namaPengirim: 'Ibu Fatimah',
    peran: 'Wali Santri Syifa Nuha',
    konten: 'Alhamdulillah, syukron jazaakumullah atas bimbingan tahfidz para ustadz-ustadzah. Putri saya yang tadinya pemalu sekarang sudah lancar hafal Juz 29 dengan makhraj yang baik.',
    tanggal: '2026-06-17',
    status: 'Selesai',
    balasanAdmin: 'Barakallahu fiik, kami ikut bangga. Semoga ananda senantiasa istiqomah menjaga hafalan dan berbakti kepada orang tua.'
  },
  {
    id: 'ASP_3',
    namaPengirim: 'Kang Deden',
    peran: 'Warga Bojongherang (Komite)',
    konten: 'Apakah bisa dipertimbangkan program bakti sosial remaja masjid madrasah untuk membantu bersih-bersih masjid warga sekitar menjelang Muharram?',
    tanggal: '2026-06-15',
    status: 'Menunggu'
  }
];

export default function HumasView({ students, teachers, config }: HumasViewProps) {
  const [activeSubTab, setActiveSubTab] = useState<'berita' | 'aspirasi'>('berita');
  
  // Persistence states
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [aspirasis, setAspirasis] = useState<Aspirasi[]>([]);

  // Announcement Form
  const [newJudul, setNewJudul] = useState('');
  const [newTarget, setNewTarget] = useState<'Semua Wali' | 'Kelas VII-A' | 'Guru & Staff' | 'Umum / Publik'>('Semua Wali');
  const [newKategori, setNewKategori] = useState<'Akademik' | 'Kegiatan' | 'Keuangan' | 'Informasi Sosialisasi'>('Akademik');
  const [newKonten, setNewKonten] = useState('');
  const [showAddNews, setShowAddNews] = useState(false);

  // Aspirasi Form
  const [aspNama, setAspNama] = useState('');
  const [aspPeran, setAspPeran] = useState('');
  const [aspKonten, setAspKonten] = useState('');
  const [showAddAsp, setShowAddAsp] = useState(false);

  // Reply State
  const [replyId, setReplyId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  // Bulk Broadcast state simulation
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [broadcastTarget, setBroadcastTarget] = useState<string | null>(null);
  const [broadcastSuccess, setBroadcastSuccess] = useState(false);
  const [broadcastProgress, setBroadcastProgress] = useState(0);

  // Initialize
  useEffect(() => {
    const savedAnn = localStorage.getItem('madrasah_announcements');
    if (savedAnn) {
      setAnnouncements(JSON.parse(savedAnn));
    } else {
      setAnnouncements(defaultAnnouncements);
      localStorage.setItem('madrasah_announcements', JSON.stringify(defaultAnnouncements));
    }

    const savedAsp = localStorage.getItem('madrasah_aspirasi');
    if (savedAsp) {
      setAspirasis(JSON.parse(savedAsp));
    } else {
      setAspirasis(defaultAspirasi);
      localStorage.setItem('madrasah_aspirasi', JSON.stringify(defaultAspirasi));
    }
  }, []);

  const saveAnnouncements = (data: Announcement[]) => {
    setAnnouncements(data);
    localStorage.setItem('madrasah_announcements', JSON.stringify(data));
  };

  const saveAspirasi = (data: Aspirasi[]) => {
    setAspirasis(data);
    localStorage.setItem('madrasah_aspirasi', JSON.stringify(data));
  };

  const handleAddAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newJudul || !newKonten) return;

    const newItem: Announcement = {
      id: 'AN_' + Date.now(),
      judul: newJudul,
      tanggal: new Date().toISOString().split('T')[0],
      target: newTarget,
      kategori: newKategori,
      konten: newKonten,
      dibacaCount: Math.floor(Math.random() * 10)
    };

    const next = [newItem, ...announcements];
    saveAnnouncements(next);

    // Reset Form
    setNewJudul('');
    setNewKonten('');
    setNewTarget('Semua Wali');
    setNewKategori('Akademik');
    setShowAddNews(false);
  };

  const handleDeleteAnnouncement = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus pengumuman ini?')) {
      const next = announcements.filter(item => item.id !== id);
      saveAnnouncements(next);
    }
  };

  const handleAddAspirasi = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aspNama || !aspKonten) return;

    const newItem: Aspirasi = {
      id: 'ASP_' + Date.now(),
      namaPengirim: aspNama,
      peran: aspPeran || 'Wali Santri / Komite',
      konten: aspKonten,
      tanggal: new Date().toISOString().split('T')[0],
      status: 'Menunggu'
    };

    const next = [newItem, ...aspirasis];
    saveAspirasi(next);

    // Reset
    setAspNama('');
    setAspPeran('');
    setAspKonten('');
    setShowAddAsp(false);
  };

  const handleDeleteAspirasi = (id: string) => {
    if (confirm('Hapus saran/aduan warga dari database?')) {
      const next = aspirasis.filter(x => x.id !== id);
      saveAspirasi(next);
    }
  };

  const handleResolveAspirasi = (id: string) => {
    const next = aspirasis.map(x => {
      if (x.id === id) {
        return {
          ...x,
          status: 'Selesai' as const
        };
      }
      return x;
    });
    saveAspirasi(next);
  };

  const handleSendReply = (id: string) => {
    if (!replyText) return;
    const next = aspirasis.map(x => {
      if (x.id === id) {
        return {
          ...x,
          balasanAdmin: replyText,
          status: x.status === 'Menunggu' ? 'Ditindaklanjuti' as const : x.status
        };
      }
      return x;
    });
    saveAspirasi(next);
    setReplyId(null);
    setReplyText('');
  };

  // Simulate Sending WA / SMS in background
  const triggerBroadcast = (announcement: Announcement) => {
    if (isBroadcasting) return;
    setBroadcastTarget(announcement.judul);
    setIsBroadcasting(true);
    setBroadcastSuccess(false);
    setBroadcastProgress(5);

    const interval = setInterval(() => {
      setBroadcastProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setBroadcastSuccess(true);
          setTimeout(() => {
            setIsBroadcasting(false);
            setBroadcastTarget(null);
          }, 3000);
          return 100;
        }
        return prev + Math.floor(Math.random() * 25) + 10;
      });
    }, 250);
  };

  return (
    <div id="humas-portal-layout" className="space-y-6 animate-fade-in font-sans">
      
      {/* Visual Header Summary Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm flex items-center gap-3">
          <div className="bg-emerald-50 text-emerald-700 p-3 rounded-lg shrink-0">
            <Megaphone size={20} />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Total Pengumuman</span>
            <span className="text-xl font-black text-slate-800">{announcements.length} Berita</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm flex items-center gap-3">
          <div className="bg-sky-50 text-sky-700 p-3 rounded-lg shrink-0">
            <MessageSquare size={20} />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Aduan & Aspirasi</span>
            <span className="text-xl font-black text-slate-800">{aspirasis.length} Masuk</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm flex items-center gap-3">
          <div className="bg-amber-50 text-amber-700 p-3 rounded-lg shrink-0">
            <Clock size={20} />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Menunggu Respon</span>
            <span className="text-xl font-black text-slate-800">
              {aspirasis.filter(a => a.status === 'Menunggu').length} Antrean
            </span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm flex items-center gap-3">
          <div className="bg-teal-50 text-teal-700 p-3 rounded-lg shrink-0">
            <CheckCircle size={20} />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Aspirasi Terselesaikan</span>
            <span className="text-xl font-black text-teal-800">
              {aspirasis.filter(a => a.status === 'Selesai').length} Selesai
            </span>
          </div>
        </div>
      </div>

      {/* Broadcast progression bar banner */}
      {isBroadcasting && (
        <div className="bg-slate-900 border border-slate-800 text-white rounded-xl p-4 shadow-md space-y-2 animate-pulse">
          <div className="flex justify-between items-center text-xs">
            <strong className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping"></span>
              Menyiarkan Broadcast WhatsApp Multi-grup Wali Santri...
            </strong>
            <span className="font-mono text-[10px] bg-slate-800 px-2 py-0.5 rounded text-emerald-400">{broadcastProgress}%</span>
          </div>
          <p className="text-[10px] text-slate-400 truncate font-semibold">Tujuan: {broadcastTarget}</p>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div 
              className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full transition-all duration-150"
              style={{ width: `${broadcastProgress}%` }}
            ></div>
          </div>
          {broadcastSuccess && (
            <p className="text-[10px] text-emerald-400 font-bold">✓ Sukses! Broadcast terkirim ke 280+ kontak Wali Murid.</p>
          )}
        </div>
      )}

      {/* Navigation Sub-Tabs */}
      <div className="flex border-b border-slate-200 gap-1.5">
        <button
          onClick={() => setActiveSubTab('berita')}
          className={`px-4 py-2.5 text-xs font-semibold rounded-t-xl transition-all ${activeSubTab === 'berita' ? 'bg-white border-x border-t border-slate-200 text-emerald-800 font-bold' : 'text-slate-500 hover:text-emerald-700 hover:bg-slate-50'}`}
        >
          Informasi Humas (Broadcast & Papan Berita)
        </button>
        <button
          onClick={() => setActiveSubTab('aspirasi')}
          className={`px-4 py-2.5 text-xs font-semibold rounded-t-xl transition-all ${activeSubTab === 'aspirasi' ? 'bg-white border-x border-t border-slate-200 text-emerald-800 font-bold' : 'text-slate-500 hover:text-emerald-700 hover:bg-slate-50'}`}
        >
          Kotak Aspirasi Santri & Wali Murid
        </button>
      </div>

      {/* Main interactive cards wrapper */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
        
        {/* SUB TAB 1: NEWS FEED & BROADCAST */}
        {activeSubTab === 'berita' ? (
          <div className="space-y-6">
            
            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-800 text-sm">Papan Informasi & Pengumuman Resmi</h3>
                <p className="text-xs text-slate-400">Kelola rilisan berita madrasah terpadu dan kirim notifikasi massal wali santri.</p>
              </div>
              <button
                onClick={() => setShowAddNews(prev => !prev)}
                className="bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs px-4 py-2 rounded-xl transition flex items-center gap-1 shadow-xs"
              >
                <Plus size={14} /> Tulis Pengumuman Baru
              </button>
            </div>

            {/* Hidden Add announcement form card */}
            {showAddNews && (
              <form onSubmit={handleAddAnnouncement} className="bg-slate-50/50 border border-slate-200 rounded-xl p-5 space-y-4 animate-slide-up">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide">Formulir Pengumuman Baru</h4>
                  <button 
                    type="button" 
                    onClick={() => setShowAddNews(false)}
                    className="text-slate-400 hover:text-slate-600 text-xs font-semibold"
                  >
                    Batal
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Judul Agenda / Pengumuman</label>
                    <input
                      type="text"
                      required
                      value={newJudul}
                      onChange={e => setNewJudul(e.target.value)}
                      placeholder="Contoh: Pemberitahuan Pelunasan Biaya Administrasi Kitab.."
                      className="w-full text-xs border border-slate-200 rounded-lg px-2.5 py-2 outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Kategori Berita</label>
                    <select
                      value={newKategori}
                      onChange={e => setNewKategori(e.target.value as any)}
                      className="w-full text-xs border border-slate-200 rounded-lg p-2 focus:ring-1 focus:ring-emerald-500"
                    >
                      <option value="Akademik">Akademik</option>
                      <option value="Kegiatan">Kegiatan Siswa/i</option>
                      <option value="Keuangan">Keuangan / Dana</option>
                      <option value="Informasi Sosialisasi">Informasi Sosialisasi</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Target Audience</label>
                    <select
                      value={newTarget}
                      onChange={e => setNewTarget(e.target.value as any)}
                      className="w-full text-xs border border-slate-200 rounded-lg p-2 focus:ring-1 focus:ring-emerald-500"
                    >
                      <option value="Semua Wali">Semua Wali Santri</option>
                      <option value="Kelas VII-A">Khusus Wali Roster Kelas</option>
                      <option value="Guru & Staff">Dewan Ustadz & Staff</option>
                      <option value="Umum / Publik">Umum / Portal Publik</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Isi Pengumuman Lengkap (Maklumat)</label>
                    <textarea
                      required
                      rows={3}
                      value={newKonten}
                      onChange={e => setNewKonten(e.target.value)}
                      placeholder="Tuliskan pesan instruksi/informasi di sini dengan format yang sopan dan jelas..."
                      className="w-full text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 focus:ring-1 focus:ring-emerald-500 outline-none"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2.5">
                  <button
                    type="submit"
                    className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs px-4 py-2 rounded-lg shadow-xs"
                  >
                    Simpan & Terbitkan Berita
                  </button>
                </div>
              </form>
            )}

            {/* List Feed Layout of announcements */}
            <div className="space-y-4">
              {announcements.length > 0 ? (
                announcements.map((ann) => (
                  <div 
                    key={ann.id}
                    className="border border-slate-100 hover:border-emerald-300 rounded-xl p-5 hover:bg-slate-50/20 transition duration-200 flex flex-col md:flex-row gap-4 items-start"
                  >
                    {/* Visual icon representation */}
                    <div className="bg-slate-50 text-slate-600 p-3 rounded-lg shrink-0 flex items-center justify-center font-bold text-xs uppercase text-slate-500 border border-slate-100 font-mono w-14 text-center">
                      <div>
                        <span className="block text-emerald-700 text-sm font-black">{ann.tanggal.split('-')[2]}</span>
                        <span className="block text-[8px] mt-0.5">Bln {ann.tanggal.split('-')[1]}</span>
                      </div>
                    </div>

                    {/* Announcement Texts */}
                    <div className="flex-1 space-y-2">
                      <div className="flex flex-wrap gap-2 items-center">
                        <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                          Target: {ann.target}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          ann.kategori === 'Akademik' ? 'bg-teal-50 text-teal-800' :
                          ann.kategori === 'Keuangan' ? 'bg-amber-50 text-amber-800' :
                          ann.kategori === 'Kegiatan' ? 'bg-indigo-50 text-indigo-800' : 'bg-slate-100 text-slate-600'
                        }`}>
                          Kategori: {ann.kategori}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1 ml-auto">
                          <UserCheck size={10} /> Dibaca {ann.dibacaCount}x
                        </span>
                      </div>

                      <h4 className="font-bold text-slate-800 text-sm leading-tight hover:text-emerald-700 cursor-pointer">
                        {ann.judul}
                      </h4>
                      
                      <p className="text-xs text-slate-500 leading-relaxed font-sans">{ann.konten}</p>
                    </div>

                    {/* Operations for Broadcasting */}
                    <div className="shrink-0 flex sm:flex-col gap-2 w-full md:w-auto items-stretch justify-end border-t md:border-none pt-3 md:pt-0">
                      <button
                        onClick={() => triggerBroadcast(ann)}
                        disabled={isBroadcasting}
                        className="bg-emerald-50 text-emerald-800 hover:bg-emerald-600 hover:text-white disabled:opacity-50 text-[10px] font-bold px-3 py-2 rounded-lg flex items-center gap-1.5 transition text-center justify-center border border-emerald-100"
                        title="Simulasikan broadcast link ke WA wali santri secara masif"
                      >
                        <Send size={12} /> Kirim WhatsApp WA-Blast
                      </button>
                      <button
                        onClick={() => handleDeleteAnnouncement(ann.id)}
                        className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 p-2 rounded-lg text-center transition flex justify-center border border-transparent hover:border-slate-100"
                        title="Hapus Maklumat"
                      >
                        <Trash size={12} className="inline-block shrink-0" />
                        <span className="md:hidden text-[10px] font-semibold ml-1.5">Hapus Pengumuman</span>
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-10 text-slate-400 bg-slate-50/50 rounded-xl">
                  Tidak ada pengumuman humas yang saat ini terdaftar.
                </div>
              )}
            </div>
          </div>
        ) : (
          
          /* SUB TAB 2: SUGGESTIONS & FEEDBACK (ASPIRASI) */
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-800 text-sm">Kotak Saran & Aspirasi Wali Murid</h3>
                <p className="text-xs text-slate-400">Dengarkan umpan balik warga madrasah formal, komite, dan asrama dan beri tanggapan.</p>
              </div>
              <button
                onClick={() => setShowAddAsp(prev => !prev)}
                className="bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs px-4 py-2 rounded-xl transition flex items-center gap-1 shadow-xs"
              >
                <Plus size={14} /> Ajukan Aspirasi Baru
              </button>
            </div>

            {/* Hidden Add suggestion form */}
            {showAddAsp && (
              <form onSubmit={handleAddAspirasi} className="bg-slate-50/50 border border-slate-200 rounded-xl p-5 space-y-4 animate-slide-up">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide">Tulis Aspirasi / Saran Baru</h4>
                  <button 
                    type="button" 
                    onClick={() => setShowAddAsp(false)}
                    className="text-slate-400 hover:text-slate-600 text-xs font-semibold"
                  >
                    Batal
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Nama Lengkap Pengusul</label>
                    <input
                      type="text"
                      required
                      value={aspNama}
                      onChange={e => setAspNama(e.target.value)}
                      placeholder="Contoh: Ibu Rina Sofia"
                      className="w-full text-xs border border-slate-200 rounded-lg px-2.5 py-2 outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Peran / Hubungan</label>
                    <input
                      type="text"
                      value={aspPeran}
                      onChange={e => setAspPeran(e.target.value)}
                      placeholder="Contoh: Wali Santri IX-A / Komite warga"
                      className="w-full text-xs border border-slate-200 rounded-lg px-2.5 py-2 outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Isi Saran / Kritik / Aspirasi Konstrutif</label>
                  <textarea
                    required
                    rows={3}
                    value={aspKonten}
                    onChange={e => setAspKonten(e.target.value)}
                    placeholder="Deskripsikan saran, keluhan asrama, masukan sanitasi air dsb..."
                    className="w-full text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 focus:ring-1 focus:ring-emerald-500 outline-none"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs px-4 py-2 rounded-lg"
                  >
                    Kirim Aspirasi Ke Humas
                  </button>
                </div>
              </form>
            )}

            {/* List Feed of feedback cases */}
            <div className="space-y-4">
              {aspirasis.length > 0 ? (
                aspirasis.map((item) => (
                  <div 
                    key={item.id}
                    className="border border-slate-200 rounded-xl p-5 hover:shadow-xs transition bg-slate-50/10 space-y-3"
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div className="font-sans">
                        <strong className="text-slate-800 text-sm block">{item.namaPengirim}</strong>
                        <span className="text-[10px] text-slate-400">{item.peran} • Diajukan: {item.tanggal}</span>
                      </div>
                      <div className="flex gap-1.5 items-center">
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                          item.status === 'Selesai' ? 'bg-emerald-50 text-emerald-800' :
                          item.status === 'Ditindaklanjuti' ? 'bg-sky-50 text-sky-800' : 'bg-amber-50 text-amber-800'
                        }`}>
                          {item.status}
                        </span>
                        
                        <button
                          onClick={() => handleDeleteAspirasi(item.id)}
                          className="text-slate-300 hover:text-rose-600 transition p-1.5"
                          title="Hapus Aduan"
                        >
                          <Trash size={12} />
                        </button>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 bg-white/70 p-3.5 border border-slate-100 rounded-lg leading-relaxed shadow-3xs">{item.konten}</p>

                    {item.balasanAdmin ? (
                      <div className="bg-emerald-50/50 border border-emerald-100 p-4 rounded-lg space-y-1">
                        <span className="text-[9px] font-bold text-emerald-800 uppercase block tracking-wider">Tanggapan Resmi Humas:</span>
                        <p className="text-xs text-slate-700 italic leading-relaxed">{item.balasanAdmin}</p>
                      </div>
                    ) : (
                      <div className="text-right">
                        {replyId === item.id ? (
                          <div className="mt-2 text-left space-y-2">
                            <textarea
                              rows={2}
                              value={replyText}
                              onChange={e => setReplyText(e.target.value)}
                              placeholder="Tuliskan saran penyelesaian / klarifikasi resmi humas di sini..."
                              className="text-xs w-full border border-slate-200 p-2 rounded-lg"
                            />
                            <div className="flex gap-2 justify-end">
                              <button 
                                onClick={() => setReplyId(null)}
                                className="text-slate-400 hover:text-slate-600 text-xs px-2.5 py-1"
                              >
                                Batal
                              </button>
                              <button 
                                onClick={() => handleSendReply(item.id)}
                                className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs px-3.5 py-1 rounded-lg"
                              >
                                Tanggapi & Simpan
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex gap-2 justify-end">
                            <button
                              onClick={() => {
                                setReplyId(item.id);
                                setReplyText('');
                              }}
                              className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold px-3 py-1.5 rounded-lg transition"
                            >
                              Tulis Tanggapan Humas...
                            </button>
                            {item.status !== 'Selesai' && (
                              <button
                                onClick={() => handleResolveAspirasi(item.id)}
                                className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[10px] font-bold px-3 py-1.5 rounded-lg transition border border-emerald-100"
                              >
                                Beri Tanda Selesai
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-10 text-slate-400 bg-slate-50/50 rounded-xl">
                  Belum ada usulan aspirasi terdaftar dari wali murid.
                </div>
              )}
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
