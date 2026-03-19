import coreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";
import eslintConfigPrettier from "eslint-config-prettier";
import pluginSimpleImportSort from "eslint-plugin-simple-import-sort";
import pluginUnusedImports from "eslint-plugin-unused-imports";

const eslintConfig = [
  // 자동 생성 파일 및 설정 파일 제외
  {
    ignores: ["types/database.types.ts", "tailwind.config.ts"],
  },

  // Next.js 16 네이티브 flat config
  ...coreWebVitals,
  ...nextTypescript,

  {
    plugins: {
      "unused-imports": pluginUnusedImports,
      "simple-import-sort": pluginSimpleImportSort,
    },
    rules: {
      // 미사용 import 자동 제거
      "unused-imports/no-unused-imports": "error",
      "unused-imports/no-unused-vars": [
        "warn",
        {
          vars: "all",
          varsIgnorePattern: "^_",
          args: "after-used",
          argsIgnorePattern: "^_",
        },
      ],

      // import 순서 자동 정렬
      "simple-import-sort/imports": "error",
      "simple-import-sort/exports": "error",

      // TypeScript 안전성
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/consistent-type-imports": [
        "error",
        { prefer: "type-imports", fixStyle: "inline-type-imports" },
      ],

      // 일반 규칙
      "no-console": ["warn", { allow: ["warn", "error"] }],

      // React 19 신규 규칙: setMounted(hydration 패턴) 등 합법적인 패턴도 감지하므로 warn
      "react-hooks/set-state-in-effect": "warn",
    },
  },

  // Prettier와 충돌하는 ESLint 규칙 비활성화 (반드시 마지막)
  eslintConfigPrettier,
];

export default eslintConfig;
