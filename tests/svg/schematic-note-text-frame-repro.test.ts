import { expect, test } from "bun:test"
import { readFile } from "node:fs/promises"
import { resolve } from "node:path"
import { parseAltiumSchDoc, serializeAltiumSheetToSvg } from "../../lib"

test("reproduces multiline schematic note text from a real circuit", async () => {
  const source = await readFile(
    resolve(
      import.meta.dir,
      "..",
      "fixtures",
      "ti-tmds62levm-rev-b-sheet-17.SchDoc",
    ),
  )
  const document = parseAltiumSchDoc(source)
  const note = document.records.find(
    (record) =>
      record.recordKind === "28" &&
      record.getCaseInsensitive("TEXT")?.startsWith("D-Note:-~1PORz"),
  )

  expect(note).toBeDefined()
  expect(document.getBytes()).toEqual(source)

  const svg = serializeAltiumSheetToSvg(document, {
    title: "TI TMDS62LEVM Rev. B sheet 17 multiline note reproduction",
  })

  expect(svg).toContain('data-record="28"')
  expect(svg).toContain("D-Note:-")
  await expect(svg).toMatchSvgSnapshot(import.meta.path)
})
