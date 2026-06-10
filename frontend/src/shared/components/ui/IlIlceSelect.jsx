import { useState, useRef, useEffect } from 'react';
import { MapPin, ChevronDown, X } from 'lucide-react';
import { ILLER, ILCELER } from '../../data/turkiyeIller';

function ComboBox({ label, value, onChange, options, placeholder, disabled, theme = 'green' }) {
  const [inputVal, setInputVal] = useState(value || '');
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    setInputVal(value || '');
  }, [value]);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filtered = options.filter(opt =>
    opt.toLowerCase().includes(inputVal.toLowerCase())
  );

  const handleInput = (e) => {
    const val = e.target.value;
    setInputVal(val);
    onChange(val);
    setOpen(true);
  };

  const handleSelect = (opt) => {
    setInputVal(opt);
    onChange(opt);
    setOpen(false);
  };

  const handleClear = () => {
    setInputVal('');
    onChange('');
    setOpen(false);
  };

  const themeStyles = {
    green: {
      label: 'text-[#0a2e1a]',
      input: 'border-gray-200 focus:ring-[#4ade80] focus:border-[#4ade80]',
      item: 'hover:bg-[#f0fdf4] hover:text-[#0f4c35]',
      active: 'bg-[#dcfce7] text-[#0f4c35] font-bold',
      icon: 'text-[#16a34a]',
    },
    blue: {
      label: 'text-slate-700',
      input: 'border-slate-100 focus:ring-blue-400 focus:border-blue-400 bg-slate-50',
      item: 'hover:bg-blue-50 hover:text-blue-700',
      active: 'bg-blue-50 text-blue-700 font-bold',
      icon: 'text-blue-500',
    },
  };

  const t = themeStyles[theme];

  return (
    <div ref={ref} className="relative">
      <label className={`block text-sm font-bold mb-2 ${t.label}`}>{label}</label>
      <div className="relative">
        <MapPin size={16} className={`absolute left-3 top-1/2 -translate-y-1/2 ${t.icon} pointer-events-none`} />
        <input
          type="text"
          value={inputVal}
          onChange={handleInput}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          disabled={disabled}
          autoComplete="off"
          className={`w-full pl-9 pr-8 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all ${t.input} ${disabled ? 'opacity-50 cursor-not-allowed bg-gray-50' : 'bg-white'}`}
        />
        {inputVal && !disabled ? (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={14} />
          </button>
        ) : (
          <ChevronDown
            size={14}
            className={`absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none transition-transform ${open ? 'rotate-180' : ''}`}
          />
        )}
      </div>

      {open && filtered.length > 0 && (
        <ul className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg max-h-52 overflow-y-auto scrollbar-thin">
          {filtered.map((opt) => (
            <li
              key={opt}
              onMouseDown={(e) => { e.preventDefault(); handleSelect(opt); }}
              className={`px-4 py-2.5 text-sm cursor-pointer transition-colors ${opt === value ? t.active : `text-gray-700 ${t.item}`}`}
            >
              {opt}
            </li>
          ))}
        </ul>
      )}

      {open && filtered.length === 0 && inputVal && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg px-4 py-3 text-sm text-gray-400">
          Sonuç bulunamadı
        </div>
      )}
    </div>
  );
}

export default function IlIlceSelect({ sehir, ilce, onSehirChange, onIlceChange, theme = 'green', className = '' }) {
  const ilceler = sehir && ILCELER[sehir] ? ILCELER[sehir] : [];

  const handleSehirChange = (val) => {
    // Tek bir çağrıda hem il hem ilçe sıfırlanıyor; parent functional update kullanmalı
    onSehirChange(val);
  };

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${className}`}>
      <ComboBox
        label="İl *"
        value={sehir}
        onChange={handleSehirChange}
        options={ILLER}
        placeholder="İl seçin veya yazın"
        theme={theme}
      />
      <ComboBox
        label="İlçe *"
        value={ilce}
        onChange={onIlceChange}
        options={ilceler}
        placeholder={sehir ? 'İlçe seçin veya yazın' : 'Önce il seçin'}
        disabled={!sehir}
        theme={theme}
      />
    </div>
  );
}
