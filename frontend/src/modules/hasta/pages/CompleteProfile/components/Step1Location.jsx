import { MapPin, User, Activity, Briefcase, Thermometer } from 'lucide-react';
import { motion } from 'framer-motion';
import Input from '../../../../../shared/components/ui/Input';
import Button from '../../../../../shared/components/ui/Button';
import IlIlceSelect from '../../../../../shared/components/ui/IlIlceSelect';

// Sabitler
const PAIN_REGIONS = ['Bel', 'Boyun', 'Omuz', 'Diz', 'Kalça', 'Ayak Bileği', 'Sırt', 'El Bileği', 'Dirsek'];
const ACTIVITY_LEVELS = [
    { value: 'sedentary', label: 'Hareketsiz' },
    { value: 'light', label: 'Az Hareketli' },
    { value: 'active', label: 'Aktif' },
    { value: 'athlete', label: 'Sporcu' }
];

export default function Step1Location({ formData, setFormData, onNext }) {
    
    const toggleRegion = (region) => {
        const current = formData.agriBolgesi || [];
        const next = current.includes(region) ? current.filter(r => r !== region) : [...current, region];
        setFormData({ ...formData, agriBolgesi: next });
    };

    return (
        <motion.div 
            initial={{ x: 20, opacity: 0 }} 
            animate={{ x: 0, opacity: 1 }} 
            className="space-y-8"
        >
            {/* Üst Başlık ve İkon */}
            <div className="text-center mb-8">
                <div className="w-16 h-16 bg-blue-50 rounded-3xl flex items-center justify-center text-blue-600 mx-auto mb-4 shadow-sm border border-blue-100">
                    <User size={32} />
                </div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tighter italic">Kişisel Bilgiler & Şikayet</h3>
                <p className="text-sm text-slate-500 mt-1">Seni daha iyi tanımamız için lütfen formu doldur.</p>
            </div>

            {/* 1. BÖLÜM: TEMEL BİLGİLER */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                    <MapPin size={16} className="text-blue-600" />
                    <span className="text-xs font-black text-slate-700 uppercase tracking-wider">Lokasyon & Demografi</span>
                </div>
                <IlIlceSelect
                    sehir={formData.sehir}
                    ilce={formData.ilce}
                    onSehirChange={(val) => setFormData(prev => ({ ...prev, sehir: val, ilce: '' }))}
                    onIlceChange={(val) => setFormData(prev => ({ ...prev, ilce: val }))}
                    theme="blue"
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input label="Doğum Tarihi" type="date" value={formData.dogumTarihi} onChange={e => setFormData({...formData, dogumTarihi: e.target.value})} />
                    <div className="space-y-2">
                        <label className="text-xs font-black text-slate-700 uppercase ml-1">Cinsiyet *</label>
                        <select value={formData.cinsiyet} onChange={e => setFormData({...formData, cinsiyet: e.target.value})} className="w-full p-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-bold outline-none focus:border-blue-600 transition-all appearance-none">
                            <option value="">Seçiniz</option>
                            <option value="erkek">Erkek</option>
                            <option value="kadin">Kadın</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* 2. BÖLÜM: YAŞAM TARZI */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                    <Briefcase size={16} className="text-blue-600" />
                    <span className="text-xs font-black text-slate-700 uppercase tracking-wider">Yaşam Tarzı</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input label="Meslek" icon={Briefcase} value={formData.meslek} onChange={e => setFormData({...formData, meslek: e.target.value})} placeholder="Örn: Yazılımcı" />
                    <div className="space-y-2">
                        <label className="text-xs font-black text-slate-700 uppercase ml-1">Günlük Aktivite Düzeyi *</label>
                        <select value={formData.aktiviteDuzeyi} onChange={e => setFormData({...formData, aktiviteDuzeyi: e.target.value})} className="w-full p-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-bold outline-none focus:border-blue-600 transition-all appearance-none">
                            <option value="">Seçiniz</option>
                            {ACTIVITY_LEVELS.map(level => (
                                <option key={level.value} value={level.value}>{level.label}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* 3. BÖLÜM: ŞİKAYET ANALİZİ */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                    <Activity size={16} className="text-blue-600" />
                    <span className="text-xs font-black text-slate-700 uppercase tracking-wider">Ağrı & Şikayet Analizi</span>
                </div>
                
                <div className="space-y-3">
                    <label className="text-xs font-black text-slate-700 uppercase ml-1">Ağrı Hissedilen Bölgeler *</label>
                    <div className="flex flex-wrap gap-2">
                        {PAIN_REGIONS.map(r => (
                            <button 
                                key={r} 
                                onClick={() => toggleRegion(r)} 
                                type="button" 
                                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all border-2 ${formData.agriBolgesi?.includes(r) ? 'bg-blue-600 border-blue-600 text-white shadow-lg' : 'bg-white border-slate-100 text-slate-500 hover:border-blue-200'}`}
                            >
                                {r}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3 p-4 bg-slate-50 rounded-3xl border border-slate-100">
                        <label className="text-xs font-black text-slate-700 uppercase flex justify-between">
                            Ağrı Seviyesi <span className="text-blue-600">{formData.agriSeviyesi || 1}/10</span>
                        </label>
                        <input 
                            type="range" min="1" max="10" 
                            value={formData.agriSeviyesi || 1} 
                            onChange={e => setFormData({...formData, agriSeviyesi: parseInt(e.target.value)})} 
                            className="w-full h-2 bg-blue-100 rounded-lg appearance-none cursor-pointer accent-blue-600" 
                        />
                        <div className="flex justify-between text-[10px] text-slate-400 font-bold px-1">
                            <span>AZ</span>
                            <span>ORTA</span>
                            <span>ŞİDDETLİ</span>
                        </div>
                    </div>
                    
                    <div className="space-y-2">
                        <label className="text-xs font-black text-slate-700 uppercase ml-1">Tedavi Tercihi *</label>
                        <select value={formData.tedaviTercihi} onChange={e => setFormData({...formData, tedaviTercihi: e.target.value})} className="w-full p-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-bold outline-none focus:border-blue-600 transition-all appearance-none">
                            <option value="">Seçiniz</option>
                            <option value="online">Online Tedavi</option>
                            <option value="evde">Evde Tedavi</option>
                            <option value="klinik">Belirsiz</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Buton Bölümü */}
            <Button 
                onClick={onNext} 
                className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black uppercase text-sm tracking-widest hover:bg-blue-600 transition-all shadow-xl shadow-blue-100"
            >
                Tıbbi Geçmişe Devam Et
            </Button>
        </motion.div>
    );
}