---
title: CVE-2021-26614“已修复”，后门还在固件里
description: 一个便宜的通用模型配上 Treasure Map，花 ¥3.55 读完 ipTIME C200 从 1.058 到 1.060 的补丁：三处看起来像安全修复的改动，没有一处修完。144 条必读项全部判读完，跳过的 3358 条也记在账上。
highlights:
  - 唯一的安全修复只删了后门的入口，处理函数和硬编码口令原样留着，到 2026 年的 1.094 还在
  - 看起来像溢出修复的改动只把缓冲区改大，往里拷贝时仍不检查长度
  - 输入校验只加在浏览器里，服务端一个字节没变；同一表单里能打到 root 命令的字段，两边都没人管
date: 2026-11-08
translationKey: iptime-c200-patch-diff
---

2021 年 5 月，ipTIME 在 C200 网络摄像机的 1.060 固件里修复了 CVE-2021-26614：一个不用登录就能执行任意命令的调试后门。五年后，2026 年 6 月发布的最新固件 1.094 里，这个后门的代码还在。

我们把这次补丁交给一个普通模型，看它配上 Treasure Map 能读出多少。模型是 DeepSeek-V4.1-Flash，通用模型，不是安全专用，也不是最强的那一档。没有专家介入，也没写长提示词，任务只有一句话：对比 1.058 和 1.060，找出补丁修了什么、修得完不完整、新增代码有没有带来新的攻击面。整趟花了 ¥3.55。

它交回的报告里，分量最重的一条结论是：补丁动了三处看着像安全修复的地方，没有一处修完。

<ol class="findings wide">
<li><a href="#finding-backdoor"><span class="x-mark" aria-hidden="true"></span><span class="fd-t">后门只断了链，没拆</span><span class="fd-d">唯一的安全修复把后门的调用删了，但处理函数和硬编码口令还原样留在固件里。</span></a></li>
<li><a href="#finding-buffer"><span class="x-mark" aria-hidden="true"></span><span class="fd-t">缓冲区改大了，没改安全</span><span class="fd-d">一处改动看着像溢出修复，其实只把栈缓冲区改大，往里拷数据那步仍然不检查长度。</span></a></li>
<li><a href="#finding-frontend"><span class="x-mark" aria-hidden="true"></span><span class="fd-t">校验只加在浏览器里</span><span class="fd-d">服务端 CGI 两版逐字节相同；同一表单里更危险的那个字段，两边都没校验。</span></a></li>
</ol>

报告最后附了一段覆盖声明，写明审到了哪一步：144 条必读项逐条判读完；第二层的 3358 条没有扫，也明确标了出来。下面是完整记录，从解包好的固件目录开始，中间没有人工挑候选。

## 这次跑的是什么

<div class="run wide">
<dl class="run-facts">
<div><dt>被测设备</dt><dd><b>ipTIME C200</b>网络摄像机，EFM Networks，MIPS</dd></div>
<div class="run-wide"><dt>固件</dt><dd><span class="fw-pair"><span class="fw"><code>c200_1_058.bin</code><small>2021-05-12</small></span><span class="fw-arrow" aria-label="到">→</span><span class="fw"><code>c200_1_060.bin</code><small>2021-05-20</small></span></span></dd></div>
<div><dt>模型</dt><dd><b>DeepSeek-V4.1-Flash</b>通用模型，不是安全专用，也不是顶级档</dd></div>
<div><dt>Harness</dt><dd><b>DeepSeek Harness（DSH）</b>8 个并行 worker 分片</dd></div>
<div><dt>模型手里有什么</dt><dd><b>Treasure Map 的 MCP 工具</b>加一句自然语言任务</dd></div>
</dl>
<ul class="run-nums">
<li><span class="rn-n">110 → 4</span><span class="rn-t">二进制总数，和其中有变化的</span></li>
<li><span class="rn-n">144<span class="rn-of"> / 144</span></span><span class="rn-t">必读项，逐条判读完（must_read_complete）</span></li>
<li><span class="rn-n">23</span><span class="rn-t">判为真有代码改动的函数对</span></li>
</ul>
</div>

选普通模型是有意为之。Treasure Map 自己不推理、不下判断，只把事实交给 agent，并标出它看不到的地方。模型不强，结论也能站得住，靠的就是这些事实。

<figure class="wide">
<img src="/assets/img/sc-cost.png" alt="deepseek 用量看板：昨天，API Key dsh，消费 ¥3.55，API 请求 494 次，Tokens 48,782,172，模型 deepseek-flash">
<figcaption>这趟审计的账单，截自用量看板：494 次 API 调用、4878 万 tokens，一共 <b>¥3.55</b>（约 0.5 美元），全部花在 deepseek-flash 上。读完 144 条必读项、找出三处没修完的修复，花的钱不够买一杯咖啡。</figcaption>
</figure>

## 补丁改了什么

这次改动很少：110 个二进制里只有 4 个有变化（`Challenge`、`camctrl`、`iux_get.cgi`、`netinit`），其余逐字节相同；非二进制文件有 76 个差异，其中 65 个只是缓存戳。光 `Challenge` 一个就被标出 2262 个“变化”的函数对，但把地址归一化以后，几乎全是重编译位移，真正带 sink 变化的只有 1 处。agent 把必读项逐条读完，落到三件事上。

<h3 id="finding-backdoor" class="finding-h"><span class="x-mark" aria-hidden="true"></span><a class="header-anchor" href="#finding-backdoor">CVE-2021-26614：后门只断了链，代码还在</a></h3>

`iux_get.cgi` 里藏着一个调试后门。它的入口在主函数做任何会话校验**之前**：请求只要带上一组特定的菜单参数，就会直接转进一个调试处理函数，后面的权限检查全被跳过。这个处理函数只靠一个硬编码口令把门，打开后能做两件事：未认证读取设备上的任意文件，以及执行任意命令。Web 服务器这一层对 `/cgi/` 没有加 HTTP 鉴权，鉴权全靠 CGI 自己做，而后门正好排在鉴权前面。所以在 1.058 上，这是一个预认证的远程命令执行，外加任意文件读取，公开编号 CVE-2021-26614。

**更正 NVD：** 固件里这个文件叫 `iux_get.cgi`（是 x，不是 s），两版的扫描日志里都是这个名字。NVD 把它写成了 `ius_get.cgi`，本文统一用固件里的真实名字。

1.060 的补丁删掉了主函数里进入后门的那条分支，请求再也走不进去。但后门本身没删：

<figure class="pchart wide">
<div class="pc-cols">
<div class="pc-col">
<p class="pc-ver">1.058</p>
<ol class="pc-chain">
<li class="pc-n">HTTP 请求</li>
<li class="pc-e">带上一组特定的菜单参数</li>
<li class="pc-n"><code>iux_get.cgi</code> 主函数<small>此时还没做会话校验</small></li>
<li class="pc-e">直接转进调试处理函数</li>
<li class="pc-n">调试处理函数<small>只靠一个硬编码口令把门</small></li>
<li class="pc-e"></li>
<li class="pc-n">未认证读任意文件，执行任意命令</li>
</ol>
</div>
<div class="pc-col">
<p class="pc-ver">1.060</p>
<ol class="pc-chain">
<li class="pc-n">HTTP 请求</li>
<li class="pc-e">带上同样的菜单参数</li>
<li class="pc-n"><code>iux_get.cgi</code> 主函数</li>
<li class="pc-e is-cut">进入后门的分支已删除</li>
<li class="pc-n is-idle is-hit"><span class="x-mark" aria-hidden="true"></span>调试处理函数<small>伪代码和 1.058 完全一致，只是没了调用者；口令、调试表单、命令执行都还在</small></li>
</ol>
</div>
</div>
<figcaption>实线框是走得到的代码，虚线框是还在固件里、但已经没有调用者的代码。</figcaption>
</figure>

处理函数的伪代码和 1.058 完全一致（`pseudocode_sameness: identical`，只有地址整体下移），`system()` 调用点、两处 path sink、硬编码口令比较全都保留，只是失去了唯一的调用者。Treasure Map 把它标成 `lost_every_direct_caller`（失去了全部直接调用者）：交叉引用里 0 个调用者，数据段里没有哪个字保存它的入口地址，调度分组里也没有它，据此可以确认它当前不可达。agent 还指出特征字符串仍在镜像里，建议把整段代码连同口令一起删掉。

这个“不可达”有前提，报告里也写明了：函数指针表和间接调用是工具的盲区，所以它只能说“在已读到的直接调用、数据字和调度表里不可达”。以后哪次重构又接回一个调用点，后门就会复活。换成普通 diff 工具，你只会看到主函数短了一百来字节。

这个删了一半的状态，五年都没收尾。到 2026 年 6 月的最新固件 1.094，后门处理函数还躺在镜像里，入口也没有接回，和 1.060 一模一样。

<h3 id="finding-buffer" class="finding-h"><span class="x-mark" aria-hidden="true"></span><a class="header-anchor" href="#finding-buffer">把缓冲区改大了，没改安全</a></h3>

这是最容易被当成“已修复”放过去的一处。`Challenge`（跑在设备上的主服务进程）里有一个处理网络请求的函数，1.060 把它用到的一个栈缓冲区改大了一截。单看这步，像极了一次缓冲区溢出修复。

但 Treasure Map 摆出的事实是：往这个缓冲区里拷数据的那一步，两版一模一样，仍然按请求里那段**长度完全由客户端决定**的字符串整段拷贝，没有任何长度上界。

<figure class="pchart wide">
<div class="pc-cols">
<div class="pc-col">
<p class="pc-ver">1.058</p>
<ol class="pc-chain">
<li class="pc-n">请求里一段客户端可控的字符串<small>长度随意</small></li>
<li class="pc-e">整段拷入，不检查长度</li>
<li class="pc-n">一个栈缓冲区</li>
</ol>
</div>
<div class="pc-col">
<p class="pc-ver">1.060</p>
<ol class="pc-chain">
<li class="pc-n">同样一段客户端可控的字符串<small>长度随意</small></li>
<li class="pc-e">整段拷入，还是不检查长度</li>
<li class="pc-n is-hit"><span class="x-mark" aria-hidden="true"></span>同一个栈缓冲区，补丁把它改大了一截<small>缓冲区变大，拷贝仍没有上界：门槛抬高了，洞没堵</small></li>
</ol>
</div>
</div>
<figcaption>补丁动的只有缓冲区大小（粗框）。往里拷数据那一步，两版一样，都没有长度检查。</figcaption>
</figure>

把缓冲区改大，只是让攻击者需要多塞几个字节才能越界，栈溢出本身还在。agent 把它判为一次**看起来像修复、其实无效**的改动。

出于负责任披露，这里不写具体是哪个函数、缓冲区多大、怎么构造请求：同款固件仍在售，这个洞大概率还活着。能说的是它怎么被发现的：Treasure Map 把“缓冲区改大了”和“拷贝仍没设上限”两条事实并排摆到 agent 面前，假修复就藏不住了。

<h3 id="finding-frontend" class="finding-h"><span class="x-mark" aria-hidden="true"></span><a class="header-anchor" href="#finding-frontend">校验只加在浏览器里，还漏了更危险的字段</a></h3>

账号名、密码、摄像头名的输入校验，从黑名单改成了白名单，看起来是在防注入。但改动只在浏览器端的 JS 里。服务端真正接收这些字段的 CGI（`iux_set.cgi`）两版完全一样，sha256 都没变。绕过页面、直接构造请求发给服务端，这层白名单就拦不住。

<figure class="pchart pc-merge wide">
<p class="pc-ver">1.060</p>
<div class="pc-grid">
<div class="pc-n">经过浏览器页面提交</div>
<div class="pc-n">直接构造请求发给服务端</div>
<div class="pc-e is-new">页面 JS 校验：黑名单改成白名单</div>
<div class="pc-e"><span class="x-mark" aria-hidden="true"></span>不经过页面，白名单不会执行</div>
<div class="pc-n pc-dst"><code>iux_set.cgi</code><small>和 1.058 逐字节相同，sha256 一致</small></div>
</div>
<figcaption>粗线是 1.060 改动的地方，只在浏览器这一侧；接收字段的服务端代码一行没动。</figcaption>
</figure>

更要命的是加固加错了地方。白名单管的是“摄像头名”，而**同一张表单里还有一个更危险的字段**：配置 NAS 时填的服务器地址。摄像头和 NAS 通信时，这个地址会被原样交给设备上以 root 运行的一条命令。两版里，接收和使用这个字段的服务端代码一个字都没改，前端也没给它加任何校验。也就是说，补丁给不太危险的字段补了前端白名单，却把同一表单里能打到 root shell 的那个字段，前后端都原样留着。

同样出于负责任披露，这里只说到“字段 → root 命令”这一层，不给可直接利用的细节。发现它靠的同样是并排摆着的事实：前端加了校验，服务端一个字节没变，危险字段没人管。三条放在一起，“只改了界面”就很明显了。

## 补丁还动了什么

除了上面三处，这次 diff 里还有几项值得记一笔的改动，都不构成可利用漏洞，但能说明补丁的全貌：

- **第一次对外开放 ONVIF Events。** 1.060 把 ONVIF 的事件订阅服务真正接通并对外宣告，而 1.058 里这套代码写好了却从不对客户端开放。新增代码本身是内存安全的（agent 核过那几处 `sprintf` 和缓冲区，不会溢出）。但它是一条此前不面向客户端的新协议面，值得单独审一遍：同一个 `Challenge` 里的 ONVIF 代码有过案底，公开的 KVE-2023-5458（KAIST 报给韩国 KISA，2024 年 1 月在固件 1.086 修复）就是 `Challenge` 解析 ONVIF 请求时的一处内存破坏。
- **一个编辑器残留文件泄露了内部信息。** 1.060 多出一个 `.ChkOned.sh.swp`（vim 交换文件），里面有脚本原文和开发者的源码树路径。它不在 web 目录下，没有执行路径，属于打包事故加信息泄露。
- **少了两条 `killall`。** wlan 重启路径不再强杀 `hostapd`/`udhcpd`，攻击面略减。
- **几个配置结构体各长了 4 字节。** 目标缓冲区同步变大，没有引入新的溢出。和上面那处“只改大、不设限”正好相反，这几处是改对了的。
- **camctrl 多了一个诊断选项。** 新代码，只有本地 root、且参数超长时才有一个不终止字符串的小隐患，风险很低。

## 它查了多少，没查多少

审计工具会出错；更麻烦的是，它不知道自己漏看了什么。这次工具把两版之间的 3502 个 diff 主体分成两层，上面一层是不能跳过的必读项。结果如下：

<figure class="ledger wide">
<p class="lg-head">工具把 3502 个 diff 主体分成两层</p>
<div class="lg-two">
<div class="lg-panel is-done">
<span class="lg-n">144<span class="lg-of"> / 144</span></span>
<span class="lg-cap">必读项 · 逐条判读完 <b>✓</b></span>
<span class="lg-bar" aria-hidden="true"></span>
</div>
<div class="lg-panel is-tail">
<span class="lg-n">3358</span>
<span class="lg-cap">第二层 · 未扫（按 k=4 未选中，需显式同意才扫）</span>
<span class="lg-bar" aria-hidden="true"></span>
</div>
</div>
<figcaption>两层按同一口径数 diff 主体：144（必读）＋ 3358（第二层）＝ 全部 3502。必读是工具判定“不能跳过”的那一层，144 条全部逐条判读完；另一层 3358 条明确标注没扫、没结论。抽样看全是构建戳、地址位移这类噪声，但工具不会把它算成“没问题”。</figcaption>
</figure>

审查结束时，Treasure Map 输出的覆盖声明原文：

```text
must-read 144 / disposed 144; all subjects 3502 / disposed 144; open audits off;
judged unread 0 (read in part 0); disagreements 0; reduce done; presence citations short 0;
basis incomplete 1; dangling 0 (changed_real 0); not listed 0;
verdicts disposed 23/121/0, recorded 23/121/0 (changed_real/no_real_change/inconclusive);
predicate v4 (k=4); server ca256d6946b5d3fc2d9410ea803c39eb210c8b14
must_read_complete = true
```

逐项看：

- 必读项一共 **144** 条，agent **全部**逐条判读完，`must_read_complete = true`。判读结果是 23 条“有实质代码改动”、121 条“没有实质改动”、0 条“结论不定”。
- 没扫的是第二层：**3358** 个成员（214 个工作单，桶类型 B2 / C22 / R1102 / S2232）。这是必读集合之外、按 predicate v4（k=4）没有被选中的条目；要扫需要你明确同意后再走一遍。抽样读过的都落在构建戳、`__LINE__` 位移、地址重定位这类噪声里，但工具没把它算成“没问题”。
- `dangling 0` 表示没有悬空的结论：每条判断都指向它依据的事实。这是标注层在写入时就强制的约束，不是跑完再补的检查。
- `basis incomplete 1` 是一条记账口径，不是漏读：`GetNetState` 有 46 行候选、超过单页 20 行上限，agent 分三页全部读完了，但工具只要有一页被截断就整次记为“部分读取”。

<figure class="wide">
<img src="/assets/img/sc-scope-zh.png" alt="agent 自己存盘的中文报告 fw_1 → fw_2：审查状态 must_read_complete = true（144/144），以及变更范围：110 个二进制里只有 Challenge、iux_get.cgi、camctrl、netinit 四个有改动">
<figcaption>agent 自己存盘的报告（节选）：上半是报告头，<code>must_read_complete = true（144/144）</code>，即必读全部判读完；下半是变更范围：110 个二进制里只有 4 个有改动，以及各自改了什么。本页的数字都出自这份报告，不是凭记忆敲的。（中间的判读明细一段按虚线略去）</figcaption>
</figure>

## 有没有 Treasure Map 的差别

<div class="versus wide">
<p class="vs-h">没有 Treasure Map</p>
<p class="vs-h">有 Treasure Map，这次的真实结果</p>
<p>Flash 档模型面对十万行 diff，大概率乱猜或者直接放弃</p>
<p>收敛到 4 个变化的二进制、23 处真实代码改动</p>
<p>2262 个 <code>changed</code> 全当成改动来读</p>
<p>认出几乎全是重编译位移，只有 1 处真带 sink 变化</p>
<p>看到“改了后门、加了校验”就当修好了</p>
<p>指出三处修复都不完整：后门只断链、缓冲区只改大没设限、校验只在前端</p>
<p>一句“我审完了”，没法核对</p>
<p>必读 144 条全部判读完，另把 3358 条第二层明确标为未扫</p>
</div>

## 怎么跑的：三条命令和一句话

整个过程就是两次 `tmap scan` 建图、一次 `tmap diff` 对比，再把任务交给 agent。

### 1. 扫描建图

两版固件各扫一次。扫描只需要做一次，之后同一份固件对比多少次都不用重扫。

```bash
tmap scan ~/fw/extractions/c200_1_058.bin.extracted/300000/squashfs-root/ -w fw_1
tmap scan ~/fw/extractions/c200_1_060.bin.extracted/300000/squashfs-root/ -w fw_2
```

扫描输出的最后一段 `[3/3] triage` 就是这一步的产物：按当前视角排好序的候选列表。完整输出里最长的两段已经折叠，并标了省略的行数：110 个二进制逐个反编译的进度，以及排在最前面的候选。

<details>
<summary>1.058 扫描的完整输出（1.060 结构相同，数字不同）</summary>

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
  ……（省略 344 行：110 个二进制逐个反编译、交叉引用、非二进制文件的进度）……
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
  ……（省略 41 行：排在最前面的 20 条候选）……

caveats (this map is honest but low-resolution — do not read it as complete):
  - demotion gate ~= only provably-constant this phase; proven-blocked / filter-dominates almost never fire, so junk that is merely 'washed' is NOT sunk
  - 'free' is OPTIMISTIC: convergence-transforms are not subtracted yet, so a value washed by inet_ntop / a whitelist / a fixed-width parse — or a PATH sanitized by basename / realpath / a traversal check — can still read as free
  - proven-'controllable' via web_settable proves only the KEY is user-settable (SaTC front-end x back-end cross), NOT that the getter->sink path is transform-free — a sanitizer between the getter and the sink can still neutralize it; and the all-binary cross may be slightly wide
  - filtering is ~= always '?': tmap does a generic name-match only and cannot prove a sanitizer covers the path — it does NOT save you from reading the filter code
  - triage RE-RANKS the view, it does not reduce candidates: only provably-safe items leave the first screen; every candidate stays listed and queryable

Note: candidates are leads for manual review, arranged by the current lens (switch it with --sort-by / --view / --filter) — NOT confirmed results, and the list is re-ranked, never reduced.
```

</details>

### 2. 一条命令对比两版

```bash
tmap diff --before fw_1 --after fw_2
```

这条命令在内部把 Ghidra、BinExport、BinDiff 串起来，中间文件不用你管。它先排除没变的：110 个二进制里有 106 个两边逐字节相同，直接跳过，真正进入对比的只有 4 个。

输出末尾的 `coverage` 一行是覆盖说明：每个带候选的二进制，要么对比过，要么已确认逐字节相同，不会有跳过了却不报的情况。

<details>
<summary><code>tmap diff</code> 的完整输出</summary>

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

### 3. agent 领工作单，逐条审

到这一步才用到模型。`start_diff_review` 把整对固件的必读项拆成一个个工作单发出来；agent 用 `get_diff_patch_view`、`get_pseudocode`、`get_xrefs` 看证据，用 `annotate_diff` 把结论写回标注层，直到 `next_unit=null`。这次用了 8 个并行 worker 分片，最后由人工复核。

agent 不用先读完整个事实层。它一次只看一个工作单，登记完再取下一个。什么时候停是事先定好的：必读项的队列空了就停，不由模型自己判断看够了没有。

<figure class="wide">
<img src="/assets/img/sc-agent.png" alt="DeepSeek Harness 会话截图：agent 用 start_diff_review 把必读项分成 8 个并行 worker 分片，逐条读材料再 annotate_diff，底部显示 pair-wide must-read 144 / disposed 42">
<figcaption>真实会话片段：agent 把必读集合分到 <b>8 个并行 worker</b> 上（worker 0–7），每个 worker 用 <code>start_diff_review</code> 领自己的工作单、逐条读材料再 <code>annotate_diff</code> 落判读；底部 <code>must-read 144 / disposed 42</code> 是当时的进度，一直推到 144/144 才停。模型是 DeepSeek-V4.1-Flash。</figcaption>
</figure>

## 自己复现

两版固件都能从 ipTIME 官网直接下载：

- [c200_1_058.bin（有漏洞的那版）](https://iptime.com/iptime/?pageid=2&page_id=126&keyword=C200&uid=24007&mod=document)
- [c200_1_060.bin（修补后的那版）](https://iptime.com/iptime/?pageid=2&page_id=126&keyword=C200&uid=24015&mod=document)

先用 binwalk 之类的工具解包，拿到两个 `squashfs-root/` 目录，然后：

```bash
tmap scan ~/fw/extractions/c200_1_058.bin.extracted/300000/squashfs-root/ -w fw_1
tmap scan ~/fw/extractions/c200_1_060.bin.extracted/300000/squashfs-root/ -w fw_2
tmap diff --before fw_1 --after fw_2
```

路径里的 `300000` 是 squashfs 在镜像里的偏移。binwalk 解出来的目录名可能和这里不同，按你本机的实际路径改。

对比跑完后，让你的 agent 去领工作单就行（MCP 服务器在安装时已由 `tmap init` 注册好）。这次给的任务就一句话：**对比这两版固件，找出修补了哪些漏洞，并说明补得完不完整，新增代码是否带来新的漏洞或攻击面。**

你应该会看到：106 个二进制因逐字节相同被跳过，4 个进入对比；`iux_get.cgi` 的主函数少了一条分支、后门处理函数却还在；`Challenge` 里一个栈缓冲区被改大、拷贝却没加上界；两处前端白名单在服务端没有任何配套。

## 这次没看到的

下面这些边界，和覆盖声明对得上：

<ul class="blind">
<li><b>第二层没扫</b>：3358 个成员（<code>S</code> 2232、<code>R</code> 1102、<code>C</code> 22、<code>B</code> 2）按 k=4 未被选中，没有逐条 annotate，服务端不算它“没问题”。</li>
<li><b>局部缓冲区大小</b>推不准。涉及栈上数组的判断，包括上面那处“改大没设限”到底能越界多少，只能靠人工读反编译。</li>
<li><b>sink 实参之外的长度常量</b>看不到，和缓冲区大小同一类盲区。</li>
<li><b>多跳数据流</b>超过一定深度就会断，跨函数传递的污点会丢。</li>
<li><b>间接派发表</b>，也就是函数指针表、注册式回调，看不穿。所以后门“不可达”只是“在已读到的路径里不可达”，不是绝对证明。</li>
<li><b>跨二进制的调用链</b>追不过去。</li>
<li><b><code>.ko</code> 内核模块</b>只做信息记录：17 个模块两版字节相同，没进对比主体。</li>
</ul>

这些都是 Treasure Map 已知的边界，工具的输出里都写了。列在这里，是为了让你清楚上面每个结论能信到哪一步。
