'use strict'

const debug = require('debug')('app:buildCommitMessage')

const config = require('./config')

const buildCommitMessage = function (title, description) {
  debug('Start')

  // Get keyword for breaking changes from config
  const noteKeyword = (config.parserOpts && config.parserOpts.noteKeywords)
    // noteKeywords can be string or array
    ? Array.isArray(config.parserOpts.noteKeywords) ? config.parserOpts.noteKeywords[0] : config.parserOpts.noteKeywords
    : 'BREAKING CHANGE'

  const message = {
    title: title.trim(),
    body: '',
    full: ''
  }

  let details = /(?:^#+|\n#+) +Details?([^]*?)(\n#+ |$)/i.exec(description)
  let breaking = /(?:^#+|\n#+) +Breaking(?: Changes?)?([^]*?)(\n#+ |$)/i.exec(description)
  let references = /(?:^#+|\n#+) +Ref(?:erences?)?([^]*?)(\n#+ |$)/i.exec(description)

  details = details ? details[1].trim() : ''
  if (breaking) {
    // Add BREAKING CHANGE only if there is more text
    breaking = breaking[1].trim() === '' ? '' : `${noteKeyword}: ${breaking[1].trim()}`
  } else {
    breaking = ''
  }
  references = references ? references[1].trim() : ''

  const spacer = '\n\n'
  message.body = `${details}${spacer}${breaking}${spacer}${references}`.trim()
  message.full = `${message.title}${spacer}${message.body}`.trim()

  debug('Extracted commit message:', message)

  return message
}

module.exports = buildCommitMessage
