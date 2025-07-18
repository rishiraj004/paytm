import { NextResponse } from "next/server";
import { PrismaClient } from "@repo/db/client";

const prisma = new PrismaClient();

export const GET = async () => {
    await prisma.user.create({
      data: {
          email: "asd",
          name: "adsads"
      }
    })
    return NextResponse.json({
        message: "hi there"
    })
}