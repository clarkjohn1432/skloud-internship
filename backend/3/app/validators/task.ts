import vine from '@vinejs/vine'

/**
 * The statuses a task is allowed to be in.
 */
export const TASK_STATUSES = ['pending', 'in_progress', 'done']

/**
 * The status a new task starts in when the client does not send one.
 */
export const DEFAULT_TASK_STATUS = 'pending'

const status = () => vine.string().in(TASK_STATUSES)

const title = () => vine.string().trim().minLength(1).maxLength(255)
const description = () => vine.string().trim().maxLength(10_000).nullable().optional()

/**
 * Validator to use when creating a task
 */
export const storeValidator = vine.create({
  title: title(),
  description: description(),
  status: status().optional(),
})

/**
 * Validator to use when updating an existing task. Every field is optional
 * so that a PATCH only touches what was sent.
 */
export const updateValidator = vine.create({
  title: title().optional(),
  description: description(),
  status: status().optional(),
})
