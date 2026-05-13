import { motion } from 'framer-motion';
import { Edit, Trash2, Eye, Calendar, EyeOff, Globe, MoreVertical } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Button from '../../../../../shared/components/ui/Button';

const STATUS_CONFIG = {
  taslak: { text: 'Taslak', color: 'bg-slate-100 text-slate-500', icon: <Edit size={12}/> },
  yayinda: { text: 'Yayında', color: 'bg-emerald-50 text-emerald-600 border-emerald-100', icon: <Globe size={12}/> },
  arsivlendi: { text: 'Arşiv', color: 'bg-rose-50 text-rose-600 border-rose-100', icon: <EyeOff size={12}/> }
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
      className="bg-white border border-slate-100 rounded-[2.5rem] p-6 md:p-8 hover:shadow-2xl hover:shadow-slate-100 transition-all group"
    >
      <div className="flex flex-col md:flex-row gap-8">
        {/* Görsel */}
        <div className="w-full md:w-40 h-40 shrink-0 rounded-[2rem] overflow-hidden bg-slate-50 border border-slate-100">
          {article.kapak_resmi_url ? (
            <img src={article.kapak_resmi_url} alt={article.baslik} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
          ) : (
            <div className="w-full h-full flex items-center justify-center font-black text-slate-200 italic">MyFlexio</div>
          )}
        </div>

        {/* İçerik */}
        <div className="flex-1 space-y-4">
          <div className="flex flex-col md:flex-row justify-between items-start gap-4">
            <div className="space-y-1">
                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${config.color}`}>
                    {config.icon} {config.text}
                </div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tighter italic group-hover:text-blue-600 transition-colors">
                    {article.baslik}
                </h3>
            </div>
            
            <div className="flex items-center gap-2">
                <div className="text-right mr-4 hidden md:block">
                    <p className="text-[10px] font-black text-slate-400 uppercase leading-none">Okunma</p>
                    <p className="text-xl font-black text-slate-900">{article.okunma_sayisi}</p>
                </div>
                <button onClick={() => navigate(`/uzman/articles/${article.id}/edit`)} className="p-3 bg-slate-50 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-2xl transition-all border border-transparent hover:border-blue-100">
                    <Edit size={20} />
                </button>
            </div>
          </div>

          <p className="text-slate-500 font-medium text-sm line-clamp-2 italic leading-relaxed">"{article.ozet}"</p>

          <div className="flex flex-wrap items-center justify-between pt-4 border-t border-slate-50 gap-4">
            <div className="flex items-center gap-6">
                <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <Calendar size={14} className="text-blue-500" />
                    {new Date(article.created_at).toLocaleDateString('tr-TR')}
                </div>
                {article.kategori && (
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-1 rounded-lg">
                        📁 {article.kategori}
                    </div>
                )}
            </div>

            <div className="flex items-center gap-3">
                {article.yayinlanma_durumu === 'taslak' && (
                    <Button size="sm" onClick={() => onStatusChange(article.id, 'yayinda')} className="bg-emerald-600 text-white rounded-xl font-black text-[10px] uppercase">Hemen Yayınla</Button>
                )}
                {article.yayinlanma_durumu === 'yayinda' && (
                    <Button variant="outline" size="sm" onClick={() => onStatusChange(article.id, 'taslak')} className="text-slate-400 rounded-xl font-black text-[10px] uppercase border-slate-100">Taslağa Al</Button>
                )}
                <button onClick={() => onDelete(article.id)} className="p-2 text-rose-300 hover:text-rose-600 transition-colors">
                    <Trash2 size={18} />
                </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}