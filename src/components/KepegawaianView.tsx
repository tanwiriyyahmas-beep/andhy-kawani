import React, { useState } from 'react';
import { Teacher } from '../types';
import { Search, Plus, Mail, Phone, MapPin, Award, Edit, Trash, Users, CheckSquare, GraduationCap, Upload, Download } from 'lucide-react';

interface KepegawaianViewProps {
  teachers: Teacher[];
  onAddTeacher: (teacher: Teacher) => void;
  onUpdateTeacher: (teacher: Teacher) => void;
  onDeleteTeacher: (id: string) => void;
}

export default function KepegawaianView({
  teachers,
  onAddTeacher,
  onUpdateTeacher,
  onDeleteTeacher
}: KepegawaianViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterEmployment, setFilterEmployment] = useState('Semua');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);

  // Form State
  const [formData, setFormData] = useState<Omit<Teacher, 'id'>>({
    nip: '',
    nama: '',
    gelar: '',
    gender: 'Laki-laki',
    jabatan: '',
    statusKepegawaian: 'GTT',
    kontak: '',
    alamat: '',
    skDinasUrl: '',
    ijazahUrl: '',
    sertifikatUrl: ''
  });

  const handleDocumentChange = (fieldName: 'skDinasUrl' | 'ijazahUrl' | 'sertifikatUrl', file: File | null) => {
    if (!file) {
      setFormData(prev => ({ ...prev, [fieldName]: '' }));
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData(prev => ({
        ...prev,
        [fieldName]: reader.result as string
      }));
    };
    reader.readAsDataURL(file);
  };

  const filteredTeachers = teachers.filter(t => {
    const matchesSearch = t.nama.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          t.jabatan.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesEmp = filterEmployment === 'Semua' || t.statusKepegawaian === filterEmployment;
    return matchesSearch && matchesEmp;
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nama) return;

    if (editingTeacher) {
      onUpdateTeacher({
        ...editingTeacher,
        ...formData
      });
      setEditingTeacher(null);
    } else {
      onAddTeacher({
        id: 'T_' + Date.now(),
        ...formData
      });
    }

    // Reset Form
    setFormData({
      nip: '',
      nama: '',
      gelar: '',
      gender: 'Laki-laki',
      jabatan: '',
      statusKepegawaian: 'GTT',
      kontak: '',
      alamat: '',
      skDinasUrl: '',
      ijazahUrl: '',
      sertifikatUrl: ''
    });
    setShowAddForm(false);
  };

  const handleStartEdit = (teacher: Teacher) => {
    setEditingTeacher(teacher);
    setFormData({
      nip: teacher.nip,
      nama: teacher.nama,
      gelar: teacher.gelar,
      gender: teacher.gender,
      jabatan: teacher.jabatan,
      statusKepegawaian: teacher.statusKepegawaian,
      kontak: teacher.kontak,
      alamat: teacher.alamat,
      skDinasUrl: teacher.skDinasUrl || '',
      ijazahUrl: teacher.ijazahUrl || '',
      sertifikatUrl: teacher.sertifikatUrl || ''
    });
    setShowAddForm(true);
  };

  return (
    <div id="kepegawaian-viewport" className="space-y-6 animate-fade-in">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 border border-slate-100 rounded-2xl shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Direktori Guru Kepegawaian & Ustadz</h2>
          <p className="text-xs text-slate-400">Pengolahan data tenaga pengajar (GTT/Honor) dan staf kependidikan pesantren</p>
        </div>
        <button
          onClick={() => {
            setEditingTeacher(null);
            setFormData({
              nip: '',
              nama: '',
              gelar: '',
              gender: 'Laki-laki',
              jabatan: '',
              statusKepegawaian: 'GTT',
              kontak: '',
              alamat: ''
            });
            setShowAddForm(prev => !prev);
          }}
          className="bg-emerald-700 hover:bg-emerald-800 text-white font-semibold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition duration-150 shadow-sm"
          id="toggle-add-teacher-btn"
        >
          <Plus size={14} /> {showAddForm ? 'Tutup Formulir' : 'Daftarkan Ustadz / Staff'}
        </button>
      </div>

      {/* Recruitment Form */}
      {showAddForm && (
        <form onSubmit={handleSubmit} id="teacher-form" className="bg-white border-2 border-emerald-100 rounded-2xl p-5 shadow-sm space-y-4">
          <h3 className="font-semibold text-slate-800 text-sm">
            {editingTeacher ? `Perbarui Profil: ${editingTeacher.nama}` : 'Pendaftaran Staff / Guru Baru'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Nama Lengkap (Tanpa Gelar)</label>
              <input
                type="text"
                name="nama"
                value={formData.nama}
                onChange={handleInputChange}
                placeholder="misal: H. Luqmanul Hakim"
                className="w-full text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 focus:ring-1 focus:ring-emerald-500 outline-none"
                required
              />
            </div>

            <div>
              <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Gelar Akademik/Agama</label>
              <input
                type="text"
                name="gelar"
                value={formData.gelar}
                onChange={handleInputChange}
                placeholder="misal: S.Pd.I. / Lc."
                className="w-full text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 focus:ring-1 focus:ring-emerald-500 outline-none"
                required
              />
            </div>

            <div>
              <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">NIP (Tulis &apos;-&apos; jika Non-PNS)</label>
              <input
                type="text"
                name="nip"
                value={formData.nip}
                onChange={handleInputChange}
                placeholder="misal: 198901..."
                className="w-full text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 focus:ring-1 focus:ring-emerald-500 outline-none"
              />
            </div>

            <div>
              <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Jenis Kelamin</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
                className="w-full text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 focus:ring-1 focus:ring-emerald-500 outline-none"
              >
                <option value="Laki-laki">Laki-laki</option>
                <option value="Perempuan">Perempuan</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Jabatan / Tugas Mengajar</label>
              <input
                type="text"
                name="jabatan"
                value={formData.jabatan}
                onChange={handleInputChange}
                placeholder="misal: Waka Sarpras & Guru Fiqih"
                className="w-full text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 focus:ring-1 focus:ring-emerald-500 outline-none"
                required
              />
            </div>

            <div>
              <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Status Kepegawaian</label>
              <select
                name="statusKepegawaian"
                value={formData.statusKepegawaian}
                onChange={handleInputChange}
                className="w-full text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 focus:ring-1 focus:ring-emerald-500 outline-none"
              >
                <option value="PNS">Pegawai Negeri Sipil (PNS)</option>
                <option value="GTT">Guru Tetap Yayasan (GTT)</option>
                <option value="Honor">Guru Honor / Relawan</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">No. Kontak / Telepon WA</label>
              <input
                type="text"
                name="kontak"
                value={formData.kontak}
                onChange={handleInputChange}
                placeholder="misal: 0812-7772-1323"
                className="w-full text-xs border border-slate-200 rounded-lg px-2.5 py-1.5"
                required
              />
            </div>

            <div className="md:col-span-4">
              <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Alamat Tinggal Rumah</label>
              <input
                type="text"
                name="alamat"
                value={formData.alamat}
                onChange={handleInputChange}
                placeholder="Sebutkan jalan, RT/RW, kelurahan"
                className="w-full text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 focus:ring-1 focus:ring-emerald-500 outline-none"
                required
              />
            </div>
          </div>

          {/* Dokumen Kepegawaian Berkas */}
          <div className="border-t border-slate-100 pt-4 space-y-3">
            <h4 className="text-[10px] sm:text-xs font-bold text-slate-700 uppercase tracking-wider block">Unggah Berkas Dokumen Pendukung</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* SK field */}
              <div className="bg-slate-50/50 p-3 rounded-xl border border-slate-100 space-y-2">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Surat Keputusan (SK) Pengangkatan</span>
                <input
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg"
                  onChange={(e) => handleDocumentChange('skDinasUrl', e.target.files?.[0] || null)}
                  className="text-[10px] text-slate-500 file:mr-2 file:py-1 file:px-2 file:rounded-lg file:border-0 file:text-[9px] file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 cursor-pointer w-full"
                />
                {formData.skDinasUrl && (
                  <span className="text-[9px] text-emerald-700 bg-emerald-50 font-bold px-2 py-0.5 rounded-full inline-block border border-emerald-100">✔ Berkas Terpasang</span>
                )}
              </div>

              {/* Ijazah field */}
              <div className="bg-slate-50/50 p-3 rounded-xl border border-slate-100 space-y-2">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Ijazah Terakhir (S1/S2/Dinas)</span>
                <input
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg"
                  onChange={(e) => handleDocumentChange('ijazahUrl', e.target.files?.[0] || null)}
                  className="text-[10px] text-slate-500 file:mr-2 file:py-1 file:px-2 file:rounded-lg file:border-0 file:text-[9px] file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 cursor-pointer w-full"
                />
                {formData.ijazahUrl && (
                  <span className="text-[9px] text-emerald-700 bg-emerald-50 font-bold px-2 py-0.5 rounded-full inline-block border border-emerald-100">✔ Berkas Terpasang</span>
                )}
              </div>

              {/* Sertifikat field */}
              <div className="bg-slate-50/50 p-3 rounded-xl border border-slate-100 space-y-2">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Sertifikat Kompetensi & Pelatihan</span>
                <input
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg"
                  onChange={(e) => handleDocumentChange('sertifikatUrl', e.target.files?.[0] || null)}
                  className="text-[10px] text-slate-500 file:mr-2 file:py-1 file:px-2 file:rounded-lg file:border-0 file:text-[9px] file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 cursor-pointer w-full"
                />
                {formData.sertifikatUrl && (
                  <span className="text-[9px] text-emerald-700 bg-emerald-50 font-bold px-2 py-0.5 rounded-full inline-block border border-emerald-100">✔ Berkas Terpasang</span>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs px-3.5 py-1.5 rounded-lg font-medium transition"
            >
              Batal
            </button>
            <button
              type="submit"
              className="bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs px-4 py-1.5 rounded-lg shadow-sm"
              id="save-teacher-submit-btn"
            >
              Simpan Data Personil
            </button>
          </div>
        </form>
      )}

      {/* Directory filter & card layout */}
      <div className="space-y-4">
        <div className="bg-white p-4 border border-slate-100 rounded-2xl shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Cari nama, jabatan, tugas..."
              className="w-full text-xs border border-slate-100 bg-slate-50/50 rounded-xl pl-9 pr-3 py-2 outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div className="flex gap-1">
            {['Semua', 'PNS', 'GTT', 'Honor'].map(stat => (
              <button
                key={stat}
                onClick={() => setFilterEmployment(stat)}
                className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition ${filterEmployment === stat ? 'bg-emerald-700 text-white font-bold' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              >
                {stat === 'Semua' ? 'Semua Status' : stat}
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Teacher Cards Board */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredTeachers.length > 0 ? (
            filteredTeachers.map(teacher => (
              <div key={teacher.id} className="bg-white border border-slate-100 hover:border-emerald-200 hover:shadow-md p-5 rounded-3xl transition space-y-4 relative group shadow-2xs">
                {/* Float controls */}
                <div className="absolute top-4 right-4 flex gap-1">
                  <button
                    onClick={() => handleStartEdit(teacher)}
                    className="p-1 text-slate-400 hover:text-emerald-700 rounded hover:bg-emerald-50 transition"
                  >
                    <Edit size={14} />
                  </button>
                  <button
                    onClick={() => onDeleteTeacher(teacher.id)}
                    className="p-1 text-slate-300 hover:text-rose-600 rounded hover:bg-rose-50 transition"
                  >
                    <Trash size={14} />
                  </button>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center font-extrabold text-emerald-700 shrink-0 border border-emerald-100">
                    <GraduationCap size={22} className="stroke-2" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-slate-800 text-sm leading-snug truncate">
                      {teacher.nama}
                    </h3>
                    <p className="text-emerald-800 text-[11px] font-bold">{teacher.gelar}</p>
                    <span className="text-[10px] text-slate-400 font-mono tracking-wide">NIP: {teacher.nip || '-'}</span>
                  </div>
                </div>

                <div className="border-t border-slate-50 pt-3 space-y-2 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <Award size={14} className="text-amber-500 shrink-0" />
                    <span className="truncate">Tugas: <strong>{teacher.jabatan}</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckSquare size={14} className="text-emerald-600 shrink-0" />
                    <span>Status: <strong className="text-slate-800">{teacher.statusKepegawaian}</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone size={14} className="text-slate-400 shrink-0" />
                    <span>WA: <strong className="font-mono text-slate-700">{teacher.kontak}</strong></span>
                  </div>
                  <div className="flex items-start gap-2 pt-1 border-t border-slate-50/50 text-[11px] text-slate-400 leading-relaxed truncate">
                    <MapPin size={12} className="mt-0.5 shrink-0" />
                    <span>{teacher.alamat}</span>
                  </div>
                </div>

                {/* Dokumen Arsip Lampiran */}
                {(teacher.skDinasUrl || teacher.ijazahUrl || teacher.sertifikatUrl) && (
                  <div className="border-t border-slate-50 pt-3 space-y-1.5">
                    <span className="text-[9px] uppercase font-bold text-emerald-800 tracking-wider block">Berkas Kepegawaian (Unduh)</span>
                    <div className="flex flex-wrap gap-1.5">
                      {teacher.skDinasUrl && (
                        <a
                          href={teacher.skDinasUrl}
                          download={`SK_${teacher.nama.replace(/\s+/g, '_')}`}
                          className="bg-slate-50 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 border border-slate-100 hover:border-emerald-100 text-[10px] font-bold px-2 py-1 rounded-lg inline-flex items-center gap-1 transition shadow-3xs"
                          title="Unduh SK Pengangkatan"
                        >
                          <Download size={9} /> SK
                        </a>
                      )}
                      {teacher.ijazahUrl && (
                        <a
                          href={teacher.ijazahUrl}
                          download={`Ijazah_${teacher.nama.replace(/\s+/g, '_')}`}
                          className="bg-slate-50 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 border border-slate-100 hover:border-emerald-100 text-[10px] font-bold px-2 py-1 rounded-lg inline-flex items-center gap-1 transition shadow-3xs"
                          title="Unduh Salinan Ijazah"
                        >
                          <Download size={9} /> Ijazah
                        </a>
                      )}
                      {teacher.sertifikatUrl && (
                        <a
                          href={teacher.sertifikatUrl}
                          download={`Sertifikat_${teacher.nama.replace(/\s+/g, '_')}`}
                          className="bg-slate-50 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 border border-slate-100 hover:border-emerald-100 text-[10px] font-bold px-2 py-1 rounded-lg inline-flex items-center gap-1 transition shadow-3xs"
                          title="Unduh Sertifikat"
                        >
                          <Download size={9} /> Sertifikat
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-10 bg-slate-50 border border-slate-100 text-slate-400 text-xs rounded-2xl">
              Tidak ada ustadz / pegawai yang cocok dengan filter pencarian.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
