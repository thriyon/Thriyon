/**
 * Next.js instrumentation-client.ts
 * Runs on the CLIENT before any app code, suppressing known benign
 * Three.js / WebGL warnings that pollute the dev console.
 */

const SUPPRESSED_WARNINGS = [
  "THREE.Clock:",
  "THREE.THREE.Clock:",
  "non-static position",
];

const SUPPRESSED_ERRORS = [
  "THREE.WebGLProgram",
  "warning X4122",
];

const origWarn = console.warn.bind(console);
console.warn = (...args: unknown[]) => {
  const msg = typeof args[0] === "string" ? args[0] : "";
  if (SUPPRESSED_WARNINGS.some((s) => msg.includes(s))) return;
  origWarn(...args);
};

const origError = console.error.bind(console);
console.error = (...args: unknown[]) => {
  const msg = typeof args[0] === "string" ? args[0] : "";
  if (SUPPRESSED_ERRORS.some((s) => msg.includes(s))) return;
  origError(...args);
};
