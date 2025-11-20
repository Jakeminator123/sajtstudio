from pathlib import Path
import re
path = Path("src/lib/openai-client.ts")
text = path.read_text()
pattern = r"(\s*type:\s+\"text\",\s+text:\s+)`Du är en webb-konsult.[\s\S]*?`(\s*})"
new_text, count = re.subn(pattern, r"\1AUDIT_SYSTEM_PROMPT,\2", text)
if count != 1:
    raise SystemExit(f"Replacement failed, count={count}")
path.write_text(new_text)

