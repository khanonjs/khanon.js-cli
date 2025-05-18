import chalk from 'chalk'
import {
  execSync,
  spawn
} from 'child_process'
import yargs from 'yargs/yargs'

import { BuildIntegrityChecker } from '../classes/build-integrity-checker'
import { Helper } from '../classes/helper'
import { OptionBase } from '../classes/option-base'
import { scaffoldModel } from '../models/scaffold-model'

export class BuildDev extends OptionBase {
  async execute() {
    console.log(chalk.cyan('Building Khanon.js project in development environment...\n'))

    try {
      this.start()
    } catch (error) {
      Helper.printError(`Uncaught error: ${error}.`)
    }
  }

  async start() {
    const rootFolder = process.cwd()
    const checker = new BuildIntegrityChecker(rootFolder, scaffoldModel)
    const integrityResult = checker.check()
    if (integrityResult.missing.length > 0) {
      Helper.printError(`Integrity check failed: Missing files or folders: ${integrityResult.missing.join(', ')}`)
    } else {
      console.log(chalk.cyan('Integrity check passed.'))
      const yargsInstance = yargs(process.argv.slice(2))
      const argv = yargsInstance.parseSync()

      const dest = typeof argv.dest === 'string' ? argv.dest : 'dist'

      execSync(`npx rimraf ./${dest}`, { cwd: rootFolder })

      const command = 'node'
      const args = ['node_modules/@khanonjs/engine/builder/build-dev.mjs', '--dest', dest]

      const child = spawn(command, args, {
        stdio: ['pipe', process.stdout, process.stderr] // Keeps colors and logs
      })

      child.on('error', (err) => {
        console.error(`Failed to start command: ${err}`)
      })

      child.on('exit', (code, signal) => {
        if (code !== 0) {
          console.log(`Command exited with code ${code}`)
        }
      })
    }
  }
}
