import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { magicLink } from "better-auth/plugins";
import { Resend } from "resend";
import { db } from "./db";
import * as schema from "./db/schema";

const resend = new Resend(process.env.RESEND_API_KEY);

// Only register OAuth providers if credentials are configured.
const socialProviders: Record<
  string,
  { clientId: string; clientSecret: string }
> = {};

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  socialProviders.google = {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  };
}

if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
  socialProviders.github = {
    clientId: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
  };
}

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  socialProviders,
  plugins: [
    magicLink({
      sendMagicLink: async ({ email, url }) => {
        const { error } = await resend.emails.send({
          from: process.env.EMAIL_FROM || "MiroFish <mirofish@radish.build>",
          to: email,
          subject: "Your MiroFish login link",
          html: `<p>Click the link below to log in to MiroFish:</p><p><a href="${url}">Log in to MiroFish</a></p><p>This link expires in 5 minutes.</p>`,
        });
        if (error) {
          console.error("Failed to send magic link email:", error);
          throw new Error("Failed to send login email. Please try again.");
        }
      },
    }),
  ],
});
