export default function InfoSection({ title, icon, children }) {
  return (
    <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm relative overflow-hidden group">
      <h2 className="text-xl font-black text-slate-900 mb-8 uppercase tracking-tighter flex items-center gap-3">
        {icon} {title}
      </h2>
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}