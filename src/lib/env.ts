export const SITE_URL = (process.env.SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
export const SHOP_NAME = "Zukunftsgeschenk";
export const MAIL_FROM = process.env.MAIL_FROM ?? "Zukunftsgeschenk <hallo@zukunftsgeschenk.at>";
/** Absender zur Laufzeit (MAIL_FROM), zum Beispiel „Zukunftsgeschenk <hallo@zukunftsgeschenk.at>“. */
export const mailFrom = () => process.env.MAIL_FROM?.trim() || MAIL_FROM;
/** Antwortadresse: MAIL_REPLY_TO, sonst die Firmen-E-Mail (COMPANY_EMAIL), sonst keine. */
export const mailReplyTo = () => process.env.MAIL_REPLY_TO?.trim() || process.env.COMPANY_EMAIL?.trim() || null;
export const isDemoPayments = () => !process.env.STRIPE_SECRET_KEY;
export const isDemoMail = () => !process.env.RESEND_API_KEY;
