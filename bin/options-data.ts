import { Option } from './models/option'
import { CreateProject } from './options/create-project'

export const optionsData: Option[] = [
  {
    shortCommand: 'c',
    longCommand: 'create-project',
    description: 'Create a new Khanon.js project',
    instance: new CreateProject()
  }
]
