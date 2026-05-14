// Stub for @payload-config — used only during Edge runtime webpack compilation.
// Prevents webpack from tracing payload.config.ts and its native deps (pg, crypto).
// At Node.js runtime, instrumentation.ts imports the real config (not this stub).
module.exports = {}
