import type { PageModule } from '@kvantjs/ryvax.js';
import App from '../src/App.tsx';

export const getStaticProps = async () => ({});
const assetBase = process.env.GITHUB_ACTIONS === 'true' ? '/ryvax-docs-template' : '';

const page: PageModule = {
  default() {
    return (
      <html lang="en" className="dark">
        <head>
          <meta charSet="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Ryvax.js Developer Documentation</title>
          <meta name="description" content="The official Ryvax.js developer documentation interface with dark mode, interactive API explorer, and live code execution playgrounds, created with Kvant." />
          <meta property="og:title" content="Ryvax.js Developer Documentation" />
          <meta property="og:description" content="The official Ryvax.js developer documentation interface with dark mode, interactive API explorer, and live code execution playgrounds, created with Kvant." />
          <meta property="og:type" content="website" />
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link href="https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;500;600&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
          <link rel="stylesheet" href={`${assetBase}/styles.css`} />
        </head>
        <body className="bg-[#0a0a0a] text-neutral-100 antialiased selection:bg-neutral-800 selection:text-white dark">
          <div id="root"><App /></div>
          <script type="module" src={`${assetBase}/client.js`}></script>
        </body>
      </html>
    );
  }
};
export default page.default;
