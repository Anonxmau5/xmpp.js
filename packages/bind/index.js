'use strict'

const xml = require('@xmpp/xml')

/*
 * References
 * https://xmpp.org/rfcs/rfc6120.html#bind
 */

const NS = 'urn:ietf:params:xml:ns:xmpp-bind'

function makeBindElement(resource) {
  return xml('bind', {xmlns: NS}, resource && xml('resource', {}, resource))
}

function bind(entity, iqCaller, resource) {
  entity._status('binding')
  return iqCaller.set(makeBindElement(resource)).then(result => {
    const jid = result.getChildText('jid')
    entity._jid(jid)
    entity._status('bound')
    return jid
  })
}

function route({iqCaller}) {
  return function({entity}, next) {
    entity._status('bind')
    return (entity.isHandled('bind')
      ? entity.delegate('bind', resource => bind(entity, iqCaller, resource))
      : bind(entity, iqCaller)
    ).then(() => {
      return next()
    })
  }
}

module.exports = route
module.exports.makeBindElement = makeBindElement
module.exports.bind = bind
module.exports.streamFeature = function({iqCaller}) {
  return ['bind', NS, route({iqCaller})]
}
