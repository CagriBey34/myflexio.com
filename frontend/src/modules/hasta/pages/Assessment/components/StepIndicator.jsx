import React from 'react';

export default function StepIndicator({ currentStep, totalSteps }) {
  // Adım isimleri (isteğe bağlı, sadece sayı da kalabilir)
  const stepNames = ["Profil", "Etki", "Faktörler", "Hedefler"];

  return (
    <div className="w-full mb-8">
      {/* Üst Bilgi Satırı */}
      <div className="flex justify-between items-end mb-4 px-2">
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mb-1">
            Mevcut Aşama
          </span>
          <h4 className="text-xl font-black text-slate-900 tracking-tighter italic leading-none">
            {stepNames[currentStep - 1]}
          </h4>
        </div>
        <div className="text-right">
          <span className="text-2xl font-black text-slate-900 tracking-tighter italic">
            0{currentStep}
            <span className="text-slate-300 mx-1">/</span>
            <span className="text-slate-300">0{totalSteps}</span>
          </span>
        </div>
      </div>

      {/* İlerleme Çubukları */}
      <div className="flex gap-2 px-1">
        {Array.from({ length: totalSteps }).map((_, i) => {
          const stepNumber = i + 1;
          const isActive = stepNumber === currentStep;
          const isCompleted = stepNumber < currentStep;

          return (
            <div
              key={i}
              className={`h-2 rounded-full transition-all duration-700 ease-out ${
                isActive 
                  ? 'w-16 bg-blue-600 shadow-lg shadow-blue-100' 
                  : isCompleted 
                    ? 'flex-1 bg-slate-900' 
                    : 'flex-1 bg-slate-100'
              }`}
            />
          );
        })}
      </div>
    </div>
  );
}