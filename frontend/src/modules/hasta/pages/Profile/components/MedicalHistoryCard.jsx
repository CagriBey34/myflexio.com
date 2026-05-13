import { CheckCircle2, XCircle, FileText } from 'lucide-react';

export default function MedicalHistoryCard({ profile }) {
  const histories = [
    { label: 'Ameliyat Geçmişi', status: profile?.ameliyat_gecmisi, detail: profile?.ameliyat_detay },
    { label: 'Kronik Hastalık', status: profile?.kronik_hastalik, detail: profile?.kronik_hastalik_detay },
    { label: 'Sürekli İlaç', status: profile?.surekli_ilac, detail: profile?.ilac_listesi },
  ];

  return (
    <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm">
      <h2 className="text-xl font-black text-slate-900 mb-8 uppercase tracking-tighter flex items-center gap-3">
        <FileText className="text-blue-600" size={24} /> Tıbbi Geçmiş
      </h2>
      <div className="space-y-4">
        {histories.map((h, i) => (
          <div key={i} className={`p-5 rounded-3xl border-2 transition-all ${h.status ? 'border-blue-50 bg-blue-50/30' : 'border-slate-50 bg-slate-50/30'}`}>
            <div className="flex items-center gap-3 mb-2">
              {h.status ? <CheckCircle2 className="text-emerald-500" size={20}/> : <XCircle className="text-slate-300" size={20}/>}
              <span className="font-bold text-slate-800">{h.label}</span>
            </div>
            {h.status && h.detail && (
              <p className="text-sm text-slate-500 font-medium ml-8 italic leading-relaxed">"{h.detail}"</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}