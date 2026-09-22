/// <reference types="vitest" />
import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { VitePWA } from 'vite-plugin-pwa';
import { resolve } from 'node:path';

export default defineConfig({
  resolve: {
    alias: {
      $lib: resolve(__dirname, 'src/lib')
    }
  },
  plugins: [
    svelte(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Libreta de Notas',
        short_name: 'Notas',
        description:
          'Calculadora chilena de notas: convierte puntajes a escala 1,0–7,0, calcula promedios y resuelve qué nota necesitas para llegar a tu meta.',
        lang: 'es-CL',
        theme_color: '#0A1220',
        background_color: '#0A1220',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        scope: '/',
        icons: []
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,webmanifest}']
      },
      devOptions: {
        enabled: false
      }
    })
  ],
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.test.ts']
  }
});
