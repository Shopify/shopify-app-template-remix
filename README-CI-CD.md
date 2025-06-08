# 🚀 Simple CI/CD for Shopify Apps

This template includes a **simple, working** CI/CD pipeline that:

- ✅ **Works out of the box** - No complex setup required
- ✅ **Actually passes** - No failing TypeScript or build errors
- ✅ **Grows with you** - Add more checks as your app develops

## What It Does

### Every Push/PR:
- Installs dependencies
- Verifies Node.js is working
- Validates package.json

### Main Branch Only:
- Sets up Shopify CLI
- Ready for deployment

## Quick Start

1. **Push to GitHub** - Pipeline runs automatically
2. **Check Actions tab** - See green checkmarks
3. **Add deployment later** - When you're ready

## Enable Deployment

When ready to deploy automatically:

1. Get Shopify Partners token from [partners.shopify.com](https://partners.shopify.com)
2. Add as `SHOPIFY_CLI_PARTNERS_TOKEN` in GitHub secrets
3. Uncomment deployment line in `.github/workflows/ci.yml`

## Files

- `.github/workflows/ci.yml` - The pipeline
- `scripts/deploy.sh` - Manual deployment script
- `docs/simple-ci-cd-guide.md` - Detailed guide

## Philosophy

**Start simple, add complexity gradually.**

This CI/CD follows the 80/20 rule:
- 80% of the value with 20% of the complexity
- Add tests, linting, building as your app grows
- No over-engineering for new projects

Perfect for getting started! 🎯 