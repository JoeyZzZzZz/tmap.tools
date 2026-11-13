// Every user-facing string on the home page, in both languages.
// Wording follows the project README; HTML is allowed where a string needs code or emphasis.

export default {
  en: {
    htmlLang: "en",
    other: { lang: "zh", label: "中文", href: "/zh/" },
    meta: {
      title: "Treasure Map: a firmware map for your AI agent",
      description:
        "Treasure Map turns an unpacked firmware filesystem into facts your coding agent reads through a bundled MCP server: every dangerous call, where its data comes from, and what could not be determined.",
    },
    nav: { start: "Quick start", blog: "Blog", showcase: "Showcase", design: "Design", github: "GitHub", menu: "Menu" },
    skip: "Skip to content",
    copy: "Copy",
    copied: "Copied",
    copyFailed: "Select and copy",
    theme: { label: "Lights", toDark: "Turn the light off (dark mode)", toLight: "Turn the light on (light mode)" },

    hero: {
      title: "A firmware map for your AI agent",
      taglineTool: "Treasure Map draws the map;",
      taglineAgent: "your agent finds the treasure.",
      lede:
        "Treasure Map turns an unpacked firmware filesystem into facts your coding agent reads through a bundled MCP server: every dangerous call it recognizes, and where the data reaching that call comes from. Where it could not work something out, it says so. Give it two versions and it shows what the update changed around those calls. It runs no model and needs no API key.",
      installLabel: "Install",
      installNote:
        "Installs the <code>tmap</code> command, then <code>tmap init</code> sets up the toolchain, registers the MCP server with your agents and installs the diff-review skill. Restart your agent when it finishes.",
      ctaStart: "Quick start",
      ctaRepo: "Source on GitHub",
      worksWith: "Works with any agent that speaks MCP. <code>tmap init</code> sets up Claude Code, Codex, Cursor, Claude Desktop and dsh for you.",
    },

    arch: {
      toolSide: "Treasure Map, on your machine",
      toolNote: "No agent of its own, no model, no API key",
      inScan: "Unpacked firmware",
      inScanCode: "./firmware.extracted",
      inDiff: "Two releases",
      inDiffCode: "fw-v1, fw-v2",
      scan: "tmap scan",
      scanNote: "Ghidra, one pass per binary",
      diff: "tmap diff",
      diffNote: "Ghidra, BinExport, BinDiff",
      atlas: "Atlas",
      atlasCode: "~/.treasure-map/atlas.db",
      factLayer: "Fact layer",
      factTag: "read-only",
      factNote: "What scan and diff found, each fact pinned to a binary, function and address.",
      noteLayer: "Annotation layer",
      noteTag: "writable",
      noteNote: "Your agent’s judgments, each recording the facts it rests on.",
      relDown: "Facts are what judgments rest on",
      relBlock: "Annotations never alter a fact",
      mcp: "Bundled MCP server",
      down: "Facts: yes, no, or unknown with the reason",
      up: "Judgments: annotate, annotate_diff",
      agentSide: "Your agent",
      agentNote: "Claude Code, Codex, Cursor and others",
      agentDoes: "Reads the pseudocode, traces the input, decides which lead is a real bug, records why.",
      rule: "Facts are the tool’s job; judgment is the model’s.",
    },

    does: {
      title: "It does two things",
      map: {
        name: "Map one firmware",
        body:
          "Finds every place the compiled code runs a shell command, copies into a memory buffer, formats a string or opens a file by path, and marks each one with what is known, what is not, and why. Your agent picks the views it needs, reads the code, and records its judgments.",
        link: "How the map works",
      },
      diff: {
        name: "Diff two versions",
        body:
          "Lists every function that changed between two releases, grouped by what happened around its dangerous calls. Your agent reviews the few that changed, not the thousands that didn’t.",
        link: "How the diff works",
      },
    },

    map: {
      title: "The firmware map",
      intro:
        "Each candidate is one point on the map, annotated on several equal layers: where the data comes from, how much of it an attacker controls, who wrote the value, how the spot is reached, whether anything filters it on the way, and whether the function was fully analyzed. Each layer reads <b>yes</b>, <b>no</b> or an explicit <b>unknown</b> that says what is missing and why.",
      rules: [
        {
          head: "There is no score.",
          body: "The default view puts the highest-impact calls that nothing has proven safe first. Your agent can re-sort or filter by any layer.",
        },
        {
          head: "Re-sorting changes the order, never the set.",
          body: "A different order never hides a candidate. Only a filter you choose narrows the list.",
        },
        {
          head: "Only a proven-safe fact pushes a candidate down.",
          body: "An unknown never does, in any view: unknown is not safe.",
        },
      ],
      coverage:
        "Command-execution, buffer-copy and format-string calls come with in-function argument provenance. Path and file calls are covered for detection and ranking; their controllability comes from a text-level reading, and is marked as such.",
    },

    widget: {
      label: "Example: the candidate list your agent reads",
      note: "Illustrative data, not from real firmware. Field names simplified.",
      orderBy: "Order by",
      lensDefault: "Default view",
      count: (n) => `${n} of ${n} candidates in this view`,
      colRank: "#",
      colCall: "Call",
      colWhere: "Binary",
      ref: "evidence_ref",
      whyLabel: "Why it sits here",
      layersLabel: "Layers",
      selectHint: "Select a candidate to read its facts.",
      legendYes: "Yes",
      legendNo: "No",
      legendUnknown: "Unknown, with the reason",
    },

    states: { yes: "Yes", no: "No", unknown: "Unknown" },

    layers: [
      { key: "source", short: "Source", long: "Data comes from outside" },
      { key: "control", short: "Control", long: "An attacker controls it" },
      { key: "writer", short: "Writer", long: "Writer identified" },
      { key: "reach", short: "Reach", long: "The call is reached" },
      { key: "filter", short: "Filter", long: "Filtered on the way" },
      { key: "complete", short: "Complete", long: "Function fully analyzed" },
    ],

    classes: { cmd: "Command execution", copy: "Buffer copy", format: "Format string", path: "File path" },

    diff: {
      title: "The patch diff",
      intro:
        "<code>tmap diff</code> compares every binary whose content changed, in parallel, running Ghidra, BinExport and BinDiff end to end. You never handle an intermediate file. Your agent reads the few changes that matter instead of thousands of functions, and answers three questions:",
      questions: [
        "Is this a security fix, and which weakness in the old version does it close?",
        "Is the fix complete?",
        "Does the same call survive somewhere else?",
      ],
      funnelLabel: "How one real diff narrowed down",
      funnelNote: "Counts from the showcase run.",
      // One stage per column. Each mark in a stage's chart is one real item.
      stages: [
        {
          k: "Files",
          who: "Treasure Map",
          from: "110",
          to: "4",
          unit: "One square per binary",
          body: "Of 110 binaries, 106 were byte-identical on both sides and stayed out of the comparison. Only the 4 that changed went on to a function diff.",
        },
        {
          k: "Functions",
          who: "Treasure Map",
          from: "2262",
          to: "23",
          unit: "One dot per function pair",
          body: "The Challenge binary alone came back with 2262 function pairs marked changed. With addresses normalized, nearly all of them had only moved; 23 pairs were judged a real code change.",
        },
        {
          k: "Verdict",
          who: "Your agent",
          from: "23",
          to: "3",
          unit: "The same 23, enlarged",
          body: "Reading those 23, the agent’s report lands on three things, none of them a clean fix: a backdoor whose entry was deleted while its code stayed in, a buffer enlarged with no length check added, and validation added only in the browser.",
        },
      ],
      funnelFoot: "Treasure Map computes the first two steps, with no model involved. Only the last step is your agent’s judgment.",
      points: [
        {
          head: "A function-level patch view.",
          body: "One entry per changed function pair, grouped by what happened around its dangerous calls: a call that now goes somewhere else, a dangerous call that is still there, a reading that could not be decided. A function with no counterpart stays undetermined, never “removed” or “added”.",
        },
        {
          head: "What a similarity score misses.",
          body: "BinDiff can read <code>similarity=1.0</code> while a buffer length went from <code>0x40</code> to <code>0x3f</code>. Treasure Map compares address-normalized pseudocode and flags a changed length constant at a copy or format call.",
        },
        {
          head: "A review that knows what it skipped.",
          body: "The server picks the must-read changes, hands them out in work units and counts what has been judged. An unread change stays unread, never “nothing found”, and the review is not complete until the must-read list is done.",
        },
        {
          head: "Scripts and configs too.",
          body: "Non-binary files are compared by path between the two versions, and your agent can judge each one. A binary that could not be diffed is listed as such, never counted as unchanged.",
        },
      ],
      viewLabel: "Example: the patch view, grouped",
      viewNote: "Illustrative, not from real firmware.",
      viewOld: "Old version:",
      viewNew: "New version:",
      viewGroups: {
        retarget: { name: "A call now goes somewhere else", what: "Same call site; the new version calls a different function." },
        kept: { name: "A dangerous call is still there", what: "The call itself stayed; only an argument changed." },
        undecided: { name: "Could not be decided", what: "The two functions don’t line up reliably, so they are not forced into a comparison.", flag: "no comparison given" },
      },
      blindName: "Blind spots",
      viewBlind: {
        nodiff: "could not be diffed: listed here, not counted as unchanged",
        nopair: "no counterpart: undetermined, maybe inlined or moved",
      },
    },

    why: {
      title: "Why facts, not verdicts",
      intro:
        "A scanner hands you findings and a severity score, a verdict you then have to trust or re-check. A modern agent already reads one function well. What it cannot do on its own is cover a whole root filesystem (a hundred binaries, tens of thousands of functions) the same way twice, or tell you what it never looked at. So it stops after the first few leads, or reports “nothing found” for code it never read. That is the half Treasure Map does.",
      items: [
        {
          sym: "unknown",
          head: "Unknown is never safe.",
          body: "A fact it could not establish stays unknown. A binary the diff could not analyze never reads as unchanged.",
        },
        {
          sym: "lead",
          head: "Every result is a lead.",
          body: "A candidate is a lead to verify, not a confirmed vulnerability. A changed function is a change to review, not a confirmed fix. Reachability is graded one function at a time: this is not a taint-propagation engine, and it never claims a path is unreachable.",
        },
        {
          sym: "note",
          head: "Judgments that accumulate.",
          body: "Your agent’s conclusions live in an annotation layer over the read-only facts, so a multi-session audit picks up where it left off, with any model or agent. A judgment is flagged for review again the moment the facts under it change.",
        },
      ],
    },

    start: {
      title: "Quick start",
      steps: [
        {
          head: "Install",
          body: "One command installs Treasure Map; on the command line it is <code>tmap</code>. It then runs <code>tmap init</code>, which sets up JDK 21, Ghidra 11.4.3, BinExport and BinDiff 8, reusing what you already have, registers the MCP server with the agents you pick and installs the diff-review skill for those that read skills. Restart your agent when it finishes.",
          code: "INSTALL",
          lang: "shell",
        },
        {
          head: "Map a firmware",
          body: "The input is an already-extracted filesystem: unpack the image with any tool you like, or ask your agent to. <code>-w</code> is the name you give it.",
          code: "tmap scan ./firmware.extracted -w my-fw",
          lang: "shell",
          promptLabel: "Then ask your agent",
          prompt:
            "Audit firmware my-fw with Treasure Map.\nEnd with the leads worth following up, each with its evidence_ref and why.",
        },
        {
          head: "Diff two versions",
          body: "Scan both releases, then compare them. A firmware pair splits into one diff per changed binary; the non-binary files are compared on their own.",
          code: "tmap scan ./fw_v1.extracted -w fw-v1\ntmap scan ./fw_v2.extracted -w fw-v2\ntmap diff --before fw-v1 --after fw-v2",
          lang: "shell",
          promptLabel: "Then ask your agent",
          prompt:
            "Review the firmware diff fw-v1 → fw-v2 with Treasure Map:\nfind the security fixes, judge whether each one is complete,\nand check whether the new code adds attack surface.",
        },
      ],
      after: [
        "<code>scan</code> is the slow part: one Ghidra pass per binary, with progress shown. Re-running with the same <code>-w</code> resumes where it stopped. Everything you scan and diff accumulates in one atlas (<code>~/.treasure-map/atlas.db</code>), and your agent picks which firmware or diff to work on.",
      ],
    },

    details: {
      title: "Install details",
      platformsTitle: "Platforms",
      platforms: [
        ["Linux x86_64, including WSL2", "Supported", "yes"],
        ["macOS on Apple Silicon", "Supported", "yes"],
        ["macOS on Intel", "Runs the same toolchain; not acceptance-tested", "unknown"],
        ["Linux arm64, native Windows", "Not supported: no Ghidra decompiler or BinDiff build. On Windows use WSL2", "no"],
      ],
      setupTitle: "Setup",
      setup: [
        "Downloads come from pinned URLs and are checked against a pinned size and sha256 before anything is unpacked. <code>tmap init</code> shows its plan and changes nothing until you confirm; <code>--dry-run</code> only prints it.",
        "It registers the MCP server with Claude Code, Codex, Cursor, Claude Desktop and dsh. Any other MCP client runs <code>tmap mcp</code> from its config.",
      ],
      commandsTitle: "Upkeep",
      commands: [
        ["tmap doctor", "Check the toolchain, config and agent registrations. Changes nothing."],
        ["tmap update", "Install the newest version, then run its <code>tmap init</code>."],
        ["tmap rescan", "Re-scan the firmware the new version would map differently."],
        ["tmap uninstall", "Remove what <code>tmap init</code> installed. Your data stays."],
      ],
      readme: "Full flags, manual registration and troubleshooting are in the README.",
    },

    articles: {
      showcaseLead: "One run on public firmware, start to finish: every command and its output, what the agent found and the facts behind it, and what it did not reach.",
      showcaseCta: "Read the full run",
      blogTitle: "Blog",
      blogIntro: "Notes from building Treasure Map.",
      showcaseTitle: "Showcase",
      showcaseIntro: "Worked examples on public firmware: the inputs, the commands, what the map and the diff showed, and what the agent concluded.",
      designTitle: "Design notes",
      designIntro: "Why Treasure Map is built the way it is.",
      all: "All",
      read: "min read",
      empty: "Nothing published here yet.",
      toc: "On this page",
      translation: "Read in Chinese",
      back: "Back to",
      published: "Published",
      updated: "Updated",
    },

    use: {
      title: "Intended use",
      body:
        "Treasure Map supports defensive security auditing and vulnerability research on firmware. It produces analysis leads; by design it does not generate proof-of-concept exploits, payloads, shellcode, or other directly weaponizable output. Only analyze firmware you lawfully possess: a device you own, or firmware made genuinely public by its vendor and obtained without bypassing any login, paywall or access control. Findings are candidates, not verdicts, and need independent human verification. The tool is provided as is, without warranty.",
      link: "Full notice in the README",
    },

    footer: {
      preview:
        "Commands, config, the atlas database and MCP tool fields may still change between versions. See the changelog when you upgrade.",
      license: "Apache-2.0",
      changelog: "Changelog",
      contributing: "Contributing",
      issues: "Issues",
    },

    notFound: {
      title: "Page not found",
      body: "This address is not on the map. The page may have moved, or the link has a typo.",
      home: "Go to the home page",
    },
  },

  zh: {
    htmlLang: "zh-CN",
    other: { lang: "en", label: "English", href: "/" },
    meta: {
      title: "Treasure Map（藏宝图）：给 AI agent 的固件地图",
      description:
        "Treasure Map 把解包后的固件文件系统变成一组事实，通过内置的 MCP 服务器交给你的编程 agent：每一处危险调用，数据从哪来，以及哪些没能查清。",
    },
    nav: { start: "快速开始", blog: "博客", showcase: "案例", design: "设计理念", github: "GitHub", menu: "菜单" },
    skip: "跳到正文",
    copy: "复制",
    copied: "已复制",
    copyFailed: "请手动选中复制",
    theme: { label: "灯", toDark: "关灯（深色模式）", toLight: "开灯（浅色模式）" },

    hero: {
      title: "给 AI agent 的固件藏宝图",
      taglineTool: "Treasure Map 画地图，",
      taglineAgent: "你的 agent 去寻宝。",
      lede:
        "Treasure Map 把解包后的固件文件系统整理成一组事实，通过内置的 MCP 服务器交给你的编程 agent：它识别出的每一处危险调用，以及流进这些调用的数据从哪里来。没能查清的地方，它会明确写出来。给它两个版本，它会标出这次更新在这些调用附近改了什么。它不运行任何模型，也不需要 API key。",
      installLabel: "安装",
      installNote: "装好 <code>tmap</code> 命令后自动运行 <code>tmap init</code>：配置工具链，把 MCP 服务器注册到你的 agent，并装上 diff 审查 skill。完成后重启 agent。",
      ctaStart: "快速开始",
      ctaRepo: "GitHub 源码",
      worksWith: "任何支持 MCP 的 agent 都能用；Claude Code、Codex、Cursor、Claude Desktop 和 dsh 由 <code>tmap init</code> 直接配好。",
    },

    arch: {
      toolSide: "Treasure Map，运行在你的机器上",
      toolNote: "不带自己的 agent，不运行模型，不需要 API key",
      inScan: "解包后的固件",
      inScanCode: "./firmware.extracted",
      inDiff: "两个版本",
      inDiffCode: "fw-v1, fw-v2",
      scan: "tmap scan",
      scanNote: "每个二进制跑一遍 Ghidra",
      diff: "tmap diff",
      diffNote: "Ghidra、BinExport、BinDiff",
      atlas: "Atlas",
      atlasCode: "~/.treasure-map/atlas.db",
      factLayer: "事实层",
      factTag: "只读",
      factNote: "扫描和对比得出的事实，每条都指向具体的二进制、函数和地址。",
      noteLayer: "标注层",
      noteTag: "可写",
      noteNote: "你的 agent 写下的判断，每条都记录它依据的事实。",
      relDown: "判断以事实为依据",
      relBlock: "标注层绝不影响事实层",
      mcp: "内置 MCP 服务器",
      down: "事实：是、否，或写明原因的未知",
      up: "判断：annotate、annotate_diff",
      agentSide: "你的 agent",
      agentNote: "Claude Code、Codex、Cursor 等",
      agentDoes: "读伪代码，追数据来源，判断哪条线索是真漏洞，并写下理由。",
      rule: "事实归工具，判断归模型。",
    },

    does: {
      title: "它做两件事",
      map: {
        name: "给一个固件画地图",
        body:
          "找出编译后代码里每一处执行 shell 命令、拷贝内存缓冲区、格式化字符串、按路径打开文件的地方，逐一标出哪些已经查清、哪些还不知道，以及为什么不知道。你的 agent 自己挑要看的视图，读代码，记下结论。",
        link: "了解固件地图",
      },
      diff: {
        name: "对比两个版本",
        body:
          "列出两个版本之间改动过的每个函数，按危险调用周围的变化分好组。agent 不必在几千个函数里大海捞针，只审改过的那几个。",
        link: "了解补丁对比",
      },
    },

    map: {
      title: "固件地图",
      intro:
        "每个候选是地图上的一个点，在几张同等重要的图层上各有一个读数：数据从哪来，攻击者能控制多少，这个值是谁写的，怎么走到这里，路上有没有过滤，这个函数有没有分析完整。每张图层只有三种读数：<b>是</b>、<b>否</b>，或者明确的<b>未知</b>；“未知”会写明缺什么、为什么没查到。",
      rules: [
        { head: "没有分数。", body: "默认视图把影响最大、又没有任何事实证明安全的调用排在最前面；agent 可以按任意图层重新排序或筛选。" },
        { head: "重新排序只改变顺序，不改变候选集合。", body: "换一种排序不会藏起任何候选；只有你主动选择的筛选才会缩小列表。" },
        { head: "只有已证明安全的事实能让候选下沉。", body: "无论在哪个视图里，“未知”都不会让候选下沉。未知不等于安全。" },
      ],
      coverage:
        "命令执行、内存拷贝、格式化字符串这三类调用，带有函数内的参数来源分析。路径和文件类调用目前只做检测和排序，它们的可控性只来自文本层面的读取，结果里会标明这一点。",
    },

    widget: {
      label: "示例：agent 读到的候选列表",
      note: "示意数据，并非来自真实固件；字段名做了简化。",
      orderBy: "排序方式",
      lensDefault: "默认视图",
      count: (n) => `本视图显示 ${n} / ${n} 个候选`,
      colRank: "#",
      colCall: "调用",
      colWhere: "二进制",
      ref: "evidence_ref",
      whyLabel: "为什么排在这里",
      layersLabel: "图层",
      selectHint: "选一个候选，查看它的事实。",
      legendYes: "是",
      legendNo: "否",
      legendUnknown: "未知，并写明原因",
    },

    states: { yes: "是", no: "否", unknown: "未知" },

    layers: [
      { key: "source", short: "来源", long: "数据来自外部" },
      { key: "control", short: "可控", long: "攻击者能控制" },
      { key: "writer", short: "写入者", long: "写入者已查明" },
      { key: "reach", short: "可达", long: "调用能被走到" },
      { key: "filter", short: "过滤", long: "途中有过滤" },
      { key: "complete", short: "完整", long: "函数已完整分析" },
    ],

    classes: { cmd: "命令执行", copy: "内存拷贝", format: "格式化字符串", path: "文件路径" },

    diff: {
      title: "补丁对比",
      intro:
        "<code>tmap diff</code> 会并行对比所有内容有变化的二进制，从 Ghidra、BinExport 到 BinDiff 全程自动完成，你不用碰任何中间文件。agent 不用在几千个函数里大海捞针，只读真正要紧的那几处改动，并回答三个问题：",
      questions: [
        "这是不是一次安全修复？它修掉的是旧版本里的哪个弱点？",
        "修得完不完整？",
        "同样的调用是不是还留在别处？",
      ],
      funnelLabel: "一次真实对比是怎么收敛的",
      funnelNote: "数字来自案例里的那次运行。",
      stages: [
        {
          k: "文件",
          who: "Treasure Map",
          from: "110",
          to: "4",
          unit: "每格一个二进制",
          body: "110 个二进制里，106 个两边逐字节相同，直接跳过；变了的只有 4 个，只有它们进入函数级对比。",
        },
        {
          k: "函数",
          who: "Treasure Map",
          from: "2262",
          to: "23",
          unit: "每点一对函数",
          body: "光 Challenge 这一个二进制，就有 2262 对函数被标为 changed。把地址归一化以后，绝大多数只是整体平移，判为真有代码改动的是 23 对。",
        },
        {
          k: "结论",
          who: "agent",
          from: "23",
          to: "3",
          unit: "把这 23 对放大",
          body: "agent 读完这 23 对，报告指向三处没修彻底的地方：删了入口、没删代码的后门；只把缓冲区改大、没加长度检查的假修复；只加在浏览器里的校验。",
        },
      ],
      funnelFoot: "前两步由 Treasure Map 算出，不经过模型。只有最后一步是 agent 的判断。",
      points: [
        {
          head: "函数级补丁视图。",
          body: "每对改动过的函数一条，按危险调用附近发生了什么分组：调用的目标换了，危险调用还在原处，或者无法判定。找不到对应函数的标为“未定”，绝不报成“删除”或“新增”。",
        },
        {
          head: "相似度看不到的改动。",
          body: "BinDiff 可能显示 <code>similarity=1.0</code>，而缓冲区长度已经从 <code>0x40</code> 改成了 <code>0x3f</code>。Treasure Map 额外比较地址归一化后的伪代码，并标出拷贝或格式化调用处被改动的长度常量。",
        },
        {
          head: "知道自己漏了什么的审查。",
          body: "服务器挑出必读的改动，按工作单元分发，并统计判过了多少。没读的改动就是“未读”，绝不算“没发现问题”；必读清单没读完，审查就不算完成。",
        },
        {
          head: "脚本和配置也比。",
          body: "非二进制文件按路径对比两个版本，每个文件都可以单独判断。没能对比的二进制会单独列出，绝不计为“没变”。",
        },
      ],
      viewLabel: "示例：分好组的补丁视图",
      viewNote: "示意，并非来自真实固件。",
      viewOld: "旧版本：",
      viewNew: "新版本：",
      viewGroups: {
        retarget: { name: "调用的目标换了", what: "同一处调用，新版本调到了另一个函数。" },
        kept: { name: "危险调用还在原处", what: "调用本身没换，只改了一个参数。" },
        undecided: { name: "无法判定", what: "两边的函数对不齐，不硬拿来比。", flag: "不给比较结果" },
      },
      blindName: "盲区",
      viewBlind: {
        nodiff: "没能对比：单独列出，不计为“没变”",
        nopair: "找不到对应函数：标为未定，可能被内联或挪走",
      },
    },

    why: {
      title: "为什么只给事实，不给结论",
      intro:
        "扫描器给你的是发现和严重程度评分，也就是一个结论，你要么信，要么自己再查一遍。如今的 agent 单看一个函数，已经读得懂、想得清；它自己做不到的，是把整个根文件系统（上百个二进制、几万个函数）每次都按同样的方式过一遍，并且说清自己哪里没看。于是它常常看完头几条线索就下结论，或者对根本没读过的代码报“没发现问题”。这一半由 Treasure Map 来做。",
      items: [
        { sym: "unknown", head: "“未知”绝不等于“安全”。", body: "没能确认的事实就保持“未知”；对比失败的二进制绝不显示为“没变”。" },
        {
          sym: "lead",
          head: "每个结果都是线索。",
          body: "候选是待验证的线索，不是确认的漏洞；改动过的函数是待审的改动，不是确认的修复。可达性按单个函数分级：这不是污点传播引擎，也从不声称某条路径不可达。",
        },
        {
          sym: "note",
          head: "判断会积累。",
          body: "agent 的结论存放在只读事实之上的标注层里，多次会话的审计可以从上次停下的地方继续，换模型、换 agent 都一样。底层事实一旦变化，压在上面的判断会被重新标为待复核。",
        },
      ],
    },

    start: {
      title: "快速开始",
      steps: [
        {
          head: "安装",
          body: "一条命令装好 Treasure Map，命令行里它叫 <code>tmap</code>。随后自动运行 <code>tmap init</code>：配置 JDK 21、Ghidra 11.4.3、BinExport 和 BinDiff 8（已经装好的直接复用），把 MCP 服务器注册到你选择的 agent，并给能读取 skill 的 agent 装上 diff 审查 skill。完成后重启你的 agent。",
          code: "INSTALL",
          lang: "shell",
        },
        {
          head: "给一个固件画地图",
          body: "输入是已经解包的文件系统（用你习惯的工具解包，或者让 agent 来解）。<code>-w</code> 是你给这个固件起的名字。",
          code: "tmap scan ./firmware.extracted -w my-fw",
          lang: "shell",
          promptLabel: "然后对你的 agent 说",
          prompt:
            "用 Treasure Map 审计固件 my-fw。\n最后列出值得跟进的线索，每条附上 evidence_ref 和理由。",
        },
        {
          head: "对比两个版本",
          body: "先分别扫描两个版本，再对比。一对固件会按二进制分成多个对比，非二进制文件单独对比。",
          code: "tmap scan ./fw_v1.extracted -w fw-v1\ntmap scan ./fw_v2.extracted -w fw-v2\ntmap diff --before fw-v1 --after fw-v2",
          lang: "shell",
          promptLabel: "然后对你的 agent 说",
          prompt:
            "用 Treasure Map 审查固件对比 fw-v1 → fw-v2：\n找出其中的安全修复，判断每处修得是否完整，\n并检查新代码有没有引入新的攻击面。",
        },
      ],
      after: [
        "<code>scan</code> 是最慢的一步：每个二进制跑一遍 Ghidra，会显示进度；用同一个 <code>-w</code> 重新运行会从中断处继续。你扫过、比过的所有结果都积累在同一个 atlas（<code>~/.treasure-map/atlas.db</code>）里，由 agent 自己选择看哪个固件、哪次对比。",
      ],
    },

    details: {
      title: "安装细节",
      platformsTitle: "平台",
      platforms: [
        ["Linux x86_64（含 WSL2）", "支持", "yes"],
        ["Apple Silicon 的 macOS", "支持", "yes"],
        ["Intel 的 macOS", "使用同一套工具链，未做验收测试", "unknown"],
        ["Linux arm64、原生 Windows", "不支持：Ghidra 反编译器和 BinDiff 都没有对应的构建。Windows 请用 WSL2", "no"],
      ],
      setupTitle: "安装",
      setup: [
        "所有下载都来自固定的 URL，解压前校验固定的文件大小和 sha256。<code>tmap init</code> 会先列出计划，你确认之前不做任何改动；<code>--dry-run</code> 只打印计划。",
        "MCP 服务器可以直接注册到 Claude Code、Codex、Cursor、Claude Desktop 和 dsh；其他 MCP 客户端，在配置里把启动命令写成 <code>tmap mcp</code> 即可。",
      ],
      commandsTitle: "日常维护",
      commands: [
        ["tmap doctor", "检查工具链、配置和 agent 注册情况，不做任何改动。"],
        ["tmap update", "装上最新版本，再运行它的 <code>tmap init</code>。"],
        ["tmap rescan", "升级后，重扫新版本会扫出不同结果的固件。"],
        ["tmap uninstall", "移除 <code>tmap init</code> 装的东西；你的数据会保留。"],
      ],
      readme: "完整的参数、手动注册方式和故障排查，见 README。",
    },

    articles: {
      showcaseLead: "在公开固件上从头跑到尾：命令和输出、agent 的发现和依据，还有它没看到的部分。",
      showcaseCta: "看完整记录",
      blogTitle: "博客",
      blogIntro: "做 Treasure Map 这一路上的记录。",
      showcaseTitle: "案例",
      showcaseIntro: "在公开固件上的完整案例：输入是什么，跑了哪些命令，地图和对比显示了什么，agent 得出了什么结论。",
      designTitle: "设计理念",
      designIntro: "Treasure Map 为什么这样设计。",
      all: "全部",
      read: "分钟阅读",
      empty: "这里还没有发布内容。",
      toc: "本页目录",
      translation: "阅读英文版",
      back: "返回",
      published: "发布于",
      updated: "更新于",
    },

    use: {
      title: "用途与法律声明",
      body:
        "Treasure Map 用于固件的防御性安全审计和漏洞研究。它产出的是分析线索；按设计，它不会生成漏洞利用 PoC、payload、shellcode 或其他可直接武器化的输出。只分析你合法持有的固件：你自己拥有的设备，或由厂商真正公开发布、且获取时没有绕过任何登录、付费墙或访问控制的固件。结果是候选，不是结论，需要独立的人工验证。本工具按“原样”提供，不附带任何担保。",
      link: "README 里的完整声明",
    },

    footer: {
      preview: "命令、配置文件、atlas 数据库和 MCP 工具的字段在版本之间仍可能变化，升级时请看更新日志。",
      license: "Apache-2.0",
      changelog: "更新日志",
      contributing: "参与贡献",
      issues: "Issues",
    },

    notFound: {
      title: "找不到这个页面",
      body: "这个地址不在地图上。页面可能已经移动，或者链接里有错字。",
      home: "回到首页",
    },
  },
};
