import { expect, test } from "bun:test"
import { parseAltiumSchDoc, serializeAltiumSheetToSvg } from "../../lib"
import { readReferenceBytes } from "./read-reference"

test("renders FPGA1394 S02 component display modes with sheet connections", async () => {
  const source = await readReferenceBytes("fpga1394-s02.SchDoc")
  const document = parseAltiumSchDoc(source)
  const svg = serializeAltiumSheetToSvg(document, {
    width: 800,
    height: 600,
    title: "FPGA1394 S02",
  })

  expect(document.getBytes()).toEqual(source)
  await expect(svg).toMatchSvgSnapshot(import.meta.path)
}, 30_000)
