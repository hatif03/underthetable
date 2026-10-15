import { existsSync, readFileSync } from "node:fs"

/** Puts every NAME=value in .env into process.env unless it is already set. Values are never printed. */
if (existsSync(".env")) {
  for (const line of readFileSync(".env", "utf8").split(/\r?\n/)) {
    const match = /^([A-Z][A-Z0-9_]*)=(.*)$/.exec(line.trim())
    if (match && match[2] && !process.env[match[1]]) process.env[match[1]] = match[2].replace(/^["']|["']$/g, "")
  }
}
