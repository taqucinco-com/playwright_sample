---
name: implement-and-verify-loop
description: ユーザーがUIの実装(新機能・修正)を依頼し、かつ実ブラウザでの検証(playwright MCP経由)まで含めて「本当に動くこと」を確認してほしい場合に使う。maker(`feature-maker` agent)が実装し、checker(`playwright-verifier` agent、`verify-with-playwright-mcp` SKILL)が検証し、FAIL時はmakerにフィードバックして再実装させるループ。例: 「実装して、ちゃんと動くまで確認して」「作って検証のループを回して」「実装してcheckerでverifyして」。
---

これはmaker/checkerパターンのループを統括するSKILLである。

- **maker** = `feature-maker` agent(実装のみ行う。検証はしない)
- **checker** = `playwright-verifier` agent(`verify-with-playwright-mcp` SKILLの「確認」責務に従い、実ブラウザで検証する。実装はしない)

makerとcheckerは互いを直接呼び出さない(どちらも`Agent`ツールを持たない)。ループの制御 — 誰をいつ呼ぶか、いつ止めるか — は、このSKILLを読んでいるmainスレッド自身が担う。

## ループの流れ

1. **要求の整理**: ユーザーの依頼と、プロジェクトドキュメント(README.md等)から、実装すべき内容と検証すべきシナリオを明確にする。曖昧な場合は先にユーザーに確認する。
2. **maker実行(実装)**: `Agent`ツールで`feature-maker`を呼び出す。実装内容と検証対象シナリオを渡す。2回目以降の呼び出しでは、直前のcheckerのFAIL報告(期待 vs 観測、根拠)をそのままプロンプトに含める。
3. **checker実行(検証)**: 実装が完了したら、`verify-with-playwright-mcp` SKILLの「確認」手順に従って`playwright-verifier` agentを呼び出し、同じシナリオに対してpass/fail判定と根拠を得る。
4. **判定**:
   - 対象シナリオが全てPASS → ループ終了。実装内容とcheckerの検証結果(根拠付き)をユーザーに報告する。
   - 一部でもFAIL → checkerの報告をそのまま次のmaker呼び出しに渡し、ステップ2に戻る。
5. **上限**: 同一シナリオに対する再実装は最大3回まで。3回試してもPASSしない場合はループを止め、直近の実装内容・checkerの指摘・これまでに試した内容を正直にユーザーへ報告し、判断を仰ぐこと。無限ループしない、黙って諦めない。

## 責務の境界(重要)

- makerはcheckerの判定基準(README.md等のドキュメント、`tests/*.spec.ts`、`.claude/`配下のSKILL/agent定義)を実装を通すためだけに書き換えてはいけない。これは`feature-maker`自身の定義にも明記されているが、mainスレッド側でも各ループ後にmakerの変更差分(`git status`/`git diff`)を確認し、実装対象外のファイルが変わっていないか目を通すこと。
- checkerは検証のみで実装しない(`verify-with-playwright-mcp`の既存ルール通り)。
- 各ループの結果(実装差分、検証結果)は途中経過としてユーザーに簡潔に共有してよいが、最終的なまとめ報告はループ終了後に一度で行う。
