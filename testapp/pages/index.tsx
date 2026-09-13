import type { PageModule } from '@kvantjs/ryvax.js';
import { App } from '../src/App.js';

export const revalidate = 60;

export const getStaticProps = async () => ({ title: 'High-performance SaaS' });

const page: PageModule<{ title: string }> = {
  default(props) {
    return <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>{props.title}</title>
        <link rel="stylesheet" href="/styles.css" />
      </head>
      <body>
        <div id="root"><App title={props.title} /></div>
        <script type="module" src="/_meu/static/client.js"></script>
      </body>
    </html>;
  }
};

export default page.default;
