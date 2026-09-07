// Relais SMTP factice : accepte tout, journalise le message brut recu.
// Sert a verifier ce qui part reellement sur le fil (en-tetes compris).
import net from 'node:net'
import tls from 'node:tls'
import fs from 'node:fs'

// Repertoire de travail passe par l'environnement : le harness est relogeable.
const DIR = process.env.SINK_DIR || '/tmp/pf-pentest'

const ctx = tls.createSecureContext({
  key: fs.readFileSync(`${DIR}/key.pem`),
  cert: fs.readFileSync(`${DIR}/cert.pem`),
})

const LOG = `${DIR}/messages.log`
fs.writeFileSync(LOG, '')

function handle(sock, secure) {
  let inData = false
  let buf = ''
  let msg = ''

  sock.setEncoding('utf8')
  const w = (s) => sock.write(s + '\r\n')

  sock.on('data', (chunk) => {
    buf += chunk
    let idx
    while ((idx = buf.indexOf('\r\n')) !== -1) {
      const line = buf.slice(0, idx)
      buf = buf.slice(idx + 2)

      if (inData) {
        if (line === '.') {
          inData = false
          fs.appendFileSync(LOG, '===== MESSAGE =====\n' + msg + '\n')
          msg = ''
          w('250 2.0.0 Ok: queued as FAKE')
        }
        else {
          msg += line + '\n'
        }
        continue
      }

      const cmd = line.split(' ')[0].toUpperCase()
      if (cmd === 'EHLO' || cmd === 'HELO') {
        if (secure) w('250-localhost\r\n250-AUTH PLAIN LOGIN\r\n250-8BITMIME\r\n250 SIZE 10485760')
        else w('250-localhost\r\n250-STARTTLS\r\n250-8BITMIME\r\n250 SIZE 10485760')
      }
      else if (cmd === 'STARTTLS') {
        w('220 2.0.0 Ready to start TLS')
        sock.removeAllListeners('data')
        const t = new tls.TLSSocket(sock, { isServer: true, secureContext: ctx })
        t.on('secure', () => handle(t, true))
        t.on('error', () => {})
        return
      }
      else if (cmd === 'AUTH') w('235 2.7.0 Authentication successful')
      else if (cmd === 'MAIL') w('250 2.1.0 Ok')
      else if (cmd === 'RCPT') w('250 2.1.5 Ok')
      else if (cmd === 'DATA') { inData = true; w('354 End data with <CR><LF>.<CR><LF>') }
      else if (cmd === 'QUIT') { w('221 2.0.0 Bye'); sock.end() }
      else if (cmd === 'RSET') w('250 2.0.0 Ok')
      else if (cmd === 'NOOP') w('250 2.0.0 Ok')
      else w('250 2.0.0 Ok')
    }
  })
  sock.on('error', () => {})
  if (!secure) w('220 localhost ESMTP FakeSink')
}

net.createServer(s => handle(s, false)).listen(2525, '127.0.0.1', () => {
  console.log('SMTP sink listening on 127.0.0.1:2525')
})
