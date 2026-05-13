import { FileText, ArrowLeft, Activity } from 'lucide-react';
import { motion } from 'framer-motion';
import Button from '../../../../../shared/components/ui/Button';

function ToggleBox({ label, checked, onChange, detail, onDetailChange, placeholder }) {
    return (
        <div className="space-y-3">
            <div onClick={() => onChange(!checked)} className={`p-4 rounded-2xl border-2 cursor-pointer flex items-center gap-3 transition-all ${checked ? 'border-blue-600 bg-blue-50/30 shadow-sm shadow-blue-100' : 'border-slate-100 bg-white'}`}>
                <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center ${checked ? 'bg-blue-600 border-blue-600' : 'border-slate-200'}`}>
                    {checked && <div className="w-2 h-2 bg-white rounded-full" />}
                </div>
                <span className="text-sm font-bold text-slate-700">{label}</span>
            </div>
            {checked && (
                <textarea value={detail} onChange={(event) => onDetailChange(event.target.value)} placeholder={placeholder} className="w-full p-4 bg-white border-2 border-blue-100 rounded-2xl text-sm font-medium outline-none h-24 italic" />
            )}
        </div>
    );
}

export default function Step2MedicalHistory({ formData, setFormData, onNext, onPrev }) {
    return (
        <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="space-y-6">
            <div className="text-center mb-8">
                <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mx-auto mb-4 shadow-sm">
                    <FileText size={30} />
                </div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tighter italic">Tıbbi Geçmiş</h3>
            </div>

            <div className="space-y-4">
                <ToggleBox label="Ameliyat Geçmişi" checked={formData.ameliyatGecmisi} onChange={v => setFormData({...formData, ameliyatGecmisi: v})} detail={formData.ameliyatDetay} onDetailChange={v => setFormData({...formData, ameliyatDetay: v})} placeholder="Lütfen ameliyatlarınızı belirtin..." />
                <ToggleBox label="Kronik Hastalık" checked={formData.kronikHastalik} onChange={v => setFormData({...formData, kronikHastalik: v})} detail={formData.kronikHastalikDetay} onDetailChange={v => setFormData({...formData, kronikHastalikDetay: v})} placeholder="Kronik hastalıklarınızı belirtin..." />
                <ToggleBox label="Sürekli İlaç Kullanımı" checked={formData.surekliIlac} onChange={v => setFormData({...formData, surekliIlac: v})} detail={formData.ilacListesi} onDetailChange={v => setFormData({...formData, ilacListesi: v})} placeholder="Kullandığınız ilaçları listeleyin..." />
                
                <div className="space-y-2">
                    <label className="text-xs font-black text-slate-700 uppercase ml-1">Alerjiler (Opsiyonel)</label>
                    <textarea value={formData.alerjiler} onChange={e => setFormData({...formData, alerjiler: e.target.value})} placeholder="Varsa alerjilerinizi belirtin..." className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm outline-none focus:border-blue-600 h-24 transition-all" />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4">
                <button onClick={onPrev} className="flex items-center justify-center gap-2 text-slate-400 font-black uppercase text-xs hover:text-slate-600 transition-all">
                    <ArrowLeft size={16} /> Geri
                </button>
                <Button onClick={onNext} className="bg-slate-900 text-white py-4 rounded-2xl font-black uppercase text-sm shadow-xl">Devam Et</Button>
            </div>
        </motion.div>
    );
}
