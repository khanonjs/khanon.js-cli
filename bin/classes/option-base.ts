import chalk from 'chalk'
import fs from 'fs'

import { DecoratorObjectData } from '../models/decorator-object-info'
import { WSFCli } from '../models/wsf-cli'
import { Helper } from './helper'

interface PropValue {
  idx: number,
  indent: number,
  property: string,
  value: string
}

export abstract class OptionBase {
  packageVersion: string

  protected serversPath = 'src/servers'
  protected endpointsPath = 'src/endpoints'
  protected environmentsPath = '.envs'

  abstract execute(): void;

  protected end(msg: string): void {
    setTimeout(() => {
      Helper.hideSpinner()
      console.log(chalk.cyan(msg))
    }, 500)
  }

  protected loadWSFCli(): WSFCli | undefined {
    let data: string
    let wsfCli: WSFCli
    try {
      data = fs.readFileSync('wsf-cli.conf', { encoding: 'utf8', flag: 'r' })
      wsfCli = JSON.parse(data)
      if (!wsfCli.version === undefined ||
        !wsfCli.service_name === undefined ||
        !wsfCli.bundled === undefined ||
        !wsfCli.dockerized === undefined ||
        !wsfCli.servers === undefined ||
        !wsfCli.endpoints === undefined ||
        !wsfCli.environments === undefined) {
        Helper.printError('\'wsf-cli.conf\' not found or the file is corrupt. Please run this command from the root of a project created with WSF-CLI.')
        return
      }
    } catch (error) {
      Helper.printError('\'wsf-cli.conf\' not found or the file is corrupt. Please run this command from the root of a project created with WSF-CLI.')
      return
    }
    return wsfCli
  }

  protected saveWSFCli(wsfCli: WSFCli) {
    try {
      fs.writeFileSync('wsf-cli.conf', JSON.stringify(wsfCli, null, '\t'), 'utf8')
    } catch (error) {
      Helper.printError('Error saving \'wsf-cli.conf\'!')
    }
  }

  protected readFileDecoratorObject(filePath: string, className: string): DecoratorObjectData {
    function getNextPropertyValue(idx: number, objectString: string): PropValue | undefined {
      // E.g object string: "name: 'api',  framework: 'Fastify',  port: process.env.PORT_API ? Number(process.env.PORT_API) : 3000,  endpoints: [],  endpoints2: [[Class1, Class2,    Class3, [Class1, Class2]]  ]"
      // '/r', '/n' and '/t' have been removed previously
      // idx: Position to start getting next property/value
      let splitPos = idx
      do {
        splitPos++
      } while (objectString[splitPos] !== ':' && splitPos < objectString.length - 1)

      // No more properties
      if (splitPos >= objectString.length - 1) {
        return undefined
      }

      // Get property
      let property = objectString.substring(idx, splitPos)
      const indent = property.match(/ /).length + 1
      property = property.replace(/,/g, '')
      property = property.replace(/ /g, '')

      // Get value
      let startValPos = splitPos
      do {
        startValPos++
      } while (objectString[startValPos] === ' ' && startValPos < objectString.length)

      let valPos = startValPos
      let leftBrackets = 0
      let isArray = false
      do {
        if (objectString[valPos] === '[') {
          isArray = true
          leftBrackets++
        } else if (objectString[valPos] === ']') {
          leftBrackets--
        }
        valPos++
        if (valPos > objectString.length) {
          valPos = objectString.length
        }
      } while ((objectString[valPos] !== ',' || leftBrackets !== 0) && valPos < objectString.length)

      let value = objectString.substring(startValPos, valPos)
      if (isArray) {
        value = value.replace(/ /g, '')
      }

      return {
        idx: valPos,
        indent,
        property,
        value
      }
    }

    const content = fs.readFileSync(filePath, 'utf8')
    const decoratorObjectData = this.findFileDecoratorObjectIndex(content, className)
    decoratorObjectData.filePath = filePath
    let objectString = decoratorObjectData.fileContent.substring(decoratorObjectData.idxStart + 1, decoratorObjectData.idxEnd - 1)
    objectString = objectString.replace(/\r/g, '')
    objectString = objectString.replace(/\n/g, '')
    objectString = objectString.replace(/\t/g, '')
    const decoratorObject = []
    let pos = 0
    let propValue: PropValue
    do {
      propValue = getNextPropertyValue(pos, objectString)
      if (propValue) {
        decoratorObjectData.indent = propValue.indent
        pos = propValue.idx
        decoratorObject.push([propValue.property, propValue.value])
      }
    } while (propValue)
    decoratorObjectData.object = decoratorObject

    return decoratorObjectData
  }

  protected saveFileDecoratorObject(decoratorObjectData?: DecoratorObjectData) {
    function parseValue(value: string, indent: string): string {
      if (value[0] === '[' && value !== '[]') {
        let items = value.substring(1, value.length - 1).split(',')
        if (items[items.length - 1] === '') {
          items.splice(items.length - 1, 1)
        }
        items = items.map(item => `${indent}${indent}${item}`)
        return `[
${items.join(',\n')}
${indent}]`
      } else {
        return value
      }
    }
    let indent = ''
    let indentIdx = decoratorObjectData.indent
    while (indentIdx > 0) {
      indentIdx--
      indent += ' '
    }
    let insertString = ''
    decoratorObjectData.object.forEach((pair, index) => {
      insertString += `${indent}${pair[0]}: ${parseValue(pair[1], indent)}${index < decoratorObjectData.object.length - 1 ? ',\n' : ''}`
    })
    const objectString = `{
${insertString}
}`

    const contentBefore = decoratorObjectData.fileContent.substring(0, decoratorObjectData.idxStart)
    const contentAfter = decoratorObjectData.fileContent.substring(decoratorObjectData.idxEnd, decoratorObjectData.fileContent.length)
    const saveContent = contentBefore.concat(objectString, contentAfter)

    fs.writeFileSync(decoratorObjectData.filePath, saveContent, 'utf8')
  }

  private findFileDecoratorObjectIndex(content: string, className: string): DecoratorObjectData {
    let idx = content.indexOf(`class ${className} implements`)
    if (idx < 0) {
      throw new Error(`Fatal error, index for 'class ${className} implements' not found in 'findFileDecoratorObjectIndex'!`)
    }
    do {
      idx--
    } while (content[idx] !== '}' && idx >= 0)
    if (idx < 0) {
      throw new Error('Fatal error, index for \'}\' not found in \'findFileDecoratorObjectIndex\'!')
    }
    const idxEnd = idx + 1
    do {
      idx--
    } while (content[idx] !== '@' && idx >= 0)
    if (idx < 0) {
      throw new Error('Fatal error, index for \'@\' not found! in \'findFileDecoratorObjectIndex\'')
    }
    do {
      idx++
    } while (content[idx] !== '{' && idx <= content.length)
    if (idx > content.length) {
      throw new Error('Fatal error, index for \'{\' not found! in \'findFileDecoratorObjectIndex\'')
    }
    const idxStart = idx

    return {
      filePath: '',
      object: [],
      fileContent: content,
      indent: 2,
      idxStart,
      idxEnd
    }
  }

  protected setDecoratorObjectProperty(decoratorObject: string[][], property: string, value: string) {
    let done = false
    decoratorObject.forEach(pair => {
      if (pair[0] === property) {
        pair[1] = value
        done = true
      }
    })
    if (!done) {
      Helper.printError(`Property '${property}' not found in decorator!`)
    }
  }

  protected addDecoratorObjectArrayValue(decoratorObject: string[][], propertyArray: string, value: string) {
    let done = false
    decoratorObject.forEach(pair => {
      if (pair[0] === propertyArray) {
        pair[1] = pair[1].replace(/\[/g, '')
        pair[1] = pair[1].replace(/\]/g, '')
        let items = []
        if (pair[1].length > 0) {
          items = pair[1].split(',')
        }
        items.push(value)
        pair[1] = `[${items.join(',')}]`
        done = true
      }
    })
    if (!done) {
      Helper.printError(`Property '${propertyArray}' not found in decorator!`)
    }
  }

  protected removeDecoratorObjectArrayValue(decoratorObject: string[][], propertyArray: string, value: string) {
    let done = false
    decoratorObject.forEach(pair => {
      if (pair[0] === propertyArray) {
        pair[1] = pair[1].replace(/\[/g, '')
        pair[1] = pair[1].replace(/\]/g, '')
        const items = pair[1].split(',')
        const indexRemove = items.indexOf(value)
        if (indexRemove < 0) {
          Helper.printError(`Item '${value}' not found in decorator array!`)
        } else {
          pair[1] = items.splice(indexRemove, 1).join(',')
        }
        pair[1] = `[${items.join(',')}]`
        done = true
      }
    })
    if (!done) {
      Helper.printError(`Property '${propertyArray}' not found in decorator!`)
    }
  }
}
