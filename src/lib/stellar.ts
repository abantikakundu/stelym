export const STELLAR_NETWORK = "testnet" as const;

/** Stelym tipping contract on Stellar testnet. */
export const CONTRACT_ID =
  "CBFKEXJOQ3ZDJZC66PZYSELB36EHFRBPPGUE6ZW22B2AEDYECVJUH2QZ";

export const NATIVE_XLM_SAC =
  "CBFKEXJOQ3ZDJZC66PZYSELB36EHFRBPPGUE6ZW22B2AEDYECVJUH2QZ";

export const RPC_URL = "https://soroban-testnet.stellar.org";

export const NETWORK_PASSPHRASE = "Test SDF Network ; September 2015";

export const STROOPS_PER_XLM = BigInt(10_000_000);

export function xlmToStroops(input: string): bigint {
  const trimmed = input.trim();
  if (!trimmed) {
    throw new Error("Amount is required");
  }

  const parts = trimmed.split(".");
  if (parts.length > 2) {
    throw new Error("Invalid XLM amount");
  }

  const wholePart = parts[0] === "" ? "0" : parts[0];
  const fracPart = parts[1] ?? "";

  if (!/^\d+$/.test(wholePart) || (fracPart !== "" && !/^\d+$/.test(fracPart))) {
    throw new Error("Invalid XLM amount");
  }
  if (fracPart.length > 7) {
    throw new Error("XLM supports at most 7 decimal places");
  }

  const fracPadded = (fracPart + "0000000").slice(0, 7);
  const stroops = BigInt(wholePart) * STROOPS_PER_XLM + BigInt(fracPadded);
  if (stroops <= BigInt(0)) {
    throw new Error("Amount must be greater than 0");
  }
  return stroops;
}

export function formatXlm(stroops: bigint): string {
  const negative = stroops < BigInt(0);
  const abs = negative ? -stroops : stroops;
  const whole = abs / STROOPS_PER_XLM;
  const frac = abs % STROOPS_PER_XLM;
  const fracStr = frac.toString().padStart(7, "0").replace(/0+$/, "");
  const amount = fracStr.length > 0 ? `${whole.toString()}.${fracStr}` : whole.toString();
  return `${negative ? "-" : ""}${amount} XLM`;
}

export function formatTimestamp(seconds: bigint): string {
  const millis = Number(seconds) * 1000;
  if (!Number.isFinite(millis) || millis <= 0) {
    return "—";
  }
  return new Date(millis).toLocaleString();
}

export function shortenAddress(address: string): string {
  if (address.length <= 12) return address;
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
}
