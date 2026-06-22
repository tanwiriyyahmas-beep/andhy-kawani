import {
  InstitutionProfile,
  Student,
  Alumni,
  Teacher,
  Subject,
  FinancialTransaction,
  SppPayment,
  Asset,
  DocumentLetter,
  SystemConfig,
  KalenderEvent
} from './types';

export const initialProfile: InstitutionProfile = {
  nama: 'Madrasah Tsanawiyah (MTs) Tanwiriyyah',
  nsm: '121232030012',
  npsn: '20278912',
  akreditasi: 'A (Sangat Baik) - Taggal SK: 12 November 2024',
  alamat: 'Jl. Raya KH. Hasyim Asy\'ari No. 45, Desa Bojongherang',
  desa: 'Bojongherang',
  kecamatan: 'Karangtengah',
  kabupaten: 'Cianjur',
  provinsi: 'Jawa Barat',
  kepalaMadrasah: 'Drs. KH. Ahmad Syarifuddin, M.Pd.',
  nipKepala: '197412152002121003',
  kontak: '0263-228190 / 0812-3456-7890',
  email: 'info@tanwiriyyah.sch.id',
  visi: 'Terwujudnya Generasi Qur\'ani yang Unggul dalam Prestasi, Mandiri dalam Kepribadian, dan Berakhlakul Karimah.',
  misi: [
    'Menyelenggarakan pendidikan agama Islam berbasis nilai-nilai Salafiyah Terpadu.',
    'Meningkatkan pencapaian prestasi akademik dan non-akademik di tingkat regional dan nasional.',
    'Menanamkan kemandirian jiwa santri melalui pembiasaan akhlakul karimah dan wirausaha mandiri.',
    'Mengintegrasikan kurikulum madrasah formal dangan kurikulum pesantren salaf.'
  ],
  sejarah: 'Madrasah Tanwiriyyah didirikan secara resmi pada tahun 1986 di bawah naungan Yayasan Pondok Pesantren Tanwiriyyah Cianjur. Berawal dari kepedulian para Kyai sesepuh untuk memadukan kedalaman ilmu agama dengan keluasan sains modern bagi anak-anak di wilayah Priangan Barat. Semenjak awal, madrasah ini berkomitmen melahirkan lulusan berkarakter hafidz, taat beribadah, dan siap bersaing di kancah global.'
};

export const initialTeachers: Teacher[] = [
  {
    id: 'T1',
    nip: '197412152002121003',
    nama: 'Drs. KH. Ahmad Syarifuddin',
    gelar: 'M.Pd.',
    gender: 'Laki-laki',
    jabatan: 'Kepala Madrasah & Pengampu Tafsir',
    statusKepegawaian: 'PNS',
    kontak: '0811-2233-445',
    alamat: 'Komplek Pondok Pesantren Tanwiriyyah, Cianjur'
  },
  {
    id: 'T2',
    nip: '198205122009032001',
    nama: 'Ustadzah Siti Aminah',
    gelar: 'S.Ag., M.S.I.',
    gender: 'Perempuan',
    jabatan: 'Waka Kurikulum & Guru Fiqih',
    statusKepegawaian: 'PNS',
    kontak: '0812-9988-776',
    alamat: 'Bojongherang, Cianjur'
  },
  {
    id: 'T3',
    nip: '-',
    nama: 'Ustadz Muhammad Ridwan',
    gelar: 'S.Pd.',
    gender: 'Laki-laki',
    jabatan: 'Waka Kesiswaan & Guru Akidah Akhlak',
    statusKepegawaian: 'GTT',
    kontak: '0857-4141-5252',
    alamat: 'Karangtengah, Cianjur'
  },
  {
    id: 'T4',
    nip: '-',
    nama: 'Ustadz H. Ahmad Fauzi',
    gelar: 'Lc., M.Ag.',
    gender: 'Laki-laki',
    jabatan: 'Kepala Litbang & Guru Al-Qur\'an Hadits',
    statusKepegawaian: 'GTT',
    kontak: '0813-1029-3847',
    alamat: 'Cilaku, Cianjur'
  },
  {
    id: 'T5',
    nip: '198808202014021005',
    nama: 'H. Luqman Hakim',
    gelar: 'S.Pd.I.',
    gender: 'Laki-laki',
    jabatan: 'Wali Kelas IX-A & Guru Bahasa Arab',
    statusKepegawaian: 'PNS',
    kontak: '0822-4466-8800',
    alamat: 'Sukatani, Cianjur'
  },
  {
    id: 'T6',
    nip: '-',
    nama: 'Ustadzah Wardah Wardani',
    gelar: 'S.Si.',
    gender: 'Perempuan',
    jabatan: 'Wali Kelas VIII-A & Guru IPA & Matematika',
    statusKepegawaian: 'Honor',
    kontak: '0896-1234-5678',
    alamat: 'Maleber, Cianjur'
  }
];

export const initialStudents: Student[] = [
  {
    id: 'S1',
    nisn: '0098716253',
    nama: 'Ahmad Khoirul Anam',
    gender: 'Laki-laki',
    kelas: 'VII-A',
    tempatLahir: 'Cianjur',
    tanggalLahir: '2013-05-12',
    namaWali: 'H. Mansyur Anam',
    teleponWali: '0812-8877-6655',
    status: 'Aktif',
    absensi: { hadir: 92, sakit: 2, izin: 1, alfa: 0 }
  },
  {
    id: 'S2',
    nisn: '0098516244',
    nama: 'Siti Fatimatuzzahra',
    gender: 'Perempuan',
    kelas: 'IX-A',
    tempatLahir: 'Bandung',
    tanggalLahir: '2011-10-25',
    namaWali: 'H. Solihin',
    teleponWali: '0813-4422-9900',
    status: 'Aktif',
    absensi: { hadir: 94, sakit: 1, izin: 0, alfa: 0 }
  },
  {
    id: 'S3',
    nisn: '0101112233',
    nama: 'Muhammad Zainuddin',
    gender: 'Laki-laki',
    kelas: 'VIII-A',
    tempatLahir: 'Cianjur',
    tanggalLahir: '2012-01-04',
    namaWali: 'Yusuf Zain',
    teleponWali: '0856-7788-9911',
    status: 'Aktif',
    absensi: { hadir: 88, sakit: 3, izin: 3, alfa: 1 }
  },
  {
    id: 'S4',
    nisn: '0091213141',
    nama: 'Aisyah Humaira',
    gender: 'Perempuan',
    kelas: 'VIII-A',
    tempatLahir: 'Sukabumi',
    tanggalLahir: '2012-07-19',
    namaWali: 'KH. Ridwanullah',
    teleponWali: '0877-2299-1100',
    status: 'Aktif',
    absensi: { hadir: 95, sakit: 0, izin: 0, alfa: 0 }
  },
  {
    id: 'S5',
    nisn: '0081216711',
    nama: 'Farhan Al-Ghifari',
    gender: 'Laki-laki',
    kelas: 'IX-A',
    tempatLahir: 'Cianjur',
    tanggalLahir: '2010-12-30',
    namaWali: 'Komarudin',
    teleponWali: '0821-3344-5566',
    status: 'Aktif',
    absensi: { hadir: 90, sakit: 4, izin: 1, alfa: 0 }
  },
  {
    id: 'S6',
    nisn: '0085432167',
    nama: 'Nabila Nurul Jannah',
    gender: 'Perempuan',
    kelas: 'VII-A',
    tempatLahir: 'Jakarta',
    tanggalLahir: '2013-09-02',
    namaWali: 'Imam Syafei',
    teleponWali: '0898-7654-3210',
    status: 'Aktif',
    absensi: { hadir: 93, sakit: 1, izin: 2, alfa: 0 }
  }
];

export const initialSubjects: Subject[] = [
  {
    id: 'Sub1',
    kode: 'PAI-FIQ',
    nama: 'Fiqih Ibadah',
    jenis: 'Pendidikan Agama Islam (PAI)',
    skm: 75,
    jamPerMinggu: 3,
    guruPengampuId: 'T2'
  },
  {
    id: 'Sub2',
    kode: 'PAI-AA',
    nama: 'Akidah Akhlak',
    jenis: 'Pendidikan Agama Islam (PAI)',
    skm: 75,
    jamPerMinggu: 2,
    guruPengampuId: 'T3'
  },
  {
    id: 'Sub3',
    kode: 'PAI-QHC',
    nama: 'Al-Qur\'an Hadits',
    jenis: 'Pendidikan Agama Islam (PAI)',
    skm: 78,
    jamPerMinggu: 3,
    guruPengampuId: 'T4'
  },
  {
    id: 'Sub4',
    kode: 'MULOK-AR',
    nama: 'Nahwu Sharaf & Kitab Kuning',
    jenis: 'Muatan Lokal',
    skm: 70,
    jamPerMinggu: 4,
    guruPengampuId: 'T5'
  },
  {
    id: 'Sub5',
    kode: 'UMUM-IPA',
    nama: 'Ilmu Pengetahuan Alam',
    jenis: 'Umum',
    skm: 72,
    jamPerMinggu: 4,
    guruPengampuId: 'T6'
  },
  {
    id: 'Sub6',
    kode: 'UMUM-MAT',
    nama: 'Matematika Integratif',
    jenis: 'Umum',
    skm: 70,
    jamPerMinggu: 4,
    guruPengampuId: 'T6'
  }
];

export const initialTransactions: FinancialTransaction[] = [
  {
    id: 'TX1',
    tanggal: '2026-06-01',
    tipe: 'Pemasukan',
    kategori: 'Dana BOS',
    jumlah: 45000000,
    keterangan: 'Pencairan Dana BOS Madrasah Tahap I 2026',
    operator: 'Ust. Ridwan Effendi'
  },
  {
    id: 'TX2',
    tanggal: '2026-06-05',
    tipe: 'Pengeluaran',
    kategori: 'Gaji Ustadz',
    jumlah: 18500000,
    keterangan: 'Honorarium Bulanan Guru GTT dan Staf Kependidikan Juni',
    operator: 'Ust. Ridwan Effendi'
  },
  {
    id: 'TX3',
    tanggal: '2026-06-10',
    tipe: 'Pemasukan',
    kategori: 'SPP',
    jumlah: 3200000,
    keterangan: 'Akumulasi Pembayaran SPP Kolektif Wali Siswa VII-A',
    operator: 'Ust. Ridwan Effendi'
  },
  {
    id: 'TX4',
    tanggal: '2026-06-12',
    tipe: 'Pemasukan',
    kategori: 'Infaq',
    jumlah: 15000000,
    keterangan: 'Sumbangan pembangunan dari hamba Allah (Alumni)',
    operator: 'Ust. Ridwan Effendi'
  },
  {
    id: 'TX5',
    tanggal: '2026-06-14',
    tipe: 'Pengeluaran',
    kategori: 'Pemeliharaan',
    jumlah: 4200000,
    keterangan: 'Pembelian Cat Tembok dan Perbaikan Plafon Kelas VIII-A',
    operator: 'Ust. Ridwan Effendi'
  },
  {
    id: 'TX6',
    tanggal: '2026-06-18',
    tipe: 'Pengeluaran',
    kategori: 'Listrik & Wifi',
    jumlah: 1850000,
    keterangan: 'Pembayaran token listrik madrasah dan biaya internet bulanan',
    operator: 'Ust. Ridwan Effendi'
  }
];

// Seed basic monthly payment status for existing students (months of July to December)
export const initialSppPayments: SppPayment[] = [
  { studentId: 'S1', bulan: 'Juli', tahun: '2025', tanggalBayar: '2025-07-05', jumlah: 150000, status: 'Lunas' },
  { studentId: 'S1', bulan: 'Agustus', tahun: '2025', tanggalBayar: '2025-08-04', jumlah: 150000, status: 'Lunas' },
  { studentId: 'S1', bulan: 'September', tahun: '2025', jumlah: 150000, status: 'Belum Lunas' },
  { studentId: 'S2', bulan: 'Juli', tahun: '2025', tanggalBayar: '2025-07-02', jumlah: 150000, status: 'Lunas' },
  { studentId: 'S2', bulan: 'Agustus', tahun: '2025', tanggalBayar: '2025-08-03', jumlah: 150000, status: 'Lunas' },
  { studentId: 'S2', bulan: 'September', tahun: '2025', tanggalBayar: '2025-09-05', jumlah: 150000, status: 'Lunas' },
  { studentId: 'S3', bulan: 'Juli', tahun: '2025', jumlah: 150000, status: 'Belum Lunas' },
  { studentId: 'S4', bulan: 'Juli', tahun: '2025', tanggalBayar: '2025-07-06', jumlah: 150000, status: 'Lunas' }
];

export const initialAssets: Asset[] = [
  {
    id: 'A1',
    kode: 'INV-GED-01',
    nama: 'Ruang Kelas (Gedung Utama)',
    jumlah: 6,
    satuan: 'Ruang',
    kondisiBaik: 5,
    kondisiRusakRingan: 1,
    kondisiRusakBerat: 0,
    lokasi: 'Sayap Barat & Timur Lantai 1-2'
  },
  {
    id: 'A2',
    kode: 'INV-MEJ-120',
    nama: 'Meja Belajar Siswa Kayu Siku Besi',
    jumlah: 120,
    satuan: 'Buah',
    kondisiBaik: 110,
    kondisiRusakRingan: 8,
    kondisiRusakBerat: 2,
    lokasi: 'Seluruh Ruang Kelas'
  },
  {
    id: 'A3',
    kode: 'INV-MED-PROJ',
    nama: 'Proyektor LCD Epson',
    jumlah: 4,
    satuan: 'Unit',
    kondisiBaik: 3,
    kondisiRusakRingan: 1,
    kondisiRusakBerat: 0,
    lokasi: 'Laboratorium & Ruang Rapat TU'
  },
  {
    id: 'A4',
    kode: 'INV-KITAB-01',
    nama: 'Kitab Tafsir Jalalain Kemenag',
    jumlah: 85,
    satuan: 'Buah',
    kondisiBaik: 80,
    kondisiRusakRingan: 5,
    kondisiRusakBerat: 0,
    lokasi: 'Perpustakaan Tanwiriyyah'
  },
  {
    id: 'A5',
    kode: 'INV-KOMP-01',
    nama: 'PC Desktop Server & Client Lab Komputer',
    jumlah: 24,
    satuan: 'Set',
    kondisiBaik: 21,
    kondisiRusakRingan: 3,
    kondisiRusakBerat: 0,
    lokasi: 'Gedung Lab Komputer Lantai 1'
  }
];

export const initialLetters: DocumentLetter[] = [
  {
    id: 'L1',
    nomorSurat: '045/MTs.T/PP.00.1/06/2026',
    perihal: 'Pemberitahuan Kelulusan Kelas IX Ajaran Ganjil',
    penerimaPengirim: 'Siswa & Wali Murid Kelas IX',
    tanggal: '2026-06-10',
    tipe: 'Keluar',
    kategori: 'Pemberitahuan',
    keterangan: 'Surat resmi sehubungan dengan hasil sidang pleno kelonggaran nilai.'
  },
  {
    id: 'L2',
    nomorSurat: '122/DEPAG-CJ/B.II/05/2026',
    perihal: 'Undangan Workshop Akreditasi & Digitalisasi Madrasah',
    penerimaPengirim: 'Sub-Direktorat Kemenag Kab. Cianjur',
    tanggal: '2026-05-28',
    tipe: 'Masuk',
    kategori: 'Undangan',
    keterangan: 'Kepala Madrasah ditunjuk sebagai narasumber panel utama.'
  },
  {
    id: 'L3',
    nomorSurat: '048/MTs.T/A.1/V/2026',
    perihal: 'Surat Keputusan (SK) Pengangkatan Wali Kelas Tahun 2026/2027',
    penerimaPengirim: 'H. Luqman Hakim, S.Pd.I.',
    tanggal: '2026-06-02',
    tipe: 'Keluar',
    kategori: 'Surat Keputusan (SK)',
    keterangan: 'SK Penugasan dinas internal Madrasah resmi.'
  },
  {
    id: 'L4',
    nomorSurat: 'Y-TAN/992/III/2026',
    perihal: 'Permohonan Dana Penunjang Sarana Sumur Bor Pesantren',
    penerimaPengirim: 'Ketua Yayasan Pondok Pesantren Tanwiriyyah',
    tanggal: '2026-06-15',
    tipe: 'Keluar',
    kategori: 'Permohonan',
    keterangan: 'Mengajukan sinergi pembiayaan jaringan air bersih terpadu.'
  }
];

export const initialKalenderEvents: KalenderEvent[] = [
  {
    id: 'cal_1',
    tanggalStr: '15 - 18 Juli 2026',
    nama: 'Masa Ta\'aruf Siswa Baru Baru (Matsama MTs)',
    keterangan: 'Wajib diikuti seluruh siswa baru'
  },
  {
    id: 'cal_2',
    tanggalStr: '14 September 2026',
    nama: 'Ujian Tengah Semester (UTS)',
    keterangan: 'Penetapan nilai tengah caturwulan'
  },
  {
    id: 'cal_3',
    tanggalStr: '05 Desember 2026',
    nama: 'Ujian Akhir Semester Ganjil (UAS)',
    keterangan: 'Ujian lisan hafalan kitab & tertulis'
  }
];

export const initialConfig: SystemConfig = {
  tahunAjaranAktif: '2025/2026',
  semesterAktif: 'Genap',
  namaBendahara: 'Ustadzah Siti Maryam, S.E.',
  nipBendahara: '198906102018022002',
  ttdKepalaNama: 'Drs. KH. Ahmad Syarifuddin, M.Pd.',
  ttdKepalaJabatan: 'Kepala Madrasah Tsanawiyar Tanwiriyyah',
  logoUrl: '',
  sambutanHeading: 'Selamat Datang di SIMPATIK (Sistem Manajemen & Pelayanan Administrasi Tanwiriyyah Terintegrasi) MTs Tanwiriyyah',
  sambutanTeks: 'Portal e-Madrasah Terintegrasi memberikan kemudahan bagi seluruh personil operasional untuk mengolah kurikulum, database kesiswaan, kepegawaian, memantau transparansi khas keuangan, menginventarisir sarana prasarana, serta membukukan arsip surat-menyurat secara seketika dalam satu pintu.',
  // Kop Surat Customization Defaults matching real letterhead
  kopSuratTipe: 'teks',
  kopSuratGambarUrl: '',
  kopSuratYayasan: 'YAYASAN MADRASAH TANWIRIYYAH',
  kopSuratMadrasah: 'MADRASAH TSANAWIYAH',
  kopSuratAkreditasiLines: 'TERAKREDITASI "A" - NSM : 121232030051 - NPSN : 20277997',
  kopSuratAlamat: 'Jl. Aria Wiratanudatar Km. 5 Sindanglaka Karangtengah Cianjur 43281 Telp. (0263) 265414',
  kopSuratShowArabic: true,
  appsScriptUrl: '',
  autoSyncToSheets: false,
  googleSpreadsheetId: '',
  googleSyncType: 'native',
  autoBackupEnabled: false,
  lastBackupDate: ''
};

export const initialAlumni: Alumni[] = [
  {
    id: 'AL1',
    nisn: '0082391024',
    nama: 'Ahmad Rafli Fauzi',
    gender: 'Laki-laki',
    tahunLulus: '2024',
    statusPascaLulus: 'Melanjutkan Studi',
    detailInstansi: 'MAN 1 Cianjur (Jurusan Keagamaan)',
    telepon: '0812-7744-8822',
    kesanPesan: 'Alhamdulillah, bekal hafalan Al-Qur\'an Juz 30 dan Fiqih praktis di MTs Tanwiriyyah sangat membantu saya bersaing di madrasah aliyah negeri.'
  },
  {
    id: 'AL2',
    nisn: '0085441390',
    nama: 'Syifa Nurul Saniyyah',
    gender: 'Perempuan',
    tahunLulus: '2024',
    statusPascaLulus: 'Pondok / Mengabdi',
    detailInstansi: 'PPS Tanwiriyyah Cianjur (Takhassus Tahfidz)',
    telepon: '0858-9011-3456',
    kesanPesan: 'Saya memilih melanjutkan pengabdian khidmah ilmu di pondok induk sembari memperdalam kajian kitab kuning Fathul Qorib.'
  },
  {
    id: 'AL3',
    nisn: '0078901244',
    nama: 'M. Farhan Al-Ghifari',
    gender: 'Laki-laki',
    tahunLulus: '2023',
    statusPascaLulus: 'Melanjutkan Studi',
    detailInstansi: 'SMKN 1 Cianjur (Teknik Komputer Jaringan)',
    telepon: '0877-3311-9900',
    kesanPesan: 'Pembimbingan akhlakul karimah dari para ustadz membuat saya tetap terjaga di lingkungan SMK umum.'
  },
  {
    id: 'AL4',
    nisn: '0086551239',
    nama: 'Rina Marlina',
    gender: 'Perempuan',
    tahunLulus: '2024',
    statusPascaLulus: 'Wirausaha',
    detailInstansi: 'Owner Syifa Mukena Handmade',
    telepon: '0813-8822-1144',
    kesanPesan: 'Program wirausaha mandiri di MTs Tanwiriyyah memberikan saya keberanian memulai bisnis busana muslimah selepas lulus.'
  },
  {
    id: 'AL5',
    nisn: '0075442190',
    nama: 'Ujang Solihin',
    gender: 'Laki-laki',
    tahunLulus: '2023',
    statusPascaLulus: 'Bekerja',
    detailInstansi: 'Staff Administrasi Toko Kitab Al-Hidayah',
    telepon: '0896-1234-5678',
    kesanPesan: 'Sangat bersyukur diajarkan kedisiplinan tinggi di kelas dan asrama, kerja keras terbayar pasca lulus.'
  }
];
