---
title: "CVE-2021-26614 was “fixed”. The backdoor never left."
description: "A budget general-purpose model with Treasure Map reads the ipTIME C200 patch from 1.058 to 1.060 for about a dollar: three changes that look like security fixes, and not one of them finishes the job. All 144 must-read items were judged; the 3358 it skipped are on the record."
highlights:
  - "The only security fix deleted the backdoor’s entry; the handler and its hardcoded token are still there, and still in 1.094 five years on"
  - "A change that looks like an overflow fix only enlarged the buffer; the copy into it still checks no length"
  - "Validation was added in the browser only; the server CGI didn’t change by a byte, and a field on the same form that reaches a root command is unchecked on both ends"
date: 2026-11-08
translationKey: iptime-c200-patch-diff
---

In May 2021, ipTIME fixed CVE-2021-26614 in firmware 1.060 for its C200 IP camera: a debug backdoor that ran arbitrary commands without a login. Five years later, in 1.094, the latest firmware (June 2026), the backdoor’s code is still there.

We gave the patch to an ordinary model to see how much it could read out of it with Treasure Map. The model was DeepSeek-V4.1-Flash: a general model, not a security specialist, and not the top tier. No expert stepped in and there was no long prompt. The task was one sentence: compare 1.058 and 1.060, find what the patch fixed, whether each fix is complete, and whether the new code brought new attack surface. The whole run cost about a dollar.

The headline of the report it handed back: the patch touched three places that look like security fixes, and not one of them finishes the job.

<ol class="findings wide">
<li><a href="#finding-backdoor"><span class="x-mark" aria-hidden="true"></span><span class="fd-t">The backdoor was unlinked, not removed</span><span class="fd-d">The only security fix deleted the call into the backdoor, but the handler and the hardcoded token are still in the firmware, untouched.</span></a></li>
<li><a href="#finding-buffer"><span class="x-mark" aria-hidden="true"></span><span class="fd-t">The buffer got bigger, not safer</span><span class="fd-d">One change looks like an overflow fix, but it only enlarged the stack buffer; the copy into it still checks no length.</span></a></li>
<li><a href="#finding-frontend"><span class="x-mark" aria-hidden="true"></span><span class="fd-t">Validation was added only in the browser</span><span class="fd-d">The server CGI is byte-identical across both versions, and the more dangerous field on the same form is validated on neither end.</span></a></li>
</ol>

The report ends with a coverage statement saying how far the review got: all 144 must-read items judged one by one; the 3358 items in the second tier were not swept, and it says so. What follows is the full record, from an unpacked firmware directory on, with nobody hand-picking candidates.

## The setup

<div class="run wide">
<dl class="run-facts">
<div><dt>Device</dt><dd><b>ipTIME C200</b>IP camera, EFM Networks, MIPS</dd></div>
<div class="run-wide"><dt>Firmware</dt><dd><span class="fw-pair"><span class="fw"><code>c200_1_058.bin</code><small>2021-05-12</small></span><span class="fw-arrow" aria-label="to">→</span><span class="fw"><code>c200_1_060.bin</code><small>2021-05-20</small></span></span></dd></div>
<div><dt>Model</dt><dd><b>DeepSeek-V4.1-Flash</b>A general model, not a security specialist, and not the top tier</dd></div>
<div><dt>Harness</dt><dd><b>DeepSeek Harness (DSH)</b>8 workers sharding the queue in parallel</dd></div>
<div><dt>What the model had</dt><dd><b>Treasure Map’s MCP tools</b>Plus one sentence of task</dd></div>
</dl>
<ul class="run-nums">
<li><span class="rn-n">110 → 4</span><span class="rn-t">Binaries total, and how many changed</span></li>
<li><span class="rn-n">144<span class="rn-of"> / 144</span></span><span class="rn-t">Must-read items, judged one by one (must_read_complete)</span></li>
<li><span class="rn-n">23</span><span class="rn-t">Function pairs judged to carry a real code change</span></li>
</ul>
</div>

An ordinary model was the point. Treasure Map does no reasoning and passes no judgment; it hands the agent facts and marks where it cannot see. When a model this size reaches conclusions that hold up, the facts are doing the work.

<figure class="wide">
<img src="/assets/img/sc-cost-en.png" alt="deepseek usage dashboard: API Key dsh, ¥7.57 spent, 502 API calls, 44,343,523 tokens, model deepseek-flash">
<figcaption>The bill for this run, from the usage dashboard: 502 API calls, 44.3M tokens, <b>¥7.57</b> (about US$1), all on deepseek-flash. Reading all 144 must-read items and pinning down three unfinished fixes cost less than a cup of coffee.</figcaption>
</figure>

## What the patch changed

The changes are few: of 110 binaries only 4 differ (`Challenge`, `camctrl`, `iux_get.cgi`, `netinit`), and the rest are byte-identical; 76 non-binary files differ, 65 of them only cache stamps. `Challenge` alone is flagged with 2262 “changed” function pairs, but once addresses are normalized almost all of it is recompilation drift, and only 1 pair carries a real sink change. The agent read the must-read items one by one and landed on three things.

<h3 id="finding-backdoor" class="finding-h"><span class="x-mark" aria-hidden="true"></span><a class="header-anchor" href="#finding-backdoor">CVE-2021-26614: the backdoor was unlinked, the code stays</a></h3>

`iux_get.cgi` carries a debug backdoor. Its entry sits in the main function **before** any session check: a request with a particular set of menu parameters is routed straight into a debug handler, skipping every permission check that follows. The handler is gated by one hardcoded token and exposes two things: unauthenticated read of any file on the device, and arbitrary command execution. The web server adds no HTTP authentication on `/cgi/`; each CGI handles its own, and the backdoor sits ahead of it. So on 1.058 this is pre-authentication remote command execution plus arbitrary file read, published as CVE-2021-26614.

**A correction to NVD:** in the firmware this file is named `iux_get.cgi` (an x, not an s), and that is the name in the scan logs of both versions. NVD writes it as `ius_get.cgi`. This page uses the name from the firmware.

The 1.060 patch deletes the branch in the main function that enters the backdoor, so requests can no longer reach it. The backdoor itself was not removed:

<figure class="pchart wide">
<div class="pc-cols">
<div class="pc-col">
<p class="pc-ver">1.058</p>
<ol class="pc-chain">
<li class="pc-n">HTTP request</li>
<li class="pc-e">carrying a particular set of menu parameters</li>
<li class="pc-n"><code>iux_get.cgi</code> main function<small>no session check has run yet</small></li>
<li class="pc-e">routed straight to the debug handler</li>
<li class="pc-n">Debug handler<small>gated by one hardcoded token</small></li>
<li class="pc-e"></li>
<li class="pc-n">Unauthenticated file read and command execution</li>
</ol>
</div>
<div class="pc-col">
<p class="pc-ver">1.060</p>
<ol class="pc-chain">
<li class="pc-n">HTTP request</li>
<li class="pc-e">carrying the same menu parameters</li>
<li class="pc-n"><code>iux_get.cgi</code> main function</li>
<li class="pc-e is-cut">branch into the backdoor deleted</li>
<li class="pc-n is-idle is-hit"><span class="x-mark" aria-hidden="true"></span>Debug handler<small>pseudocode identical to 1.058, just with no caller; token, debug form and command execution all still there</small></li>
</ol>
</div>
</div>
<figcaption>A solid box is code that can be reached. A dashed box is code that is still in the firmware but has no caller.</figcaption>
</figure>

The handler’s pseudocode is identical to 1.058 (`pseudocode_sameness: identical`, only the addresses shifted down as a block); the `system()` call site, two path sinks and the hardcoded-token comparison are all kept, and it has simply lost its only caller. Treasure Map flags it `lost_every_direct_caller`: 0 callers in the cross-references, no data word holding its entry address, no entry in the dispatch group, which is what lets it confirm the handler is currently unreachable. The agent also noted the signature string is still in the image and recommended deleting the whole function along with the token.

That “unreachable” has a condition, and the report states it: function-pointer tables and indirect calls are tool blind spots, so it can only say “unreachable along the direct calls, data words and dispatch tables that were read.” One future refactor that wires a call site back in, and the backdoor is live again. An ordinary diff tool would only tell you the main function got about a hundred bytes shorter.

That half-finished deletion has stayed half-finished for five years. In the latest firmware, 1.094 from June 2026, the backdoor handler still sits in the image and its entry is still not wired back, exactly as in 1.060.

<h3 id="finding-buffer" class="finding-h"><span class="x-mark" aria-hidden="true"></span><a class="header-anchor" href="#finding-buffer">The buffer got bigger, not safer</a></h3>

This is the one most easily waved through as “already fixed.” In `Challenge`, the main service process on the device, a function that handles a network request uses a stack buffer, and 1.060 made that buffer larger. Taken on its own, the step looks exactly like a buffer-overflow fix.

But the fact Treasure Map lays out is this: the step that copies data into that buffer is the same in both versions, still copying a string whose **length is entirely decided by the client**, with no length bound at all.

<figure class="pchart wide">
<div class="pc-cols">
<div class="pc-col">
<p class="pc-ver">1.058</p>
<ol class="pc-chain">
<li class="pc-n">A client-controlled string in the request<small>any length</small></li>
<li class="pc-e">copied in whole, no length check</li>
<li class="pc-n">A stack buffer</li>
</ol>
</div>
<div class="pc-col">
<p class="pc-ver">1.060</p>
<ol class="pc-chain">
<li class="pc-n">The same client-controlled string<small>any length</small></li>
<li class="pc-e">copied in whole, still no length check</li>
<li class="pc-n is-hit"><span class="x-mark" aria-hidden="true"></span>The same stack buffer, enlarged by the patch<small>bigger buffer, still no bound on the copy: the bar is higher, the hole still open</small></li>
</ol>
</div>
</div>
<figcaption>All the patch touched is the buffer size (heavy box). The copy into it is the same in both versions, with no length check.</figcaption>
</figure>

Enlarging the buffer only means an attacker has to push a few more bytes to run off the end; the stack overflow itself is still there. The agent judged it a change that **looks like a fix and does nothing**.

Out of responsible disclosure, this page does not name the function, the buffer size, or how to shape the request: the same firmware line is still on sale, and this hole is most likely still live. What can be shown is how it was caught: Treasure Map put two facts in front of the agent side by side, “the buffer got bigger” and “the copy still has no bound,” and a fake fix cannot hide behind that.

<h3 id="finding-frontend" class="finding-h"><span class="x-mark" aria-hidden="true"></span><a class="header-anchor" href="#finding-frontend">Validation was added only in the browser, and missed the more dangerous field</a></h3>

Input validation for account names, passwords and camera names moved from a blacklist to a whitelist, which looks like injection defense. But the change is only in the browser-side JavaScript. The server CGI that actually receives those fields (`iux_set.cgi`) is identical across both versions, down to the sha256. Skip the page, craft the request and send it straight to the server, and this whitelist never runs.

<figure class="pchart pc-merge wide">
<p class="pc-ver">1.060</p>
<div class="pc-grid">
<div class="pc-n">Submitted through the web page</div>
<div class="pc-n">Request crafted and sent directly</div>
<div class="pc-e is-new">JavaScript check: blacklist became a whitelist</div>
<div class="pc-e"><span class="x-mark" aria-hidden="true"></span>skips the page, so the whitelist never runs</div>
<div class="pc-n pc-dst"><code>iux_set.cgi</code><small>byte-identical to 1.058, same sha256</small></div>
</div>
<figcaption>The heavy line is what 1.060 changed, all of it on the browser side. The server code that receives the fields did not change by a byte.</figcaption>
</figure>

What makes it worse is that the hardening was put in the wrong place. The whitelist covers the “camera name,” while **the same form carries a more dangerous field**: the server address you fill in when configuring a NAS. When the camera talks to that NAS, the address is handed, unchanged, to a command that runs as root on the device. Across both versions, the server code that receives and uses this field did not change by a byte, and the frontend added no validation for it either. So the patch gave the less dangerous field a browser-side whitelist, while the field on the same form that reaches a root shell was left untouched on both ends.

Again out of responsible disclosure, this page goes only as far as “field → root command,” with no directly usable detail. It was caught the same way, from facts laid side by side: the frontend added a check, the server did not change by a byte, and the dangerous field is checked nowhere. Put together, “only the UI changed” is plain to see.

## What else the patch touched

Beyond those three, a few changes in this diff are worth noting. None is an exploitable vulnerability, but together they fill in the whole picture of the patch:

- **ONVIF Events was opened to clients for the first time.** 1.060 actually wires up and advertises the ONVIF event-subscription service; in 1.058 the code was written but never exposed to clients. The new code itself is memory-safe (the agent checked the `sprintf` calls and buffers involved; they cannot overflow). But it is a new client-facing protocol surface that was not reachable before, and worth a review of its own: the ONVIF code in this same `Challenge` binary has a record. The public KVE-2023-5458 (reported by KAIST to Korea’s KISA, fixed in firmware 1.086 in January 2024) was a memory-corruption bug in `Challenge` parsing an ONVIF request.
- **An editor leftover file leaked internal information.** 1.060 picked up a `.ChkOned.sh.swp` (a vim swap file) holding the script text and the developer’s source-tree path. It is not under the web root and has no execution path: a packaging accident plus information disclosure.
- **Two `killall` calls are gone.** The wlan restart path no longer force-kills `hostapd`/`udhcpd`; a small reduction in attack surface.
- **A few config structs each grew by 4 bytes.** The target buffers grew in step, with no new overflow introduced. That is the opposite of the “enlarged without a bound” case above: these were done right.
- **camctrl gained a diagnostic option.** New code, with a minor non-terminated-string issue that only bites with local root and an oversized argument. Low risk.

## How much it checked, and how much it didn’t

Audit tools make mistakes; worse, they don’t know what they missed. This run split the 3502 diff subjects between the two versions into two tiers, the upper one being the must-read items that cannot be skipped. Here is how it came out:

<figure class="ledger wide">
<p class="lg-head">The tool split 3502 diff subjects into two tiers</p>
<div class="lg-two">
<div class="lg-panel is-done">
<span class="lg-n">144<span class="lg-of"> / 144</span></span>
<span class="lg-cap">Must-read · judged one by one <b>✓</b></span>
<span class="lg-bar" aria-hidden="true"></span>
</div>
<div class="lg-panel is-tail">
<span class="lg-n">3358</span>
<span class="lg-cap">Second tier · unswept (not selected under k=4; needs explicit consent to sweep)</span>
<span class="lg-bar" aria-hidden="true"></span>
</div>
</div>
<figcaption>Both tiers count the same thing, diff subjects: 144 (must-read) + 3358 (second tier) = 3502 in all. The must-read tier is the one the tool judged “cannot be skipped,” all 144 read one by one; the other 3358 are explicitly marked unswept, with no verdict. Sampling shows it is all build stamps and address shifts, but the tool will not count that as “fine.”</figcaption>
</figure>

When the review finished, Treasure Map printed this coverage statement, verbatim:

```text
must-read 144 / disposed 144; all subjects 3502 / disposed 144; open audits off;
judged unread 0 (read in part 0); disagreements 0; reduce done; presence citations short 0;
basis incomplete 1; dangling 0 (changed_real 0); not listed 0;
verdicts disposed 23/121/0, recorded 23/121/0 (changed_real/no_real_change/inconclusive);
predicate v4 (k=4); server ca256d6946b5d3fc2d9410ea803c39eb210c8b14
must_read_complete = true
```

Item by item:

- There are **144** must-read items in all, and the agent judged **every** one of them, one by one: `must_read_complete = true`. The verdicts are 23 “real code change,” 121 “no real change,” and 0 “inconclusive.”
- What went unswept is the second tier: **3358** members (214 work units, bucket types B2 / C22 / R1102 / S2232). These are items outside the must-read set that predicate v4 (k=4) did not select; sweeping them needs your explicit consent and a second pass. The ones sampled all fell into build stamps, `__LINE__` shifts and address relocations, but the tool does not count that as “fine.”
- `dangling 0` means no conclusion is left hanging: every judgment points back to the fact it rests on. The annotation layer enforces this when the judgment is written, rather than checking for it afterward.
- `basis incomplete 1` is an accounting technicality, not a missed read: `GetNetState` had 46 candidate lines, over the 20-line single-page cap; the agent read all of them across three pages, but the tool counts the whole read as “partial” the moment any one page is byte-truncated.

<figure class="wide">
<img src="/assets/img/sc-coverage-en.png" alt="The agent's own report file, fw_1 to fw_2: the run method (4 binary diffs, 23 changed_real, 121 no_real_change, 0 inconclusive) and the coverage statement printed verbatim from tmap: verdicts 23/121/0, 144 of 144 must-read disposed, second tier of 3358 subjects unread">
<figcaption>The same statement in the agent’s own report file: the run method, the counts, and the coverage line printed verbatim from tmap: <code>23/121/0</code>, 144 of 144 must-read disposed, 3358 second-tier subjects left unread. Nothing on this page was retyped from memory.</figcaption>
</figure>

## With and without Treasure Map

<div class="versus wide">
<p class="vs-h">Without Treasure Map</p>
<p class="vs-h">With Treasure Map, this run’s real results</p>
<p>A Flash-tier model facing a hundred thousand lines of diff will most likely guess or give up</p>
<p>Narrowed to 4 changed binaries and 23 real code changes</p>
<p>Reads all 2262 <code>changed</code> pairs as edits</p>
<p>Recognizes almost all of it as recompilation drift, with only 1 real sink change</p>
<p>Sees “backdoor removed, validation added” and calls it fixed</p>
<p>Points out all three fixes are incomplete: backdoor only unlinked, buffer only enlarged with no bound, validation only in the frontend</p>
<p>“I finished the audit,” with no way to check</p>
<p>All 144 must-read items judged, with the 3358-member second tier explicitly marked unswept</p>
</div>

## How it ran: three commands and one sentence

The whole thing is two `tmap scan` runs to build the maps, one `tmap diff` to compare them, then the task goes to your agent.

### 1. Scan and build the map

Scan each firmware version once. After that, the same firmware can be compared as many times as you like without rescanning.

```bash
tmap scan ~/fw/extractions/c200_1_058.bin.extracted/300000/squashfs-root/ -w fw_1
tmap scan ~/fw/extractions/c200_1_060.bin.extracted/300000/squashfs-root/ -w fw_2
```

The `[3/3] triage` block at the end of the output is what this step produces: the candidate list, ranked by the current lens. In the full output, the two longest stretches are folded, each marked with how many lines it hides: the decompile progress for all 110 binaries, and the top candidates.

<details>
<summary>Full output of the 1.058 scan (1.060 has the same structure, with its own numbers)</summary>

```
$ tmap scan ~/fw/extractions/c200_1_058.bin.extracted/300000/squashfs-root/ -w fw_1
Treasure Map is a defensive firmware-audit and vulnerability-research tool.
Its output is analysis leads for human review — not exploits, payloads, or
attack code. Use it only on firmware you lawfully possess and are authorized
to analyze. Ensuring your use complies with the laws and license terms that
apply to you is your responsibility.

note: re-running run-id 'fw_1' refreshes its atlas entries (replace-by-run); keep one run-id per device+firmware version

[1/3] analyzing firmware (Ghidra) …
INFO treasure_map.lib.analyze.elf_inventory: ELF scan complete: 110 unique binaries in ~/fw/extractions/c200_1_058.bin.extracted/300000/squashfs-root
  … (344 lines omitted: decompile, cross-reference and non-binary file progress for all 110 binaries) …
      → analysis.db: 110 binaries, 54084 functions
      → exports (for tmap diff): 110 ok
      → promoted functions: 8314 created, 1595 recovered via pointers; 6830 instructions left outside any function

[2/3] hunting call-sequence shapes → atlas (run-id=fw_1) …
INFO treasure_map.lib.hunt.analyzer2: hunt: analyzing 54084 functions
INFO treasure_map.lib.hunt.analyzer2: skipping match with no loadable function body (data gap)
INFO treasure_map.lib.hunt.analyzer2: hunt: 31 out-of-body call(s) given a formal anchor
      → 10978 candidates written (confirmed=1, unknown=10977)
      → 1 shape matches skipped (data gap: no decompilable body) — candidate set INCOMPLETE
      Decompile unfinished: 2 function(s) with no pseudocode — no candidate can come from them:
        iperf FUN_0042499c @ 0042499c: decompile timeout — 0 sink callee(s) with no readable body
        iperf FUN_00424cfc @ 00424cfc: decompile timeout — 0 sink callee(s) with no readable body
      → 2979 fmt-wrapper candidates KEPT but ranked low (forwarded source unknown)
      → 33 editable web form fields → atlas

[3/3] triage — ranked candidates for manual review:

triage: fw_1   (10978 candidates: 1 reachable, 10977 to-verify)
  lens: current lens: sink-impact x controllability-exposure, only PROVEN-SAFE sinks leave the first screen — switchable (--sort-by / --filter / --view)
  showing top 20 of 10978 — use --all or --sink to see more
  … (41 lines omitted: the top 20 candidates) …

caveats (this map is honest but low-resolution — do not read it as complete):
  - demotion gate ~= only provably-constant this phase; proven-blocked / filter-dominates almost never fire, so junk that is merely 'washed' is NOT sunk
  - 'free' is OPTIMISTIC: convergence-transforms are not subtracted yet, so a value washed by inet_ntop / a whitelist / a fixed-width parse — or a PATH sanitized by basename / realpath / a traversal check — can still read as free
  - proven-'controllable' via web_settable proves only the KEY is user-settable (SaTC front-end x back-end cross), NOT that the getter->sink path is transform-free — a sanitizer between the getter and the sink can still neutralize it; and the all-binary cross may be slightly wide
  - filtering is ~= always '?': tmap does a generic name-match only and cannot prove a sanitizer covers the path — it does NOT save you from reading the filter code
  - triage RE-RANKS the view, it does not reduce candidates: only provably-safe items leave the first screen; every candidate stays listed and queryable

Note: candidates are leads for manual review, arranged by the current lens (switch it with --sort-by / --view / --filter) — NOT confirmed results, and the list is re-ranked, never reduced.
```

</details>

### 2. One command to diff the pair

```bash
tmap diff --before fw_1 --after fw_2
```

This command chains Ghidra, BinExport and BinDiff internally; you never touch an intermediate file. It starts by excluding what didn’t change: of 110 binaries, 106 are byte-identical on both sides and are skipped, so only 4 go into the comparison.

The `coverage` line near the end is the coverage check: every binary that holds a candidate was either compared or confirmed byte-identical. Nothing is skipped without being reported.

<details>
<summary>Full output of <code>tmap diff</code></summary>

```
$ tmap diff --before fw_1 --after fw_2
Diffing 4 changed binaries.
Use --binary <name> to diff just one.
  [1/4] camctrl: 111 aligned: 65 unchanged, 0 changed (0 with a scoped sink delta, 0 no scoped signal), 6 unverified, 40 no body; 7 alignment undetermined (read: 6 identical_not_unique, 1 differs; anchored_differs=1, anchored_micro_side=0); sink callee swaps 0 aligned / 1 proposed, sink candidate count deltas 0 aligned / 1 proposed (0 with a count unknown), 0 listed as S, 1 R floated by supported pair evidence, 0 R with a counterpart conflict; strings A-only 0, B-only 0
  [2/4] netinit: 226 aligned: 140 unchanged, 2 changed (0 with a scoped sink delta, 2 no scoped signal), 4 unverified, 80 no body; 6 alignment undetermined (read: 6 identical_not_unique; anchored_differs=0, anchored_micro_side=0); sink callee swaps 0 aligned / 0 proposed, sink candidate count deltas 0 aligned / 0 proposed (0 with a count unknown), 1 listed as S, 0 R floated by supported pair evidence, 0 R with a counterpart conflict; strings A-only 2, B-only 2
  [3/4] iux_get.cgi: 270 aligned: 161 unchanged, 6 changed (0 with a scoped sink delta, 6 no scoped signal), 5 unverified, 98 no body; 0 alignment undetermined; sink callee swaps 0 aligned / 0 proposed, sink candidate count deltas 0 aligned / 0 proposed (0 with a count unknown), 5 listed as S, 0 R floated by supported pair evidence, 0 R with a counterpart conflict; strings A-only 1, B-only 0
  [4/4] Challenge: 10087 aligned: 7077 unchanged, 2262 changed (0 with a scoped sink delta, 2262 no scoped signal), 267 unverified, 481 no body; 1098 alignment undetermined (read: 307 identical_unique, 48 identical_not_unique, 1 identical_callee_unverified, 1 identical_text_unverified, 741 differs; anchored_differs=116, anchored_micro_side=0); sink callee swaps 0 aligned / 0 proposed, sink candidate count deltas 1 aligned / 0 proposed (2 with a count unknown), 2248 listed as S, 0 R floated by supported pair evidence, 0 R with a counterpart conflict; no counterpart — A 1 counterpart_suspected; B 2 unmatched_analysis_incomplete; strings A-only 4, B-only 6
Atlas: ~/.treasure-map/atlas.db
  binaries      : 4 changed, 106 unchanged (skipped), only-in-A 0, only-in-B 0
  diffed        : 4 ok (4 new, 0 skipped-already-ok), 0 failed this run
  baselines     : 4 stored, 0 not
  identical     : 93 candidate-holding binaries are byte-identical in both runs (no diff needed, none can show them); their 9139 candidates are on the scan map — tmap triage fw_2
  only in A     : none
  only in B     : none
  coverage      : every candidate-holding binary is diffed or byte-identical in both runs
For a version diff, review the WHOLE PAIR (run ids from list_diffs): start_diff_review(run_pair='<run_a>::<run_b>') hands out work units; judge each member of next_unit with annotate_diff(..., unit_id=...) (annotate_diff_batch for many; run_pair=... for a binary_presence binary or a file), then call again until next_unit is null; worker/workers shard it; before reporting, quote its coverage_statement. One diff alone: start_diff_review(diff_id), get_diff_patch_view(diff_id, entry_id=...), promote a finding onto a candidate. get_diff_handoff(run_pair) pages the hand-off. Also: get_diff_meta for the per-function split; get_diff_deltas for the string-keyed edges (a switchable view); list_diff_blindspots for un-diffed binaries.
```

</details>

### 3. The agent works a queue

Only now does the model come in. `start_diff_review` splits the pair’s must-read items into work units and hands them out one at a time; the agent reads evidence through `get_diff_patch_view`, `get_pseudocode` and `get_xrefs`, writes conclusions back to the annotation layer with `annotate_diff`, and keeps going until `next_unit=null`. This run used 8 workers sharding the queue in parallel, with a human review at the end.

The agent never has to read the whole fact layer first. It takes one work unit at a time, records the result, and takes the next. When to stop is fixed in advance: it stops when the must-read queue is empty, not when the model decides it has seen enough.

<figure class="wide">
<img src="/assets/img/sc-agent-en.png" alt="DeepSeek Harness session: the agent loads the tmap diff-review skill, lists the run pair, starts the review and shards the must-read set across 8 parallel workers, reading evidence with get_diff_patch_view and get_pseudocode">
<figcaption>A real session excerpt: the one-sentence task up top, then the agent working tmap’s tools (<code>list_runs</code>, <code>start_diff_review</code>, <code>get_diff_patch_view</code>, <code>get_pseudocode</code>) before sharding the must-read set across <b>8 parallel reviewers</b> (<code>WORKERS = 8</code>) and reading the highest-signal changes itself. The model is DeepSeek-V4.1-Flash.</figcaption>
</figure>

## Reproduce it yourself

Both firmware versions can be downloaded directly from ipTIME’s website:

- [c200_1_058.bin (the vulnerable version)](https://iptime.com/iptime/?pageid=2&page_id=126&keyword=C200&uid=24007&mod=document)
- [c200_1_060.bin (the patched version)](https://iptime.com/iptime/?pageid=2&page_id=126&keyword=C200&uid=24015&mod=document)

Unpack both with a tool such as binwalk to get two `squashfs-root/` directories, then:

```bash
tmap scan ~/fw/extractions/c200_1_058.bin.extracted/300000/squashfs-root/ -w fw_1
tmap scan ~/fw/extractions/c200_1_060.bin.extracted/300000/squashfs-root/ -w fw_2
tmap diff --before fw_1 --after fw_2
```

The `300000` in the paths is the squashfs offset inside the image. The directory binwalk produces may be named differently, so adjust it to whatever you have locally.

Once the diff is done, point your agent at the queue (the installer’s `tmap init` already registered the MCP server). The task given in this run was one sentence: **Compare these two firmware versions, find which vulnerabilities were patched, say whether each fix is complete, and whether new code introduced new vulnerabilities or attack surface.**

You should see 106 binaries skipped as byte-identical and 4 going into the comparison; the main function of `iux_get.cgi` short one branch while the backdoor handler stays; a stack buffer in `Challenge` enlarged while the copy still has no bound; and two frontend whitelists with nothing to match them on the server.

## What this run did not see

These boundaries match the coverage statement:

<ul class="blind">
<li><b>The second tier was not swept</b>: 3358 members (<code>S</code> 2232, <code>R</code> 1102, <code>C</code> 22, <code>B</code> 2) were not selected under k=4, were not annotated one by one, and the server does not count them as “fine.”</li>
<li><b>Local buffer sizes</b> can’t be inferred reliably. Any judgment resting on a stack array, including how far the “enlarged, no bound” case above can actually run off the end, has to be read by hand from the decompilation.</li>
<li><b>Length constants outside the sink argument</b> are invisible, the same class of blind spot as buffer sizes.</li>
<li><b>Multi-hop data flow</b> breaks past a certain depth; taint passed across functions is lost.</li>
<li><b>Indirect dispatch tables</b>, meaning function-pointer tables and registered callbacks, are opaque. So the backdoor being “unreachable” only means unreachable along the paths that were read, not a proof.</li>
<li><b>Cross-binary call chains</b> are not followed.</li>
<li><b><code>.ko</code> kernel modules</b> are recorded for information only: 17 modules are byte-identical across both versions and never entered the comparison.</li>
</ul>

All of these are known limits of Treasure Map and appear in the tool’s own output. They are listed here so you can see how far each conclusion above can be trusted.
