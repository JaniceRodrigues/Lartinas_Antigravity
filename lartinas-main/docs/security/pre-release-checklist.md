# Checklist de Pré-Release de Segurança — Lartinas

> Rodar **antes** de cada publicação (preview ou produção). Marcar com `[x]` e anexar evidências (link, screenshot, output). Bloqueadores ficam destacados em **negrito**.

---

## 1. Metadados do release

- **Versão / tag:** `v…`
- **Data:** `YYYY-MM-DD`
- **Responsável:** `@…`
- **PR / commit:** `…`
- **Ambiente alvo:** `preview` | `produção`
- **Resumo das mudanças:** _o que muda em RLS, server functions, connectors, segredos?_

---

## 2. Pré-condições

- [ ] Branch sincronizada com `main` e sem conflitos.
- [ ] Migrations recentes aplicadas no Supabase de staging.
- [ ] `src/integrations/supabase/types.ts` regenerado após a última migration.
- [ ] Build/typecheck verdes no preview (Lovable executa automaticamente).
- [ ] Nenhum `service_role_key`, `.env`, dump ou segredo novo adicionado ao repositório (`rg -i 'service_role|SUPABASE_SERVICE' src/`).

---

## 3. Execução dos scanners

Rodar **todos** os scanners. Anotar contagem de findings por nível.

| Scanner | Como executar | Status | Findings (error / warn / info) | Observações |
|---|---|---|---|---|
| `agent_security` | `security--run_security_scan` + `security--get_scan_results force=true` → bloco `agent_security` | ☐ | _/_/_ | |
| `connector_security_scan` (Wiz) | mesmo bloco, chave `connector_security_scan` | ☐ | _/_/_ | Wiz é workspace-wide; conferir painel Security |
| `supabase` | mesmo bloco, chave `supabase` | ☐ | _/_/_ | |
| `supabase_lov` | mesmo bloco, chave `supabase_lov` | ☐ | _/_/_ | RLS, audience, escopo por apartamento |
| `supabase--linter` | rodar separadamente | ☐ | _/_/_ | RLS desabilitada, SECURITY DEFINER exposta, etc. |

### Regras de bloqueio

- **Qualquer finding `error` / `critical` bloqueia o release.**
- Findings `warn` exigem justificativa registrada aqui + linha em `security-memory` ou `mem://`.
- Findings `info` apenas anotar.

---

## 4. Verificação de regressão — achados já resolvidos

Rodar os comandos da última coluna e confirmar que retornam exatamente as policies esperadas.

| Tabela / Recurso | O que deve estar protegido | Policy / artefato esperado | Verificação rápida |
|---|---|---|---|
| `announcements` | Leitura escopada por `apartment_id` e `audience` | Policy `Scoped reads announcements` (SELECT) | `SELECT polname FROM pg_policies WHERE tablename='announcements';` |
| `community_tips` (insert) | Autor precisa ter contrato ativo no apartamento alvo | Policy `Residents create tips` com `WITH CHECK` usando `user_has_apartment_access` | `SELECT polname, cmd, with_check FROM pg_policies WHERE tablename='community_tips' AND cmd='INSERT';` |
| `community_tips` (select) | Dicas sem apartamento só para moradoras ativas ou staff | Policy `Residents read tips` | `SELECT polname, qual FROM pg_policies WHERE tablename='community_tips' AND cmd='SELECT';` |
| `rooms` | Leitura restrita a staff, dono, contrato ativo ou `status='disponivel'` | Policy `Scoped reads rooms` | `SELECT polname FROM pg_policies WHERE tablename='rooms';` |
| `tickets` (insert) | Reporter precisa ter contrato ativo no `apartment_id` | Policy `Authenticated creates ticket` com `WITH CHECK` usando `user_has_apartment_access` | `SELECT polname, with_check FROM pg_policies WHERE tablename='tickets' AND cmd='INSERT';` |
| `tickets` (update) | Staff (admin/operacao) pode atualizar chamados | Policy `Staff updates tickets` | `SELECT polname FROM pg_policies WHERE tablename='tickets' AND cmd='UPDATE';` |
| `owner_documents` | Proprietário gerencia os próprios docs | Policies `Owner updates own docs` e `Owner deletes own docs` | `SELECT polname, cmd FROM pg_policies WHERE tablename='owner_documents';` |
| `public.user_has_apartment_access(uuid,uuid)` | `SECURITY DEFINER`, sem EXECUTE para `anon`/`PUBLIC` | Função existe, granted apenas para `authenticated`/`service_role` | Ver §4a |

### 4a. Snippet único para a auditoria

```sql
-- 1) policies-chave
SELECT tablename, policyname, cmd
FROM pg_policies
WHERE schemaname='public'
  AND tablename IN ('announcements','community_tips','rooms','tickets','owner_documents')
ORDER BY tablename, cmd, policyname;

-- 2) função de escopo + grants
SELECT p.proname, p.prosecdef AS security_definer,
       array_agg(r.rolname || '=' || a.privilege_type) AS grants
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
LEFT JOIN information_schema.routine_privileges a
  ON a.specific_name LIKE p.proname || '%'
LEFT JOIN pg_roles r ON r.rolname = a.grantee
WHERE n.nspname='public' AND p.proname='user_has_apartment_access'
GROUP BY p.proname, p.prosecdef;
```

Esperado:
- 11+ policies listadas, incluindo todas as da tabela acima.
- `security_definer = true`.
- `grants` contém `authenticated=EXECUTE` e `service_role=EXECUTE`, **nunca** `anon` ou `PUBLIC`.

---

## 5. Wiz / connector_security_scan

- [ ] `connector_security_scan.findings` está vazio **ou** todos os itens estão acompanhados de justificativa.
- [ ] `connector_security_scan.timestamp` é recente (≤ 7 dias). Se mais antigo, anotar e forçar nova varredura pelo painel Security.
- [ ] Nenhum finding aberto referencia chaves expostas, RLS desligada ou bucket público criado neste release.

---

## 6. Connectors e segredos

- [ ] `standard_connectors--list_connections` — todas as conexões usadas em produção continuam com `linkable: yes` e `has_access: yes`.
- [ ] Nenhum segredo novo necessário; se houver, foi adicionado via `secrets--add_secret` (nunca no `.env` commitado).
- [ ] `SUPABASE_SERVICE_ROLE_KEY` só é importado em arquivos `*.server.ts` e dentro de handlers de `createServerFn` (não em módulos de rota).

---

## 7. Pós-deploy

- [ ] Rodar `security--get_scan_results force=true` em produção e comparar contagem de findings com a baseline pré-release.
- [ ] Smoke test manual: login morador, login proprietário, login admin — cada um vê apenas seus apartamentos.
- [ ] Se algum finding `warn` virou `error` ou apareceu um novo, abrir incidente e iniciar rollback ou hotfix.

---

## 8. Assinatura

- **Responsável técnico:** `@…` — _data/hora_
- **Reviewer de segurança:** `@…` — _data/hora_
- **Decisão:** ✅ liberado / ⛔ bloqueado / 🚧 liberado com ressalvas (descrever)
