import { CloudUpload, Upload, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import Button from '../../../../../shared/components/ui/Button';

export default function Step3ReportUpload({ formData, setFormData, onSubmit, loading }) {
    return (
        <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="space-y-6">
            <div className="text-center mb-8">
                <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mx-auto mb-4 shadow-sm">
                    <CloudUpload size={30} />
                </div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tighter italic">Rapor Yükleme</h3>
            </div>

            <div className="space-y-4">
                <div className="space-y-2">
                    <label className="text-xs font-black text-slate-700 uppercase ml-1">Rapor Tipi</label>
                    <select value={formData.reportType} onChange={e => setFormData({...formData, reportType: e.target.value})} className="w-full p-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-bold outline-none focus:border-blue-600 transition-all">
                        <option value="mr">MR</option>
                        <option value="rontgen">Röntgen</option>
                        <option value="kan_tahlili">Kan Tahlili</option>
                        <option value="diger">Diğer</option>
                    </select>
                </div>

                <div className="relative group border-2 border-dashed border-blue-100 bg-blue-50/20 rounded-[2.5rem] p-12 text-center hover:border-blue-600 transition-all cursor-pointer">
                    <input type="file" onChange={e => setFormData({...formData, medicalReport: e.target.files[0]})} className="absolute inset-0 opacity-0 cursor-pointer" />
                    <div className="flex flex-col items-center">
                        <Upload className="text-blue-600 mb-3" size={36} />
                        <p className="text-sm font-black text-slate-700">{formData.medicalReport ? formData.medicalReport.name : 'Dosyayı Buraya Sürükle veya Tıkla'}</p>
                        <p className="text-[10px] text-slate-400 mt-2 uppercase tracking-widest font-black">PDF, JPG, PNG • Max 5MB</p>
                    </div>
                </div>

                <textarea placeholder="Rapor için kısa bir açıklama (Opsiyonel)..." value={formData.reportDescription} onChange={e => setFormData({...formData, reportDescription: e.target.value})} className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm outline-none focus:border-blue-600 h-24" />
            </div>

            <div className="bg-blue-600 p-6 rounded-[2rem] text-white flex items-center gap-4 shadow-xl shadow-blue-200">
                <ShieldCheck size={40} className="shrink-0 text-blue-200" />
                <p className="text-xs font-bold leading-relaxed">Verileriniz güvenle şifrelenir. Rapor yüklemek zorunlu değildir, dilediğiniz zaman "Atla ve Tamamla" diyebilirsiniz.</p>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4">
                <Button onClick={() => onSubmit(false)} variant="outline" loading={loading} className="py-4 rounded-2xl font-black text-sm text-slate-500 border-2 border-slate-100">Atla ve Bitir</Button>
                <Button onClick={() => onSubmit(true)} loading={loading} className="bg-blue-600 text-white py-4 rounded-2xl font-black text-sm shadow-xl shadow-blue-200" disabled={!formData.medicalReport}>Raporla Tamamla</Button>
            </div>
        </motion.div>
    );
}
