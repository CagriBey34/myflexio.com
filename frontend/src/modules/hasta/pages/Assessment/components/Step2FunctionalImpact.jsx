import { Activity } from 'lucide-react';
import { motion } from 'framer-motion';

const EMOJIS = ['😊', '🙂', '😐', '😣', '😫'];
const IMPACTS = [
  { key: 'dailyActivitiesImpact', label: 'Günlük Aktiviteler' },
  { key: 'sleepImpact', label: 'Uyku Kalitesi' },
  { key: 'workImpact', label: 'İş Performansı' }
];

export default function Step2FunctionalImpact({ formData, setFormData }) {
  return (
    <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="space-y-10">
      <div className="text-center">
        <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mx-auto mb-4"><Activity size={28}/></div>
        <h3 className="text-2xl font-black text-slate-900 tracking-tighter italic">Fonksiyonel Etki</h3>
      </div>

      {IMPACTS.map(({ key, label }) => (
        <div key={key} className="space-y-4">
          <label className="text-xs font-black text-slate-700 uppercase flex justify-between">{label} <span>{formData[key]}/5</span></label>
          <div className="flex gap-2">
            {EMOJIS.map((emoji, i) => (
              <button key={i} type="button" onClick={() => setFormData({...formData, [key]: i+1})}
                className={`flex-1 py-3 rounded-2xl text-xl border-2 transition-all ${formData[key] === i+1 ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-100' : 'bg-slate-50 border-transparent'}`}>
                {emoji}
              </button>
            ))}
          </div>
        </div>
      ))}
    </motion.div>
  );
}