import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Calendar, Eye, User, Filter, ArrowRight, BookOpen, Clock } from 'lucide-react';
import { getPublicArticles } from '../../services/articleService';
import Input from '../../../../shared/components/ui/Input';
import Button from '../../../../shared/components/ui/Button';

const KATEGORILER = [
  'Tümü', 'Egzersiz ve Rehabilitasyon', 'Ağrı Yönetimi', 
  'Spor Yaralanmaları', 'Postür ve Ergonomi', 'Genel Sağlık'
];

export default function ArticleList() {
  const navigate = useNavigate();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [kategori, setKategori] = useState('Tümü');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('yeni');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchArticles();
  }, [kategori, sort, page]);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      const params = { page, limit: 12, sort };
      if (kategori !== 'Tümü') params.kategori = kategori;
      if (search) params.search = search;

      const response = await getPublicArticles(params);
      setArticles(response.data.articles);
      setTotal(response.data.total);
    } catch (error) {
      console.error('Error fetching articles:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 space-y-12 pb-24">
      
      {/* --- HEADER --- */}
      <div className="text-center space-y-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] border border-blue-100"
        >
        </motion.div>
        <h1 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tighter italic">Sağlık Kütüphanesi</h1>
        <p className="text-slate-500 font-bold max-w-2xl mx-auto text-lg leading-relaxed">
          Uzman fizyoterapistlerimiz tarafından hazırlanan bilimsel temelli rehberler.
        </p>
      </div>

      {/* --- KONTROL MERKEZİ (FILTERS) --- */}
      <div className="bg-white border-2 border-slate-100 rounded-[3rem] p-8 shadow-2xl shadow-blue-100/20">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Search Bar */}
          <div className="flex-1 relative group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={20} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && fetchArticles()}
              placeholder="Makale veya konu ara..."
              className="w-full pl-14 pr-6 py-4 bg-slate-50 border-2 border-transparent rounded-[1.5rem] outline-none focus:border-blue-600 focus:bg-white transition-all font-bold text-slate-700"
            />
          </div>

          {/* Sort & Action */}
          <div className="flex gap-4">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="px-6 py-4 bg-slate-50 border-2 border-transparent rounded-[1.5rem] font-black text-xs uppercase tracking-widest text-slate-600 outline-none focus:border-blue-600 focus:bg-white transition-all appearance-none cursor-pointer"
            >
              <option value="yeni">En Yeni</option>
              <option value="populer">En Popüler</option>
            </select>
            <Button onClick={fetchArticles} className="bg-slate-900 text-white px-8 rounded-[1.5rem] font-black uppercase text-xs tracking-widest hover:bg-blue-600 transition-all shadow-xl">
              Filtrele
            </Button>
          </div>
        </div>

        {/* Categories Chip List */}
        <div className="flex flex-wrap gap-2 mt-8 pt-6 border-t border-slate-50">
          {KATEGORILER.map((kat) => (
            <button
              key={kat}
              onClick={() => { setKategori(kat); setPage(1); }}
              className={`px-5 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-tighter transition-all border-2 ${
                kategori === kat
                  ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-100'
                  : 'bg-white border-slate-100 text-slate-400 hover:border-blue-200 hover:text-blue-600'
              }`}
            >
              {kat}
            </button>
          ))}
        </div>
      </div>

      {/* --- ARTICLES GRID --- */}
      {loading ? (
        <div className="grid md:grid-cols-3 gap-8">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-[450px] bg-slate-100 rounded-[2.5rem] animate-pulse" />
          ))}
        </div>
      ) : articles.length === 0 ? (
        <div className="text-center py-24 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
          <Search className="mx-auto text-slate-300 mb-4" size={48} />
          <p className="text-slate-500 font-black uppercase tracking-widest text-sm">Aradığınız kriterde makale bulunamadı.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence>
            {articles.map((article, idx) => (
              <ArticleCard key={article.id} article={article} index={idx} onClick={() => navigate(`/articles/${article.id}`)} />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* --- PAGINATION --- */}
      {total > 12 && (
        <div className="flex justify-center items-center gap-6 mt-16 bg-white w-fit mx-auto p-2 rounded-3xl border border-slate-100 shadow-xl">
          <button
            disabled={page === 1}
            onClick={() => setPage(p => p - 1)}
            className="p-4 rounded-2xl hover:bg-slate-50 disabled:opacity-30 transition-all"
          >
            <ChevronRight className="rotate-180" />
          </button>
          <span className="font-black text-slate-900 tracking-tighter italic">
            Sayfa {page} <span className="text-slate-300 mx-1">/</span> {Math.ceil(total / 12)}
          </span>
          <button
            disabled={page >= Math.ceil(total / 12)}
            onClick={() => setPage(p => p + 1)}
            className="p-4 rounded-2xl hover:bg-slate-50 disabled:opacity-30 transition-all"
          >
            <ChevronRight />
          </button>
        </div>
      )}
    </div>
  );
}

/* --- ALT BİLEŞEN: ARTICLE CARD --- */
function ArticleCard({ article, index, onClick }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      onClick={onClick}
      className="group bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden hover:shadow-2xl hover:shadow-blue-100/50 transition-all cursor-pointer flex flex-col h-full"
    >
      {/* Resim Alanı */}
      <div className="relative h-56 overflow-hidden">
        {article.kapak_resmi_url ? (
          <img
            src={article.kapak_resmi_url}
            alt={article.baslik}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          />
        ) : (
          <div className="w-full h-full bg-slate-900 flex items-center justify-center italic font-black text-blue-600 text-4xl">
            MyFlexio
          </div>
        )}
        <div className="absolute top-4 left-4">
            <span className="px-4 py-1.5 bg-white/90 backdrop-blur-md text-slate-900 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg">
                {article.kategori || 'Genel'}
            </span>
        </div>
      </div>

      {/* İçerik Alanı */}
      <div className="p-8 flex flex-col flex-1">
        <h3 className="text-2xl font-black text-slate-900 mb-4 tracking-tighter italic leading-tight group-hover:text-blue-600 transition-colors line-clamp-2">
          {article.baslik}
        </h3>

        <p className="text-slate-500 font-medium text-sm line-clamp-3 mb-6 leading-relaxed italic">
          "{article.ozet}"
        </p>

        {/* Footer Info */}
        <div className="mt-auto space-y-4 pt-6 border-t border-slate-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 font-black text-[10px] italic border border-blue-100">
                {article.yazarAd?.[0]}
              </div>
              <span className="text-xs font-black text-slate-700 uppercase tracking-tighter">
                {article.yazarAd} {article.yazarSoyad}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-400">
              <Eye size={14} />
              <span className="text-[10px] font-black">{article.okunma_sayisi}</span>
            </div>
          </div>

          <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">
            <div className="flex items-center gap-1.5">
               <Calendar size={12} className="text-blue-500" />
               {new Date(article.yayinlanma_tarihi).toLocaleDateString('tr-TR')}
            </div>
            <div className="flex items-center gap-1.5 group-hover:text-blue-600 transition-colors">
                OKU <ArrowRight size={12} />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ChevronRight eksik kalmasın diye (opsiyonel ama şık durur)
function ChevronRight({ className }) {
    return <ArrowRight className={className} />;
}