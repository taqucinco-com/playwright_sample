---
name: verify-with-playwright-mcp
description: ユーザーがこのアプリのUIについて、実ブラウザでの操作・確認・状態の明示のいずれか(または複数)をライブに求めている場合に使う(`npx playwright test`が通ることの確認とは別)。例: 「実装状況を確認して」「ブラウザで確認して」「verify the implementation」「本当に動いてる?」「ボタンを押して動きを見せて」「今何が表示されてる?」。playwright MCPサーバー(mcp__playwright__*)経由でアプリを操作するplaywright-verifier agentを起動する。
---

このプロジェクトにはプロジェクト全体に`playwright` MCPサーバーが設定済みで(`.mcp.json`と`README.md`の「MCP」セクション参照)、実際にレンダリングされたブラウザを操作できる`mcp__playwright__*`ツールに直接アクセスできる。これは`npx playwright test`(`tests/*.spec.ts`のアサーションをheadless/headedで実行するだけで、自分の目で見ることはできない)とは異なるもの。

このSKILLが扱う作業は「操作」「確認」「状態明示」という3つの異なる責務に分かれる。実行を担う`playwright-verifier` agentは、依頼内容からこのうちどれ(または複数)が求められているかを自分で判断し、必要な分だけ行うこと。判断に迷ったら過剰にやりすぎない方(踏み込みすぎて余計な判定まで下さない方)を選ぶこと。

## 事前準備(対象URL・起動方法の特定)

1. **呼び出し元のプロンプトを確認する。** 検証対象のURLやシナリオが明記されていれば、それに従う(推測で上書きしない)。
2. **プロンプトに明記がなければ、プロジェクトのドキュメントを探す。** `README.md`(なければ`AGENTS.md`、`CLAUDE.md`など)にルーティングや起動方法の記載がないか確認する。ドキュメントに書かれた内容を期待される挙動の正とすること。
3. **対象URLが定まったら、reachableか確認する。**(`curl -s -o /dev/null -w '%{http_code}' <URL>`)届かなければ開発サーバーを起動する必要がある。
   - 起動コマンドがプロンプトやドキュメントで指定されていなければ、`package.json`の`scripts`を読み(`dev`/`start`など、フレームワークにより異なる)、ロックファイル(`package-lock.json`→npm、`yarn.lock`→yarn、`pnpm-lock.yaml`→pnpm)からパッケージマネージャを判別してコマンドを組み立てる。
   - Bash経由でバックグラウンド起動し(例: `npm run dev &`、または`nohup npm run dev > /tmp/playwright-verifier-dev.log 2>&1 &`)、対象URLに到達可能になるまで待ってからアクセスすること。

## 操作(ブラウザを実際に動かす)

`mcp__playwright__browser_navigate` / `browser_click` / `browser_type`などで実ブラウザに変化を起こす行為。

- `.mcp.json`で`--headless`を指定していないため、`@playwright/mcp`は**デフォルトでheaded**(実際にブラウザウィンドウが表示される)。ユーザーが「`--headed`のように操作の様子を見たい」と言った場合、特別な設定変更は不要で、そのまま操作系ツールを呼べばユーザーの画面上に実ブラウザが表示される(2026-09-25にユーザー本人が目視確認済み)。`.mcp.json`に`--headless`が追加されない限りこの挙動は維持される。
- `browser_click`は`target`に`browser_snapshot`が返した要素のref(例: `e4`)を、`element`にその要素の人間可読な説明(例: 「about へ ボタン」)を渡す。逆にする(`target`に説明文を渡す)とCSSセレクタとして解釈されエラーになる。
  ```
  browser_click(target: "e4", element: "about へ ボタン")
  ```
- 操作そのものは「アプリが期待通りか」を判定しない。次の「確認」のための材料(状態の変化)を作るだけ。

## 確認(結果を見て期待通りか判定する)

`browser_snapshot` / `browser_console_messages` / `browser_network_requests`などで状態を観測し、ドキュメント(README.md等)に書かれた期待値と照らし合わせて判定する行為。

- `browser_snapshot`はアクセシビリティツリーを返し、テキスト・role・構造を正確に確認できるので、`browser_take_screenshot`より優先する。スクリーンショットは見た目のレイアウト自体が問題になる場合のみ使う。
- 遷移やクリックの後は再度snapshotを取り、結果の状態(URL、表示されている見出し/テキスト)を確認する。
- `browser_console_messages`で想定外のエラー・警告がないか確認し、遷移やデータ取得を伴うシナリオでは`browser_network_requests`も確認する。
- ドキュメントを期待される挙動の正とすること(推測で判定しない)。
- 判定は必ず具体的な根拠(snapshotで何が見えたか)とセットでpass/failを記録する。
- 実装が期待と違っていても、この場ではコードを直さない。確認結果を報告するところまでが責務。

## 状態明示(今のブラウザ状態をそのまま見せる)

「今何が表示されてる?」「見た目を見せて」のように、ドキュメントとの一致判定を求められているわけではなく、単に今の画面・状態を報告してほしいだけの依頼。

- `browser_snapshot`(構造・テキストの確認)を基本とし、見た目そのものが要る場合のみ`browser_take_screenshot`を使う。
- pass/failのような判定語は使わず、観測した内容をそのまま記述する。

3つの責務の組み合わせ例: 「操作して確認までする」タスク(操作 → 確認)、「動かして見せて」(操作 → 状態明示、判定はしない)、「今の状態だけ教えて」(状態明示のみ、操作しない)など、依頼の文言から素直に読み取ること。

## 委譲とトラブルシュート

ユーザーから操作・確認・状態明示のいずれかを求められた場合、ソースコードを読み直したりテストスイートを再実行したりするだけで済ませず、`playwright-verifier` agentを起動すること(`Agent`ツール、`subagent_type: "playwright-verifier"`)。このagentはこのSKILLを読んで上記の判断と手順を実行し、責務に応じた形で結果を報告してくれる。

mainスレッドから直接`mcp__playwright__*`ツールを呼ぶより、このagentを使うことを優先すること。snapshotやscreenshotの(しばしば大きな)出力をmainスレッドの文脈から切り離し、結果だけを返せるため。

もし`mcp__playwright__*`ツールが利用可能なツールとして出てこない場合(例えば`ToolSearch`で何もヒットしない場合)、MCPサーバーの設定が追加・変更された直後でセッションの再起動が必要な可能性が高い。その場合はユーザーにClaude Codeの再起動(または`/mcp`の実行)を促すこと — `.mcp.json`を最初に設定した際と同じ注意点。

再起動直後は、`playwright-verifier` agentにmain threadから`mcp__playwright__*`ツールが渡されないことがあった(agentのfrontmatterに列挙していても、mainスレッド自身がまだそのツールを認識していないと継承されない)。agent経由で失敗した場合は、まずmainスレッドで`ToolSearch`により`mcp__playwright__*`が実際に見えるか確認し、見えるならagentを再試行するか、mainスレッドから直接叩いて結果だけユーザーに報告すること。
