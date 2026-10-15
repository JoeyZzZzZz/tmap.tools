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
    nav: { start: "Quick start", showcase: "Showcase", design: "Design", github: "GitHub", menu: "Menu" },
    skip: "Skip to content",
    copy: "Copy",
    copied: "Copied",
    copyFailed: "Select and copy",
    theme: { dark: "Dark", light: "Light", toDark: "Switch to dark mode", toLight: "Switch to light mode" },

    hero: {
      title: "A firmware map for your AI agent",
      taglineTool: "Treasure Map draws the map;",
      taglineAgent: "your agent finds the treasure.",
      lede:
        "Treasure Map turns an unpacked firmware filesystem into facts your coding agent reads through a bundled MCP server: every dangerous call it recognizes, where the data reaching it comes from, and what it could not determine. Every fact points at an exact binary, function and address.",
      installLabel: "Install",
      installNote:
        "Installs <code>tmap</code>, then <code>tmap init</code> sets up the toolchain and registers the MCP server with your agents. No API key.",
      ctaStart: "Quick start",
      ctaRepo: "Source on GitHub",
      worksWith: "Works with any agent that speaks MCP, such as Claude Code, Codex, Cursor and dsh.",
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
      noteNote: "Your agent's judgments, each recording the facts it rests on.",
      relDown: "Facts are what judgments rest on",
      relBlock: "Annotations never alter a fact",
      mcp: "Bundled MCP server",
      down: "Facts: yes, no, or unknown with the reason",
      up: "Judgments: annotate, annotate_diff",
      agentSide: "Your agent",
      agentNote: "Claude Code, Codex, Cursor and others",
      agentDoes: "Reads the pseudocode, traces the input, decides which lead is a real bug, records why.",
      rule: "Facts are the tool's job; reasoning is the model's.",
    },

    does: {
      title: "It does two things",
      map: {
        name: "Map one firmware",
        body:
          "Every place the compiled code runs a shell command, copies into a memory buffer, formats a string or opens a file by path, each marked with what is known, what is not, and why. Your agent decides which view to review, reads the code, and records its verdicts.",
        link: "How the map works",
      },
      diff: {
        name: "Diff two versions",
        body:
          "Every function that changed between two releases, grouped by what happened around its dangerous calls. Instead of thousands of functions, your agent reviews the few that changed.",
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
      whyLabel: "Its place in the default view",
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
      { key: "writer", short: "Writer", long: "Writer of the value known" },
      { key: "reach", short: "Reach", long: "The call is reached" },
      { key: "filter", short: "Filter", long: "Filtered on the way" },
      { key: "complete", short: "Complete", long: "Function fully analyzed" },
    ],

    classes: { cmd: "Command execution", copy: "Buffer copy", format: "Format string", path: "File path" },

    diff: {
      title: "The patch diff",
      intro:
        "<code>tmap diff</code> compares every binary whose content changed, in parallel, running Ghidra, BinExport and BinDiff end to end. You never handle an intermediate file. Your agent then reviews only the functions that changed and answers the questions that matter:",
      questions: [
        "Is this a security fix, and which 1-day does it close in the old version?",
        "Is the fix complete, or does the same call survive somewhere else?",
        "Can the new check be bypassed?",
      ],
      exampleLabel: "Example: what a similarity score misses",
      exampleNote: "Illustrative pseudocode, not from real firmware.",
      before: "Before",
      after: "After",
      bindiff: "BinDiff similarity",
      tmapSays: "Treasure Map adds",
      flagSame: "Pseudocode, addresses normalized: similar, not identical",
      flagConst: "Length constant changed at a copy call",
      missesBody:
        "BinDiff's similarity ignores constants: a function can read <code>similarity=1.0</code> while a buffer length went from <code>0x40</code> to <code>0x3f</code>. Treasure Map adds an address-normalized pseudocode comparison, truly identical or only similar, and flags a changed length constant at a copy or format call.",
      points: [
        {
          head: "A function-level patch view.",
          body: "One entry per changed function pair, grouped by what happened around its dangerous calls: a call that now goes somewhere else, a dangerous call that is still there, a reading that could not be decided. An optional ordering puts the entries most likely to matter first.",
        },
        {
          head: "Blind spots stated, not hidden.",
          body: "A binary that could not be diffed is listed as such, never counted as unchanged. A function with no counterpart is undetermined, since it may have been inlined or moved, and is never reported as removed or added.",
        },
        {
          head: "Judgments that stay.",
          body: "Your agent records on each entry whether the change does something real, and can carry that judgment over to the affected candidate in the firmware map.",
        },
      ],
      viewLabel: "Example: the patch view, grouped",
      groups: [
        { name: "A call now goes somewhere else", rows: [["httpd", "FUN_0040b9e0", "strcpy() now calls snprintf()"]] },
        { name: "A dangerous call is still there", rows: [["httpd", "FUN_0040b2a4", "strncpy() length 0x40 to 0x3f"]] },
        { name: "Could not be decided", rows: [["upnpd", "FUN_00409a10", "function alignment not trustworthy"]] },
      ],
      blindName: "Blind spots",
      blind: [
        ["libcfg.so", "", "could not be diffed: listed, not counted as unchanged"],
        ["logd", "FUN_00410c00", "no counterpart: undetermined, maybe inlined or moved"],
      ],
    },

    why: {
      title: "Why facts, not verdicts",
      intro:
        "A scanner hands you findings and a severity score, a verdict you then have to trust or re-check. A modern agent already reads and reasons about one function well. What it cannot do is cover a whole root filesystem, or every changed binary between two releases, the same way twice, or say where it did not look. That is the half Treasure Map does.",
      items: [
        {
          sym: "unknown",
          head: "Unknown is never safe.",
          body: "A fact it could not establish stays unknown. A binary the diff could not analyze never reads as unchanged.",
        },
        {
          sym: "lead",
          head: "Leads, not verdicts.",
          body: "A candidate is a lead to verify, not a confirmed vulnerability. A changed function is a change to review, not a confirmed fix. Reachability is graded one function at a time: this is not a taint-propagation engine, and it never claims a path is unreachable.",
        },
        {
          sym: "note",
          head: "Judgments that accumulate.",
          body: "Your agent's conclusions live in an annotation layer over the read-only facts, so a multi-session audit picks up where it left off, with any model or agent. A judgment is flagged for review again the moment the facts under it change.",
        },
      ],
    },

    start: {
      title: "Quick start",
      steps: [
        {
          head: "Install",
          body: "One command installs <code>tmap</code> and runs <code>tmap init</code>, which sets up JDK 21, Ghidra 11.4.3, BinExport and BinDiff 8, reusing what you already have, and registers the MCP server with the agents you pick. Restart your agent when it finishes.",
          code: "INSTALL",
          lang: "shell",
        },
        {
          head: "Map a firmware",
          body: "The input is an already-extracted filesystem. Unpack the image first with any extraction tool you like.",
          code: "tmap scan ./firmware.extracted -w my-fw",
          lang: "shell",
          promptLabel: "Then ask your agent",
          prompt:
            "Audit firmware my-fw using treasure-map.\nWork down its ranked candidate list from the top:\nopen a lead's pseudocode, trace where its input comes from, and judge it yourself.\nThe candidates are leads to verify, not confirmed bugs.\nRecord each conclusion with annotate so the next session starts from it.",
        },
        {
          head: "Or diff two versions",
          body: "Scan both releases, then compare them.",
          code: "tmap scan ./fw_v1.extracted -w fw-v1\ntmap scan ./fw_v2.extracted -w fw-v2\ntmap diff --before fw-v1 --after fw-v2",
          lang: "shell",
          promptLabel: "Then ask your agent",
          prompt:
            "Review the diff fw-v1 → fw-v2 using treasure-map.\nStart from the function patch view (get_diff_patch_view):\nfor each changed function, compare the pseudocode of both versions\nand decide whether the change does something real, such as a new check or a changed bound.\nRecord each judgement with annotate_diff.",
        },
      ],
      after:
        "That is all you run by hand. <code>scan</code> is the slow part: one Ghidra pass per binary, with progress shown. Re-running with the same <code>-w</code> resumes where it stopped; a different <code>-w</code> keeps another firmware alongside. Everything you scan and diff accumulates in one atlas, and the agent picks which firmware or diff to work on.",
    },

    details: {
      title: "Install details",
      toolchainTitle: "Toolchain",
      toolchainNote:
        "<code>tmap init</code> installs these for you, or reuses what you already have if it passes the checks. Downloads come from pinned URLs and are checked against a pinned size and sha256 before anything is unpacked.",
      toolchainHead: ["Tool", "Version", "Used for"],
      toolchain: [
        ["JDK", "21 (a JDK, not a JRE)", "running Ghidra"],
        ["Ghidra", "11.4.3", "decompiling every binary, headless"],
        ["BinExport", "for Ghidra 11.4.3", "exporting binaries for <code>tmap diff</code>"],
        ["BinDiff", "8", "matching functions between two versions"],
      ],
      platformsTitle: "Platforms",
      platforms: [
        ["Linux x86_64, including WSL2", "Supported", "yes"],
        ["macOS on Apple Silicon", "Supported", "yes"],
        ["macOS on Intel", "Runs the same toolchain; not acceptance-tested", "unknown"],
        ["Linux arm64, native Windows", "Not supported: no Ghidra decompiler or BinDiff build. On Windows use WSL2", "no"],
      ],
      agentsTitle: "Agents",
      agentsBody:
        "<code>tmap init</code> lists Claude Code, Codex, Cursor, Claude Desktop and dsh, pre-selects those installed, and registers the server for the ones you keep. Any other MCP client can run <code>tmap mcp</code> from its JSON config.",
      commandsTitle: "Day to day",
      commands: [
        ["tmap doctor", "Re-runs every check and writes nothing."],
        ["tmap update", "Installs the newest tmap and re-runs init."],
        ["tmap rescan", "Re-scans every run an older tmap made."],
        ["tmap uninstall", "Removes the agent entries and the toolchain init downloaded. Your atlas and workspaces stay."],
      ],
      readme: "Full flags, manual registration and troubleshooting are in the README.",
    },

    articles: {
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
      title: "Treasure Map（藏宝图）：给 AI agent 的固件藏宝图",
      description:
        "Treasure Map 把解包后的固件文件系统变成一组事实，通过内置的 MCP 服务器交给你的编程 agent：每一处危险调用，数据从哪来，以及哪些没能查清。",
    },
    nav: { start: "快速开始", showcase: "Showcase", design: "设计理念", github: "GitHub", menu: "菜单" },
    skip: "跳到正文",
    copy: "复制",
    copied: "已复制",
    copyFailed: "请手动选中复制",
    theme: { dark: "深色", light: "浅色", toDark: "切换到深色模式", toLight: "切换到浅色模式" },

    hero: {
      title: "给 AI agent 的固件藏宝图",
      taglineTool: "地图标出地形",
      taglineAgent: "宝藏由你的 agent 去挖",
      lede:
        "Treasure Map 把解包后的固件文件系统变成一组事实，通过内置的 MCP 服务器交给你的编程 agent：它认得的每一处危险调用，流到那里的数据从哪来，以及同样重要的，哪些它没能查清。每条事实都指向具体的二进制、函数和地址。",
      installLabel: "安装",
      installNote: "装好 <code>tmap</code> 后自动运行 <code>tmap init</code>，配置工具链并把 MCP 服务器注册到你的 agent。不需要 API key。",
      ctaStart: "快速开始",
      ctaRepo: "GitHub 源码",
      worksWith: "支持任何能用 MCP 协议的 agent，例如 Claude Code、Codex、Cursor 和 dsh。",
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
      rule: "事实归工具，推理归模型。",
    },

    does: {
      title: "它做两件事",
      map: {
        name: "给一个固件画地图",
        body:
          "编译后的代码里每一处执行 shell 命令、拷贝内存缓冲区、格式化字符串、按路径打开文件的地方，都标明哪些已经查清、哪些还不知道、为什么。你的 agent 自行决定要审查的视图，读代码，记下结论。",
        link: "地图怎么用",
      },
      diff: {
        name: "对比两个版本",
        body:
          "两个版本之间所有改动过的函数，按危险调用附近发生了什么分好类。agent 不用在几千个函数里大海捞针，只需审改过的那几个。",
        link: "对比怎么用",
      },
    },

    map: {
      title: "固件地图",
      intro:
        "每个候选是地图上的一个点，带着几张平等的图层：数据从哪来，攻击者能控制多少，这个值是谁写的，怎么走到这里，路上有没有过滤，这个函数有没有分析完整。每张图层只有三种状态：<b>是</b>、<b>否</b>，或者明确的<b>未知</b>；“未知”会写明缺什么、为什么没查到。",
      rules: [
        { head: "没有分数。", body: "默认视图把影响最大、又没有任何事实证明安全的调用排在最前面；agent 可以按任意图层重新排序或筛选。" },
        { head: "重新排序只改变顺序，不改变候选集合。", body: "换一种排序不会藏起任何候选；只有你主动选择的筛选才会缩小列表。" },
        { head: "只有已证明安全的事实能让候选下沉。", body: "无论在哪个视图里，“未知”都不会让候选下沉。未知不等于安全。" },
      ],
      coverage:
        "命令执行、内存拷贝、格式化字符串这三类调用，带有函数内的参数来源分析。路径和文件类调用目前只做检测和排序，它们的可控性来自文本层面的读取，并且会如实标明。",
    },

    widget: {
      label: "示例：agent 读到的候选列表",
      note: "示意数据，并非来自真实固件；字段名做了简化。",
      orderBy: "排序方式",
      lensDefault: "默认视图",
      count: (n) => `本视图共 ${n} 个候选，一个不少`,
      colRank: "#",
      colCall: "调用",
      colWhere: "二进制",
      ref: "evidence_ref",
      whyLabel: "它在默认视图里的位置",
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
      { key: "writer", short: "写入者", long: "已知是谁写的值" },
      { key: "reach", short: "可达", long: "调用能被走到" },
      { key: "filter", short: "过滤", long: "途中有过滤" },
      { key: "complete", short: "完整", long: "函数已完整分析" },
    ],

    classes: { cmd: "命令执行", copy: "内存拷贝", format: "格式化字符串", path: "文件路径" },

    diff: {
      title: "补丁对比",
      intro:
        "<code>tmap diff</code> 会并行对比所有内容有变化的二进制，从 Ghidra、BinExport 到 BinDiff 全程自动完成，你不用碰任何中间文件。之后 agent 只需审改过的函数，回答真正重要的问题：",
      questions: [
        "这是不是一次安全修补，它修掉的是旧版本里的哪个 1day？",
        "修得够不够，同样的调用是不是还留在别处？",
        "新加的检查能不能被绕过？",
      ],
      exampleLabel: "示例：相似度看不到的改动",
      exampleNote: "示意伪代码，并非来自真实固件。",
      before: "旧版本",
      after: "新版本",
      bindiff: "BinDiff 相似度",
      tmapSays: "Treasure Map 补充",
      flagSame: "地址归一化后的伪代码：相似，但不相同",
      flagConst: "拷贝调用处的长度常量被改动",
      missesBody:
        "BinDiff 的相似度会忽略常量：一个函数可能显示 <code>similarity=1.0</code>，而缓冲区长度已经从 <code>0x40</code> 改成了 <code>0x3f</code>。tmap 额外做了地址归一化后的伪代码比较（真正相同，还是只是相似），并标出拷贝或格式化调用处被改动的长度常量。",
      points: [
        {
          head: "函数级补丁视图。",
          body: "每对改动过的函数一条，按危险调用附近发生了什么分组：调用的目标换了，危险调用还在原处，或者无法判定。可选的排序会把最可能重要的条目放在前面。",
        },
        {
          head: "盲区明说，不藏。",
          body: "没能对比的二进制会单独列出，绝不计为“没变”。找不到对应函数的，标为“未定”（可能被内联或挪走了），绝不报成“删除”或“新增”。",
        },
        {
          head: "判断留得下来。",
          body: "agent 在每个条目上记录这处改动有没有实际作用，并可以把判断带到固件地图里对应的候选上。",
        },
      ],
      viewLabel: "示例：分好组的补丁视图",
      groups: [
        { name: "调用的目标换了", rows: [["httpd", "FUN_0040b9e0", "strcpy() 改为调用 snprintf()"]] },
        { name: "危险调用还在原处", rows: [["httpd", "FUN_0040b2a4", "strncpy() 长度 0x40 改为 0x3f"]] },
        { name: "无法判定", rows: [["upnpd", "FUN_00409a10", "函数对齐结果不可信"]] },
      ],
      blindName: "盲区",
      blind: [
        ["libcfg.so", "", "没能对比：单独列出，不计为“没变”"],
        ["logd", "FUN_00410c00", "找不到对应函数：标为未定，可能被内联或挪走"],
      ],
    },

    why: {
      title: "为什么只给事实，不给结论",
      intro:
        "扫描器给你的是发现和严重程度评分，也就是一个结论，你要么信，要么自己再查一遍。现在的 agent 已经很擅长读懂并推理一个函数；它做不到的是把整个根文件系统、或者两个版本之间所有改动过的二进制，每次都按同样的方式扫一遍，并且说清自己哪里没看到。这一半由 Treasure Map 来做。",
      items: [
        { sym: "unknown", head: "“未知”绝不等于“安全”。", body: "没能确认的事实就保持“未知”；对比失败的二进制绝不显示为“没变”。" },
        {
          sym: "lead",
          head: "给线索，不给结论。",
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
          body: "一条命令装好 <code>tmap</code>，随后自动运行 <code>tmap init</code>：配置 JDK 21、Ghidra 11.4.3、BinExport 和 BinDiff 8（已经装好的直接复用），并把 MCP 服务器注册到你选择的 agent。完成后重启你的 agent。",
          code: "INSTALL",
          lang: "shell",
        },
        {
          head: "给一个固件画地图",
          body: "输入是已经解包的文件系统，请先用你习惯的工具解包固件镜像。",
          code: "tmap scan ./firmware.extracted -w my-fw",
          lang: "shell",
          promptLabel: "然后对你的 agent 说（这是 tmap init 打印的提示词，用中文说同样的意思也可以）",
          prompt:
            "Audit firmware my-fw using treasure-map.\nWork down its ranked candidate list from the top:\nopen a lead's pseudocode, trace where its input comes from, and judge it yourself.\nThe candidates are leads to verify, not confirmed bugs.\nRecord each conclusion with annotate so the next session starts from it.",
        },
        {
          head: "或者对比两个版本",
          body: "先分别扫描两个版本，再对比。",
          code: "tmap scan ./fw_v1.extracted -w fw-v1\ntmap scan ./fw_v2.extracted -w fw-v2\ntmap diff --before fw-v1 --after fw-v2",
          lang: "shell",
          promptLabel: "然后对你的 agent 说",
          prompt:
            "Review the diff fw-v1 → fw-v2 using treasure-map.\nStart from the function patch view (get_diff_patch_view):\nfor each changed function, compare the pseudocode of both versions\nand decide whether the change does something real, such as a new check or a changed bound.\nRecord each judgement with annotate_diff.",
        },
      ],
      after:
        "需要你手动运行的就这些。<code>scan</code> 是最慢的一步：每个二进制跑一遍 Ghidra，会显示进度。用同一个 <code>-w</code> 重新运行会从中断处继续；换一个 <code>-w</code> 就能并排保存另一个固件。你扫过、比过的所有结果都积累在同一个 atlas 里，由 agent 自己选择看哪个固件、哪次对比。",
    },

    details: {
      title: "安装细节",
      toolchainTitle: "工具链",
      toolchainNote:
        "<code>tmap init</code> 会替你安装这些工具；你已有的版本只要通过检查，就直接复用。所有下载都来自固定的 URL，解压前会校验固定的文件大小和 sha256。",
      toolchainHead: ["工具", "版本", "用途"],
      toolchain: [
        ["JDK", "21（必须是 JDK，不是 JRE）", "运行 Ghidra"],
        ["Ghidra", "11.4.3", "无界面反编译每个二进制"],
        ["BinExport", "对应 Ghidra 11.4.3", "为 <code>tmap diff</code> 导出二进制"],
        ["BinDiff", "8", "在两个版本之间匹配函数"],
      ],
      platformsTitle: "平台",
      platforms: [
        ["Linux x86_64（含 WSL2）", "支持", "yes"],
        ["Apple Silicon 的 macOS", "支持", "yes"],
        ["Intel 的 macOS", "使用同一套工具链，未做验收测试", "unknown"],
        ["Linux arm64、原生 Windows", "不支持：没有 Ghidra 反编译器 / BinDiff 的构建。Windows 请用 WSL2", "no"],
      ],
      agentsTitle: "Agent",
      agentsBody:
        "<code>tmap init</code> 会列出 Claude Code、Codex、Cursor、Claude Desktop 和 dsh，本机已安装的默认勾选，并为你保留的 agent 注册服务器。其他 MCP 客户端可以在 JSON 配置里运行 <code>tmap mcp</code>。",
      commandsTitle: "日常命令",
      commands: [
        ["tmap doctor", "重新运行所有检查，不写入任何内容。"],
        ["tmap update", "装上最新版 tmap，并重新运行 init。"],
        ["tmap rescan", "重新扫描旧版 tmap 生成的所有 run。"],
        ["tmap uninstall", "移除 agent 里的条目和 init 下载的工具链。你的 atlas 和工作区会保留。"],
      ],
      readme: "完整的参数、手动注册方式和故障排查，见 README。",
    },

    articles: {
      showcaseTitle: "Showcase",
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
