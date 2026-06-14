const SHA256_BUFFER_SIZE = 32;

function getBrowserCrypto(): SubtleCrypto {
  if (!globalThis.crypto?.subtle) {
    throw new Error("Web Crypto is unavailable in this browser.");
  }

  return globalThis.crypto.subtle;
}

async function hmacSHA256(key: string, message: string): Promise<Uint8Array> {
  const enc = new TextEncoder();
  const cryptoKey = await getBrowserCrypto().importKey(
    "raw",
    enc.encode(key),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await getBrowserCrypto().sign("HMAC", cryptoKey, enc.encode(message));

  return new Uint8Array(sig);
}

async function getBuffer(
  serverSeed: string,
  clientSeed: string,
  nonce: number,
  round: number,
): Promise<Uint8Array> {
  return hmacSHA256(serverSeed, `${clientSeed}:${nonce}:${round}`);
}

async function getRandom(
  serverSeed: string,
  clientSeed: string,
  nonce: number,
  cursor: number,
  limit: number,
): Promise<{ value: number; cursor: number }> {
  let sum = 0;
  const bufferCache = new Map<number, Uint8Array>();

  for (let i = 0; i < 4; i++) {
    const round = Math.floor(cursor / SHA256_BUFFER_SIZE);
    const pos = cursor % SHA256_BUFFER_SIZE;

    if (!bufferCache.has(round)) {
      bufferCache.set(
        round,
        await getBuffer(serverSeed, clientSeed, nonce, round),
      );
    }

    const buf = bufferCache.get(round);

    if (!buf) {
      throw new Error("Unable to verify Dice result.");
    }

    sum += buf[pos] / 256 ** (i + 1);
    cursor++;
  }

  return { value: Math.floor(sum * limit), cursor };
}

export async function verifyDice(
  serverSeed: string,
  clientSeed: string,
  nonce: number,
): Promise<number> {
  const { value } = await getRandom(serverSeed, clientSeed, nonce, 0, 10001);

  return value / 100;
}

export async function verifyPlinko(
  serverSeed: string,
  clientSeed: string,
  nonce: number,
  rowsCount: number,
): Promise<number> {
  if (!Number.isInteger(rowsCount) || rowsCount <= 0) {
    throw new Error("Plinko rows count must be a positive whole number.");
  }

  let cursor = 0;
  let bucketIndex = 0;

  for (let row = 0; row < rowsCount; row++) {
    const result = await getRandom(
      serverSeed,
      clientSeed,
      nonce,
      cursor,
      2,
    );

    cursor = result.cursor;
    bucketIndex += result.value;
  }

  return bucketIndex;
}
