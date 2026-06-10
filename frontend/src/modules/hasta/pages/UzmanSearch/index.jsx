import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, Award, Activity, Users, Sparkles } from 'lucide-react';
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
    <div className="bg-slate-50/50 min-h-screen py-6 sm:py-10 md:py-12 px-3 sm:px-5 md:px-8">
      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8 md:space-y-10 pb-28 lg:pb-8">
        
        {/* --- HEADER: ACTION BAR --- */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6 relative z-20">
          <div>
            <span className="inline-flex items-center gap-1.5 text-blue-600 text-[10px] sm:text-xs font-bold uppercase tracking-widest bg-blue-50 px-4 py-2 rounded-full mb-2 sm:mb-3">
              <Search size={14} /> Uzman Arama
            </span>
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-slate-900 leading-tight tracking-tighter italic">
               Uzman Keşfet
            </h1>
            <p className="text-slate-500 font-bold mt-1.5 uppercase tracking-widest text-[10px] sm:text-xs">
              Size en uygun uzmanı bulun ve sağlığınıza kavuşun
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center justify-center gap-2 px-8 py-4 rounded-full font-black text-sm uppercase tracking-widest transition-all duration-300 ${
              showFilters 
                ? 'bg-blue-600 text-white border-blue-600 shadow-xl shadow-blue-600/20' 
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-slate-300 shadow-sm'
            }`}
          >
            <Filter size={18} /> {showFilters ? 'Filtreleri Kapat' : 'Gelişmiş Filtre'}
          </Button>
        </div>

        {/* --- FILTERS SECTION --- */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, y: -20, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -20, height: 0 }}
              transition={{ duration: 0.3 }}
              className="relative z-10"
            >
              <SearchFilters 
                filters={filters} 
                setFilters={setFilters} 
                onClose={() => setShowFilters(false)} 
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* --- RECOMMENDED SECTION --- */}
        {!loading && recommended.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-4 mb-6 sm:mb-8">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-200 shrink-0">
                  <Sparkles size={24} />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 tracking-tighter">Akıllı Eşleşmeler</h2>
                <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest">Sağlık verilerinize göre önerilenler</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
              {recommended.map((uzman) => (
                <UzmanCard key={uzman.id} uzman={uzman} isRecommended />
              ))}
            </div>
          </motion.section>
        )}

        {/* --- ALL RESULTS --- */}
        <section className="space-y-6 sm:space-y-8">
          <div className="flex items-center justify-between border-b-2 border-slate-100 pb-4">
              <h2 className="text-base sm:text-lg lg:text-xl font-black text-slate-400 uppercase tracking-tighter flex items-center gap-3">
                  <Users size={22} className={loading ? 'animate-pulse text-blue-400' : ''} /> 
                  {loading ? 'Uzmanlar Aranıyor...' : `Tüm Uzmanlar (${uzmanlar.length})`}
              </h2>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
              {[1, 2, 3, 4].map(i => (
                <div 
                  key={i} 
                  className="h-[300px] bg-white border border-slate-100 rounded-[2rem] sm:rounded-[2.5rem] shadow-sm animate-pulse relative overflow-hidden" 
                >
                   {/* Yüklenme efekti için dekoratif çizgiler */}
                   <div className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-50/50 to-transparent -translate-x-full animate-[shimmer_1.5s_infinite]" />
                </div>
              ))}
            </div>
          ) : uzmanlar.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <EmptyState onClear={() => setFilters({ unvan: '', sehir: '', ilce: '', minRating: 0, sort: 'recommended' })} />
            </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 lg:gap-8"
            >
              {uzmanlar.map((uzman) => (
                <UzmanCard key={uzman.id} uzman={uzman} />
              ))}
            </motion.div>
          )}
        </section>
      </div>
    </div>
  );
}