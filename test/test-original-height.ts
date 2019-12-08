import { ImageColumnizer } from '../src/index'
import anyTest, { TestInterface } from 'ava'

const test = anyTest as TestInterface<{columnizer: ImageColumnizer}>

test.beforeEach(t => {
  t.context.columnizer = new ImageColumnizer({
    height: 1000,
    margin: ImageColumnizer.zeroMargin(),
    gap: 0,
    indent: 0,
    outdent: 0
  })
})

test('no-options', t => {
  const columnizer = t.context.columnizer
  t.is(columnizer.maxOriginalHeight(100, 1000), 10000)
})

test('margins', t => {
  const columnizer = t.context.columnizer
  columnizer.height = 1020
  columnizer.margin = ImageColumnizer.margin(10, 10, 10, 10)
  t.is(columnizer.maxOriginalHeight(100, 1020), 10000)
})

test('gap', t => {
  const columnizer = t.context.columnizer
  columnizer.gap = 10
  t.is(columnizer.maxOriginalHeight(100, 1090), 10000)
})

test('indent', t => {
  const columnizer = t.context.columnizer
  columnizer.indent = 100
  t.is(columnizer.maxOriginalHeight(100, 1000), 9100)
})

test('outdent', t => {
  const columnizer = t.context.columnizer
  columnizer.outdent = 100
  t.is(columnizer.maxOriginalHeight(100, 1000), 9900)
})

test('indent-outdent', t => {
  const columnizer = t.context.columnizer
  columnizer.height = 1100
  columnizer.indent = 100
  columnizer.outdent = 100
  t.is(columnizer.maxOriginalHeight(100, 1000), 10000)
})

test('margins-indent-outdent', t => {
  const columnizer = t.context.columnizer
  columnizer.margin = ImageColumnizer.margin(10, 10, 10, 10)
  columnizer.height = 1120
  columnizer.indent = 100
  columnizer.outdent = 100
  t.is(columnizer.maxOriginalHeight(100, 1020), 10000)
})

test('full-options', t => {
  const columnizer = t.context.columnizer
  columnizer.margin = ImageColumnizer.margin(10, 10, 10, 10)
  columnizer.gap = 100
  columnizer.height = 1120
  columnizer.indent = 100
  columnizer.outdent = 100
  t.is(columnizer.maxOriginalHeight(100, 1920), 10000)
})