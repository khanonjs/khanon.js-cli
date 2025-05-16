// TODO duplicated file with 'C:\Projects\web-service-framework\packages\wsf\src\decorators\server\server-info.ts'
// Use a common library

import { Frameworks } from './frameworks'

export interface ServerInfo {
  name: string
  framework: Frameworks
  port: number
  endpoints: any[]
  enabled?: boolean
}
