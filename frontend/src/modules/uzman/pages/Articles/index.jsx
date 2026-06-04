import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { getUzmanArticles, deleteArticle, updateArticleStatus } from '../../services/articleService';

// Alt Bileşenler
import ArticleHeader from './components/ArticleHeader';
import ArticleTabSystem from './components/ArticleTabSystem';
import ArticleManagementCard from './components/ArticleManagementCard';
import ArticleEmptyState from './components/ArticleEmptyState';

export default function UzmanArticles() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all');
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => { fetchArticles(); }, [activeTab, page]);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      const params = { page, limit: 10 };
      if (activeTab !== 'all') params.durum = activeTab;
      
      const response = await getUzmanArticles(params);
      setArticles(response.data.articles || []);
      setTotal(response.data.total || 0);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bu makaleyi kalıcı olarak silmek istediğinize emin misiniz?')) return;
    try {
      await deleteArticle(id);
      fetchArticles();
    } catch (error) { console.error(error); }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await updateArticleStatus(id, newStatus);
      fetchArticles();
    } catch (error) { console.error(error); }
  };

  return (
    <div className="bg-[#f0fdf4] min-h-screen py-6 sm:py-10 md:py-12 px-3 sm:px-5 md:px-8">
        <div className="max-w-6xl mx-auto space-y-5 sm:space-y-6 md:space-y-8 pb-28 lg:pb-8">
        <ArticleHeader onNew={() => navigate('/uzman/articles/new')} />

        <ArticleTabSystem activeTab={activeTab} setActiveTab={(tab) => { setActiveTab(tab); setPage(1); }} />

        <div className="space-y-6">
            {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
                <div className="w-10 h-10 border-4 border-[#4ade80] border-t-transparent rounded-full animate-spin" />
                <p className="text-xs font-black text-[#0a2e1a] uppercase tracking-widest">Makaleler Yükleniyor...</p>
            </div>
            ) : articles.length === 0 ? (
            <ArticleEmptyState onNew={() => navigate('/uzman/articles/new')} />
            ) : (
            <AnimatePresence mode="popLayout">
                {articles.map((article) => (
                <ArticleManagementCard 
                    key={article.id} 
                    article={article} 
                    onDelete={handleDelete}
                    onStatusChange={handleStatusChange}
                />
                ))}
            </AnimatePresence>
            )}
        </div>

        {/* Pagination Bento Style */}
        {total > 10 && (
            <div className="flex justify-center items-center gap-6 bg-white w-fit mx-auto p-2 rounded-full border border-gray-100 shadow-xl shadow-green-900/5 mt-12">
                <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="w-12 h-12 flex items-center justify-center rounded-full hover:bg-gray-50 disabled:opacity-30 text-[#0a2e1a] transition-colors font-black">←</button>
                <span className="font-black text-[#0a2e1a] text-sm tracking-widest">SAYFA {page} / {Math.ceil(total / 10)}</span>
                <button disabled={page >= Math.ceil(total / 10)} onClick={() => setPage(p => p + 1)} className="w-12 h-12 flex items-center justify-center rounded-full hover:bg-gray-50 disabled:opacity-30 text-[#0a2e1a] transition-colors font-black">→</button>
            </div>
        )}
        </div>
    </div>
  );
}