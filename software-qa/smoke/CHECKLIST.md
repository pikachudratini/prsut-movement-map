### SMK-001 Load
- Role: visitor
- Steps: open index.html
- Expected: title Movement Map, data-build present, no "Step 1 of" text
- Evidence: curl + html grep

### SMK-002 Compact controls
- Role: visitor
- Steps: read CSS
- Expected: .actions max-width 280px, no full-bleed short CTA rule broken
- Evidence: css grep

### SMK-003 Demo path
- Role: Tyler without camera
- Steps: load page, details, Demo walkthrough
- Expected: report panel shows scale sentences and ratios
- Evidence: Playwright or console module analyze()

### SMK-004 No leftover mentor names
- Role: Tyler
- Expected: public files have no Hermy, Hormozi, OpenCap brand in the UI copy
- Evidence: rg
