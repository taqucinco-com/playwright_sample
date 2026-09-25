# playwright_sample

Playwrightを理解するためのrepository

## Next.js

FEをNext.jsで実装する

## Routing

/ => ここに /about というルーティングへのボタンがある
/about => hoge というh1がある

## Playwright

テストシナリオは以下の通り

- / にレンダリングされているボタンをクリックすると /about に遷移する
- /about で hoge がレンダリングされている

```sh
npx playwright test tests/home.spec.ts --headed --debug --config playwright.config.ts
```

### playwright CLI

`@playwright/test`をインストールすると`playwright`コマンド(実体は`node_modules/.bin/playwright`)が使えるようになる。`npx`経由で呼び出せば追加のセットアップは不要。

```sh
npx playwright --version
```

よく使うサブコマンド例:

```sh
# ブラウザを操作した内容からテストコードを自動生成する(操作を記録)
npx playwright codegen http://localhost:3000

# 直近のテスト実行のHTMLレポートを開く
npx playwright show-report

# トレースファイルを単体で開いて確認する
npx playwright show-trace test-results/<テスト名>/trace.zip

# 実行対象のテスト一覧を確認する(実行はしない)
npx playwright test --list
```

毎回`npx`を打つのが手間な場合は、`node_modules/.bin`にPATHを通せば`playwright`だけで呼び出せる。

```sh
export PATH="$PWD/node_modules/.bin:$PATH"
playwright codegen http://localhost:3000
```

### MCP

```sh
claude mcp add playwright npx @playwright/mcp@latest -s project
```
