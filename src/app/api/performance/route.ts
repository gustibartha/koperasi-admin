import { NextResponse } from "next/server";
import { db } from "@/db";
import { performance } from "@/db/schema";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, bulan, nilai, evaluasi } = body;

    await db.insert(performance).values({
      id: crypto.randomUUID(),
      userId,
      bulan,
      nilai: parseInt(nilai),
      evaluasi,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}