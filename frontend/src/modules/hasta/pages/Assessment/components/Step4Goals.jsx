import { Target, MessageSquare, Timer } from 'lucide-react';
import { motion } from 'framer-motion';

const TREATMENT_GOALS = [
  'Ağrıyı azaltmak', 'Hareket kabiliyetini artırmak', 'Günlük aktivitelere dönmek',
  'Spora dönmek', 'İşe dönmek', 'Ameliyattan kaçınmak'
];

const EXPECTED_DURATIONS = [
  '1 hafta içinde', '1 ay içinde', '3 ay içinde', '6 ay içinde', 'Önemli değil'
];

export default function Step4Goals({ formData, setFormData }) {
  const toggleGoal = (goal) => {
    const current = formData.treatmentGoals;
    const next = current.includes(goal) ? current.filter(g => g !== goal) : [...current, goal];
    setFormData({ ...formData, treatmentGoals: next });
  };

  return (
    <motion.div 
      initial={{ x: 20, opacity: 0 }} 
      animate={{ x: 0, opacity: 1 }} 
      className="space-y-8"
    >
      <div className="text-center">
        <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mx-auto mb-4 shadow-sm">
          <Target size={28}/>
        </div>
        <h3 className="text-2xl font-black text-slate-900 tracking-tighter italic">Hedefler & Beklentiler</h3>
        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1 text-center">Tedaviden ne bekliyorsunuz?</p>
      </div>

      {/* Tedavi Hedefleri - Çoklu Seçim */}
      <div className="space-y-3">
        <label className="text-[10px] font-black text-slate-700 uppercase tracking-widest ml-1 flex items-center gap-2">
            <Target size={14} className="text-blue-600" /> Tedavi Hedefleriniz *
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {TREATMENT_GOALS.map((goal) => (
            <button
              key={goal}
              type="button"
              onClick={() => toggleGoal(goal)}
              className={`p-4 rounded-2xl text-xs font-black text-left transition-all border-2 ${
                formData.treatmentGoals.includes(goal)
                  ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-100'
                  : 'bg-white border-slate-100 text-slate-500 hover:border-blue-200'
              }`}
            >
              {goal}
            </button>
          ))}
        </div>
      </div>

      {/* Beklenen Süre - Tekli Seçim */}
      <div className="space-y-3">
        <label className="text-[10px] font-black text-slate-700 uppercase tracking-widest ml-1 flex items-center gap-2">
            <Timer size={14} className="text-blue-600" /> Beklenen İyileşme Süresi *
        </label>
        <select
          value={formData.expectedDuration}
          onChange={(e) => setFormData({ ...formData, expectedDuration: e.target.value })}
          className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:border-blue-600 transition-all appearance-none"
        >
          <option value="">İyileşme süresi seçiniz...</option>
          {EXPECTED_DURATIONS.map((duration) => (
            <option key={duration} value={duration}>{duration}</option>
          ))}
        </select>
      </div>

      {/* Ek Notlar */}
      <div className="space-y-3">
        <label className="text-[10px] font-black text-slate-700 uppercase tracking-widest ml-1 flex items-center gap-2">
            <MessageSquare size={14} className="text-blue-600" /> Ek Notlar (Opsiyonel)
        </label>
        <textarea
          value={formData.additionalNotes}
          onChange={(e) => setFormData({ ...formData, additionalNotes: e.target.value })}
          placeholder="Uzmanınıza iletmek istediğiniz özel bir durum var mı?"
          rows="4"
          className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-[2rem] text-sm font-medium outline-none focus:border-blue-600 focus:bg-white transition-all italic leading-relaxed"
        />
      </div>
    </motion.div>
  );
}