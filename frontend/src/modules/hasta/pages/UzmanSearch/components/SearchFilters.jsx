import { motion } from 'framer-motion';
import { X, RotateCcw } from 'lucide-react';

export default function SearchFilters({ filters, setFilters, onClose }) {
  const UNVANLAR = ["Fizyoterapist", "Ortopedist", "Nöroloji Uzmanı", "Spor Hekimi"];

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden"
    >
      <div className="relative z-10 space-y-8">
          <div className="flex justify-between items-center border-b border-slate-800 pb-4">
              <h3 className="text-xl font-black uppercase tracking-tighter">Arama Kriterleri</h3>
              <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-xl transition-all text-slate-400">
                  <X size={24} />
              </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-gray-800">
              {/* Unvan */}
              <div className="space-y-3">
                  <label className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] ml-1">Uzmanlık Unvanı</label>
                  <select
                    value={filters.unvan}
                    onChange={(e) => setFilters({ ...filters, unvan: e.target.value })}
                    className="w-full bg-slate-800 border-2 border-slate-700 rounded-2xl px-5 py-3.5 text-sm font-bold text-white outline-none focus:border-blue-500 transition-all"
                  >
                    <option value="">Tümü</option>
                    {UNVANLAR.map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
              </div>

              {/* Şehir */}
              <div className="space-y-3">
                  <label className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] ml-1">Lokasyon (Şehir)</label>
                  <input
                    type="text"
                    value={filters.sehir}
                    onChange={(e) => setFilters({ ...filters, sehir: e.target.value })}
                    placeholder="Örn: İstanbul"
                    className="w-full bg-slate-800 border-2 border-slate-700 rounded-2xl px-5 py-3.5 text-sm font-bold text-white outline-none focus:border-blue-500 transition-all"
                  />
              </div>

              {/* Sıralama */}
              <div className="space-y-3">
                  <label className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] ml-1">Sıralama Seçeneği</label>
                  <select
                    value={filters.sort}
                    onChange={(e) => setFilters({ ...filters, sort: e.target.value })}
                    className="w-full bg-slate-800 border-2 border-slate-700 rounded-2xl px-5 py-3.5 text-sm font-bold text-white outline-none focus:border-blue-500 transition-all"
                  >
                    <option value="recommended">Önerilen (Yapay Zeka)</option>
                    <option value="rating">En Yüksek Puan</option>
                    <option value="reviews">Popülerlik</option>
                  </select>
              </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-800">
              <button 
                onClick={() => setFilters({ unvan: '', sehir: '', ilce: '', minRating: 0, sort: 'recommended' })}
                className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-500 hover:text-white transition-all"
              >
                  <RotateCcw size={16} /> Filtreleri Sıfırla
              </button>
          </div>
      </div>
    </motion.div>
  );
}