# 新規セッションからの可視性チェック

## 重要な前提：セッション開始時点ではリポジトリ自体が存在しなかった

セッション開始直後の状態は以下のとおりで、リポジトリはクローンされていなかった。

```
$ pwd
/home/user
$ git -C . rev-parse --abbrev-ref HEAD
fatal: not a git repository (or any of the parent directories): .git
$ git -C . log --oneline -1
fatal: not a git repository (or any of the parent directories): .git
$ ls -la .claude/skills/
ls: cannot access '.claude/skills/': No such file or directory
$ head -5 .claude/skills/zenryoku-facts/SKILL.md
head: cannot open '.claude/skills/zenryoku-facts/SKILL.md' for reading: No such file or directory
$ ls -la /home/user
（空ディレクトリ）
```

そのため `add_repo` でリポジトリをセッションに追加し、`git clone` してから改めて確認した。
以下は **クローン後** の結果。

- 作業ディレクトリ: `/home/user/zn-stretch-gifu-nagara`（セッション開始時は `/home/user`・リポジトリ無し）
- ブランチ: `claude/zenkara-gifu-nagara-seo-ukz0er`（クローン時のデフォルトブランチ）
- 最新コミット: `6b0f819 Merge pull request #34: Clarityベースライン記録・ページ別データの集約・共通ルールのスキル化`
- .claude/skills/ の中身:
  ```
  zenryoku-data
  zenryoku-drive-note
  zenryoku-facts
  zenryoku-yakkihou
  ```
  （4ディレクトリすべて存在）
- SKILL.md の先頭5行が読めたか: 成功

  ```
  ---
  name: zenryoku-facts
  description: 全力ストレッチ岐阜長良店（株式会社ANDSYNC）の確定した前提数値・ID・KPI定義をまとめたもの。…
  ---
  ```

## スキルとして使えたか

- 見えた zenryoku スキル: **無し**
  - セッション開始時の利用可能スキル一覧に `zenryoku-` で始まるものは 0 件。
  - `zenryoku-yakkihou` / `zenryoku-facts` / `zenryoku-drive-note` / `zenryoku-data` いずれも一覧に存在しない。
  - クローン後に `register_repo_root` でコンテキスト再読込を要求したが、次ターンでも一覧に現れなかった。
- zenryoku-facts の呼び出し: **失敗**
  - `Skill(zenryoku-facts)` → `Unknown skill: zenryoku-facts`
  - ファイルとしては読める（`SKILL.md` を直接 grep して以下を取得）
  - 初回体験の価格: 90分 ¥4,900（通常 19,800円）
  - 損益分岐の月商: 約 253.9万円

  ※上記2つは「スキル呼び出し」ではなくファイル直読みで取得した値。

## ツール

- Google Drive: **あり**（`search_files` / `read_file_content` / `create_file` などが利用可能）
- GitHub MCP: **なし**（GitHub MCP サーバーのツールは一覧に存在しない。GitHub 操作は `git` / `gh` CLI 経由のみ）

## 結論

- 定期ルーティンと同じ新規セッション状態では、**リポジトリがクローンされていないため `.claude/skills/` は最初から見えない**。
- クローンしてファイルを配置しても、**`.claude/skills/` 配下のスキルは「呼び出せるスキル」としては登録されなかった**。
  利用可能スキル一覧に載っているのは claude.ai 側に登録済みのスキル（`closing-coach` / `sugawara-consult` など）のみ。
- したがって、定期ルーティンからこれらのスキルを使わせたい場合は、
  リポジトリ内 `.claude/skills/` ではなく **claude.ai のスキルとして登録する**か、
  ルーティンのプロンプト側で `SKILL.md` を明示的に読ませる運用が必要。
