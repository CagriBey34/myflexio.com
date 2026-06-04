import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, HeartPulse } from 'lucide-react';
import { getOwnReviews } from '../../services/uzmanService';

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
      const response = await getOwnReviews();
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
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 bg-[#f0fdf4]">
        <div className="w-12 h-12 border-4 border-[#4ade80] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-[#0a2e1a] font-black uppercase text-[10px] tracking-widest">Yorumlar Analiz Ediliyor...</p>
      </div>
    );
  }

  return (
    <div className="bg-[#f0fdf4] min-h-screen py-6 sm:py-10 md:py-12 px-3 sm:px-5 md:px-8">
        <div className="max-w-6xl mx-auto space-y-5 sm:space-y-6 md:space-y-8 pb-28 lg:pb-8">
          <ReviewHeader />

          {/* --- STATS SECTION (BENTO) --- */}
          <div className="grid lg:grid-cols-12 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
            <div className="lg:col-span-4">
                <RatingStatsCard avgRating={stats.avgRating} total={stats.totalReviews} />
            </div>
            <div className="lg:col-span-8">
                <DistributionCard distribution={stats.distribution} total={stats.totalReviews} />
            </div>
          </div>

          {/* --- REVIEWS LIST --- */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-white rounded-[3rem] p-8 md:p-12 border border-gray-100 shadow-xl shadow-green-900/5 relative overflow-hidden"
          >
            {/* Arka plan dekorasyonu */}
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#4ade80] rounded-full blur-[120px] opacity-10 pointer-events-none" />

            <div className="flex items-center gap-4 mb-10 relative z-10">
                <div className="w-16 h-16 bg-[#dcfce7] rounded-2xl flex items-center justify-center text-[#16a34a] shadow-inner shrink-0">
                    <MessageSquare size={28} />
                </div>
                <div>
                    <h2 className="text-2xl md:text-3xl font-black text-[#0a2e1a] tracking-tight">Hasta Geri Bildirimleri</h2>
                    <p className="text-sm font-medium text-gray-500 mt-1">Danışanlarınızın sizin hakkındaki düşünceleri ve deneyimleri</p>
                </div>
            </div>

            {reviews.length === 0 ? (
              <div className="text-center py-20 bg-gray-50 rounded-[2.5rem] border border-gray-100 shadow-sm relative z-10">
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-5 border border-gray-100">
                    <HeartPulse size={32} className="text-gray-300" />
                </div>
                <p className="text-[#0a2e1a] font-black text-xl mb-2">Henüz bir değerlendirme almadınız</p>
                <p className="text-gray-500 font-medium text-sm">İlk randevularınız tamamlandıktan sonra yorumlar burada listelenecektir.</p>
              </div>
            ) : (
              <div className="space-y-6 relative z-10">
                <AnimatePresence>
                    {reviews.map((review, idx) => (
                        <ReviewTimelineItem key={review.id} review={review} index={idx} />
                    ))}
                </AnimatePresence>
              </div>
            )}
          </motion.div>
        </div>
    </div>
  );
}