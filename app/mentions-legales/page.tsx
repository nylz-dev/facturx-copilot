import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Mentions légales — FacturXPro',
  description: 'Mentions légales de FacturXPro, service de conversion Factur-X pour les PME françaises.',
};

export default function MentionsLegales() {
  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <a href="/" className="text-blue-600 hover:text-blue-700 text-sm font-medium mb-8 inline-block">← Retour à l'accueil</a>
        <h1 className="text-3xl font-extrabold text-slate-900 mb-8">Mentions légales</h1>

        <div className="prose prose-slate max-w-none space-y-8 text-slate-700">

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">1. Éditeur du site</h2>
            <p>Le site <strong>facturexpro.fr</strong> est édité par :</p>
            <ul className="list-none space-y-1 mt-2">
              <li><strong>Raison sociale :</strong> Dany Groizard</li>
              <li><strong>Forme juridique :</strong> Entrepreneur individuel</li>
              <li><strong>Email :</strong> <a href="mailto:contact@facturexpro.fr" className="text-blue-600">contact@facturexpro.fr</a></li>
              <li><strong>Pays :</strong> France</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">2. Hébergement</h2>
            <p>Le site est hébergé par :</p>
            <ul className="list-none space-y-1 mt-2">
              <li><strong>Société :</strong> Vercel Inc.</li>
              <li><strong>Adresse :</strong> 440 N Barranca Ave #4133, Covina, CA 91723, États-Unis</li>
              <li><strong>Site web :</strong> <a href="https://vercel.com" className="text-blue-600" target="_blank" rel="noopener noreferrer">vercel.com</a></li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">3. Propriété intellectuelle</h2>
            <p>
              L'ensemble des contenus présents sur le site facturexpro.fr (textes, graphiques, logo, icônes, images) est la propriété exclusive de l'éditeur, protégé par les lois françaises et internationales relatives à la propriété intellectuelle.
            </p>
            <p className="mt-2">
              Toute reproduction, représentation, modification, publication, adaptation de tout ou partie des éléments du site, quel que soit le moyen ou le procédé utilisé, est interdite, sauf autorisation écrite préalable de l'éditeur.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">4. Traitement des données</h2>
            <p>
              Les fichiers PDF déposés sur le site sont traités temporairement pour extraction des données de facturation via IA (Mistral AI). <strong>Aucun fichier n'est conservé après traitement.</strong> Pour plus d'informations, consultez notre <a href="/rgpd" className="text-blue-600">Politique RGPD</a>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">5. Responsabilité</h2>
            <p>
              L'éditeur s'efforce d'assurer au mieux de ses possibilités l'exactitude et la mise à jour des informations diffusées sur ce site. Cependant, l'éditeur ne garantit pas l'exactitude, la précision ou l'exhaustivité des informations mises à disposition sur ce site.
            </p>
            <p className="mt-2">
              Les fichiers Factur-X générés le sont à titre indicatif. Il appartient à l'utilisateur de vérifier la conformité des fichiers générés avec les exigences légales applicables à sa situation.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">6. Contact</h2>
            <p>
              Pour toute question relative aux présentes mentions légales, vous pouvez nous contacter à l'adresse suivante :{' '}
              <a href="mailto:contact@facturexpro.fr" className="text-blue-600">contact@facturexpro.fr</a>
            </p>
          </section>

          <p className="text-sm text-slate-400 pt-4 border-t border-slate-100">
            Dernière mise à jour : Mars 2026
          </p>
        </div>
      </div>
    </main>
  );
}
