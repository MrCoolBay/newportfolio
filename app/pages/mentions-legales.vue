<template>
  <main class="min-h-screen px-4 pt-10">
    <div class="container mx-auto max-w-3xl">
      <PageHeader title="Mentions légales" module="legal" />

      <div class="space-y-10 leading-relaxed text-ink-soft">
        <section>
          <h2 class="text-lg font-semibold text-ink">Éditeur du site</h2>
          <dl class="mt-4 space-y-3">
            <div v-for="row in publisher" :key="row.label" class="flex flex-col gap-1 sm:flex-row sm:gap-4">
              <dt class="w-56 shrink-0 font-mono text-sm text-ink-muted">{{ row.label }}</dt>
              <dd>
                <a
                  v-if="row.mailto"
                  :href="`mailto:${row.value}`"
                  class="text-accent-700 hover:underline"
                >{{ row.value }}</a>
                <span v-else>{{ row.value }}</span>
              </dd>
            </div>
          </dl>
          <p class="mt-4 text-sm">
            Les informations d'immatriculation, dont l'adresse du siège, sont
            consultables sur
            <a
              :href="`https://annuaire-entreprises.data.gouv.fr/entreprise/${SIREN}`"
              target="_blank"
              rel="noopener noreferrer"
              class="text-accent-700 hover:underline"
            >l'annuaire des entreprises</a>, service public de la DINUM.
          </p>
        </section>

        <section>
          <h2 class="text-lg font-semibold text-ink">Hébergement</h2>
          <p class="mt-3">
            Vercel Inc.<br>
            440 N Barranca Ave #4133, Covina, CA 91723, États-Unis<br>
            <a
              href="https://vercel.com"
              target="_blank"
              rel="noopener noreferrer"
              class="text-accent-700 hover:underline"
            >vercel.com</a>
          </p>
        </section>

        <section>
          <h2 class="text-lg font-semibold text-ink">Propriété intellectuelle</h2>
          <p class="mt-3">
            Le code source de ce site est publié sous licence MIT et consultable sur
            <a
              href="https://github.com/MrCoolBay/newportfolio"
              target="_blank"
              rel="noopener noreferrer"
              class="text-accent-700 hover:underline"
            >GitHub</a>. Cette licence ne couvre ni les contenus personnels ni les visuels
            des réalisations client, qui restent la propriété de leurs détenteurs
            respectifs et sont reproduits à titre de référence.
          </p>
        </section>

        <section>
          <h2 class="text-lg font-semibold text-ink">Données personnelles</h2>
          <p class="mt-3">
            Le formulaire de contact transmet votre nom, votre adresse e-mail et votre
            message par courrier électronique, dans le seul but de répondre à votre
            demande. Ces données ne sont ni stockées en base, ni cédées à un tiers.
            L'adresse IP de l'expéditeur est jointe au message pour permettre de
            traiter les abus.
          </p>
          <p class="mt-3">
            Vous pouvez demander l'accès, la rectification ou la suppression de ces
            données à l'adresse ci-dessus.
          </p>
        </section>

        <section>
          <h2 class="text-lg font-semibold text-ink">Cookies</h2>
          <p class="mt-3">
            Ce site ne dépose aucun cookie et n'utilise aucun outil de mesure
            d'audience ou de suivi publicitaire.
          </p>
        </section>
      </div>
    </div>
  </main>
</template>

<script setup>
useHead({ title: 'Mentions légales' })
// Page légale : sans intérêt pour l'indexation, mais elle doit rester atteignable.
useSeoMeta({ robots: 'noindex, follow' })

const SIREN = '988265195'

/**
 * L'adresse du siège n'est volontairement pas publiée : c'est une adresse
 * personnelle, et l'exposer sur une page web la rend directement moissonnable.
 * Le SIREN renvoie à l'annuaire officiel, où elle figure déjà — l'information
 * reste donc accessible à qui la cherche légitimement.
 */
const publisher = [
  { label: 'Éditeur', value: 'Fabien Lubin — Entrepreneur individuel (EI)' },
  { label: 'SIREN', value: '988 265 195' },
  { label: 'Activité (code APE)', value: '62.01Z — Programmation informatique' },
  { label: 'Immatriculation au RNE', value: '19 juin 2025' },
  { label: 'Contact', value: 'contact@fabienlubin.fr', mailto: true },
]
</script>
