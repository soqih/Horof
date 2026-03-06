# Deploy to GitHub Pages (Project Site)

Your app is configured for static export and GitHub Pages deployment.

## One-time setup

1. **Enable GitHub Pages** in your repo:
   - Go to **Settings** → **Pages**
   - Under **Build and deployment** → **Source**, select **Deploy from a branch**
   - Choose branch: **gh-pages** (or select it when it appears after first deploy)
   - Folder: **/ (root)**

2. **Push your code** to the `main` or `master` branch. The workflow will:
   - Build the app with the correct base path
   - Deploy the `out` folder to GitHub Pages

## Your live URL

After deployment, the app will be at:

```
https://<your-username>.github.io/<repo-name>/
```

Example: if your repo is `Horof`, the URL is `https://yourusername.github.io/Horof/`

## Local development

Run `npm run dev` as usual. The base path is empty locally, so the app works at `http://localhost:3000/`.

## If your repo has a different name

The workflow uses your repo name for the base path. If you rename the repo, no code changes are needed—the next deploy will use the new name.
