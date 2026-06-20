import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [
      react(), 
      tailwindcss(),
      {
        name: 'save-ui-overrides',
        configureServer(server) {
          server.middlewares.use(async (req, res, next) => {
            if (req.url === '/api/save-ui-overrides' && req.method === 'POST') {
              let body = '';
              req.on('data', chunk => {
                body += chunk;
              });
              req.on('end', () => {
                try {
                  const data = JSON.parse(body);
                  const filePath = path.resolve(__dirname, 'src/lib/ui-registry.ts');
                  
                  const fileContent = `/**
 * UI Override Registry
 * 
 * This file serves as the "root source of truth" for UI customizations.
 * When a user edits text or hides elements via the "Edit Form" UI, 
 * the changes are automatically migrated here via the Save button.
 */

export type UIOverride = {
  text?: string;
  hidden?: boolean;
  styles?: any;
};

export const UI_OVERRIDES: Record<string, UIOverride> = ${JSON.stringify(data, null, 2)};

/**
 * Helper to get an override for a given default text
 */
export function getUIOverride(defaultText: string): UIOverride | undefined {
  return UI_OVERRIDES[defaultText];
}
`;
                  fs.writeFileSync(filePath, fileContent, 'utf-8');
                  res.writeHead(200, { 'Content-Type': 'application/json' });
                  res.end(JSON.stringify({ status: 'ok', message: 'تنظیمات با موفقیت ذخیره شدند!' }));
                } catch (err: any) {
                  res.writeHead(500, { 'Content-Type': 'application/json' });
                  res.end(JSON.stringify({ error: err.message }));
                }
              });
            } else {
              next();
            }
          });
        }
      }
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
