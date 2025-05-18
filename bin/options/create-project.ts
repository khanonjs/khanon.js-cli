import chalk from 'chalk'
import { exec } from 'child_process'
import { prompt } from 'enquirer'
import fs from 'fs'

import { AppendBase } from '../append/append-base'
import { Helper } from '../classes/helper'
import { OptionBase } from '../classes/option-base'
import { CreateProjectInfo } from './create-project-info'

export class CreateProject extends OptionBase {
  async execute() {
    console.log(chalk.cyan(`Creating new project using Khanon.js '${this.packageVersion}'...\n`))

    let projectInfo: CreateProjectInfo
    let response: { continue: boolean }
    try {
      projectInfo = await prompt<CreateProjectInfo>([
        {
          type: 'input',
          name: 'projectName',
          message: 'Insert project name',
          validate: (input: string): boolean | string | Promise<boolean | string> => Helper.isValidFileName(input)
        }
      ])

      response = await prompt({
        type: 'confirm',
        name: 'continue',
        message: `This will create folder '${projectInfo.projectName}'. Continue?`,
        initial: 'y'
      })
    } catch (error) {
      console.log(chalk.yellow('\nAborted manually.'))
      return
    }

    if (response.continue) {
      try {
        projectInfo.projectName = projectInfo.projectName.toLowerCase()
        this.create(projectInfo)
      } catch (error) {
        Helper.printError(`Uncaught error: ${error}.`)
      }
    } else {
      console.log(chalk.yellow('Project creation aborted.'))
    }
  }

  async create(projectInfo: CreateProjectInfo) {
    Helper.showSpinner('\nBuilding project').then(async () => {
      const folderName = projectInfo.projectName
      if (fs.existsSync(folderName)) {
        Helper.printError(`Folder '${folderName}' already exists.`)
      } else {
        fs.mkdirSync(folderName)
        await AppendBase.append(folderName, { serviceInfo: projectInfo }, this.packageVersion)

        exec('npm i', { cwd: `./${folderName}` }, () => {
          this.end(`Khanon.js project created successfully in folder '${folderName}'`)
        })
      }
    })
  }
}
