# Product Hunt Listing Verification Ledger Receipt — 2026-11-21

**Site / Service:** Product Hunt  
**Listing / Submit URL:** https://www.producthunt.com/products/sckrilla  
**Status:** prepared / blocked (needs-human)  
**Target Item:** `g-0025 verify the product hunt listing is live`  

---

## 1. Automated listing_verify Results

Verification attempt was run via `listing_verify` tool against Product Hunt:

| Target Host | Checked URL | Target Needle | Verdict / Tool Response | Status |
|---|---|---|---|---|
| `www.producthunt.com` | `https://www.producthunt.com/products/sckrilla` | `https://sckrilla.com` | `host_not_allowed` ("www.producthunt.com is not in this server's LISTING_VERIFY_HOSTS") | Blocked (unallowlisted host) |

---

## 2. External Human Action Required (NEEDS HUMAN)

1. **Allowlist Host:** Add `www.producthunt.com` to `LISTING_VERIFY_HOSTS` so automated checks can verify listing presence.
2. **Confirm Launch Status:** Verify manually if Product Hunt submission kit from `g-0021` has been posted by a human operator, and update receipt status once live.
