import { OptionBase } from '../classes/option-base'

export interface Option {
  shortCommand: string
  longCommand: string
  description: string
  choices?: string[]
  instance: OptionBase
}
