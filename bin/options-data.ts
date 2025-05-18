/* eslint-disable no-useless-escape */
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
    description: 'Create a new Khanon.js project\n',
    instance: new CreateProject()
  },
  {
    shortCommand: 'b',
    longCommand: 'build-dev',
    description: 'Build the project in development mode.\n--dest [folder] | Output directory (optional).\n',
    instance: new BuildDev()
  },
  {
    shortCommand: 'r',
    longCommand: 'build-prod',
    description: 'Build the project in production mode.\n--dest [folder] | Output directory (optional).\n',
    instance: new BuildProd()
  },
  {
    shortCommand: 's',
    longCommand: 'start-dev',
    description: 'Start the project in development mode.\n--dest [folder] | Output directory (optional).\n--port [number] | Port number (optional).\n',
    instance: new StartDev()
  },
  {
    shortCommand: 'p',
    longCommand: 'start-prod',
    description: 'Start the project in production mode.\n--dest [folder] | Output directory (optional).\n--port [number] | Port number (optional).\n',
    instance: new StartProd()
  }
]
