import vine from '@vinejs/vine'

const status = () => vine.string().in(['pending', 'done', 'processing'])

export const storeValidator = vine.create({
  title: vine.string().minLength(1).maxLength(255),
  description: vine.string().optional(),
  status: status(),
})

export const updateValidator = vine.create({
  title: vine.string().minLength(1).maxLength(255).optional(),
  description: vine.string()  .optional(),
  status: status().optional(),
})
