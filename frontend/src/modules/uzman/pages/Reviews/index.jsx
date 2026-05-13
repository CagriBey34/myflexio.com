import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Activity } from 'lucide-react';
import { getUzmanReviews } from '../../services/uzmanService';

// Alt Bileşenler
import ReviewHeader from './components/ReviewHeader';
import RatingStatsCard from './components/RatingStatsCard';
import DistributionCard from './components/DistributionCard';
import ReviewTimelineItem from './components/ReviewTimelineItem';

export default function UzmanReviews() {
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState({
    avgRating: 0,
    totalReviews: 0,
    distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchReviews(); }, []);

  const fetchReviews = async () => {
    try {
      const response = await getUzmanReviews();
      setStats(response.data.stats);
      setReviews(response.data.reviews);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-400 font-black uppercase text-[10px] tracking-widest italic">Yorumlar Analiz Ediliyor...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      <ReviewHeader />

      {/* --- STATS SECTION (BENTO) --- */}
      <div className="grid lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4">
            <RatingStatsCard avgRating={stats.avgRating} total={stats.totalReviews} />
        </div>
        <div className="lg:col-span-8">
            <DistributionCard distribution={stats.distribution} total={stats.totalReviews} />
        </div>
      </div>

      {/* --- REVIEWS LIST --- */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-[3rem] p-8 md:p-10 border border-slate-100 shadow-sm relative overflow-hidden"
      >
        <div className="flex items-center gap-3 mb-10">
            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                <MessageSquare size={24} />
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tighter italic">Hasta Geri Bildirimleri</h2>
        </div>

        {reviews.length === 0 ? (
          <div className="text-center py-20 bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-100">
            <Activity size={48} className="mx-auto text-slate-300 mb-4" />
            <p className="text-slate-500 font-bold italic">Henüz bir değerlendirme almadınız.</p>
          </div>
        ) : (
          <div className="space-y-6">
            <AnimatePresence>
                {reviews.map((review, idx) => (
                    <ReviewTimelineItem key={review.id} review={review} index={idx} />
                ))}
            </AnimatePresence>
          </div>
        )}
      </motion.div>
    </div>
  );
}