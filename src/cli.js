const { refine } = require('rafini')
const CLI = require('commander')
const { version } = require('../package.json')
const { resolve, basename, extname, dirname, join } = require('path')
const { existsSync: exist, renameSync: rename } = require('fs')
const { concat } = require('ramda')
const chalk = require('chalk')

const command = filenames => {
  for (const path of filenames) {
    const filepath = resolve(path)
    if (!exist(filepath)) {
      console.error('No such file or directory: ', filepath)
      process.exit(1)
    }

    const filename = basename(filepath)
    const extension = extname(filename)

    const newname = concat(refine(filename), extension)
    const newpath = join(dirname(filepath), newname)
    console.log(chalk.yellow(filename) + ' -> ' + chalk.green(newname))
    if (!CLI.dryRun) {
      rename(filepath, newpath)
    }
  }
}

CLI.version(version)
  .option(
    '-ws, --with-webservices',
    'use web services such as TMDB.org for better match'
  )
  .option('--dry-run', "don't rename files, only output what rafini will do")
  .arguments('<filenames...>')
  .action(command)
  .parse(process.argv)

const args = process.argv.slice(2)
if (typeof args[0] === 'undefined') {
  CLI.help()
}
