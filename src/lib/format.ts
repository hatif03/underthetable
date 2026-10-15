export function rupees(amount: number): string {
  return `₹${amount.toLocaleString("en-IN")}`
}

export function measure(kind: string | undefined, amount: number): string {
  if ((kind ?? "demand") === "demand") return rupees(amount)
  return `severity ${amount}`
}

export function shortAddress(address: string): string {
  if (address.length < 12) return address
  return `${address.slice(0, 6)}…${address.slice(-4)}`
}

export function cliHint(district: string, minInr?: number): string {
  const min = minInr !== undefined ? ` --min-inr ${minInr}` : ""
  return `npm run query -- --district ${district}${min}`
}
