import { expect, test } from "bun:test"
import { parseAltiumSchDoc, serializeAltiumSheetToSvg } from "../../lib"
import { readReferenceBytes } from "./read-reference"

test("repro: S02 U1D renders the selected multipart display mode", async () => {
  const source = await readReferenceBytes("fpga1394-s02.SchDoc")
  const document = parseAltiumSchDoc(source)
  const u1d = document.records.find(
    (record) =>
      record.recordKind === "1" &&
      record.getCaseInsensitive("LIBREFERENCE") === "XC6SLX45-FG484" &&
      record.getNumber("CURRENTPARTID") === 4 &&
      record.getNumber("LOCATION.X") === 1190 &&
      record.getNumber("LOCATION.Y") === 810,
  )

  expect(u1d).toBeDefined()
  expect(u1d?.getNumber("DISPLAYMODE")).toBe(1)

  const u1dPins = document
    .getOwnedRecords(u1d!)
    .filter(
      (record) =>
        record.recordKind === "2" && record.getNumber("OWNERPARTID") === 4,
    )
  const selectedDisplayModePins = u1dPins.filter(
    (record) => record.getNumber("OWNERPARTDISPLAYMODE") === 1,
  )
  const defaultDisplayModePins = u1dPins.filter((record) => {
    const displayMode = record.getNumber("OWNERPARTDISPLAYMODE")
    return displayMode === undefined || displayMode === 0
  })

  // Altium displays the 38 mode-1 pins. The current SVG renderer instead
  // selects the 88 default-mode pins, which this visual snapshot reproduces.
  expect(selectedDisplayModePins).toHaveLength(38)
  expect(defaultDisplayModePins).toHaveLength(88)

  const svg = serializeAltiumSheetToSvg(document, {
    title: "FPGA1394 S02 multipart display-mode reproduction",
  })

  await expect(svg).toMatchSvgSnapshot(import.meta.path)
}, 30_000)
