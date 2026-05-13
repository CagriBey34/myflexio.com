import { motion } from 'framer-motion';
import { MapPin, Award, Star, ChevronRight, Activity, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Button from '../../../../../shared/components/ui/Button';

export default function UzmanCard({ uzman, isRecommended }) {
  const navigate = useNavigate();

  return (
    <motion.div
      whileHover={{ y: -5 }}
      className={`bg-white rounded-[2.5rem] p-6 md:p-8 border-2 transition-all relative overflow-hidden flex flex-col ${
        isRecommended ? 'border-blue-600 shadow-2xl shadow-blue-100' : 'border-slate-50 shadow-sm hover:border-blue-100'
      }`}
    >
      {isRecommended && (
        <div className="absolute top-0 right-10 bg-blue-600 text-white px-4 py-1.5 rounded-b-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
            <ShieldCheck size={12} /> Size Özel
        </div>
      )}

      <div className="flex items-start gap-6 mb-6">
        <div className="relative shrink-0">
          {uzman.profil_fotograf_url ? (
            <img src={uzman.profil_fotograf_url} className="w-20 h-20 md:w-24 md:h-24 rounded-3xl object-cover shadow-lg" />
          ) : (
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-3xl bg-blue-50 flex items-center justify-center text-blue-600 font-black text-2xl italic">
              {uzman.ad?.[0]}{uzman.soyad?.[0]}
            </div>
          )}
          <div className="absolute -bottom-2 -right-2 bg-white p-1.5 rounded-xl shadow-md border border-slate-50">
            <div className="bg-emerald-500 w-3 h-3 rounded-full border-2 border-white" />
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-xl md:text-2xl font-black text-slate-900 truncate tracking-tight">{uzman.ad} {uzman.soyad}</h3>
          <p className="text-blue-600 font-bold text-sm uppercase tracking-widest mb-2">{uzman.unvan}</p>
          
          <div className="flex items-center gap-3">
             <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-lg text-yellow-600">
                <Star size={14} fill="currentColor" />
                <span className="font-black text-xs">{Number(uzman.avgRating).toFixed(1)}</span>
             </div>
             <span className="text-xs text-slate-400 font-bold uppercase tracking-tighter">({uzman.reviewCount || 0} Yorum)</span>
          </div>
        </div>
      </div>

      <div className="space-y-3 mb-8">
        <div className="flex items-center gap-2 text-slate-500 font-medium">
            <MapPin size={16} className="text-slate-300" />
            <span className="text-sm">{uzman.sehir}, {uzman.ilce}</span>
        </div>
        
        {uzman.uzmanlikAlanlari && (
            <div className="flex flex-wrap gap-2">
                {Object.values(uzman.uzmanlikAlanlari).flat().slice(0, 2).map((alan, i) => (
                    <span key={i} className="px-3 py-1 bg-slate-50 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-tighter border border-slate-100">
                        {alan}
                    </span>
                ))}
            </div>
        )}
      </div>

      <div className="mt-auto grid grid-cols-2 gap-3">
        <Button
            onClick={() => navigate(`/hasta/uzman/${uzman.id}`)}
            className="bg-slate-900 text-white rounded-2xl font-black py-4 text-xs uppercase tracking-widest hover:bg-blue-600 transition-all"
        >
            Profili Gör
        </Button>
        <Button
            variant="outline"
            onClick={() => navigate(`/hasta/uzman/${uzman.id}`, { state: { openRandevu: true } })}
            className="border-2 border-slate-100 text-slate-600 rounded-2xl font-black py-4 text-xs uppercase tracking-widest hover:bg-blue-50 transition-all"
        >
            Randevu Al
        </Button>
      </div>
    </motion.div>
  );
}