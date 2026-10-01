import testUtils from '@adonisjs/core/services/test_utils'

/**
 * Runs any pending migrations and then empties every table, so each test
 * starts from a clean, known state.
 */
export async function emptyDatabase() {
  const truncate = await testUtils.db().truncate()
  await truncate()
}
