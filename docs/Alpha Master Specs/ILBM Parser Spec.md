Here’s a detailed, implementation-ready **ILBM Parser Spec** for your v1.0 Alpha. It’s tailored for **TypeScript**, **browser environment**, and your **indexed-8-only** MVP constraints.

I’ll define:

1. Scope & assumptions
2. File-level API
3. Core types & enums
4. Parsing pipeline (step-by-step)
5. Chunk handling (`FORM`, `ILBM`, `BMHD`, `CMAP`, `BODY`, `CRNG`)
6. Bitplane → chunky conversion
7. Error handling & validation
8. Test fixtures & edge cases

You can hand this directly to a coding agent.

---

## 1. Scope & Assumptions (for v1.0 Alpha)

**Supported:**

* `FORM ILBM` only (no PBM, no ACBM, no ANIM yet)
* `BMHD` → basic bitmap header
* `CMAP` → palette (RGB 24-bit)
* `BODY` → bitplane-encoded pixels
* `CRNG` → color cycling ranges (parsed + stored)
* Up to 8 bitplanes → **indexed 8-bit** chunky output
* No compression (assume uncompressed BODY or RLE only if you want to extend)

**Not supported in v1.0 Alpha:**

* HAM/HAM6/HAM8 modes
* EHB (extra half-bright) mode
* ANIM FORM types
* Deep/truecolor ILBM variants
* Mask planes beyond basic bitplanes handling (ignore for now)
* Exotic compression types

**Output format (for your editor):**

```ts
export interface ImportedILBM {
  width: number;
  height: number;
  pixels: Uint8Array;       // length = width * height, each = palette index
  palette: PaletteColor[];  // from CMAP, up to 256 entries
  cycles: CRNGRange[];      // parsed CRNG ranges (may be empty)
}
```

---

## 2. Top-Level Parser API

### 2.1. Main entry point

```ts
// src/iff/ilbmParser.ts

export async function parseILBMFromArrayBuffer(
  buffer: ArrayBuffer
): Promise<ImportedILBM> {
  // throws if invalid / unsupported
}
```

* Input: `ArrayBuffer` from `FileReader` or fetch.
* Output: `ImportedILBM` with fully decoded indexed pixel data and palette.

Optional: also expose a sync version if you don’t use async I/O.

```ts
export function parseILBM(buffer: ArrayBuffer): ImportedILBM;
```

---

## 3. Core Types & Enums

### 3.1. Palette & CRNG types

```ts
// src/state/documentTypes.ts or src/iff/types.ts

export interface PaletteColor {
  r: number;
  g: number;
  b: number;
  a: number; // always 255 for ILBM
}

export interface CRNGRange {
  rate: number;      // speed of cycling
  flags: number;     // behavior flags
  low: number;       // first palette index in the cycle
  high: number;      // last palette index in the cycle
}
```

> CRNG content can vary slightly by implementation; we’ll define a strict spec in section 5.4.

### 3.2. Internal chunk abstraction

```ts
export interface IFFChunk {
  id: string;     // e.g. 'BMHD', 'CMAP'
  size: number;   // chunk data size in bytes (without padding)
  offset: number; // byte offset of chunk data (immediately after the size field)
}
```

---

## 4. Parsing Pipeline

High-level algorithm for `parseILBM`:

1. Wrap `ArrayBuffer` in `DataView`.
2. Validate top-level `FORM` header.
3. Validate `ILBM` form type.
4. Iterate through chunks:

   * Read chunk header (ID + size)
   * Record chunk offsets
5. Extract & parse mandatory chunks:

   * `BMHD` → image metadata
   * `CMAP` → palette
   * `BODY` → bitplane data
6. Optionally parse all `CRNG` chunks.
7. Decode `BODY` bitplanes → chunky indexed pixels.
8. Validate palette & pixel indices.
9. Return `ImportedILBM`.

---

## 5. Chunk Parsing Details

### 5.1. General IFF basics

* All integers are **big-endian**.
* Chunks are aligned to even offsets. If `size` is odd, a pad byte follows.
* All IDs are 4 bytes ASCII.

#### 5.1.1. Helpers

```ts
function readFourCC(view: DataView, offset: number): string {
  return String.fromCharCode(
    view.getUint8(offset),
    view.getUint8(offset + 1),
    view.getUint8(offset + 2),
    view.getUint8(offset + 3),
  );
}

function readUint32BE(view: DataView, offset: number): number {
  return view.getUint32(offset, false); // big-endian
}

function padToEven(n: number): number {
  return (n + 1) & ~1;
}
```

---

### 5.2. Top-level FORM ILBM validation

**Spec:**

At the start of the file:

* `0x00..03` → `'FORM'`
* `0x04..07` → `FORM_SIZE` (uint32, size of following FORM data)
* `0x08..0B` → `FORM_TYPE`, must be `'ILBM'`

**Pseudo-code:**

```ts
const view = new DataView(buffer);
let offset = 0;

const formId = readFourCC(view, offset); // 'FORM'
if (formId !== 'FORM') throw new Error('Not an IFF FORM file');
offset += 4;

const formSize = readUint32BE(view, offset);
offset += 4;

const formType = readFourCC(view, offset); // 'ILBM'
if (formType !== 'ILBM') throw new Error('Not an ILBM FORM');
offset += 4;

// Now offset points to first chunk inside FORM
const formEnd = 8 + formSize; // typical IFF semantics
```

---

### 5.3. Chunk scanning

Loop until `offset >= formEnd`:

```ts
const chunks: IFFChunk[] = [];

while (offset + 8 <= formEnd) {
  const id = readFourCC(view, offset);
  const size = readUint32BE(view, offset + 4);
  const dataOffset = offset + 8;

  chunks.push({ id, size, offset: dataOffset });

  const totalChunkSize = padToEven(size);
  offset = dataOffset + totalChunkSize;
}
```

You can optionally store chunks in a map by ID, but note that `CRNG` may appear multiple times, so keep an array.

---

### 5.4. BMHD (Bitmap Header) parsing

**Chunk ID:** `'BMHD'`
**Size:** 20 bytes (classic ILBM)

**Layout (offsets relative to BMHD data start):**

```text
0:  UWORD w;       // width in pixels
2:  UWORD h;       // height in pixels
4:  WORD  x;       // x position (not relevant here)
6:  WORD  y;       // y position (not relevant here)
8:  UBYTE nPlanes; // number of bitplanes
9:  UBYTE masking; // 0=mskNone, 1=mskHasMask, others (ignore)
10: UBYTE compression; // 0=cmpNone, 1=cmpByteRun1
11: UBYTE pad1;    // unused
12: UWORD transparentColor; // index of transparent color (optional)
14: UBYTE xAspect;
15: UBYTE yAspect;
16: WORD  pageWidth;
18: WORD  pageHeight;
```

**Parser spec:**

```ts
interface BMHDInfo {
  width: number;
  height: number;
  nPlanes: number;
  masking: number;
  compression: number;
}

function parseBMHD(view: DataView, chunk: IFFChunk): BMHDInfo {
  const o = chunk.offset;
  const width = view.getUint16(o + 0, false);
  const height = view.getUint16(o + 2, false);
  const nPlanes = view.getUint8(o + 8);
  const masking = view.getUint8(o + 9);
  const compression = view.getUint8(o + 10);

  if (width === 0 || height === 0) {
    throw new Error('Invalid BMHD dimensions');
  }

  if (nPlanes < 1 || nPlanes > 8) {
    throw new Error('Unsupported bitplane count (only 1–8 supported in v1.0-alpha)');
  }

  if (compression !== 0) {
    // v1.0-alpha: either throw or warn & bail
    throw new Error('Compressed ILBM not supported in v1.0-alpha');
  }

  return { width, height, nPlanes, masking, compression };
}
```

---

### 5.5. CMAP (palette) parsing

**Chunk ID:** `'CMAP'`
**Size:** multiple of 3 bytes (R, G, B per entry)

**Spec:**

* For each entry i:

  * byte 3*i: red (0–255)
  * byte 3*i+1: green
  * byte 3*i+2: blue
* No alpha (assumed 255).
* Max 256 entries in your MVP.

**Parser spec:**

```ts
function parseCMAP(view: DataView, chunk: IFFChunk): PaletteColor[] {
  const count = chunk.size / 3;
  if (chunk.size % 3 !== 0) {
    throw new Error('CMAP size is not a multiple of 3');
  }
  if (count > 256) {
    // You can either truncate or throw
    // For MVP, let's truncate to 256
  }

  const palette: PaletteColor[] = [];
  let o = chunk.offset;

  for (let i = 0; i < count && i < 256; i++) {
    const r = view.getUint8(o++);
    const g = view.getUint8(o++);
    const b = view.getUint8(o++);

    palette.push({ r, g, b, a: 255 });
  }

  return palette;
}
```

---

### 5.6. BODY (bitplane) parsing

**Chunk ID:** `'BODY'`
**Size:** raw bitmap data, possibly compressed, stored row-by-row, plane-by-plane (see section 6 for conversion).

**Spec for v1.0-alpha:**

* `compression` in BMHD must be 0 (no compression).
* You read data as raw bytes.

For each row:

* Each plane uses `bytesPerRow = ((width + 15) >> 4) * 2` bytes

  * That is: width rounded up to multiple of 16 bits → bytes
* For `nPlanes` planes, each row = `bytesPerRow * nPlanes`.

Total uncompressed body size expected:

```ts
const bytesPerRow = Math.ceil(width / 16) * 2;
const expectedBodySize = bytesPerRow * nPlanes * height;
```

You should validate `chunk.size >= expectedBodySize`. If larger, ignore extra trailing bytes.

You don’t fully parse BODY in isolation; you use BMHD to interpret it when doing bitplane-to-chunky conversion.

---

### 5.7. CRNG (color cycling) parsing

**Chunk ID:** `'CRNG'`

Common format (most-used variant):

```text
UWORD pad1; // ignored
WORD  rate; // signed speed factor
WORD  flags; // e.g. 0=none, 1=active, 2=reverse, etc, depending on implementation
UBYTE low;  // first color index
UBYTE high; // last color index
```

**Size:** 8 bytes (typical)

Parser spec:

```ts
function parseCRNG(view: DataView, chunk: IFFChunk): CRNGRange | null {
  if (chunk.size < 8) return null;

  const o = chunk.offset;
  const pad1 = view.getUint16(o + 0, false);
  const rate = view.getInt16(o + 2, false);
  const flags = view.getInt16(o + 4, false);
  const low = view.getUint8(o + 6);
  const high = view.getUint8(o + 7);

  // Basic sanity check
  if (low > high) return null;

  return {
    rate,
    flags,
    low,
    high,
  };
}
```

Collect all CRNG chunks into an array:

```ts
const cycles: CRNGRange[] = [];
for (const chunk of chunks) {
  if (chunk.id === 'CRNG') {
    const c = parseCRNG(view, chunk);
    if (c) cycles.push(c);
  }
}
```

---

## 6. Bitplane → Chunky Indexed Conversion

We now have:

* `BMHD`: width, height, nPlanes (1–8)
* `BODY`: raw uncompressed bitplane data

Goal: produce `Uint8Array` of size `width * height`, where each entry is an index 0–(2^nPlanes - 1).

### 6.1. Layout

The standard ILBM layout (for each row):

1. For each bitplane `p = 0..(nPlanes-1)`
2. Read `bytesPerRow` bytes for plane `p` for that row.
3. Pixels are stored MSB-first within each byte.

`bytesPerRow = ((width + 15) >> 4) * 2;`

### 6.2. Algorithm

Pseudo-code:

```ts
function decodeBitplanesToChunky(
  view: DataView,
  bodyChunk: IFFChunk,
  width: number,
  height: number,
  nPlanes: number
): Uint8Array {
  const bytesPerRow = (((width + 15) >> 4) * 2);
  const rowSize = bytesPerRow * nPlanes;
  const pixels = new Uint8Array(width * height);

  let bodyOffset = bodyChunk.offset;

  for (let y = 0; y < height; y++) {
    // For each bitplane we store pointer to its row start
    const planeRowOffsets: number[] = [];
    for (let p = 0; p < nPlanes; p++) {
      planeRowOffsets[p] = bodyOffset + p * bytesPerRow;
    }

    // For each pixel in row
    for (let x = 0; x < width; x++) {
      let index = 0;

      const bitPos = 7 - (x & 7);  // bit position within a byte
      const byteIndex = (x >> 3);  // which byte in the row

      for (let p = 0; p < nPlanes; p++) {
        const planeByteOffset = planeRowOffsets[p] + byteIndex;
        const planeByte = view.getUint8(planeByteOffset);
        const bit = (planeByte >> bitPos) & 1;
        index |= (bit << p);
      }

      pixels[y * width + x] = index;
    }

    bodyOffset += rowSize;
  }

  return pixels;
}
```

**Notes:**

* This assumes `compression == 0`.
* For EHB/HAM or mask planes, you’d add extra handling later (post-MVP).

---

## 7. Error Handling & Validation Rules

Your parser should throw **clear, specific errors**.

### 7.1. Must-have checks

* File must start with `'FORM'`.
* `FORM` size must not exceed `buffer.byteLength - 8`.
* `FORM` type must be `'ILBM'`.
* Exactly one `BMHD` and one `BODY` must be present.
* At most one `CMAP` (if multiple, respect the first; optionally warn).
* `BMHD.nPlanes` must be between 1 and 8.
* `BMHD.compression` must be 0 (for MVP).
* `BODY.size` must be at least `expectedBodySize`.
* If `CMAP` missing → either:

  * generate a grayscale palette of 2^nPlanes entries, or
  * throw (your choice; I’d generate grayscale).

### 7.2. Handling unsupported features

If you encounter:

* `CAMG` with HAM or EHB flags
* `compression != 0`
* `nPlanes > 8`

→ For MVP: **throw** a descriptive error like:

```text
Unsupported ILBM feature: HAM mode not supported in v1.0-alpha
Unsupported ILBM feature: compressed BODY not supported in v1.0-alpha
Unsupported ILBM feature: nPlanes > 8 not supported
```

This keeps behavior explicit and predictable.

---

## 8. Test Plan & Fixtures

To make this robust, specify some fixtures for your coding agent.

### 8.1. Test Files (you’ll need to create/collect):

1. **Minimal 1-plane ILBM**

   * 16×16, 2 colors, no CRNG.
2. **4-plane ILBM**

   * 320×200, 16-color palette, simple pattern.
3. **8-plane ILBM**

   * 320×256, 256-color palette, gradient test.
4. **CRNG test image**

   * 32-color palette with `CRNG` chunk(s).
5. **Invalid header file**

   * Non-`FORM` prefix.
6. **Unexpected FORM type**

   * `FORM` but `FORM_TYPE != 'ILBM'`.
7. **Compressed BODY**

   * `BMHD.compression != 0`, expect error.
8. **Missing CMAP**

   * Expect grayscale palette and valid decode.

### 8.2. Unit Tests

* **BMHD tests**

  * Validate width/height/nPlanes parsing.
  * Reject nPlanes > 8.
  * Reject compression != 0.

* **CMAP tests**

  * Correct entry count.
  * Reject size % 3 != 0.

* **BODY decoding tests**

  * Check simple patterns: stripes, checkerboards.
  * Confirm bitplane ordering.

* **CRNG tests**

  * Correct parsing of `low`, `high`, `rate`, `flags`.
  * Ignore reversed ranges (low > high).

* **Integration test**

  * Load a known ILBM and compare decoded `pixels[]` and `palette[]` with expected arrays.

---

## 9. Final Imported Object Contract

The parser must finally return:

```ts
export interface ImportedILBM {
  width: number;
  height: number;
  pixels: Uint8Array;       // indexed, row-major, length = width * height
  palette: PaletteColor[];  // length = 2^nPlanes or CMAP length (<=256)
  cycles: CRNGRange[];      // possibly empty
}
```

This object will be consumed by your editor:

* Write `pixels` into your internal `Frame.pixels`.
* Use `palette` as the document palette.
* Store `cycles` into your `colorCycles` metadata for optional animation later.

