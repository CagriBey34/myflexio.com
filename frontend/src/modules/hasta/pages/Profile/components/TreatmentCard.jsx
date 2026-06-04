import { Heart, Activity, Calendar } from 'lucide-react';

export default function TreatmentCard({ profile }) {
  return (
    <div className="bg-blue-600 rounded-[2rem] sm:rounded-[2.5rem] p-4 sm:p-6 md:p-8 text-white shadow-2xl shadow-blue-200 relative overflow-hidden">
      <Activity size={150} className="absolute -right-10 -bottom-10 opacity-10" />
      <h2 className="text-xl font-black mb-5 sm:mb-8 uppercase tracking-tighter flex items-center gap-3 relative z-10">
        <Heart className="text-blue-200" size={24} /> Tedavi Bilgileri
      </h2>
      <div className="grid sm:grid-cols-3 gap-3 sm:gap-4 md:gap-6 relative z-10">
        <div className="bg-white/10 backdrop-blur-md p-4 sm:p-5 md:p-6 rounded-2xl sm:rounded-3xl border border-white/10">
          <p className="text-[10px] font-black text-blue-200 uppercase tracking-widest mb-2">Ağrı Bölgesi</p>
          <p className="text-lg font-bold">{profile?.agri_bolgesi}</p>
        </div>
        <div className="bg-white/10 backdrop-blur-md p-4 sm:p-5 md:p-6 rounded-2xl sm:rounded-3xl border border-white/10">
          <p className="text-[10px] font-black text-blue-200 uppercase tracking-widest mb-2">Tercih</p>
          <p className="text-lg font-bold capitalize">{profile?.tedavi_tercihi} Tedavi</p>
        </div>
        <div className="bg-white/10 backdrop-blur-md p-4 sm:p-5 md:p-6 rounded-2xl sm:rounded-3xl border border-white/10">
          <p className="text-[10px] font-black text-blue-200 uppercase tracking-widest mb-2">Seviye</p>
          <p className="text-3xl font-black italic">{profile?.agri_seviyesi}<span className="text-sm opacity-50">/10</span></p>
        </div>
      </div>
    </div>
  );
}