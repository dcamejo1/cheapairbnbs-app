# Security Architecture

## Overview

This application has been designed with security-first principles, separating public API endpoints from administrative operations.

## API Security Model

### Public Endpoints (Safe for Production)

This endpoint is safe to expose publicly and is used by the frontend:

- `GET /api/cities/test` - Returns cached city data (read-only)

**Security Features:**

- ✅ Read-only operations
- ✅ No administrative capabilities
- ✅ Cache-based responses (fast, low resource usage)
- ✅ No external API calls triggered by users
- ✅ No expensive processing operations

### Administrative Operations (CLI Only)

All administrative functions have been moved to CLI scripts to prevent unauthorized access:

**Data Management:**

```bash
node scripts/hardPull.js pull          # Download CSV files
node scripts/hardPull.js pullMissing   # Download missing files
node scripts/hardPull.js status        # Check file status
node scripts/hardPull.js clear         # Clear local files
```

**Cache Management:**

```bash
node scripts/cacheManager.js repopulate    # Rebuild cache
node scripts/cacheManager.js updateMissing # Add missing cities
node scripts/cacheManager.js clear         # Clear cache
node scripts/cacheManager.js status        # Check cache status
```

## Security Benefits

1. **No Unauthorized Operations**: Users cannot trigger expensive operations like data downloads or cache rebuilds
2. **No Server Resource Abuse**: Administrative operations can only be run by authorized users with server access
3. **No External API Abuse**: Users cannot cause the server to make requests to external data sources
4. **Minimal Attack Surface**: Only 1 read-only endpoint is publicly accessible
5. **Controlled Deployments**: Data updates happen during deployment/maintenance windows

## Production Deployment Security

### Recommended Workflow

1. **Data Preparation (Offline):**

   ```bash
   node scripts/hardPull.js pull
   node scripts/cacheManager.js repopulate
   ```

2. **Deploy with Pre-built Data:**

   - Deploy application with cache files included
   - No runtime data fetching required
   - Frontend gets instant responses from cache

3. **Periodic Updates (Controlled):**
   ```bash
   # Run during maintenance windows
   node scripts/hardPull.js pullMissing
   node scripts/cacheManager.js updateMissing
   # Redeploy with updated cache
   ```

### Security Checklist

- [ ] Only authorized personnel can run CLI scripts
- [ ] Data updates happen in controlled environments
- [ ] Cache files are included in deployment artifacts
- [ ] No administrative API endpoints are exposed
- [ ] Rate limiting configured for public endpoints (recommended)
- [ ] HTTPS enforced in production (recommended)

## Removed Endpoints

The following endpoints were **removed for security**:

- ❌ `POST /api/data/hardpull` - Could trigger large downloads
- ❌ `POST /api/data/update` - Could clear cache and cause downtime
- ❌ `POST /api/data/pullMissing` - Could trigger external requests
- ❌ `GET /api/data/status` - Exposes internal system information
- ❌ `GET /api/cities/local` - **CRITICAL**: Could trigger expensive CSV processing, allowing DoS attacks

These operations are now only available via CLI scripts with proper access control.

### Why `/api/cities/local` Was Removed

The `/api/cities/local` endpoint was particularly dangerous because:

- 🚨 **Resource Intensive**: Processed all CSV files on every request
- 🚨 **DoS Vector**: Could be spammed to overwhelm server CPU/memory
- 🚨 **No Rate Limiting**: Unlimited expensive operations by any user
- 🚨 **Contradicts Security Model**: Allowed expensive operations despite removing admin endpoints

This endpoint has been replaced with CLI-based processing for authorized users only.
