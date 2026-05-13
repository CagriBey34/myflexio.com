export default function StepIndicator({ currentStep, totalSteps }) {
    return (
        <div className="flex items-center justify-between mb-8 px-2">
            <div className="flex gap-2.5">
                {[1, 2, 3].map(step => (
                    <div key={step} className={`h-2 rounded-full transition-all duration-700 ${step === currentStep ? 'w-14 bg-blue-600' : 'w-4 bg-slate-200'}`} />
                ))}
            </div>
            <div className="flex flex-col items-end leading-none">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Aşama</span>
                <span className="text-xl font-black text-slate-900 tracking-tighter italic">{currentStep}<span className="text-slate-300">/</span>{totalSteps}</span>
            </div>
        </div>
    );
}