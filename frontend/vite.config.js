import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 8000, // 👈 Default port change
    allowedHosts: ['caringai.vansedemo.xyz','caringai.bidvoty.space'], // ✅ add your domain here
  },
});
