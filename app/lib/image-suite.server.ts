import sharp from "sharp";

// ── HELPERS ─────────────────────────────────────────────────

async function fetchImageBuffer(url: string): Promise<Buffer> {
  const resp = await fetch(url);
  if (!resp.ok) throw new Error(`Fetch failed: ${resp.status}`);
  const arrayBuffer = await resp.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

async function uploadToTempStorage(buffer: Buffer, filename: string): Promise<string> {
  // Per ora ritorniamo data URL base64 (funziona ma è grande)
  // In futuro: caricare su R2/S3 per URL pulite
  const base64 = buffer.toString("base64");
  return `data:image/png;base64,${base64}`;
}

// ── 1. RESIZE / QUADRATURA ──────────────────────────────────

export async function resizeImage(
  imageUrl: string,
  targetSize: number = 2048,
  background: "white" | "transparent" | "dominant" = "white"
): Promise<{ buffer: Buffer; width: number; height: number }> {
  const inputBuffer = await fetchImageBuffer(imageUrl);

  let bgColor: { r: number; g: number; b: number; alpha: number };
  if (background === "transparent") {
    bgColor = { r: 0, g: 0, b: 0, alpha: 0 };
  } else if (background === "dominant") {
    // Estrai il colore dominante dai bordi dell'immagine
    const stats = await sharp(inputBuffer).stats();
    const dominant = stats.dominant;
    bgColor = { r: dominant.r, g: dominant.g, b: dominant.b, alpha: 1 };
  } else {
    bgColor = { r: 255, g: 255, b: 255, alpha: 1 };
  }

  const resized = await sharp(inputBuffer)
    .resize(targetSize, targetSize, {
      fit: "contain",
      background: bgColor,
    })
    .png()
    .toBuffer();

  return { buffer: resized, width: targetSize, height: targetSize };
}

// ── 2. CROP INTELLIGENTE ────────────────────────────────────

export async function cropImage(imageUrl: string): Promise<{ buffer: Buffer; width: number; height: number }> {
  const inputBuffer = await fetchImageBuffer(imageUrl);

  // Sharp ha "trim" che rimuove bordi uniformi automaticamente
  const trimmed = await sharp(inputBuffer)
    .trim({ threshold: 10 })
    .png()
    .toBuffer();

  const meta = await sharp(trimmed).metadata();
  return {
    buffer: trimmed,
    width: meta.width || 0,
    height: meta.height || 0,
  };
}

// ── 3. RIMOZIONE SFONDO (Replicate Rembg) ───────────────────

export async function removeBackgroundOp(
  imageUrl: string,
  replaceWith: "white" | "transparent" | string = "white"
): Promise<string> {
  const { default: Replicate } = await import("replicate");
  const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN });

  const output = await replicate.run(
    "cjwbw/rembg:fb8af171cfa1616ddcf1242c093f9c46bcada5ad4cf6f2fbe8b81b330ec5c003" as `${string}/${string}:${string}`,
    { input: { image: imageUrl } }
  );

  const transparentUrl = typeof output === "string" ? output : String(output);

  if (replaceWith === "transparent") {
    return transparentUrl;
  }

  // Compose il PNG trasparente su sfondo bianco/colore
  const transparentBuffer = await fetchImageBuffer(transparentUrl);
  const meta = await sharp(transparentBuffer).metadata();

  let bgColor = { r: 255, g: 255, b: 255, alpha: 1 };
  if (replaceWith !== "white" && replaceWith.startsWith("#")) {
    const hex = replaceWith.replace("#", "");
    bgColor = {
      r: parseInt(hex.substring(0, 2), 16),
      g: parseInt(hex.substring(2, 4), 16),
      b: parseInt(hex.substring(4, 6), 16),
      alpha: 1,
    };
  }

  const composed = await sharp({
    create: {
      width: meta.width || 1024,
      height: meta.height || 1024,
      channels: 4,
      background: bgColor,
    },
  })
    .composite([{ input: transparentBuffer, blend: "over" }])
    .png()
    .toBuffer();

  return await uploadToTempStorage(composed, "no-bg.png");
}

// ── 4. UPSCALE AI ───────────────────────────────────────────

export async function upscaleImageOp(
  imageUrl: string,
  model: "swinir" | "clarity" = "swinir",
  scale: number = 2
): Promise<string> {
  const { default: Replicate } = await import("replicate");
  const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN });

  let modelId: string;
  let modelInput: any;

  if (model === "clarity") {
    modelId = "philz1337x/clarity-upscaler:dfad41707589d68ecdccd1dfa600d55a208f9310748e44bfe35b4a6291453d5e";
    modelInput = {
      image: imageUrl,
      scale_factor: scale,
      dynamic: 6,
      creativity: 0.1,
      resemblance: 2.5,
      sharpen: 1,
      num_inference_steps: 25,
      handfix: "disabled",
      output_format: "png",
    };
  } else {
    modelId = "jingyunliang/swinir:660d922d33153019e8c263a3bba265de882e7f4f70396546b6c9c8f9d47a021a";
    modelInput = {
      image: imageUrl,
      task_type: "Real-World Image Super-Resolution-Large",
      noise: 15,
      jpeg: 40,
    };
  }

  // Retry su 429
  let output;
  let attempts = 0;
  while (attempts < 4) {
    try {
      output = await replicate.run(modelId as `${string}/${string}:${string}`, { input: modelInput });
      break;
    } catch (err: any) {
      attempts++;
      const msg = err.message || String(err);
      if (msg.includes("429") || msg.includes("Too Many Requests")) {
        const retryMatch = msg.match(/retry_after["\s:]+(\d+)/);
        const retrySec = retryMatch ? parseInt(retryMatch[1]) : 12;
        await new Promise((r) => setTimeout(r, (retrySec + 2) * 1000));
        continue;
      }
      throw err;
    }
  }

  if (!output) throw new Error("Max retries reached on upscale");
  return typeof output === "string" ? output : String(output);
}

// ── PIPELINE ORCHESTRATOR ───────────────────────────────────

export interface PipelineOperation {
  type: "resize" | "crop" | "removeBackground" | "upscale";
  options?: any;
}

export async function processPipeline(
  imageUrl: string,
  operations: PipelineOperation[]
): Promise<{ finalUrl: string; steps: string[] }> {
  let currentUrl = imageUrl;
  const steps: string[] = [];

  for (const op of operations) {
    try {
      if (op.type === "removeBackground") {
        currentUrl = await removeBackgroundOp(
          currentUrl,
          op.options?.replaceWith || "white"
        );
        steps.push("✅ Sfondo rimosso");
      } else if (op.type === "upscale") {
        currentUrl = await upscaleImageOp(
          currentUrl,
          op.options?.model || "swinir",
          op.options?.scale || 2
        );
        steps.push(`✅ Upscale ${op.options?.model || "swinir"} ${op.options?.scale || 2}x`);
      } else if (op.type === "crop") {
        const result = await cropImage(currentUrl);
        currentUrl = await uploadToTempStorage(result.buffer, "cropped.png");
        steps.push("✅ Crop eseguito");
      } else if (op.type === "resize") {
        const result = await resizeImage(
          currentUrl,
          op.options?.targetSize || 2048,
          op.options?.background || "white"
        );
        currentUrl = await uploadToTempStorage(result.buffer, "resized.png");
        steps.push(`✅ Resize ${op.options?.targetSize || 2048}px`);
      }
    } catch (err: any) {
      steps.push(`❌ ${op.type}: ${err.message}`);
      throw err;
    }
  }

  return { finalUrl: currentUrl, steps };
}
