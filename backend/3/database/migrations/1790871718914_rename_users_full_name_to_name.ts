import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  async up() {
    /**
     * SQLite refuses to apply a NOT NULL constraint while NULLs are still
     * stored in the column, so we backfill them with an empty string first.
     */
    await this.db.query().from('users').whereNull('full_name').update({ full_name: '' })

    this.schema.alterTable(this.tableName, (table) => {
      table.renameColumn('full_name', 'name')
    })

    this.schema.alterTable(this.tableName, (table) => {
      table.string('name').notNullable().alter()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('name').nullable().alter()
    })

    this.schema.alterTable(this.tableName, (table) => {
      table.renameColumn('name', 'full_name')
    })
  }
}
