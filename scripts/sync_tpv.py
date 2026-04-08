#!/usr/bin/env python3
"""
sync_tpv.py — Monthly TPV sync for TurnStay Sales HQ
Pulls last month + prev month client TPV from Metabase Q323 logic,
updates src/data/clients.json, commits and pushes.

Run: python3 scripts/sync_tpv.py
Cron: 1st of each month at 06:00 SAST
"""

import json
import csv
import subprocess
import sys
import requests
from datetime import date, timedelta
from dateutil.relativedelta import relativedelta
from pathlib import Path

# ── Config ────────────────────────────────────────────────────────────────────
METABASE_URL = "https://metabase.prod.turnstay.com"
METABASE_USER = "james@turnstay.com"
METABASE_PASS = "zszWjK58UIxgNJ"
CLIENTS_JSON = Path(__file__).parent.parent / "src" / "data" / "clients.json"
REPO_DIR = Path(__file__).parent.parent

# ── Helpers ───────────────────────────────────────────────────────────────────
def get_token():
    r = requests.post(f"{METABASE_URL}/api/session",
                      json={"username": METABASE_USER, "password": METABASE_PASS},
                      timeout=15)
    r.raise_for_status()
    return r.json()["id"]

def get_tpv_for_month(token: str, start: str, end: str) -> dict[str, float]:
    """Returns {company_name_lower: tpv_usd} for the given date range.
    Uses the same query as Metabase card 323 — includes segment 1 (successful txns only)
    plus an explicit date range filter for the target month.
    """
    payload = {
        "database": 2,
        "type": "query",
        "query": {
            "source-table": 54,
            "expressions": {
                "All transactions converted to USD ": ["/", ["*",
                    ["field", 655, {"base-type": "type/Integer"}],
                    ["field", 648, {"base-type": "type/Decimal"}]
                ], 100]
            },
            "breakout": [
                ["field", 412, {"base-type": "type/Text", "source-field": 651}],
                ["field", 651, {"base-type": "type/Integer"}]
            ],
            "aggregation": [["sum", ["expression", "All transactions converted to USD ",
                                     {"base-type": "type/Float"}]]],
            # Same filter as card 323: segment 1 (successful txns) + date range
            "filter": [
                "and",
                ["segment", 1],
                ["between",
                    ["field", 642, {"base-type": "type/DateTimeWithLocalTZ"}],
                    f"{start}T00:00:00", f"{end}T23:59:59"
                ]
            ],
            "order-by": [["desc", ["aggregation", 0]]]
        }
    }
    r = requests.post(f"{METABASE_URL}/api/dataset",
                      json=payload,
                      headers={"X-Metabase-Session": token},
                      timeout=30)
    r.raise_for_status()
    data = r.json()
    if "error" in data:
        raise RuntimeError(f"Metabase error: {data['error']}")
    result = {}
    for row in data["data"]["rows"]:
        name = (row[0] or "").strip()
        cid = int(row[1]) if row[1] else None
        tpv = float(row[2]) if row[2] else 0.0
        if cid:
            result[cid] = round(tpv, 2)
    return result  # {company_id: tpv_usd}

def fuzzy_match(client_name: str, mb_data: dict):
    """Try to match a client name to a Metabase company name."""
    cn = client_name.lower().strip()
    if cn in mb_data:
        return mb_data[cn]
    def clean(s):
        for suffix in [' travel', ' safaris', ' safari', ' tours', ' tour', ' lodge',
                       ' apartments and hotel', ' (pty)', ' pty ltd', ' ltd', ' inc',
                       ' guest house', ' hotel & spa', ' game reserve', ' boutique hotel']:
            s = s.replace(suffix, '')
        return s.strip()
    cn_c = clean(cn)
    for k, v in mb_data.items():
        k_c = clean(k)
        if cn_c == k_c:
            return v
        if len(cn_c) > 5 and (cn_c in k_c or k_c in cn_c):
            return v
    return None

def month_range(year: int, month: int) -> tuple[str, str]:
    start = date(year, month, 1)
    end = start + relativedelta(months=1) - timedelta(days=1)
    return start.isoformat(), end.isoformat()

def git_commit_push(msg: str):
    subprocess.run(["git", "-C", str(REPO_DIR), "add", "src/data/clients.json"], check=True)
    result = subprocess.run(
        ["git", "-C", str(REPO_DIR), "diff", "--cached", "--quiet"]
    )
    if result.returncode == 0:
        print("No changes to commit.")
        return False
    subprocess.run(["git", "-C", str(REPO_DIR), "commit", "-m", msg], check=True)
    subprocess.run(["git", "-C", str(REPO_DIR), "push"], check=True)
    return True

# ── Main ──────────────────────────────────────────────────────────────────────
def main():
    today = date.today()
    # Last month = current month - 1
    last_month = today.replace(day=1) - timedelta(days=1)
    prev_month = last_month.replace(day=1) - timedelta(days=1)

    last_start, last_end = month_range(last_month.year, last_month.month)
    prev_start, prev_end = month_range(prev_month.year, prev_month.month)

    last_label = last_month.strftime("%B %Y")
    prev_label = prev_month.strftime("%B %Y")

    print(f"Syncing: {last_label} vs {prev_label}")
    print("Authenticating with Metabase...")
    token = get_token()

    print(f"Fetching {last_label} TPV...")
    last_data = get_tpv_for_month(token, last_start, last_end)
    print(f"  → {len(last_data)} clients")

    print(f"Fetching {prev_label} TPV...")
    prev_data = get_tpv_for_month(token, prev_start, prev_end)
    print(f"  → {len(prev_data)} clients")

    print("Updating clients.json...")
    with open(CLIENTS_JSON) as f:
        clients = json.load(f)

    matched_last = 0
    matched_prev = 0
    assigned_ids_last = set()

    # Internal/non-client names to skip
    skip_names = {'turnstay salaries', 'ternstay uk invoices', 'rabia waggie'}

    for client in clients:
        name = client.get('name', '')
        acct = client.get('accountName', '')

        if name.lower() in skip_names:
            client['lastMonthTpv'] = 0
            client['prevMonthTpv'] = 0
            continue

        # Prefer ID-based matching (exact, no duplicates)
        mb_id = client.get('metabaseCompanyId')

        # Last month — by ID first, then fuzzy (first match wins per ID)
        if mb_id and mb_id in last_data and mb_id not in assigned_ids_last:
            client['lastMonthTpv'] = last_data[mb_id]
            assigned_ids_last.add(mb_id)
            matched_last += 1
        elif mb_id and mb_id in assigned_ids_last:
            client['lastMonthTpv'] = 0  # duplicate — zero out
        else:
            # Fallback fuzzy (for new clients not yet ID-mapped)
            val = fuzzy_match(name, {v['name'].lower(): v['tpv'] for v in last_data.values() if isinstance(v, dict)}) \
                  or fuzzy_match(acct, {v['name'].lower(): v['tpv'] for v in last_data.values() if isinstance(v, dict)})
            if val is not None:
                client['lastMonthTpv'] = val
                matched_last += 1
            else:
                client['lastMonthTpv'] = 0

        # Prev month — by ID (no dedup needed, just informational)
        if mb_id and mb_id in prev_data:
            client['prevMonthTpv'] = prev_data[mb_id]
            matched_prev += 1
        else:
            client['prevMonthTpv'] = 0

    print(f"  Matched {matched_last} clients for {last_label}")
    print(f"  Matched {matched_prev} clients for {prev_label}")

    with open(CLIENTS_JSON, 'w') as f:
        json.dump(clients, f, indent=2)

    # Totals
    total_last = sum(c.get('lastMonthTpv', 0) for c in clients)
    total_prev = sum(c.get('prevMonthTpv', 0) for c in clients)
    mom = ((total_last - total_prev) / total_prev * 100) if total_prev else 0
    print(f"\n  {last_label} Total TPV: ${total_last:,.0f}")
    print(f"  {prev_label} Total TPV: ${total_prev:,.0f}")
    print(f"  MoM: {mom:+.1f}%")

    commit_msg = f"Auto-sync: {last_label} vs {prev_label} TPV data"
    pushed = git_commit_push(commit_msg)
    if pushed:
        print(f"\n✅ Committed & pushed: {commit_msg}")
    else:
        print("\n✅ clients.json up to date, nothing to push.")

if __name__ == "__main__":
    main()
