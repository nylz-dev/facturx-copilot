/**
 * Single source of truth for the canonical host and the marketing copy that
 * has to stay identical between the rendered page and the structured data
 * Google reads (a FAQ rich result is dropped if the two diverge).
 */

export const SITE_URL = 'https://www.facturexpro.fr';
export const SITE_NAME = 'FacturXPro';
export const CONTACT_EMAIL = 'contact@facturexpro.fr';

/** Réforme française : réception déjà obligatoire, émission PME/TPE au 1er septembre 2027. */
export const DEADLINE_RECEPTION = '2026-09-01';
export const DEADLINE_EMISSION_PME = '2027-09-01';

export const PLANS = {
  pro: { name: 'Pro', price: 19, quota: '100 conversions / mois' },
  cabinet: { name: 'Cabinet / API', price: 49, quota: 'Conversions illimitées' },
} as const;

export const FAQ: { q: string; a: string }[] = [
  {
    q: "Qu'est-ce que Factur-X ?",
    a: "Factur-X est un standard de facturation électronique hybride : un PDF lisible par l'humain avec un fichier XML structuré intégré, lisible par les logiciels comptables et compatible avec les plateformes de dématérialisation (PDP) de la réforme 2026-2027.",
  },
  {
    q: 'Quelles sont les dates de la réforme de la facturation électronique ?',
    a: "Depuis le 1er septembre 2026, toutes les entreprises françaises doivent être en capacité de recevoir des factures électroniques. L'obligation d'émettre s'applique aux grandes entreprises et ETI depuis cette même date, et s'étendra aux PME et TPE le 1er septembre 2027.",
  },
  {
    q: 'Mes données sont-elles sécurisées ?',
    a: "Le traitement est 100% éphémère : votre PDF est analysé en mémoire et jamais stocké. L'IA utilisée est Mistral AI, entreprise française dont les serveurs sont en Europe — conformité RGPD native, aucun transfert hors UE.",
  },
  {
    q: 'Mon ERP est-il compatible ?',
    a: "Le profil BASIC généré est compatible avec tous les ERP du marché (Sage, Cegid, EBP, Pennylane, etc.). FacturXPro convertit vos factures au format Factur-X — ce n'est pas une plateforme de dématérialisation (PDP) : vous transmettez ensuite le fichier via votre PDP ou votre expert-comptable.",
  },
  {
    q: 'Que faire si ma facture est scannée ?',
    a: "FacturXPro gère les PDFs scannés automatiquement grâce à Mistral OCR. Si votre PDF est une image, l'IA le lit quand même et extrait toutes les données. Aucun outil tiers nécessaire.",
  },
  {
    q: 'Les fichiers générés sont-ils réellement conformes ?',
    a: "Oui. Les fichiers produits sont validés PDF/A-3b par veraPDF (le validateur PDF/A de référence) et acceptés par Mustang, le validateur Factur-X/ZUGFeRD. FacturXPro vous avertit aussi lorsque votre PDF source empêche la conformité, par exemple si ses polices ne sont pas embarquées ou si le SIRET du vendeur est absent.",
  },
  {
    q: 'Puis-je corriger les données extraites ?',
    a: 'Oui, sur les plans Pro et Cabinet, vous pouvez vérifier et corriger chaque champ extrait avant de générer le fichier final.',
  },
];
