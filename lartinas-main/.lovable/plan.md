# Checklist de Pré-Release de Segurança

Criar um documento versionado, em português, que padroniza a checagem de segurança antes de cada publicação. Foca nos 3 scanners (`agent_security`, `connector_security_scan` / Wiz, `supabase` + `supabase_lov`) e em verificações de regressão contra os achados já resolvidos.

## Arquivo

`docs/security/pre-release-checklist.md` — markdown puro, sem dependências, fácil de abrir do dashboard, no PR ou no terminal.

## Estrutura do documento

1. **Metadados do release** — versão/tag, data, responsável, link para o PR ou commit, ambiente alvo (preview/produção).
2. **Pré-condições** — branch atualizada com `main`, migrations aplicadas no Supabase de staging, tipos regenerados (`src/integrations/supabase/types.ts`), build/typecheck verdes.
3. **Execução dos scanners** (cada um com campo de status ✅/❌ + observações):
   - `security--run_security_scan` (executa todos os scanners e não persiste).
   - `security--get_scan_results` com `force=true` (lê os resultados persistidos).
   - Inspecionar especificamente: `agent_security.findings`, `connector_security_scan.findings`, `supabase.findings`, `supabase_lov.findings`.
   - `supabase--linter` para warnings de banco (RLS, SECURITY DEFINER, etc.).
4. **Bloqueadores** — qualquer finding `error`/`critical` bloqueia o release; `warn` exige justificativa registrada no checklist (link para `mem://` ou `security-memory`).
5. **Verificação de regressão dos achados já resolvidos** — tabela com tabela/policy/teste rápido para cada item:
   - `announcements` — leitura escopada por apartamento + audience (`Scoped reads announcements`).
   - `community_tips` insert — exige `user_has_apartment_access` ou `apartment_id IS NULL` legítimo.
   - `community_tips` select — dicas sem apartamento só para moradoras com contrato ativo ou staff.
   - `rooms` — leitura restrita a staff/dono/contrato ativo/`status='disponivel'` (`Scoped reads rooms`).
   - `tickets` insert — exige contrato ativo no `apartment_id`.
   - `tickets` update — política `Staff updates tickets` existe.
   - `owner_documents` — policies de UPDATE e DELETE do próprio proprietário existem.
   - Função `public.user_has_apartment_access(uuid,uuid)` existe, é `SECURITY DEFINER` e tem `EXECUTE` revogado de `anon`/`PUBLIC`.
   - Inclui snippet SQL pronto (`SELECT polname, cmd FROM pg_policies WHERE tablename IN (...)`) para conferência manual rápida.
6. **Wiz / connector_security_scan** — checar findings; se o último scan tiver timestamp antigo, anotar para forçar nova varredura no painel Security.
7. **Verificação de connectores e segredos** — confirmar que nenhum segredo novo foi commitado, que `service_role_key` segue server-only e que connectores ainda têm `linkable: yes`.
8. **Pós-release** — repetir leitura dos scanners após deploy; abrir incidente se algum finding `warn` virar `error` ou se um novo aparecer.

## Arquivos afetados

```text
docs/security/pre-release-checklist.md   (novo)
```

Sem alterações em código, banco, rotas, RLS ou segredos. É apenas um documento operacional.
