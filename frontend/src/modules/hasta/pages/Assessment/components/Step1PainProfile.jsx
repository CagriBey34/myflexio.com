import { Heart, Clock, Activity } from 'lucide-react';
import { motion } from 'framer-motion';
import Input from '../../../../../shared/components/ui/Input';

const PAIN_TYPES = ['Keskin', 'Künt', 'Zonklayıcı', 'Yanıcı', 'Karıncalanma', 'Uyuşma'];
const DURATIONS = ['1 haftadan az', '1-4 hafta', '1-3 ay', '3-6 ay', '1 yıldan fazla'];
const EMOJIS = ['😊', '🙂', '😐', '😣', '😫'];

export default function Step1PainProfile({ formData, setFormData }) {
    
    // Çoklu seçim mantığını buraya taşıyarak karmaşayı önleyelim
    const handleTypeToggle = (type) => {
        const currentTypes = formData.painTypes || [];
        const isSelected = currentTypes.includes(type);
        
        setFormData({
            ...formData,
            painTypes: isSelected 
                ? currentTypes.filter(t => t !== type) 
                : [...currentTypes, type]
        });
    };

    return (
        <motion.div 
            initial={{ x: 20, opacity: 0 }} 
            animate={{ x: 0, opacity: 1 }} 
            className="space-y-8"
        >
            {/* Başlık */}
            <div className="text-center">
                <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mx-auto mb-4">
                    <Heart size={28} />
                </div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tighter italic">Ağrı Profili</h3>
            </div>

            {/* 1. Ağrı Bölgesi - Focus kaybı olmaması için key ekledik */}
            <Input 
                key="pain-region-input"
                label="Ağrı Hangi Bölgede? *" 
                value={formData.painRegion} 
                onChange={e => setFormData({ ...formData, painRegion: e.target.value })} 
                placeholder="Örn: Alt Bel, Sol Diz..." 
            />

            {/* 2. Ağrı Şiddeti */}
            <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-700 uppercase ml-1">Ağrı Şiddeti ({formData.painSeverity}/5)</label>
                <div className="flex gap-2">
                    {EMOJIS.map((emoji, i) => (
                        <button
                            key={i}
                            type="button"
                            onClick={() => setFormData({ ...formData, painSeverity: i + 1 })}
                            className={`flex-1 py-4 rounded-2xl text-2xl transition-all border-2 ${
                                formData.painSeverity === i + 1 
                                ? 'bg-blue-600 border-blue-600 shadow-lg shadow-blue-100' 
                                : 'bg-slate-50 border-transparent grayscale opacity-50'
                            }`}
                        >
                            {emoji}
                        </button>
                    ))}
                </div>
            </div>

            {/* 3. Ağrı Süresi (Select) */}
            <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-700 uppercase ml-1 flex items-center gap-2">
                    <Clock size={12}/> Ağrı Süresi *
                </label>
                <select 
                    value={formData.painDuration} 
                    onChange={e => setFormData({ ...formData, painDuration: e.target.value })}
                    className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:border-blue-600 transition-all appearance-none"
                >
                    <option value="">Ne kadar süredir devam ediyor?</option>
                    {DURATIONS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
            </div>

            {/* 4. Ağrı Tipi (Multi-select) */}
            <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-700 uppercase ml-1 flex items-center gap-2">
                    <Activity size={12}/> Ağrı Nasıl Hissediliyor? *
                </label>
                <div className="flex flex-wrap gap-2">
                    {PAIN_TYPES.map(type => (
                        <button
                            key={type}
                            type="button"
                            onClick={() => handleTypeToggle(type)}
                            className={`px-4 py-2 rounded-xl text-xs font-bold border-2 transition-all ${
                                formData.painTypes.includes(type) 
                                ? 'bg-slate-900 border-slate-900 text-white shadow-lg' 
                                : 'bg-white border-slate-100 text-slate-500 hover:border-blue-200'
                            }`}
                        >
                            {type}
                        </button>
                    ))}
                </div>
            </div>
        </motion.div>
    );
}