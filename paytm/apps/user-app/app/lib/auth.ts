import { PrismaClient } from "@repo/db/client";
import bcrypt from "bcrypt";
import { Session } from "next-auth";
import { JWT } from "next-auth/jwt";

const db = new PrismaClient();

export const authOptions = {
  providers: [
    {
      id: "credentials",
      name: "Credentials",
      type: "credentials",
      credentials: {
        number: { label: "Phone number", type: "text", placeholder: "1231231231" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials: { number?: string; password?: string } | undefined) {
        // Your existing authorize logic here
        if (
          !credentials ||
          typeof credentials.password !== "string" ||
          typeof credentials.number !== "string"
        ) {
          return null;
        }

        const existingUser = await db.user.findFirst({
          where: {
            number: credentials.number
          }
        });

        if (existingUser) {
          const passwordValidation = await bcrypt.compare(credentials.password, existingUser.password);
          if (passwordValidation) {
            return {
              id: existingUser.id.toString(),
              name: existingUser.name,
              email: existingUser.number
            };
          }
          return null;
        }

        const hashedPassword = await bcrypt.hash(credentials.password, 10);
        try {
          const user = await db.user.create({
            data: {
              number: credentials.number,
              password: hashedPassword
            }
          });

          return {
            id: user.id.toString(),
            name: user.name,
            email: user.number
          };
        } catch (e) {
          console.error(e);
        }

        return null;
      }
    }
  ],
  secret: process.env.JWT_SECRET || "secret",
  callbacks: {
    async session({ token, session }: { token: JWT; session: Session }) {
      if (session.user && token.sub) {
        (session.user as any).id = token.sub;
      }
      return session;
    }
  }
};
