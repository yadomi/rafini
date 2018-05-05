const { refine, ffprobe, tmdb } = require('rafini')
const CLI = require('commander')
const { version } = require('../package.json')
const { resolve, basename, extname, dirname, join } = require('path')
const { existsSync: exist, renameSync: rename } = require('fs')
const { map, addIndex, concat, replace } = require('ramda')
const sanitize = require('sanitize-filename')
const chalk = require('chalk')
const logger = require('single-line-log').stdout

const log = (...args) => {
  if (!CLI.quiet) logger(...args)
}

const command = async filenames => {
  const total = filenames.length

  const transform = addIndex(map)((path, index) => {
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

    log(chalk.gray(`[${index + 1}/${total}]`) + `refine: ${filename}`)

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
    let i = 1
    for (const entry of transform) {
      try {
        log(chalk.gray(`[${i}/${total}]`) + ` ffprobe: ${entry.title}`)
        i++

        entry.metadata = await ffprobe(entry.absolute.from, CLI.withFfprobe)
      } catch (e) {}
    }
  }

  if (CLI.withTmdb) {
    let i = 1
    for (const entry of transform) {
      log(chalk.gray(`[${i}/${total}]`) + ` tmdb: ${entry.title}`)
      i++

      try {
        entry.tmdb = await tmdb(entry.title, {
          apikey: CLI.withTmdb,
          language: CLI.tmdbLanguage
        })
        if (entry.tmdb.title && entry.tmdb.release_date) {
          const year = new Date(entry.tmdb.release_date).getFullYear()
          const title = `${entry.tmdb.title} (${year})`
          const newname = replace(
            /\s+/g,
            ' ',
            sanitize(concat(title, entry.extension))
          )

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
