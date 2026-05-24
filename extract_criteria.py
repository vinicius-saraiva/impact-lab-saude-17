"""Extrai trechos com critérios de priorização/risco/vulnerabilidade dos manuais ACS."""
import re
import sys
import io
from pypdf import PdfReader

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")

# Termos que indicam critérios de priorização/risco para visita ACS
PATTERNS = [
    r"priori[zd]",
    r"risco",
    r"vulnerab",
    r"frequ[eê]ncia",
    r"periodicidade",
    r"mensal",
    r"trimestral",
    r"agravo",
    r"gestante",
    r"crian[çc]a.*menor",
    r"puerp",
    r"acamado",
    r"hipertens",
    r"diab[eé]t",
    r"tuberculos",
    r"hansen",
    r"idoso",
    r"desnutri",
    r"recém[- ]?nascido",
    r"rec[ée]m[- ]?nascido",
    r"alta hospitalar",
    r"micro[áa]rea",
    r"estratifica",
    r"classifica[çc][ãa]o de risco",
    r"famílias.*risco",
    r"escala.*risco",
    r"crit[eé]rio",
    r"casos novos",
    r"busca ativa",
    r"vigil[âa]ncia",
]
PAT = re.compile("|".join(f"({p})" for p in PATTERNS), re.IGNORECASE)

FILES = [
    "manuais/manual_acs.pdf",
    "manuais/guia_acs.pdf",
    "manuais/cartilha_acs_2014.pdf",
    "manuais/violencias_acs.pdf",
    "manuais/cancer_colo_mama.pdf",
]

def windows(text, kw_match, before=120, after=180):
    s = max(0, kw_match.start() - before)
    e = min(len(text), kw_match.end() + after)
    return text[s:e]

for f in FILES:
    print("=" * 80)
    print(f"### {f}")
    print("=" * 80)
    r = PdfReader(f)
    for i, page in enumerate(r.pages, start=1):
        try:
            txt = page.extract_text() or ""
        except Exception:
            continue
        # collapse whitespace
        txt_norm = re.sub(r"\s+", " ", txt)
        hits = list(PAT.finditer(txt_norm))
        if not hits:
            continue
        # Deduplicate by location bucket so we don't spam
        seen = set()
        for m in hits:
            bucket = m.start() // 80
            if bucket in seen:
                continue
            seen.add(bucket)
            snippet = windows(txt_norm, m).strip()
            print(f"[p.{i}] ...{snippet}...")
        print()
