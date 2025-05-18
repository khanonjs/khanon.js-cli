import * as fs from 'fs'
import * as path from 'path'

import { ScaffoldItem } from '../models/scaffold-item'
import { ScaffoldItemType } from '../models/scaffold-item-type'

export class BuildIntegrityChecker {
  private basePath: string
  private scaffold: ScaffoldItem[]

  constructor(basePath: string, scaffold: ScaffoldItem[]) {
    this.basePath = basePath
    this.scaffold = scaffold
  }

  public check(): { missing: string[] } {
    const missing: string[] = []
    this.scaffold.forEach(item => {
      this.checkItem(item, this.basePath, missing)
    })
    return { missing }
  }

  private checkItem(item: ScaffoldItem, currentPath: string, missing: string[]) {
    const itemPath = path.join(currentPath, item.name)
    if (item.type === ScaffoldItemType.FILE) {
      if (!fs.existsSync(itemPath) || !fs.statSync(itemPath).isFile()) {
        missing.push(itemPath)
      }
    } else if (item.type === ScaffoldItemType.FOLDER) {
      if (!fs.existsSync(itemPath) || !fs.statSync(itemPath).isDirectory()) {
        missing.push(itemPath)
      } else if (item.children) {
        item.children.forEach(child => this.checkItem(child, itemPath, missing))
      }
    }
  }
}
