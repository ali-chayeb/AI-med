---
title: Format reference — every feature rendered
specialty: Cardiology
type: overview
order: 1
summary: Live demonstration of every directive and inline notation the site supports.
tags: [reference, formatting, template]
generated: 2026-08-06
evidence: established
---

# Format reference

This document is both documentation and a test page. Everything below is rendered
from plain Markdown in `content/cardiology/00-format-reference.md`. Open the **MD**
button in the top bar to copy the source and compare it with the output.

## Inline notation

Evidence tags render as tappable chips: established consensus [E], guideline-derived
[G], limited evidence [L], and no reliable data located [?]. Tap any of them.

Utility tiers: [T1] for bedside standards, [T2] for context-specific manoeuvres,
[T3] for academic or historical signs.

Citations are superscript and jump to the source list: the trapezius-ridge referral
of pericardial pain is explained by phrenic innervation ^[1]. Multiple citations
work too ^[1,2].

Ordinary Markdown is unaffected — **bold**, *italic*, `inline code`, ~~strikethrough~~,
and [external links](https://www.escardio.org) all behave normally.

## Callout blocks

::: teal "According to the ESC 2024 guideline"
Every diagnosis and treatment section opens with an explicit guideline declaration,
per Rule B6. Guideline blocks are teal so they are findable by colour when scanning.
:::

::: red "Red flag"
Fever with a new murmur, or fever in a patient with a prosthetic valve or an
indwelling cardiac device, must be treated as possible endocarditis until excluded. [E]
:::

::: amber "Local applicability (Rule B8)"
Tocilizumab, TNF inhibitors, and FDG PET/CT are frequently unavailable or
unaffordable. The practical alternative is prednisolone plus methotrexate or
azathioprine, with serial Doppler ultrasound in place of PET.
:::

::: violet "Evidence quality"
The pooled sensitivity of the third heart sound for heart failure is approximately
0.23 with specificity approximately 0.94 [E]. Hearing one is powerful; not hearing
one tells you almost nothing. Three quarters of patients with heart failure have no
audible S3.
:::

::: key "The single point to carry"
Cardiac examination is **specific, not sensitive**. It rules in. It does not rule out.
:::

::: note "Plain note"
Neutral callout for anything that does not fit the categories above.
:::

## Collapsible groups and numbered items

::: group "The dyspnoea family" | GROUP 2 · items 12–18
Groups collapse and remember their state per document. The eyebrow text after the
pipe character is optional.

::: item 12 "Exertional dyspnoea" [E]
::: mech
- Definition: awareness of uncomfortable, disproportionate breathing effort for a given workload.
- Mechanism: elevated left atrial and pulmonary capillary pressure → interstitial transudation → stimulation of juxtacapillary J receptors on unmyelinated vagal C fibres → increased respiratory drive and air hunger.
- Contributors: reduced lung compliance, increased work of breathing, respiratory muscle underperfusion, ergoreflex activation from underperfused skeletal muscle.
- Grading: NYHA functional class I–IV.
:::
:::

::: item 15 "Bendopnoea" [L]
::: mech
- Definition: dyspnoea within approximately 30 seconds of bending forward. [E]
- Mechanism: bending raises intra-abdominal pressure and further augments preload in a ventricle with already elevated filling pressures.
- Evidence: described in a single-centre cohort; associated with elevated filling pressures, but performance figures rest on limited data and should not be quoted as established. [L]
:::
:::
:::

## Tables

Tables scroll horizontally on narrow screens without breaking the layout.

| Finding | LR+ | Interpretation | Tier |
|---|---|---|---|
| Diminished second heart sound | 10.87 (3.94–30.12) | Strong rule-in for ≥moderate AS ^[2] | [T1] |
| Delayed carotid upstroke | 9.04 (3.12–25.44) | Strong rule-in ^[2] | [T1] |
| Absent murmur radiating to neck | LR− 0.11 (0.06–0.23) | Genuine rule-out ^[2] | [T1] |
| Hill sign | no reliable figure located [?] | Thresholds rest on small old studies | [T3] |

## Lists, nesting, and code

1. First-line assessment
   - Blood pressure in all four limbs
   - Full pulse and bruit survey
     - Radial, brachial, carotid
     - Abdominal aorta, femoral, popliteal, posterior tibial, dorsalis pedis
2. First-line laboratory
   - ESR and CRP — imperfectly correlate with histological activity [E]
   - Full blood count, albumin, creatinine, urinalysis

```bash
# rebuild the manifest locally before pushing
python3 tools/build_manifest.py
```

> Blockquotes are available for direct guideline language or for setting apart a
> single decisive statement.

## Self-test

::: quiz "Self-test — 4 questions"
1. Explain why the subendocardium is the first myocardial region to become ischaemic when coronary supply is limited.
2. State what a sensitivity of 0.23 and a specificity of 0.94 licenses you to conclude at the bedside, and what it forbids.
3. Give the nerve and spinal roots responsible for trapezius-ridge referral of pericardial pain.
4. Why is percussion of the cardiac borders obsolete, and what replaced it?
:::

::: verify "Verification footer"
**Guidelines used:** none govern this document — it is a formatting demonstration.
Content examples are drawn from earlier verified answers in this project.

**Generated:** 06 August 2026.

**Could not verify:** nothing in this file is intended for clinical use. The
diagnostic accuracy figures shown are illustrative of the notation and are cited
to their retrieved sources; verify them at source before quoting.

**Confirm before clinical application:** not applicable — this is a template.
:::

::: sources "Sources"
1. European Society of Cardiology. All ESC Clinical Practice Guidelines. Accessed August 2026. [escardio.org](https://www.escardio.org/guidelines/clinical-practice-guidelines/all-esc-practice-guidelines/)
2. Bedside Physical Examination for the Diagnosis of Aortic Stenosis: A Systematic Review and Meta-analysis. Accessed August 2026. [sciencedirect.com](https://www.sciencedirect.com/science/article/pii/S2589790X23000318)
:::
