const request = require('request-promise-native')
const {
  compose,
  pick,
  head,
  propOr,
  map,
  join,
  toPairs,
  trim,
  replace,
  filter,
  match
} = require('ramda')

const format = pick([
  'title',
  'id',
  'original_title',
  'poster_path',
  'release_date',
  'overview'
])

const parse = compose(
  head,
  propOr([], 'results'),
  payload => JSON.parse(payload)
)

// const format = a => console.log(a)

const ROOT = 'https://api.themoviedb.org/3/search/movie'

exports.tmdb = (title, { apikey, language }) => {
  const query = compose(trim, replace(/\((19|20)\d{2}\)/g, ''))(title)
  const year = compose(head, match(/(19|20)\d{2}/g))(title)

  const params = compose(
    join('&'),
    map(([key, value]) => `${key}=${encodeURIComponent(value)}`),
    toPairs,
    filter(Boolean)
  )({ query, year, language })

  const URL = `${ROOT}?api_key=${apikey}&${params}`
  return request(URL).then(payload => {
    const match = parse(payload);
    return match ? format(match) : null;
  });
}
