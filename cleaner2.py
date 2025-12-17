from __future__ import annotations

import argparse
import json
import os
import sys
import textwrap
from pathlib import Path
from typing import List, Dict, Any, Optional, Tuple

from openai import OpenAI

# === Paths och globala saker ===

THIS_FILE = Path(__file__).resolve()
DEFAULT_ROOT = THIS_FILE.parent  # fallback om projektrot inte är satt
CONFIG_FILE = THIS_FILE.with_name(".preprompt_config.json")
HISTORY_FILE = THIS_FILE.with_name(".preprompt_history.json")

client = OpenAI()  # använder OPENAI_API_KEY från miljön


# === ANSI-färger (PowerShell 7+ funkar bra) ===

def _enable_windows_ansi() -> None:
    # aktiverar ofta VT processing på Windows (no-op på andra OS)
    if os.name == "nt":
        try:
            os.system("")
        except Exception:
            pass

def _use_color() -> bool:
    if os.environ.get("NO_COLOR"):
        return False
    try:
        return sys.stdout.isatty()
    except Exception:
        return False

_enable_windows_ansi()
_USE_COLOR = _use_color()

ANSI_RESET = "\033[0m"
ANSI_DIM = "\033[2m"
ANSI_BOLD = "\033[1m"
ANSI_GREEN = "\033[92m"
ANSI_CYAN = "\033[96m"
ANSI_YELLOW = "\033[93m"
ANSI_RED = "\033[91m"

def _c(text: str, code: str) -> str:
    if not _USE_COLOR:
        return text
    return f"{code}{text}{ANSI_RESET}"


# === Priser (USD per 1M tokens) ===
# Källa: OpenAI API Pricing (Flex/Standard/Priority) :contentReference[oaicite:1]{index=1}
PRICING_USD_PER_1M: Dict[str, Dict[str, Dict[str, Optional[float]]]] = {
    "flex": {
        "gpt-5.2": {"input": 0.875, "cached_input": 0.0875, "output": 7.00},
        # pricing-tabellen har inte alltid en egen rad för "-chat-latest" i Flex,
        # men du kan mappa den till samma priser som gpt-5.2 om du vill.
        "gpt-5.2-chat-latest": {"input": 0.875, "cached_input": 0.0875, "output": 7.00},
        "gpt-5.2-pro": {"input": 10.50, "cached_input": None, "output": 84.00},
    },
    "standard": {
        "gpt-5.2": {"input": 1.75, "cached_input": 0.175, "output": 14.00},
        "gpt-5.2-chat-latest": {"input": 1.75, "cached_input": 0.175, "output": 14.00},
        "gpt-5.2-pro": {"input": 21.00, "cached_input": None, "output": 168.00},
    },
    "priority": {
        "gpt-5.2": {"input": 3.50, "cached_input": 0.35, "output": 28.00},
        "gpt-5.2-chat-latest": {"input": 3.50, "cached_input": 0.35, "output": 28.00},
        # priority för pro kan ändras/inte visas här; lämnas None för safety
        "gpt-5.2-pro": {"input": None, "cached_input": None, "output": None},
    },
}

def _usage_to_dict(usage_obj: Any) -> Dict[str, Any]:
    if usage_obj is None:
        return {}
    if isinstance(usage_obj, dict):
        return usage_obj

    for attr in ("model_dump", "to_dict", "dict"):
        if hasattr(usage_obj, attr):
            try:
                return getattr(usage_obj, attr)()
            except Exception:
                pass

    try:
        return dict(usage_obj)
    except Exception:
        return {}

def _fmt_usd(x: float) -> str:
    if x < 0.01:
        return f"${x:.6f}"
    return f"${x:.4f}"

def _pick_rates(model_id: str, tier: str) -> Optional[Dict[str, Optional[float]]]:
    return PRICING_USD_PER_1M.get(tier, {}).get(model_id)

def _estimate_cost_breakdown(
    model_id: str,
    tier: str,
    usage: Dict[str, Any],
) -> Optional[Dict[str, float]]:
    rates = _pick_rates(model_id, tier)
    if not rates:
        return None

    in_rate = rates.get("input")
    out_rate = rates.get("output")
    cached_rate = rates.get("cached_input")

    if in_rate is None or out_rate is None:
        return None

    input_tokens = int(usage.get("input_tokens") or 0)
    output_tokens = int(usage.get("output_tokens") or 0)

    input_details = usage.get("input_tokens_details") or {}
    cached_tokens = int(input_details.get("cached_tokens") or 0) if isinstance(input_details, dict) else 0
    non_cached_input = max(0, input_tokens - cached_tokens)

    # Om cached_rate saknas (t.ex. pro), räkna cached som vanlig input (konservativt)
    if cached_rate is None:
        cached_rate = in_rate

    cost_in = (non_cached_input / 1_000_000.0) * float(in_rate)
    cost_cached = (cached_tokens / 1_000_000.0) * float(cached_rate)
    cost_out = (output_tokens / 1_000_000.0) * float(out_rate)
    total = cost_in + cost_cached + cost_out

    return {
        "cost_in": float(cost_in),
        "cost_cached": float(cost_cached),
        "cost_out": float(cost_out),
        "total": float(total),
    }

def print_cost_summary(model_id: str, response: Any, pricing_tier: str = "auto") -> None:
    usage = _usage_to_dict(getattr(response, "usage", None))
    if not usage:
        print(_c("⚠️  Ingen usage-data i svaret, kan inte räkna kostnad.", ANSI_YELLOW))
        return

    input_tokens = int(usage.get("input_tokens") or 0)
    output_tokens = int(usage.get("output_tokens") or 0)
    total_tokens = int(usage.get("total_tokens") or (input_tokens + output_tokens))

    input_details = usage.get("input_tokens_details") or {}
    cached_tokens = int(input_details.get("cached_tokens") or 0) if isinstance(input_details, dict) else 0

    output_details = usage.get("output_tokens_details") or {}
    reasoning_tokens = int(output_details.get("reasoning_tokens") or 0) if isinstance(output_details, dict) else 0

    # försök få faktiska tier från svaret om möjligt (om SDK/response innehåller det)
    resp_tier = getattr(response, "service_tier", None)
    tier_used = pricing_tier
    if pricing_tier == "auto":
        tier_used = resp_tier or "standard"

    breakdown = _estimate_cost_breakdown(model_id, tier_used, usage)

    # också: visa referens-estimat för andra tiers (bra när auto är okänd)
    std = _estimate_cost_breakdown(model_id, "standard", usage)
    flex = _estimate_cost_breakdown(model_id, "flex", usage)
    pri = _estimate_cost_breakdown(model_id, "priority", usage)

    print(_c("\n=== TOKENKOSTNAD (ESTIMAT) ===", ANSI_CYAN))
    print(f"Model:   {model_id}")
    if resp_tier:
        print(f"API tier (response): {resp_tier}")
    print(f"Pricing tier (calc): {tier_used}")
    print(f"Tokens:  input={input_tokens} (cached={cached_tokens})  output={output_tokens}  total={total_tokens}")
    if reasoning_tokens:
        print(f"Reasoning tokens: {reasoning_tokens} (ingår i output-kostnaden)")

    if breakdown is None:
        print(_c("⚠️  Saknar prisrad för denna modell/tier i tabellen.", ANSI_YELLOW))
    else:
        print(_c(f"In:     {_fmt_usd(breakdown['cost_in'])}", ANSI_GREEN))
        if cached_tokens:
            print(_c(f"Cached: {_fmt_usd(breakdown['cost_cached'])}", ANSI_GREEN))
        print(_c(f"Out:    {_fmt_usd(breakdown['cost_out'])}", ANSI_GREEN))
        print(_c(f"TOTAL:  {_fmt_usd(breakdown['total'])}", ANSI_GREEN + ANSI_BOLD))

    # visa jämförelse (dim) så du ser spannet direkt
    def _line(name: str, b: Optional[Dict[str, float]]) -> str:
        if not b:
            return f"{name}: (n/a)"
        return f"{name}: {_fmt_usd(b['total'])}"

    print(_c("\n— jämförelse —", ANSI_DIM))
    print(_c(_line("flex", flex), ANSI_DIM))
    print(_c(_line("standard", std), ANSI_DIM))
    print(_c(_line("priority", pri), ANSI_DIM))
    print(_c("=============================\n", ANSI_CYAN))


# === Små hjälp-funktioner för JSON-filer ===

def load_json(path: Path, default):
    if not path.exists():
        return default
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except Exception:
        return default


def save_json(path: Path, data):
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")


# === Konfiguration (projektrot, instruktioner, språk mm) ===

def load_config() -> Dict[str, Any]:
    cfg = load_json(CONFIG_FILE, default={})
    if not isinstance(cfg, dict):
        cfg = {}
    return cfg


def save_config(cfg: Dict[str, Any]) -> None:
    save_json(CONFIG_FILE, cfg)


def get_project_root(cfg: Dict[str, Any]) -> Path:
    """
    Hämta projektrot. Om inget är satt -> mappen där skriptet ligger.
    """
    root_str = cfg.get("project_root", "").strip()
    if root_str:
        p = Path(root_str).expanduser()
        return p
    return DEFAULT_ROOT


def configure_project() -> None:
    """
    Interaktiv konfiguration:
    - projektrot
    - projekt-namn, beskrivning, tech stack, mål
    - nyckelkataloger
    - instruktionsfiler
    - språk-läge
    """
    print("=== Projektkonfiguration för preprompt ===")
    cfg = load_config()

    def ask(key: str, label: str, allow_empty: bool = True, multiline: bool = False) -> str:
        current = cfg.get(key, "")
        print()
        print(label)
        if current:
            print(f"(Nuvarande värde: {current})")
        if multiline:
            print("Skriv din text. Avsluta med tom rad.")
            lines = []
            while True:
                line = input("> ")
                if line.strip() == "":
                    break
                lines.append(line)
            value = "\n".join(lines).strip()
        else:
            value = input("> ").strip()

        if value:
            cfg[key] = value
        elif not value and not current and not allow_empty:
            print("Värde krävs, försök igen.")
            return ask(key, label, allow_empty, multiline)
        return cfg.get(key, "")

    print("\nVar ligger projektroten?")
    print("Lämna tomt för att använda mappen där detta skript ligger:")
    print(f"  {DEFAULT_ROOT}")
    ask("project_root", "Projektrot (absolut sökväg, eller tom för standard):", allow_empty=True, multiline=False)

    ask("project_name", "Projekt-namn (valfritt):", allow_empty=True, multiline=False)
    ask("project_description", "Kort projektbeskrivning (valfritt):", allow_empty=True, multiline=True)
    ask("tech_stack", "Teknisk stack (t.ex. React, TS, Python-backend) (valfritt):", allow_empty=True, multiline=False)
    ask("main_goals", "Huvudmål/syfte (kodkvalitet, performance, mm) (valfritt):", allow_empty=True, multiline=True)

    print("\nNyckelkataloger i projektet (relativt projektroten, komma-separerade).")
    print("Exempel: src, src/components, backend")
    dirs_str = input("> ").strip()
    if dirs_str:
        cfg["key_directories"] = [d.strip() for d in dirs_str.split(",") if d.strip()]

    print("\nInstruktionsfiler (relativa paths från projektroten, komma-separerade).")
    print("Exempel: README.md, docs/architecture.md, docs/GOALS.md")
    instr_str = input("> ").strip()
    if instr_str:
        cfg["instruction_files"] = [p.strip() for p in instr_str.split(",") if p.strip()]

    print("\nSpråk-läge:")
    print("  sv_to_en = du skriver ofta på svenska, prompten ska bli teknisk engelska.")
    print("  en_only  = du skriver på engelska, prompten blir teknisk engelska.")
    lang = input("Välj [sv_to_en/en_only] (default sv_to_en): ").strip().lower() or "sv_to_en"
    if lang not in {"sv_to_en", "en_only"}:
        lang = "sv_to_en"
    cfg["language_mode"] = lang

    save_config(cfg)
    print("\n✅ Konfiguration sparad i", CONFIG_FILE)


# === Historik (råfrågor, tvättade prompts, Cursor-svar) ===

def load_history(max_items: Optional[int] = None) -> List[Dict[str, Any]]:
    hist = load_json(HISTORY_FILE, default=[])
    if not isinstance(hist, list):
        hist = []
    if max_items is not None and len(hist) > max_items:
        hist = hist[-max_items:]
    return hist


def save_history(history: List[Dict[str, Any]]) -> None:
    save_json(HISTORY_FILE, history)


def add_history_item(role: str, content: str) -> None:
    history = load_history()
    history.append({"role": role, "content": content})
    # hård cap
    if len(history) > 80:
        history = history[-80:]
    save_history(history)


def summarize_history_for_context(history: List[Dict[str, Any]], max_items: int = 8) -> str:
    """
    Gör en enkel text-sammanfattning (trunkera) av senaste historiken.
    Ingen magi, bara tillräckligt för att modellen ska se vad vi håller på med.
    """
    if not history:
        return ""
    items = history[-max_items:]
    lines: List[str] = []
    for item in items:
        role = item.get("role", "unknown").upper()
        content = (item.get("content") or "").strip().replace("\n", " ")
        if len(content) > 220:
            content = content[:220] + "..."
        lines.append(f"{role}: {content}")
    return "\n".join(lines)


# === Projektträd & instruktionsfiler ===

def get_project_tree(root: Path, max_chars: int = 2000, max_depth: int = 2) -> str:
    lines: List[str] = []

    def walk(base: Path, depth: int = 0):
        if depth > max_depth:
            return
        try:
            entries = sorted(base.iterdir(), key=lambda p: (p.is_file(), p.name.lower()))
        except PermissionError:
            return

        for entry in entries:
            if entry.name in {".git", "node_modules", ".venv", "__pycache__", ".idea", ".vscode"}:
                continue
            indent = "  " * depth
            if entry.is_dir():
                lines.append(f"{indent}/{entry.name}/")
                if sum(len(l) for l in lines) < max_chars:
                    walk(entry, depth + 1)
            else:
                lines.append(f"{indent}{entry.name}")
            if sum(len(l) for l in lines) >= max_chars:
                return

    walk(root)
    text = "\n".join(lines)
    if len(text) > max_chars:
        text = text[:max_chars] + "\n...[truncated]"
    return text


def read_instruction_files(cfg: Dict[str, Any], root: Path, max_chars: int = 4000) -> str:
    """
    Läs in "projektinstruktionsfiler" som du valt (README, docs osv).
    Vi tar små snippets för att hålla context nere.
    """
    files = cfg.get("instruction_files") or []
    chunks: List[str] = []
    for rel in files:
        p = (root / rel).resolve()
        if not p.exists() or not p.is_file():
            continue
        try:
            text = p.read_text(encoding="utf-8", errors="ignore")
        except Exception:
            continue
        if len(text) > 1500:
            text = text[:1500] + "\n...[truncated]"
        chunks.append(f"### {rel}\n{text}")
        if sum(len(c) for c in chunks) >= max_chars:
            break
    return "\n\n".join(chunks)


# === Fokuserade filer: @filnamn från prompten ===

def detect_focus_files(raw_prompt: str, root: Path) -> List[str]:
    """
    Plocka ut tokens som ser ut som filer/paths (eller är @-prefixade),
    och kolla om de faktiskt finns under projektroten.
    Returnerar relativa paths (utan @), sorterade.
    """
    tokens = raw_prompt.replace("\n", " ").split()
    candidates = set()
    for t in tokens:
        clean = t.strip(",.;:()[]{}")
        # ta bort @ om användaren redan skrivit det
        if clean.startswith("@"):
            clean = clean[1:]
        # skippa URLs
        if any(clean.startswith(prefix) for prefix in ("http://", "https://")):
            continue
        # enkel heuristik: det finns en punkt => troligen fil
        if "." in clean and not clean.startswith("-"):
            candidates.add(clean)

    focus_paths: List[str] = []
    seen = set()
    for c in candidates:
        p = (root / c).resolve()
        if p.exists():
            try:
                rel = p.relative_to(root)
            except ValueError:
                rel = p
            rel_str = str(rel).replace("\\", "/")
            if rel_str not in seen:
                seen.add(rel_str)
                focus_paths.append(rel_str)
    return sorted(focus_paths)


# === Systeminstruktion till modellen ===

def build_system_instructions(
    cfg: Dict[str, Any],
    project_tree: str,
    instructions_text: str,
    history_summary: str,
    focus_files: List[str],
) -> str:
    project_name = cfg.get("project_name") or "(okänt projekt)"
    project_description = cfg.get("project_description") or ""
    tech_stack = cfg.get("tech_stack") or ""
    main_goals = cfg.get("main_goals") or ""
    key_dirs = cfg.get("key_directories") or []
    language_mode = cfg.get("language_mode", "sv_to_en")

    key_dirs_str = ", ".join(key_dirs) if key_dirs else "(inte specificerat)"

    if language_mode == "sv_to_en":
        lang_block = """
        - The user often writes in Swedish (sometimes with typos or slang).
        - You MUST output the final prompt in clear, technical English.
        - Preserve the user's intent and general tone when possible (direct, informal is fine),
          but make the instruction unambiguous and professional enough for a coding assistant.
        - You may keep existing Swedish identifiers (function/variable names) if they already exist in the codebase.
        """
    else:
        lang_block = """
        - Assume the user writes in English and wants the final prompt in clear, technical English.
        - Preserve the user's intent and general tone when possible,
          but make the instruction unambiguous and professional enough for a coding assistant.
        """

    if focus_files:
        focus_block = "\n".join(f"@{path}" for path in focus_files)
        focus_section = f"[FOCUS FILES]\n{focus_block}\n"
    else:
        focus_section = "[FOCUS FILES]\n(none explicitly detected)\n"

    instr_section = instructions_text or "(no dedicated instruction files configured)"
    history_section = history_summary or "(no recent history)"

    return textwrap.dedent(f"""
    You are a "prompt pre-processor" that prepares high-quality prompts for a coding assistant inside the Cursor editor.

    Your ONLY task:
    - Take the user's raw question or instruction (possibly in Swedish and messy).
    - Transform it into ONE single, clean, well-structured English prompt that is ideal for a coding/code-refactoring assistant working on this specific project.
    - The user will paste your output directly into Cursor. You must NEVER answer the coding question yourself.

    --- PROJECT METADATA ---
    Name: {project_name}
    Description: {project_description}
    Tech stack: {tech_stack}
    Main goals / priorities: {main_goals}
    Key directories: {key_dirs_str}

    --- PROJECT TREE (truncated) ---
    {project_tree}

    --- PROJECT INSTRUCTION FILES (snippets) ---
    {instr_section}

    --- RECENT Q/A SUMMARY ---
    {history_section}

    --- EXPLICIT FOCUS FILES FROM USER (@paths) ---
    {focus_section}

    --- LANGUAGE & STYLE RULES ---
    {lang_block}

    --- MAPPING USER LANGUAGE TO CODE ---
    - When the user refers to UI concepts or features in natural language (e.g. "about us modal",
      "settings page", "home screen", "poker diary", etc.), use the project tree and instruction
      files to infer which files and routes are most likely involved.
    - In the cleaned prompt, explicitly list these as candidate files using '@relative/path' notation
      under a short section like "Likely involved files".
    - It is OK to say things like "This likely involves @path1 and @path2" or
      "Most probably implemented around @path1". You do NOT need to be 100% certain, but you must
      make your best guess from the project tree and names.
    - If multiple files are plausible, list several candidates and let the coding assistant disambiguate.

    --- HOW TO FORMAT THE CLEANED PROMPT ---
    The cleaned prompt you output should be written as if it is directly addressed to a coding assistant
    running inside Cursor, for example:

      1) Start with a short, clear statement of the overall goal.
      2) Add a brief explanation of the context if the user's message suggests it.
      3) Add a section like "Likely involved files" where you reference relevant files with '@paths'
         (using your own reasoning from the project tree and the user's description, even if the
         user did not specify them explicitly).
      4) Then enumerate the requested work in bullet points or numbered steps.
      5) Mention constraints or expectations (performance, readability, styling, tests, etc.).
      6) If the work depends on previous issues or answers, connect briefly to them using the summary above.

    --- IMPORTANT ---
    - NEVER answer the user's coding question or perform the requested changes yourself.
    - NEVER mention this pre-processing step or that you are a "prompt washer".
    - Do NOT describe your reasoning process (no "I think", "I guess", or explanations of how you chose files).
    - Your output must be fully usable as a stand-alone instruction for the coding assistant.
    """)


# === Modellval ===

MODEL_MAP = {
    "chat": "gpt-5.2-chat-latest",
    "standard": "gpt-5.2",
    "pro": "gpt-5.2-pro",
}


def choose_model(cli_choice: Optional[str]) -> str:
    if cli_choice in MODEL_MAP:
        return MODEL_MAP[cli_choice]

    print("Välj 5.2-modell:")
    print("  [1] chat     = gpt-5.2-chat-latest (snabb, bra för prompt-tvätt)")
    print("  [2] standard = gpt-5.2 (balans, mer reasoning)")
    print("  [3] pro      = gpt-5.2-pro (max reasoning, dyrast)")
    choice = input("Val [1]: ").strip() or "1"

    if choice == "1":
        return MODEL_MAP["chat"]
    elif choice == "3":
        return MODEL_MAP["pro"]
    else:
        return MODEL_MAP["standard"]


# === Input för rå fråga ===

def read_multiline_input() -> str:
    print("Skriv din fråga/instruktion till Cursor (slarvig går bra).")
    print("Du kan skriva flera rader. Avsluta med tom rad.\n")
    lines: List[str] = []
    while True:
        try:
            line = input("> ")
        except EOFError:
            break
        if line.strip() == "":
            break
        lines.append(line)
    text = "\n".join(lines).strip()
    if not text:
        print("Ingen text angavs, avbryter.")
        sys.exit(0)
    return text


# === Kärnfunktion: tvätta prompt ===

def wash_prompt(model_id: str, raw_prompt: str, pricing_tier: str = "auto") -> str:
    cfg = load_config()
    root = get_project_root(cfg)

    history = load_history(max_items=40)
    history_summary = summarize_history_for_context(history)

    project_tree = get_project_tree(root)
    instr_text = read_instruction_files(cfg, root)
    focus_files = detect_focus_files(raw_prompt, root)

    system_instructions = build_system_instructions(
        cfg=cfg,
        project_tree=project_tree,
        instructions_text=instr_text,
        history_summary=history_summary,
        focus_files=focus_files,
    )

    add_history_item("user_raw", raw_prompt)

    try:
        # Sätt service_tier="auto" (default ändå) men kan hjälpa att få tier tillbaka i response.
        try:
            response = client.responses.create(
                model=model_id,
                instructions=system_instructions,
                input=raw_prompt,
                temperature=0.2,
                max_output_tokens=1000,
                service_tier="auto",
            )
        except TypeError:
            # Äldre SDK kan sakna service_tier kwarg – kör utan.
            response = client.responses.create(
                model=model_id,
                instructions=system_instructions,
                input=raw_prompt,
                temperature=0.2,
                max_output_tokens=1000,
            )
    except Exception as e:
        print("\n❌ Fel vid anrop till OpenAI API:")
        print(e)
        sys.exit(1)

    cleaned = (getattr(response, "output_text", "") or "").strip()
    if not cleaned:
        print("\n❌ Tomt svar från modellen.")
        sys.exit(1)

    add_history_item("washed_prompt", cleaned)

    # skriv ut kostnad efter att vi lyckats (så du ser vad just denna körning kostade)
    print_cost_summary(model_id, response, pricing_tier=pricing_tier)

    return cleaned


# === Lägg till Cursor-svar i historiken ===

def add_reply_from_cursor() -> None:
    print("Klistra in Cursor-svaret nedan.")
    print("Avsluta med Ctrl+Z + Enter (Windows) för att skicka in.\n")

    chunks: List[str] = []
    try:
        while True:
            line = input()
            chunks.append(line)
    except EOFError:
        pass

    text = "\n".join(chunks).strip()
    if not text:
        print("Inget innehåll, ingen historik uppdaterad.")
        return

    add_history_item("cursor_reply", text)
    print("\n✅ Cursor-svar sparat i historiken.\n")


# === main() ===

def main():
    parser = argparse.ArgumentParser(
        description="cleaner2.py – tvättar prompts innan de skickas till Cursor + visar tokenkostnad."
    )
    parser.add_argument(
        "--config",
        action="store_true",
        help="Konfigurera projektrot, mål, instruktionsfiler m.m.",
    )
    parser.add_argument(
        "--add-reply",
        action="store_true",
        help="Lägg till ett Cursor-svar i historiken (klistra in från terminalen).",
    )
    parser.add_argument(
        "--model",
        choices=["chat", "standard", "pro"],
        help="Välj 5.2-modell: chat, standard eller pro.",
    )
    parser.add_argument(
        "--pricing-tier",
        choices=["auto", "standard", "flex", "priority"],
        default="auto",
        help="Vilken priskolumn som ska användas för kostnadsberäkningen (auto försöker läsa från response).",
    )
    args = parser.parse_args()

    if args.config:
        configure_project()
        return

    if args.add_reply:
        add_reply_from_cursor()
        return

    cfg = load_config()
    root = get_project_root(cfg)
    print("=== preprompt.py ===")
    print(f"Projektrot: {root}")
    if cfg.get("project_name"):
        print(f"Projekt:   {cfg.get('project_name')}")
    print()

    model_id = choose_model(args.model)
    print(f"Använder modell: {model_id}\n")

    raw = read_multiline_input()
    cleaned = wash_prompt(model_id, raw, pricing_tier=args.pricing_tier)

    print("\n--- TVÄTTAD PROMPT (klistra in i Cursor-chatten) ---\n")
    print(cleaned)
    print("\n----------------------------------------------------\n")


if __name__ == "__main__":
    main()
