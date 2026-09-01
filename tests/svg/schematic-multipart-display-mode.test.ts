import { expect, test } from "bun:test"
import { parseAltiumSchDoc, serializeAltiumSheetToSvg } from "../../lib"

test("repro: renders only the selected multipart display mode", async () => {
  const source = [
    "|HEADER=Protel for Windows - Schematic Capture Ascii File Version 5.0",
    "|RECORD=31|CUSTOMX=500|CUSTOMY=1000",
    "|RECORD=1|LIBREFERENCE=MULTIPART_REPRO|CURRENTPARTID=4|DISPLAYMODE=1|LOCATION.X=250|LOCATION.Y=500",
    ...Array.from(
      { length: 38 },
      (_, index) =>
        `|RECORD=2|OWNERINDEX=1|OWNERPARTID=4|OWNERPARTDISPLAYMODE=1|PINCONGLOMERATE=58|PINLENGTH=80|LOCATION.X=250|LOCATION.Y=${60 + index * 20}|NAME=SELECTED_${String(index + 1).padStart(2, "0")}`,
    ),
    ...Array.from(
      { length: 88 },
      (_, index) =>
        `|RECORD=2|OWNERINDEX=1|OWNERPARTID=4|OWNERPARTDISPLAYMODE=0|PINCONGLOMERATE=58|PINLENGTH=80|LOCATION.X=250|LOCATION.Y=${60 + index * 10}|NAME=DEFAULT_${String(index + 1).padStart(2, "0")}`,
    ),
  ].join("\n")
  const document = parseAltiumSchDoc(source)
  const component = document.records.find(
    (record) =>
      record.recordKind === "1" &&
      record.getCaseInsensitive("LIBREFERENCE") === "MULTIPART_REPRO",
  )

  expect(component).toBeDefined()
  expect(component?.getNumber("DISPLAYMODE")).toBe(1)

  const partPins = document
    .getOwnedRecords(component!)
    .filter(
      (record) =>
        record.recordKind === "2" && record.getNumber("OWNERPARTID") === 4,
    )
  const selectedDisplayModePins = partPins.filter(
    (record) => record.getNumber("OWNERPARTDISPLAYMODE") === 1,
  )
  const defaultDisplayModePins = partPins.filter((record) => {
    const displayMode = record.getNumber("OWNERPARTDISPLAYMODE")
    return displayMode === undefined || displayMode === 0
  })

  // The component selects mode 1. The current SVG renderer instead selects
  // the 88 default-mode pins, which this visual snapshot reproduces.
  expect(selectedDisplayModePins).toHaveLength(38)
  expect(defaultDisplayModePins).toHaveLength(88)

  const svg = serializeAltiumSheetToSvg(document, {
    height: 1000,
    showBorder: false,
    title: "Multipart display-mode reproduction",
    width: 500,
  })

  expect(svg).not.toContain("SELECTED_01")
  expect(svg).toContain("DEFAULT_01")
  await expect(svg).toMatchSvgSnapshot(import.meta.path)
}, 30_000)
