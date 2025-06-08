# Simple CI/CD Setup Guide

## Quick Setup (1 minute)

### 1. Add GitHub Secret (Optional)

Go to your GitHub repository → **Settings** → **Secrets and variables** → **Actions**

Add this secret (only needed when you're ready to deploy):
```
SHOPIFY_CLI_PARTNERS_TOKEN = your_partners_token_here
```

### 2. That's it!

Your CI/CD pipeline will now:
- ✅ Install dependencies on every push/PR
- ✅ Verify Node.js is working
- ✅ Ready for deployment when you push to `main` branch

## What the Pipeline Does

### On Pull Requests:
- Installs dependencies (`yarn install`)
- Checks that Node.js is working
- Validates package.json

### On Push to Main Branch:
- Everything above, plus:
- Sets up Shopify CLI for deployment
- Shows deployment instructions

## Enable Deployment

When you're ready to deploy automatically:

1. Get your Shopify Partners token:
   - Go to [Shopify Partners Dashboard](https://partners.shopify.com/)
   - Navigate to **Apps** → **Your App** → **App setup**
   - Generate a **Partners API token**

2. Add the token as `SHOPIFY_CLI_PARTNERS_TOKEN` in GitHub secrets

3. Edit `.github/workflows/ci.yml` and uncomment this line:
   ```yaml
   # shopify app deploy --force
   ```

## Manual Deployment

You can also deploy manually:

```bash
# Set your token
export SHOPIFY_CLI_PARTNERS_TOKEN=your_token_here

# Run the deployment script
./scripts/deploy.sh
```

## Troubleshooting

**Pipeline fails?** Check the Actions tab in GitHub for error details.

**Dependencies fail?** Make sure your `package.json` is valid.

**Want more checks?** Add them gradually as your app grows.

That's it! Simple and it actually works. 🚀 