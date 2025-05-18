import { Option } from './models/option'
import { BuildDev } from './options/build-dev'
import { BuildProd } from './options/build-prod'
import { CreateProject } from './options/create-project'
import { StartDev } from './options/start-dev'
import { StartProd } from './options/start-prod'

export const optionsData: Option[] = [
  {
    shortCommand: 'c',
    longCommand: 'create-project',
    description: 'Create a new Khanon.js project',
    instance: new CreateProject()
  },
  {
    shortCommand: 'b',
    longCommand: 'build-dev',
    description: 'Build a Khanon.js project in development mode',
    instance: new BuildDev()
  },
  {
    shortCommand: 'h',
    longCommand: 'build-prod',
    description: 'Build a Khanon.js project in production mode',
    instance: new BuildProd()
  },
  {
    shortCommand: 's',
    longCommand: 'start-dev',
    description: 'Start a Khanon.js project in development mode',
    instance: new StartDev()
  },
  {
    shortCommand: 'p',
    longCommand: 'start-prod',
    description: 'Start a Khanon.js project in production mode',
    instance: new StartProd()
  }
]
