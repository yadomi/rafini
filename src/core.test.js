/* global describe test expect */
const {
  removeBannedChars,
  removeBannedWords,
  removeFileExtension,
  formatEpisode,
  formatYear,
  refine
} = require('./core')

describe('removeBannedChars', () => {
  test('should return a string without exotic characters', () => {
    const testString2 = 'The.Player.2015.S01E06.FRENCH.HDTV.XViD-EXTREME'
    const testString3 =
      '[ www.CpasBien.cm ] Adopte.Un.Veuf.2016.FRENCH.BDRip.XViD-eVe.avi'

    expect(removeBannedChars(testString2)).toBe(
      'The Player 2015 S01E06 FRENCH HDTV XViDEXTREME'
    )
    expect(removeBannedChars(testString3)).toBe(
      'Adopte Un Veuf 2016 FRENCH BDRip XViDeVe avi'
    )
  })
})

describe('removeFileExtension', () => {
  test('should return a string without file extension at the end', () => {
    const testString1 = 'American.Made.2017.TRUEFRENCH.BDRip.XviD-GZR.avi'

    expect(removeFileExtension(testString1)).toBe(
      'American.Made.2017.TRUEFRENCH.BDRip.XviD-GZR'
    )
  })
})

describe('removeBannedWords', () => {
  test('should return a string without banned words from the dictionnay', () => {
    const testString1 = 'american made 2017 truefrench bdrip xvidgzr'
    expect(removeBannedWords(testString1)).toBe('american made 2017')
  })
})

describe('formatEpisode', () => {
  test('should return a string formatted as SXXEXX', () => {
    expect(formatEpisode('ep1s1')).toBe('S01E01')
    expect(formatEpisode('E1S1')).toBe('S01E01')
    expect(formatEpisode('E01S01')).toBe('S01E01')
    expect(formatEpisode('S1E3')).toBe('S01E03')
    expect(formatEpisode('s05ep06')).toBe('S05E06')
    expect(formatEpisode('S01E06')).toBe('S01E06')
  })
})

describe('formatYear', () => {
  test('should return a string with formatted year wrapped in bracket', () => {
    expect(formatYear('Spiderman 2017')).toBe('Spiderman (2017)')
    expect(formatYear('Back to the future 1985')).toBe(
      'Back to the future (1985)'
    )
    expect(formatYear('3000')).toBe('3000')
  })
})

describe('refine', () => {
  const raw = [
    'The.Player.2015.S01E06.FRENCH.HDTV.XViD-EXTREME',
    '[ Torrent9.red ] Lucifer.S03E05.FRENCH.HDTV.XviD-ZT.avi',
    '[ Torrent9.red ] Lucifer.S03E06.FRENCH.HDTVXviD-ZT.avi',
    'Contact.1997.MULTi.TRUEFRENCH.720p.HDLight.x264-BSD.mkv',
    'The.Dark.Tower.2017.MULTI.1080p.BluRay.x264.AC3-VENUE.mkv',
    'The.Other.Side.of.Hope.2017.MULTi.1080p.BluRay.DTS.x264-FiDELiO.mkv',
    'Interstellar.2014.1080p.BluRay.x264.DTS-RARBG',
    'The.Prestige.FRENCH.DVDRip.XviD-CRiMETiME',
    '[ Torrent9.tv ] Spider-Man.Homecoming.2017.MULTI.1080p.BluRay.x264-VENUE.mkv',
    '[ Torrent9.tv ] The.Wizard.Of.Lies.2017.FRENCH.HDRiP.XViD-STVFRV.avi',
    '[ Torrent9.tv ] War.for.the.Planet.of.the.Apes.2017.MULTi.1080p.BluRay.x264-LOST.mkv',
    '[ Torrent9.ws ] Arme.Fatale.1.DVDRIP.FRENCH.avi',
    '[ www.CpasBien.cm ] Adopte.Un.Veuf.2016.FRENCH.BDRip.XViD-eVe.avi',
    '[ www.CpasBien.cm ] Amis.Publics.2016.FRENCH.BDRip.XViD-FUNKKY.avi',
    '[ www.CpasBien.cm ] Bastille.Day.2016.TRUEFRENCH.BDRip.XViD-FUNKKY.avi',
    '[ www.CpasBien.cm ] Concussion.2015.FRENCH.BDRip.XviD-ViVi.avi',
    '[ www.CpasBien.cm ] Eye.in.the.Sky.2015.REPACK.FRENCH.BDRip.x264-SVR.mkv',
    '[ www.CpasBien.cm ] Five.2016.FRENCH.WEBRiP.XViD-eVe.avi',
    '[ www.CpasBien.cm ] Jem.and.the.Holograms.2015.FRENCH.BDRip.XviD-ViVi.avi',
    '[ www.CpasBien.cm ] Le.Grand.Partage.2015.FRENCH.BDRip.XviD-EXTREME.avi',
    '[ www.CpasBien.cm ] Le.Nouveau.2015.FRENCH.WEBRip.XviD-ViVi.avi',
    '[ www.CpasBien.cm ] Pension.Complete.2015.FRENCH.WEBRip.XVID-EVE.avi',
    '[ www.CpasBien.cm ] The.Trust.2016.FRENCH.BDRip.XviD-EXTREME.avi',
    '[ www.CpasBien.io ] Soda.Le.Reve.Americain.2015.FRENCH.HDTV.XviD-GODSPACE.avi',
    '[ www.CpasBien.pw ] Terminator.Genisys.2015.FRENCH.BDRip.XviD-GLUPS.avi',
    '[ www.Torrent9.Tv ] X-Men.Apocalypse.2016.FANSUB.VOSTFR.CROPPED.HDRiP.XviD-TeamSuW.avi',
    '[www.Cpasbien.me] About.Time.2013.TRUEFRENCH.DVDRIP.XviD-ArRoWs.avi',
    'American.Made.2017.TRUEFRENCH.BDRip.XviD-GZR.avi',
    'Pirates.Of.The.Caribbean.On.Stranger.Tides.2011.FRENCH.BDRiP.XViD-THENiGHTMARE.CD1.avi',
    'Pirates.Of.The.Caribbean.On.Stranger.Tides.2011.FRENCH.BDRiP.XViD-THENiGHTMARE.CD2.avi',
    'Steve.Jobs.2015.FRENCH.BDRip.XviD-ViVi.avi',
    'Suicide Squad Extended Multi (2016).mkv',
    'The.Imaginarium.of.Doctor.Parnassus.TRUEFRENCH.BRRip.XviD-CJS.avi',
    'The.Secret.Life.of.Pets.2016.MULTi.TRUEFRENCH.1080p.BluRay.x264-ULS.www.torrent9.ws.mkv',
    'Time.Lapse.2014.FRENCH.BDRip.XviD-EXTREME.www.Torrent9.TV.avi',
    'Upside.Down.2012.FRENCH.DVDRip.XviD.AC3-TMB.avi'
  ]

  const expected = [
    'The Player 2015 S01E06',
    'Lucifer S03E05',
    'Lucifer S03E06',
    'Contact (1997)',
    'The Dark Tower (2017)',
    'The Other Side of Hope (2017)',
    'Interstellar (2014)',
    'The Prestige',
    'Spiderman Homecoming (2017)',
    'The Wizard of Lies (2017)',
    'War for the Planet of the Apes (2017)',
    'Arme Fatale 1',
    'Adopte Un Veuf (2016)',
    'Amis Publics (2016)',
    'Bastille Day (2016)',
    'Concussion (2015)',
    'Eye in the Sky (2015)',
    'Five (2016)',
    'Jem and the Holograms (2015)',
    'Le Grand Partage (2015)',
    'Le Nouveau (2015)',
    'Pension Complete (2015)',
    'The Trust (2016)',
    'Soda Le Reve Americain (2015)',
    'Terminator Genisys (2015)',
    'Xmen Apocalypse (2016)',
    'About Time (2013)',
    'American Made (2017)',
    'Pirates of the Caribbean on Stranger Tides (2011)',
    'Pirates of the Caribbean on Stranger Tides (2011)',
    'Steve Jobs (2015)',
    'Suicide Squad (2016)',
    'The Imaginarium of Doctor Parnassus',
    'The Secret Life of Pets (2016)',
    'Time Lapse (2014)',
    'Upside Down (2012)'
  ]

  test('should refine filename', () => {
    for (const i in raw) {
      expect(refine(raw[i])).toBe(expected[i])
    }
  })
})
