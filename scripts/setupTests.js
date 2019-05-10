require('jest-dom/extend-expect')

const emotion = require('emotion')
const { cleanup } = require('react-testing-library')
const { createSerializer } = require('jest-emotion')

expect.addSnapshotSerializer(createSerializer(emotion))

afterEach(cleanup)

global.fetch = require('jest-fetch-mock')
