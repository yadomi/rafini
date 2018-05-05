const { refine, ffprobe, tmdb } = require('rafini')
const CLI = require('commander')
const { version } = require('../package.json')
const { resolve, basename, extname, dirname, join } = require('path')
const { existsSync: exist, renameSync: rename } = require('fs')
const { map, concat } = require('ramda')
const sanitize = require('sanitize-filename')
const chalk = require('chalk')

const command = async filenames => {
  const transform = map(path => {
    const filepath = resolve(path)
    if (!exist(filepath)) {
      console.error('No such file or directory: ', filepath)
      process.exit(1)
    }

    const filename = basename(filepath)
    const extension = extname(filename)

    const title = refine(filename)
    const newname = concat(title, extension)
    const newpath = join(dirname(filepath), newname)

    return {
      title,
      extension,
      path: {
        from: filename,
        to: newname
      },
      absolute: {
        from: filepath,
        to: newpath
      }
    }
  }, filenames)

  if (CLI.withFfprobe) {
    for (const entry of transform) {
      try {
        entry.metadata = await ffprobe(entry.absolute.from, CLI.withFfprobe)
      } catch (e) {}
    }
  }

  if (CLI.withTmdb) {
    for (const entry of transform) {
      try {
        entry.tmdb = await tmdb(entry.title, CLI.withTmdb)
        if (entry.tmdb.title && entry.tmdb.release_date) {
          const year = new Date(entry.tmdb.release_date).getFullYear()
          const title = `${entry.tmdb.title} (${year})`
          const newname = sanitize(concat(title, entry.extension))

          entry.title = title
          entry.path.to = newname
          entry.absolute.to = join(dirname(entry.absolute.to), newname)
        }
      } catch (e) {}
    }
  }

  if (CLI.rename) {
    for (const entry of transform) {
      rename(entry.absolute.from, entry.absolute.to)
    }
  }

  if (CLI.format) {
    switch (CLI.format) {
      case 'json':
        console.log(JSON.stringify(transform, null, 2))
        break
      case 'pretty':
        for (const entry of transform) {
          console.log(
            chalk.yellow(entry.path.from) + ' -> ' + chalk.green(entry.path.to)
          )
        }
        break
      case 'stdout':
        for (const entry of transform) {
          console.log(entry.path.to)
        }
    }
  }
}

CLI.version(version)
  .description('Refine filename to human readable movie title')
  .arguments('<filenames...>')
  .action(command)
  .option('-f, --format [format]', 'set output format: json, pretty, stdout')
  .option(
    '--with-ffprobe <ffprobe-bin>',
    'use ffprobe to extract metadata. Only make sense with --format json. Must pass path to ffprobe binary'
  )
  .option('--with-tmdb <API_KEY>', 'use themoviedb.org API for better match.')
  .option('-w, --rename', 'rename files in place')
  .parse(process.argv)

const args = process.argv.slice(2)
if (typeof args[0] === 'undefined') {
  CLI.help()
}
