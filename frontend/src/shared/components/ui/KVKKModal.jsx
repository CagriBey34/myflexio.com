import { motion, AnimatePresence } from 'framer-motion';
import { X, ShieldCheck } from 'lucide-react';

const HASTA_KVKK = `MYFLEXIO DİJİTAL SAĞLIK TEKNOLOJİLERİ
KİŞİSEL VERİLERİN KORUNMASI KANUNU (KVKK) AYDINLATMA METNİ

Veri Sorumlusu: myflexio Dijital Sağlık Platformu (Bundan sonra "myflexio" veya "Platform" olarak anılacaktır.)

6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") uyarınca, myflexio olarak, platformumuzu kullanan danışanlarımızın/hastalarımızın kişisel verilerini büyük bir hassasiyetle ve yasal mevzuata uygun olarak işlemekteyiz. Bu Aydınlatma Metni, platformumuz üzerinden toplanan verilerinizin hangileri olduğu, işlenme amaçları, aktarıldığı taraflar ve yasal haklarınız konusunda sizi bilgilendirmek amacıyla hazırlanmıştır.

1. İŞLENEN KİŞİSEL VERİLERİNİZ VE ÖZEL NİTELİKLİ VERİLERİNİZ

Platformumuzdaki formlar, ön görüşmeler ve üyelik işlemleri sırasında aşağıdaki verileriniz işlenmektedir:

Kimlik ve İletişim Bilgileri: Ad, soyad, doğum tarihi, cinsiyet, şehir, ilçe, e-posta adresi, telefon numarası.

Sağlık ve Özel Nitelikli Kişisel Veriler: Ağrı hissettiğiniz bölgeler, ağrı seviyeniz, mevcut ve geçmiş hastalık öykünüz, geçirdiğiniz ameliyatlar, kronik rahatsızlıklarınız, platin/protez/kalp pili taşıma durumunuz, platforma yüklediğiniz tıbbi raporlar (MR, Röntgen, Kan Tahlili vb.) ve uzman fizyoterapist ile yaptığınız görüntülü/sesli ön görüşme notları.

Mesleki ve Yaşam Tarzı Bilgileri: Mesleğiniz ve günlük aktivite düzeyiniz (hareketsiz, aktif vb.).

İşlem Güvenliği Bilgileri: IP adresi, site içi hareketler (log kayıtları).

2. KİŞİSEL VERİLERİN İŞLENME AMAÇLARI

Toplanan kişisel ve özel nitelikli verileriniz, aşağıdaki amaçlarla sınırlı, bağlantılı ve ölçülü olarak işlenir:

• Şikayetlerinize ve fiziksel durumunuza en uygun uzman fizyoterapist ile eşleştirilmenizi sağlamak,
• Size özel online/evde/klinik fizyoterapi ve egzersiz programlarının hazırlanması,
• Talep ettiğiniz 15 dakikalık ücretsiz ön görüşme ve tanışma seansının organize edilmesi ve yürütülmesi,
• Tıbbi geçmişinizin incelenerek fiziksel egzersizler esnasında oluşabilecek sağlık risklerinin (kontrendikasyon) önceden tespit edilmesi ve engellenmesi,
• Platform üzerindeki kullanıcı hesabınızın doğrulanması ve işlem güvenliğinin sağlanması.

3. KİŞİSEL VERİLERİN AKTARILMASI

Kişisel verileriniz, KVKK'nın 8. ve 9. maddelerinde belirtilen şartlara uygun olarak, yalnızca sistem üzerinden seçtiğiniz veya size atanan uzman fizyoterapistinizle ve platformun teknik altyapısını sağlayan (veri gizliliği sözleşmesi imzalanmış) güvenli bulut/sunucu sağlayıcıları ile paylaşılır. Sağlık verileriniz başta olmak üzere hiçbir kişisel veriniz, açık rızanız olmaksızın reklam, pazarlama amacıyla üçüncü şahıslara veya kurumlara asla aktarılmaz.

4. KİŞİSEL VERİ TOPLAMANIN YÖNTEMİ VE HUKUKİ SEBEBİ

Kişisel verileriniz, web sitemizde yer alan üyelik ekranları ve görüntülü ön görüşme yazılımları vasıtasıyla tamamen dijital ortamda toplanmaktadır. Verilerinizin işlenmesinin hukuki sebebi; KVKK Madde 5/1 uyarınca "Açık Rızanızın Bulunması" ve Madde 6/3 uyarınca kamu sağlığının korunması ile tıbbî tedavi hizmetlerinin yürütülmesidir.

5. KVKK MADDE 11 UYARINCA HAKLARINIZ

Dilediğiniz zaman myflexio'ya başvurarak kişisel verilerinizle ilgili şu haklarınızı kullanabilirsiniz:

• Verilerinizin işlenip işlenmediğini öğrenme,
• İşlenmişse buna ilişkin bilgi talep etme,
• İşlenme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme,
• Yurt içinde veya yurt dışında aktarıldığı üçüncü kişileri bilme,
• Eksik veya yanlış işlenmişse düzeltilmesini isteme,
• KVKK Madde 7 çerçevesinde verilerinizin silinmesini veya yok edilmesini isteme,
• İşlenen verilerin münhasıran otomatik sistemler vasıtasıyla analiz edilmesi suretiyle aleyhinize bir sonucun ortaya çıkmasına itiraz etme.

Başvurularınızı sistemimize kayıtlı e-posta adresiniz üzerinden kvkk@myflexio.com adresine iletebilirsiniz.`;

const UZMAN_KVKK = `MYFLEXIO DİJİTAL SAĞLIK TEKNOLOJİLERİ
KİŞİSEL VERİLERİN KORUNMASI KANUNU (KVKK) AYDINLATMA METNİ — UZMAN / FİZYOTERAPİST

Veri Sorumlusu: myflexio Dijital Sağlık Platformu (Bundan sonra "myflexio" veya "Platform" olarak anılacaktır.)

6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") uyarınca, myflexio olarak, platformumuzda hizmet veren uzman fizyoterapistlerin kişisel verilerini büyük bir hassasiyetle ve yasal mevzuata uygun olarak işlemekteyiz. Bu Aydınlatma Metni, platforma üye olma ve hizmet sunma sürecinizde toplanan verilerinizin hangileri olduğu, işlenme amaçları, aktarıldığı taraflar ve yasal haklarınız konusunda sizi bilgilendirmek amacıyla hazırlanmıştır.

1. İŞLENEN KİŞİSEL VERİLERİNİZ

Platform üyeliği ve hizmet sunumu süreçlerinde aşağıdaki kişisel verileriniz işlenmektedir:

Kimlik ve İletişim Bilgileri: Ad, soyad, unvan, e-posta adresi, telefon numarası.

Mesleki ve Eğitim Bilgileri: Uzmanlık alanı, mesleki unvan (Fizyoterapist, Ortopedist, Spor Hekimi vb.), diploma veya mesleki yeterlilik belgeleri/sertifikalar.

Finansal Bilgiler: Ödeme alımına ilişkin IBAN numarası ve hesap sahibi bilgileri.

Platform Kullanım Bilgileri: Hastalarla gerçekleştirilen görüşme kayıtları, hazırlanan tedavi planları, seans notları ve platform içi işlem geçmişi.

İşlem Güvenliği Bilgileri: IP adresi, oturum açma kayıtları (log verileri).

2. KİŞİSEL VERİLERİN İŞLENME AMAÇLARI

Toplanan verileriniz aşağıdaki amaçlarla sınırlı, bağlantılı ve ölçülü biçimde işlenmektedir:

• Uzman kimliğinizin ve mesleki yeterliliğinizin doğrulanması (diploma/belge incelemesi),
• Platformdaki hastalara profesyonel profil bilgilerinizin gösterilmesi ve eşleşme sürecinin yürütülmesi,
• Randevu, ön görüşme ve seans takip süreçlerinin yönetimi,
• Hazırladığınız tedavi planlarının hastaya iletilmesi ve takibinin sağlanması,
• Hizmetlerinize ilişkin ödeme işlemlerinin gerçekleştirilmesi (IBAN aracılığıyla),
• Platform güvenliğinin ve hesap bütünlüğünün korunması,
• Yasal yükümlülüklerin yerine getirilmesi.

3. KİŞİSEL VERİLERİN AKTARILMASI

Kişisel verileriniz, KVKK'nın 8. ve 9. maddelerinde belirtilen şartlara uygun olarak yalnızca aşağıdaki taraflarla paylaşılır:

• Hizmet sunduğunuz hastalar (profil bilgileri ve iletişim verisi, aktif eşleşme durumunda),
• Platformun teknik altyapısını sağlayan ve veri gizliliği sözleşmesi imzalanmış güvenli bulut/sunucu sağlayıcıları.

Verileriniz hiçbir koşulda açık rızanız olmaksızın reklam, pazarlama veya ticari amaçlarla üçüncü taraflarla paylaşılmaz.

4. KİŞİSEL VERİ TOPLAMANIN YÖNTEMİ VE HUKUKİ SEBEBİ

Kişisel verileriniz; platform üyelik formu, profil düzenleme ekranları ve belge yükleme sistemleri aracılığıyla tamamen dijital ortamda toplanmaktadır. Verilerinizin işlenmesinin hukuki sebebi; KVKK Madde 5/1 uyarınca "Açık Rızanızın Bulunması" ile bir sözleşmenin kurulması veya ifasıyla doğrudan ilgili olması (Madde 5/2-c) ve kanunlarda açıkça öngörülmesidir (Madde 5/2-a).

5. KVKK MADDE 11 UYARINCA HAKLARINIZ

Dilediğiniz zaman myflexio'ya başvurarak kişisel verilerinizle ilgili şu haklarınızı kullanabilirsiniz:

• Verilerinizin işlenip işlenmediğini öğrenme,
• İşlenmişse buna ilişkin bilgi talep etme,
• İşlenme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme,
• Yurt içinde veya yurt dışında aktarıldığı üçüncü kişileri bilme,
• Eksik veya yanlış işlenmişse düzeltilmesini isteme,
• KVKK Madde 7 çerçevesinde verilerinizin silinmesini veya yok edilmesini isteme,
• İşlenen verilerin münhasıran otomatik sistemler vasıtasıyla analiz edilmesi suretiyle aleyhinize bir sonucun ortaya çıkmasına itiraz etme.

Başvurularınızı sistemimize kayıtlı e-posta adresiniz üzerinden kvkk@myflexio.com adresine iletebilirsiniz.`;

export default function KVKKModal({ open, onClose, onAccept, tip = 'hasta' }) {
    const metin = tip === 'uzman' ? UZMAN_KVKK : HASTA_KVKK;
    const baslik = tip === 'uzman'
        ? 'Uzman / Fizyoterapist KVKK Aydınlatma Metni'
        : 'Hasta KVKK Aydınlatma Metni';

    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-sm"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ y: 60, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 60, opacity: 0 }}
                        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
                        onClick={e => e.stopPropagation()}
                        className="bg-white w-full sm:max-w-2xl sm:rounded-[2rem] rounded-t-[2rem] shadow-2xl flex flex-col max-h-[90vh]"
                    >
                        {/* Başlık */}
                        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100 shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-[#dcfce7] flex items-center justify-center shrink-0">
                                    <ShieldCheck size={18} className="text-[#16a34a]" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-[#16a34a] uppercase tracking-widest">KVKK</p>
                                    <p className="text-sm font-black text-[#0a2e1a] leading-tight">{baslik}</p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors shrink-0"
                            >
                                <X size={16} className="text-gray-500" />
                            </button>
                        </div>

                        {/* Metin */}
                        <div className="overflow-y-auto flex-1 px-6 py-5">
                            <div className="prose prose-sm max-w-none">
                                {metin.split('\n').map((satir, i) => {
                                    if (!satir.trim()) return <div key={i} className="h-2" />;
                                    if (/^\d+\./.test(satir.trim())) {
                                        return (
                                            <p key={i} className="text-xs font-black text-[#0a2e1a] uppercase tracking-widest mt-4 mb-2">
                                                {satir.trim()}
                                            </p>
                                        );
                                    }
                                    if (satir.trim().startsWith('•')) {
                                        return (
                                            <p key={i} className="text-xs text-gray-600 font-medium pl-3 leading-relaxed mb-1">
                                                {satir.trim()}
                                            </p>
                                        );
                                    }
                                    if (i < 3) {
                                        return (
                                            <p key={i} className="text-[11px] font-black text-[#0a2e1a] uppercase tracking-wider mb-1">
                                                {satir.trim()}
                                            </p>
                                        );
                                    }
                                    return (
                                        <p key={i} className="text-xs text-gray-600 font-medium leading-relaxed mb-1">
                                            {satir.trim()}
                                        </p>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Alt Butonlar */}
                        <div className="px-6 py-5 border-t border-gray-100 shrink-0 flex flex-col sm:flex-row gap-3">
                            <button
                                onClick={onClose}
                                className="flex-1 py-3 rounded-2xl border-2 border-gray-200 text-gray-500 text-xs font-black uppercase tracking-widest hover:bg-gray-50 transition-colors"
                            >
                                Kapat
                            </button>
                            {onAccept && (
                                <button
                                    onClick={() => { onAccept(); onClose(); }}
                                    className="flex-1 py-3 rounded-2xl bg-[#16a34a] hover:bg-[#15803d] text-white text-xs font-black uppercase tracking-widest transition-colors shadow-lg shadow-green-900/20"
                                >
                                    Okudum, Onaylıyorum
                                </button>
                            )}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
