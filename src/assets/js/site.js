/* Treasure Map site: small progressive enhancements. Everything works without this file. */
(() => {
  "use strict";

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let i18n = {};
  try {
    i18n = JSON.parse($("#i18n")?.textContent || "{}");
  } catch (e) {}

  /* Header border once the page scrolls */
  const head = $(".site-head");
  if (head) {
    const onScroll = () => head.classList.toggle("is-scrolled", window.scrollY > 4);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* Copy buttons: on our code blocks, and on every <pre> in articles */
  const addCopy = (pre) => {
    if (pre.querySelector(".copy-btn")) return;
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "copy-btn";
    btn.setAttribute("data-copy", "");
    btn.innerHTML = `<span class="copy-label">${i18n.copy || "Copy"}</span>`;
    btn.setAttribute("aria-label", i18n.copy || "Copy");
    pre.appendChild(btn);
  };
  $$(".prose pre").forEach(addCopy);

  const copyText = async (text) => {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    ta.remove();
    return ok;
  };

  document.addEventListener("click", async (ev) => {
    const btn = ev.target.closest("[data-copy]");
    if (!btn) return;
    let text = btn.getAttribute("data-copy-text");
    if (text == null) {
      const code = btn.closest("pre, .codeblock")?.querySelector("code") || btn.closest("pre");
      text = (code?.innerText || "").replace(/\n$/, "");
    }
    const labelEl = btn.querySelector(".copy-label") || btn;
    let ok = false;
    try {
      ok = await copyText(text);
    } catch (e) {
      ok = false;
    }
    labelEl.textContent = ok ? i18n.copied || "Copied" : i18n.copyFailed || "Select and copy";
    btn.classList.toggle("is-done", ok);
    clearTimeout(btn._t);
    btn._t = setTimeout(() => {
      labelEl.textContent = i18n.copy || "Copy";
      btn.classList.remove("is-done");
    }, 1800);
  });

  /* Candidate list: select a row to read its facts; re-order by any layer.
     Re-ordering never adds or removes a row: that is the point it demonstrates. */
  const cand = $("[data-cand]");
  const dataEl = $("#cand-data");
  if (cand && dataEl) {
    let data;
    try {
      data = JSON.parse(dataEl.textContent);
    } catch (e) {
      data = null;
    }
    if (data) {
      const list = $("[data-list]", cand);
      const detail = $("[data-detail]", cand);
      const lens = $("[data-lens]", cand);
      const byId = Object.fromEntries(data.candidates.map((c) => [c.id, c]));
      const defaultOrder = data.candidates.map((c) => c.id);
      const L = data.L;
      let order = defaultOrder.slice();
      let selected = defaultOrder[0];

      // Which state draws attention first, per layer. Unknown always sits before the reassuring answer.
      const attention = {
        source: ["yes", "unknown", "no"],
        control: ["yes", "unknown", "no"],
        writer: ["unknown", "no", "yes"],
        reach: ["yes", "unknown", "no"],
        filter: ["no", "unknown", "yes"],
        complete: ["no", "unknown", "yes"],
      };

      const esc = (s) =>
        String(s).replace(/[&<>"]/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[ch]);
      const tri = (st) => `<span class="tri tri-${st}" aria-hidden="true">${st === "unknown" ? "?" : ""}</span>`;

      const renderDetail = () => {
        const c = byId[selected];
        const rank = order.indexOf(selected) + 1;
        const rows = data.layers
          .map((ly) => {
            const v = c.layers[ly.key];
            return `<div class="cd-layer is-${v[0]}"><dt>${tri(v[0])}<span class="cd-q">${esc(ly.long)}</span><span class="cd-state">${esc(data.states[v[0]])}</span></dt><dd>${esc(v[L])}</dd></div>`;
          })
          .join("");
        $('[data-d="rank"]', detail).textContent = `#${rank}`;
        $('[data-d="call"]', detail).textContent = c.call;
        $('[data-d="cls"]', detail).textContent = data.classes[c.cls];
        $('[data-d="path"]', detail).textContent = c.path;
        $('[data-d="fn"]', detail).textContent = c.fn;
        $('[data-d="off"]', detail).textContent = `+${c.off}`;
        $('[data-d="layers"]', detail).innerHTML = rows;
        $('[data-d="why"]', detail).textContent = c.why[L - 1];
        $('[data-d="ref"]', detail).textContent = c.ref;
        if (!reduceMotion) {
          detail.classList.remove("is-swapping");
          void detail.offsetWidth;
          detail.classList.add("is-swapping");
        }
      };

      // Narrow screens: the facts open under the chosen row, not below the whole list.
      const body = $(".cand-body", cand);
      const narrow = window.matchMedia("(max-width: 999px)");
      const placeDetail = () => {
        if (narrow.matches) {
          const row = $(`.cand-row[data-id="${selected}"]`, list);
          if (detail.parentElement !== row) row.appendChild(detail);
        } else if (detail.parentElement !== body) {
          body.appendChild(detail);
        }
      };
      narrow.addEventListener?.("change", placeDetail);

      const markSelected = () => {
        $$(".cand-btn", list).forEach((b) => {
          b.setAttribute("aria-pressed", String(b.closest(".cand-row").dataset.id === selected));
        });
      };

      const reorder = (key) => {
        // FLIP: remember where rows were, move them, animate from the old place.
        const rows = $$(".cand-row", list);
        const before = new Map(rows.map((r) => [r, r.getBoundingClientRect().top]));
        if (key === "default") {
          order = defaultOrder.slice();
        } else {
          const rankOf = attention[key];
          order = defaultOrder
            .slice()
            .sort(
              (a, b) =>
                rankOf.indexOf(byId[a].layers[key][0]) - rankOf.indexOf(byId[b].layers[key][0]) ||
                defaultOrder.indexOf(a) - defaultOrder.indexOf(b),
            );
        }
        order.forEach((id, i) => {
          const row = rows.find((r) => r.dataset.id === id);
          $("[data-rank]", row).textContent = String(i + 1);
          list.appendChild(row);
        });
        // Mark the lens column
        $$("[data-layer-col]", cand).forEach((el) => el.classList.toggle("is-lens", el.dataset.layerCol === key));
        rows.forEach((row) => {
          $$(".cr-layers .tri", row).forEach((t, i) => t.classList.toggle("is-lens", data.layers[i].key === key));
        });
        if (!reduceMotion) {
          rows.forEach((row) => {
            const dy = before.get(row) - row.getBoundingClientRect().top;
            if (!dy) return;
            row.style.transition = "none";
            row.style.transform = `translateY(${dy}px)`;
            requestAnimationFrame(() => {
              requestAnimationFrame(() => {
                row.style.transition = "";
                row.style.transform = "";
              });
            });
          });
        }
        renderDetail();
      };

      list.addEventListener("click", (ev) => {
        const btn = ev.target.closest(".cand-btn");
        if (!btn) return;
        selected = btn.closest(".cand-row").dataset.id;
        markSelected();
        placeDetail();
        renderDetail();
      });

      // Arrow keys move through the list
      list.addEventListener("keydown", (ev) => {
        if (ev.key !== "ArrowDown" && ev.key !== "ArrowUp") return;
        const btns = $$(".cand-btn", list);
        const i = btns.indexOf(document.activeElement);
        if (i < 0) return;
        ev.preventDefault();
        const next = btns[Math.max(0, Math.min(btns.length - 1, i + (ev.key === "ArrowDown" ? 1 : -1)))];
        next.focus();
        next.click();
      });

      lens?.addEventListener("change", () => reorder(lens.value));
      placeDetail();
    }
  }

  /* Article table of contents: highlight the heading in view */
  const toc = $(".art-toc");
  if (toc && "IntersectionObserver" in window) {
    const links = new Map($$("a", toc).map((a) => [decodeURIComponent(a.hash.slice(1)), a]));
    const heads = $$(".prose h2[id], .prose h3[id]");
    let active = null;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            active?.classList.remove("is-active");
            active = links.get(e.target.id) || null;
            active?.classList.add("is-active");
          }
        });
      },
      { rootMargin: "-80px 0px -70% 0px" },
    );
    heads.forEach((h) => io.observe(h));
  }
})();
