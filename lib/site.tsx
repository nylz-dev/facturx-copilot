export const SITE_URL = 'https://facturexpro.fr';
export const SITE_NAME = 'FacturXPro';

export const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': `${SITE_URL}/#organization`,
  name: SITE_NAME,
  url: SITE_URL,
  logo: `${SITE_URL}/icon`,
  email: 'contact@facturexpro.fr',
  areaServed: 'FR',
};

export function JsonLd({ data }: { data: object }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}
