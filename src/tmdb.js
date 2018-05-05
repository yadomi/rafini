const request = require('request-promise-native')
const {
  compose,
  pick,
  head,
  prop,
  map,
  join,
  toPairs,
  trim,
  replace,
  filter,
  match
} = require('ramda')

const format = compose(
  pick([
    'title',
    'id',
    'original_title',
    'poster_path',
    'release_date',
    'overview'
  ]),
  head,
  prop('results'),
  data => JSON.parse(data)
)

// const format = a => console.log(a)

const ROOT = 'https://api.themoviedb.org/3/search/movie'

exports.tmdb = (title, apikey) => {
  const query = compose(trim, replace(/\((19|20)\d{2}\)/g, ''))(title)
  const year = compose(head, match(/(19|20)\d{2}/g))(title)

  const params = compose(
    join('&'),
    map(([key, value]) => `${key}=${encodeURIComponent(value)}`),
    toPairs,
    filter(Boolean)
  )({ query, year })

  const URL = `${ROOT}?api_key=${apikey}&${params}`
  return request(URL).then(format)
}
