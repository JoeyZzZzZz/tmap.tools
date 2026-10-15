---
title: I Wanted to Replace Myself Before AI Did
description: How a binary vulnerability researcher came to build Treasure Map, from a book to a map, then an annotation layer and a patch diff.
date: 2026-10-15
translationKey: replace-myself-first
---

## How it started

It all came from a deep fear of AI and a deep uncertainty about the future.

I'm a binary vulnerability researcher. In May this year, using an agent together with a Ghidra MCP server, I found vulnerabilities in an IoT device with almost no effort, and exploited them successfully on my own device. In that moment I felt that both I and my job were about to be replaced by AI.

I sank into confusion and unease, and an idea took shape in my mind:

> Rather than wait for AI to replace me, I would build a tool that replaced me first.

Models will keep getting stronger, and so will the harnesses and agents the model vendors build around them. A security tool that competes with the model on reasoning, or with the model vendors on harness, will sooner or later be replaced by the next version of some agent. So I built an MCP tool that does no reasoning and passes no judgment: [Treasure Map](https://github.com/JoeyZzZzZz/treasure-map).

## The first attempt

No sooner said than done. Drawing on how I work as a vulnerability researcher, I came up with an idea: treat the firmware as a book in which every page is one binary, and hand that book to AI to read. The AI could then tell me where the unpatched vulnerabilities were, which encryption algorithms the firmware used, and so on.

The steps were:

1. Scan the whole unpacked firmware filesystem and find every binary in it.
2. Reverse every binary in full with Ghidra, and store the pseudocode, AI-generated function summaries and the call relationships between functions in a database.
3. Have AI read the database, summarize what each binary and each of its functions does, and list the possible vulnerabilities along with the pseudocode behind them. Every binary and every function is saved as its own Markdown document.
4. Bundle all of those documents into an Obsidian vault, using backlinks to record the call relationships between functions and binaries. Open it, and you can read what each binary does and where it might be vulnerable, just like a book, and browse the call relationships in the graph view.
5. Build a chat agent that queries the database and answers questions.

It took me less than a month to build. When the agent came back with a pile of possible vulnerabilities and Obsidian filled up with analysis results, I was thrilled. But reality put that excitement out almost immediately: yes, nearly all of them were false positives.

As I reviewed them one by one, I found that almost all of them only looked like problems. Either the input was filtered, or the entry point was unreachable, and on top of that there were plenty of hallucinations. This was not at all what I wanted, and I was lost again.

## Trying again, after some reflection

I looked back at what had been wrong with the design:

1. Any conclusion built on inaccurate judgments cannot be trusted.
2. The facts could only be yes or no. There was no honest "unknown".
3. With this much data, a knowledge base for humans to read did little besides flatter my vanity.
4. The agents the model vendors build keep getting better. I should stand on the shoulders of giants.

So I changed direction and started building an MCP server for agents. That is how Treasure Map was born.

At first I still thought of the firmware as a book, sorted by danger: the higher something ranked, the more likely it was a real vulnerability. But I soon found that the top of the ranking was almost all false positives, while the real vulnerabilities were buried in a heap of unknowns where the agent had no way of finding them. Keeping the data truthful meant there would inevitably be a lot of unknowns, and once there were too many unknowns, there was nothing left to sort by.

After many revisions that failed to solve this, the project's name reminded me once again. Of course! **This is a map, not a book.**

A book is one-dimensional and linear. It has a single table of contents, and the AI reads it in order, from the first page to the last. A map is multidimensional and has no inherent order: the surveyor looks at the contour lines, the driver at the road network, the officer at the high ground, the hydrologist at the rivers… It is the same map, and each of them chooses their own view.

So I designed several views for filtering candidates, and let the agent choose which one to look through. By whether the vulnerable call can be reached? By whether the argument is controllable? Or by whether anything filters it, and so on. AI is smart enough now, so let it decide for itself.

Of course, in practice a lot of the data really couldn't be obtained directly, many views stayed unknown, and there were still far too many candidates.

## A flash of inspiration

Just as I was racking my brains over how to cut the number of candidates, my mind drifted back to my childhood, to the books I loved most as a kid: the *Tiger Team* mysteries. What has stayed with me most is their decoder card: lay it over the page at the right angle, and the puzzle solves itself.

Wait. A decoder card laid over a book doesn't change what is printed on the page, yet it gives you something new. Isn't that exactly what I need to filter the candidates?

And so the annotation layer, laid over the base map, was born. The AI writes the judgments it reaches through analysis into this layer, so data that couldn't be obtained directly can now be reached by reasoning. The AI's judgments also accumulate there, and can be reused even after you switch to a different agent. The two layers are completely isolated: changes to the annotation layer never affect the read-only fact layer.

## The last piece of the puzzle

The annotation layer did filter out a lot of useless noise, but the sheer number of candidates was still a serious problem. An agent can't walk through every candidate and reach a conclusion on each one. That is unrealistic, and extremely expensive.

Then I thought of a method I used all the time when reproducing 1-days: patch diffing. When I compare two firmware maps, the agent only has to look at what changed to easily find which vulnerabilities were patched. And because the filtering and reachability information for dangerous calls is kept, it can also check whether a patch fully fixed the vulnerability, and whether it might be bypassed. This made the tool far more usable. The last piece of the puzzle was in place.

> I set out to build a tool that would replace me. What I ended up building is a tool that makes me stronger than I was before.

## Thanks

I know very well that Treasure Map still has a great many problems, so I will listen carefully to every piece of feedback from every user. Thank you for reading this far.

The hardest part is always taking the first step. Here's to every one of us still on the road.
