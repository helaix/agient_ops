// R2 Bucket resource definition for Sparkflow
import { R2Bucket } from '@alchemy/cloudflare'

export const sparkflowStorage = new R2Bucket('sparkflow-storage', {
  name: 'sparkflow-app-storage',
  publicReadAccess: false
})

