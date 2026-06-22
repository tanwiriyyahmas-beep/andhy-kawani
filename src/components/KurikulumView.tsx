import React, { useState } from 'react';
import { Subject, Teacher, KalenderEvent } from '../types';
import { BookOpen, Award, User, Clock, Plus, Trash, Search, Calendar, ChevronRight } from 'lucide-react';

interface KurikulumViewProps {
  subjects: Subject[];
  teachers: Teacher[];
  kalenderEvents: KalenderEvent[];
  onAddSubject: (subject: Subject) => void;
  onDeleteSubject: (id: string) => void;
  onAddKalenderEvent: (event: KalenderEvent) => void;
  onDeleteKalenderEvent: (id: string) => void;
}

export default function KurikulumView({
  subjects,
  teachers,
  kalenderEvents,
  onAddSubject,
  onDeleteSubject,
  onAddKalenderEvent,
  onDeleteKalenderEvent
}: KurikulumViewProps) {
  const [filterType, setFilterType] = useState<string>('Semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  // New Subject Form State
  const [newSubject, setNewSubject] = useState<Omit<Subject, 'id'>>({
    kode: '',
    nama: '',
    jenis: 'Pendidikan Agama Islam (PAI)',
    skm: 75,
    jamPerMinggu: 2,
    guruPengampuId: ''
  });

  const filteredSubjects = subjects.filter(sub => {
    const matchesFilter = filterType === 'Semua' || sub.jenis === filterType;
    const matchesSearch = sub.nama.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          sub.kode.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getGuruName = (id: string) => {
    const teacher = teachers.find(t => t.id === id);
    return teacher ? `${teacher.nama}, ${teacher.gelar}` : 'Belum Ditentukan';
  };

  const handleCreateSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubject.kode || !newSubject.nama) return;

    onAddSubject({
      ...newSubject,
      id: 'Sub_' + Date.now()
    } as Subject);

    // Reset Form
    setNewSubject({
      kode: '',
      nama: '',
      jenis: 'Pendidikan Agama Islam (PAI)',
      skm: 75,
      jamPerMinggu: 2,
      guruPengampuId: ''
    });
    setShowAddForm(false);
  };

  // New Calendar Event Form State
  const [showAddKalenderForm, setShowAddKalenderForm] = useState(false);
  const [newKalenderEvent, setNewKalenderEvent] = useState<Omit<KalenderEvent, 'id'>>({
    tanggalStr: '',
    nama: '',
    keterangan: ''
  });

  const handleCreateKalenderEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKalenderEvent.nama || !newKalenderEvent.tanggalStr) return;

    onAddKalenderEvent({
      ...newKalenderEvent,
      id: 'Cal_' + Date.now()
    } as KalenderEvent);

    setNewKalenderEvent({
      tanggalStr: '',
      nama: '',
      keterangan: ''
    });
    setShowAddKalenderForm(false);
  };

  return (
    <div id="kurikulum-viewport" className="space-y-6 animate-fade-in">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 border border-slate-100 rounded-2xl shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Kurikulum & Alokasi Pelajaran</h2>
          <p className="text-xs text-slate-400">Pengaturan standar kelulusan KKM/SKM serta pendistribusian jam ajar</p>
        </div>
        <button
          onClick={() => setShowAddForm(prev => !prev)}
          className="bg-emerald-700 hover:bg-emerald-800 text-white font-semibold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition duration-150 shadow-sm"
          id="toggle-add-subject-btn"
        >
          <Plus size={14} /> {showAddForm ? 'Tutup Formulir' : 'Daftarkan Pelajaran'}
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleCreateSubject} id="new-subject-form" className="bg-white border-2 border-emerald-100 rounded-2xl p-5 shadow-sm space-y-4">
          <h3 className="font-semibold text-slate-800 text-sm">Pendaftaran Mata Pelajaran Baru</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Kode Kode Pelajaran</label>
              <input
                type="text"
                value={newSubject.kode}
                onChange={e => setNewSubject(prev => ({ ...prev, kode: e.target.value.toUpperCase() }))}
                placeholder="misal: PAI-FIQ"
                className="w-full text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 focus:ring-1 focus:ring-emerald-500 outline-none"
                required
              />
            </div>
            <div>
              <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Nama Mata Pelajaran</label>
              <input
                type="text"
                value={newSubject.nama}
                onChange={e => setNewSubject(prev => ({ ...prev, nama: e.target.value }))}
                placeholder="misal: Fiqih Ibadah Praktis"
                className="w-full text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 focus:ring-1 focus:ring-emerald-500 outline-none"
                required
              />
            </div>
            <div>
              <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Kategori Jenis</label>
              <select
                value={newSubject.jenis}
                onChange={e => setNewSubject(prev => ({ ...prev, jenis: e.target.value as Subject['jenis'] }))}
                className="w-full text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 focus:ring-1 focus:ring-emerald-500 outline-none"
              >
                <option value="Pendidikan Agama Islam (PAI)">Pendidikan Agama Islam (PAI)</option>
                <option value="Umum">Umum</option>
                <option value="Muatan Lokal">Muatan Lokal</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Standar Kelulusan Minimal (SKM)</label>
              <input
                type="number"
                value={newSubject.skm}
                onChange={e => setNewSubject(prev => ({ ...prev, skm: parseInt(e.target.value) || 0 }))}
                className="w-full text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 focus:ring-1 focus:ring-emerald-500 outline-none"
                min={1}
                max={100}
                required
              />
            </div>
            <div>
              <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Jam Pelajaran per Minggu</label>
              <input
                type="number"
                value={newSubject.jamPerMinggu}
                onChange={e => setNewSubject(prev => ({ ...prev, jamPerMinggu: parseInt(e.target.value) || 1 }))}
                className="w-full text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 focus:ring-1 focus:ring-emerald-500 outline-none"
                min={1}
                required
              />
            </div>
            <div>
              <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Guru Pengampu</label>
              <select
                value={newSubject.guruPengampuId}
                onChange={e => setNewSubject(prev => ({ ...prev, guruPengampuId: e.target.value }))}
                className="w-full text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 focus:ring-1 focus:ring-emerald-500 outline-none"
              >
                <option value="">-- Pilih Guru / Ustadz --</option>
                {teachers.map(t => (
                  <option key={t.id} value={t.id}>{t.nama}, {t.gelar}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs px-3 py-1.5 rounded-lg font-medium transition"
            >
              Batal
            </button>
            <button
              type="submit"
              className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs px-4 py-1.5 rounded-lg font-semibold transition shadow-xs"
            >
              Simpan Pelajaran
            </button>
          </div>
        </form>
      )}

      {/* Grid of lists and academic calendar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Core subjects list */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            {/* Search filter */}
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Cari kode atau nama pelajaran..."
                className="w-full text-xs border border-slate-100 bg-slate-50/50 rounded-xl pl-9 pr-3 py-2 outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
            
            {/* Type categorization tabs */}
            <div className="flex gap-1.5 flex-wrap">
              {['Semua', 'Pendidikan Agama Islam (PAI)', 'Umum', 'Muatan Lokal'].map(type => (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${filterType === type ? 'bg-emerald-700 text-white' : 'bg-slate-100 hover:bg-slate-100 text-slate-600'}`}
                >
                  {type === 'Pendidikan Agama Islam (PAI)' ? 'PAI' : type}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredSubjects.length > 0 ? (
              filteredSubjects.map(sub => (
                <div key={sub.id} className="bg-white border border-slate-100 hover:border-emerald-200 hover:shadow-xs p-5 rounded-2xl transition space-y-3 relative group">
                  <button
                    onClick={() => onDeleteSubject(sub.id)}
                    className="absolute top-4 right-4 text-slate-300 hover:text-rose-600 p-1 hover:bg-rose-50 rounded"
                    title="Hapus Pelajaran"
                  >
                    <Trash size={14} />
                  </button>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-extrabold text-white bg-slate-600 px-2.5 py-0.5 rounded-md">
                      {sub.kode}
                    </span>
                    <span className={`text-[9px] font-semibold px-2 py-0.5 rounded-full ${sub.jenis === 'Pendidikan Agama Islam (PAI)' ? 'bg-emerald-50 text-emerald-800 font-bold' : sub.jenis === 'Muatan Lokal' ? 'bg-amber-50 text-amber-800' : 'bg-sky-50 text-sky-800'}`}>
                      {sub.jenis === 'Pendidikan Agama Islam (PAI)' ? 'Keagamaan (PAI)' : sub.jenis}
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-800 text-sm leading-snug">{sub.nama}</h3>

                  <div className="border-t border-slate-50 pt-2.5 grid grid-cols-2 gap-1.5 text-xs text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <Award size={14} className="text-amber-500" />
                      <span>SKM/KKM: <strong>{sub.skm}</strong></span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock size={14} className="text-slate-400" />
                      <span>Durasi: <strong>{sub.jamPerMinggu} Jam</strong></span>
                    </div>
                    <div className="flex items-center gap-1.5 col-span-2 pt-1">
                      <User size={14} className="text-emerald-700" />
                      <span className="truncate text-[11px] text-slate-600">Pengampu: <strong>{getGuruName(sub.guruPengampuId)}</strong></span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-slate-50 border border-slate-100 text-center p-8 rounded-2xl text-slate-400 text-xs md:col-span-2">
                Tidak ada mata pelajaran yang cocok dengan filter.
              </div>
            )}
          </div>
        </div>

        {/* Academic Event Calendars Info */}
        <div className="space-y-4">
          <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-slate-800 flex items-center gap-1.5 text-sm">
                <Calendar size={18} className="text-emerald-700" />
                Kalender Akademik Ganjil
              </h3>
              <button
                onClick={() => setShowAddKalenderForm(!showAddKalenderForm)}
                className="text-emerald-600 hover:bg-emerald-50 p-1.5 rounded-lg transition"
                title="Tambah Kalender"
              >
                <Plus size={16} />
              </button>
            </div>

            {showAddKalenderForm && (
              <form onSubmit={handleCreateKalenderEvent} className="bg-slate-50 rounded-xl p-4 border border-slate-100 space-y-3">
                <h4 className="text-xs font-bold text-slate-700">Tambah Agenda Baru</h4>
                <div className="space-y-2">
                  <input
                    type="text"
                    value={newKalenderEvent.tanggalStr}
                    onChange={e => setNewKalenderEvent({ ...newKalenderEvent, tanggalStr: e.target.value })}
                    placeholder="Waktu/Tanggal (misal: 15 Juli 2026)"
                    className="w-full text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 focus:ring-1 focus:ring-emerald-500 outline-none"
                    required
                  />
                  <input
                    type="text"
                    value={newKalenderEvent.nama}
                    onChange={e => setNewKalenderEvent({ ...newKalenderEvent, nama: e.target.value })}
                    placeholder="Nama Agenda (misal: Ujian Kenaikan Kelas)"
                    className="w-full text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 focus:ring-1 focus:ring-emerald-500 outline-none"
                    required
                  />
                  <input
                    type="text"
                    value={newKalenderEvent.keterangan}
                    onChange={e => setNewKalenderEvent({ ...newKalenderEvent, keterangan: e.target.value })}
                    placeholder="Keterangan singkat"
                    className="w-full text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 focus:ring-1 focus:ring-emerald-500 outline-none"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowAddKalenderForm(false)}
                    className="text-[10px] px-3 py-1.5 text-slate-500 hover:bg-slate-200 rounded transition"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="text-[10px] px-3 py-1.5 bg-emerald-700 text-white rounded hover:bg-emerald-800 transition font-medium"
                  >
                    Simpan Agenda
                  </button>
                </div>
              </form>
            )}
            
            <div className="space-y-3.5">
              {kalenderEvents.length > 0 ? (
                kalenderEvents.map((ev, idx) => {
                  const isLast = idx === kalenderEvents.length - 1;
                  return (
                    <div key={ev.id} className={`flex gap-3 relative group ${!isLast ? "before:content-[''] before:absolute before:left-[19px] before:top-6 before:bottom-0 before:w-0.5 before:bg-emerald-100" : ""}`}>
                      <span className="w-10 h-10 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center font-bold text-emerald-800 text-xs shrink-0 shadow-2xs z-10 relative">
                        {String(idx + 1).padStart(2, '0')}
                      </span>
                      <div className={`flex-1 text-xs ${!isLast ? 'pb-3' : ''} pr-6 relative`}>
                        <p className="font-semibold text-teal-900 text-xs">{ev.tanggalStr}</p>
                        <p className="text-slate-700">{ev.nama}</p>
                        {ev.keterangan && <span className="text-[10px] text-slate-400 font-medium block mt-0.5">{ev.keterangan}</span>}
                        
                        <button
                          onClick={() => onDeleteKalenderEvent(ev.id)}
                          className="absolute right-0 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 text-slate-300 hover:text-rose-600 bg-white p-1 rounded-md shadow-sm border border-slate-100 transition-all"
                          title="Hapus Agenda"
                        >
                          <Trash size={12} />
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-6 text-slate-400 text-xs text-balance">
                  Belum ada agenda akademik.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
