import fs from 'fs'

import { AppendFiles } from '../classes/append-files'
import { Helper } from '../classes/helper'
import { AppendBaseInfo } from './append-base-info'

export class AppendBase extends AppendFiles {
  static scaffoldingFolder = 'base'

  static async append(dstFolder: string, info: AppendBaseInfo, packageVersion: string) {
    fs.cpSync(AppendBase.getScaffoldFolder(AppendBase.scaffoldingFolder), dstFolder, { recursive: true })
    Helper.copyTemplateFile('khanonjs', `./${dstFolder}/khanonjs.conf`, [
      {
        parameter: 'KHANONJS_VERSION',
        value: packageVersion
      },
      {
        parameter: 'PROJECT_NAME',
        value: info.serviceInfo.projectName
      }
    ])
    Helper.copyTemplateFile('package', `./${dstFolder}/package.json`, [
      {
        parameter: 'PROJECT_NAME',
        value: info.serviceInfo.projectName
      },
      {
        parameter: 'KHANONJS_VERSION',
        value: packageVersion
      }
    ])
    Helper.copyTemplateFile('app', `./${dstFolder}/src/app.ts`, [
      {
        parameter: 'PROJECT_NAME',
        value: info.serviceInfo.projectName
      }
    ])
    Helper.copyTemplateFile('README', `./${dstFolder}/README.md`, [
      {
        parameter: 'PROJECT_NAME',
        value: info.serviceInfo.projectName
      }
    ])
    Helper.copyTemplateFile('index', `./${dstFolder}/public/index.html`, [
      {
        parameter: 'PROJECT_NAME',
        value: info.serviceInfo.projectName
      }
    ])
  }
}
