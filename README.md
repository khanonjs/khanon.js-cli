# Khanon.js Command Line Interface (CLI)

CLI for Khanon.js package: [@khanonjs/engine](https://www.npmjs.com/package/@khanonjs/engine)

Usage:

`khanon [option] [args]`

Default --dest folder is 'dist'
Default --port is 3000

Options:
      --version         Show version number                            [boolean]
      --help            Show help                                      [boolean]
  -c, --create-project  Create a new Khanon.js project

  -b, --build-dev       Build the project in development mode.
                        --dest [folder] | Output directory (optional).

  -r, --build-prod      Build the project in production mode.
                        --dest [folder] | Output directory (optional).

  -s, --start-dev       Start the project in development mode.
                        --dest [folder] | Output directory (optional).
                        --port [number] | Port number (optional).

  -p, --start-prod      Start the project in production mode.
                        --dest [folder] | Output directory (optional).
                        --port [number] | Port number (optional).