import path from 'path'

export class AppendFiles {
  static getScaffoldFolder(folder: string): string { return path.join(__dirname, '../../scaffold/', folder) }
}
