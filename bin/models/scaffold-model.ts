import { ScaffoldItem } from './scaffold-item'
import { ScaffoldItemType } from './scaffold-item-type'

export const scaffoldModel: ScaffoldItem[] = [
  {
    type: ScaffoldItemType.FOLDER,
    name: 'node_modules',
    children: [
      {
        type: ScaffoldItemType.FOLDER,
        name: '@khanonjs/engine'
      },
    ],
  },
  {
    type: ScaffoldItemType.FOLDER,
    name: 'src',
    children: [
      {
        type: ScaffoldItemType.FILE,
        name: 'app.ts'
      },
    ],
  },
  {
    type: ScaffoldItemType.FOLDER,
    name: 'public',
    children: [
      {
        type: ScaffoldItemType.FILE,
        name: 'index.html'
      },
    ],
  },
  {
    type: ScaffoldItemType.FILE,
    name: 'package.json',
  }
]
