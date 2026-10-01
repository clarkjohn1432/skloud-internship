/* eslint-disable prettier/prettier */
import type { routes } from './index.ts'

export interface ApiDefinition {
  users: {
    store: typeof routes['users.store']
  }
  sessions: {
    store: typeof routes['sessions.store']
    destroy: typeof routes['sessions.destroy']
  }
  me: {
    show: typeof routes['me.show']
  }
  tasks: {
    index: typeof routes['tasks.index']
    show: typeof routes['tasks.show']
    store: typeof routes['tasks.store']
    update: typeof routes['tasks.update']
    destroy: typeof routes['tasks.destroy']
  }
}
