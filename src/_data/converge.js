// Geometry for the "how one real diff narrowed down" figure on the home page.
// Every mark is one real item from the recorded run: 110 binaries, 2262 function
// pairs (Challenge), 23 pairs judged a real code change. Where a solid mark sits
// inside its grid is arbitrary; only the counts are data. Text lives in i18n.js.

// Function pairs marked changed: 58 x 39 = 2262 exactly.
const FUNC_COLS = 58;
const FUNC_ROWS = 39;
// The 23 judged a real code change (changed_real), spread out so none clump.
const FUNC_SOLID = [
  [4, 2], [16, 3], [28, 2], [41, 4], [52, 1],
  [2, 11], [15, 10], [27, 12], [39, 10], [51, 11],
  [8, 18], [21, 20], [33, 17], [46, 19],
  [5, 27], [18, 28], [31, 28], [44, 29], [55, 27],
  [12, 36], [25, 37], [36, 36], [48, 35],
];
// Of the 23, the three that matter — all three incomplete fixes: the backdoor
// unlinked but not removed, the buffer enlarged with no bound, the frontend-only
// validation.
const VERDICT_HITS = new Set([3, 11, 19]);

// Expand a cols x rows grid into cells, marking the listed [col, row] pairs solid.
const grid = (cols, rows, solid) => {
  const on = new Set(solid.map(([c, r]) => `${c},${r}`));
  const cells = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) cells.push({ c, r, solid: on.has(`${c},${r}`) });
  }
  return cells;
};

const FILES = { cols: 11, rows: 10, solid: [[2, 1], [8, 3], [4, 6], [9, 8]] };
const VERDICT_COLS = 6;

export default {
  // Which showcase entry the counts come from (matched on translationKey).
  source: "iptime-c200-patch-diff",

  // Binaries in the filesystem: 11 x 10 = 110. Solid = changed (4).
  files: {
    cols: FILES.cols,
    rows: FILES.rows,
    cell: 20,
    count: FILES.cols * FILES.rows,
    kept: FILES.solid.length,
    cells: grid(FILES.cols, FILES.rows, FILES.solid),
  },

  funcs: {
    cols: FUNC_COLS,
    rows: FUNC_ROWS,
    cell: 10,
    count: FUNC_COLS * FUNC_ROWS,
    solid: FUNC_SOLID,
  },

  // The 23 again, enlarged; three of them are the findings that matter.
  verdict: {
    cols: VERDICT_COLS,
    rows: Math.ceil(FUNC_SOLID.length / VERDICT_COLS),
    cell: 40,
    cells: FUNC_SOLID.map((_, i) => ({ c: i % VERDICT_COLS, r: Math.floor(i / VERDICT_COLS), hit: VERDICT_HITS.has(i) })),
  },
};
