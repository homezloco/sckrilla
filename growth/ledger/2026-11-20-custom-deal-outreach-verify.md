# Custom Deal Outreach Verification & Ledger Receipt — 2026-11-20

**Target Item:** `g-0024 verify the custom deal outreach status`  
**Status:** prepared / blocked (needs-human)  
**Date:** 2026-11-20  

---

## 1. Automated listing_verify Results

Verification attempt was run via `listing_verify` tool against custom deal target hostnames to check for backlink or partner page presence for `sckrilla.com`:

| Target Host | Checked URL | Target Needle | Verdict / Tool Response | Status |
|---|---|---|---|---|
| **Cursor (Anysphere)** | `https://cursor.com` | `sckrilla.com` | `host_not_allowed` ("cursor.com is not in this server's LISTING_VERIFY_HOSTS") | Blocked (unallowlisted host) |
| **Continue** | `https://continue.dev` | `sckrilla.com` | `host_not_allowed` ("continue.dev is not in this server's LISTING_VERIFY_HOSTS") | Blocked (unallowlisted host) |
| **CodeRabbit** | `https://coderabbit.ai` | `sckrilla.com` | `host_not_allowed` ("coderabbit.ai is not in this server's LISTING_VERIFY_HOSTS") | Blocked (unallowlisted host) |
| **GitHub** | `https://github.com` | `sckrilla.com` | `host_not_allowed` ("github.com is not in this server's LISTING_VERIFY_HOSTS") | Blocked (unallowlisted host) |

---

## 2. Affiliate Status Re-verification (`data/tools.json`)

| Tool Slug | Current Affiliate Status | Notes / Program Status |
|---|---|---|
| `cursor` | `na` | Referral program discontinued. Direct partnership outreach prepared; awaiting response/human follow-up. |
| `continue` | `na` | Ecosystem integration partner path; awaiting outreach response. |
| `coderabbit` | `na` | Direct referral / partner program; awaiting outreach response. |
| `github-copilot` | `na` | Enterprise B2B channel program; awaiting response. |

---

## 3. Human Action Required

1. **Allowlist Hosts:** Add `cursor.com`, `continue.dev`, `coderabbit.ai`, and `github.com` to `LISTING_VERIFY_HOSTS` if automated backlink presence checks are desired.
2. **Review Outreach Responses:** Check `partnerships@` / target mailboxes for responses to prepared outreach kits from `g-0012` / `g-0005`.
3. **Update Ledger & Tools Matrix:** When a custom referral code or tracked link is secured, update `data/tools.json` via `/admin` and record receipt status to `live`.
