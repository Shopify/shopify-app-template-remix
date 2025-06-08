#!/bin/bash

# Simple Shopify App Deployment Script

set -e

echo "🚀 Starting deployment..."

# Check if Shopify CLI token is set
if [ -z "$SHOPIFY_CLI_PARTNERS_TOKEN" ]; then
    echo "❌ Error: SHOPIFY_CLI_PARTNERS_TOKEN is not set"
    echo "Please set your Shopify Partners token:"
    echo "export SHOPIFY_CLI_PARTNERS_TOKEN=your_token_here"
    exit 1
fi

# Install Shopify CLI if needed
if ! command -v shopify &> /dev/null; then
    echo "📦 Installing Shopify CLI..."
    npm install -g @shopify/cli@latest
fi

# Build the app
echo "🔨 Building app..."
yarn build

# Deploy to Shopify
echo "🚀 Deploying to Shopify..."
shopify app deploy --force

echo "✅ Deployment completed!" 