# Ryvax.js Documentation Template

A production-oriented documentation site template built with **Ryvax.js**. It includes the framework's docs navigation, API explorer, interactive playgrounds, OpenAPI reference data, and a visual documentation shell.

## Development

```bash
npm install
npm run dev
```

The app runs on `http://localhost:3000`.

## Build

```bash
npm run lint
npm run build
```

The static output is generated in `dist/` and can be deployed to Vercel, GitHub Pages, or Netlify.

## Deployment

The repository includes GitHub Actions workflows for the three public deployment targets. Configure the repository secrets described in `.github/workflows/deploy-vercel.yml` and `.github/workflows/deploy-netlify.yml`; GitHub Pages uses the repository's Pages environment.

## License

This open-source template is distributed for use with Ryvax.js. Review the repository license before redistributing modified versions.
