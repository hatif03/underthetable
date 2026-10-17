import { createRequire as __cr } from 'node:module'; const require = __cr(import.meta.url);

// server/human.ts
import { createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";
var POW_BITS = 16;
var WINDOW_MS = 5 * 6e4;
function key(env) {
  return env.secret || "underthetable-dev-only";
}
function sign(env, body) {
  return createHmac("sha256", key(env)).update(body).digest("hex");
}
function humanMode(env) {
  if (env.turnstileSecret && env.turnstileSite) return { mode: "turnstile", sitekey: env.turnstileSite };
  const body = `${Date.now()}.${randomBytes(8).toString("hex")}`;
  return { mode: "pow", challenge: `${body}.${sign(env, body)}`, bits: POW_BITS };
}

// server/handlers/human.ts
function handler(_req, res) {
  const out = res.status(200);
  out.setHeader("Cache-Control", "no-store");
  out.json(humanMode({ secret: process.env.HUMAN_SECRET || process.env.DRIP_KEY, turnstileSecret: process.env.TURNSTILE_SECRET, turnstileSite: process.env.TURNSTILE_SITEKEY }));
}
export {
  handler as default
};
