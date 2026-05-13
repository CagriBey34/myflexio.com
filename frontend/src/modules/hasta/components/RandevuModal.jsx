import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X, Calendar, Clock, MessageSquare,
    CheckCircle, AlertCircle, Loader
} from 'lucide-react';
import { createRandevu } from '../services/randevuService';

const TURLER = [
    { key: 'online', label: 'Online', emoji: '💻', desc: 'Video görüşme ile' },
    { key: 'evde',   label: 'Evde',   emoji: '🏠', desc: 'Uzman size gelir' },
    { key: 'klinik', label: 'Klinikte', emoji: '🏥', desc: 'Klinikte yüz yüze' },
];

// Bugünden itibaren 60 gün, saat 08:00-20:00 arası slotlar
const generateTimeSlots = () => {
    const slots = [];
    for (let h = 8; h <= 19; h++) {
        slots.push(`${String(h).padStart(2, '0')}:00`);
        slots.push(`${String(h).padStart(2, '0')}:30`);
    }
    return slots;
};

const generateDates = () => {
    const dates = [];
    const today = new Date();
    for (let i = 1; i <= 30; i++) {
        const d = new Date(today);
        d.setDate(today.getDate() + i);
        // Pazar günlerini atla
        if (d.getDay() !== 0) dates.push(d);
    }
    return dates;
};

const TIME_SLOTS = generateTimeSlots();
const DATES = generateDates();

export default function RandevuModal({ isOpen, onClose, uzmanProfileId, uzmanAd }) {
    const [step, setStep] = useState(1); // 1: tür, 2: tarih, 3: saat+not, 4: sonuç
    const [selectedTur, setSelectedTur] = useState(null);
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedTime, setSelectedTime] = useState(null);
    const [not, setNot] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const reset = () => {
        setStep(1);
        setSelectedTur(null);
        setSelectedDate(null);
        setSelectedTime(null);
        setNot('');
        setError('');
    };

    const handleClose = () => {
        reset();
        onClose();
    };

    const handleSubmit = async () => {
        if (!selectedTur || !selectedDate || !selectedTime) return;
        setLoading(true);
        setError('');
        try {
            // Tarih + saat birleştir
            const dateStr = selectedDate.toISOString().split('T')[0];
            const talep_tarihi = `${dateStr} ${selectedTime}:00`;

            await createRandevu({
                uzman_profile_id: uzmanProfileId,
                talep_tarihi,
                talep_turu: selectedTur,
                hasta_notu: not || null,
            });
            setStep(4);
        } catch (e) {
            setError(e.response?.data?.message || 'Bir hata oluştu, tekrar deneyin.');
        } finally {
            setLoading(false);
        }
    };

    // Seçili tarihin kısa yazısı
    const dateLabel = selectedDate
        ? selectedDate.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', weekday: 'long' })
        : null;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleClose}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-lg
                            max-h-[90vh] overflow-hidden flex flex-col">

                            {/* Header */}
                            <div className="flex items-center justify-between p-6 pb-4 border-b border-gray-100">
                                <div>
                                    <h2 className="text-xl font-black text-slate-900 tracking-tight">
                                        Randevu Talebi
                                    </h2>
                                    <p className="text-xs text-gray-400 font-semibold mt-0.5">
                                        {uzmanAd}
                                    </p>
                                </div>
                                <button
                                    onClick={handleClose}
                                    className="w-9 h-9 flex items-center justify-center
                                        rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors"
                                >
                                    <X size={18} className="text-gray-500" />
                                </button>
                            </div>

                            {/* Step bar */}
                            {step < 4 && (
                                <div className="px-6 pt-4 flex gap-2">
                                    {[1, 2, 3].map(s => (
                                        <div key={s}
                                            className={`h-1 flex-1 rounded-full transition-all duration-300
                                                ${s <= step ? 'bg-blue-600' : 'bg-gray-100'}`}
                                        />
                                    ))}
                                </div>
                            )}

                            {/* Content */}
                            <div className="flex-1 overflow-y-auto p-6">
                                <AnimatePresence mode="wait">

                                    {/* STEP 1 — Görüşme türü */}
                                    {step === 1 && (
                                        <motion.div key="step1"
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -20 }}
                                        >
                                            <p className="text-sm font-black text-gray-500 uppercase
                                                tracking-widest mb-4">
                                                Görüşme Türü
                                            </p>
                                            <div className="space-y-3">
                                                {TURLER.map(tur => (
                                                    <button
                                                        key={tur.key}
                                                        onClick={() => setSelectedTur(tur.key)}
                                                        className={`w-full flex items-center gap-4 p-4
                                                            rounded-2xl border-2 transition-all text-left
                                                            ${selectedTur === tur.key
                                                                ? 'border-blue-600 bg-blue-50'
                                                                : 'border-gray-100 hover:border-gray-200'}`}
                                                    >
                                                        <span className="text-2xl">{tur.emoji}</span>
                                                        <div>
                                                            <div className="font-black text-slate-900">
                                                                {tur.label}
                                                            </div>
                                                            <div className="text-xs text-gray-400">
                                                                {tur.desc}
                                                            </div>
                                                        </div>
                                                        {selectedTur === tur.key && (
                                                            <CheckCircle size={18}
                                                                className="ml-auto text-blue-600" />
                                                        )}
                                                    </button>
                                                ))}
                                            </div>
                                        </motion.div>
                                    )}

                                    {/* STEP 2 — Tarih seç */}
                                    {step === 2 && (
                                        <motion.div key="step2"
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -20 }}
                                        >
                                            <p className="text-sm font-black text-gray-500 uppercase
                                                tracking-widest mb-4">
                                                Tarih Seç
                                            </p>
                                            <div className="grid grid-cols-3 gap-2">
                                                {DATES.map((date, i) => {
                                                    const isSelected = selectedDate?.toDateString() === date.toDateString();
                                                    return (
                                                        <button key={i}
                                                            onClick={() => setSelectedDate(date)}
                                                            className={`p-3 rounded-2xl border-2 text-center
                                                                transition-all
                                                                ${isSelected
                                                                    ? 'border-blue-600 bg-blue-600 text-white'
                                                                    : 'border-gray-100 hover:border-blue-200'}`}
                                                        >
                                                            <div className={`text-[10px] font-black uppercase
                                                                tracking-widest
                                                                ${isSelected ? 'text-blue-100' : 'text-gray-400'}`}>
                                                                {date.toLocaleDateString('tr-TR', { weekday: 'short' })}
                                                            </div>
                                                            <div className={`text-xl font-black
                                                                ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                                                                {date.getDate()}
                                                            </div>
                                                            <div className={`text-[10px] font-bold
                                                                ${isSelected ? 'text-blue-100' : 'text-gray-400'}`}>
                                                                {date.toLocaleDateString('tr-TR', { month: 'short' })}
                                                            </div>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </motion.div>
                                    )}

                                    {/* STEP 3 — Saat + Not */}
                                    {step === 3 && (
                                        <motion.div key="step3"
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -20 }}
                                            className="space-y-5"
                                        >
                                            {/* Özet */}
                                            <div className="bg-blue-50 rounded-2xl p-4 flex gap-3
                                                items-center border border-blue-100">
                                                <Calendar size={18} className="text-blue-600 flex-shrink-0" />
                                                <div className="text-sm">
                                                    <span className="font-black text-slate-900">
                                                        {dateLabel}
                                                    </span>
                                                    <span className="text-blue-500 font-semibold ml-2">
                                                        · {TURLER.find(t => t.key === selectedTur)?.label}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Saat */}
                                            <div>
                                                <p className="text-sm font-black text-gray-500 uppercase
                                                    tracking-widest mb-3">
                                                    Saat Seç
                                                </p>
                                                <div className="grid grid-cols-4 gap-2">
                                                    {TIME_SLOTS.map(slot => (
                                                        <button key={slot}
                                                            onClick={() => setSelectedTime(slot)}
                                                            className={`py-2.5 rounded-xl text-sm font-black
                                                                border-2 transition-all
                                                                ${selectedTime === slot
                                                                    ? 'border-blue-600 bg-blue-600 text-white'
                                                                    : 'border-gray-100 text-slate-700 hover:border-blue-200'}`}
                                                        >
                                                            {slot}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Not */}
                                            <div>
                                                <p className="text-sm font-black text-gray-500 uppercase
                                                    tracking-widest mb-2">
                                                    Not Ekle
                                                    <span className="text-gray-300 font-normal ml-1 normal-case">
                                                        (opsiyonel)
                                                    </span>
                                                </p>
                                                <textarea
                                                    value={not}
                                                    onChange={(e) => setNot(e.target.value)}
                                                    rows={3}
                                                    placeholder="Şikayetinizi veya özel isteğinizi kısaca yazın..."
                                                    className="w-full text-sm border-2 border-gray-100
                                                        rounded-2xl p-4 resize-none focus:outline-none
                                                        focus:border-blue-300 transition-colors"
                                                />
                                            </div>

                                            {error && (
                                                <div className="flex items-center gap-2 bg-red-50
                                                    text-red-600 text-sm font-semibold p-4
                                                    rounded-2xl border border-red-100">
                                                    <AlertCircle size={16} />
                                                    {error}
                                                </div>
                                            )}
                                        </motion.div>
                                    )}

                                    {/* STEP 4 — Başarı */}
                                    {step === 4 && (
                                        <motion.div key="step4"
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="py-8 text-center"
                                        >
                                            <motion.div
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                transition={{ type: 'spring', delay: 0.1 }}
                                                className="w-20 h-20 bg-green-100 rounded-full
                                                    flex items-center justify-center mx-auto mb-5"
                                            >
                                                <CheckCircle className="text-green-600" size={40} />
                                            </motion.div>
                                            <h3 className="text-2xl font-black text-slate-900 mb-2">
                                                Talebiniz Alındı!
                                            </h3>
                                            <p className="text-gray-500 text-sm leading-relaxed">
                                                Randevu talebiniz ekibimize iletildi.
                                                En kısa sürede sizinle iletişime geçeceğiz.
                                            </p>
                                            <div className="mt-6 bg-blue-50 rounded-2xl p-4
                                                border border-blue-100 text-left">
                                                <div className="text-xs font-black text-blue-400
                                                    uppercase tracking-widest mb-2">
                                                    Özet
                                                </div>
                                                <div className="text-sm space-y-1">
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-500">Uzman</span>
                                                        <span className="font-bold text-slate-900">
                                                            {uzmanAd}
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-500">Tarih</span>
                                                        <span className="font-bold text-slate-900">
                                                            {dateLabel}
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-500">Saat</span>
                                                        <span className="font-bold text-slate-900">
                                                            {selectedTime}
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-500">Tür</span>
                                                        <span className="font-bold text-slate-900">
                                                            {TURLER.find(t => t.key === selectedTur)?.label}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}

                                </AnimatePresence>
                            </div>

                            {/* Footer butonları */}
                            {step < 4 && (
                                <div className="p-6 pt-0 flex gap-3">
                                    {step > 1 && (
                                        <button
                                            onClick={() => setStep(s => s - 1)}
                                            className="px-5 py-3 rounded-2xl border-2 border-gray-100
                                                text-gray-500 font-black text-sm hover:bg-gray-50
                                                transition-colors"
                                        >
                                            Geri
                                        </button>
                                    )}
                                    {step < 3 ? (
                                        <button
                                            onClick={() => setStep(s => s + 1)}
                                            disabled={
                                                (step === 1 && !selectedTur) ||
                                                (step === 2 && !selectedDate)
                                            }
                                            className="flex-1 py-3 rounded-2xl bg-slate-900
                                                text-white font-black text-sm uppercase tracking-widest
                                                disabled:opacity-30 disabled:cursor-not-allowed
                                                hover:bg-blue-600 transition-colors"
                                        >
                                            Devam Et
                                        </button>
                                    ) : (
                                        <button
                                            onClick={handleSubmit}
                                            disabled={!selectedTime || loading}
                                            className="flex-1 py-3 rounded-2xl bg-blue-600
                                                text-white font-black text-sm uppercase tracking-widest
                                                disabled:opacity-30 disabled:cursor-not-allowed
                                                hover:bg-blue-700 transition-colors flex items-center
                                                justify-center gap-2 shadow-lg shadow-blue-200"
                                        >
                                            {loading
                                                ? <><Loader size={16} className="animate-spin" /> Gönderiliyor...</>
                                                : 'Talebi Gönder'
                                            }
                                        </button>
                                    )}
                                </div>
                            )}

                            {step === 4 && (
                                <div className="p-6 pt-0">
                                    <button
                                        onClick={handleClose}
                                        className="w-full py-3 rounded-2xl bg-slate-900
                                            text-white font-black text-sm uppercase tracking-widest
                                            hover:bg-blue-600 transition-colors"
                                    >
                                        Tamam
                                    </button>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}