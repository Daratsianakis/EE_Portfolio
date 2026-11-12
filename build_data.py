#!/usr/bin/env python3
"""Validate portfolio.json and generate browser-readable site_data.js."""
import json
from pathlib import Path
from urllib.parse import urlsplit

ROOT = Path(__file__).resolve().parent


def normalize_url(value):
    """Accept standard website addresses with or without a scheme."""
    if not isinstance(value, str):
        raise ValueError("URL must be text")
    value = value.strip()
    if not value:
        return ""
    if "://" not in value:
        if ":" in value.split("/", 1)[0]:
            raise ValueError("Unsupported URL scheme")
        value = "https://" + value
    parts = urlsplit(value)
    if parts.scheme not in ("https", "http") or not parts.hostname or any(c.isspace() for c in parts.netloc):
        raise ValueError("Enter a valid HTTP or HTTPS website address")
    return value

def main():
    path = ROOT / "portfolio.json"
    data = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(data, dict) or not all(key in data for key in ("profile", "projects", "links")):
        raise ValueError("portfolio.json must contain profile, projects, and links")
    if not isinstance(data["profile"], dict) or not isinstance(data["projects"], list) or not isinstance(data["links"], list):
        raise ValueError("Invalid portfolio data structure")
    for group in ("projects", "links"):
        for entry in data[group]:
            if not isinstance(entry, dict) or not isinstance(entry.get("name"), str):
                raise ValueError(f"Each {group} entry needs a name")
            for field in ("url", "source_url"):
                if field in entry:
                    try:
                        entry[field] = normalize_url(entry[field])
                    except ValueError as exc:
                        raise ValueError(f"Invalid {field} for {entry['name']}: {exc}") from exc
    payload = json.dumps(data, ensure_ascii=False, indent=2).replace("<", "\\u003c").replace("\u2028", "\\u2028")
    (ROOT / "site_data.js").write_text("window.PORTFOLIO_DATA = " + payload + ";\n", encoding="utf-8")
    print("Validated portfolio.json and generated site_data.js")

if __name__ == "__main__":
    main()
