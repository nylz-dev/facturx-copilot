---
title: "Factur-X, UBL ou CII : quelles différences et quel format choisir ?"
description: "Les trois formats de facture électronique acceptés en France comparés : structure, lisibilité, usage, compatibilité. Lequel choisir pour une PME, une TPE ou un indépendant."
category: Factur-X
date: 2026-10-22
updated: 2026-10-26
---

La réforme française de la facturation électronique accepte **trois formats** dits « socle » : **Factur-X**, **UBL** et **CII**. Tous trois respectent la norme européenne EN 16931. Leur différence tient surtout à la forme.

## Comparatif rapide

| | Factur-X | UBL | CII |
|---|---|---|---|
| Nature | Hybride : PDF/A-3 + XML | 100 % XML | 100 % XML |
| Lisible par un humain sans logiciel | Oui (c'est un PDF) | Non | Non |
| Lisible par un logiciel | Oui (XML CII intégré) | Oui | Oui |
| Origine | France / Allemagne (FNFE-MPE, FeRD) | OASIS (international) | UN/CEFACT (international) |
| Usage typique | PME, TPE, indépendants | Grandes entreprises, secteur public, réseau Peppol | Grandes entreprises, industrie |

## Factur-X : le choix pragmatique des PME

Factur-X est un PDF classique qui contient un fichier XML. Le client qui n'est pas encore équipé voit une facture normale ; celui qui est équipé l'intègre automatiquement en comptabilité. Pour une petite entreprise habituée au PDF, c'est la transition la plus douce. Voir [la définition détaillée et les profils](/blog/factur-x-definition-profils).

## UBL : le standard international

UBL (Universal Business Language) est très répandu à l'international et sur le réseau **Peppol**, utilisé pour les marchés publics dans de nombreux pays européens. C'est un fichier XML pur, sans visuel : il faut un logiciel pour l'afficher.

## CII : la syntaxe derrière Factur-X

CII (Cross Industry Invoice) est la syntaxe XML définie par l'UN/CEFACT. Le fichier XML intégré dans une facture Factur-X est justement un CII. Utilisé seul, c'est un format machine-à-machine, comme UBL.

## Comment choisir ?

- **Vous facturez depuis un PDF (Word, Excel, Canva, logiciel ancien)** : Factur-X, que vous pouvez obtenir en [convertissant vos PDF](/blog/convertir-facture-pdf-en-factur-x).
- **Votre logiciel de facturation exporte nativement un format** : utilisez celui qu'il propose, la plateforme agréée s'occupe de la transmission.
- **Vous travaillez avec des acheteurs publics ou à l'international** : vérifiez si UBL via Peppol est attendu.

Dans tous les cas, c'est la **[plateforme agréée](/blog/plateforme-agreee-pa-pdp-choisir)** qui transmet la facture au destinataire ; elle peut convertir d'un format à l'autre selon ses services.

## Questions fréquentes

### Quels sont les formats de facture électronique acceptés en France ?

Les trois formats socle sont Factur-X, UBL et CII. D'autres formats peuvent être acceptés par certaines plateformes agréées, mais ces trois-là doivent être supportés.

### Factur-X est-il meilleur que UBL ?

Aucun n'est meilleur dans l'absolu. Factur-X a l'avantage d'être lisible comme un PDF, ce qui facilite la transition pour les PME. UBL est plus répandu à l'international et sur Peppol.

### Peut-on envoyer une facture UBL à un client qui n'a pas de logiciel ?

Pas directement : un fichier UBL n'est pas lisible sans outil. Dans le cadre de la réforme, chaque entreprise reçoit ses factures via sa plateforme agréée, qui en propose une visualisation.
