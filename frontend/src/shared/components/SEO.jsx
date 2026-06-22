import { Helmet } from 'react-helmet-async';

export default function SEO({
  title,
  description,
  canonical,
  image = 'https://myflexio.com/logo.png',
  type = 'website',
  jsonLd,
}) {
  const fullTitle = title
    ? `${title} | MyFlexio`
    : 'MyFlexio | Online Fizyoterapi ve Egzersiz Platformu';

  const url = canonical || (typeof window !== 'undefined' ? window.location.href : 'https://myflexio.com/');

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />

      {/* Open Graph */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {/* JSON-LD */}
      {jsonLd && (
        <script type="application/ld+json">
          {JSON.stringify(jsonLd)}
        </script>
      )}
    </Helmet>
  );
}
