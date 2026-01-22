# Zeroshot Comprehensive Project Audit Prompt

## How to Run

```bash
# Run the audit (estimated: 20-40 minutes, $6-15)
zeroshot run "$(cat ZEROSHOT_AUDIT_PROMPT.md)"

# Or run in background
zeroshot run "$(cat ZEROSHOT_AUDIT_PROMPT.md)" -d

# Monitor progress
zeroshot list
zeroshot status <cluster-id>
zeroshot logs <cluster-id> -f
```

---

## THE PROMPT

Perform a comprehensive full-stack project audit of this codebase.
Do NOT modify any code - this is a research and audit task only.

### TASK CLASSIFICATION
This is a STANDARD:INQUIRY task - comprehensive research and analysis producing detailed documentation.

### CONTEXT
- This is an autonomous discovery audit - you must first map the entire codebase before analysis
- Technology stack will be discovered during Phase 0
- Goal: Create a complete picture of project state and roadmap to production

### PHASE 0: AUTONOMOUS DISCOVERY

Before any analysis, completely map the project structure.

**0.1 Project Root Analysis**
- Identify all configuration files (package.json, tsconfig, etc.)
- Determine if monorepo or single-app structure
- Document package manager, node version, primary language

**0.2 Complete Tech Stack Discovery**
Analyze package.json and imports to identify:
- Frontend: Framework, meta-framework, styling, UI library, state management
- Backend: Runtime, framework, API style, validation
- Database: Type, provider, ORM, migrations
- AI/ML: SDK, providers, tool calling, embeddings, vector DB
- Auth: Provider, methods
- External Services: Payment, email, storage, analytics, monitoring
- Infrastructure: Hosting, CI/CD, containerization

**0.3 Directory Structure Mapping**
- Generate complete tree of all directories (excluding node_modules, .git, etc.)
- Annotate each directory's purpose

**0.4 Document Inventory**
- Find ALL markdown, planning, and documentation files
- Categorize by status: Current, Outdated, Stale, Unknown
- Recommend action: Keep, Update, Archive, Delete

**0.5 Environment Configuration**
- Document all .env files and config files
- Create environment variable matrix with usage locations

### PHASE 1: COMPREHENSIVE AUDIT

**1.1 Database & Data Layer**
- Analyze schema (Prisma/Drizzle/Supabase)
- Document all tables with relationships and indexes
- Check data integrity, RLS policies, migration status
- Identify issues with severity

**1.2 API & Routing**
- Discover all API routes (App Router, Pages Router, Express, etc.)
- Document each endpoint: method, auth, validation, rate limiting, test status
- Check API completeness: error handling, CORS, versioning

**1.3 AI Tooling & SDK (CRITICAL)**
- Find all AI-related implementations
- Document providers, SDK versions, configurations
- Audit each tool: parameters, validation, error handling
- Check: API key security, rate limiting, cost monitoring, streaming, prompt injection protection

**1.4 Security**
- Map complete authentication flow
- Audit: password hashing, session management, CSRF, cookies
- Check authorization: RBAC, resource permissions
- Verify data protection: encryption, HTTPS, input sanitization
- Review infrastructure security: headers, dependencies, secrets

**1.5 UI/UX Completeness**
- Inventory all components
- Check each feature area: responsive, accessible, loading states, error states
- Document major user flows with entry points and edge cases

**1.6 Code Quality & Architecture**
- Assess organization, naming conventions, separation of concerns
- Check TypeScript strict mode, linting, formatting config
- Inventory technical debt and TODO/FIXME comments

**1.7 Testing Coverage**
- Find all test files and configurations
- Create coverage matrix by area
- List critical paths without tests

**1.8 Performance**
- Check image optimization, code splitting, lazy loading
- Assess database query efficiency, caching strategy
- Note Core Web Vitals status

**1.9 Deployment & DevOps**
- Document current deployment setup
- Check CI/CD, preview deployments, rollback procedures
- List what's missing for production

### PHASE 2: SYNTHESIS & ROADMAP

**2.1 Executive Summary**
- Calculate project health score (X/10) for each area
- Write 2-3 paragraph summary of current state

**2.2 Complete Issues Registry**
Compile ALL issues into prioritized list:
- CRITICAL (blocks production)
- HIGH (fix before production)
- MEDIUM (fix soon after production)
- LOW (nice to have)

Include: Area, Issue, Location, Effort estimate, Dependencies

**2.3 Document Cleanup Plan**
Table with: File, Action, Reason, Effort

**2.4 Research Tasks**
Topics requiring investigation before implementation

**2.5 Production Readiness Checklist**
- Must Have items
- Should Have items
- Nice to Have items

**2.6 Implementation Roadmap**
- Wave 1: Critical Fixes (Week 1)
- Wave 2: High Priority (Week 2-3)
- Wave 3: Production Prep (Week 4)
- Wave 4: Post-Launch (Week 5+)

### OUTPUT REQUIREMENTS

Create the following files in `docs/audit/`:

1. **AUDIT_SUMMARY.md** - Executive summary, health scores, current state overview
2. **ISSUES_REGISTRY.md** - Complete prioritized issues list with all details
3. **PRODUCTION_CHECKLIST.md** - Checklist for production readiness
4. **CLEANUP_PLAN.md** - Document cleanup recommendations
5. **IMPLEMENTATION_ROADMAP.md** - Sprint-ready task breakdown with phases

Each file should:
- Include file:line references for all findings
- Use tables for structured data
- Be immediately actionable for sprint planning
- Be brutally honest about the state of things

### SUCCESS CRITERIA
- All 5 output files created in docs/audit/
- Every directory in codebase examined and documented
- All issues include severity, location, and effort estimate
- Roadmap is specific enough for direct sprint planning
