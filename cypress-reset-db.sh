#!/bin/bash

# Cypress Database Reset Script
# This script resets the database for Cypress E2E testing

echo "🔄 Resetting database for Cypress tests..."

# Navigate to project root and run the reset command
cd /home/evanity/Projects/codeasy
./dc.sh artisan cypress:reset-db

echo "✅ Database reset completed!"
