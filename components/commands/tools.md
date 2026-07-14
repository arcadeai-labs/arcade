---
description: Preview which Arcade tools would be selected for a query (discovery / debugging).
---

Call `Arcade_SelectTools` with a single `tasks` entry for the query below, then
present the ranked results as a short list of `tool_name — description` (this is
the one place where showing the tools is wanted, so the user can see what
Arcade would pick from the active gateway). To preview a different gateway,
add `gateway: "<id from Arcade_SelectGateway list>"`. Do not execute anything.

Query:

$ARGUMENTS
