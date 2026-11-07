# Plan

Current: no hooks, no core.hooksPath; commits reach a session only when an agent logs them. Change: .githooks/commit-msg + post-commit call Server/CommitLog.mjs (session from CLAUDE_CODE_SESSION_ID, store via SessionFolders.record_of + SessionRecord.log_file in the main checkout, write via RecordWriter.write). Test: Server/CommitLog.test.mjs. Doc: Server/doc/commit-log.md.
