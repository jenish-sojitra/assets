import createValidator from '../src/validations/createValidator.js'
import globalValidations from '../src/validations/global-validations.js'

test('Can create all global validations', () => {
  expect(globalValidations).toBeDefined()
  // validates all are ok
  expect(globalValidations.map(createValidator)).toBeDefined()
})
