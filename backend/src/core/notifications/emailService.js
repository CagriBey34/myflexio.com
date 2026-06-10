import nodemailer from 'nodemailer';

const APP_NAME = 'MyFlexio';
const BRAND_COLOR = '#1e3a5f';

let transporter = null;

function getTransporter() {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) return null;
    if (!transporter) {
        transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'smtp.gmail.com',
            port: parseInt(process.env.SMTP_PORT || '587'),
            secure: process.env.SMTP_SECURE === 'true',
            auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
        });
    }
    return transporter;
}

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

function base(content) {
    return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
body{font-family:Arial,sans-serif;background:#f5f5f5;margin:0;padding:20px}
.w{max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.08)}
.h{background:${BRAND_COLOR};color:#fff;padding:24px 32px;font-size:22px;font-weight:bold}
.b{padding:32px}
.row{display:flex;gap:8px;padding:8px 0;border-bottom:1px solid #f0f0f0}
.lbl{color:#888;width:150px;flex-shrink:0;font-size:14px}
.val{font-size:14px;font-weight:bold;color:#222}
.note{background:#fffbea;border-left:4px solid #f59e0b;padding:12px 16px;border-radius:4px;font-size:14px;color:#92400e;margin:16px 0}
.reject{background:#fff3f3;border-left:4px solid #ef4444;padding:12px 16px;border-radius:4px;font-size:14px;color:#991b1b;margin:16px 0}
.date-box{background:#eff6ff;border:2px solid #3b82f6;border-radius:8px;padding:16px;text-align:center;margin:16px 0}
.date-box .d{font-size:20px;font-weight:bold;color:#1d4ed8}
.ft{background:#f9f9f9;padding:14px 32px;font-size:12px;color:#aaa;text-align:center}
</style></head><body>
<div class="w">
  <div class="h">${APP_NAME}</div>
  <div class="b">${content}</div>
  <div class="ft">Bu e-posta ${APP_NAME} tarafından otomatik olarak gönderilmiştir.</div>
</div></body></html>`;
}

export async function sendEmail({ to, subject, html }) {
    const t = getTransporter();
    if (!t) {
        console.log(`[Email] SMTP yapılandırılmamış — atlandı: ${to} | ${subject}`);
        return;
    }
    try {
        const fromAddress = process.env.MAIL_FROM || process.env.SMTP_USER;
        await t.sendMail({ from: `"${APP_NAME}" <${fromAddress}>`, to, subject, html });
        console.log(`[Email] ✓ Gönderildi: ${to}`);
    } catch (err) {
        console.error(`[Email] ✗ Hata (${to}):`, err.message);
    }
}

// ─── Şablonlar ────────────────────────────────────────────────────────────────

export function mailYeniRandevuUzman({ hastaAd, hastaSoyad, hastaEmail, hastaTelefon, talep_tarihi, talep_turu, randevu_tipi, hasta_notu }) {
    const tip = randevu_tipi === 'on_gorusme' ? 'Ücretsiz Ön Görüşme' : 'Randevu';
    return {
        subject: `Yeni ${tip} Talebi — ${hastaAd} ${hastaSoyad}`,
        html: base(`
            <h3 style="margin:0 0 16px;color:${BRAND_COLOR}">Yeni ${tip} Talebi</h3>
            <p style="color:#555;font-size:14px"><strong>${hastaAd} ${hastaSoyad}</strong> size bir <strong>${tip.toLowerCase()}</strong> talebi gönderdi.</p>
            <div class="row"><span class="lbl">Hasta</span><span class="val">${hastaAd} ${hastaSoyad}</span></div>
            <div class="row"><span class="lbl">E-posta</span><span class="val">${hastaEmail}</span></div>
            ${hastaTelefon ? `<div class="row"><span class="lbl">Telefon</span><span class="val">${hastaTelefon}</span></div>` : ''}
            <div class="row"><span class="lbl">Görüşme Türü</span><span class="val">${turLabel(talep_turu)}</span></div>
            ${talep_tarihi ? `<div class="row"><span class="lbl">Talep Tarihi</span><span class="val">${formatTR(talep_tarihi)}</span></div>` : ''}
            ${hasta_notu ? `<div class="note"><strong>Hasta Notu:</strong> ${hasta_notu}</div>` : ''}
            <p style="font-size:13px;color:#888;margin-top:20px">Talep, admin onayından sonra aktif olacaktır. Randevu panelinizden takip edebilirsiniz.</p>
        `),
    };
}

export function mailYeniRandevuAdmin({ hastaAd, hastaSoyad, hastaEmail, uzmanAd, uzmanSoyad, uzmanUnvan, talep_tarihi, talep_turu, randevu_tipi }) {
    const tip = randevu_tipi === 'on_gorusme' ? 'Ücretsiz Ön Görüşme' : 'Randevu';
    return {
        subject: `[Admin] Yeni ${tip} Talebi — Onay Bekliyor`,
        html: base(`
            <h3 style="margin:0 0 16px;color:${BRAND_COLOR}">[Admin] Yeni ${tip} Talebi</h3>
            <div class="row"><span class="lbl">Hasta</span><span class="val">${hastaAd} ${hastaSoyad}</span></div>
            <div class="row"><span class="lbl">Hasta E-posta</span><span class="val">${hastaEmail}</span></div>
            <div class="row"><span class="lbl">Uzman</span><span class="val">${uzmanUnvan} ${uzmanAd} ${uzmanSoyad}</span></div>
            <div class="row"><span class="lbl">Görüşme Türü</span><span class="val">${turLabel(talep_turu)}</span></div>
            ${talep_tarihi ? `<div class="row"><span class="lbl">Talep Tarihi</span><span class="val">${formatTR(talep_tarihi)}</span></div>` : ''}
            <p style="font-size:13px;color:#888;margin-top:20px">Admin panelinizden onaylayabilir veya reddedebilirsiniz.</p>
        `),
    };
}

export function mailOnaylandiHasta({ hastaAd, uzmanUnvan, uzmanAd, uzmanSoyad, uzmanEmail, uzmanTelefon, talep_tarihi, talep_turu, randevu_tipi }) {
    const isOn = randevu_tipi === 'on_gorusme';
    return {
        subject: `Randevunuz Onaylandı — ${uzmanUnvan} ${uzmanAd} ${uzmanSoyad}`,
        html: base(`
            <h3 style="margin:0 0 16px;color:#15803d">✅ Randevunuz Onaylandı</h3>
            <p style="color:#555;font-size:14px">Sayın <strong>${hastaAd}</strong>, randevu talebiniz onaylandı.</p>
            <div class="row"><span class="lbl">Uzman</span><span class="val">${uzmanUnvan} ${uzmanAd} ${uzmanSoyad}</span></div>
            ${uzmanEmail ? `<div class="row"><span class="lbl">Uzman E-posta</span><span class="val">${uzmanEmail}</span></div>` : ''}
            ${uzmanTelefon ? `<div class="row"><span class="lbl">Uzman Telefon</span><span class="val">${uzmanTelefon}</span></div>` : ''}
            <div class="row"><span class="lbl">Görüşme Türü</span><span class="val">${turLabel(talep_turu)}</span></div>
            ${talep_tarihi ? `<div class="row"><span class="lbl">Tarih</span><span class="val">${formatTR(talep_tarihi)}</span></div>` : ''}
            ${isOn ? '<div class="note">Ön görüşme için uzmanınız en kısa sürede size kesin tarih ve saat bildirimi yapacaktır.</div>' : ''}
            <p style="font-size:13px;color:#888;margin-top:20px">Randevu panelinizden detayları görüntüleyebilirsiniz.</p>
        `),
    };
}

export function mailOnaylandiUzman({ uzmanAd, hastaAd, hastaSoyad, hastaEmail, hastaTelefon, talep_tarihi, talep_turu, randevu_tipi }) {
    const isOn = randevu_tipi === 'on_gorusme';
    return {
        subject: `Randevu Onaylandı — ${hastaAd} ${hastaSoyad}`,
        html: base(`
            <h3 style="margin:0 0 16px;color:#15803d">✅ Randevu Onaylandı</h3>
            <p style="color:#555;font-size:14px">Sayın <strong>${uzmanAd}</strong>, hasta randevusu admin tarafından onaylandı.</p>
            <div class="row"><span class="lbl">Hasta</span><span class="val">${hastaAd} ${hastaSoyad}</span></div>
            <div class="row"><span class="lbl">E-posta</span><span class="val">${hastaEmail}</span></div>
            ${hastaTelefon ? `<div class="row"><span class="lbl">Telefon</span><span class="val">${hastaTelefon}</span></div>` : ''}
            <div class="row"><span class="lbl">Görüşme Türü</span><span class="val">${turLabel(talep_turu)}</span></div>
            ${talep_tarihi ? `<div class="row"><span class="lbl">Tarih</span><span class="val">${formatTR(talep_tarihi)}</span></div>` : ''}
            ${isOn ? '<div class="note"><strong>Ön görüşme:</strong> Lütfen panelinizden hasta için kesin tarih ve saat belirleyin.</div>' : ''}
        `),
    };
}

export function mailReddedildiHasta({ hastaAd, uzmanUnvan, uzmanAd, uzmanSoyad, red_notu }) {
    return {
        subject: `Randevu Talebiniz Hakkında Bilgilendirme`,
        html: base(`
            <h3 style="margin:0 0 16px;color:#b91c1c">Randevu Talebiniz Hakkında</h3>
            <p style="color:#555;font-size:14px">Sayın <strong>${hastaAd}</strong>, <strong>${uzmanUnvan} ${uzmanAd} ${uzmanSoyad}</strong> ile randevu talebiniz şu an için uygun değildir.</p>
            ${red_notu ? `<div class="reject"><strong>Açıklama:</strong> ${red_notu}</div>` : ''}
            <p style="font-size:14px;color:#555;margin-top:16px">Farklı bir tarih veya uzman için tekrar talepte bulunabilirsiniz.</p>
        `),
    };
}

export function mailKesinTarihHasta({ hastaAd, uzmanUnvan, uzmanAd, uzmanSoyad, kesin_tarih, talep_turu }) {
    return {
        subject: `Randevu Tarihiniz Belirlendi — ${new Date(kesin_tarih).toLocaleDateString('tr-TR')}`,
        html: base(`
            <h3 style="margin:0 0 16px;color:${BRAND_COLOR}">📅 Randevu Tarihiniz Belirlendi</h3>
            <p style="color:#555;font-size:14px">Sayın <strong>${hastaAd}</strong>, uzmanınız randevu tarihinizi belirledi.</p>
            <div class="date-box"><div class="d">${formatTR(kesin_tarih)}</div></div>
            <div class="row"><span class="lbl">Uzman</span><span class="val">${uzmanUnvan} ${uzmanAd} ${uzmanSoyad}</span></div>
            <div class="row"><span class="lbl">Görüşme Türü</span><span class="val">${turLabel(talep_turu)}</span></div>
            <p style="font-size:13px;color:#888;margin-top:20px">Lütfen belirtilen tarih ve saatte hazır olunuz.</p>
        `),
    };
}
