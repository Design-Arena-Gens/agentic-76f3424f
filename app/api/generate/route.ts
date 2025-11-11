import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function ensureEnv() {
  const key = process.env.OPENAI_API_KEY;
  if (!key) {
    throw new Error("Server is missing OPENAI_API_KEY.");
  }
  return key;
}

function clamp(n: number, min: number, max: number) { return Math.max(min, Math.min(max, n)); }

export async function POST(request: NextRequest) {
  try {
    const { prompt, size = "1024x1536", seed } = await request.json();

    if (typeof prompt !== "string" || prompt.trim().length < 10) {
      return NextResponse.json({ error: "Invalid prompt" }, { status: 400 });
    }

    const key = ensureEnv();
    const openai = new OpenAI({ apiKey: key });

    // Validate and map size
    const allowed = new Set(["1024x1536", "768x1344", "512x912", "1024x1024"]);
    const selected = allowed.has(size) ? size : "1024x1536";

    // Derive width/height for prompt guidance (OpenAI Images uses size string)
    const [w, h] = selected.split("x").map((v: string) => parseInt(v, 10));
    const width = clamp(w, 256, 2048);
    const height = clamp(h, 256, 2048);

    // Safety: explicitly non-sexual, portrait, natural, respectful
    const systemConstraints =
      "Photo portrait, non-sexual, respectful depiction, child-safe content, natural lighting.";

    const finalPrompt = `${prompt}\n\n${systemConstraints}\nFormat: portrait, ${width}x${height}, shallow depth of field, filmic bokeh, natural color grading.`;

    const resp = await openai.images.generate({
      model: "gpt-image-1",
      prompt: finalPrompt,
      size: selected as any,
      response_format: "b64_json",
      // Seed is not supported in gpt-image-1; included as noop compatibility
      // n: 1
    });

    const b64 = resp.data?.[0]?.b64_json;
    if (!b64) {
      return NextResponse.json({ error: "No image returned" }, { status: 502 });
    }

    return NextResponse.json({ imageBase64: b64 });
  } catch (err: any) {
    const message = err?.message || "Unexpected error";
    const status = message.includes("OPENAI_API_KEY") ? 501 : 500;
    return new NextResponse(message, { status });
  }
}
