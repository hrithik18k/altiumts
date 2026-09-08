import { expect, test } from "bun:test"
import { parseAltiumAscii, serializeAltiumSheetToSvg } from "../../lib"

test("reproduces multiline schematic note text rendered on one line", async () => {
  const source = [
    "|HEADER=Protel for Windows - Schematic Capture Ascii File Version 5.0",
    "|RECORD=31|FONTIDCOUNT=1|SIZE1=10|FONTNAME1=Times New Roman|CUSTOMX=300|CUSTOMY=200",
    "|RECORD=209|LOCATION.X=40|LOCATION.Y=40|CORNER.X=220|CORNER.Y=158|AREACOLOR=9895935|FONTID=1|ISSOLID=T|SHOWBORDER=T|ALIGNMENT=1|WORDWRAP=T|CLIPTORECT=T|TEXT=[page 17 of 21 - PDF]~1~1- Create: SOT.SchLib~1~1- No footprint: J19, J32, J33, X1|TEXTMARGIN=5",
  ].join("\n")

  const svg = serializeAltiumSheetToSvg(parseAltiumAscii(source), {
    title: "Multiline schematic note text-frame reproduction",
  })

  expect(svg).toContain('data-record="209"')
  expect(svg).toContain("~1")
  await expect(svg).toMatchSvgSnapshot(import.meta.path)
})
