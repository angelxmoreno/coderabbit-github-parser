#!/usr/bin/env bun

import * as fs from 'node:fs';
import * as path from 'node:path';

const distDir = 'dist';

// Clean dist directory
if (fs.existsSync(distDir)) {
    fs.rmSync(distDir, { recursive: true });
}
fs.mkdirSync(distDir, { recursive: true });

console.log('🔧 Building with Bun...');

try {
    // Build the CLI entry point
    const result = await Bun.build({
        entrypoints: ['./src/cli.ts'],
        outdir: './dist',
        target: 'bun',
        format: 'esm',
        splitting: false,
        sourcemap: 'external',
    });

    if (result.success) {
        console.log('✅ Build completed successfully!');

        // Make CLI executable and add shebang
        const cliPath = path.join(distDir, 'cli.js');
        if (fs.existsSync(cliPath)) {
            let cliContent = fs.readFileSync(cliPath, 'utf-8');
            if (!cliContent.startsWith('#!')) {
                cliContent = `#!/usr/bin/env bun\n${cliContent}`;
                fs.writeFileSync(cliPath, cliContent, 'utf-8');
            }

            // Make executable on Unix systems
            try {
                fs.chmodSync(cliPath, 0o755);
            } catch (_error) {
                // Ignore chmod errors on Windows
            }

            console.log(`📄 CLI available at: ${cliPath}`);
        }

        // Copy project-docs directory to ensure template is available
        const projectDocsSource = 'project-docs';
        const projectDocsDest = path.join(distDir, 'project-docs');

        if (fs.existsSync(projectDocsSource)) {
            fs.cpSync(projectDocsSource, projectDocsDest, { recursive: true });
            console.log(`📂 Copied ${projectDocsSource} to ${projectDocsDest}`);
        }
    } else {
        console.error('❌ Build failed');
        for (const message of result.logs) {
            console.error(message);
        }
        process.exit(1);
    }
} catch (error) {
    console.error('❌ Build failed with error:', error);
    process.exit(1);
}
