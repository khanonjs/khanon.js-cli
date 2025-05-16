import { WSFCliEndpoint } from './wsf-cli-endpoint'
import { WSFCliEnvironment } from './wsf-cli-environment'
import { WSFCliServer } from './wsf-cli-server'

export interface WSFCli {
  version: string
  service_name: string
  bundled: boolean
  dockerized: boolean
  servers: WSFCliServer[]
  endpoints: WSFCliEndpoint[]
  environments: WSFCliEnvironment[]
}
