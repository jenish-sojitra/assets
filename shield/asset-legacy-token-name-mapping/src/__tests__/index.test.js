import oldToNewStyleTokenNames from '../index.js'

test('should map token names snapshot', async () => {
  expect(Object.keys(oldToNewStyleTokenNames).length).toBe(213)
  expect(oldToNewStyleTokenNames).toMatchSnapshot()
})
