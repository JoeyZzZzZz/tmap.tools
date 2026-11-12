// The illustrative patch view on the home page (not from real firmware).
// Code is language-independent; group names and explanations live in i18n.js
// under diff.viewGroups / diff.viewBlind, keyed by id.
//
// del / add are one line each, split into segments: [text] or [text, true].
// A segment marked true is the part that changed: struck through on the old
// line, circled on the new one.

export default {
  groups: [
    {
      id: "retarget",
      where: ["httpd", "FUN_0040b9e0"],
      del: [["strcpy", true], ["(local_48, pcVar1);"]],
      add: [["snprintf", true], ["(local_48, "], ['0x40, "%s"', true], [", pcVar1);"]],
    },
    {
      id: "kept",
      where: ["httpd", "FUN_0040b2a4"],
      del: [["strncpy(local_48, pcVar1, "], ["0x40", true], [");"]],
      add: [["strncpy(local_48, pcVar1, "], ["0x3f", true], [");"]],
    },
    {
      id: "undecided",
      where: ["upnpd", "FUN_00409a10"],
    },
  ],
  blind: [
    { id: "nodiff", where: ["libcfg.so"] },
    { id: "nopair", where: ["logd", "FUN_00410c00"] },
  ],
};
