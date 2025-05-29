#!/bin/sh

# Sets up the project by:
# 1. Copies the `.env.example` file to `.env` if it doesn't already exist.
# 2. Creates symlinks to `.env` in the apps that require it.
# 3. Builds all packages for apps to use.

cp -n .env.example .env

ln -sf "$(pwd)/.env" ./apps/learner/.env

pnpm bootstrap
