export const SITE_URL = (process.env.SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
export const SHOP_NAME = "Zukunftsgeschenk";
export const MAIL_FROM = process.env.MAIL_FROM ?? "Zukunftsgeschenk <hallo@zukunftsgeschenk.at>";
export const isDemoPayments = () => !process.env.STRIPE_SECRET_KEY;
export const isDemoMail = () => !process.env.RESEND_API_KEY;
