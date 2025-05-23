// D1 Database resource definition for Sparkflow
import { D1Database } from '@alchemy/cloudflare'

export const sparkflowDatabase = new D1Database('sparkflow-db', {
  name: 'sparkflow-app-db',
  migrations: '../../@sparkflow/sparkflow/migrations'
})

