---
title: "Factur-X : définition, fonctionnement et profils (MINIMUM, BASIC, EN 16931…)"
description: "Qu'est-ce qu'une facture Factur-X ? Un PDF/A-3 avec un XML EN 16931 intégré. Fonctionnement, différences entre les profils et lequel choisir pour la réforme française."
category: Factur-X
date: 2026-10-08
updated: 2026-10-26
---

**Factur-X est un format de facture électronique hybride** : un document PDF lisible par un humain, dans lequel est intégré un fichier XML structuré lisible par une machine. C'est l'un des trois formats acceptés par la réforme française de la facturation électronique, aux côtés d'UBL et de CII.

## Comment fonctionne une facture Factur-X ?

Une facture Factur-X se compose de deux couches dans un seul fichier :

1. **Une couche visuelle** : un PDF au standard **PDF/A-3**, la norme d'archivage longue durée qui autorise l'intégration de fichiers joints.
2. **Une couche de données** : un fichier XML nommé `factur-x.xml`, rédigé en syntaxe **CII** (Cross Industry Invoice, UN/CEFACT) et conforme à la norme européenne **EN 16931**.

Le destinataire peut donc ouvrir la facture comme n'importe quel PDF, tandis que son logiciel comptable lit directement le XML : numéro de facture, SIREN, lignes, taux de TVA, montants, échéance, IBAN… Fini la ressaisie.

Factur-X a été créé conjointement par le FNFE-MPE (France) et le FeRD (Allemagne). Il est techniquement identique au format allemand **ZUGFeRD** depuis la version 2.1 de ce dernier.

## Les 5 profils Factur-X

Un « profil » définit le niveau de détail des données présentes dans le XML.

| Profil | Contenu du XML | Valable pour la réforme française |
|---|---|---|
| MINIMUM | En-tête et totaux, sans lignes | Non |
| BASIC WL | En-tête, totaux et TVA, sans lignes | Non |
| BASIC | En-tête, totaux, TVA et lignes de facture | Oui |
| EN 16931 (ex-COMFORT) | Toutes les données de la norme européenne | Oui |
| EXTENDED | EN 16931 + données complémentaires (secteurs spécifiques) | Oui |

**À retenir** : les profils MINIMUM et BASIC WL ne contiennent pas le détail des lignes. Ils ne suffisent pas pour une facture conforme à la réforme. Pour une PME, le profil **BASIC** couvre la grande majorité des factures simples ; le profil **EN 16931** est recommandé dès que les factures comportent des remises, des frais ou des informations complémentaires.

## Factur-X, UBL ou CII : lequel choisir ?

- **Factur-X** est le plus simple à adopter pour une PME : la facture reste un PDF que tout le monde sait lire, et le XML garantit l'automatisation.
- **UBL** et **CII** sont des formats 100 % XML, sans représentation visuelle. Ils sont plutôt utilisés entre logiciels et par les grandes entreprises.

Le détail de la comparaison est dans notre article [Factur-X, UBL ou CII](/blog/factur-x-ubl-cii-differences).

## Comment créer une facture Factur-X ?

Trois options :

1. **Votre logiciel de facturation** l'exporte nativement (de plus en plus d'éditeurs le proposent).
2. **Votre plateforme agréée** convertit vos factures au moment de l'émission.
3. **Un convertisseur en ligne** comme FacturXPro transforme une facture PDF existante en Factur-X : l'IA extrait les données, génère le XML EN 16931 et l'intègre dans un PDF/A-3. Voir [le guide pas à pas](/blog/convertir-facture-pdf-en-factur-x).

## Questions fréquentes

### Comment savoir si un PDF est une facture Factur-X ?

Ouvrez-le dans un lecteur PDF qui affiche les pièces jointes (Adobe Acrobat Reader, par exemple) : une facture Factur-X contient un fichier joint nommé factur-x.xml. Les propriétés du document indiquent aussi la conformité PDF/A-3.

### Factur-X est-il obligatoire ?

Non, Factur-X n'est pas le seul format autorisé. La réforme impose un format structuré parmi Factur-X, UBL et CII. Factur-X est souvent le plus pratique pour les PME car il reste lisible comme un PDF classique.

### Quelle est la différence entre Factur-X et ZUGFeRD ?

Depuis ZUGFeRD 2.1, les deux formats sont techniquement identiques et partagent la même spécification. Factur-X est le nom utilisé en France, ZUGFeRD le nom utilisé en Allemagne.

### Quel profil Factur-X faut-il utiliser en 2026-2027 ?

Au minimum le profil BASIC, qui contient les lignes de facture. Le profil EN 16931 couvre l'intégralité de la norme européenne et convient à la plupart des cas plus complexes.
