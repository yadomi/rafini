const { refine, tmdb } = require('rafini')
const { version } = require('../package.json')
const { resolve, basename, extname, dirname, join } = require('path')
const { existsSync: exist, renameSync: rename } = require('fs')
const { map, addIndex, concat, replace } = require('ramda')
const sanitize = require('sanitize-filename')
const chalk = require('chalk')


module.exports = async (filenames, options) => {

  const log = (...args) => {
    if (options.format || options.quiet) return;
    console.log(...args);
  }

  const TOTAL = filenames.length

  const transform = filenames.map((path, index) => {
    const filepath = resolve(path)

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
  })

  if (options.withTmdb) {
    let i = 1
    for (const entry of transform) {
      log(chalk.gray(`[${i}/${TOTAL}]`) + ` tmdb: ${entry.title}`)
      i++

      try {
        entry.tmdb = await tmdb(entry.title, {
          apikey: options.withTmdb,
          language: options.tmdbLanguage
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
      } catch (e) { }
    }
  }

  if (options.rename) {
    let i = 1
    for (const entry of transform) {

      if (!exist(entry.absolute.from)) {
        console.error('No such file or directory: ', entry.absolute.from)
        process.exit(1)
      }

      log(chalk.gray(`[${i}/${TOTAL}]`) + ` rename: ${entry.title}`)
      i++;

      rename(entry.absolute.from, entry.absolute.to)

    }
  }

  if (options.format) {
    switch (options.format) {
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
