import React, { useState } from 'react';
import { FinancialTransaction, Student, SppPayment, SystemConfig } from '../types';
import { Wallet, Search, PlusCircle, ArrowUpRight, ArrowDownRight, Printer, Check, X, HelpCircle, DollarSign, Calendar } from 'lucide-react';

interface KeuanganViewProps {
  transactions: FinancialTransaction[];
  students: Student[];
  sppPayments: SppPayment[];
  config: SystemConfig;
  onAddTransaction: (tx: FinancialTransaction) => void;
  onAddSppPayment: (pay: SppPayment) => void;
  onUpdateSppStatus: (studentId: string, bulan: string, status: 'Lunas' | 'Belum Lunas') => void;
}

export default function KeuanganView({
  transactions,
  students,
  sppPayments,
  config,
  onAddTransaction,
  onAddSppPayment,
  onUpdateSppStatus
}: KeuanganViewProps) {
  const [activeSubTab, setActiveSubTab] = useState<'buku-kas' | 'spp'>('buku-kas');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('Semua');
  const [selectedClass, setSelectedClass] = useState<string>('VII-A');
  const [showAddTx, setShowAddTx] = useState(false);

  // New Transaction Form State
  const [txType, setTxType] = useState<'Pemasukan' | 'Pengeluaran'>('Pemasukan');
  const [txCategory, setTxCategory] = useState('Dana BOS');
  const [txAmount, setTxAmount] = useState('');
  const [txDetails, setTxDetails] = useState('');
  const [txNamaSiswa, setTxNamaSiswa] = useState('');
  const [txKelasSiswa, setTxKelasSiswa] = useState('');

  // Calculations
  const incomeTotal = transactions
    .filter(t => t.tipe === 'Pemasukan')
    .reduce((sum, t) => sum + t.jumlah, 0);

  const expenseTotal = transactions
    .filter(t => t.tipe === 'Pengeluaran')
    .reduce((sum, t) => sum + t.jumlah, 0);

  const balanceNet = incomeTotal - expenseTotal;

  // Format IDR helper
  const formatNumIDR = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(num);
  };

  const filteredTransactions = transactions.filter(tx => {
    const matchesSearch = tx.keterangan.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          tx.kategori.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'Semua' || tx.tipe === filterType;
    return matchesSearch && matchesType;
  });

  const handleAddTxSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(txAmount);
    if (!parsedAmount || !txDetails) return;

    onAddTransaction({
      id: 'TX_' + Date.now(),
      tanggal: new Date().toISOString().split('T')[0],
      tipe: txType,
      kategori: txCategory,
      jumlah: parsedAmount,
      keterangan: txDetails,
      operator: config.namaBendahara,
      namaSiswa: txNamaSiswa,
      kelasSiswa: txKelasSiswa
    });

    // Reset Form
    setTxAmount('');
    setTxDetails('');
    setTxNamaSiswa('');
    setTxKelasSiswa('');
    setShowAddTx(false);
  };

  // Toggle modular state of SPP matrix
  // When check to "Lunas", we automatically append a Cashbook item as well for transparency!
  const toggleSppStatus = (student: Student, bulan: string, currentStatus: 'Lunas' | 'Belum Lunas') => {
    const nextStatus = currentStatus === 'Lunas' ? 'Belum Lunas' : 'Lunas';
    
    // 1. Update the actual payment record list
    onUpdateSppStatus(student.id, bulan, nextStatus);

    // 2. If changing to 'Lunas', auto-generate a ledger item!
    if (nextStatus === 'Lunas') {
      onAddTransaction({
        id: 'TX_SPP_' + Date.now(),
        tanggal: new Date().toISOString().split('T')[0],
        tipe: 'Pemasukan',
        kategori: 'SPP',
        jumlah: 150000,
        keterangan: `Pembayaran SPP Bulan ${bulan} para ${student.nama} (${student.kelas})`,
        operator: config.namaBendahara
      });
    }
  };

  // Standard months to track for SPP
  const targetMonths = ['Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

  const getSppStatus = (studentId: string, month: string): 'Lunas' | 'Belum Lunas' => {
    const found = sppPayments.find(p => p.studentId === studentId && p.bulan === month);
    return found ? found.status : 'Belum Lunas';
  };

  const printBukuKas = () => {
    window.print();
  };

  return (
    <div id="keuangan-viewport" className="space-y-6 animate-fade-in">
      {/* High-level Cash Stats Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-100 p-5 rounded-2xl flex items-center gap-4 shadow-sm relative overflow-hidden">
          <div className="bg-emerald-50 text-emerald-800 p-3.5 rounded-xl">
            <ArrowUpRight size={22} />
          </div>
          <div className="space-y-1">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Akumulasi Pemasukan</span>
            <span className="text-xl font-extrabold text-emerald-700">{formatNumIDR(incomeTotal)}</span>
          </div>
        </div>

        <div className="bg-white border border-slate-100 p-5 rounded-2xl flex items-center gap-4 shadow-sm relative overflow-hidden">
          <div className="bg-amber-50 text-amber-800 p-3.5 rounded-xl">
            <ArrowDownRight size={22} />
          </div>
          <div className="space-y-1">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Akumulasi Pengeluaran</span>
            <span className="text-xl font-extrabold text-amber-700">{formatNumIDR(expenseTotal)}</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-800 to-emerald-950 text-white p-5 rounded-2xl flex items-center gap-4 shadow-md relative overflow-hidden">
          <div className="bg-white/10 text-white p-3.5 rounded-xl">
            <Wallet size={22} />
          </div>
          <div className="space-y-1 relative z-10">
            <span className="text-[10px] text-emerald-200 font-bold uppercase tracking-wider block">Saldo Kas Operasional Bersih</span>
            <span className={`text-xl font-extrabold ${balanceNet >= 0 ? 'text-amber-400' : 'text-rose-300'}`}>{formatNumIDR(balanceNet)}</span>
          </div>
        </div>
      </div>

      {/* Navigation sub-tabs */}
      <div className="flex border-b border-slate-100 gap-1">
        <button
          onClick={() => setActiveSubTab('buku-kas')}
          className={`px-4 py-2 text-xs font-semibold rounded-t-xl transition-all ${activeSubTab === 'buku-kas' ? 'bg-white border border-slate-100 border-b-white text-emerald-800 font-bold' : 'text-slate-500 hover:text-emerald-700'}`}
        >
          Buku Kas Umum (Operasional)
        </button>
        <button
          onClick={() => setActiveSubTab('spp')}
          className={`px-4 py-2 text-xs font-semibold rounded-t-xl transition-all ${activeSubTab === 'spp' ? 'bg-white border border-slate-100 border-b-white text-emerald-800 font-bold' : 'text-slate-500 hover:text-emerald-700'}`}
        >
          Kartu & Matriks SPP Siswa Kolektif
        </button>
      </div>

      {/* Main View Area */}
      {activeSubTab === 'buku-kas' ? (
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 bg-white p-4 border border-slate-100 rounded-2xl shadow-sm">
            <div className="flex flex-1 flex-wrap gap-2.5 w-full">
              <div className="relative w-full max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Cari transaksi atau log..."
                  className="w-full text-xs border border-slate-100 bg-slate-50/50 rounded-xl pl-9 pr-3 py-2 outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="flex gap-1">
                {['Semua', 'Pemasukan', 'Pengeluaran'].map((t) => (
                  <button
                    key={t}
                    onClick={() => setFilterType(t)}
                    className={`text-xs px-3 py-1.5 rounded-lg font-medium transition ${filterType === t ? 'bg-emerald-700 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'}`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2 w-full md:w-auto">
              <button
                onClick={printBukuKas}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs px-3 py-2 rounded-xl transition flex items-center gap-1 w-full md:w-auto justify-center"
              >
                <Printer size={14} /> Cetak Buku Kas
              </button>
              <button
                onClick={() => setShowAddTx(prev => !prev)}
                className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition flex items-center gap-1 w-full md:w-auto justify-center shadow-xs"
              >
                <PlusCircle size={14} /> Catat Transaksi
              </button>
            </div>
          </div>

          {/* New Transaction Log Entry Form */}
          {showAddTx && (
            <form onSubmit={handleAddTxSubmit} className="bg-white border-2 border-emerald-100 rounded-2xl p-5 shadow-sm space-y-4 animate-slide-up">
              <h3 className="font-bold text-slate-800 text-sm">Pencatatan Transaksi Manual</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Tipe Transaksi</label>
                  <select
                    value={txType}
                    onChange={e => {
                      const val = e.target.value as 'Pemasukan' | 'Pengeluaran';
                      setTxType(val);
                      setTxCategory('Dana BOS'); // Default value
                    }}
                    className="w-full text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 focus:ring-1 focus:ring-emerald-500 outline-none"
                  >
                    <option value="Pemasukan">Pemasukan (Kredit)</option>
                    <option value="Pengeluaran">Pengeluaran (Debet)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Kategori Transaksi</label>
                  <select
                    value={txCategory}
                    onChange={e => setTxCategory(e.target.value)}
                    className="w-full text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 focus:ring-1 focus:ring-emerald-500 outline-none"
                  >
                    <option value="Dana BOS">Dana BOS</option>
                    <option value="UDY">UDY</option>
                    <option value="DPOS">DPOS</option>
                    <option value="Perlengkapan PPDB">Perlengkapan PPDB</option>
                    <option value="Lain-lain">Lain-lain</option>
                  </select>
                </div>
                
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Nama Siswa (Opsional)</label>
                  <input
                    type="text"
                    value={txNamaSiswa}
                    onChange={e => setTxNamaSiswa(e.target.value)}
                    placeholder="misal: Ahmad"
                    className="w-full text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 focus:ring-1 focus:ring-emerald-500 outline-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Kelas (Opsional)</label>
                  <input
                    type="text"
                    value={txKelasSiswa}
                    onChange={e => setTxKelasSiswa(e.target.value)}
                    placeholder="misal: VII-A"
                    className="w-full text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 focus:ring-1 focus:ring-emerald-500 outline-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Jumlah Nominal (Rupiah)</label>
                  <input
                    type="number"
                    value={txAmount}
                    onChange={e => setTxAmount(e.target.value)}
                    placeholder="Contoh: 150000"
                    className="w-full text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 focus:ring-1 focus:ring-emerald-500 outline-none"
                    required
                  />
                </div>

                <div className="md:col-span-3">
                  <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Rincian / Keterangan</label>
                  <input
                    type="text"
                    value={txDetails}
                    onChange={e => setTxDetails(e.target.value)}
                    placeholder="misal: Pembelian buku kitab hadits Arbain"
                    className="w-full text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 focus:ring-1 focus:ring-emerald-500 outline-none"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddTx(false)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs px-3.5 py-1.5 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs px-4 py-1.5 bg-sky-950 rounded-lg shadow-sm"
                >
                  Posting Transaksi Kas
                </button>
              </div>
            </form>
          )}

          {/* Buku Kas List */}
          <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden p-5">
            <h4 className="font-bold text-slate-800 mb-3 text-sm">Rincian Buku Kas Umum</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-widest text-[9px]">
                    <th className="py-3 px-4">Tanggal Pembukuan</th>
                    <th className="py-3 px-4">Kategori & Keterangan</th>
                    <th className="py-3 px-4">Operator Pembuku</th>
                    <th className="py-3 px-4 text-right">Debit (Masuk)</th>
                    <th className="py-3 px-4 text-right">Kredit (Keluar)</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.map(tx => (
                    <tr key={tx.id} className="border-b border-slate-50 hover:bg-slate-50/20 transition-colors">
                      <td className="py-3 px-4 font-mono text-slate-500">{tx.tanggal}</td>
                      <td className="py-3 px-4">
                        <div className="flex flex-col">
                          <div>
                            <span className={`inline-block text-[9px] font-extrabold px-2 py-0.5 rounded-md mr-2 ${tx.tipe === 'Pemasukan' ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-800'}`}>
                              {tx.kategori}
                            </span>
                            <strong className="text-slate-800 text-xs font-semibold">{tx.keterangan}</strong>
                          </div>
                          {(tx.namaSiswa || tx.kelasSiswa) && (
                            <span className="text-[10px] text-slate-400 mt-1">
                              {tx.namaSiswa && <span className="font-semibold">{tx.namaSiswa}</span>}
                              {tx.namaSiswa && tx.kelasSiswa && ' • '}
                              {tx.kelasSiswa && <span>{tx.kelasSiswa}</span>}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-500">{tx.operator}</td>
                      <td className="py-3 px-4 text-right">
                        {tx.tipe === 'Pemasukan' ? (
                          <span className="text-emerald-700 font-bold font-mono">+{formatNumIDR(tx.jumlah)}</span>
                        ) : '-'}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {tx.tipe === 'Pengeluaran' ? (
                          <span className="text-amber-700 font-bold font-mono">-{formatNumIDR(tx.jumlah)}</span>
                        ) : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* SPP Matric Grid check-off */
        <div className="space-y-4">
          <div className="bg-white p-5 border border-slate-100 rounded-2xl shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
            <div>
              <h3 className="font-bold text-slate-800 text-base">Rekapitulasi SPP Bulanan Terpadu</h3>
              <p className="text-xs text-slate-400">Silakan pilih kelas, lalu tap pada item bulan siswa untuk mengubah status lunas & otomatis membukukan kas.</p>
            </div>

            {/* Selector Class for matrix */}
            <div className="flex gap-2 w-full md:w-auto shrink-0">
              {['VII-A', 'VIII-A', 'IX-A'].map(kls => (
                <button
                  key={kls}
                  onClick={() => setSelectedClass(kls)}
                  className={`flex-1 md:flex-initial text-xs px-4 py-2 font-semibold rounded-xl transition ${selectedClass === kls ? 'bg-emerald-700 text-white font-bold' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                >
                  Kelas {kls}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-emerald-50 border border-emerald-100/60 p-4 rounded-2xl text-xs text-emerald-800">
            📊 <strong>Tarif SPP:</strong> Rp 150.000 / bulan. Menandai bulan sebagai <strong>Lunas</strong> akan otomatis memposting rincian arus kas masuk Buku Kas Utama.
          </div>

          {/* Table display */}
          <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden p-5">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse min-w-[650px]">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-4">Nama Siswa / Santri</th>
                    {targetMonths.map(m => (
                      <th key={m} className="py-3 px-2 text-center">{m}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {students.filter(s => s.kelas === selectedClass).map(student => (
                    <tr key={student.id} className="border-b border-slate-50 hover:bg-slate-50/25 transition">
                      <td className="py-3.5 px-4">
                        <strong className="text-slate-800 text-sm font-semibold block">{student.nama}</strong>
                        <span className="text-[10px] text-slate-400 font-mono">NISN: {student.nisn}</span>
                      </td>

                      {/* Six Month columns */}
                      {targetMonths.map(month => {
                        const status = getSppStatus(student.id, month);
                        return (
                          <td key={month} className="py-3.5 px-2 text-center">
                            <button
                              onClick={() => toggleSppStatus(student, month, status)}
                              className={`mx-auto w-8 h-8 rounded-full flex items-center justify-center border transition-all ${status === 'Lunas' ? 'bg-emerald-500 border-emerald-600 text-white hover:bg-emerald-600' : 'bg-slate-50 hover:bg-emerald-100 border-slate-100 text-slate-400'}`}
                              title={`Ubah status SPP ${month} - ${student.nama}`}
                            >
                              {status === 'Lunas' ? <Check size={14} className="stroke-[3]" /> : <X size={14} />}
                            </button>
                            <span className={`block text-[9px] mt-1 font-bold ${status === 'Lunas' ? 'text-emerald-600' : 'text-slate-400'}`}>
                              {status === 'Lunas' ? 'LUNAS' : 'BELUM'}
                            </span>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
