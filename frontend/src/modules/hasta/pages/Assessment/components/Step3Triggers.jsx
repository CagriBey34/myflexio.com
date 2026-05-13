import { Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import Input from '../../../../../shared/components/ui/Input';

const TRIGGERS = ['Hareket', 'Oturma', 'Yürüme', 'Kaldırma', 'Stres', 'Hava Durumu'];
const RELIEVERS = ['İstirahat', 'Sıcak', 'Soğuk', 'İlaç', 'Egzersiz', 'Masaj'];

export default function Step3Triggers({ formData, setFormData }) {
  const toggle = (field, val) => {
    const list = formData[field];
    setFormData({...formData, [field]: list.includes(val) ? list.filter(v => v !== val) : [...list, val]});
  };

  return (
    <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="space-y-8">
      <div className="text-center">
        <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mx-auto mb-4"><Zap size={28}/></div>
        <h3 className="text-2xl font-black text-slate-900 tracking-tighter italic">Tetikleyici Faktörler</h3>
      </div>

      <div className="space-y-4">
        <label className="text-xs font-black text-red-600 uppercase ml-1">Ağrıyı Artıranlar</label>
        <div className="flex flex-wrap gap-2">
          {TRIGGERS.map(t => (
            <button key={t} type="button" onClick={() => toggle('painTriggers', t)}
              className={`px-4 py-2 rounded-xl text-xs font-bold border-2 transition-all ${formData.painTriggers.includes(t) ? 'bg-red-500 border-red-500 text-white shadow-lg shadow-red-100' : 'bg-slate-50 border-transparent text-slate-500'}`}>
              {t}
            </button>
          ))}
        </div>
        <Input placeholder="Özel tetikleyici..." value={formData.customTrigger} onChange={e => setFormData({...formData, customTrigger: e.target.value})} />
      </div>

      <div className="space-y-4 pt-4 border-t border-slate-50">
        <label className="text-xs font-black text-emerald-600 uppercase ml-1">Ağrıyı Azaltanlar</label>
        <div className="flex flex-wrap gap-2">
          {RELIEVERS.map(t => (
            <button key={t} type="button" onClick={() => toggle('painRelievers', t)}
              className={`px-4 py-2 rounded-xl text-xs font-bold border-2 transition-all ${formData.painRelievers.includes(t) ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-100' : 'bg-slate-50 border-transparent text-slate-500'}`}>
              {t}
            </button>
          ))}
        </div>
        <Input placeholder="Özel rahatlatıcı..." value={formData.customReliever} onChange={e => setFormData({...formData, customReliever: e.target.value})} />
      </div>
    </motion.div>
  );
}