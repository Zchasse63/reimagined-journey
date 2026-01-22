# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [0.1.0] - 2026-01-20

### Added
- Initial platform release with 156 city landing pages
- Multi-step lead capture form with validation
- Freight cost calculator with ZIP code mapping
- Market data display with charts (illustrative data)
- Supabase integration for lead storage
- Email subscription functionality
- SSR enabled for city pages with fresh data on each request
- API endpoints for lead submission and email subscriptions
- Historical trend charts for freight and diesel pricing
- Honeypot spam protection on lead forms
- Environment variable validation with Zod
- Comprehensive documentation suite in /Docs folder

### Security
- CSP headers configured in Netlify
- HTTPS redirect enabled
- Honeypot spam protection implemented
- Rate limiting infrastructure prepared (implementation pending)

### Infrastructure
- Netlify deployment with automatic previews
- Turborepo monorepo structure
- TypeScript strict mode enabled
- ESLint and Prettier configuration
- Playwright E2E test suite
- Supabase edge functions created (deployment pending)
