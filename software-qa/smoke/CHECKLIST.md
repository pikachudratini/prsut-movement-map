# Smoke checklist — PRSUT Movement Map

Format for each case:

```
### SMK-ID Title
- Required: yes|no
- Kind: api|browser|manual|agent
- Steps:
  1. ...
- Expected:
  - ...
- Automate: curl|browser|script|manual
```

## Core cases

### SMK-001 App loads
- Required: yes
- Kind: api
- Steps:
  1. Request https://pikachudratini.github.io/prsut-movement-map/
- Expected:
  - HTTP 200
  - marker: Movement Map
  - marker: data-build
- Automate: curl

### SMK-002 Compact controls
- Required: yes
- Kind: api
- Steps:
  1. Read local css/app.css
- Expected:
  - .actions max-width 280px
  - select chevron right 1rem
- Automate: script

### SMK-003 Demo analyze path
- Required: yes
- Kind: api
- Steps:
  1. Import js/model.js SAMPLE landmarks
  2. Run analyze()
- Expected:
  - scales array has at least one coaching sentence
  - ratios include Thigh to lower leg
  - disclaimer is not a diagnosis
- Automate: script

### SMK-004 No leftover mentor names
- Required: yes
- Kind: api
- Steps:
  1. Scan public HTML, JS, CSS, README
- Expected:
  - no Hermy, Hormozi, OpenCap, Ian Stanley in public copy
- Automate: script

### SMK-005 Step one Continue only
- Required: yes
- Kind: api
- Steps:
  1. Read index.html welcome section
- Expected:
  - welcome has Continue
  - no Step 1 of text
  - phone and email on details step
- Automate: script

### SMK-006 Camera CPU fallback
- Required: yes
- Kind: api
- Steps:
  1. Read js/app.js
- Expected:
  - createLandmarker accepts GPU then CPU
  - startCamera exists
  - Demo walkthrough exists
- Automate: script

### SMK-007 Live build stamp
- Required: yes
- Kind: api
- Steps:
  1. Request https://pikachudratini.github.io/prsut-movement-map/
- Expected:
  - marker: 20260823-1408
- Automate: curl
