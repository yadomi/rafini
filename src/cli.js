const { refine, formatFFprobe } = require('rafini')
const CLI = require('commander')
const { version } = require('../package.json')
const { resolve, basename, extname, dirname, join } = require('path')
const { existsSync: exist, renameSync: rename } = require('fs')
const { map, concat } = require('ramda')
const chalk = require('chalk')
const ffprobe = require('ffprobe')

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
      const probe = await ffprobe(entry.absolute.from, {
        path: CLI.withFfprobe
      })

      entry.metadata = formatFFprobe(probe)
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
    'Use ffprobe to extract metadata. Must pass path to ffprobe binary'
  )
  .option('-w, --rename', 'rename files in place')
  .parse(process.argv)

const args = process.argv.slice(2)
if (typeof args[0] === 'undefined') {
  CLI.help()
}
