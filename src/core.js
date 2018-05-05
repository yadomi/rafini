const {
  trim,
  replace,
  compose,
  toLower,
  toUpper,
  join,
  reduce,
  curry,
  ifElse,
  startsWith,
  append,
  identity,
  map,
  evolve,
  pick,
  groupBy,
  prop,
  __
} = require('ramda')

const { basename, extname } = require('path')
const formatTitle = require('to-title-case')
const pad = curry(require('left-pad'))

const { banned } = require('./dictionary')

const SPACE = ' '
const EMPTY = ''

const removeBannedChars = (exports.removeBannedChars = compose(
  trim,
  replace(/\s+/g, SPACE),
  replace(/[^a-zA-Z 0-9]+/g, SPACE),
  replace(/[-_]+/g, EMPTY),
  replace(/(\[.*\])/, EMPTY)
))

const removeBannedWords = (exports.removeBannedWords = compose(
  trim,
  replace(/\s+/g, SPACE),
  reduce(
    (sum, word) => {
      const re = new RegExp(`\\b\\w*?${word}\\w*?\\b`)
      return replace(re, '', sum)
    },
    __,
    banned
  )
))

const removeFileExtension = (exports.removeFileExtension = arg =>
  basename(arg, extname(arg)))

const formatEpisode = (exports.formatEpisode = replace(
  /(S|s|E|EP|e|ep)\d{1,2}(S|s|E|EP|e|ep)\d{1,2}/,
  compose(
    ifElse(
      startsWith('E'),
      compose(join(''), append('E01'), replace('E01', '')),
      identity
    ),
    replace(/(\d{1,2})/g, pad(__, 2, '0')),
    toUpper,
    replace('p', EMPTY),
    toLower
  )
))

const formatYear = (exports.formatYear = replace(
  /(19|20)\d{2}$/g,
  arg => `(${arg})`
))

exports.formatFFprobe = compose(
  evolve({
    video: map(
      pick([
        'codec_name',
        'codec_long_name',
        'width',
        'height',
        'r_frame_rate',
        'codec_time_base',
        'pix_fmt'
      ])
    ),
    audio: map(
      compose(
        evolve({ tags: pick(['language', 'title']) }),
        pick([
          'codec_name',
          'codec_long_name',
          'sample_rate',
          'channels',
          'channel_layout',
          'tags'
        ])
      )
    ),
    subtitle: map(
      compose(
        evolve({ tags: pick(['language', 'title']) }),
        pick(['codec_name', 'codec_long_name', 'duration_ts', 'tags'])
      )
    )
  }),
  pick(['audio', 'video', 'subtitle']),
  groupBy(prop('codec_type')),
  prop('streams')
)

exports.refine = compose(
  formatYear,
  formatEpisode,
  formatTitle,
  removeBannedWords,
  removeBannedChars,
  removeFileExtension,
  toLower
)
