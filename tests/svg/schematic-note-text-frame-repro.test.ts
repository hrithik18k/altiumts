import { expect, test } from "bun:test"
import { readFile } from "node:fs/promises"
import { resolve } from "node:path"
import {
  parseAltiumAscii,
  parseAltiumSchDoc,
  serializeAltiumSheetToSvg,
} from "../../lib"

test("reproduces multiline schematic note text from the PiDP-11 I/O Expander", async () => {
  const source = await readFile(
    resolve(import.meta.dir, "..", "fixtures", "pidp11-io-expander.SchDoc"),
  )
  const document = parseAltiumSchDoc(source)
  const sheet = document.records.find((record) => record.recordKind === "31")
  const note = document.records.find(
    (record) =>
      record.recordKind === "209" &&
      record
        .getCaseInsensitive("TEXT")
        ?.startsWith("Single board operation is assumed by default.~1"),
  )

  expect(sheet).toBeDefined()
  expect(note).toBeDefined()
  expect(document.getBytes()).toEqual(source)

  const focusedDocument = parseAltiumAscii(
    [sheet?.getString(), note?.getString()].join("\n"),
  )
  const svg = serializeAltiumSheetToSvg(focusedDocument)

  expect(svg).toContain('data-record="209"')
  expect(svg).toContain("~1")
  const noteSvg = svg.match(/<g data-record="209">.*?<\/g>/s)?.[0]

  expect(noteSvg).toBeDefined()
  await expect(
    `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="90" viewBox="898.5 698.5 200 90"><title>PiDP-11 multiline note</title>${noteSvg}</svg>`,
  ).toMatchSvgSnapshot(import.meta.path)
})
