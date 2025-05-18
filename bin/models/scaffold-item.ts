import { ScaffoldItemType } from './scaffold-item-type'

export type ScaffoldItem = {
  type: ScaffoldItemType
  name: string
  children?: ScaffoldItem[]
};
