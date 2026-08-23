# Spec

Flow: Welcome → name/phone (email optional) + camera consent → live camera → five holds (stand, squat, hinge, overhead, sit-to-stand) → Movement Map → print / book intro / First Day Map.

Live path uses on-phone pose landmarks (GPU first, CPU fallback). Landmarks drive limb ratios and coaching sentences mapped to PRSUT scales (box squat, dowel hinge, landmine press, 9 a.m. class).

Demo path uses baked sample landmarks so GitHub Pages still shows a complete report without a camera.

data-build on index.html. Service worker network-first for HTML.
