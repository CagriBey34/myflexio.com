function formatTR(date) {
    if (!date) return '—';
    return new Date(date).toLocaleString('tr-TR', {
        weekday: 'long', day: 'numeric', month: 'long',
        year: 'numeric', hour: '2-digit', minute: '2-digit',
    });
}

function turLabel(tur) {
    return { online: 'Online', evde: 'Evde', klinik: 'Klinikte' }[tur] || tur;
}

function normalizeTelefon(tel) {
    if (!tel) return null;
    const clean = tel.replace(/[\s\-().]/g, '');
    if (clean.startsWith('+')) return clean;
    if (clean.startsWith('00')) return '+' + clean.slice(2);
    if (clean.startsWith('0')) return '+90' + clean.slice(1);
    if (clean.startsWith('5')) return '+90' + clean;
    return '+90' + clean;
}

/**
 * Green API üzerinden WhatsApp mesajı gönderir.
 * Ücretsiz: https://console.green-api.com/
 * 1. Kayıt ol → Instance oluştur → QR kodu tara → ID ve Token al
 * Env: GREEN_API_INSTANCE_ID, GREEN_API_TOKEN
 */
export async function sendWhatsApp({ to, message }) {
    const instanceId = process.env.GREEN_API_INSTANCE_ID;
    const token = process.env.GREEN_API_TOKEN;

    if (!instanceId || !token) {
        console.log(`[WhatsApp] Green API yapılandırılmamış — atlandı: ${to}`);
        return;
    }

    const phone = normalizeTelefon(to);
    if (!phone) {
        console.log(`[WhatsApp] Geçersiz numara: ${to}`);
        return;
    }

    // Green API chatId formatı: 905XXXXXXXXX@c.us
    const chatId = phone.replace('+', '') + '@c.us';

    try {
        const res = await fetch(
            `https://api.green-api.com/waInstance${instanceId}/sendMessage/${token}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ chatId, message }),
            }
        );
        if (res.ok) {
            console.log(`[WhatsApp] ✓ Gönderildi: ${phone}`);
        } else {
            const err = await res.json().catch(() => ({}));
            console.error(`[WhatsApp] ✗ Green API hatası:`, err);
        }
    } catch (err) {
        console.error(`[WhatsApp] ✗ Bağlantı hatası:`, err.message);
    }
}

// ─── Mesaj şablonları ─────────────────────────────────────────────────────────

export function waYeniRandevuUzman({ hastaAd, hastaSoyad, hastaEmail, hastaTelefon, talep_tarihi, talep_turu, randevu_tipi }) {
    const tip = randevu_tipi === 'on_gorusme' ? 'Ücretsiz Ön Görüşme' : 'Randevu';
    return (
        `🔔 *MyFlexio — Yeni ${tip} Talebi*\n\n` +
        `👤 Hasta: ${hastaAd} ${hastaSoyad}\n` +
        `📧 E-posta: ${hastaEmail}\n` +
        (hastaTelefon ? `📱 Telefon: ${hastaTelefon}\n` : '') +
        `🏥 Tür: ${turLabel(talep_turu)}\n` +
        (talep_tarihi ? `📅 Talep Tarihi: ${formatTR(talep_tarihi)}\n` : '') +
        `\nLütfen panele girerek tarih ve saat belirleyin.`
    );
}

export function waOnaylandiHasta({ hastaAd, uzmanUnvan, uzmanAd, uzmanSoyad, kesin_tarih, talep_tarihi, talep_turu, randevu_tipi }) {
    const tarihStr = kesin_tarih ? formatTR(kesin_tarih)
        : talep_tarihi ? formatTR(talep_tarihi)
        : 'Uzman tarafından bildirilecektir';
    const isOn = randevu_tipi === 'on_gorusme';
    return (
        `✅ *MyFlexio — Randevunuz Onaylandı*\n\n` +
        `Sayın ${hastaAd},\n\n` +
        `📋 Uzman: ${uzmanUnvan} ${uzmanAd} ${uzmanSoyad}\n` +
        `🏥 Tür: ${turLabel(talep_turu)}${isOn ? ' (Ücretsiz · 15 dk)' : ''}\n` +
        `📅 Tarih: ${tarihStr}\n\n` +
        `Belirtilen tarih ve saatte hazır olunuz.`
    );
}

export function waOnaylandiUzman({ uzmanAd, hastaAd, hastaSoyad, hastaTelefon, talep_tarihi, kesin_tarih, talep_turu, randevu_tipi }) {
    const tarihStr = kesin_tarih ? formatTR(kesin_tarih) : talep_tarihi ? formatTR(talep_tarihi) : '—';
    const isOn = randevu_tipi === 'on_gorusme';
    return (
        `✅ *MyFlexio — Randevu Onaylandı*\n\n` +
        `Sayın ${uzmanAd},\n\n` +
        `👤 Hasta: ${hastaAd} ${hastaSoyad}\n` +
        (hastaTelefon ? `📱 Telefon: ${hastaTelefon}\n` : '') +
        `🏥 Tür: ${turLabel(talep_turu)}${isOn ? ' (Ön Görüşme)' : ''}\n` +
        `📅 Tarih: ${tarihStr}`
    );
}

export function waReddedildiHasta({ hastaAd, uzmanUnvan, uzmanAd, uzmanSoyad, red_notu }) {
    return (
        `❌ *MyFlexio — Randevu Talebi*\n\n` +
        `Sayın ${hastaAd},\n` +
        `${uzmanUnvan} ${uzmanAd} ${uzmanSoyad} ile randevu talebiniz şu an için uygun değildir.\n` +
        (red_notu ? `\nAçıklama: ${red_notu}\n` : '') +
        `\nFarklı bir tarih için tekrar talepte bulunabilirsiniz.`
    );
}

export function waKesinTarihHasta({ hastaAd, uzmanUnvan, uzmanAd, uzmanSoyad, kesin_tarih, talep_turu }) {
    return (
        `📅 *MyFlexio — Randevu Tarihiniz Belirlendi*\n\n` +
        `Sayın ${hastaAd},\n\n` +
        `📋 Uzman: ${uzmanUnvan} ${uzmanAd} ${uzmanSoyad}\n` +
        `🏥 Tür: ${turLabel(talep_turu)}\n` +
        `📅 Tarih: ${formatTR(kesin_tarih)}\n\n` +
        `Lütfen belirtilen tarih ve saatte hazır olunuz.`
    );
}
