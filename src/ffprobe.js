const { map, evolve, pick, groupBy, prop, compose } = require('ramda')

const ffprobe = require('ffprobe')

const format = compose(
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

exports.ffprobe = (filepath, ffprobepath) =>
  ffprobe(filepath, { path: ffprobepath }).then(format)
