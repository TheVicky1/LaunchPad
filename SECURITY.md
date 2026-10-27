# Security Policy

## Supported Versions

Security updates and patches are actively applied to the main development branch:

| Version | Supported          |
| ------- | ------------------ |
| `main`  | :white_check_mark: |

---

## Reporting a Vulnerability

If you discover a potential security vulnerability in LaunchPad, please **do not** open a public issue.

Instead, please report the vulnerability privately via GitHub Security Advisories or by emailing the project maintainers directly.

### What to Include
Please provide as much information as possible:
- A clear description of the vulnerability and its potential impact.
- Step-by-step instructions or proof-of-concept (PoC) code to reproduce the issue.
- Affected endpoints, components, or SQL policies.
- Any suggested remediations or mitigations.

### Response Timeline
- **Initial acknowledgment:** Within 48 hours.
- **Triage & severity assessment:** Within 5 business days.
- **Remediation release:** High and critical severity issues will be prioritized and resolved before any public disclosure.

---

## Security Principles & Standards
1. **Row Level Security (RLS):** All tenant data in PostgreSQL is governed by declarative RLS policies (`auth.uid() = user_id`).
2. **Zero Service-Role Secrets in Client:** The frontend bundle must never include the Supabase `service_role` key.
3. **Fail-Closed Authorization:** Missing or unverified credentials result in immediate HTTP 401 Unauthorized responses.
4. **Input Sanitization:** External URLs and opportunity descriptions are sanitized to prevent cross-site scripting (XSS) and malicious redirects.
