import { TaskSchema } from '#database/schema'
import {column} from '@adonisjs/lucid/orm'


export default class Task extends TaskSchema {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare title: string

  @column()
  declare description: string

  @column()
  declare status: string

  @column()
  declare created_at: string

  @column()
  declare updated_at: string

}

