import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
    baseURL: "http://localhost:3000" // Alamat lokal server Anda
});

export const { signIn, signOut, useSession } = authClient;