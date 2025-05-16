import { HttpProtocol } from './http-protocol'

export interface WSFCliEndpoint {
  name: string
  className: string
  path: string
  routePath: string
  protocol: HttpProtocol
}
