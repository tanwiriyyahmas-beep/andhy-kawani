export interface InstitutionProfile {
  nama: string;
  nsm: string;
  npsn: string;
  akreditasi: string;
  alamat: string;
  desa: string;
  kecamatan: string;
  kabupaten: string;
  provinsi: string;
  kepalaMadrasah: string;
  nipKepala: string;
  kontak: string;
  email: string;
  visi: string;
  misi: string[];
  sejarah: string;
  logoUrl?: string;
}

export interface Student {
  id: string;
  nisn: string;
  nama: string;
  gender: 'Laki-laki' | 'Perempuan';
  kelas: string;
  tempatLahir: string;
  tanggalLahir: string;
  namaWali: string;
  teleponWali: string;
  alamat?: string;
  status: 'Aktif' | 'Lulus' | 'Pindahan' | 'Keluar';
  absensi: {
    hadir: number;
    sakit: number;
    izin: number;
    alfa: number;
  };
}

export interface Alumni {
  id: string;
  nisn: string;
  nama: string;
  gender: 'Laki-laki' | 'Perempuan';
  tahunLulus: string;
  statusPascaLulus: 'Melanjutkan Studi' | 'Bekerja' | 'Wirausaha' | 'Pondok / Mengabdi' | 'Lainnya';
  detailInstansi: string; // e.g., UIN Bandung, MAN Cianjur, PT Telkom, Ponpes Al-Inayah, etc.
  telepon: string;
  kesanPesan?: string;
}

export interface Teacher {
  id: string;
  nip: string;
  nama: string;
  gelar: string;
  gender: 'Laki-laki' | 'Perempuan';
  jabatan: string; // e.g., Kepala Madrasah, Waka Kurikulum, Wali Kelas IX, Guru Aqidah
  statusKepegawaian: 'PNS' | 'GTT' | 'Honor';
  kontak: string;
  alamat: string;
  isLogin?: boolean;
  skDinasUrl?: string;
  ijazahUrl?: string;
  sertifikatUrl?: string;
}

export interface KalenderEvent {
  id: string;
  tanggalStr: string; // e.g. "15 - 18 Juli 2026"
  nama: string; // e.g. "Masa Ta'aruf Siswa Baru (Matsama MTs)"
  keterangan: string; // e.g. "Wajib diikuti seluruh siswa baru"
}

export interface Subject {
  id: string;
  kode: string;
  nama: string;
  jenis: 'Pendidikan Agama Islam (PAI)' | 'Umum' | 'Muatan Lokal';
  skm: number; // Standar Kelulusan Minimal (passing grade)
  jamPerMinggu: number;
  guruPengampuId: string; // references Teacher.id
}

export interface FinancialTransaction {
  id: string;
  tanggal: string;
  tipe: 'Pemasukan' | 'Pengeluaran';
  kategori: string; // e.g., SPP, Infaq, Dana BOS, Listrik, Gaji Ustadz, Pemeliharaan
  jumlah: number;
  keterangan: string;
  operator: string;
  namaSiswa?: string;
  kelasSiswa?: string;
}

export interface SppPayment {
  studentId: string;
  bulan: string; // e.g., "Juli", "Agustus", "September", "Oktober", etc.
  tahun: string; // e.g., "2025" or "2026"
  tanggalBayar?: string;
  jumlah: number;
  status: 'Lunas' | 'Belum Lunas';
}

export interface Asset {
  id: string;
  kode: string;
  nama: string;
  jumlah: number;
  satuan: string; // e.g., Unit, Buah, Set
  kondisiBaik: number;
  kondisiRusakRingan: number;
  kondisiRusakBerat: number;
  lokasi: string; // e.g., Ruang Kelas VII-A, Lab Komputer, Kantor TU
}

export interface DocumentLetter {
  id: string;
  nomorSurat: string;
  perihal: string;
  penerimaPengirim: string;
  tanggal: string;
  tipe: 'Masuk' | 'Keluar';
  kategori: 'Undangan' | 'Pemberitahuan' | 'Permohonan' | 'Surat Keputusan (SK)' | 'Lain-lain';
  keterangan: string;
  arsipUrl?: string; // local simulation of uploaded file
}

export interface SystemConfig {
  tahunAjaranAktif: string; // e.g., "2025/2026"
  semesterAktif: 'Ganjil' | 'Genap';
  namaBendahara: string;
  nipBendahara: string;
  ttdKepalaNama: string;
  ttdKepalaJabatan: string;
  logoUrl?: string;
  sambutanHeading: string;
  sambutanTeks: string;
  // Kop Surat Customization
  kopSuratTipe?: 'teks' | 'gambar';
  kopSuratGambarUrl?: string;
  kopSuratYayasan?: string;
  kopSuratMadrasah?: string;
  kopSuratAkreditasiLines?: string;
  kopSuratAlamat?: string;
  kopSuratShowArabic?: boolean;
  // Google Sheets Integration
  appsScriptUrl?: string;
  autoSyncToSheets?: boolean;
  googleSpreadsheetId?: string;
  googleSyncType?: 'native' | 'script';
  // Backup Auto Reminder
  autoBackupEnabled?: boolean;
  lastBackupDate?: string;
}
