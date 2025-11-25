# Changelog

## [1.0.1](https://github.com/angelxmoreno/coderabbit-github-parser/compare/v1.0.0...v1.0.1) (2025-11-25)


### Bug Fixes

* fixed default naming of template ([5ff06dd](https://github.com/angelxmoreno/coderabbit-github-parser/commit/5ff06ddefc85f097045dd8b812ba133648572fff))
* fixed pino flush ([cee0604](https://github.com/angelxmoreno/coderabbit-github-parser/commit/cee0604bf02a75a48b5cadce3e469ad96115a198))
* fixed pino flush ([ffee759](https://github.com/angelxmoreno/coderabbit-github-parser/commit/ffee759daa89c5e4c1a3945f14fd29aee32b0ff8))
* fixed pino to catch and log once ([5a1567d](https://github.com/angelxmoreno/coderabbit-github-parser/commit/5a1567dea8e3c543832e79145348251f14c6a6b8))

## 1.0.0 (2025-11-24)


### Features

* added comprehensive testing infrastructure with DI mocking ([610af74](https://github.com/angelxmoreno/coderabbit-github-parser/commit/610af7426629ad2e28a6cc207f0ef41306e19917))
* added release-please workflow for automated GitHub Packages publishing ([92b253b](https://github.com/angelxmoreno/coderabbit-github-parser/commit/92b253be678725344a0f7627cdf0a985cb854127))
* bin dir setup ([a53de1b](https://github.com/angelxmoreno/coderabbit-github-parser/commit/a53de1b33461e0baf7aa4c29e780a01b111e548f))
* **commands:** added filtering to show only active CodeRabbit comments by default ([ace525f](https://github.com/angelxmoreno/coderabbit-github-parser/commit/ace525feb41a4f3ba1a0a2ed995b0f145f9dbc1a))
* created app container and app logger ([efb4b89](https://github.com/angelxmoreno/coderabbit-github-parser/commit/efb4b8913306d233e098463a98cade8028987b95))
* created commandJS wrapper ([adeadd0](https://github.com/angelxmoreno/coderabbit-github-parser/commit/adeadd0edb9078c97fce5111b095bd8dfcc65990))
* created fetching of only active code rabbit review comments ([62d90ca](https://github.com/angelxmoreno/coderabbit-github-parser/commit/62d90ca453bd712babbbd0f186cfaa7a93b619a4))
* enhanced type safety with strict LogLevel typing and better DI ([3f08d09](https://github.com/angelxmoreno/coderabbit-github-parser/commit/3f08d09cfcdefa105343bd132d2154147b60f9b5))
* improved runBashCommand utility with comprehensive testing ([fa071c2](https://github.com/angelxmoreno/coderabbit-github-parser/commit/fa071c216c74bdf67391b75dcff2cbbe9abf132f))
* installed and configured Biome, CommintLint and LeftHook ([6017a2e](https://github.com/angelxmoreno/coderabbit-github-parser/commit/6017a2ebbead8a8617ed728ca6023878a28da0bd))
* installed and configured Biome, CommintLint and LeftHook ([f6e2195](https://github.com/angelxmoreno/coderabbit-github-parser/commit/f6e21956f4d2cc3bd447041fa145b62147512797))
* moved importing of reflect-metadata to bun preload ([1e86b81](https://github.com/angelxmoreno/coderabbit-github-parser/commit/1e86b81ac41d5496a6d8719ad8d8e3cccd9a39d3))
* **pr:** added GitHub PR listing command with full CLI parameter sup… ([13d79eb](https://github.com/angelxmoreno/coderabbit-github-parser/commit/13d79eb4f5f2a3e8558142a70f804c02d1307bba))
* **pr:** added GitHub PR listing command with full CLI parameter support ([9196f3f](https://github.com/angelxmoreno/coderabbit-github-parser/commit/9196f3f10ff52e9c6cb82088af39a5412862a044))
* removed unused index.ts entry point and updated package.json ([782937d](https://github.com/angelxmoreno/coderabbit-github-parser/commit/782937da9030fb81220abc2ed0544d8a04866dcd))
* slash command install ([cf80192](https://github.com/angelxmoreno/coderabbit-github-parser/commit/cf8019277c4c5956e14eaf55b6be0a9efb746a68))


### Bug Fixes

* add null-safe checks for GitHub user objects ([098fe4c](https://github.com/angelxmoreno/coderabbit-github-parser/commit/098fe4cc080a683b2a7ebd5f049cad85fcd78173))
* added version field to package.json for npm publication ([8fb25da](https://github.com/angelxmoreno/coderabbit-github-parser/commit/8fb25dae5cc910336be86f6ecd739157d795f0f1))
* aligned module format in tsconfig.build.json to ESNext ([3d0e603](https://github.com/angelxmoreno/coderabbit-github-parser/commit/3d0e60393719ccd4e45c85fc55362a9a729f275e))
* **cli:** corrected shell command execution through sh -c ([6350b96](https://github.com/angelxmoreno/coderabbit-github-parser/commit/6350b967946b8f106e0b6019b3a02959913f3aac))
* **cli:** moved logger resolution after preAction hook execution ([367a3a8](https://github.com/angelxmoreno/coderabbit-github-parser/commit/367a3a8d9866cb8534814f797238a59c947b3b8b))
* **cli:** passed command string directly to shell to handle quoted arguments ([15bfcdb](https://github.com/angelxmoreno/coderabbit-github-parser/commit/15bfcdb2a0f76bcef83b7403f81a359a1b1c60ba))
* **commands:** added defensive formatting for path:line in CodeRabbit output ([23e4797](https://github.com/angelxmoreno/coderabbit-github-parser/commit/23e4797a1af1251955fcd66a73b682291c086c9d))
* **commands:** added defensive location formatting and DRY preview helper ([4960321](https://github.com/angelxmoreno/coderabbit-github-parser/commit/496032150a1b5b3b0b54bf0f70e28be99394f382))
* corrected package-name in release workflow and improved README formatting ([ab13fbb](https://github.com/angelxmoreno/coderabbit-github-parser/commit/ab13fbb9f5aacb03e85be0571ac2165fdaed2029))
* corrected release-please workflow configuration ([afbdebd](https://github.com/angelxmoreno/coderabbit-github-parser/commit/afbdebd57b98d4e36ba095d1b2c203cea3e63813))
* corrected release-please workflow configuration ([5e090fe](https://github.com/angelxmoreno/coderabbit-github-parser/commit/5e090feb7cb1ec245017cfac11702495b878058a))
* fixed ai prompt parsing ([48e57de](https://github.com/angelxmoreno/coderabbit-github-parser/commit/48e57def04e66bb7da7225083d96eca005710e40))
* fixed bad logger execution ([724a1d0](https://github.com/angelxmoreno/coderabbit-github-parser/commit/724a1d0ad070976402748bd31326306f5ecd472d))
* fixed coderabbit review command syntaxt ([47a7ae6](https://github.com/angelxmoreno/coderabbit-github-parser/commit/47a7ae6e7684d75b8f5cc14e60618f5e39b9bca1))
* fixed formatting and path issues ([7dfef2f](https://github.com/angelxmoreno/coderabbit-github-parser/commit/7dfef2f3a3c2b58ee910537ca2b6f2344da1c3b9))
* fixed parsing of AI prompt in MD format ([04745d8](https://github.com/angelxmoreno/coderabbit-github-parser/commit/04745d8e0425fb8f7407cb60fcca38b3634d195b))
* fixed slash command template ([8eeaa31](https://github.com/angelxmoreno/coderabbit-github-parser/commit/8eeaa31a1450c5e4a90c78f5bab328227ae8cd29))
* fixed tsyringe error ([f737e90](https://github.com/angelxmoreno/coderabbit-github-parser/commit/f737e9013289b626f0c4ab863021f552c2026c42))
* **parser:** guarded against missing title when computing description ([256bcc0](https://github.com/angelxmoreno/coderabbit-github-parser/commit/256bcc0678ee9e03fe273956ae2f8f19facca2d5))
* **pr:** added error handling for service call ([4e9bfb8](https://github.com/angelxmoreno/coderabbit-github-parser/commit/4e9bfb8c0b93068233c9def2ec712c2c05a40189))
* **pr:** validated limit parsing to prevent NaN errors ([a97de99](https://github.com/angelxmoreno/coderabbit-github-parser/commit/a97de9946ed70e53061d8aaaf7030e859cff7ce4))
* remove private flag to enable package publication ([f973c7a](https://github.com/angelxmoreno/coderabbit-github-parser/commit/f973c7a2d114b26a4c0ed600b6af54f590be9bfb))
* **security:** added shell argument escaping to prevent command injection ([44554a3](https://github.com/angelxmoreno/coderabbit-github-parser/commit/44554a39615637230e9522ade007bb028594d2ea))
* **service:** added runtime validation for JSON parsing in getPrList ([20462e0](https://github.com/angelxmoreno/coderabbit-github-parser/commit/20462e0775e96588de0575eae28bb8f327b5011b))
* **service:** corrected log message and added null handling to getCurrentPr ([19c8464](https://github.com/angelxmoreno/coderabbit-github-parser/commit/19c8464575a2ef3254d514fe0694a8f07cd9cd8e))
* **service:** improved draft flag handling for explicit false values ([50ce2da](https://github.com/angelxmoreno/coderabbit-github-parser/commit/50ce2da2032dd3e293c079381c841ecab57214fa))
* **service:** normalized prIdentifier to numeric PR number for REST API calls ([28b2841](https://github.com/angelxmoreno/coderabbit-github-parser/commit/28b28411a9458c344b1d1bd0174fd547a1c0ff98))
* **service:** updated logger child name to match class name ([d6b2c15](https://github.com/angelxmoreno/coderabbit-github-parser/commit/d6b2c15d62ab27bab10e3788673d2ea295d5efa5))
* synced CLI version to match package.json 1.0.0 ([659b862](https://github.com/angelxmoreno/coderabbit-github-parser/commit/659b862bc4ff8819dddad864db59c1f6b51e424a))
* **types:** corrected PrState casing mismatch with GitHub CLI output ([7aac403](https://github.com/angelxmoreno/coderabbit-github-parser/commit/7aac403e94b1e3e17f10d39a0343e449588d41fe))
