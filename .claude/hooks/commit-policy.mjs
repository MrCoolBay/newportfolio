#!/usr/bin/env node
/**
 * PreToolUse — politique de messages de commit du dépôt.
 *
 * Règle : aucun trailer `Co-Authored-By`. Le propriétaire du dépôt ne veut pas
 * de co-auteur d'agent dans son historique git, jamais. Une consigne par défaut
 * de l'agent pousse à l'ajouter, donc on l'intercepte au lieu de compter sur
 * la mémoire.
 *
 * Couvre les commandes qui écrivent un message : commit (y compris --amend),
 * merge, tag annoté, revert, et la création/fusion de PR via gh.
 */
const WRITES_MESSAGE = /\bgit\s+(commit|merge|revert|tag)\b|\bgh\s+(pr|release)\s+(create|merge|edit)\b/

/**
 * Ancré en début de ligne (`^`, drapeau `m`), parce qu'un trailer git *est* en
 * début de ligne. Sans cette ancre, la règle bloque les commandes qui parlent
 * du trailer sans en écrire un — typiquement celle qui le *retire* d'un message
 * existant, ou un `grep` de vérification. Un garde-fou qui empêche de réparer
 * le problème qu'il surveille est inutilisable.
 */
const FORBIDDEN_TRAILER = /^[ \t]*co[-\s]?authored[-\s]?by[ \t]*:/im

function deny(reason) {
  process.stdout.write(JSON.stringify({
    hookSpecificOutput: {
      hookEventName: 'PreToolUse',
      permissionDecision: 'deny',
      permissionDecisionReason: reason,
    },
  }))
  process.exit(0)
}

let raw = ''
for await (const chunk of process.stdin) raw += chunk

let payload
try {
  payload = JSON.parse(raw || '{}')
}
catch {
  process.exit(0)
}

if (payload.tool_name !== 'Bash') process.exit(0)

const cmd = String(payload.tool_input?.command ?? '')

if (WRITES_MESSAGE.test(cmd) && FORBIDDEN_TRAILER.test(cmd)) {
  deny(
    `Commande bloquée : le message contient un trailer « Co-Authored-By ». `
    + `Ce dépôt n'en veut aucun dans son historique git. `
    + `Retire la ligne et relance la commande.`,
  )
}

process.exit(0)
