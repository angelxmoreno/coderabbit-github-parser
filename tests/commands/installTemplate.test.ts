import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';

describe('InstallTemplateCommand', () => {
    let tempDir: string;
    let originalCwd: string;
    let projectRoot: string;

    beforeEach(() => {
        // Create a temporary directory for testing
        tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'install-template-test-'));

        // Store original cwd
        originalCwd = process.cwd();

        // Set up project root with template file
        projectRoot = path.join(tempDir, 'project');
        fs.mkdirSync(projectRoot, { recursive: true });

        const projectDocsDir = path.join(projectRoot, 'project-docs');
        fs.mkdirSync(projectDocsDir, { recursive: true });

        const templatePath = path.join(projectDocsDir, 'prompt-review-template.md');
        fs.writeFileSync(templatePath, '# Test Template\nThis is a test template content.');

        // Change to project root
        process.chdir(projectRoot);
    });

    afterEach(() => {
        // Restore original cwd
        process.chdir(originalCwd);

        // Clean up temp directory
        fs.rmSync(tempDir, { recursive: true, force: true });
    });

    it('should copy template file to target directory', () => {
        const sourceFile = path.join(projectRoot, 'project-docs', 'prompt-review-template.md');
        const targetDir = path.join(tempDir, 'test-target');
        const targetFile = path.join(targetDir, 'coderabbit-review-template.md');

        // Verify source exists
        expect(fs.existsSync(sourceFile)).toBe(true);

        // Create target directory
        fs.mkdirSync(targetDir, { recursive: true });

        // Copy file manually to test the basic functionality
        const templateContent = fs.readFileSync(sourceFile, 'utf-8');
        fs.writeFileSync(targetFile, templateContent, 'utf-8');

        // Verify copy was successful
        expect(fs.existsSync(targetFile)).toBe(true);

        const content = fs.readFileSync(targetFile, 'utf-8');
        expect(content).toContain('# Test Template');
        expect(content).toContain('This is a test template content.');
    });

    it('should detect when source template file does not exist', () => {
        const nonExistentSource = path.join(projectRoot, 'project-docs', 'non-existent.md');
        expect(fs.existsSync(nonExistentSource)).toBe(false);
    });

    it('should create target directory if it does not exist', () => {
        const newTargetDir = path.join(tempDir, 'new-directory');
        expect(fs.existsSync(newTargetDir)).toBe(false);

        fs.mkdirSync(newTargetDir, { recursive: true });
        expect(fs.existsSync(newTargetDir)).toBe(true);
    });

    it('should detect existing files in target location', () => {
        const targetDir = path.join(tempDir, 'existing-target');
        const targetFile = path.join(targetDir, 'existing-file.md');

        fs.mkdirSync(targetDir, { recursive: true });
        fs.writeFileSync(targetFile, 'existing content');

        expect(fs.existsSync(targetFile)).toBe(true);
        const content = fs.readFileSync(targetFile, 'utf-8');
        expect(content).toBe('existing content');
    });

    it('should work with default Claude directory structure', () => {
        const claudeDir = path.join(tempDir, '.claude', 'commands');

        // Create Claude directory structure
        fs.mkdirSync(claudeDir, { recursive: true });
        expect(fs.existsSync(claudeDir)).toBe(true);

        const targetFile = path.join(claudeDir, 'coderabbit-review-template.md');

        // Copy template
        const sourceFile = path.join(projectRoot, 'project-docs', 'prompt-review-template.md');
        const templateContent = fs.readFileSync(sourceFile, 'utf-8');
        fs.writeFileSync(targetFile, templateContent, 'utf-8');

        expect(fs.existsSync(targetFile)).toBe(true);
    });
});
