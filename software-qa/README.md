# Software QA loop — PRSUT Movement Map

This directory is the living QA system for this software.

## Rule
No ship without updated smoke checklist + green automated run evidence in `runs/`.

## Commands
```bash
# bootstrap (once)
python3 ~/.hermes/skills/development/software-smoke-loop/scripts/bootstrap_software_qa.py "$(pwd)" --name "PRSUT Movement Map"

# run smoke
python3 ~/.hermes/skills/development/software-smoke-loop/scripts/run_smoke.py "$(pwd)"
```

## After every feature
1. Update `INTENT.md` / `SPECS/current.md` if behavior changed
2. Add/adjust cases in `smoke/CHECKLIST.md`
3. Run smoke
4. Commit run evidence path in the ship report
