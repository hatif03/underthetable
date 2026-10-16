import { suggestSlip } from "../assist.ts"

type AssistRequest = {
  method?: string
  body?: { text?: string }
}

type AssistResponse = {
  status: (code: number) => { json: (body: unknown) => void }
}

export default async function handler(req: AssistRequest, res: AssistResponse) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Send a description with POST." })
    return
  }
  const apiKey = process.env.IFM_API_KEY ?? ""
  if (!apiKey) {
    res.status(503).json({ error: "The form assistant is not configured. Fill the slip yourself." })
    return
  }
  try {
    const suggestion = await suggestSlip(String(req.body?.text ?? ""), apiKey)
    res.status(200).json({ suggestion })
  } catch (error) {
    res.status(400).json({ error: error instanceof Error ? error.message : "Could not fill the slip." })
  }
}
