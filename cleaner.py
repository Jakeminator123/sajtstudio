from __future__ import annotations

import argparse
import os
import json
import re
import subprocess
import sys
import textwrap
import threading
import time
from pathlib import Path
from typing import List, Dict, Any, Optional, Tuple

from openai import OpenAI

# === Paths och globala saker ===

THIS_FILE = Path(__file__).resolve()
DEFAULT_ROOT = THIS_FILE.parent  # fallback om projektrot inte är satt
CONFIG_FILE = THIS_FILE.with_name(".preprompt_config.json")
HISTORY_FILE = THIS_FILE.with_name(".preprompt_history.json")

client = OpenAI()  # använder OPENAI_API_KEY från miljön


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

def _now_ts() -> float:
    return time.time()


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

    print("\nUI (Tkinter overlay) – valfritt:")
    print("Standardvärden funkar oftast direkt på Windows.")
    ui_alpha = input("Transparens 0.2–1.0 (default 0.85): ").strip()
    try:
        cfg["ui_alpha"] = float(ui_alpha) if ui_alpha else 0.85
    except Exception:
        cfg["ui_alpha"] = 0.85
    cfg["ui_attach_title_contains"] = input("Fönstertitel att fästa mot (default 'Cursor'): ").strip() or "Cursor"
    print("Bredd/höjd för chat-overlay (relativt Cursor-fönstret). Tomt = standard.")
    try:
        ratio = input("Bredd-ratio (0.3–1.0, default 0.70): ").strip()
        cfg["ui_chat_width_ratio"] = float(ratio) if ratio else 0.70
    except Exception:
        cfg["ui_chat_width_ratio"] = 0.70
    try:
        h = input("Chat-höjd px (default 200): ").strip()
        cfg["ui_chat_height"] = int(h) if h else 200
    except Exception:
        cfg["ui_chat_height"] = 200
    try:
        minw = input("Minsta bredd px (default 520): ").strip()
        cfg["ui_chat_min_width"] = int(minw) if minw else 520
    except Exception:
        cfg["ui_chat_min_width"] = 520
    try:
        bm = input("Bottom-marginal px (default 18): ").strip()
        cfg["ui_bottom_margin"] = int(bm) if bm else 18
    except Exception:
        cfg["ui_bottom_margin"] = 18
    try:
        rm = input("Right-marginal px (default 24): ").strip()
        cfg["ui_right_margin"] = int(rm) if rm else 24
    except Exception:
        cfg["ui_right_margin"] = 24

    print("\nToken-kostnad (USD) – valfritt:")
    print("Om du inte fyller i detta kan UI visa tokens men inte $-kostnad.")
    print("Ange pris per 1M tokens (input/output) för modellen du använder.")
    try:
        in_cost = input("gpt-5.2-chat-latest input USD per 1M (tomt=0): ").strip()
        out_cost = input("gpt-5.2-chat-latest output USD per 1M (tomt=0): ").strip()
        cfg["pricing_usd_per_1m"] = {
            "gpt-5.2-chat-latest": {
                "input": float(in_cost) if in_cost else 0.0,
                "output": float(out_cost) if out_cost else 0.0,
            }
        }
    except Exception:
        cfg["pricing_usd_per_1m"] = {
            "gpt-5.2-chat-latest": {"input": 0.0, "output": 0.0}
        }

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


def add_history_item(role: str, content: str, meta: Optional[Dict[str, Any]] = None) -> None:
    history = load_history()
    item: Dict[str, Any] = {"role": role, "content": content, "ts": _now_ts()}
    if meta:
        item.update(meta)
    history.append(item)
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

def _to_posix_rel(root: Path, p: Path) -> str:
    try:
        rel = p.resolve().relative_to(root.resolve())
    except Exception:
        rel = p
    return str(rel).replace("\\", "/").lstrip("/")


def _git_check_ignore(root: Path, rel_paths: List[str]) -> set[str]:
    """
    Returns a set of rel_paths (normalized, no trailing slash) that are ignored by git.
    Uses `git check-ignore` when available. If git is not available, returns empty set.
    """
    if not rel_paths:
        return set()
    try:
        # -z makes it safe for spaces/newlines in paths.
        proc = subprocess.run(
            ["git", "-C", str(root), "check-ignore", "-z", "--stdin"],
            input=("\0".join(rel_paths) + "\0").encode("utf-8", errors="ignore"),
            stdout=subprocess.PIPE,
            stderr=subprocess.DEVNULL,
            check=False,
        )
        if proc.returncode not in (0, 1):  # 0=some ignored, 1=none ignored
            return set()
        raw = proc.stdout.decode("utf-8", errors="ignore")
        out = [x for x in raw.split("\0") if x]
        return {x.rstrip("/").lstrip("/") for x in out}
    except Exception:
        return set()


def get_project_tree(
    root: Path,
    max_chars: int = 6000,
    max_depth: int = 6,
    max_entries_per_dir: int = 200,
) -> str:
    """
    Build a readable tree that:
    - Marks git-ignored entries with "(git ignored)"
    - Collapses very large/ignored directories with "…"
    - Truncates overall output by max_chars
    """
    lines: List[str] = []
    char_count = 0

    def add_line(s: str) -> None:
        nonlocal char_count
        if char_count >= max_chars:
            return
        lines.append(s)
        char_count += len(s) + 1

    def walk(base: Path, depth: int) -> None:
        if char_count >= max_chars:
            return
        if depth > max_depth:
            add_line(("  " * depth) + "…")
            return

        try:
            entries = sorted(base.iterdir(), key=lambda p: (p.is_file(), p.name.lower()))
        except Exception:
            return

        # Collapse `.git` aggressively to avoid noise.
        filtered: List[Path] = []
        for e in entries:
            if e.name in {"__pycache__"}:
                continue
            filtered.append(e)

        if len(filtered) > max_entries_per_dir:
            show = filtered[:max_entries_per_dir]
            rest = len(filtered) - len(show)
        else:
            show = filtered
            rest = 0

        rels = [_to_posix_rel(root, p) + ("/" if p.is_dir() else "") for p in show]
        ignored = _git_check_ignore(root, rels)

        for entry in show:
            indent = "  " * depth
            rel = _to_posix_rel(root, entry).rstrip("/")
            is_ignored = rel in ignored

            if entry.is_dir():
                label = f"/{entry.name}/"
                suffix = " (git ignored)" if is_ignored else ""
                if entry.name == ".git":
                    add_line(f"{indent}{label} (internal)…")
                    continue
                add_line(f"{indent}{label}{suffix}")
                # Collapse ignored directories (and node_modules) by default.
                if is_ignored or entry.name in {"node_modules", ".venv", ".idea", ".vscode"}:
                    add_line(f"{indent}  …")
                    continue
                walk(entry, depth + 1)
            else:
                suffix = " (git ignored)" if is_ignored else ""
                add_line(f"{indent}{entry.name}{suffix}")

            if char_count >= max_chars:
                break

        if rest > 0 and char_count < max_chars:
            add_line(("  " * depth) + f"… (+{rest} more)")

    walk(root, 0)
    text = "\n".join(lines)
    if len(text) > max_chars:
        text = text[:max_chars] + "\n…"
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
      3) Add a section named "Likely involved files (ranked)" and list candidate files using EXACTLY
         this parseable line format (one per line):
           - @relative/path | relevance=NN | fit=NN | confusion=NN
         Where NN are integers 0-100:
           - relevance: how likely the file is involved
           - fit: how well it matches the described feature/bug area
           - confusion: risk of ambiguity/mis-match (higher = more risk)
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


def resolve_model_id(cli_choice: Optional[str]) -> str:
    if cli_choice and cli_choice in MODEL_MAP:
        return MODEL_MAP[cli_choice]
    # Default: automatic chat model (no interactive prompt)
    return MODEL_MAP["chat"]


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

def _extract_usage(response: Any) -> Dict[str, int]:
    usage = getattr(response, "usage", None)
    if usage is None:
        return {"input_tokens": 0, "output_tokens": 0, "total_tokens": 0}
    # usage can be an object or dict depending on client version
    def pick(key: str) -> int:
        if isinstance(usage, dict):
            v = usage.get(key)
        else:
            v = getattr(usage, key, None)
        try:
            return int(v) if v is not None else 0
        except Exception:
            return 0
    inp = pick("input_tokens")
    out = pick("output_tokens")
    tot = pick("total_tokens") or (inp + out)
    return {"input_tokens": inp, "output_tokens": out, "total_tokens": tot}


def _estimate_cost_usd(cfg: Dict[str, Any], model_id: str, usage: Dict[str, int]) -> float:
    pricing = (cfg.get("pricing_usd_per_1m") or {}).get(model_id) or {}
    in_rate = float(pricing.get("input") or 0.0) / 1_000_000.0
    out_rate = float(pricing.get("output") or 0.0) / 1_000_000.0
    return (usage.get("input_tokens", 0) * in_rate) + (usage.get("output_tokens", 0) * out_rate)


def wash_prompt_with_meta(model_id: str, raw_prompt: str) -> Tuple[str, Dict[str, int], float]:
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

    add_history_item("user_raw", raw_prompt, meta={"model": model_id})

    response = client.responses.create(
        model=model_id,
        instructions=system_instructions,
        input=raw_prompt,
        temperature=0.2,
        max_output_tokens=1000,
    )

    cleaned = (response.output_text or "").strip()
    if not cleaned:
        raise RuntimeError("Empty output_text from model")

    usage = _extract_usage(response)
    est_cost = _estimate_cost_usd(cfg, model_id, usage)
    add_history_item(
        "washed_prompt",
        cleaned,
        meta={
            "model": model_id,
            "usage": usage,
            "est_cost_usd": round(est_cost, 6),
        },
    )
    return cleaned, usage, est_cost


def wash_prompt(model_id: str, raw_prompt: str) -> str:
    try:
        cleaned, _usage, _est_cost = wash_prompt_with_meta(model_id, raw_prompt)
        return cleaned
    except Exception as e:
        print("\n❌ Fel vid anrop till OpenAI API:")
        print(e)
        sys.exit(1)


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

def _run_ui_overlay() -> None:
    """
    Tkinter overlay UI (Windows-first). Keeps dependencies stdlib-only.
    """
    try:
        import tkinter as tk
        from tkinter import ttk
        from tkinter import scrolledtext
    except Exception:
        print("❌ Tkinter saknas i din Python-installation.")
        print("Installera en Python som inkluderar Tkinter, eller kör CLI-läget.")
        sys.exit(1)

    cfg = load_config()
    root_path = get_project_root(cfg)
    model_id = resolve_model_id(None)

    # --- Win32 helpers (optional) ---
    is_windows = os.name == "nt"
    attach_title = (cfg.get("ui_attach_title_contains") or "Cursor").strip()

    def find_window_rect_by_title_contains(substr: str) -> Optional[Tuple[int, int, int, int]]:
        if not is_windows or not substr:
            return None
        try:
            import ctypes
            from ctypes import wintypes

            user32 = ctypes.windll.user32
            EnumWindows = user32.EnumWindows
            EnumWindowsProc = ctypes.WINFUNCTYPE(wintypes.BOOL, wintypes.HWND, wintypes.LPARAM)
            GetWindowTextW = user32.GetWindowTextW
            GetWindowTextLengthW = user32.GetWindowTextLengthW
            IsWindowVisible = user32.IsWindowVisible
            GetWindowRect = user32.GetWindowRect

            target = substr.lower()
            found_rect: Optional[Tuple[int, int, int, int]] = None

            def callback(hwnd, lparam):
                nonlocal found_rect
                if not IsWindowVisible(hwnd):
                    return True
                length = GetWindowTextLengthW(hwnd)
                if length <= 0:
                    return True
                buf = ctypes.create_unicode_buffer(length + 1)
                GetWindowTextW(hwnd, buf, length + 1)
                title = buf.value or ""
                if target in title.lower():
                    rect = wintypes.RECT()
                    if GetWindowRect(hwnd, ctypes.byref(rect)):
                        found_rect = (int(rect.left), int(rect.top), int(rect.right), int(rect.bottom))
                        return False
                return True

            EnumWindows(EnumWindowsProc(callback), 0)
            return found_rect
        except Exception:
            return None

    # --- UI ---
    win = tk.Tk()
    win.title("preprompt overlay")
    win.attributes("-topmost", True)
    try:
        win.attributes("-alpha", float(cfg.get("ui_alpha") or 0.85))
    except Exception:
        win.attributes("-alpha", 0.85)
    win.configure(bg="#1f1f1f")  # match target RGB(31,31,31)
    win.overrideredirect(True)

    # Position near Cursor (best-effort)
    width_ratio = float(cfg.get("ui_chat_width_ratio") or 0.70)
    min_width = int(cfg.get("ui_chat_min_width") or 520)
    chat_height = int(cfg.get("ui_chat_height") or 200)
    bottom_margin = int(cfg.get("ui_bottom_margin") or 18)
    right_margin = int(cfg.get("ui_right_margin") or 24)

    rect = find_window_rect_by_title_contains(attach_title)
    if rect:
        left, top, right, bottom = rect
        win_w = max(min_width, int((right - left) * max(0.3, min(1.0, width_ratio))))
        win_h = chat_height
        x = max(left + 12, right - win_w - right_margin)
        y = max(top + 12, bottom - win_h - bottom_margin)
        width, height = win_w, win_h
        win.geometry(f"{width}x{height}+{x}+{y}")
    else:
        win.geometry("560x520+200+120")

    style = ttk.Style()
    try:
        style.theme_use("clam")
    except Exception:
        pass

    container = ttk.Frame(win, padding=10)
    container.pack(fill="both", expand=True)

    # Draggable title bar
    title_bar = ttk.Frame(container)
    title_bar.pack(fill="x")

    title_lbl = ttk.Label(title_bar, text="preprompt (Ctrl+Q)", font=("Segoe UI", 10, "bold"))
    title_lbl.pack(side="left")

    status_var = tk.StringVar(value=f"Model: {model_id}")
    status_lbl = ttk.Label(title_bar, textvariable=status_var)
    status_lbl.pack(side="left", padx=10)

    def on_close():
        try:
            win.destroy()
        except Exception:
            pass

    close_btn = ttk.Button(title_bar, text="×", width=3, command=on_close)
    close_btn.pack(side="right")

    mode_var = tk.StringVar(value="CHAT")

    def set_mode(m: str) -> None:
        mode_var.set(m)
        if m == "CMD":
            cmd_frame.tkraise()
        elif m == "TREE":
            tree_frame.tkraise()
        else:
            chat_frame.tkraise()

    btns = ttk.Frame(container)
    btns.pack(fill="x", pady=(8, 8))
    ttk.Button(btns, text="Chat", command=lambda: set_mode("CHAT")).pack(side="left")
    ttk.Button(btns, text="CMD", command=lambda: set_mode("CMD")).pack(side="left", padx=6)
    ttk.Button(btns, text="Tree", command=lambda: set_mode("TREE")).pack(side="left")

    body = ttk.Frame(container)
    body.pack(fill="both", expand=True)
    body.rowconfigure(0, weight=1)
    body.columnconfigure(0, weight=1)

    chat_frame = ttk.Frame(body)
    cmd_frame = ttk.Frame(body)
    tree_frame = ttk.Frame(body)
    for f in (chat_frame, cmd_frame, tree_frame):
        f.grid(row=0, column=0, sticky="nsew")

    # --- Chat frame ---
    chat_frame.rowconfigure(1, weight=1)
    chat_frame.rowconfigure(3, weight=1)
    chat_frame.columnconfigure(0, weight=1)

    ttk.Label(chat_frame, text="Input (Enter=skicka, Shift+Enter=ny rad):").grid(row=0, column=0, sticky="w")
    input_txt = scrolledtext.ScrolledText(chat_frame, height=6, wrap="word")
    input_txt.grid(row=1, column=0, sticky="nsew", pady=(4, 10))

    ttk.Label(chat_frame, text="Output (auto-copy till urklipp):").grid(row=2, column=0, sticky="w")
    output_txt = scrolledtext.ScrolledText(chat_frame, height=10, wrap="word")
    output_txt.grid(row=3, column=0, sticky="nsew", pady=(4, 10))
    output_txt.configure(state="disabled")

    token_var = tk.StringVar(value="Tokens: - | Cost: -")
    token_lbl = ttk.Label(chat_frame, textvariable=token_var)
    token_lbl.grid(row=4, column=0, sticky="w")

    scores_group = ttk.Labelframe(chat_frame, text="Troliga filer (barometrar)")
    scores_group.grid(row=5, column=0, sticky="ew", pady=(8, 0))
    scores_group.columnconfigure(0, weight=1)

    scores_table = ttk.Frame(scores_group)
    scores_table.grid(row=0, column=0, sticky="ew")
    scores_table.columnconfigure(0, weight=1)

    # Store last output for copy and score parsing later
    state: Dict[str, Any] = {"last_output": "", "session_cost_usd": 0.0}

    score_line_re = re.compile(
        r"^\s*-\s*@(?P<path>[^|]+?)\s*\|\s*relevance=(?P<relevance>\d{1,3})\s*\|\s*fit=(?P<fit>\d{1,3})\s*\|\s*confusion=(?P<confusion>\d{1,3})\s*$",
        re.IGNORECASE,
    )

    def parse_scores(text: str) -> List[Dict[str, Any]]:
        items: List[Dict[str, Any]] = []
        for line in (text or "").splitlines():
            m = score_line_re.match(line)
            if not m:
                continue
            path = (m.group("path") or "").strip()
            try:
                rel = max(0, min(100, int(m.group("relevance"))))
            except Exception:
                rel = 0
            try:
                fit = max(0, min(100, int(m.group("fit"))))
            except Exception:
                fit = 0
            try:
                conf = max(0, min(100, int(m.group("confusion"))))
            except Exception:
                conf = 0
            items.append({"path": path, "relevance": rel, "fit": fit, "confusion": conf})
        # Keep ranked order as provided; if not, sort by relevance desc.
        if items:
            items = items[:12]
        return items

    def render_scores(items: List[Dict[str, Any]]) -> None:
        for child in scores_table.winfo_children():
            child.destroy()
        if not items:
            ttk.Label(scores_table, text="(Inga fil-scores hittades i output ännu)").grid(row=0, column=0, sticky="w")
            return

        # Header
        ttk.Label(scores_table, text="Fil", font=("Segoe UI", 9, "bold")).grid(row=0, column=0, sticky="w")
        ttk.Label(scores_table, text="Relevans", font=("Segoe UI", 9, "bold")).grid(row=0, column=1, sticky="w", padx=(10, 0))
        ttk.Label(scores_table, text="Passform", font=("Segoe UI", 9, "bold")).grid(row=0, column=3, sticky="w", padx=(10, 0))
        ttk.Label(scores_table, text="Förväxlingsrisk", font=("Segoe UI", 9, "bold")).grid(row=0, column=5, sticky="w", padx=(10, 0))

        for i, it in enumerate(items, start=1):
            path = it["path"]
            rel = int(it["relevance"])
            fit = int(it["fit"])
            conf = int(it["confusion"])

            ttk.Label(scores_table, text=path).grid(row=i, column=0, sticky="w")

            pb1 = ttk.Progressbar(scores_table, maximum=100, value=rel, length=110)
            pb1.grid(row=i, column=1, sticky="w", padx=(10, 0))
            ttk.Label(scores_table, text=str(rel)).grid(row=i, column=2, sticky="w", padx=(6, 0))

            pb2 = ttk.Progressbar(scores_table, maximum=100, value=fit, length=110)
            pb2.grid(row=i, column=3, sticky="w", padx=(10, 0))
            ttk.Label(scores_table, text=str(fit)).grid(row=i, column=4, sticky="w", padx=(6, 0))

            pb3 = ttk.Progressbar(scores_table, maximum=100, value=conf, length=110)
            pb3.grid(row=i, column=5, sticky="w", padx=(10, 0))
            ttk.Label(scores_table, text=str(conf)).grid(row=i, column=6, sticky="w", padx=(6, 0))

    def append_output(block: str) -> None:
        output_txt.configure(state="normal")
        output_txt.insert("end", block + "\n")
        output_txt.see("end")
        output_txt.configure(state="disabled")

    def refresh_tree_text() -> str:
        try:
            tree = get_project_tree(root_path)
        except Exception as e:
            tree = f"❌ Kunde inte bygga tree: {e}"
        return tree

    def do_wash_async() -> None:
        raw = input_txt.get("1.0", "end").strip()
        if not raw:
            return
        input_txt.delete("1.0", "end")
        append_output("[YOU]\n" + raw + "\n")

        def worker():
            try:
                cleaned_local, usage, est_cost = wash_prompt_with_meta(model_id, raw)
                return cleaned_local, usage, est_cost
            except Exception as e:
                return f"❌ API error: {e}", {"input_tokens": 0, "output_tokens": 0, "total_tokens": 0}, 0.0

        def on_done(result):
            cleaned_local, usage, est_cost = result
            state["last_output"] = cleaned_local
            state["session_cost_usd"] = float(state.get("session_cost_usd") or 0.0) + float(est_cost or 0.0)
            append_output("[WASHED]\n" + cleaned_local + "\n")

            # Clipboard copy
            try:
                win.clipboard_clear()
                win.clipboard_append(cleaned_local)
            except Exception:
                pass

            token_var.set(
                f"Tokens: in={usage.get('input_tokens',0)} out={usage.get('output_tokens',0)} "
                f"total={usage.get('total_tokens',0)} | "
                f"Est. cost: ${est_cost:.6f} | Session: ${state['session_cost_usd']:.6f}"
            )
            render_scores(parse_scores(cleaned_local))

        def run_thread():
            res = worker()
            win.after(0, lambda: on_done(res))

        threading.Thread(target=run_thread, daemon=True).start()

    def on_enter(event=None):
        # Shift+Enter inserts newline; Enter sends.
        try:
            if event is not None and (event.state & 0x0001):  # Shift
                return
        except Exception:
            pass
        do_wash_async()
        return "break"

    input_txt.bind("<Return>", on_enter)

    # --- CMD frame ---
    cmd_frame.rowconfigure(1, weight=1)
    cmd_frame.columnconfigure(0, weight=1)
    ttk.Label(cmd_frame, text="CMD (exempel: tree, config, clear):").grid(row=0, column=0, sticky="w")
    cmd_out = scrolledtext.ScrolledText(cmd_frame, height=12, wrap="word")
    cmd_out.grid(row=1, column=0, sticky="nsew", pady=(4, 10))
    cmd_out.configure(state="disabled")

    cmd_entry = ttk.Entry(cmd_frame)
    cmd_entry.grid(row=2, column=0, sticky="ew")

    def cmd_append(s: str) -> None:
        cmd_out.configure(state="normal")
        cmd_out.insert("end", s + "\n")
        cmd_out.see("end")
        cmd_out.configure(state="disabled")

    def run_cmd(event=None):
        cmd = (cmd_entry.get() or "").strip().lower()
        cmd_entry.delete(0, "end")
        if not cmd:
            return
        if cmd in {"tree", "refresh tree"}:
            set_mode("TREE")
            refresh_tree()
        elif cmd in {"config"}:
            cmd_append(f"Config file: {CONFIG_FILE}")
            cmd_append("Kör: python cleaner.py --config (i terminal) för att ändra.")
        elif cmd in {"clear"}:
            output_txt.configure(state="normal")
            output_txt.delete("1.0", "end")
            output_txt.configure(state="disabled")
            cmd_append("Cleared output.")
        elif cmd in {"help", "?"}:
            cmd_append("Commands: tree | config | clear | help")
        else:
            cmd_append(f"Unknown command: {cmd}")

    cmd_entry.bind("<Return>", run_cmd)

    # --- Tree frame ---
    tree_frame.rowconfigure(1, weight=1)
    tree_frame.columnconfigure(0, weight=1)
    ttk.Label(tree_frame, text=f"Project tree: {root_path}").grid(row=0, column=0, sticky="w")
    tree_txt = scrolledtext.ScrolledText(tree_frame, wrap="none")
    tree_txt.grid(row=1, column=0, sticky="nsew", pady=(4, 10))

    def refresh_tree():
        tree = refresh_tree_text()
        tree_txt.delete("1.0", "end")
        tree_txt.insert("1.0", tree)

    ttk.Button(tree_frame, text="Refresh tree", command=refresh_tree).grid(row=2, column=0, sticky="w")
    refresh_tree()

    # --- show/hide toggle + optional global hotkey (Windows) ---
    visible = {"v": True}

    def toggle_visible():
        if visible["v"]:
            win.withdraw()
            visible["v"] = False
        else:
            # Re-attach best-effort when showing again
            rect2 = find_window_rect_by_title_contains(attach_title)
            if rect2:
                left, top, right, bottom = rect2
                width, height = 560, 520
                x = max(left + 40, right - width - 20)
                y = max(top + 80, bottom - height - 80)
                win.geometry(f"{width}x{height}+{x}+{y}")
            win.deiconify()
            win.lift()
            visible["v"] = True

    win.bind_all("<Control-q>", lambda e=None: toggle_visible())

    # Windows global hotkey via RegisterHotKey (best-effort)
    stop_hotkey = threading.Event()

    def hotkey_thread():
        if not is_windows:
            return
        try:
            import ctypes
            user32 = ctypes.windll.user32
            MOD_CONTROL = 0x0002
            VK_Q = 0x51
            HOTKEY_ID = 1
            if not user32.RegisterHotKey(None, HOTKEY_ID, MOD_CONTROL, VK_Q):
                return
            msg = ctypes.wintypes.MSG()
            while not stop_hotkey.is_set():
                # Non-blocking peek
                if user32.PeekMessageW(ctypes.byref(msg), None, 0, 0, 1):
                    if msg.message == 0x0312:  # WM_HOTKEY
                        win.after(0, toggle_visible)
                time.sleep(0.02)
            user32.UnregisterHotKey(None, HOTKEY_ID)
        except Exception:
            return

    threading.Thread(target=hotkey_thread, daemon=True).start()

    # Drag support
    drag = {"x": 0, "y": 0}

    def start_move(event):
        drag["x"] = event.x_root
        drag["y"] = event.y_root

    def do_move(event):
        dx = event.x_root - drag["x"]
        dy = event.y_root - drag["y"]
        drag["x"] = event.x_root
        drag["y"] = event.y_root
        x = win.winfo_x() + dx
        y = win.winfo_y() + dy
        win.geometry(f"+{x}+{y}")

    title_bar.bind("<ButtonPress-1>", start_move)
    title_bar.bind("<B1-Motion>", do_move)
    title_lbl.bind("<ButtonPress-1>", start_move)
    title_lbl.bind("<B1-Motion>", do_move)

    def on_destroy(event=None):
        stop_hotkey.set()

    win.bind("<Destroy>", on_destroy)
    set_mode("CHAT")
    append_output("[SYSTEM]\nReady. Output is auto-copied to clipboard.\n")
    win.mainloop()


def main():
    parser = argparse.ArgumentParser(
        description="preprompt.py – tvättar prompts innan de skickas till Cursor."
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
        "--ui",
        action="store_true",
        help="Starta Tkinter overlay UI (Ctrl+Q toggle).",
    )
    parser.add_argument(
        "--model",
        choices=["chat", "standard", "pro"],
        help="Välj 5.2-modell: chat, standard eller pro.",
    )
    args = parser.parse_args()

    if args.config:
        configure_project()
        return

    if args.add_reply:
        add_reply_from_cursor()
        return

    if args.ui:
        _run_ui_overlay()
        return

    cfg = load_config()
    root = get_project_root(cfg)
    print("=== preprompt.py ===")
    print(f"Projektrot: {root}")
    if cfg.get("project_name"):
        print(f"Projekt:   {cfg.get('project_name')}")
    print()

    model_id = resolve_model_id(args.model)
    print(f"Använder modell: {model_id} (docs: https://platform.openai.com/docs/models)\n")

    raw = read_multiline_input()
    cleaned = wash_prompt(model_id, raw)

    print("\n--- TVÄTTAD PROMPT (klistra in i Cursor-chatten) ---\n")
    print(cleaned)
    print("\n----------------------------------------------------\n")


if __name__ == "__main__":
    main()
