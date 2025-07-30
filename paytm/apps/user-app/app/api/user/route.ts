import { NextResponse } from "next/server";
import {PrismaClient} from "@repo/db/client";

const prisma = new PrismaClient();

export const GET = async () => {
    await prisma.user.create({
        data: {
            name: "John Doe",
            number: "1234567890",
            password: "hashed_password_example"
        }
    })
    return NextResponse.json({
        message: "hi there"
    })
}