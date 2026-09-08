<template>
  <main class="min-h-screen px-4 pt-10">
    <div class="container mx-auto max-w-3xl">
      <PageHeader title="Mentions légales" module="legal" />

      <div class="space-y-10 leading-relaxed text-ink-soft">
        <section>
          <h2 class="text-lg font-semibold text-ink">Éditeur du site</h2>
          <p class="mt-3">
            Fabien Lubin — entrepreneur individuel<br>
            Reims, France<br>
            <a href="mailto:contact@fabienlubin.fr" class="text-accent-700 hover:underline">
              contact@fabienlubin.fr
            </a>
          </p>
          <p class="mt-3 rounded-lg border border-accent-600/30 bg-accent-500/5 p-4 text-sm">
            <strong class="text-ink">À compléter :</strong> numéro SIREN/SIRET, adresse de
            l'établissement et, le cas échéant, numéro de TVA intracommunautaire.
            Ces mentions sont obligatoires pour un site professionnel
            (articles 6-III de la LCEN et L.123-1 du code de commerce).
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
            Le code source de ce site est publié sous licence libre et consultable sur
            <a
              href="https://github.com/MrCoolBay/newportfolio"
              target="_blank"
              rel="noopener noreferrer"
              class="text-accent-700 hover:underline"
            >GitHub</a>. Les visuels des réalisations client restent la propriété de
            leurs détenteurs respectifs et sont reproduits à titre de référence.
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
</script>
