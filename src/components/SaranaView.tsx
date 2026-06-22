import React, { useState } from 'react';
import { Asset } from '../types';
import { Search, PlusCircle, Package, MapPin, AlertCircle, Trash2, Edit3, ClipboardList, PenTool } from 'lucide-react';

interface SaranaViewProps {
  assets: Asset[];
  onAddAsset: (asset: Asset) => void;
  onUpdateAsset: (asset: Asset) => void;
  onDeleteAsset: (id: string) => void;
}

export default function SaranaView({
  assets,
  onAddAsset,
  onUpdateAsset,
  onDeleteAsset
}: SaranaViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterLocation, setFilterLocation] = useState('Semua');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);

  // Form State
  const [formData, setFormData] = useState<Omit<Asset, 'id'>>({
    kode: '',
    nama: '',
    jumlah: 1,
    satuan: 'Unit',
    kondisiBaik: 1,
    kondisiRusakRingan: 0,
    kondisiRusakBerat: 0,
    lokasi: ''
  });

  const filteredAssets = assets.filter(a => {
    const matchesSearch = a.nama.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          a.kode.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLoc = filterLocation === 'Semua' || a.lokasi === filterLocation;
    return matchesSearch && matchesLoc;
  });

  // Calculate unique locations for filter options
  const uniqueLocations = Array.from(new Set(assets.map(a => a.lokasi)));

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const updated = { ...prev, [name]: value };
      
      // Auto adjust total if condition count is updated
      if (['kondisiBaik', 'kondisiRusakRingan', 'kondisiRusakBerat'].includes(name)) {
        const baik = name === 'kondisiBaik' ? parseInt(value) || 0 : prev.kondisiBaik;
        const ringan = name === 'kondisiRusakRingan' ? parseInt(value) || 0 : prev.kondisiRusakRingan;
        const berat = name === 'kondisiRusakBerat' ? parseInt(value) || 0 : prev.kondisiRusakBerat;
        updated.jumlah = baik + ringan + berat;
      }
      return updated;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nama || !formData.kode) return;

    if (editingAsset) {
      onUpdateAsset({
        ...editingAsset,
        ...formData
      });
      setEditingAsset(null);
    } else {
      onAddAsset({
        id: 'A_' + Date.now(),
        ...formData
      });
    }

    // Reset Form
    setFormData({
      kode: '',
      nama: '',
      jumlah: 1,
      satuan: 'Unit',
      kondisiBaik: 1,
      kondisiRusakRingan: 0,
      kondisiRusakBerat: 0,
      lokasi: ''
    });
    setShowAddForm(false);
  };

  const handleStartEdit = (asset: Asset) => {
    setEditingAsset(asset);
    setFormData({
      kode: asset.kode,
      nama: asset.nama,
      jumlah: asset.jumlah,
      satuan: asset.satuan,
      kondisiBaik: asset.kondisiBaik,
      kondisiRusakRingan: asset.kondisiRusakRingan,
      kondisiRusakBerat: asset.kondisiRusakBerat,
      lokasi: asset.lokasi
    });
    setShowAddForm(true);
  };

  return (
    <div id="sarana-viewport" className="space-y-6 animate-fade-in">
      {/* Title Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 border border-slate-100 rounded-2xl shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-800 font-sans">Inventaris Sarana & Prasarana</h2>
          <p className="text-xs text-slate-400">Pencatatan aset gedung utama, fasilitas belajar-mengajar, dan aset inventaris kitab</p>
        </div>
        <button
          onClick={() => {
            setEditingAsset(null);
            setFormData({
              kode: '',
              nama: '',
              jumlah: 1,
              satuan: 'Unit',
              kondisiBaik: 1,
              kondisiRusakRingan: 0,
              kondisiRusakBerat: 0,
              lokasi: ''
            });
            setShowAddForm(prev => !prev);
          }}
          className="bg-emerald-700 hover:bg-emerald-800 text-white font-semibold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition duration-150 shadow-sm"
          id="toggle-add-asset-btn"
        >
          <PenTool size={14} /> {showAddForm ? 'Tutup Formulir' : 'Daftarkan Aset Baru'}
        </button>
      </div>

      {/* New Asset entry */}
      {showAddForm && (
        <form onSubmit={handleSubmit} id="asset-entry-form" className="bg-white border-2 border-emerald-100 rounded-2xl p-5 shadow-sm space-y-4 animate-slide-up">
          <h3 className="font-semibold text-slate-800 text-sm">
            {editingAsset ? `Perbarui Aset: ${editingAsset.nama}` : 'Pencatatan Sarana Inventaris Baru'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Kode Kode Aset</label>
              <input
                type="text"
                name="kode"
                value={formData.kode}
                onChange={handleInputChange}
                placeholder="misal: INV-PC-01"
                className="w-full text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 focus:ring-1 focus:ring-emerald-500 outline-none"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Nama Deskripsi Aset</label>
              <input
                type="text"
                name="nama"
                value={formData.nama}
                onChange={handleInputChange}
                placeholder="misal: Kursi Belajar Kayu Murid"
                className="w-full text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 focus:ring-1 focus:ring-emerald-500 outline-none"
                required
              />
            </div>

            <div>
              <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Satuan Barang</label>
              <select
                name="satuan"
                value={formData.satuan}
                onChange={handleInputChange}
                className="w-full text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 focus:ring-1 focus:ring-emerald-500 outline-none"
              >
                <option value="Unit">Unit (Elektronik/Mesin)</option>
                <option value="Buah">Buah (Mebel/Kitab)</option>
                <option value="Set">Set (Paket/Komplek)</option>
                <option value="Ruang">Ruang (Gedung)</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Kondisi Baik</label>
              <input
                type="number"
                name="kondisiBaik"
                value={formData.kondisiBaik}
                onChange={handleInputChange}
                className="w-full text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 focus:ring-1 focus:ring-emerald-500 outline-none"
                min={0}
                required
              />
            </div>

            <div>
              <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Kondisi Rusak Ringan</label>
              <input
                type="number"
                name="kondisiRusakRingan"
                value={formData.kondisiRusakRingan}
                onChange={handleInputChange}
                className="w-full text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 focus:ring-1 focus:ring-emerald-500 outline-none"
                min={0}
                required
              />
            </div>

            <div>
              <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Kondisi Rusak Berat</label>
              <input
                type="number"
                name="kondisiRusakBerat"
                value={formData.kondisiRusakBerat}
                onChange={handleInputChange}
                className="w-full text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 focus:ring-1 focus:ring-emerald-500 outline-none"
                min={0}
                required
              />
            </div>

            <div>
              <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Rincian Lokasi Penempatan</label>
              <input
                type="text"
                name="lokasi"
                value={formData.lokasi}
                onChange={handleInputChange}
                placeholder="misal: Lab Komputer"
                className="w-full text-xs border border-slate-200 rounded-lg px-2.5 py-1.5"
                required
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs px-3.5 py-1.5 rounded-lg"
            >
              Batal
            </button>
            <button
              type="submit"
              className="bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs px-4 py-1.5 rounded-lg shadow-sm"
            >
              Simpan Data Aset
            </button>
          </div>
        </form>
      )}

      {/* Roster & Grid of assets */}
      <div className="space-y-4">
        <div className="bg-white p-4 border border-slate-100 rounded-2xl shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Cari nama barang atau kode inventaris..."
              className="w-full text-xs border border-slate-100 bg-slate-50/50 rounded-xl pl-9 pr-3 py-2 outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          {/* Location filter */}
          <div className="flex items-center gap-1.5 min-w-[200px] w-full sm:w-auto">
            <ClipboardList size={14} className="text-slate-400 shrink-0" />
            <select
              value={filterLocation}
              onChange={e => setFilterLocation(e.target.value)}
              className="text-xs border border-slate-100 bg-slate-50/50 rounded-xl px-2 py-2 outline-none focus:ring-1 focus:ring-emerald-500 w-full"
            >
              <option value="Semua">Semua Lokasi Penempatan</option>
              {uniqueLocations.map(loc => (
                <option key={loc} value={loc}>{loc}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Dynamic Items list table */}
        <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden p-5">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-widest text-[9px]">
                  <th className="py-3 px-4">Kode & Deskripsi Aset</th>
                  <th className="py-3 px-4">Penempatan Lokasi</th>
                  <th className="py-3 px-4 text-center">Bagus</th>
                  <th className="py-3 px-2 text-center text-amber-600">Slightly Damaged</th>
                  <th className="py-3 px-2 text-center text-rose-600">Broken</th>
                  <th className="py-3 px-4 text-center">Total Volume</th>
                  <th className="py-3 px-4 text-center">Tindakan</th>
                </tr>
              </thead>
              <tbody>
                {filteredAssets.length > 0 ? (
                  filteredAssets.map(asset => (
                    <tr key={asset.id} className="border-b border-slate-50 hover:bg-slate-50/20 transition-colors">
                      <td className="py-3 px-4">
                        <div>
                          <strong className="text-slate-800 text-sm font-semibold block">{asset.nama}</strong>
                          <span className="text-[10px] text-slate-400 font-mono tracking-widest">KODE: {asset.kode}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-zinc-600 font-semibold bg-zinc-100/60 px-2 py-1 rounded-lg flex items-center gap-1 w-fit max-w-[200px] truncate text-[11px]">
                          <MapPin size={10} className="text-emerald-700" />
                          {asset.lokasi}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center font-bold text-emerald-800 bg-emerald-50/10">
                        {asset.kondisiBaik} {asset.satuan}
                      </td>
                      <td className="py-3 px-2 text-center font-bold text-amber-700 bg-amber-50/10">
                        {asset.kondisiRusakRingan} {asset.satuan}
                      </td>
                      <td className="py-3 px-2 text-center font-bold text-rose-700 bg-rose-50/10">
                        {asset.kondisiRusakBerat} {asset.satuan}
                      </td>
                      <td className="py-3 px-4 text-center font-mono font-bold text-slate-800 text-sm">
                        {asset.jumlah} {asset.satuan}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2 justify-center">
                          <button
                            onClick={() => handleStartEdit(asset)}
                            className="p-1.5 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded"
                            title="Edit Aset"
                          >
                            <PenTool size={14} />
                          </button>
                          <button
                            onClick={() => onDeleteAsset(asset.id)}
                            className="p-1.5 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded"
                            title="Hapus Aset"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-slate-400 bg-slate-50/50">
                      Tidak ada aset inventaris yang cocok dengan filter pencarian lokasi.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
