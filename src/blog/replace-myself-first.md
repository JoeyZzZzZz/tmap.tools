---
title: I Wanted to Replace Myself Before AI Did
description: How a binary vulnerability researcher came to build Treasure Map, from a book to a map, then an annotation layer and a patch diff.
date: 2026-10-15
translationKey: replace-myself-first
---

## How it started

It all came from a deep fear of AI and a deep uncertainty about the future.

I’m a binary vulnerability researcher. In May this year, using an agent together with a Ghidra MCP server, I found vulnerabilities in an IoT device with almost no effort, and exploited them successfully on my own device. In that moment I felt that AI was about to replace both me and my job.

I sank into confusion and unease, and an idea took shape in my mind:

> Rather than wait for AI to replace me, I would build a tool that replaced me first.

Models will keep getting stronger, and so will the harnesses and agents the model vendors build around them. A security tool that competes with the model on reasoning, or with the model vendors on harness, will sooner or later be replaced by the next version of some agent. So I built an MCP tool that does no reasoning and passes no judgment: [Treasure Map](https://github.com/JoeyZzZzZz/treasure-map).

## The first attempt

So I got to work. Drawing on how I work as a vulnerability researcher, I came up with an idea: treat the firmware as a book in which every page is one binary, and hand that book to AI to read. The AI could then tell me where the unpatched vulnerabilities were, which encryption algorithms the firmware used, and so on.

The steps were:

1. Scan the whole unpacked firmware filesystem and find every binary in it.
2. Reverse every binary in full with Ghidra, and store the pseudocode, AI-generated function summaries and the call relationships between functions in a database.
3. Have AI read the database, summarize what each binary and each of its functions does, and list the possible vulnerabilities along with the pseudocode behind them. Every binary and every function is saved as its own Markdown document.
4. Bundle all of those documents into an Obsidian vault, using backlinks to record the call relationships between functions and binaries. Open it, and you can read what each binary does and where it might be vulnerable, just like a book, and browse the call relationships in the graph view.
5. Build a chat agent that queries the database and answers questions.

It took me less than a month to build. When the agent came back with a pile of possible vulnerabilities and Obsidian filled up with analysis results, I was thrilled. But reality put that excitement out almost immediately: nearly all of them were false positives.

As I reviewed them one by one, I found that almost all of them only looked like problems. Either the input was filtered, or the entry point was unreachable, and on top of that there were plenty of hallucinations. This was not at all what I wanted, and I was lost again.

## Trying again, after some reflection

I looked back at what had been wrong with the design:

1. Any conclusion built on inaccurate judgments cannot be trusted.
2. The facts could only be yes or no. There was no honest “unknown”.
3. With this much data, a knowledge base for humans to read did little besides flatter my vanity.
4. The agents the model vendors build keep getting better. I should stand on the shoulders of giants.

So I changed direction and started building an MCP server for agents. That is how Treasure Map was born.

At first I still thought of the firmware as a book, sorted by danger: the higher something ranked, the more likely it was a real vulnerability. But I soon found that the top of the ranking was almost all false positives, while the real vulnerabilities were buried in a heap of unknowns where the agent had no way of finding them. Keeping the data truthful meant there would inevitably be a lot of unknowns, and once there were too many unknowns, there was nothing left to sort by.

After many revisions that failed to solve this, it was the project’s name that gave me the answer. Of course! **This is a map, not a book.**

A book is one-dimensional and linear. It has a single table of contents, and the AI reads it in order, from the first page to the last. A map is multidimensional and has no inherent order: the surveyor looks at the contour lines, the driver at the road network, the officer at the high ground, the hydrologist at the rivers… It is the same map, and each of them chooses their own view.

So I designed several views the agent could use to filter candidates, and let it choose which one to look through. By whether the dangerous call can be reached? By whether the argument is controllable? By whether anything filters it on the way? AI is smart enough now, so let it decide for itself.

Of course, once it was actually built, a lot of the data really couldn’t be obtained directly. It could only be worked out through dynamic reasoning and computation. But data obtained that way can’t be guaranteed to be accurate or reliable, so in the end I didn’t go that way. As a result, many views stayed unknown, and there were still far too many candidates.

## A flash of inspiration

Just as I was racking my brains over how to cut the number of candidates, my mind drifted back to my childhood, to the books I loved most as a kid: the *Tiger Team* mysteries by the Austrian writer Thomas Brezina. What has stayed with me most is their decoder card: lay it over the page at the right angle, and the puzzle solves itself.

Wait. A decoder card laid over a book doesn’t change what is printed on the page, yet it gives you something new. Isn’t that exactly what I need to filter the candidates?

That is how the annotation layer, laid over the fact layer, was born. The AI writes the judgments it reaches through analysis into this layer, so data that couldn’t be obtained before can now be reached by reasoning. The AI’s judgments also accumulate there, and can be reused even after you switch to a different agent. The two layers are completely isolated: changes to the annotation layer never affect the read-only fact layer. And any judgment can be checked against the fact layer at any time, which closes the loop of analysis, judgment and verification.

## The last piece of the puzzle

The annotation layer did filter out a lot of noise, but the sheer number of candidates was still a problem. An agent can’t walk through every candidate and reach a conclusion on each one. That is unrealistic, and extremely expensive.

Then I thought of a method I used all the time when reproducing 1-day vulnerabilities: patch diffing. Lay two firmware maps side by side, and the agent only has to look at what changed to find which vulnerabilities were patched. And because the filtering and reachability information for dangerous calls is kept, it can also check whether a patch fully fixed the vulnerability, and whether it might be bypassed. This made the tool far more usable. The last piece of the puzzle was in place.

I have since audited devices across several different architectures, and the results surprised me. It found the vulnerabilities each patch fixed publicly, pinpointed undisclosed ones that had been quietly patched, and even caught new vulnerabilities and attack surface introduced by new features and code.

> I set out to build a tool that would replace me. What I ended up building is a tool that makes me stronger than I was before.

## Thanks

I know Treasure Map still has plenty of problems, so I read every piece of feedback carefully. If you run into a problem or have a suggestion, please open an issue on [GitHub](https://github.com/JoeyZzZzZz/treasure-map/issues).

Thank you for reading this far. If you found it helpful, a star on [GitHub](https://github.com/JoeyZzZzZz/treasure-map) means a lot.
