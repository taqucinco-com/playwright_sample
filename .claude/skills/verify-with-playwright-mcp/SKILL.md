---
name: verify-with-playwright-mcp
description: ユーザーがこのアプリのUIが実際のブラウザで期待通りにレンダリング・動作しているかをライブに確認したい場合に使う(`npx playwright test`が通ることの確認とは別)。例: 「実装状況を確認して」「ブラウザで確認して」「verify the implementation」「本当に動いてる?」。playwright MCPサーバー(mcp__playwright__*)経由でアプリを操作するplaywright-verifier agentを起動する。
---

このプロジェクトにはプロジェクト全体に`playwright` MCPサーバーが設定済みで(`.mcp.json`と`README.md`の「MCP」セクション参照)、実際にレンダリングされたブラウザを操作できる`mcp__playwright__*`ツールに直接アクセスできる。これは`npx playwright test`(`tests/*.spec.ts`のアサーションをheadless/headedで実行するだけで、自分の目で見ることはできない)とは異なるもの。

ユーザーからアプリの実装状況の確認や、UI変更が実際に機能しているかの確認を求められた場合、ソースコードを読み直したりテストスイートを再実行したりするだけで済ませず、`playwright-verifier` agentを起動すること(`Agent`ツール、`subagent_type: "playwright-verifier"`)。このagentは必要なら開発サーバーを起動し、`README.md`から期待されるシナリオを読み取り、MCP経由でブラウザを操作して各シナリオを確認し、具体的な根拠(アクセシビリティのsnapshot、コンソール/ネットワークの出力)付きでpass/failを報告してくれる。

mainスレッドから直接`mcp__playwright__*`ツールを呼ぶより、このagentを使うことを優先すること。snapshotやscreenshotの(しばしば大きな)出力をmainスレッドの文脈から切り離し、判定結果だけを返せるため。

もし`mcp__playwright__*`ツールが利用可能なツールとして出てこない場合(例えば`ToolSearch`で何もヒットしない場合)、MCPサーバーの設定が追加・変更された直後でセッションの再起動が必要な可能性が高い。その場合はユーザーにClaude Codeの再起動(または`/mcp`の実行)を促すこと — `.mcp.json`を最初に設定した際と同じ注意点。

再起動直後は、`playwright-verifier` agentにmain threadから`mcp__playwright__*`ツールが渡されないことがあった(agentのfrontmatterに列挙していても、mainスレッド自身がまだそのツールを認識していないと継承されない)。agent経由で失敗した場合は、まずmainスレッドで`ToolSearch`により`mcp__playwright__*`が実際に見えるか確認し、見えるならagentを再試行するか、mainスレッドから直接叩いて結果だけユーザーに報告すること。

なお`.mcp.json`で`--headless`を指定していない限り、`@playwright/mcp`は**デフォルトでheaded**(実際にブラウザウィンドウが表示される)。「`--headed`のように操作の様子を見たい」と言われたら、特別な設定変更は不要で、そのまま`browser_navigate`等を呼べばユーザーの画面上に実ブラウザが表示される(2026-09-25にユーザー本人が目視確認済み)。
