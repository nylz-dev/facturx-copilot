import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Politique RGPD — FacturXPro',
  description: 'Politique de confidentialité et protection des données personnelles de FacturXPro. Conformité RGPD totale.',
};

export default function RGPD() {
  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <a href="/" className="text-blue-600 hover:text-blue-700 text-sm font-medium mb-8 inline-block">← Retour à l'accueil</a>
        <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Politique de confidentialité</h1>
        <p className="text-slate-500 mb-8">Conformité RGPD — Règlement (UE) 2016/679</p>

        <div className="prose prose-slate max-w-none space-y-8 text-slate-700">

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">1. Responsable du traitement</h2>
            <p>
              Le responsable du traitement des données est <strong>Dany Groizard</strong>, éditeur du site facturexpro.fr, joignable à l'adresse{' '}
              <a href="mailto:contact@facturexpro.fr" className="text-blue-600">contact@facturexpro.fr</a>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">2. Données collectées et traitées</h2>
            
            <h3 className="text-lg font-semibold text-slate-800 mb-2">2.1 Fichiers PDF de facturation</h3>
            <p>
              Lorsque vous déposez un fichier PDF sur notre service, ce fichier est transmis temporairement à notre API de traitement pour extraction des données de facturation (numéro de facture, montants, TVA, coordonnées vendeur/acheteur, IBAN).
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li><strong>Durée de conservation :</strong> Aucune. Le fichier est traité en mémoire et immédiatement supprimé après génération du fichier Factur-X.</li>
              <li><strong>Stockage :</strong> Zéro. Aucun fichier PDF ni donnée en étant extraite n'est stocké sur nos serveurs.</li>
              <li><strong>Base légale :</strong> Exécution d'un service à la demande de l'utilisateur (Art. 6.1.b RGPD).</li>
            </ul>

            <h3 className="text-lg font-semibold text-slate-800 mb-2 mt-4">2.2 Données de navigation</h3>
            <p>
              Comme tout site web, des données de navigation standard peuvent être collectées (adresse IP, navigateur, pages visitées) via les services d'hébergement (Vercel). Ces données sont anonymisées et agrégées.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">3. Sous-traitants et transferts</h2>
            <p>Notre service fait appel aux sous-traitants suivants :</p>
            <div className="overflow-x-auto mt-3">
              <table className="w-full text-sm border border-slate-200 rounded-lg overflow-hidden">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="text-left px-4 py-2 font-semibold text-slate-700">Prestataire</th>
                    <th className="text-left px-4 py-2 font-semibold text-slate-700">Rôle</th>
                    <th className="text-left px-4 py-2 font-semibold text-slate-700">Localisation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="px-4 py-2">Vercel Inc.</td>
                    <td className="px-4 py-2">Hébergement web</td>
                    <td className="px-4 py-2">USA (Clauses contractuelles types UE)</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2">Mistral AI</td>
                    <td className="px-4 py-2">Extraction IA des données de facturation</td>
                    <td className="px-4 py-2">France 🇫🇷</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">4. Vos droits</h2>
            <p>Conformément au RGPD, vous disposez des droits suivants :</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li><strong>Droit d'accès</strong> (Art. 15) — Obtenir une copie de vos données</li>
              <li><strong>Droit de rectification</strong> (Art. 16) — Corriger vos données inexactes</li>
              <li><strong>Droit à l'effacement</strong> (Art. 17) — Demander la suppression de vos données</li>
              <li><strong>Droit à la portabilité</strong> (Art. 20) — Récupérer vos données dans un format structuré</li>
              <li><strong>Droit d'opposition</strong> (Art. 21) — Vous opposer à certains traitements</li>
            </ul>
            <p className="mt-3">
              Pour exercer ces droits, contactez-nous à :{' '}
              <a href="mailto:contact@facturexpro.fr" className="text-blue-600">contact@facturexpro.fr</a>
            </p>
            <p className="mt-2">
              Vous avez également le droit de déposer une réclamation auprès de la <strong>CNIL</strong> :{' '}
              <a href="https://www.cnil.fr" className="text-blue-600" target="_blank" rel="noopener noreferrer">www.cnil.fr</a>
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">5. Cookies</h2>
            <p>
              Le site facturexpro.fr n'utilise pas de cookies de traçage ou publicitaires. Seuls des cookies techniques strictement nécessaires au fonctionnement du service peuvent être utilisés.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">6. Sécurité</h2>
            <p>
              Toutes les communications entre votre navigateur et nos serveurs sont chiffrées via HTTPS (TLS 1.3). Les fichiers transmis ne transitent pas en clair. Aucune donnée n'est conservée après traitement.
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
