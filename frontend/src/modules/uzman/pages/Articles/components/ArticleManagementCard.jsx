import { motion } from 'framer-motion';
import { Edit, Trash2, EyeOff, Calendar, Globe } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Button from '../../../../../shared/components/ui/Button';

const STATUS_CONFIG = {
  taslak: { text: 'Taslak', color: 'bg-gray-100 text-gray-600 border-gray-200', icon: <Edit size={12}/> },
  yayinda: { text: 'Yayında', color: 'bg-[#dcfce7] text-[#16a34a] border-[#bbf7d0]', icon: <Globe size={12}/> },
  arsivlendi: { text: 'Arşiv', color: 'bg-red-50 text-red-600 border-red-100', icon: <EyeOff size={12}/> }
};

export default function ArticleManagementCard({ article, onDelete, onStatusChange }) {
  const navigate = useNavigate();
  const config = STATUS_CONFIG[article.yayinlanma_durumu];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="bg-white border border-gray-100 rounded-[2.5rem] p-6 md:p-8 hover:shadow-xl hover:shadow-green-900/5 hover:border-[#4ade80]/40 transition-all duration-300 group"
    >
      <div className="flex flex-col md:flex-row gap-8">
        {/* Görsel */}
        <div className="w-full md:w-40 h-40 shrink-0 rounded-[2rem] overflow-hidden bg-gray-50 border border-gray-100 flex items-center justify-center">
          {article.kapak_resmi_url ? (
            <img src={article.kapak_resmi_url} alt={article.baslik} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
          ) : (
            <div className="font-black text-gray-300 tracking-tighter text-xl">MyFlexio</div>
          )}
        </div>

        {/* İçerik */}
        <div className="flex-1 space-y-4">
          <div className="flex flex-col md:flex-row justify-between items-start gap-4">
            <div className="space-y-2">
                <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${config.color}`}>
                    {config.icon} {config.text}
                </div>
                <h3 className="text-2xl font-black text-[#0a2e1a] tracking-tight group-hover:text-[#16a34a] transition-colors">
                    {article.baslik}
                </h3>
            </div>
            
            <div className="flex items-center gap-3">
                <div className="text-right mr-3 hidden md:block">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Okunma</p>
                    <p className="text-2xl font-black text-[#0a2e1a] leading-none">{article.okunma_sayisi}</p>
                </div>
                <button onClick={() => navigate(`/uzman/articles/${article.id}/edit`)} className="p-3 bg-gray-50 text-gray-400 hover:text-[#16a34a] hover:bg-[#dcfce7] rounded-xl transition-all border border-gray-100 hover:border-[#4ade80]/40">
                    <Edit size={20} />
                </button>
            </div>
          </div>

          <p className="text-gray-500 font-medium text-sm line-clamp-2 leading-relaxed">"{article.ozet}"</p>

          <div className="flex flex-wrap items-center justify-between pt-5 border-t border-gray-50 gap-4">
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    <Calendar size={14} className="text-[#4ade80]" />
                    {new Date(article.created_at).toLocaleDateString('tr-TR')}
                </div>
                {article.kategori && (
                    <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest bg-gray-50 border border-gray-100 px-3 py-1.5 rounded-lg">
                        {article.kategori}
                    </div>
                )}
            </div>

            <div className="flex items-center gap-3">
                {article.yayinlanma_durumu === 'taslak' && (
                    <Button size="sm" onClick={() => onStatusChange(article.id, 'yayinda')} className="bg-[#16a34a] hover:bg-[#15803d] text-white rounded-full font-black text-[10px] uppercase tracking-widest shadow-md shadow-green-700/20">Hemen Yayınla</Button>
                )}
                {article.yayinlanma_durumu === 'yayinda' && (
                    <Button variant="outline" size="sm" onClick={() => onStatusChange(article.id, 'taslak')} className="text-gray-500 hover:bg-gray-50 hover:text-gray-700 rounded-full font-black text-[10px] uppercase tracking-widest border-gray-200">Taslağa Al</Button>
                )}
                <button onClick={() => onDelete(article.id)} className="p-2.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors">
                    <Trash2 size={18} />
                </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}