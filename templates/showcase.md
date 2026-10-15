---
# Copy this file into src/showcase/ (English) or src/zh/showcase/ (Chinese).
# The file name becomes the URL: src/showcase/my-case.md -> https://tmap.tools/showcase/my-case/
title: One sentence that names the question this case answers
description: One or two sentences shown under the title and in link previews.
date: 2026-10-15
# Give the English and Chinese versions the same key; each page then links to the other.
translationKey: my-case
# Remove this line when the article is ready to publish.
draft: true
---

State the question in one sentence: what did you want to find out about which public firmware?

## Inputs

Everything a reader needs to get the same files you had.

| | Before | After |
|---|---|---|
| Firmware | name and version | name and version |
| Download | vendor URL | vendor URL |
| sha256 | `…` | `…` |

Treasure Map version, toolchain (Ghidra 11.4.3, BinDiff 8) and the tool used to unpack the image.

## Commands

```bash
tmap scan ./fw_v1.extracted -w fw-v1
tmap scan ./fw_v2.extracted -w fw-v2
tmap diff --before fw-v1 --after fw-v2
```

## What the map or the diff showed

Paste the relevant part of the real output. Say which entry pointed at the change, and why it ranked where it did.

## What the agent concluded

Which agent and model, the prompt you gave it, and what it decided. Keep its judgment separate from the facts above.

## Check it yourself

The independent reference: the vendor advisory, the CVE record, the public write-up. Say how the conclusion matches it.

## Limits

What the tool could not see in this case, and what went wrong along the way.
