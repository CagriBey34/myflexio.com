import { User, Mail, Phone, Calendar, MapPin } from 'lucide-react';

export default function BasicInfoCard({ profile }) {
  const infoItems = [
    { icon: <User size={18}/>, label: 'Ad Soyad', val: `${profile?.ad} ${profile?.soyad}` },
    { icon: <Mail size={18}/>, label: 'E-posta', val: profile?.email },
    { icon: <Phone size={18}/>, label: 'Telefon', val: profile?.telefon },
    { icon: <Calendar size={18}/>, label: 'Doğum Tarihi', val: profile?.dogum_tarihi ? new Date(profile.dogum_tarihi).toLocaleDateString('tr-TR') : '-' },
    { icon: <MapPin size={18}/>, label: 'Lokasyon', val: profile?.sehir ? `${profile.sehir}, ${profile.ilce}` : '-' },
  ];

  return (
    <div className="bg-white rounded-[2rem] sm:rounded-[2.5rem] p-4 sm:p-6 md:p-8 border border-slate-100 shadow-sm">
      <h2 className="text-xl font-black text-slate-900 mb-5 sm:mb-8 uppercase tracking-tighter flex items-center gap-3">
        <User className="text-blue-600" size={24} /> Temel Bilgiler
      </h2>
      <div className="grid sm:grid-cols-2 gap-y-8 gap-x-4">
        {infoItems.map((item, i) => (
          <div key={i} className="flex gap-4">
            <div className="p-3 bg-slate-50 rounded-xl h-fit text-slate-400">{item.icon}</div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{item.label}</p>
              <p className="font-bold text-slate-700 break-all">{item.val}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}