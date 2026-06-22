import React, { useState } from 'react';
import { InstitutionProfile } from '../types';
import { Building, MapPin, Award, CheckCircle, Edit, Save, BookOpen, ClipboardList } from 'lucide-react';

interface ProfilLembagaViewProps {
  profile: InstitutionProfile;
  onUpdateProfile: (updated: InstitutionProfile) => void;
}

export default function ProfilLembagaView({ profile, onUpdateProfile }: ProfilLembagaViewProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [tempProfile, setTempProfile] = useState<InstitutionProfile>({ ...profile });
  const [newMisi, setNewMisi] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setTempProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setTempProfile(prev => ({
          ...prev,
          logoUrl: reader.result as string
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddMisi = () => {
    if (newMisi.trim()) {
      setTempProfile(prev => ({
        ...prev,
        misi: [...prev.misi, newMisi.trim()]
      }));
      setNewMisi('');
    }
  };

  const handleRemoveMisi = (index: number) => {
    setTempProfile(prev => ({
      ...prev,
      misi: prev.misi.filter((_, i) => i !== index)
    }));
  };

  const handleSave = () => {
    onUpdateProfile(tempProfile);
    setIsEditing(false);
  };

  return (
    <div id="profil-lembaga-viewport" className="space-y-6 animate-fade-in">
      {/* Title block */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 border border-slate-100 rounded-2xl shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Profil Lembaga Pendidikan</h2>
          <p className="text-xs text-slate-400">Verifikasi data legalitas kementerian agama dan yayasan terpadu</p>
        </div>
        <div>
          {!isEditing ? (
            <button
              onClick={() => {
                setTempProfile({ ...profile });
                setIsEditing(true);
              }}
              className="bg-emerald-700 hover:bg-emerald-800 text-white font-semibold px-4 py-2 rounded-xl text-xs transition duration-150 flex items-center gap-1.5 shadow-sm"
              id="edit-profile-btn"
            >
              <Edit size={14} /> Sunting Profil
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={() => setIsEditing(false)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-4 py-2 rounded-xl text-xs transition"
                id="cancel-profile-btn"
              >
                Batal
              </button>
              <button
                onClick={handleSave}
                className="bg-emerald-700 hover:bg-emerald-800 text-white font-semibold px-4 py-2 rounded-xl text-xs transition flex items-center gap-1.5 shadow-sm"
                id="save-profile-btn"
              >
                <Save size={14} /> Simpan Perubahan
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: Madrasah Metadata & Identitas */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex flex-col items-center text-center p-4">
              <div className="w-20 h-20 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-700 font-extrabold border-2 border-emerald-500 shadow-inner mb-3 overflow-hidden">
                {(isEditing ? tempProfile.logoUrl : profile.logoUrl) ? (
                  <img src={isEditing ? tempProfile.logoUrl : profile.logoUrl} alt="Logo Madrasah" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-3xl font-serif">MTs</span>
                )}
              </div>
              {isEditing && (
                <div className="mb-4">
                  <label className="cursor-pointer bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 text-[10px] sm:text-[11px] font-bold px-3 py-1.5 rounded-xl transition inline-block">
                    Pilih File Logo
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleLogoChange} 
                      className="hidden" 
                    />
                  </label>
                  {(tempProfile.logoUrl || profile.logoUrl) && (
                    <button
                      type="button"
                      onClick={() => setTempProfile(prev => ({ ...prev, logoUrl: '' }))}
                      className="text-rose-600 hover:text-rose-700 text-[9px] block mt-1.5 mx-auto font-black uppercase tracking-wider"
                    >
                      Hapus Logo
                    </button>
                  )}
                </div>
              )}
              <h3 className="font-bold text-slate-800 text-md leading-snug">{isEditing ? tempProfile.nama : profile.nama}</h3>
              <p className="text-[10px] text-amber-600 font-bold uppercase tracking-wider bg-amber-50 px-2 py-0.5 rounded-full mt-1 border border-amber-200">
                Pondok Pesantren Terpadu
              </p>
            </div>

            <div className="border-t border-slate-100 pt-4 space-y-3">
              <div>
                <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">Nomor Statistik Madrasah (NSM)</span>
                {isEditing ? (
                  <input
                    type="text"
                    name="nsm"
                    value={tempProfile.nsm}
                    onChange={handleInputChange}
                    className="w-full text-xs border border-slate-200 rounded px-2.5 py-1.5 focus:ring-1 focus:ring-emerald-500 outline-none"
                  />
                ) : (
                  <span className="text-xs font-mono font-bold text-slate-700 block mt-0.5">{profile.nsm}</span>
                )}
              </div>

              <div>
                <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">NPSN Kemdikbud</span>
                {isEditing ? (
                  <input
                    type="text"
                    name="npsn"
                    value={tempProfile.npsn}
                    onChange={handleInputChange}
                    className="w-full text-xs border border-slate-200 rounded px-2.5 py-1.5 focus:ring-1 focus:ring-emerald-500 outline-none"
                  />
                ) : (
                  <span className="text-xs font-mono font-bold text-slate-700 block mt-0.5">{profile.npsn}</span>
                )}
              </div>

              <div>
                <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">Status Akreditasi</span>
                {isEditing ? (
                  <input
                    type="text"
                    name="akreditasi"
                    value={tempProfile.akreditasi}
                    onChange={handleInputChange}
                    className="w-full text-xs border border-slate-200 rounded px-2.5 py-1.5 focus:ring-1 focus:ring-emerald-500 outline-none"
                  />
                ) : (
                  <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5 mt-0.5">
                    <Award size={14} className="text-amber-500" />
                    {profile.akreditasi}
                  </span>
                )}
              </div>

              <div>
                <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">Kepala Madrasah</span>
                {isEditing ? (
                  <input
                    type="text"
                    name="kepalaMadrasah"
                    value={tempProfile.kepalaMadrasah}
                    onChange={handleInputChange}
                    className="w-full text-xs border border-slate-200 rounded px-2.5 py-1.5 focus:ring-1 focus:ring-emerald-500 outline-none"
                  />
                ) : (
                  <span className="text-xs font-bold text-slate-800 block mt-0.5">{profile.kepalaMadrasah}</span>
                )}
              </div>
            </div>
          </div>

          {/* Location Block */}
          <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-3">
            <h4 className="font-semibold text-slate-800 flex items-center gap-1.5 text-sm">
              <MapPin size={16} className="text-emerald-700" />
              Alamat Geografis
            </h4>
            <div className="space-y-3 text-xs">
              {isEditing ? (
                <div className="space-y-2">
                  <textarea
                    name="alamat"
                    value={tempProfile.alamat}
                    onChange={handleInputChange}
                    rows={2}
                    className="w-full text-xs border border-slate-200 rounded px-2.5 py-1.5 focus:ring-1 focus:ring-emerald-500 outline-none"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      placeholder="Desa"
                      name="desa"
                      value={tempProfile.desa}
                      onChange={handleInputChange}
                      className="border border-slate-200 rounded px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-emerald-500 shadow-2xs"
                    />
                    <input
                      placeholder="Kecamatan"
                      name="kecamatan"
                      value={tempProfile.kecamatan}
                      onChange={handleInputChange}
                      className="border border-slate-200 rounded px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      placeholder="Kabupaten"
                      name="kabupaten"
                      value={tempProfile.kabupaten}
                      onChange={handleInputChange}
                      className="border border-slate-200 rounded px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-emerald-500"
                    />
                    <input
                      placeholder="Provinsi"
                      name="provinsi"
                      value={tempProfile.provinsi}
                      onChange={handleInputChange}
                      className="border border-slate-200 rounded px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-2 text-slate-600 leading-relaxed">
                  <p>{profile.alamat}</p>
                  <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-50 text-[11px]">
                    <div>
                      <span className="text-slate-400 block">Kecamatan</span>
                      <strong className="text-slate-700">{profile.kecamatan}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Kabupaten</span>
                      <strong className="text-slate-700">{profile.kabupaten}</strong>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Columns: Vision, Mission & Historical Context */}
        <div className="lg:col-span-2 space-y-6">
          {/* Vision Vision Vision */}
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-4">
            <h4 className="font-semibold text-slate-800 flex items-center gap-1.5 text-base">
              <Building size={18} className="text-emerald-700" />
              Visi Madrasah
            </h4>
            {isEditing ? (
              <textarea
                name="visi"
                value={tempProfile.visi}
                onChange={handleInputChange}
                rows={2}
                className="w-full text-xs border border-slate-200 rounded px-2.5 py-1.5 focus:ring-1 focus:ring-emerald-500 outline-none"
              />
            ) : (
              <p className="text-sm font-semibold italic text-emerald-800 bg-emerald-50/50 p-4 rounded-xl border border-emerald-100 relative quote">
                &ldquo;{profile.visi}&rdquo;
              </p>
            )}

            {/* Mission Statements */}
            <div className="space-y-3 pt-2">
              <h5 className="text-xs font-bold text-slate-700 uppercase tracking-widest flex items-center gap-1">
                <ClipboardList size={14} className="text-amber-500" />
                Misi Utama
              </h5>
              <div className="space-y-2">
                {(isEditing ? tempProfile.misi : profile.misi).map((m, i) => (
                  <div key={i} className="flex gap-2.5 items-start bg-slate-50/50 p-2.5 rounded-lg border border-slate-100">
                    <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <p className="text-xs text-slate-600 leading-relaxed flex-1">{m}</p>
                    {isEditing && (
                      <button
                        onClick={() => handleRemoveMisi(i)}
                        className="text-rose-600 font-bold hover:bg-rose-50 px-2 rounded"
                      >
                        Hapus
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {isEditing && (
                <div className="flex gap-2 pt-2">
                  <input
                    type="text"
                    placeholder="Tambah misi baru..."
                    value={newMisi}
                    onChange={e => setNewMisi(e.target.value)}
                    className="flex-1 text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 focus:ring-1 focus:ring-emerald-500 outline-none"
                  />
                  <button
                    onClick={handleAddMisi}
                    className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold px-3 py-1.5 rounded-lg"
                  >
                    Tambah
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Historical Narrative */}
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-4">
            <h4 className="font-semibold text-slate-800 flex items-center gap-1.5 text-base">
              <BookOpen size={18} className="text-emerald-700" />
              Sejarah Singkat Pendirian
            </h4>
            {isEditing ? (
              <textarea
                name="sejarah"
                value={tempProfile.sejarah}
                onChange={handleInputChange}
                rows={6}
                className="w-full text-xs border border-slate-200 rounded px-2.5 py-1.5 focus:ring-1 focus:ring-emerald-500 outline-none"
              />
            ) : (
              <p className="text-xs text-slate-600 leading-relaxed text-justify whitespace-pre-line bg-gradient-to-b from-slate-50 to-white p-4 rounded-xl">
                {profile.sejarah}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
