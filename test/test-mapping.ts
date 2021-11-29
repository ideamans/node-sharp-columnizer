import { ImageColumnizer, Projection } from '../src/index'
import anyTest, { TestInterface } from 'ava'

const test = anyTest as TestInterface<{ columnizer: ImageColumnizer }>

test.beforeEach((t) => {
  t.context.columnizer = new ImageColumnizer({
    height: 1000,
    margin: ImageColumnizer.zeroMargin(),
    gap: 0,
    indent: 0,
    outdent: 0,
  })
})

test('single-column', (t) => {
  const columnizer = t.context.columnizer

  const columns1 = columnizer.mapping(100, 999)
  t.deepEqual(
    columns1,
    [new Projection({ top: 0, left: 0, width: 100, height: 999, offsetTop: 0, isFirst: true, isLast: true })],
    'height 1999'
  )

  const justColumns1 = columnizer.mapping(100, 1000)
  t.deepEqual(
    justColumns1,
    [new Projection({ top: 0, left: 0, width: 100, height: 1000, offsetTop: 0, isFirst: true, isLast: true })],
    'height 2000'
  )
})

test('no-options', (t) => {
  const columnizer = t.context.columnizer

  const columns2 = columnizer.mapping(100, 1999)
  t.deepEqual(
    columns2,
    [
      new Projection({ top: 0, left: 0, width: 100, height: 1000, offsetTop: 0, isFirst: true, isLast: false }),
      new Projection({ top: 0, left: 100, width: 100, height: 999, offsetTop: 1000, isFirst: false, isLast: true }),
    ],
    'height 1999'
  )

  const justColumns2 = columnizer.mapping(100, 2000)
  t.deepEqual(
    justColumns2,
    [
      new Projection({ top: 0, left: 0, width: 100, height: 1000, offsetTop: 0, isFirst: true, isLast: false }),
      new Projection({ top: 0, left: 100, width: 100, height: 1000, offsetTop: 1000, isFirst: false, isLast: true }),
    ],
    'height 2000'
  )

  const columns3 = columnizer.mapping(100, 2001)
  t.deepEqual(
    columns3,
    [
      new Projection({ top: 0, left: 0, width: 100, height: 1000, offsetTop: 0, isFirst: true, isLast: false }),
      new Projection({ top: 0, left: 100, width: 100, height: 1000, offsetTop: 1000, isFirst: false, isLast: false }),
      new Projection({ top: 0, left: 200, width: 100, height: 1, offsetTop: 2000, isFirst: false, isLast: true }),
    ],
    'height 2001'
  )
})

test('max-columns1', (t) => {
  const columnizer = t.context.columnizer
  columnizer.maxColumns = 1

  const columns2 = columnizer.mapping(100, 1999)
  t.deepEqual(
    columns2,
    [new Projection({ top: 0, left: 0, width: 100, height: 1000, offsetTop: 0, isFirst: true, isLast: true })],
    'height 1999'
  )

  const justColumns2 = columnizer.mapping(100, 2000)
  t.deepEqual(
    justColumns2,
    [new Projection({ top: 0, left: 0, width: 100, height: 1000, offsetTop: 0, isFirst: true, isLast: true })],
    'height 2000'
  )

  const columns3 = columnizer.mapping(100, 2001)
  t.deepEqual(
    columns3,
    [new Projection({ top: 0, left: 0, width: 100, height: 1000, offsetTop: 0, isFirst: true, isLast: true })],
    'height 2001'
  )
})

test('max-columns2', (t) => {
  const columnizer = t.context.columnizer
  columnizer.maxColumns = 2

  const columns2 = columnizer.mapping(100, 1999)
  t.deepEqual(
    columns2,
    [
      new Projection({ top: 0, left: 0, width: 100, height: 1000, offsetTop: 0, isFirst: true, isLast: false }),
      new Projection({ top: 0, left: 100, width: 100, height: 999, offsetTop: 1000, isFirst: false, isLast: true }),
    ],
    'height 1999'
  )

  const justColumns2 = columnizer.mapping(100, 2000)
  t.deepEqual(
    justColumns2,
    [
      new Projection({ top: 0, left: 0, width: 100, height: 1000, offsetTop: 0, isFirst: true, isLast: false }),
      new Projection({ top: 0, left: 100, width: 100, height: 1000, offsetTop: 1000, isFirst: false, isLast: true }),
    ],
    'height 2000'
  )

  const columns3 = columnizer.mapping(100, 2001)
  t.deepEqual(
    columns3,
    [
      new Projection({ top: 0, left: 0, width: 100, height: 1000, offsetTop: 0, isFirst: true, isLast: false }),
      new Projection({ top: 0, left: 100, width: 100, height: 1000, offsetTop: 1000, isFirst: false, isLast: true }),
    ],
    'height 2001'
  )
})

test('margins', (t) => {
  const columnizer = t.context.columnizer
  columnizer.height = 1020
  columnizer.margin = ImageColumnizer.margin(10, 10, 10, 10)

  const columns2 = columnizer.mapping(100, 1999)
  t.deepEqual(
    columns2,
    [
      new Projection({ top: 10, left: 10, width: 100, height: 1000, offsetTop: 0, isFirst: true, isLast: false }),
      new Projection({ top: 10, left: 110, width: 100, height: 999, offsetTop: 1000, isFirst: false, isLast: true }),
    ],
    'height 1999'
  )

  const justColumns2 = columnizer.mapping(100, 2000)
  t.deepEqual(
    justColumns2,
    [
      new Projection({ top: 10, left: 10, width: 100, height: 1000, offsetTop: 0, isFirst: true, isLast: false }),
      new Projection({ top: 10, left: 110, width: 100, height: 1000, offsetTop: 1000, isFirst: false, isLast: true }),
    ],
    'height 2000'
  )

  const columns3 = columnizer.mapping(100, 2001)
  t.deepEqual(
    columns3,
    [
      new Projection({ top: 10, left: 10, width: 100, height: 1000, offsetTop: 0, isFirst: true, isLast: false }),
      new Projection({ top: 10, left: 110, width: 100, height: 1000, offsetTop: 1000, isFirst: false, isLast: false }),
      new Projection({ top: 10, left: 210, width: 100, height: 1, offsetTop: 2000, isFirst: false, isLast: true }),
    ],
    'height 2001'
  )
})

test('gap', (t) => {
  const columnizer = t.context.columnizer
  columnizer.gap = 10

  const columns2 = columnizer.mapping(100, 1999)
  t.deepEqual(
    columns2,
    [
      new Projection({ top: 0, left: 0, width: 100, height: 1000, offsetTop: 0, isFirst: true, isLast: false }),
      new Projection({ top: 0, left: 110, width: 100, height: 999, offsetTop: 1000, isFirst: false, isLast: true }),
    ],
    'height 1999'
  )

  const justColumns2 = columnizer.mapping(100, 2000)
  t.deepEqual(
    justColumns2,
    [
      new Projection({ top: 0, left: 0, width: 100, height: 1000, offsetTop: 0, isFirst: true, isLast: false }),
      new Projection({ top: 0, left: 110, width: 100, height: 1000, offsetTop: 1000, isFirst: false, isLast: true }),
    ],
    'height 2000'
  )

  const columns3 = columnizer.mapping(100, 2001)
  t.deepEqual(
    columns3,
    [
      new Projection({ top: 0, left: 0, width: 100, height: 1000, offsetTop: 0, isFirst: true, isLast: false }),
      new Projection({ top: 0, left: 110, width: 100, height: 1000, offsetTop: 1000, isFirst: false, isLast: false }),
      new Projection({ top: 0, left: 220, width: 100, height: 1, offsetTop: 2000, isFirst: false, isLast: true }),
    ],
    'height 2001'
  )
})

test('indent', (t) => {
  const columnizer = t.context.columnizer
  columnizer.indent = 100

  const columns2 = columnizer.mapping(100, 1899)
  t.deepEqual(
    columns2,
    [
      new Projection({ top: 0, left: 0, width: 100, height: 1000, offsetTop: 0, isFirst: true, isLast: false }),
      new Projection({ top: 100, left: 100, width: 100, height: 899, offsetTop: 1000, isFirst: false, isLast: true }),
    ],
    'height 1899'
  )

  const justColumns2 = columnizer.mapping(100, 1900)
  t.deepEqual(
    justColumns2,
    [
      new Projection({ top: 0, left: 0, width: 100, height: 1000, offsetTop: 0, isFirst: true, isLast: false }),
      new Projection({ top: 100, left: 100, width: 100, height: 900, offsetTop: 1000, isFirst: false, isLast: true }),
    ],
    'height 1900'
  )

  const columns3 = columnizer.mapping(100, 1901)
  t.deepEqual(
    columns3,
    [
      new Projection({ top: 0, left: 0, width: 100, height: 1000, offsetTop: 0, isFirst: true, isLast: false }),
      new Projection({ top: 100, left: 100, width: 100, height: 900, offsetTop: 1000, isFirst: false, isLast: false }),
      new Projection({ top: 100, left: 200, width: 100, height: 1, offsetTop: 1900, isFirst: false, isLast: true }),
    ],
    'height 2001'
  )
})

test('outdent', (t) => {
  const columnizer = t.context.columnizer
  columnizer.outdent = 100

  const columns2 = columnizer.mapping(100, 1899)
  t.deepEqual(
    columns2,
    [
      new Projection({ top: 0, left: 0, width: 100, height: 900, offsetTop: 0, isFirst: true, isLast: false }),
      new Projection({ top: 0, left: 100, width: 100, height: 999, offsetTop: 900, isFirst: false, isLast: true }),
    ],
    'height 1899'
  )

  const justColumns2 = columnizer.mapping(100, 1900)
  t.deepEqual(
    justColumns2,
    [
      new Projection({ top: 0, left: 0, width: 100, height: 900, offsetTop: 0, isFirst: true, isLast: false }),
      new Projection({ top: 0, left: 100, width: 100, height: 1000, offsetTop: 900, isFirst: false, isLast: true }),
    ],
    'height 1900'
  )

  const columns3 = columnizer.mapping(100, 1901)
  t.deepEqual(
    columns3,
    [
      new Projection({ top: 0, left: 0, width: 100, height: 900, offsetTop: 0, isFirst: true, isLast: false }),
      new Projection({ top: 0, left: 100, width: 100, height: 1000, offsetTop: 900, isFirst: false, isLast: false }),
      new Projection({ top: 0, left: 200, width: 100, height: 1, offsetTop: 1900, isFirst: false, isLast: true }),
    ],
    'height 2001'
  )
})

test('align-bottom', (t) => {
  const columnizer = t.context.columnizer
  columnizer.align = 'bottom'

  const columns2 = columnizer.mapping(100, 1999)
  t.deepEqual(
    columns2,
    [
      new Projection({ top: 0, left: 0, width: 100, height: 1000, offsetTop: 0, isFirst: true, isLast: false }),
      new Projection({ top: 1, left: 100, width: 100, height: 999, offsetTop: 1000, isFirst: false, isLast: true }),
    ],
    'height 1999'
  )

  const justColumns2 = columnizer.mapping(100, 2000)
  t.deepEqual(
    justColumns2,
    [
      new Projection({ top: 0, left: 0, width: 100, height: 1000, offsetTop: 0, isFirst: true, isLast: false }),
      new Projection({ top: 0, left: 100, width: 100, height: 1000, offsetTop: 1000, isFirst: false, isLast: true }),
    ],
    'height 2000'
  )

  const columns3 = columnizer.mapping(100, 2001)
  t.deepEqual(
    columns3,
    [
      new Projection({ top: 0, left: 0, width: 100, height: 1000, offsetTop: 0, isFirst: true, isLast: false }),
      new Projection({ top: 0, left: 100, width: 100, height: 1000, offsetTop: 1000, isFirst: false, isLast: false }),
      new Projection({ top: 999, left: 200, width: 100, height: 1, offsetTop: 2000, isFirst: false, isLast: true }),
    ],
    'height 2001'
  )
})
