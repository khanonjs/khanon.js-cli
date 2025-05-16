/* eslint-disable no-useless-escape */
/* eslint-disable no-control-regex */

import chalk from 'chalk'
import fs from 'fs'
import logUpdate from 'log-update'
import path from 'path'

import { ParseParameter } from '../models/parse-parameter'

export class Helper {
  private static regexFolderValidation = /^[^\s^\x00-\x1f\\?*:"";<>|\/.][^\x00-\x1f\\?*:"";<>|\/]*[^\s^\x00-\x1f\\?*:"";<>|\/.]+$/g
  private static regexRoutePathValidation = /^\/(?!.*\/\/)([:a-zA-Z\d-\/]+)$/gim
  private static spinnerInterval//: NodeJS.Timeout | undefined
  private static spinner = {
    interval: 80,
    frames: ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏']
  }

  static printError(message: string) {
    Helper.hideSpinner()
    console.log('WSF Error: ' + chalk.red(message))
  }

  static showSpinner(text = ''): Promise<void> {
    return new Promise((resolve) => {
      let i = 0
      Helper.spinnerInterval = setInterval(() => {
        logUpdate(text + ' ' + chalk.cyan(Helper.spinner.frames[i = ++i % Helper.spinner.frames.length]))
      }, Helper.spinner.interval)
      setTimeout(resolve, 1)
    })
  }

  static hideSpinner() {
    if (Helper.spinnerInterval) {
      clearInterval(Helper.spinnerInterval)
      logUpdate('')
    }
  }

  static isValidFileName(fileName: string): boolean {
    return Helper.regexFolderValidation.test(fileName) && fileName.indexOf(' ') === -1
  }

  static isValidRoutePath(path: string): boolean {
    return Helper.regexRoutePathValidation.test(path) && path.indexOf(' ') === -1
  }

  static copyTemplateFile(templateName: string, dstPath: string, parameters: ParseParameter[]) {
    const content = fs.readFileSync(path.join(__dirname, '..', '..', `templates/${templateName}.template`), 'utf8')
    fs.writeFileSync(dstPath, Helper.parseParameters(content, parameters), 'utf8')
  }

  /**
   * Append or remove lines between two determined tags in file
   * E.g:
   * {{TAG_START}}
   * ... lines added or removed ...
   * {{TAG_END}}
   */
  static appendFileLineBetweenTags(filePath: string, tagStart: string, tagEnd: string, appendTextLines: string[], deleteTextLines: string[]) {
    const seekNewLine = (text: string, start: number, isForward: boolean) => {
      let pos = start
      if (isForward) {
        while (text[pos] !== '\n' && pos < text.length - 1) {
          pos++
        }
      } else {
        while (text[pos] !== '\n' && pos > 0) {
          pos--
        }
      }
      return pos
    }

    let content = fs.readFileSync(filePath, 'utf8')

    // Remove carry return \r or everything will be a mess
    content = content.replace(/\r/g, '')

    // Get body between tags
    const bodyStart = seekNewLine(content, content.indexOf(tagStart), true)
    const bodyEnd = seekNewLine(content, content.indexOf(tagEnd), false)
    let body = content.substring(bodyStart, bodyEnd)

    // Get blocks before and after the body
    const contentBefore = content.substring(0, bodyStart)
    const contentAfter = content.substring(bodyEnd)

    // Delete and append lines
    deleteTextLines.forEach(deleteLine => (body = body.replace(deleteLine, '')))
    appendTextLines.forEach(appendLine => (body += '\n' + appendLine + '\n'))

    // Sort jump of lines
    let size: number
    do {
      size = body.length
      body = body.replace(/\n\n/g, '\n')
    } while (size !== body.length)
    while (body.length > 0 && (body[body.length - 1] === '\n')) {
      body = body.substring(0, body.length - 1)
    }

    // Append new body between tags
    content = contentBefore.concat(body, contentAfter)

    fs.writeFileSync(filePath, content, 'utf8')
  }

  /**
   * Change a text by another in a line containing certain another text
   * E.g: For the line containint 'listen', change '3000' by '5000'
   * Before: listen       3000 default_server;
   * After:  listen       5000 default_server;
   */
  static changeTextInFileLineContaining(filePath: string, containingText: string, text: string, newText: string, lineSeparators = ['\n']) {
    const isNewLine = (char: string): boolean => {
      let newLine = false
      lineSeparators.forEach(separator => {
        if (char === separator) {
          newLine = true
        }
      })
      return newLine
    }
    const seekNewLine = (text: string, start: number, isForward: boolean) => {
      let pos = start
      if (isForward) {
        while (!isNewLine(text[pos]) && pos < text.length - 1) {
          pos++
        }
      } else {
        while (!isNewLine(text[pos]) && pos > 0) {
          pos--
        }
      }
      return pos
    }

    let content = fs.readFileSync(filePath, 'utf8')
    const lineStart: number[] = [0]

    // Find all line breaks
    for (let i = 0; i < content.length; i++) {
      if (isNewLine(content[i])) {
        lineStart.push(i)
      }
    }

    // Replace those lines containing 'containingText'
    content = content.replace(new RegExp(text, 'g'), (match, args) => {
      const limitBefore = seekNewLine(content, args, false)
      const limitAfter = seekNewLine(content, args, true)
      const textLine = content.substring(limitBefore, limitAfter)
      if (textLine.indexOf(containingText) >= 0) {
        return newText
      } else {
        return match
      }
    })

    fs.writeFileSync(filePath, content, 'utf8')
  }

  static stringToCamelCase(text: string, firstToUppercase = false): string {
    const DEFAULT_REGEX = /[-_]+(.)?/g
    function toUpper(match, group1) {
      return group1 ? group1.toUpperCase() : ''
    }
    if (firstToUppercase) {
      const result = text.replace(DEFAULT_REGEX, toUpper)
      return result.charAt(0).toUpperCase() + result.slice(1)
    } else {
      return text.replace(DEFAULT_REGEX, toUpper)
    }
  }

  static parseParameters(text: string, parameters: ParseParameter[]) {
    if (parameters && parameters.length > 0) {
      let filledTemplate = text
      parameters.forEach(parameter => {
        const re = new RegExp('{{' + parameter.parameter + '}}', 'g')
        filledTemplate = filledTemplate.replace(re, parameter.value as string)
      })
      return filledTemplate
    } else {
      return text
    }
  }

  static isNumeric(input: string) {
    return input && !isNaN(Number(input))
  }

  static objectToString(data: unknown, stringfy = true): string {
    function getCircularReplacer() {
      const ancestors = []
      return function (key, value) {
        if (typeof value !== 'object' || value === null) {
          return value
        }
        // `this` is the object that value is contained in,
        // i.e., its direct parent.
        // @ts-ignore
        while (ancestors.length > 0 && ancestors.at(-1) !== this) {
          ancestors.pop()
        }
        if (ancestors.includes(value)) {
          return '[Circular]'
        }
        ancestors.push(value)
        return value
      }
    }
    return data
      ? (data instanceof Error
        ? data.message
        : (typeof data === 'object' && stringfy
          ? JSON.stringify(data, getCircularReplacer())
          : data as string))
      : ''
  }

  static getServerTsFilePath(serverPath: string, serverName: string, ommitTs = false): string {
    return `./${path.join(serverPath, serverName)}${ommitTs ? '' : '.ts'}`
  }

  static getServerNginxPath(serverName: string): string {
    return `./docker-nginx/server-${serverName}.conf`
  }

  static getEndpointTsFilePath(endpointPath: string, endpointName: string, ommitTs = false, createFolder = false): string {
    const folder = `./${path.join(endpointPath, endpointName)}`
    if (createFolder) {
      if (!fs.existsSync(folder)) {
        fs.mkdirSync(folder)
      }
    }
    return `${folder}/${endpointName}${ommitTs ? '' : '.ts'}`
  }

  static getServerImportStatement(serverPath: string, serverName: string, serverClassName: string): string {
    return `import { ${serverClassName} } from '.${Helper.getServerTsFilePath(serverPath, serverName, true).replace('./src', '').replace(/\\/g, '/')}'`
  }

  static getEndpointImportStatement(endpointPath: string, endpointName: string, endpointClassName: string): string {
    return `import { ${endpointClassName} } from '..${Helper.getEndpointTsFilePath(endpointPath, endpointName, true).replace('./src', '').replace(/\\/g, '/')}'`
  }

  static getPm2EcosystemFilePath(): string {
    return './ecosystem.config.json'
  }

  static getEnvPm2EcosystemProperty(environmentName: string): { key: string, value: object } {
    return {
      key: `env_${environmentName}`,
      value: { NODE_ENV: environmentName }
    }
  }

  static getEnvPackageStartScript(environmentName: string): { key: string, value: string } {
    return {
      key: `start:env:${environmentName}`,
      value: `set NODE_ENV=${environmentName}&& nodemon ./src/app.ts`
    }
  }

  static getEnvPackagePm2Script(environmentName: string): { key: string, value: string } {
    return {
      key: `start:pm2:${environmentName}`,
      value: `pm2 start ecosystem.config.json --env ${environmentName} --no-daemon`
    }
  }
}
