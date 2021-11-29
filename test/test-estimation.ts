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

test('estimate single line', (t) => {
  const height = t.context.columnizer.estimateSourceHeightFromColumnWidth(1)
  t.is(height, 1000)
  const metrics = t.context.columnizer.estimateSourceMetricsFromTotalWidth(100, 1)
  t.deepEqual(metrics, { width: 100, height })
})

test('estimate multi lines', (t) => {
  const height = t.context.columnizer.estimateSourceHeightFromColumnWidth(3)
  t.is(height, 3000)
  const metrics = t.context.columnizer.estimateSourceMetricsFromTotalWidth(300, 3)
  t.deepEqual(metrics, { width: 100, height })
})

test('estimate multi lines with gap', (t) => {
  t.context.columnizer.gap = 30
  const height = t.context.columnizer.estimateSourceHeightFromColumnWidth(3)
  t.is(height, 3000)
  const metrics = t.context.columnizer.estimateSourceMetricsFromTotalWidth(300, 3)
  t.deepEqual(metrics, { width: 80, height })
})

test('estimate multi lines with gap, indent and outdent', (t) => {
  t.context.columnizer.gap = 30
  t.context.columnizer.outdent = 100
  t.context.columnizer.indent = 100
  const height = t.context.columnizer.estimateSourceHeightFromColumnWidth(3)
  t.is(height, 2700)
  const metrics = t.context.columnizer.estimateSourceMetricsFromTotalWidth(300, 3)
  t.deepEqual(metrics, { width: 80, height })
})
