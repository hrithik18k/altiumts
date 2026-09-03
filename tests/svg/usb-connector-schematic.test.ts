import { expect, test } from "bun:test"
import { readFile } from "node:fs/promises"
import { resolve } from "node:path"
import { parseAltiumSchDoc, serializeAltiumSheetToSvg } from "../../lib"

test("renders the complete USB connector schematic", async () => {
  const source = await readFile(
    resolve(import.meta.dir, "..", "fixtures", "USB-connector.SchDoc"),
  )
  const svg = serializeAltiumSheetToSvg(parseAltiumSchDoc(source), {
    title: "USB connector schematic",
  })

  await expect(svg).toMatchSvgSnapshot(import.meta.path)
})
