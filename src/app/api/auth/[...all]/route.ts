import { auth } from "@/lib/auth"; // Ganti jadi '../../../../../lib/auth' jika jalan pintas @/ error
import { toNextJsHandler } from "better-auth/next-js";

export const { POST, GET } = toNextJsHandler(auth);