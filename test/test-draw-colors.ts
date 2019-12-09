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
    margin: ImageColumnizer.margin(50, 50, 50, 50),
    gap: 50,
    indent: 100,
    outdent: 100,
  })

  t.context.src = Sharp(Path.join(__dirname, 'images/measure.png'))

  t.context.saveExpect = false

  const tmpDir = Path.join(__dirname, 'tmp')
  if (!Fs.existsSync(tmpDir)) Fs.mkdirSync(tmpDir)
})

test('background-white', async t => {
  const columnizer = t.context.columnizer
  columnizer.backgroundColor = '#fff8'

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

test('background-red', async t => {
  const columnizer = t.context.columnizer
  columnizer.backgroundColor = 'red'

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

test('border10-red', async t => {
  const columnizer = t.context.columnizer
  columnizer.borderWidth = 10
  columnizer.borderColor = 'red'

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
