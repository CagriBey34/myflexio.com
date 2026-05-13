const TABS = [
  { id: 'all', label: 'Tümü' },
  { id: 'yayinda', label: 'Yayında' },
  { id: 'taslak', label: 'Taslaklar' },
  { id: 'arsivlendi', label: 'Arşiv' }
];

export default function ArticleTabSystem({ activeTab, setActiveTab }) {
  return (
    <div className="bg-white border-2 border-slate-100 p-2 rounded-[2rem] shadow-sm flex flex-wrap md:flex-nowrap gap-2">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`flex-1 px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${
            activeTab === tab.id
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-100'
              : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}