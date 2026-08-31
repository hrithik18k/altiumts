import { expect, test } from "bun:test"
import { parseAltiumSchDoc, serializeAltiumSheetToSvg } from "../lib"

for (const activeMode of [undefined, 0, 1, 2]) {
  for (const useLines of [false, true]) {
    test(`selects display mode ${activeMode ?? "default"} for ${useLines ? "lines" : "document"}`, () => {
      const document = parseAltiumSchDoc(
        [
          "|RECORD=31|CUSTOMX=200|CUSTOMY=200",
          `|RECORD=1|CURRENTPARTID=2${activeMode === undefined ? "" : `|DISPLAYMODE=${activeMode}`}`,
          ...[undefined, 0, 1, 2].flatMap((mode, index) => [
            `|RECORD=2|OWNERINDEX=1|OWNERPARTID=2${mode === undefined ? "" : `|OWNERPARTDISPLAYMODE=${mode}`}|LOCATION.X=40|LOCATION.Y=${40 + index * 20}|PINLENGTH=10|PINCONGLOMERATE=58|NAME=PIN_${mode ?? "DEFAULT"}`,
            `|RECORD=4|OWNERINDEX=1|OWNERPARTID=2${mode === undefined ? "" : `|OWNERPARTDISPLAYMODE=${mode}`}|LOCATION.X=80|LOCATION.Y=${40 + index * 20}|TEXT=LABEL_${mode ?? "DEFAULT"}`,
          ]),
          `|RECORD=2|OWNERINDEX=1|OWNERPARTID=1|OWNERPARTDISPLAYMODE=${activeMode ?? 0}|LOCATION.X=20|LOCATION.Y=20|PINLENGTH=10|PINCONGLOMERATE=58|NAME=OTHER_PART`,
          "|RECORD=4|OWNERINDEX=1|OWNERPARTID=-1|LOCATION.X=80|LOCATION.Y=160|TEXT=COMMON_PART",
          "|RECORD=4|LOCATION.X=80|LOCATION.Y=180|TEXT=SHEET_LABEL",
        ].join("\n"),
      )
      const svg = serializeAltiumSheetToSvg(
        useLines ? document.lines : document,
      )
      for (const mode of [undefined, 0, 1, 2]) {
        for (const prefix of ["PIN", "LABEL"]) {
          const label = `${prefix}_${mode ?? "DEFAULT"}`
          if ((mode ?? 0) === (activeMode ?? 0)) expect(svg).toContain(label)
          else expect(svg).not.toContain(label)
        }
      }
      expect(svg).not.toContain("OTHER_PART")
      expect(svg).toContain("COMMON_PART")
      expect(svg).toContain("SHEET_LABEL")
    })
  }
}

test("inherits the display mode from an owning primitive", () => {
  const document = parseAltiumSchDoc(
    [
      "|RECORD=31|CUSTOMX=200|CUSTOMY=200",
      "|RECORD=1|CURRENTPARTID=1|DISPLAYMODE=2",
      "|RECORD=14|OWNERINDEX=1|OWNERPARTID=1|OWNERPARTDISPLAYMODE=2|LOCATION.X=20|LOCATION.Y=20|CORNER.X=80|CORNER.Y=80",
      "|RECORD=4|OWNERINDEX=2|LOCATION.X=40|LOCATION.Y=40|TEXT=ACTIVE_CHILD",
      "|RECORD=14|OWNERINDEX=1|OWNERPARTID=1|OWNERPARTDISPLAYMODE=0|LOCATION.X=20|LOCATION.Y=20|CORNER.X=80|CORNER.Y=80",
      "|RECORD=4|OWNERINDEX=4|LOCATION.X=40|LOCATION.Y=40|TEXT=INACTIVE_CHILD",
    ].join("\n"),
  )
  for (const source of [document, document.lines]) {
    const svg = serializeAltiumSheetToSvg(source)
    expect(svg).toContain(">ACTIVE_CHILD</text>")
    expect(svg).not.toContain(">INACTIVE_CHILD</text>")
  }
})
