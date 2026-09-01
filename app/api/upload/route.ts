import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "No se proporcionó ningún archivo de imagen" },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Validar tipo
    const mime = file.type;
    let ext = ".jpg";
    if (mime.includes("png")) ext = ".png";
    else if (mime.includes("webp")) ext = ".webp";
    else if (mime.includes("jpeg") || mime.includes("jpg")) ext = ".jpg";
    else {
      return NextResponse.json(
        { error: "Formato de archivo no compatible. Usa JPG, PNG o WEBP." },
        { status: 400 }
      );
    }

    const filename = `barber_${Date.now()}_${Math.random().toString(36).slice(2, 8)}${ext}`;
    const uploadDir = path.join(process.cwd(), "public", "uploads");

    await mkdir(uploadDir, { recursive: true });
    const filePath = path.join(uploadDir, filename);
    await writeFile(filePath, buffer);

    const publicUrl = `/uploads/${filename}`;
    return NextResponse.json({ ok: true, url: publicUrl });
  } catch (err) {
    console.error("Error al subir imagen:", err);
    return NextResponse.json(
      { error: "Error al procesar la subida de imagen" },
      { status: 500 }
    );
  }
}
