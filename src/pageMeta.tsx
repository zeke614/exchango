import { Helmet } from "react-helmet";

const META = {
  title: "exchango – Smart Currency Converter",
  description:
    "Convert currencies with real-time rates and a clean, mobile-first interface.",
  keywords:
    "currency converter, money exchange, exchango, exchange rates, convert currencies online",
  url: "https://exchangoio.vercel.app",
};

/**
 * Shared SEO tags.
 */
export function PageMeta() {
  return (
    <Helmet>
      <title>{META.title}</title>
      <meta name="description" content={META.description} />
      <meta name="keywords" content={META.keywords} />
      <meta name="author" content="exchango" />

      <meta property="og:title" content={META.title} />
      <meta property="og:description" content={META.description} />
      <meta property="og:type" content="website" />
      <meta property="og:url" content={META.url} />

      <meta name="twitter:card" content="summary" />
      <meta name="twitter:title" content={META.title} />
      <meta name="twitter:description" content={META.description} />

      <link rel="canonical" href={META.url} />
    </Helmet>
  );
}
