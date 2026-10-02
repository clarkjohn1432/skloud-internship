import vine from '@vinejs/vine'

const email = () => vine.string().email().maxLength(254)
const password = () => vine.string().minLength(8).maxLength(32)

export const signupValidator = vine.create({
  name: vine.string().trim().minLength(1).maxLength(255),
  email: email().unique({ table: 'users', column: 'email' }),
  password: password(),
  passwordConfirmation: password().sameAs('password').optional(),
})

export const loginValidator = vine.create({
  email: email(),
  password: vine.string(),
})
