const { refine, tmdb } = require('rafini')
const CLI = require('commander')
const { version } = require('../package.json')
const { resolve, basename, extname, dirname, join } = require('path')
const { existsSync: exist, renameSync: rename } = require('fs')
const { map, addIndex, concat, replace } = require('ramda')
const sanitize = require('sanitize-filename')
const chalk = require('chalk')
const rafini = require('./main');

const command = async filenames => {
  await rafini(filenames, CLI);
}

CLI.version(version)
  .description('Refine filename to human readable movie title')
  .arguments('<filenames...>')
  .action(command)
  .option('-f, --format [format]', 'set output format: json, pretty, stdout')
  .option('--with-tmdb <API_KEY>', 'use themoviedb.org API for better match.')
  .option(
    '--tmdb-language <language>',
    'set the language code ISO 639-1 for themoviedb.org search (default: en-US)'
  )
  .option('-q, --quiet', "Don't output interactive progress")
  .option('-w, --rename', 'rename files in place')
  .parse(process.argv)

const args = process.argv.slice(2)
if (typeof args[0] === 'undefined') {
  CLI.help()
}
