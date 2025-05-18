import chalk from 'chalk'

import { Helper } from './helper'

export abstract class OptionBase {
  packageVersion: string

  abstract execute(): void;

  protected end(msg: string): void {
    setTimeout(() => {
      Helper.hideSpinner()
      console.log(chalk.cyan(msg))
    }, 500)
  }
}
