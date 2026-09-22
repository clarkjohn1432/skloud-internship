/* eslint-disable prettier/prettier */
import type { AdonisEndpoint } from '@tuyau/core/types'
import type { Registry } from './schema.d.ts'
import type { ApiDefinition } from './tree.d.ts'

const placeholder: any = {}

const routes = {
  'tasks.index': {
    methods: ["GET","HEAD"],
    pattern: '/tasks',
    tokens: [{"old":"/tasks","type":0,"val":"tasks","end":""}],
    types: placeholder as Registry['tasks.index']['types'],
  },
  'tasks.store': {
    methods: ["POST"],
    pattern: '/tasks',
    tokens: [{"old":"/tasks","type":0,"val":"tasks","end":""}],
    types: placeholder as Registry['tasks.store']['types'],
  },
  'tasks.show': {
    methods: ["GET","HEAD"],
    pattern: '/tasks/:id',
    tokens: [{"old":"/tasks/:id","type":0,"val":"tasks","end":""},{"old":"/tasks/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['tasks.show']['types'],
  },
  'tasks.update': {
    methods: ["PUT","PATCH"],
    pattern: '/tasks/:id',
    tokens: [{"old":"/tasks/:id","type":0,"val":"tasks","end":""},{"old":"/tasks/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['tasks.update']['types'],
  },
  'tasks.destroy': {
    methods: ["DELETE"],
    pattern: '/tasks/:id',
    tokens: [{"old":"/tasks/:id","type":0,"val":"tasks","end":""},{"old":"/tasks/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['tasks.destroy']['types'],
  },
} as const satisfies Record<string, AdonisEndpoint>

export { routes }

export const registry = {
  routes,
  $tree: {} as ApiDefinition,
}

declare module '@tuyau/core/types' {
  export interface UserRegistry {
    routes: typeof routes
    $tree: ApiDefinition
  }
}
