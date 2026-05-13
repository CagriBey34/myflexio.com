import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Pencil, Trash2, Check, X, ToggleLeft, ToggleRight } from 'lucide-react';
import { getSorular, createSoru, updateSoru, deleteSoru } from '../../services/adminService';

const TIP_LABEL = {
    multiple_choice: 'Çoktan Seçmeli',
    scale: 'Skala',
    text: 'Metin',
    yes_no: 'Evet/Hayır',
};

const BOSH_SORU = {
    soru_metni: '', soru_tipi: 'multiple_choice',
    kategori: '', secenekler: '', min_deger: '', max_deger: '',
    sira_no: 0, aktif: true
};

function SoruForm({ initial, onSave, onCancel }) {
    const [form, setForm] = useState(initial);

    const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

    const handleSave = () => {
        if (!form.soru_metni.trim()) return;
        const data = {
            ...form,
            secenekler: form.secenekler
                ? form.secenekler.split('\n').map(s => s.trim()).filter(Boolean)
                : null,
            min_deger: form.min_deger ? Number(form.min_deger) : null,
            max_deger: form.max_deger ? Number(form.max_deger) : null,
            sira_no: Number(form.sira_no) || 0,
        };
        onSave(data);
    };

    return (
        <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-5 space-y-4">
            <div>
                <label className="text-xs font-black text-gray-500 uppercase
                    tracking-widest block mb-1">Soru Metni</label>
                <textarea
                    value={form.soru_metni}
                    onChange={e => set('soru_metni', e.target.value)}
                    rows={2}
                    className="w-full border-2 border-gray-100 rounded-xl p-3
                        text-sm resize-none focus:outline-none focus:border-blue-300"
                    placeholder="Soruyu yazın..."
                />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div>
                    <label className="text-xs font-black text-gray-500 uppercase
                        tracking-widest block mb-1">Tür</label>
                    <select
                        value={form.soru_tipi}
                        onChange={e => set('soru_tipi', e.target.value)}
                        className="w-full border-2 border-gray-100 rounded-xl p-2.5
                            text-sm focus:outline-none"
                    >
                        {Object.entries(TIP_LABEL).map(([k, v]) => (
                            <option key={k} value={k}>{v}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="text-xs font-black text-gray-500 uppercase
                        tracking-widest block mb-1">Kategori</label>
                    <input
                        value={form.kategori}
                        onChange={e => set('kategori', e.target.value)}
                        className="w-full border-2 border-gray-100 rounded-xl p-2.5
                            text-sm focus:outline-none"
                        placeholder="ağrı, fonksiyon..."
                    />
                </div>
                <div>
                    <label className="text-xs font-black text-gray-500 uppercase
                        tracking-widest block mb-1">Sıra No</label>
                    <input
                        type="number"
                        value={form.sira_no}
                        onChange={e => set('sira_no', e.target.value)}
                        className="w-full border-2 border-gray-100 rounded-xl p-2.5
                            text-sm focus:outline-none"
                    />
                </div>
            </div>

            {form.soru_tipi === 'multiple_choice' && (
                <div>
                    <label className="text-xs font-black text-gray-500 uppercase
                        tracking-widest block mb-1">
                        Seçenekler (her satıra bir tane)
                    </label>
                    <textarea
                        value={form.secenekler}
                        onChange={e => set('secenekler', e.target.value)}
                        rows={4}
                        className="w-full border-2 border-gray-100 rounded-xl p-3
                            text-sm resize-none focus:outline-none focus:border-blue-300"
                        placeholder="Seçenek 1&#10;Seçenek 2&#10;Seçenek 3"
                    />
                </div>
            )}

            {form.soru_tipi === 'scale' && (
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="text-xs font-black text-gray-500 uppercase
                            tracking-widest block mb-1">Min</label>
                        <input type="number" value={form.min_deger}
                            onChange={e => set('min_deger', e.target.value)}
                            className="w-full border-2 border-gray-100 rounded-xl
                                p-2.5 text-sm focus:outline-none" />
                    </div>
                    <div>
                        <label className="text-xs font-black text-gray-500 uppercase
                            tracking-widest block mb-1">Max</label>
                        <input type="number" value={form.max_deger}
                            onChange={e => set('max_deger', e.target.value)}
                            className="w-full border-2 border-gray-100 rounded-xl
                                p-2.5 text-sm focus:outline-none" />
                    </div>
                </div>
            )}

            <div className="flex gap-2">
                <button onClick={handleSave}
                    className="flex items-center gap-1.5 bg-blue-600 text-white
                        text-xs font-black px-4 py-2.5 rounded-xl uppercase
                        tracking-widest hover:bg-blue-700 transition-colors">
                    <Check size={13} /> Kaydet
                </button>
                <button onClick={onCancel}
                    className="flex items-center gap-1.5 bg-white border-2
                        border-gray-200 text-gray-500 text-xs font-black px-4
                        py-2.5 rounded-xl uppercase tracking-widest">
                    <X size={13} /> İptal
                </button>
            </div>
        </div>
    );
}

export default function AssessmentSorular() {
    const [sorular, setSorular] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);

    useEffect(() => { fetchSorular(); }, []);

    const fetchSorular = async () => {
        setLoading(true);
        try {
            const res = await getSorular();
            setSorular(res.data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (data) => {
        try {
            await createSoru(data);
            setShowForm(false);
            fetchSorular();
        } catch { alert('Hata'); }
    };

    const handleUpdate = async (id, data) => {
        try {
            await updateSoru(id, data);
            setEditingId(null);
            fetchSorular();
        } catch { alert('Hata'); }
    };

    const handleToggle = async (soru) => {
        await updateSoru(soru.id, { ...soru, aktif: !soru.aktif });
        fetchSorular();
    };

    const handleDelete = async (id) => {
        if (!confirm('Soru pasife alınacak, emin misiniz?')) return;
        await deleteSoru(id);
        fetchSorular();
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">
                        Assessment Soruları
                    </h1>
                    <p className="text-gray-500 mt-1 text-sm">
                        {sorular.filter(s => s.aktif).length} aktif,{' '}
                        {sorular.filter(s => !s.aktif).length} pasif soru
                    </p>
                </div>
                <button
                    onClick={() => setShowForm(true)}
                    className="flex items-center gap-2 bg-blue-600 text-white
                        text-xs font-black px-5 py-3 rounded-xl uppercase
                        tracking-widest hover:bg-blue-700 transition-colors"
                >
                    <Plus size={15} /> Yeni Soru
                </button>
            </div>

            <AnimatePresence>
                {showForm && (
                    <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                    >
                        <SoruForm
                            initial={BOSH_SORU}
                            onSave={handleCreate}
                            onCancel={() => setShowForm(false)}
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            {loading ? (
                <div className="space-y-2">
                    {[1,2,3].map(i => (
                        <div key={i} className="h-16 bg-white rounded-2xl
                            animate-pulse border border-gray-100" />
                    ))}
                </div>
            ) : (
                <div className="space-y-2">
                    {sorular.map((soru, idx) => (
                        <motion.div key={soru.id} layout
                            className={`bg-white rounded-2xl border-2 overflow-hidden
                                ${soru.aktif
                                    ? 'border-gray-100'
                                    : 'border-gray-100 opacity-50'}`}
                        >
                            {editingId === soru.id ? (
                                <div className="p-4">
                                    <SoruForm
                                        initial={{
                                            ...soru,
                                            secenekler: Array.isArray(soru.secenekler)
                                                ? soru.secenekler.join('\n')
                                                : soru.secenekler || ''
                                        }}
                                        onSave={(data) => handleUpdate(soru.id, data)}
                                        onCancel={() => setEditingId(null)}
                                    />
                                </div>
                            ) : (
                                <div className="flex items-center gap-4 p-4">
                                    <span className="w-7 h-7 flex-shrink-0 bg-gray-100
                                        rounded-lg flex items-center justify-center
                                        text-xs font-black text-gray-500">
                                        {idx + 1}
                                    </span>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-gray-900 truncate">
                                            {soru.soru_metni}
                                        </p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-[10px] font-black
                                                bg-blue-50 text-blue-600 px-2 py-0.5
                                                rounded-full">
                                                {TIP_LABEL[soru.soru_tipi]}
                                            </span>
                                            {soru.kategori && (
                                                <span className="text-[10px] text-gray-400">
                                                    {soru.kategori}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1 flex-shrink-0">
                                        <button onClick={() => handleToggle(soru)}
                                            className="p-1.5 hover:bg-gray-100 rounded-lg
                                                transition-colors text-gray-400">
                                            {soru.aktif
                                                ? <ToggleRight size={18} className="text-green-500" />
                                                : <ToggleLeft size={18} />}
                                        </button>
                                        <button onClick={() => setEditingId(soru.id)}
                                            className="p-1.5 hover:bg-blue-50 rounded-lg
                                                transition-colors text-blue-400">
                                            <Pencil size={15} />
                                        </button>
                                        <button onClick={() => handleDelete(soru.id)}
                                            className="p-1.5 hover:bg-red-50 rounded-lg
                                                transition-colors text-red-400">
                                            <Trash2 size={15} />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
}
