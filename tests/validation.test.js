import test from 'node:test'
import assert from 'node:assert/strict'
import { validateRegistration } from '../src/lib/validation.js'

const valid = {
  name: 'Ana López',
  email: 'ana@example.com',
  password: 'Cine2026seguro',
  confirmPassword: 'Cine2026seguro',
  terms: true,
}

test('acepta un registro válido', () => {
  assert.deepEqual(validateRegistration(valid), {})
})

test('rechaza correo inválido y contraseñas distintas', () => {
  const errors = validateRegistration({
    ...valid,
    email: 'ana-sin-arroba',
    confirmPassword: 'Otra2026',
  })
  assert.ok(errors.email)
  assert.ok(errors.confirmPassword)
})

test('exige una contraseña fuerte y aceptar los términos', () => {
  const errors = validateRegistration({
    ...valid,
    password: '123',
    confirmPassword: '123',
    terms: false,
  })
  assert.ok(errors.password)
  assert.ok(errors.terms)
})
