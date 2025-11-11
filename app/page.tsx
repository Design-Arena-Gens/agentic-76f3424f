"use client";

import { useState } from "react";
import Image from "next/image";

const DEFAULT_PROMPT = "Ultra-realistic cinematic portrait of a rabbit-child human hybrid character. Soft white and light-grey fur blended with gentle childlike human facial features. Age around 4. Innocent expressive eyes, slightly oversized ears, small round nose. Wearing simple worn clothes like a village kid, natural colors and soft textures. Real-life lighting with shallow depth of field, soft background bokeh, high-detail skin and fur texture, natural shadows, 9:16 frame, lifelike color grading.";

export default function HomePage() {
  const [prompt, setPrompt] = useState(DEFAULT_PROMPT);
  const [size, setSize] = useState("1024x1536"); // 9:16
  const [seed, setSeed] = useState<string>("");
  const [image, setImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onGenerate() {
    setError(null);
    setIsLoading(true);
    setImage(null);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, size, seed: seed || undefined })
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || `Generation failed (${response.status})`);
      }

      const data = await response.json();
      setImage(data.imageBase64);
    } catch (err: any) {
      setError(err.message || "Failed to generate image");
    } finally {
      setIsLoading(false);
    }
  }

  function onClear() {
    setImage(null);
  }

  return (
    <main className="card">
      <div className="row">
        <div>
          <label>Prompt</label>
          <textarea rows={10} value={prompt} onChange={(e) => setPrompt(e.target.value)} />
          <div className="helper">Describe the portrait you want to generate.</div>
        </div>
        <div>
          <label>Size</label>
          <select value={size} onChange={(e) => setSize(e.target.value)}>
            <option value="1024x1536">1024x1536 (9:16)</option>
            <option value="768x1344">768x1344 (9:16)</option>
            <option value="512x912">512x912 (9:16)</option>
            <option value="1024x1024">1024x1024</option>
          </select>
          <label style={{ marginTop: 12 }}>Seed (optional)</label>
          <input value={seed} onChange={(e) => setSeed(e.target.value)} placeholder="e.g. 42" />

          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <button onClick={onGenerate} disabled={isLoading}>
              {isLoading ? <span className="spinner" /> : "Generate"}
            </button>
            <button className="secondary" onClick={onClear} disabled={!image || isLoading}>Clear</button>
          </div>

          {error && (
            <p className="helper" style={{ color: '#b91c1c', marginTop: 10 }}>{error}</p>
          )}
        </div>
      </div>

      <div style={{ marginTop: 16 }}>
        <label>Result</label>
        <div className="imageWrap" style={{ aspectRatio: size.replace('x', ' / '), width: '100%', maxHeight: 760 }}>
          {image ? (
            <Image
              alt="Generated image"
              src={`data:image/png;base64,${image}`}
              fill
              style={{ objectFit: 'cover' }}
              sizes="(max-width: 820px) 100vw, 820px"
              priority
            />
          ) : (
            <div style={{ color: '#94a3b8', display: 'grid', placeItems: 'center', height: '100%' }}>
              {isLoading ? 'Generating?' : 'No image yet'}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
