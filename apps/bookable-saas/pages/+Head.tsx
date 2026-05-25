export default function Head() {
  return (
    <>
      <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Bookable CRM</title>
      <script async src="https://www.googletagmanager.com/gtag/js?id=G-FRLGVZCV6C"></script>
      <script dangerouslySetInnerHTML={{ __html: `
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', 'G-FRLGVZCV6C');
      `}} />
    </>
  )
}
