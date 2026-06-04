import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, Award, Activity } from 'lucide-react';
import { searchUzmanlar } from '../../services/uzmanService';
import Button from '../../../../shared/components/ui/Button';

// Alt Bileşenler
import SearchFilters from './components/SearchFilters';
import UzmanCard from './components/UzmanCard';
import EmptyState from './components/EmptyState';

export default function UzmanSearch() {
  const [uzmanlar, setUzmanlar] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState({
    unvan: '', sehir: '', ilce: '', minRating: 0, sort: 'recommended'
  });

  useEffect(() => {
    fetchUzmanlar();
  }, [filters]);

  const fetchUzmanlar = async () => {
    try {
      setLoading(true);
      const response = await searchUzmanlar(filters);
      const normalize = (list) => (list || []).map(u => ({
        ...u,
        avgRating: Number(u.avgRating) || 0,
      }));
      setUzmanlar(normalize(response.data.all));
      setRecommended(normalize(response.data.recommended));
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-5 sm:space-y-6 md:space-y-8 pb-28 lg:pb-8">
      {/* --- HEADER --- */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-6">
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-slate-900 tracking-tighter italic flex items-center gap-2 sm:gap-3">
             Uzman Keşfet
          </h1>
          <p className="text-slate-500 font-bold mt-1 uppercase tracking-widest text-[10px]">
            Size en uygun fizyoterapisti bulun ve tedaviye başlayın
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${
            showFilters ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-200' : 'bg-white text-slate-600'
          }`}
        >
          <Filter size={18} /> {showFilters ? 'Filtreleri Kapat' : 'Filtrele'}
        </Button>
      </div>

      {/* --- FILTERS SECTION --- */}
      <AnimatePresence>
        {showFilters && (
          <SearchFilters 
            filters={filters} 
            setFilters={setFilters} 
            onClose={() => setShowFilters(false)} 
          />
        )}
      </AnimatePresence>

      {/* --- RECOMMENDED SECTION --- */}
      {!loading && recommended.length > 0 && (
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
                <Award size={20} />
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Akıllı Eşleşmeler</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
            {recommended.map((uzman) => (
              <UzmanCard key={uzman.id} uzman={uzman} isRecommended />
            ))}
          </div>
        </section>
      )}

      {/* --- ALL RESULTS --- */}
      <section className="space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h2 className="text-xl font-black text-slate-400 uppercase tracking-tighter">
                {loading ? 'Uzmanlar Aranıyor...' : `Tüm Uzmanlar (${uzmanlar.length})`}
            </h2>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-64 bg-white border border-slate-100 rounded-[2.5rem] animate-pulse" />
            ))}
          </div>
        ) : uzmanlar.length === 0 ? (
          <EmptyState onClear={() => setFilters({ unvan: '', sehir: '', ilce: '', minRating: 0, sort: 'recommended' })} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
            {uzmanlar.map((uzman) => (
              <UzmanCard key={uzman.id} uzman={uzman} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}