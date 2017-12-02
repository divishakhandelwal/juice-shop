const path = require('path')
const utils = require('../lib/utils')
const insecurity = require('../lib/insecurity')
const challenges = require('../data/datacache').challenges

exports = module.exports = function servePublicFiles () {
  return (req, res, next) => {
    const file = req.params.file
    const mdDebug = req.query.md_debug

    if (!file.includes('/')) {
      verify(file, res, next, mdDebug)
    } else {
      res.status(403)
      next(new Error('File names cannot contain forward slashes!'))
    }
  }

  function verify (file, res, next, mdDebug) {
    function verifySuccessfulPoisonNullByteExploit (file) {
      if (utils.notSolved(challenges.easterEggLevelOneChallenge) && file.toLowerCase() === 'eastere.gg') {
        utils.solve(challenges.easterEggLevelOneChallenge)
      } else if (utils.notSolved(challenges.directoryListingChallenge) && file.toLowerCase() === 'acquisitions.md') {
        utils.solve(challenges.directoryListingChallenge)
      } else if (utils.notSolved(challenges.forgottenDevBackupChallenge) && file.toLowerCase() === 'package.json.bak') {
        utils.solve(challenges.forgottenDevBackupChallenge)
      } else if (utils.notSolved(challenges.forgottenBackupChallenge) && file.toLowerCase() === 'coupons_2013.md.bak') {
        utils.solve(challenges.forgottenBackupChallenge)
      } else if (utils.notSolved(challenges.misplacedSignatureFileChallenge) && file.toLowerCase() === 'suspicious_errors.yml') {
        utils.solve(challenges.misplacedSignatureFileChallenge)
      }
    }

    function verifySuccessfulDebugParameterExploit () {
      if (utils.notSolved(challenges.forgottenBackupChallenge) && file.toLowerCase() === 'coupons_2013.md.bak') {
        utils.solve(challenges.forgottenBackupChallenge)
      }
    }

    function endsWithWhitelistedFileType (param) {
      return utils.endsWith(param, '.md') || utils.endsWith(param, '.pdf')
    }

    if (file && (endsWithWhitelistedFileType(file) || (file === 'incident-support.kdbx'))) {
      file = insecurity.cutOffPoisonNullByte(file)
      verifySuccessfulPoisonNullByteExploit(file)
      res.sendFile(path.resolve(__dirname, '../ftp/', file))
    } else if (file && mdDebug && utils.contains(file, '.md') && endsWithWhitelistedFileType(mdDebug)) {
      verifySuccessfulDebugParameterExploit(file)
      res.sendFile(path.resolve(__dirname, '../ftp/', file))
    } else {
      res.status(403)
      next(new Error('Only .md and .pdf files are allowed!'))
    }
  }
}
