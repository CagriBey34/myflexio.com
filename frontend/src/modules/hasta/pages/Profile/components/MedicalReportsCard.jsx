import { FileText, ExternalLink } from 'lucide-react';

const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:3000/api').replace(/\/api$/, '');

export default function MedicalReportsCard({ reports }) {
  return (
    <div className="bg-slate-900 rounded-[2rem] sm:rounded-[2.5rem] p-4 sm:p-6 md:p-8 text-white shadow-2xl">
      <h2 className="text-xl font-black mb-5 sm:mb-8 uppercase tracking-tighter flex items-center gap-3">
        <FileText className="text-blue-400" size={24} /> Tıbbi Raporlar
      </h2>
      {reports.length > 0 ? (
        <div className="space-y-4">
          {reports.map((report) => (
            <div key={report.id} className="group p-5 bg-slate-800/50 border border-slate-700/50 rounded-3xl flex items-center justify-between hover:bg-slate-800 transition-all">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-blue-500/20 text-blue-400 rounded-lg"><FileText size={20}/></div>
                <div>
                  <p className="font-bold text-sm tracking-tight capitalize">
                    {report.tip.replace('_', ' ')}
                  </p>
                  <p className="text-[10px] font-black text-slate-500 uppercase mt-1">
                    {new Date(report.created_at).toLocaleDateString('tr-TR')}
                  </p>
                </div>
              </div>
              <a
                href={`${API_BASE}${report.dosya_url}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-slate-700 text-slate-300 hover:text-white hover:bg-blue-600 rounded-xl transition-all"
              >
                <ExternalLink size={18} />
              </a>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-10 opacity-30">
          <FileText className="mx-auto mb-2" size={32} />
          <p className="text-xs font-bold uppercase tracking-widest">Henüz Rapor Yok</p>
        </div>
      )}
    </div>
  );
}