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
  replace(/[^a-zA-Zéèçàû 0-9]+/g, SPACE),
  replace(/[-_]+/g, SPACE),
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

exports.refine = compose(
  formatYear,
  formatEpisode,
  formatTitle,
  removeBannedWords,
  removeBannedChars,
  removeFileExtension,
  toLower
)
