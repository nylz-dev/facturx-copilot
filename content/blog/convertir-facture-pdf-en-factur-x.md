---
title: "Convertir une facture PDF en Factur-X : le guide pas à pas"
description: "Comment transformer une facture PDF (native ou scannée) en Factur-X conforme EN 16931 en 30 secondes, sans changer de logiciel. Étapes, vérifications et erreurs à éviter."
category: Tutoriel
date: 2026-10-15
updated: 2026-10-26
---

Vous facturez avec Word, Excel, Canva ou un vieux logiciel qui n'exporte que des PDF ? Vous pouvez quand même produire des factures **Factur-X**, le format hybride PDF + XML accepté par la réforme de la facturation électronique. Voici comment.

## Ce que fait la conversion

Convertir un PDF en Factur-X consiste à :

1. **Lire les données** de la facture : vendeur, client, SIREN, numéro, dates, lignes, TVA, totaux, IBAN.
2. **Générer un fichier XML** conforme à la norme européenne EN 16931 (syntaxe CII) avec ces données.
3. **Transformer le PDF en PDF/A-3** et y intégrer le XML sous le nom `factur-x.xml`, avec les métadonnées attendues.

Le résultat est un seul fichier PDF, visuellement identique à l'original, mais lisible par les logiciels comptables et les plateformes agréées.

## Méthode en 3 étapes avec FacturXPro

1. **Déposez votre facture PDF** sur [la page d'accueil](/#upload). Les PDF natifs comme les PDF scannés sont acceptés.
2. **L'IA extrait les données.** Le modèle de Mistral AI (entreprise française, serveurs en Europe) lit la facture et remplit chaque champ. Sur les offres payantes, vous pouvez vérifier et corriger les champs avant la génération.
3. **Téléchargez votre Factur-X.** Le fichier est généré en profil BASIC (EN 16931 sur les offres Pro et Cabinet). Rien n'est stocké sur nos serveurs.

L'offre Découverte permet de convertir **3 factures par mois gratuitement**.

## Les points à vérifier avant d'envoyer

- **SIREN du vendeur et du client** : indispensables pour l'acheminement de la facture.
- **Numéro de facture** : unique et chronologique.
- **Taux de TVA par ligne** : un taux mal lu fausse les totaux du XML.
- **Totaux HT, TVA et TTC** : ils doivent correspondre exactement entre le PDF et le XML.
- **Les [nouvelles mentions obligatoires](/blog/nouvelles-mentions-obligatoires-factures)** : adresse de livraison, nature des opérations, option TVA sur les débits.

## Les erreurs fréquentes

- **Utiliser un profil MINIMUM ou BASIC WL** : ces profils ne contiennent pas les lignes de facture et ne suffisent pas pour la réforme. Voir [les profils Factur-X](/blog/factur-x-definition-profils).
- **Modifier le PDF après la conversion** : toute modification invalide la cohérence entre le PDF et le XML. Régénérez le fichier.
- **Penser que le format suffit** : dans le cadre de la réforme, les factures B2B doivent aussi transiter par une [plateforme agréée](/blog/plateforme-agreee-pa-pdp-choisir).

## Et ensuite ?

Une fois votre facture au format Factur-X, vous pouvez l'envoyer à votre client, la transmettre à votre expert-comptable, ou la déposer sur votre plateforme agréée si elle accepte l'import de fichiers Factur-X. Pour les volumes importants, l'offre Cabinet donne accès à une **API REST** de conversion.

## Questions fréquentes

### Peut-on convertir gratuitement un PDF en Factur-X ?

Oui. FacturXPro permet de convertir 3 factures par mois gratuitement, sans inscription. Les offres payantes ajoutent la correction des champs, le profil EN 16931 et l'export XML séparé.

### Une facture scannée peut-elle devenir une facture Factur-X ?

Oui : la reconnaissance de caractères (OCR) de Mistral AI lit les factures scannées et en extrait les données. Il est conseillé de vérifier les montants après extraction.

### Le fichier Factur-X généré est-il conforme EN 16931 ?

Le XML est généré selon la spécification Factur-X 1.0 en profil BASIC, conforme à la norme EN 16931, et intégré dans un PDF/A-3.

### Mes factures sont-elles conservées ?

Non. Le traitement se fait en mémoire et les fichiers ne sont pas stockés après la conversion.
