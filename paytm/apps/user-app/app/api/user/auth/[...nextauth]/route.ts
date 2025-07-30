// in apps/user-app/app/api/auth/[...nextauth]/route.ts

import NextAuth from "next-auth";
import { authOptions } from "../../../../lib/auth"; // Corrected relative path

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };