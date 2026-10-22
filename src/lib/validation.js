export function validateRegistration(values) {
  const errors = {}
  const name = values.name?.trim() || ''
  const email = values.email?.trim() || ''
  const password = values.password || ''

  if (name.length < 2 || name.length > 60) {
    errors.name = 'Escribe tu nombre (entre 2 y 60 caracteres).'
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = 'Escribe un correo electrónico válido.'
  }

  if (password.length < 8 || !/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/\d/.test(password)) {
    errors.password = 'Usa al menos 8 caracteres, una mayúscula, una minúscula y un número.'
  }

  if (values.confirmPassword !== password || !values.confirmPassword) {
    errors.confirmPassword = 'Las contraseñas deben coincidir.'
  }

  if (!values.terms) {
    errors.terms = 'Acepta guardar tu nombre en este dispositivo.'
  }

  return errors
}
