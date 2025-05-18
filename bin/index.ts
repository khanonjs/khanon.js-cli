#!/usr/bin/env node

import chalk from 'chalk'
import yargs from 'yargs/yargs'

import { Helper } from './classes/helper'
import { OptionBase } from './classes/option-base'
import { optionsData } from './options-data'

// eslint-disable-next-line @typescript-eslint/no-var-requires
const packageVersion = require('../package.json').version

/**
 * Yargs options
 */
const yargsOptions = {}
optionsData.forEach((optionData) => Object.defineProperty(
  yargsOptions,
  optionData.shortCommand.length === 1 ? optionData.shortCommand : optionData.longCommand,
  {
    enumerable: true,
    value: {
      alias: optionData.shortCommand.length === 1 ? optionData.longCommand : optionData.shortCommand,
      describe: optionData.description
    },
  }
))

const yargsInstance = yargs(process.argv.slice(2))
  .usage('\nUsage: ' + chalk.cyan('khanon [option]\n'))
  .help(true)
  .options(yargsOptions)

const argv = yargsInstance.parseSync()

/**
 * Entry point
 */
let option: OptionBase

if (Object.keys(argv).length < 3) {
  yargsInstance.showHelp()
} else {
  optionsData.forEach((optionData) => {
    if (argv[optionData.shortCommand]) {
      option = optionData.instance
    }
  })

  option.packageVersion = packageVersion
  option.execute()
}
