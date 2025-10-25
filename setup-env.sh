#!/bin/bash

# StacksLend Environment Setup Script
# This script helps you set up your .env.local file

echo "🚀 StacksLend Environment Setup"
echo "================================"
echo ""

# Check if .env.local.example exists
if [ ! -f .env.local.example ]; then
    echo "❌ .env.local.example not found!"
    echo "   This file should exist in the project root."
    exit 1
fi

# Check if .env.local already exists
if [ -f .env.local ]; then
    echo "⚠️  .env.local already exists!"
    read -p "Do you want to overwrite it? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ Setup cancelled."
        exit 1
    fi
fi

echo "📋 Choose setup option:"
echo "   1. Use example credentials (for testing)"
echo "   2. Enter your own Turnkey credentials"
echo ""
read -p "Enter choice (1 or 2): " -n 1 -r CHOICE
echo ""
echo ""

if [[ $CHOICE == "1" ]]; then
    # Copy example file as-is
    cp .env.local.example .env.local
    echo "✅ .env.local created with example credentials!"
    echo ""
    echo "⚠️  Note: Example credentials are for demonstration only."
    echo "   For production use, replace with your own Turnkey credentials."
    
elif [[ $CHOICE == "2" ]]; then
    echo "📋 You'll need the following from your Turnkey Dashboard:"
    echo "   1. Organization ID"
    echo "   2. Auth Proxy Config ID"
    echo ""
    echo "🔗 Get them from: https://app.turnkey.com"
    echo ""

    # Prompt for Organization ID
    read -p "Enter your Turnkey Organization ID: " ORG_ID
    if [ -z "$ORG_ID" ]; then
        echo "❌ Organization ID is required!"
        exit 1
    fi

    # Prompt for Auth Proxy Config ID
    read -p "Enter your Turnkey Auth Proxy Config ID: " AUTH_PROXY_ID
    if [ -z "$AUTH_PROXY_ID" ]; then
        echo "❌ Auth Proxy Config ID is required!"
        exit 1
    fi

    # Copy example file and replace credentials
    cp .env.local.example .env.local
    
    # Replace the Turnkey credentials (works on both macOS and Linux)
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        sed -i '' "s/NEXT_PUBLIC_TURNKEY_ORGANIZATION_ID=.*/NEXT_PUBLIC_TURNKEY_ORGANIZATION_ID=$ORG_ID/" .env.local
        sed -i '' "s/NEXT_PUBLIC_TURNKEY_AUTH_PROXY_CONFIG_ID=.*/NEXT_PUBLIC_TURNKEY_AUTH_PROXY_CONFIG_ID=$AUTH_PROXY_ID/" .env.local
    else
        # Linux
        sed -i "s/NEXT_PUBLIC_TURNKEY_ORGANIZATION_ID=.*/NEXT_PUBLIC_TURNKEY_ORGANIZATION_ID=$ORG_ID/" .env.local
        sed -i "s/NEXT_PUBLIC_TURNKEY_AUTH_PROXY_CONFIG_ID=.*/NEXT_PUBLIC_TURNKEY_AUTH_PROXY_CONFIG_ID=$AUTH_PROXY_ID/" .env.local
    fi
    
    echo ""
    echo "✅ .env.local file created with your credentials!"
else
    echo "❌ Invalid choice. Setup cancelled."
    exit 1
fi

echo ""
echo "📝 Next steps:"
echo "   1. Verify your Turnkey Auth Proxy Config has authentication methods enabled"
echo "   2. Add 'localhost:3000' to allowed domains in Turnkey dashboard"
echo "   3. Restart your development server: npm run dev"
echo ""
echo "📚 For more details, see ENVIRONMENT_SETUP.md"
echo ""
