#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
generate_audit.py

Fristående audit-generering för valda företag med verifierade domäner/hemsidor.

Syfte:
- Listar tillgängliga företag med verifierade domäner/hemsidor
- Låter användaren välja ett eller flera företag
- Genererar audit-rapporter med samma logik som 4_finalize.py

Användning:
    py generate_audit.py                          # Interaktivt val
    py generate_audit.py K856953-25               # Ett företag
    py generate_audit.py K856953-25 K856956-25    # Flera företag
    py generate_audit.py --date 20251113          # Specifikt datum
"""

import logging
import sys
import io
import argparse
from pathlib import Path
from typing import Dict, Any, List, Optional

import pandas as pd

# Fixa encoding för Windows-terminal
if sys.platform == "win32":
    try:
        if hasattr(sys.stdout, 'buffer') and (not isinstance(sys.stdout, io.TextIOWrapper) or getattr(sys.stdout, 'encoding', None) != 'utf-8'):
            sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace', line_buffering=True)
    except (AttributeError, OSError, ValueError):
        pass

# Lägg till shared-moduler i path
STEPS_DIR = Path(__file__).resolve().parent / "new_steps"
SHARED_DIR = STEPS_DIR / "shared"
if str(SHARED_DIR) not in sys.path:
    sys.path.insert(0, str(SHARED_DIR))

from utils import (  # noqa: E402
    get_latest_date_dir,
    setup_logging,
    find_company_dirs,
)

# OpenAI
try:
    from openai import OpenAI
except ImportError:
    OpenAI = None

# Cost tracker
try:
    from cost_tracker import CostTracker  # type: ignore[import]
except ImportError:
    CostTracker = None

# Importera audit-funktioner
try:
    from audit import run_audit_for_company, fetch_website_content, build_audit_prompt, analyze_with_ai, render_markdown, load_company_summary, extract_company_info_from_summary  # type: ignore[import]
except ImportError:
    # Fallback: ladda dynamiskt
    import importlib.util
    audit_module_path = SHARED_DIR / "audit.py"
    if audit_module_path.exists():
        spec = importlib.util.spec_from_file_location("audit_module", audit_module_path)
        if spec is None or spec.loader is None:
            raise ImportError(f"Kunde inte ladda spec för {audit_module_path}")
        audit_module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(audit_module)  # type: ignore
        run_audit_for_company = audit_module.run_audit_for_company
        fetch_website_content = audit_module.fetch_website_content
        build_audit_prompt = audit_module.build_audit_prompt
        analyze_with_ai = audit_module.analyze_with_ai
        render_markdown = audit_module.render_markdown
        load_company_summary = audit_module.load_company_summary
        extract_company_info_from_summary = audit_module.extract_company_info_from_summary
    else:
        print(f"Fel: audit.py hittades inte på: {audit_module_path}", file=sys.stderr)
        sys.exit(1)


INDUSTRY_FALLBACK_DOMAINS: Dict[str, List[str]] = {
    "sushi": [
        "sushibar.se",
        "sushiyama.se",
        "kaisushi.se",
        "sushigrossisten.se",
    ],
    "restaurang": [
        "restaurangassistans.se",
        "restauranglabbet.se",
        "restaurangakademien.se",
        "restaurangonline.se",
    ],
    "mat": [
        "matkomfort.se",
        "mathem.se",
        "matmissionen.se",
    ],
    "it": [
        "it-hjalpen.se",
        "itesk.se",
        "itkonsult.se",
        "itochenergi.se",
    ],
    "tech": [
        "techbuddy.se",
        "techposition.se",
    ],
    "bygg": [
        "byggmax.se",
        "bygghemma.se",
        "byggbolaget.com",
        "bygglogik.se",
    ],
    "entreprenad": [
        "entreprenad.com",
        "entreprenadakademin.se",
    ],
    "redovisning": [
        "redovisningsbyran.se",
        "redovisningstjanst.se",
        "ekonomiq.se",
    ],
    "ekonomi": [
        "ekonomipartner.se",
        "ekonomernas.se",
    ],
    "fysio": [
        "fysiocenter.se",
        "fysiokliniken.se",
    ],
    "hälsa": [
        "halsodeklaration.se",
        "halsopromotion.se",
    ],
    "vård": [
        "vardforetagarna.se",
        "vardhygien.se",
    ],
    "trafikskola": [
        "trafikskolan.se",
        "enstrafikskola.se",
        "korkortscenter.se",
    ],
}


def list_companies_with_domains(latest: Path, excel_file: Path, include_all: bool = False) -> List[Dict[str, Any]]:
    """Lista alla företag. Om include_all=False, bara de med verifierade domäner."""
    try:
        df = pd.read_excel(excel_file, sheet_name="Data")
    except Exception as e:
        logging.error(f"Kunde inte läsa Excel: {e}")
        return []
    
    companies = []
    company_dirs_map = {}
    
    # Bygg lookup för företagsmappar
    all_company_dirs = find_company_dirs(latest)
    for cd in all_company_dirs:
        company_dirs_map[cd.name] = cd
        if "-" in cd.name:
            alt_name = cd.name.replace("-", "/")
            company_dirs_map[alt_name] = cd
    
    # Gå igenom Excel och hitta företag
    for idx, row in df.iterrows():
        # Kolla om domän är aktiv
        domain_is_active = False
        if "domain_is_active" in row.index and pd.notna(row["domain_is_active"]):
            active_str = str(row["domain_is_active"]).lower()
            domain_is_active = active_str in ("true", "ja", "yes", "1")
        
        # Kolla sannolikhetsgrad
        domain_match_probability = 0.0
        prob_col = None
        for col in ["domain_match_probability", "Sannolikhetsgrad (%)"]:
            if col in row.index and pd.notna(row[col]):
                prob_col = col
                break
        
        if prob_col:
            try:
                prob_value = str(row[prob_col]).replace("%", "").strip()
                domain_match_probability = float(prob_value)
            except (ValueError, TypeError):
                pass
        
        # Hämta domän och URL
        domain_guess = ""
        domain_col = None
        for col in ["domain_guess", "Domän (gissad)", "Domän"]:
            if col in row.index and pd.notna(row[col]):
                domain_col = col
                break
        
        if domain_col:
            domain_guess = str(row[domain_col]).strip()
        
        final_url = ""
        if "final_url" in row.index and pd.notna(row["final_url"]):
            final_url = str(row["final_url"]).strip()
        elif domain_guess:
            # Skapa URL från domän om ingen final_url finns
            if not domain_guess.startswith("http"):
                final_url = f"https://{domain_guess}"
            else:
                final_url = domain_guess
        
        # Hitta företagsmapp
        mapp = str(row.get("Mapp", row.get("Kungörelse-id", ""))).strip().replace("/", "-")
        company_dir = company_dirs_map.get(mapp)
        if not company_dir:
            alt_mapp = mapp.replace("-", "/")
            company_dir = company_dirs_map.get(alt_mapp)
        
        if not company_dir:
            continue
        
        company_name = row.get("Företagsnamn", row.get("foretagsnamn", mapp))
        
        # Om include_all=True, inkludera alla företag (för liknande sajt-audit)
        if include_all:
            companies.append({
                "id": mapp,
                "name": company_name,
                "dir": company_dir,
                "domain": domain_guess or "Ingen",
                "final_url": final_url or "",
                "match_probability": domain_match_probability,
                "is_active": domain_is_active,
                "has_verified_domain": domain_is_active and domain_match_probability >= 0.04 and domain_guess,
            })
        else:
            # Bara inkludera företag med aktiv domän och sannolikhetsgrad >= 0.04 (4%)
            if domain_is_active and domain_match_probability >= 0.04 and domain_guess:
                companies.append({
                    "id": mapp,
                    "name": company_name,
                    "dir": company_dir,
                    "domain": domain_guess,
                    "final_url": final_url,
                    "match_probability": domain_match_probability,
                    "is_active": domain_is_active,
                    "has_verified_domain": True,
                })
    
    # Sortera efter sannolikhetsgrad (högst först), eller alfabetiskt om include_all
    if include_all:
        companies.sort(key=lambda x: (not x.get("has_verified_domain", False), x["name"]))
    else:
        companies.sort(key=lambda x: x["match_probability"], reverse=True)
    
    return companies


def interactive_company_selection(companies: List[Dict[str, Any]], similar_site_mode: bool = False) -> List[str]:
    """Interaktivt val av företag."""
    if similar_site_mode:
        print("\n" + "=" * 80)
        print("TILLGÄNGLIGA FÖRETAG (Audit på liknande sajt)")
        print("=" * 80)
        print(f"{'Nr':<4} {'ID':<20} {'Företagsnamn':<30} {'Domän':<25} {'Status':<15}")
        print("-" * 80)
        
        for idx, comp in enumerate(companies, 1):
            domain_display = comp['domain'][:23] if comp['domain'] != "Ingen" else "Ingen domän"
            status = "✓ Verifierad" if comp.get("has_verified_domain", False) else "Liknande sajt"
            print(f"{idx:<4} {comp['id']:<20} {comp['name'][:28]:<30} {domain_display:<25} {status:<15}")
    else:
        print("\n" + "=" * 80)
        print("TILLGÄNGLIGA FÖRETAG MED VERIFIERADE DOMÄNER/HEMSIDOR")
        print("=" * 80)
        print(f"{'Nr':<4} {'ID':<20} {'Företagsnamn':<30} {'Domän':<25} {'Sannolikhet':<12}")
        print("-" * 80)
        
        for idx, comp in enumerate(companies, 1):
            print(f"{idx:<4} {comp['id']:<20} {comp['name'][:28]:<30} {comp['domain'][:23]:<25} {comp['match_probability']:.1f}%")
    
    print("\nVälj företag (ange nummer separerade med komma, t.ex. 1,3,5 eller 'alla' för alla):")
    selection = input("> ").strip()
    
    if selection.lower() in ("alla", "all", "a"):
        return [comp["id"] for comp in companies]
    
    selected_ids = []
    for num_str in selection.split(","):
        num_str = num_str.strip()
        try:
            idx = int(num_str) - 1
            if 0 <= idx < len(companies):
                selected_ids.append(companies[idx]["id"])
            else:
                print(f"⚠️  Nummer {num_str} är utanför intervallet (1-{len(companies)})")
        except ValueError:
            print(f"⚠️  '{num_str}' är inte ett giltigt nummer")
    
    return selected_ids


def find_companies_by_ids(
    companies: List[Dict[str, Any]],
    company_ids: List[str]
) -> List[Dict[str, Any]]:
    """Hitta företag baserat på ID:n."""
    # Normalisera ID:n (hantera både K856953-25 och K856953/25)
    normalized_ids = set()
    for cid in company_ids:
        normalized_ids.add(cid.replace("/", "-"))
        normalized_ids.add(cid.replace("-", "/"))
        normalized_ids.add(cid)
    
    found_companies = []
    for comp in companies:
        comp_id = comp["id"]
        if (comp_id in normalized_ids or 
            comp_id.replace("/", "-") in normalized_ids or 
            comp_id.replace("-", "/") in normalized_ids):
            found_companies.append(comp)
    
    return found_companies


def analyze_company_profile(company_dir: Path, company_name: str, client: OpenAI, logger: logging.Logger) -> Dict[str, Any]:
    """Analysera företagets profil för att förstå bransch och verksamhet."""
    # Ladda sammanfattning
    summary_text = load_company_summary(company_dir)
    company_info = extract_company_info_from_summary(summary_text) if summary_text else {}
    
    verksamhet = company_info.get("verksamhet", "")
    sate = company_info.get("sate", "")
    
    # Skapa prompt för att analysera företagsprofil
    analysis_prompt = f"""Analysera detta företag och identifiera deras bransch, verksamhet och profil:

Företagsnamn: {company_name}
Verksamhet: {verksamhet}
Säte: {sate}

Sammanfattning:
{summary_text[:2000] if summary_text else "Ingen sammanfattning tillgänglig"}

Uppgift:
Identifiera och beskriv:
1. Bransch/industri (t.ex. "Bygg", "IT-konsultation", "E-handel")
2. Verksamhetsbeskrivning (vad gör företaget konkret)
3. Målgrupp (vem är deras kunder)
4. Geografisk marknad (lokalt, nationellt, internationellt)
5. Företagstyp (B2B, B2C, B2B2C)

Svara med JSON:
{{
  "industry": "",
  "business_description": "",
  "target_customers": "",
  "geography": "",
  "business_type": "",
  "keywords": []
}}
"""
    
    try:
        response = client.responses.create(
            model="gpt-5",
            input=analysis_prompt,
            reasoning={"effort": "low"},
            text={"verbosity": "low"},
            max_output_tokens=500,
        )
        
        text = getattr(response, "output_text", None) or ""
        
        # Parse JSON
        import json
        import re
        try:
            data = json.loads(text)
        except Exception:
            # Försök hitta JSON-block
            m = re.search(r"\{.*\}\s*$", text, flags=re.S)
            if m:
                data = json.loads(m.group(0))
            else:
                data = {}
        
        logger.info(f"  ✅ Profil analyserad: {data.get('industry', 'Okänt')} - {data.get('business_description', '')[:50]}")
        return data
    except Exception as e:
        logger.warning(f"  ⚠️  Kunde inte analysera profil: {e}")
        return {
            "industry": verksamhet or "Okänt",
            "business_description": verksamhet or "",
            "target_customers": "",
            "geography": sate or "",
            "business_type": "",
            "keywords": [],
        }


def find_similar_site(company_profile: Dict[str, Any], client: OpenAI, logger: logging.Logger, company_name: str = "", company_dir: Path = None) -> Optional[str]:
    """Sök efter en liknande sajt baserat på företagsprofil."""
    industry = company_profile.get("industry", "") or ""
    business_desc = company_profile.get("business_description", "") or ""
    
    # Om branschen är tom eller "Okänt", försök läsa direkt från content.txt
    if not industry or industry == "Okänt":
        if company_dir:
            content_file = company_dir / "content.txt"
            if content_file.exists():
                try:
                    content_text = content_file.read_text(encoding="utf-8", errors="ignore")
                    # Extrahera verksamhet från content.txt
                    for line in content_text.splitlines():
                        if "verksamhet:" in line.lower():
                            verksamhet = line.split(":", 1)[1].strip() if ":" in line else ""
                            if verksamhet:
                                business_desc = verksamhet
                                # Gissa bransch från verksamhet
                                verksamhet_lower = verksamhet.lower()
                                if any(word in verksamhet_lower for word in ["restaurang", "sushi", "mat", "café", "krog"]):
                                    industry = "Restaurang"
                                elif any(word in verksamhet_lower for word in ["it", "tech", "data", "system", "programmering"]):
                                    industry = "IT"
                                elif any(word in verksamhet_lower for word in ["bygg", "entreprenad", "grund"]):
                                    industry = "Bygg"
                                elif any(word in verksamhet_lower for word in ["redovisning", "ekonomi", "bokföring"]):
                                    industry = "Redovisning"
                                elif any(word in verksamhet_lower for word in ["fysio", "hälsa", "vård"]):
                                    industry = "Hälsa"
                                break
                except Exception:
                    pass
    
    # Om fortfarande tom, försök gissa från företagsnamn
    if not industry or industry == "Okänt":
        if company_name:
            name_lower = company_name.lower()
            if any(word in name_lower for word in ["restaurang", "sushi", "mat", "café", "krog"]):
                industry = "Restaurang"
            elif any(word in name_lower for word in ["it", "tech", "data", "system"]):
                industry = "IT"
            elif any(word in name_lower for word in ["bygg", "entreprenad", "grund"]):
                industry = "Bygg"
            elif any(word in name_lower for word in ["redovisning", "ekonomi", "bokföring"]):
                industry = "Redovisning"
            elif any(word in name_lower for word in ["fysio", "hälsa", "vård"]):
                industry = "Hälsa"
            else:
                industry = business_desc[:50] if business_desc else "Företag"  # Använd verksamhet som bransch-hint
    
    logger.info(f"  🔍 Söker efter liknande sajt inom branschen: {industry}...")
    
    search_prompt = f"""Hitta en svensk webbplats för ett företag som är liknande detta:

Bransch: {industry}
Verksamhet: {business_desc}
Målgrupp: {company_profile.get('target_customers', '')}
Geografi: {company_profile.get('geography', '')}

Uppgift:
Hitta en konkret svensk webbplats (domännamn) för ett liknande företag inom samma bransch och verksamhet.
Det ska vara ett faktiskt företag med en aktiv hemsida.

Svara ENDAST med domännamnet (t.ex. "exempel.se") utan http:// eller www.
Om du inte hittar någon, svara med "INGEN_HITTAD".
"""
    
    try:
        response = client.responses.create(
            model="gpt-5",
            tools=[{"type": "web_search"}],
            input=search_prompt,
            reasoning={"effort": "medium"},
            text={"verbosity": "low"},
            max_output_tokens=100,
        )
        
        text = getattr(response, "output_text", None) or ""
        domain = text.strip().replace("http://", "").replace("https://", "").replace("www.", "").split("/")[0]
        
        if domain and domain.upper() != "INGEN_HITTAD" and "." in domain:
            logger.info(f"  ✅ Hittade liknande sajt: {domain}")
            return domain
    except Exception as e:
        logger.warning(f"  ⚠️  Fel vid första sökningen: {e}")
    
    # Fallback: Hitta en generisk sajt inom branschen (t.ex. vilken sushirestaurang som helst)
    logger.info(f"  🔄 Försöker hitta generisk sajt inom branschen '{industry}'...")
    
    # Förenkla branschen för sökning (ta bort parenteser och extra info)
    industry_clean = industry.split("(")[0].strip() if "(" in industry else industry.strip()
    
    # Bygg en enklare och mer direkt prompt
    if "restaurang" in industry_clean.lower() or "sushi" in business_desc.lower() or "mat" in industry_clean.lower():
        fallback_prompt = """Hitta en svensk restaurang eller sushirestaurang med en aktiv hemsida.

Svara ENDAST med domännamnet (t.ex. "sushirestaurang.se" eller "restaurang.se") utan http:// eller www.
Exempel: "sushirestaurang.se", "sushibar.se", "restaurang.se", "mat.se"
"""
    elif "it" in industry_clean.lower() or "tech" in industry_clean.lower():
        fallback_prompt = """Hitta en svensk IT-företag eller teknikföretag med en aktiv hemsida.

Svara ENDAST med domännamnet (t.ex. "itföretag.se") utan http:// eller www.
"""
    elif "bygg" in industry_clean.lower() or "entreprenad" in industry_clean.lower():
        fallback_prompt = """Hitta en svensk byggföretag eller entreprenadföretag med en aktiv hemsida.

Svara ENDAST med domännamnet (t.ex. "byggföretag.se") utan http:// eller www.
"""
    else:
        # Generisk fallback
        fallback_prompt = f"""Hitta en svensk webbplats för ett företag inom branschen "{industry_clean}".

Det kan vara vilket svenskt företag som helst inom denna bransch med en aktiv hemsida.

Svara ENDAST med domännamnet (t.ex. "exempel.se") utan http:// eller www.
"""
    
    try:
        response = client.responses.create(
            model="gpt-5",
            tools=[{"type": "web_search"}],
            input=fallback_prompt,
            reasoning={"effort": "low"},
            text={"verbosity": "low"},
            max_output_tokens=100,
        )
        
        text = getattr(response, "output_text", None) or ""
        domain = text.strip().replace("http://", "").replace("https://", "").replace("www.", "").split("/")[0]
        
        if domain and "." in domain:
            logger.info(f"  ✅ Hittade generisk sajt inom branschen: {domain}")
            return domain
        else:
            logger.warning("  ⚠️  Kunde inte hitta någon sajt med första fallback-sökningen")
    except Exception as e:
        logger.warning(f"  ⚠️  Fel vid första fallback-sökning: {e}")
    
    # Sista försök: enkel sökning med nyckelord
    logger.info("  🔄 Sista försök: Söker efter svensk sajt med nyckelord...")
    if "restaurang" in industry_clean.lower() or "sushi" in business_desc.lower() or "mat" in industry_clean.lower():
        keywords = "svensk sushirestaurang"
    elif "it" in industry_clean.lower() or "tech" in industry_clean.lower():
        keywords = "svensk IT-företag"
    elif "bygg" in industry_clean.lower():
        keywords = "svensk byggföretag"
    else:
        keywords = f"svensk {industry_clean.lower() or 'verksamhet'}"
    
    final_prompt = f"""Hitta en svensk webbplats för: {keywords}

Svara ENDAST med domännamnet (t.ex. "exempel.se") utan http:// eller www.
"""
    
    try:
        response = client.responses.create(
            model="gpt-5",
            tools=[{"type": "web_search"}],
            input=final_prompt,
            reasoning={"effort": "low"},
            text={"verbosity": "low"},
            max_output_tokens=50,
        )
        
        text = getattr(response, "output_text", None) or ""
        domain = text.strip().replace("http://", "").replace("https://", "").replace("www.", "").split("/")[0].split("?")[0]
        
        if domain and "." in domain and len(domain) > 3:
            logger.info(f"  ✅ Hittade sajt med sista försöket: {domain}")
            return domain
    except Exception as e:
        logger.warning(f"  ⚠️  Fel vid sista försöket: {e}")
    
    # Absolut sista fallback: använd statisk lista per bransch
    logger.info("  🔄 Använder statisk fallback-lista för att hitta referenssajt...")
    fallback_domain: Optional[str] = None
    industry_lower = industry_clean.lower()
    business_lower = business_desc.lower()
    source_key = ""
    for key, domains in INDUSTRY_FALLBACK_DOMAINS.items():
        if key in industry_lower or key in business_lower:
            source_key = key
            seed = company_name or industry_clean or business_desc or key
            idx = abs(hash(seed)) % len(domains)
            fallback_domain = domains[idx]
            break
    if not fallback_domain:
        generic_domains = ["referensforetag.se", "svenskverksamhet.se", "exempelforetag.se"]
        seed = company_name or industry_clean or business_desc or "generic"
        idx = abs(hash(seed)) % len(generic_domains)
        fallback_domain = generic_domains[idx]
        source_key = "generisk"
    logger.info(f"  ✅ Statisk fallback använd: {fallback_domain} (nyckel: {source_key})")
    return fallback_domain


def run_audit_on_similar_site(
    company_dir: Path,
    company_name: str,
    company_profile: Dict[str, Any],
    similar_domain: str,
    audit_depth: str,
    model: str,
    client: OpenAI,
    logger: logging.Logger,
) -> Optional[Dict[str, Any]]:
    """Gör audit på en liknande sajt istället för företagets egen sajt."""
    logger.info(f"  🔍 Gör audit på liknande sajt: {similar_domain}")
    
    # Hämta innehåll från liknande sajt
    similar_url = f"https://{similar_domain}"
    website_content = fetch_website_content(similar_url)
    
    if not website_content:
        logger.warning(f"  ⚠️  Kunde inte hämta innehåll från {similar_domain}")
        return None
    
    # Ladda företagsinformation
    summary_text = load_company_summary(company_dir)
    company_info = extract_company_info_from_summary(summary_text) if summary_text else {}
    
    # Modifiera prompt för att tydligt markera att det är en liknande sajt
    depth_instructions = {
        "LOW": "Gör en snabb översikt. Fokusera på största problem och möjligheter.",
        "MEDIUM": "Gör en balanserad analys. Identifiera både styrkor och svagheter.",
        "HIGH": "Gör en djupgående analys. Var detaljerad och specifik med konkreta förbättringsförslag."
    }
    depth_guide = depth_instructions.get(audit_depth, depth_instructions["MEDIUM"])
    
    # Bygg modifierad prompt som tydligt markerar att det är en liknande sajt
    # Notera: Vi använder build_audit_prompt och modifierar sedan, eller skapar egen prompt
    custom_prompt = f"""Du är en senior Growth/SEO/UX-konsult. Analysera webbplatsen och företaget, och leverera ENDAST giltig JSON enligt schemat nedan.

⚠️ VIKTIGT: Denna audit görs på en LIKNANDE sajt ({similar_domain}), INTE på {company_name}s egen sajt.
Detta är en referensanalys för att visa hur en liknande sajt ser ut och fungerar.

FÖRETAGSINFORMATION (det företag som ska få audit):
- Företagsnamn: {company_name}
- Org.nr: {company_info.get('orgnr', '')}
- Verksamhet: {company_info.get('verksamhet', '')}
- Säte: {company_info.get('sate', '')}
- Bransch: {company_profile.get('industry', '')}
- Verksamhetsbeskrivning: {company_profile.get('business_description', '')}

LIKNANDE SAJT SOM ANALYSERAS:
- URL: {similar_url}
- Domän: {similar_domain}
- Titel: {website_content.get('title', '')}
- Beskrivning: {website_content.get('description', '')}
- Antal ord: {website_content.get('word_count', 0)}
- Rubriker: {', '.join(website_content.get('headings', [])[:5])}
- Textförhandsvisning: {website_content.get('text_preview', '')[:1000]}

UPPGIFT:
{depth_guide}

Analysera den liknande sajten och bedöm:
1. Hur väl fungerar denna liknande sajt för branschen?
2. Vad kan {company_name} lära sig från denna sajt?
3. Tekniska aspekter: SEO, UX, innehåll, prestanda, tillgänglighet
4. Konkreta förbättringar som {company_name} kan implementera baserat på denna referens

⚠️ MARKERA TYDLIGT I ANALYSEN att detta är en referensanalys av en liknande sajt, INTE {company_name}s egen sajt.

LEVERERA JSON MED FÖLJANDE FORM:
{{
  "audit_type": "similar_site_reference",
  "target_company": "{company_name}",
  "analyzed_site": "{similar_domain}",
  "company_profile": {{
    "domain": "{similar_domain}",
    "industry": "{company_profile.get('industry', '')}",
    "offerings": [],
    "value_props": [],
    "target_customers": [],
    "stage_guess": "",
    "geography": []
  }},
  "audit_scores": {{
    "seo": 0,
    "technical_seo": 0,
    "ux": 0,
    "ia": 0,
    "content": 0,
    "performance": 0,
    "accessibility": 0
  }},
  "strengths": [],
  "issues": [],
  "improvements": {{
    "quick_wins": [{{"item": "", "impact": "high|medium|low", "effort": "low|medium|high", "why": "", "how": ""}}],
    "roadmap": [{{"item": "", "why": "", "how": ""}}]
  }},
  "projected_impact": {{
    "traffic_uplift_pct_range": [min, max],
    "conv_rate_uplift_pct_range": [min, max],
    "monthly_revenue_uplift_estimate": {{
      "low": 0,
      "high": 0,
      "currency": "SEK",
      "assumptions": {{"baseline_sessions": 0, "current_conv_rate": 0.0, "avg_order_value": 0.0}}
    }}
  }},
  "pitch": {{
    "headline": "",
    "summary": "",
    "next_steps": [""]
  }},
  "similar_site_note": "Denna audit är gjord på en liknande sajt ({similar_domain}) som referens för {company_name}. Detta är INTE {company_name}s egen sajt."
}}
"""
    
    # Analysera med AI - använd custom prompt istället för standard
    # Vi behöver anropa OpenAI direkt eftersom analyze_with_ai använder build_audit_prompt
    try:
        response = client.responses.create(
            model=model,
            tools=[{"type": "web_search"}],
            reasoning={"effort": {"LOW": "low", "MEDIUM": "medium", "HIGH": "high"}.get(audit_depth, "medium")},
            input=custom_prompt,
        )
        
        text = getattr(response, "output_text", None) or ""
        
        # Parse JSON
        import json
        import re
        try:
            audit = json.loads(text)
        except Exception:
            # Försök hitta JSON-block
            m = re.search(r"\{.*\}\s*$", text, flags=re.S)
            if m:
                audit = json.loads(m.group(0))
            else:
                audit = None
        
        if not audit:
            logger.warning("  ⚠️  Kunde inte generera audit för liknande sajt")
            return None
        
        # Lägg till kostnadsinfo
        usage = getattr(response, "usage", None) or {}
        try:
            in_tok = int(getattr(usage, "input_tokens", usage.get("input_tokens", 0)))
            out_tok = int(getattr(usage, "output_tokens", usage.get("output_tokens", 0)))
        except Exception:
            in_tok = out_tok = 0
        
        # Importera estimate_cost_sek från audit-modulen
        import os
        usd_to_sek = float(os.getenv("USD_TO_SEK", "11.0"))
        in_price_per_mtok = float(os.getenv("OPENAI_PRICE_IN_PER_MTOK_USD", "1.25"))
        out_price_per_mtok = float(os.getenv("OPENAI_PRICE_OUT_PER_MTOK_USD", "10.0"))
        
        usd_cost = (in_tok * in_price_per_mtok + out_tok * out_price_per_mtok) / 1_000_000
        sek_cost = usd_cost * usd_to_sek
        
        audit["cost"] = {
            "sek": round(sek_cost, 2),
            "usd": round(usd_cost, 4),
            "input_tokens": in_tok,
            "output_tokens": out_tok,
        }
        
        # Lägg till metadata om att det är en liknande sajt
        audit["audit_type"] = "similar_site_reference"
        audit["target_company"] = company_name
        audit["analyzed_site"] = similar_domain
        audit["similar_site_note"] = f"Denna audit är gjord på en liknande sajt ({similar_domain}) som referens för {company_name}. Detta är INTE {company_name}s egen sajt."
    except Exception as e:
        logger.warning(f"  ⚠️  Fel vid AI-analys: {e}")
        return None
    
    # Spara audit
    audit_dir = company_dir / "site_audit"
    audit_dir.mkdir(exist_ok=True, parents=True)
    
    # JSON
    import json
    audit_file = audit_dir / "site_audit.json"
    audit_file.write_text(
        json.dumps(audit, ensure_ascii=False, indent=2),
        encoding="utf-8"
    )
    
    # Markdown - modifiera för att tydligt visa att det är en liknande sajt
    md_content = render_markdown(audit, similar_domain, company_name)
    
    # Lägg till varning högst upp
    warning_header = f"""# ⚠️ REFERENSAUDIT - LIKNANDE SAJT

**VIKTIGT:** Denna audit är gjord på en liknande sajt ({similar_domain}) som referens för {company_name}.
Detta är **INTE** {company_name}s egen sajt.

**Analyserad sajt:** {similar_url}
**Företag som ska få audit:** {company_name}
**Bransch:** {company_profile.get('industry', 'Okänt')}

---

"""
    
    md_content = warning_header + md_content
    
    md_file = audit_dir / "site_audit.md"
    md_file.write_text(md_content, encoding="utf-8")
    
    return audit


def main():
    """Huvudfunktion."""
    parser = argparse.ArgumentParser(
        description="Generera audit-rapporter för valda företag med verifierade domäner",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Exempel:
  py generate_audit.py                          # Interaktivt val
  py generate_audit.py K856953-25               # Ett företag
  py generate_audit.py K856953-25 K856956-25    # Flera företag
  py generate_audit.py --date 20251113          # Specifikt datum
        """
    )
    parser.add_argument(
        "company_ids",
        nargs="*",
        help="Företags-ID:n (t.ex. K856953-25). Om inget anges blir det interaktivt val."
    )
    parser.add_argument(
        "--date",
        type=str,
        help="Specifikt datum att använda (format: YYYYMMDD, t.ex. 20251113). Om inte angivet används senaste datummapp."
    )
    parser.add_argument(
        "--depth",
        type=str,
        choices=["LOW", "MEDIUM", "HIGH"],
        default="MEDIUM",
        help="Audit-djup (LOW, MEDIUM, HIGH). Default: MEDIUM"
    )
    parser.add_argument(
        "--model",
        type=str,
        default="gpt-5",
        help="AI-modell att använda för audit. Default: gpt-5"
    )
    parser.add_argument(
        "--similar-site",
        action="store_true",
        help="Gör audit på en liknande sajt istället för företagets egen sajt. Analyserar företaget och söker upp liknande företag/sajter baserat på bransch och verksamhet."
    )
    
    args = parser.parse_args()
    
    # Interaktiv fråga om --similar-site inte är angivet
    if not args.similar_site:
        print("\n" + "=" * 80)
        print("VÄLJ AUDIT-LÄGE")
        print("=" * 80)
        print("1. Normal audit (på företagets egen verifierade domän/hemsida)")
        print("2. Audit på liknande sajt (referensanalys baserat på bransch/verksamhet)")
        print("\nVälj läge (1 eller 2):")
        choice = input("> ").strip()
        
        if choice == "2":
            args.similar_site = True
            print("✓ Valde: Audit på liknande sajt\n")
        elif choice == "1":
            print("✓ Valde: Normal audit\n")
        else:
            print("⚠️  Ogiltigt val, använder normal audit som standard\n")
    
    # Setup logging
    root = Path(__file__).resolve().parent
    logger = setup_logging(root / "djupanalys", "generate_audit")
    
    logger.info("=" * 60)
    logger.info("AUDIT-GENERERING FÖR VALDA FÖRETAG")
    logger.info("=" * 60)
    logger.info(f"Arbetsmapp: {root}")
    
    if not OpenAI:
        logger.error("OpenAI-bibliotek saknas. Installera med: pip install openai")
        return 1
    
    # Hitta datummapp
    djupanalys = root / "djupanalys"
    if not djupanalys.exists():
        logger.error("Ingen mapp 'djupanalys' hittades.")
        return 1
    
    if args.date:
        # Använd specifikt datum
        latest = djupanalys / args.date
        if not latest.exists():
            logger.error(f"Datummapp {args.date} finns inte.")
            return 1
    else:
        # Använd senaste datummapp
        latest = get_latest_date_dir(djupanalys)
        if not latest:
            logger.error("Inga dagsmappar hittades i djupanalys/.")
            return 1
    
    logger.info(f"Bearbetar: {latest.name}")
    
    # Ladda Excel-data
    excel_file = next(latest.glob("kungorelser_*.xlsx"), None)
    if not excel_file or not excel_file.exists():
        logger.error("Excel-fil saknas: kungorelser_*.xlsx")
        return 1
    
    logger.info(f"Laddar Excel-data från: {excel_file.name}")
    
    # Lista företag - om similar_site används, visa alla företag
    companies = list_companies_with_domains(latest, excel_file, include_all=args.similar_site)
    
    if args.similar_site:
        logger.info(f"Hittade {len(companies)} företag (alla visas för liknande sajt-audit)")
    else:
        logger.info(f"Hittade {len(companies)} företag med verifierade domäner/hemsidor")
    
    if not companies:
        logger.warning("Inga företag hittades.")
        if not args.similar_site:
            logger.info("För normal audit krävs:")
            logger.info("  - domain_is_active = True")
            logger.info("  - domain_match_probability >= 0.04% (4%)")
            logger.info("  - En domängissning (domain_guess)")
            logger.info("\n💡 Tips: Använd --similar-site för att göra audit på liknande sajter även utan verifierade domäner")
        return 0
    
    # Välj företag
    if args.company_ids:
        # Använd angivna ID:n
        selected_companies = find_companies_by_ids(companies, args.company_ids)
        if not selected_companies:
            logger.error(f"Inga företag med verifierade domäner hittades för: {', '.join(args.company_ids)}")
            logger.info("Tillgängliga företag med verifierade domäner:")
            for comp in companies[:20]:
                logger.info(f"  - {comp['id']} ({comp['name']}) - {comp['domain']} ({comp['match_probability']:.1f}%)")
            return 1
    else:
        # Interaktivt val
        if args.similar_site:
            print(f"\nHittade {len(companies)} företag i {latest.name} (audit på liknande sajt)")
        else:
            print(f"\nHittade {len(companies)} företag med verifierade domäner/hemsidor i {latest.name}")
        selected_ids = interactive_company_selection(companies, similar_site_mode=args.similar_site)
        if not selected_ids:
            logger.warning("Inga företag valdes")
            return 0
        selected_companies = find_companies_by_ids(companies, selected_ids)
    
    logger.info(f"Valde {len(selected_companies)} företag att bearbeta")
    logger.info(f"Audit-djup: {args.depth}, Modell: {args.model}")
    if args.similar_site:
        logger.info("⚠️  LÄGE: Audit på liknande sajt (referensanalys)")
    
    # Initiera OpenAI-klient
    try:
        client = OpenAI()
    except Exception as e:
        logger.error(f"Kunde inte initiera OpenAI-klient: {e}")
        return 1
    
    # Initiera cost tracker
    metadata_dir = latest / ".metadata"
    metadata_dir.mkdir(exist_ok=True, parents=True)
    cost_tracker = CostTracker(metadata_dir) if CostTracker else None
    
    # Generera audit för varje företag
    results = []
    total_cost_sek = 0.0
    total_cost_usd = 0.0
    
    for idx, comp_info in enumerate(selected_companies, 1):
        company_id = comp_info["id"]
        company_name = comp_info["name"]
        company_dir = comp_info["dir"]
        domain = comp_info["domain"]
        final_url = comp_info["final_url"]
        match_prob = comp_info["match_probability"]
        
        logger.info(f"\n[{idx}/{len(selected_companies)}] Audit: {company_name} ({company_id})")
        
        try:
            if args.similar_site:
                # Analysera företagsprofil
                logger.info(f"  📊 Analyserar företagsprofil för {company_name}...")
                company_profile = analyze_company_profile(company_dir, company_name, client, logger)
                
                # Hitta liknande sajt
                similar_domain = find_similar_site(company_profile, client, logger, company_name, company_dir)
                
                if not similar_domain:
                    logger.warning(f"  ⚠️  Kunde inte hitta liknande sajt för {company_name}, hoppar över")
                    results.append({
                        "company": company_name,
                        "company_id": company_id,
                        "domain": domain or "Ingen",
                        "audit_generated": False,
                        "error": "Kunde inte hitta liknande sajt",
                    })
                    continue
                
                # Gör audit på liknande sajt
                audit = run_audit_on_similar_site(
                    company_dir,
                    company_name,
                    company_profile,
                    similar_domain,
                    args.depth,
                    args.model,
                    client,
                    logger,
                )
            else:
                # Normal audit på företagets egen sajt
                # Kontrollera att domänen faktiskt finns och är verifierad
                if not domain or domain == "Ingen" or not final_url:
                    logger.warning(f"  ⚠️  Företaget {company_name} saknar verifierad domän för normal audit")
                    logger.info("  💡 Tips: Använd --similar-site för att göra audit på liknande sajt istället")
                    results.append({
                        "company": company_name,
                        "company_id": company_id,
                        "domain": domain or "Ingen",
                        "audit_generated": False,
                        "error": "Saknar verifierad domän",
                    })
                    continue
                
                logger.info(f"  Domän: {domain} ({match_prob:.1f}% sannolikhet)")
                logger.info(f"  URL: {final_url}")
                
                audit = run_audit_for_company(
                    company_dir,
                    domain,
                    final_url,
                    company_name,
                    audit_depth=args.depth,
                    logger=logger,
                    model=args.model,
                )
            
            if audit:
                results.append({
                    "company": company_name,
                    "company_id": company_id,
                    "domain": domain,
                    "audit_generated": True,
                })
                
                if "cost" in audit:
                    cost_sek = audit["cost"].get("sek", 0)
                    cost_usd = audit["cost"].get("usd", 0)
                    total_cost_sek += cost_sek
                    total_cost_usd += cost_usd
                    logger.info(f"  ✅ Audit genererad - Kostnad: {cost_sek:.2f} SEK ({cost_usd:.4f} USD)")
                else:
                    logger.info("  ✅ Audit genererad")
            else:
                logger.warning(f"  ⚠️  Kunde inte generera audit för {company_name}")
                results.append({
                    "company": company_name,
                    "company_id": company_id,
                    "domain": domain,
                    "audit_generated": False,
                })
        except Exception as e:
            logger.error(f"  ❌ Fel vid generering av audit för {company_name}: {e}")
            results.append({
                "company": company_name,
                "company_id": company_id,
                "domain": domain,
                "audit_generated": False,
                "error": str(e),
            })
            continue
    
    # Spara kostnader
    if cost_tracker:
        cost_tracker.save_costs()
    
    # Sammanfattning
    logger.info("\n" + "=" * 60)
    logger.info("SAMMANFATTNING")
    logger.info("=" * 60)
    audits_generated = sum(1 for r in results if r.get("audit_generated", False))
    logger.info(f"Audits genererade: {audits_generated} av {len(results)}")
    logger.info(f"Total kostnad: {total_cost_sek:.2f} SEK ({total_cost_usd:.4f} USD)")
    if audits_generated > 0:
        logger.info(f"Genomsnitt per audit: {total_cost_sek / audits_generated:.2f} SEK")
        logger.info("\nGenererade audits:")
        for result in results:
            if result.get("audit_generated", False):
                logger.info(f"  ✅ {result['company']} ({result['company_id']})")
                logger.info(f"     Domän: {result['domain']}")
                logger.info(f"     Fil: {latest.name}/{result['company_id']}/site_audit/site_audit.json")
    
    return 0


if __name__ == "__main__":
    sys.exit(main())

