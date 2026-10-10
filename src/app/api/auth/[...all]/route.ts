// Pintu API login: /api/auth/sign-in/email, /api/auth/sign-out, /api/auth/get-session, dll.
// Ini satu-satunya Route Handler yang tidak memakai requireRole(), karena justru dipakai untuk login.
import { toNextJsHandler } from "better-auth/next-js";
import { auth } from "@/lib/auth";

export const { GET, POST } = toNextJsHandler(auth);
