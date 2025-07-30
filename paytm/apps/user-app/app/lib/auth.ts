import bcrypt from "bcrypt";
import { PrismaClient } from "@prisma/client";
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const db = new PrismaClient();

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        number: { label: "Phone Number", type: "text", placeholder: "1234567890" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // 1. Validate credentials exist
        if (!credentials?.number || !credentials?.password) {
          return null;
        }

        // 2. Find user in the database
        const existingUser = await db.user.findFirst({
          where: { number: credentials.number },
        });

        if (existingUser) {
          // 3. If user exists, compare passwords
          const passwordValidation = await bcrypt.compare(
            credentials.password,
            existingUser.password
          );
          if (passwordValidation) {
            // 4. On successful login, return the user object
            return {
              id: existingUser.id.toString(),
              name: existingUser.name,
              number: existingUser.number, // Keep the property name consistent
            };
          }
          // If password is wrong, deny access
          return null;
        }

        // 5. If user does not exist, create a new one
        try {
          const hashedPassword = await bcrypt.hash(credentials.password, 10);
          const newUser = await db.user.create({
            data: {
              number: credentials.number,
              password: hashedPassword,
            },
          });
          return {
            id: newUser.id.toString(),
            name: newUser.name,
            number: newUser.number,
          };
        } catch (e) {
          console.error("Failed to create user:", e);
          return null;
        }
      },
    }),
  ],
  secret: process.env.JWT_SECRET || "a-strong-default-secret-for-development",
  callbacks: {
    //
    // The JWT callback is ESSENTIAL for passing custom data to the session.
    // It's called whenever a JSON Web Token is created.
    //
    async jwt({ token, user }) {
      if (user) {
        // The 'user' object is the one returned from 'authorize'
        token.id = user.id;
        (token as any).number = (user as any).number;
      }
      return token;
    },
    //
    // The session callback makes the data from the JWT available to the client.
    //
    async session({ session, token }) {
      // The 'token' object is the one from the 'jwt' callback
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).number = token.number;
      }
      return session;
    },
  },
};