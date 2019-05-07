require('jest-dom/extend-expect')

const emotion = require('emotion')
const { cleanup } = require('react-testing-library')
const { createSerializer } = require('jest-emotion')
const { toMatchDiffSnapshot } = require('snapshot-diff')

expect.addSnapshotSerializer(createSerializer(emotion))
expect.extend({ toMatchDiffSnapshot })

afterEach(cleanup)

global.fetch = require('jest-fetch-mock')
