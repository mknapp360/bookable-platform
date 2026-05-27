export default function Head() {
  const title = 'AI Search Audit — Is your site AI-ready? | Bookable'
  const description =
    'Free AI search readiness audit for your website. Find out if AI assistants like ChatGPT, Perplexity and Claude can find and recommend your business.'

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="robots" content="index, follow" />
      <link rel="canonical" href="https://www.bookable.online/resources/ai-search-audit" />

      {/* Open Graph */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content="https://www.bookable.online/resources/ai-search-audit" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content="https://www.bookable.online/og-image.png" />
      <meta property="og:site_name" content="Bookable" />
      <meta property="og:locale" content="en_GB" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content="https://www.bookable.online/resources/ai-search-audit" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content="https://www.bookable.online/og-image.png" />
    </>
  )
}
