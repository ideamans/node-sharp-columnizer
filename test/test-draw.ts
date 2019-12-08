import Sharp from 'sharp'
import Path from 'path'
import Fs from 'fs'
import { ImageColumnizer, Projection } from '../src/index'
import anyTest, { TestInterface } from 'ava'

const PngQuality = require('png-quality')

const test = anyTest as TestInterface<{columnizer: ImageColumnizer, src: Sharp.Sharp, saveExpect: boolean}>

test.beforeEach(async t => {
  t.context.columnizer = new ImageColumnizer({
    height: 1000,
    margin: ImageColumnizer.zeroMargin(),
    gap: 0,
    indent: 0,
    outdent: 0
  })

  t.context.src = Sharp(Path.join(__dirname, 'images/measure.png'))

  t.context.saveExpect = false

  const tmpDir = Path.join(__dirname, 'tmp')
  if (!Fs.existsSync(tmpDir)) Fs.mkdirSync(tmpDir)
})

test('single-column', async t => {
  const columnizer = t.context.columnizer
  columnizer.height = 2100

  const name = t.title
  const src = t.context.src
  const result = await columnizer.composite(src)
  const tmpFile = Path.join(__dirname, `tmp/${name}.png`)
  const imgFile = Path.join(__dirname, `images/${name}.png`)
  if (Fs.existsSync(tmpFile)) Fs.unlinkSync(tmpFile)
  await result.png({ colors: 256 }).toFile(tmpFile)
  if (t.context.saveExpect) await result.png({ colors: 256 }).toFile(imgFile)

  t.is(await PngQuality.mse(tmpFile, imgFile), 0)
})

test('no-options', async t => {
  const columnizer = t.context.columnizer

  const name = t.title
  const src = t.context.src
  const result = await columnizer.composite(src)
  const tmpFile = Path.join(__dirname, `tmp/${name}.png`)
  const imgFile = Path.join(__dirname, `images/${name}.png`)
  if (Fs.existsSync(tmpFile)) Fs.unlinkSync(tmpFile)
  await result.png({ colors: 256 }).toFile(tmpFile)
  if (t.context.saveExpect) await result.png({ colors: 256 }).toFile(imgFile)

  t.is(await PngQuality.mse(tmpFile, imgFile), 0)
})

test('margins', async t => {
  const columnizer = t.context.columnizer
  columnizer.height = 1020
  columnizer.margin = ImageColumnizer.margin(10, 10, 10, 10)

  const name = t.title
  const src = t.context.src
  const result = await columnizer.composite(src)
  const tmpFile = Path.join(__dirname, `tmp/${name}.png`)
  const imgFile = Path.join(__dirname, `images/${name}.png`)
  if (Fs.existsSync(tmpFile)) Fs.unlinkSync(tmpFile)
  await result.png({ colors: 256 }).toFile(tmpFile)
  if (t.context.saveExpect) await result.png({ colors: 256 }).toFile(imgFile)

  t.is(await PngQuality.mse(tmpFile, imgFile), 0)
})

test('gap', async t => {
  const columnizer = t.context.columnizer
  columnizer.gap = 10

  const name = t.title
  const src = t.context.src
  const result = await columnizer.composite(src)
  const tmpFile = Path.join(__dirname, `tmp/${name}.png`)
  const imgFile = Path.join(__dirname, `images/${name}.png`)
  if (Fs.existsSync(tmpFile)) Fs.unlinkSync(tmpFile)
  await result.png({ colors: 256 }).toFile(tmpFile)
  if (t.context.saveExpect) await result.png({ colors: 256 }).toFile(imgFile)

  t.is(await PngQuality.mse(tmpFile, imgFile), 0)
})

test('indent', async t => {
  const columnizer = t.context.columnizer
  columnizer.indent = 100

  const name = t.title
  const src = t.context.src
  const result = await columnizer.composite(src)
  const tmpFile = Path.join(__dirname, `tmp/${name}.png`)
  const imgFile = Path.join(__dirname, `images/${name}.png`)
  if (Fs.existsSync(tmpFile)) Fs.unlinkSync(tmpFile)
  await result.png({ colors: 256 }).toFile(tmpFile)
  if (t.context.saveExpect) await result.png({ colors: 256 }).toFile(imgFile)

  t.is(await PngQuality.mse(tmpFile, imgFile), 0)
})

test('outdent', async t => {
  const columnizer = t.context.columnizer
  columnizer.outdent = 100

  const name = t.title
  const src = t.context.src
  const result = await columnizer.composite(src)
  const tmpFile = Path.join(__dirname, `tmp/${name}.png`)
  const imgFile = Path.join(__dirname, `images/${name}.png`)
  if (Fs.existsSync(tmpFile)) Fs.unlinkSync(tmpFile)
  await result.png({ colors: 256 }).toFile(tmpFile)
  if (t.context.saveExpect) await result.png({ colors: 256 }).toFile(imgFile)

  t.is(await PngQuality.mse(tmpFile, imgFile), 0)
})

test('full-options', async t => {
  const columnizer = t.context.columnizer
  columnizer.margin = ImageColumnizer.margin(50, 50, 50, 50)
  columnizer.gap = 50
  columnizer.indent = 100
  columnizer.outdent = 100

  const name = t.title
  const src = t.context.src
  const result = await columnizer.composite(src)
  const tmpFile = Path.join(__dirname, `tmp/${name}.png`)
  const imgFile = Path.join(__dirname, `images/${name}.png`)
  if (Fs.existsSync(tmpFile)) Fs.unlinkSync(tmpFile)
  await result.png({ colors: 256 }).toFile(tmpFile)
  if (t.context.saveExpect) await result.png({ colors: 256 }).toFile(imgFile)

  t.is(await PngQuality.mse(tmpFile, imgFile), 0)
})
