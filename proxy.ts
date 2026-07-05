export { auth as proxy } from "@/auth";

// No protected routes exist yet. Empty matcher means this proxy never
// actually runs on any request — it exists purely to demonstrate the wiring
// pattern. Populate this once a real protected page/route lands.
export const config = {
  matcher: [],
};
