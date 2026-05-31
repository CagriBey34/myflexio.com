const TABS = [
  { id: 'all', label: 'Tümü' },
  { id: 'yayinda', label: 'Yayında' },
  { id: 'taslak', label: 'Taslaklar' },
  { id: 'arsivlendi', label: 'Arşiv' }
];

export default function ArticleTabSystem({ activeTab, setActiveTab }) {
  return (
    <div className="bg-white border border-gray-100 p-2 rounded-full shadow-sm flex flex-wrap md:flex-nowrap gap-2">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`flex-1 px-6 py-3.5 rounded-full font-black text-[10px] md:text-xs uppercase tracking-widest transition-all duration-300 ${
            activeTab === tab.id
              ? 'bg-[#0f4c35] text-white shadow-lg shadow-green-900/20'
              : 'text-gray-500 hover:text-[#16a34a] hover:bg-[#f0fdf4]'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}