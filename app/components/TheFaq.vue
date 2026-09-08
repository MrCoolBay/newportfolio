<template>
  <section class="py-28">
    <h2 class="text-2xl font-bold text-ink">Questions fréquentes</h2>
    <div class="relative mt-4 h-px w-full bg-zinc-200">
      <div class="absolute inset-y-0 left-0 w-16 bg-accent-600" />
    </div>

    <!-- <details> plutôt qu'un accordéon en JavaScript : le contenu est dans le
         HTML initial, donc lisible par les moteurs et par un visiteur sans JS,
         et l'accessibilité clavier est celle du navigateur. -->
    <dl class="mt-10 divide-y divide-zinc-200 border-y border-zinc-200">
      <div v-for="item in faq" :key="item.question">
        <details class="group">
          <summary
            class="flex cursor-pointer items-center justify-between gap-4 py-5 text-left font-medium text-ink marker:content-none"
          >
            <dt>{{ item.question }}</dt>
            <Icon
              name="heroicons:plus"
              class="h-5 w-5 shrink-0 text-accent-600 transition-transform group-open:rotate-45"
            />
          </summary>
          <dd class="pb-5 leading-relaxed text-ink-soft">{{ item.answer }}</dd>
        </details>
      </div>
    </dl>
  </section>
</template>

<script setup>
/**
 * Le format question/réponse est celui que les moteurs génératifs reprennent le
 * plus volontiers : une question explicite suivie d'une réponse autoportante se
 * cite sans contexte supplémentaire.
 *
 * Aucun tarif n'est annoncé : les prix réels ne sont pas connus et inventer un
 * montant exposerait à une réclamation. « Sur devis » est exact.
 */
const faq = [
  {
    question: 'Quels types de projets prenez-vous en freelance ?',
    answer:
      "Sites vitrines, applications web métier, API, et applications mobiles iOS "
      + "et Android en React Native. Je prends aussi la reprise et la refonte d'un "
      + "site existant, ainsi que la mise en production et la sécurisation d'un "
      + 'projet déjà développé.',
  },
  {
    question: 'Intervenez-vous uniquement à Reims ?',
    answer:
      'Je suis basé à Reims et intervient sur place dans le Grand Est. Les '
      + 'missions à distance sont la norme et couvrent toute la France : le suivi '
      + "se fait par visio et par écrit, avec un accès à l'avancement en continu.",
  },
  {
    question: 'Combien coûte un site vitrine ?',
    answer:
      "Le prix dépend du nombre de pages, des fonctionnalités et de la fourniture "
      + 'des contenus. Le devis est gratuit et établi après un premier échange sur '
      + 'votre besoin, sans engagement.',
  },
  {
    question: 'Quels sont vos délais ?',
    answer:
      "Ils dépendent de la charge en cours et du périmètre. Un site vitrine se "
      + 'compte en semaines, une application métier en mois. Je donne une date '
      + 'ferme avec le devis plutôt qu\'une estimation optimiste.',
  },
  {
    question: 'Puis-je reprendre la main sur le site après la livraison ?',
    answer:
      'Oui. Le code vous appartient et vous est livré avec sa documentation de '
      + 'mise en route. Rien ne dépend d\'un abonnement ou d\'un outil propriétaire '
      + "de mon côté, et vous restez libre de changer de prestataire.",
  },
  {
    question: 'Travaillez-vous avec une stack imposée ?',
    answer:
      "Mon terrain principal est Vue.js / Nuxt côté front, Node.js ou FastAPI "
      + "côté serveur, et React Native pour le mobile. Si votre existant repose "
      + 'sur autre chose, on en parle avant : je préfère refuser une mission que '
      + 'la mener sur un terrain que je ne maîtrise pas.',
  },
]

// Le même contenu, exposé en données structurées pour les moteurs.
// `defineQuestion` prend une seule question : on en produit un nœud par entrée.
useSchemaOrg(
  faq.map(item => defineQuestion({
    name: item.question,
    acceptedAnswer: item.answer,
  })),
)
</script>
