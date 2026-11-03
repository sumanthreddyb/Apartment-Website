import NextAuth from "next-auth";
import type { EmailConfig } from "next-auth/providers/email";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { SMTPClient } from "emailjs";
import { db } from "@/db";
import { accounts, sessions, users, verificationTokens } from "@/db/schema";

const authDb = db;
const smtpUrl = process.env.SMTP_URL;
const emailProvider: EmailConfig | null = smtpUrl ? {
  id: "email",
  name: "Email",
  type: "email",
  server: smtpUrl,
  from: process.env.SMTP_FROM ?? "ApartmentHub <no-reply@localhost>",
  async sendVerificationRequest({ identifier, url, provider }) {
    const server = new URL(provider.server);
    const secure = server.protocol === "smtps:";
    const client = new SMTPClient({
      host: server.hostname,
      port: Number(server.port || (secure ? 465 : 25)),
      user: decodeURIComponent(server.username),
      password: decodeURIComponent(server.password),
      ssl: secure,
      tls: server.protocol === "smtp:" && server.port === "587",
      timeout: 10_000,
    });
    try {
      await client.sendAsync({
        from: provider.from ?? "ApartmentHub <no-reply@localhost>",
        to: identifier,
        subject: "Your ApartmentHub sign-in link",
        text: `Use this secure link to sign in to ApartmentHub:\n\n${url}\n\nIf you did not request this link, you can ignore this email.`,
      });
    } finally {
      client.smtp.close();
    }
  },
} : null;

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...(authDb ? { adapter: DrizzleAdapter(authDb, { usersTable: users, accountsTable: accounts, sessionsTable: sessions, verificationTokensTable: verificationTokens }) } : {}),
  providers: emailProvider ? [emailProvider] : [],
  session: { strategy: "database" },
  secret: process.env.AUTH_SECRET,
  trustHost: true,
  pages: { signIn: "/signin" },
});
