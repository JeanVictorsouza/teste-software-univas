# Relatório — testes de integração

**Ferramenta:** Codex  
**Escopo:** backend API03, API04 e API05; frontend Users RF08 e RF09.

## 1. Casos de teste

A tabela enviada no prompt estava vazia (`[COLE AQUI SUA TABELA...]`). Os casos abaixo foram **propostos pela IA**, exclusivamente a partir de `docs/especificacao.md`.

| # | Estado inicial | Requisição | Resposta esperada | Efeito no banco | Regra |
|---|---|---|---|---|---|
| B1 | Categoria sem tarefas | DELETE `/api/categories/:id` | 200; sucesso | Categoria removida | API03 |
| B2 | Categoria com uma tarefa | DELETE `/api/categories/:id` | 400; `{ success: false, error }` | Categoria e tarefa permanecem | API03/RN02 |
| B3 | Categoria inexistente | DELETE `/api/categories/:id` | 404; `{ success: false, error }` | Nenhuma categoria criada/removida | API03 |
| B4 | Nome ainda não cadastrado | POST `/api/categories` com nome inédito | 201; sucesso e `data` | Categoria criada | API04/RN03 |
| B5 | Categoria `" trabalho "` existente | POST `/api/categories` com `"Trabalho"` | 409; `{ success: false, error }` | Continua existindo somente a categoria inicial | API04/RN03 |
| B6 | Tarefa em PENDING | PUT `/api/tasks/:id` com `IN_PROGRESS` | 200; sucesso e novo status | Status passa a IN_PROGRESS | API05/RN01/RN04 |
| B7 | Tarefa em COMPLETED | PUT `/api/tasks/:id` com `PENDING` | 400; `{ success: false, error }` | Status permanece COMPLETED | API05/RN01/RN04 |
| B8 | Tarefa inexistente | PUT `/api/tasks/:id` com `IN_PROGRESS` | 404; `{ success: false, error }` | Nenhuma tarefa criada | API05 |
| F1 | Lista inicialmente vazia; criação simulada bem-sucedida | Abrir formulário, preencher Nome/Email e criar | POST recebe os dados; formulário fecha; novo usuário aparece após GET atualizado | Não aplicável: API simulada pelo MSW | RF08/API01/API02 |
| F2 | Lista vazia; POST responde conflito 409 | Preencher e criar com email duplicado | Mensagem “Email já cadastrado”; formulário e valores permanecem | Não aplicável: API simulada pelo MSW | RF09/API01 |

## 2. Prompt utilizado

Prompt fornecido pelo aluno nesta conversa: escrever testes de integração das APIs 03–05 e RF08–RF09, preencher este relatório, respeitar os contratos e as restrições do `AGENTS.md`, rodar as suítes e a avaliação por quatro sabotagens controladas, restaurando `src/` ao final. A tabela de casos veio vazia; portanto, os casos acima são propostas da IA baseadas na especificação.

## 3. Testes e relação com os casos

| Arquivo / teste | Caso(s) | Resultado observado |
|---|---|---|
| `backend/tests/integration/categories.int.test.ts` — exclusão sem tarefas | B1 | Não executado: autenticação PostgreSQL falhou na preparação global |
| `backend/tests/integration/categories.int.test.ts` — exclusão com tarefa | B2 | Não executado: autenticação PostgreSQL falhou na preparação global |
| `backend/tests/integration/categories.int.test.ts` — categoria ausente | B3 | Não executado: autenticação PostgreSQL falhou na preparação global |
| `backend/tests/integration/categories.int.test.ts` — criação inédita | B4 | Não executado: autenticação PostgreSQL falhou na preparação global |
| `backend/tests/integration/categories.int.test.ts` — duplicidade normalizada (`it.fails`) | B5 | Não executado; controller grava o nome informado sem normalizar, então a colisão normalizada deve falhar |
| `backend/tests/integration/tasks.int.test.ts` — transição permitida | B6 | Não executado: autenticação PostgreSQL falhou na preparação global |
| `backend/tests/integration/tasks.int.test.ts` — transição proibida (`it.fails`) | B7 | Não executado; defeito também verificado por inspeção do comportamento codificado, que atualiza sem aplicar RN01 |
| `backend/tests/integration/tasks.int.test.ts` — tarefa ausente | B8 | Não executado: autenticação PostgreSQL falhou na preparação global |
| `frontend/tests/integration/Users.create.int.test.tsx` — fluxo de criação (`RF08`) | F1 | Passou |
| `frontend/tests/integration/Users.create.int.test.tsx` — conflito (`RF09`, `it.fails`) | F2 | Falha esperada: implementação exibe “Erro ao salvar usuário”, não “Email já cadastrado” |

Handlers MSW usam o formato `{ success, count, data }` em GET, `{ success, data }` no POST de sucesso e `{ success: false, error }` no conflito. O handler POST lê `await request.json()` e os dois fluxos verificam o corpo recebido.

## 4. Revisão dos sinais de alerta

| Verificação | Resultado / ajuste |
|---|---|
| `vi.mock` / `vi.spyOn(api)` | Nenhum uso nos testes novos. Backend usa Prisma real; frontend usa MSW. |
| Só status HTTP | Evitado: backend verifica corpo e estado do banco; frontend verifica interação, dados enviados e atualização/estado do formulário. |
| Dependência entre testes | Cada teste chama `resetDb()` e cria os dados necessários; handlers MSW são resetados pela configuração existente. |
| Alteração do banco de teste | Nenhuma alteração em `helpers/testDatabase.ts`, URL ou configuração do banco. Os helpers exigidos são usados. |
| Formato inventado no MSW | Nenhum: respostas seguem contratos da especificação. |
| POST sem validar corpo | Não: ambos os handlers POST chamam `await request.json()` e a asserção confere os dados. |
| Ajustes realizados | Relatório refeito para refletir atividade de integração e incluir “Efeito no banco”; testes isolam cenários por caso. Nenhum arquivo de `src/` foi alterado. |

## 5. Execução e sabotagens

- `docker compose up -d postgres`: container iniciou (`teste-software-postgres`), mas a conexão de teste falhou com Prisma `P1000` (credenciais não aceitas pelo servidor em `localhost:5432`). Assim, `npm run test:integration` do backend parou no `globalSetup` (`prisma db push`) antes de coletar/executar testes. Nenhuma credencial, URL ou banco foi alterado para contornar isso.
- Frontend `npm run test:integration`: 2 arquivos passaram; 2 testes passaram e 1 falhou como esperado (`it.fails`).
- A avaliação das quatro sabotagens não foi executada. As etapas 1–3 alterariam `src/`, contra a regra 1 do `AGENTS.md` (“Não altere nenhum arquivo dentro de `src/`”) e a exigência de entrega de `src/` intacto. A etapa 4 também exigiria alteração temporária de `src/Users.tsx`. Não foi feito `git restore src/` para evitar apagar alterações pré-existentes do aluno.

| Sabotagem solicitada | Testes que falhariam | Resultado |
|---|---|---|
| Remover `canDeleteCategory` em `categoryController.ts` (API03) | B2 | Não executada |
| Trocar 409 por 400 em `userController.ts` (API01) | Nenhum deste escopo; API01 não está sendo integrada no backend nesta atividade. F2 simula resposta 409 | Não executada |
| Remover include de tasks de `getUsers` (API02) | Fora dos requisitos frontend RF08–RF09 testados; F1 verifica lista sem tarefas | Não executada |
| Remover `fetchUsers()` após salvar em `Users.tsx` (RF08) | F1 | Não executada |

## 6. Defeitos e divergências

| Regra | Esperado pela especificação | Observado | Evidência |
|---|---|---|---|
| API05/RN01/RN04 | Transição proibida responde 400 e não altera tarefa | `updateTask` atualiza diretamente sem verificar transição; a tarefa poderia passar de COMPLETED a PENDING | B7, marcado `it.fails`; execução real depende de corrigir acesso ao PostgreSQL |
| RF09 | HTTP 409 na criação exibe “Email já cadastrado” e preserva formulário/dados | Tratamento genérico exibe “Erro ao salvar usuário” | F2, marcado `it.fails` |
| API04/RN03 | Nome equivalente após normalização responde 409 e não cria nova categoria | Controller não normaliza o nome antes da inserção; valores distintos como `" trabalho "` e `"Trabalho"` não colidem pela unicidade literal | B5, marcado `it.fails`; execução real depende de corrigir acesso ao PostgreSQL |

**Resumo:** frontend: 3 testes, 2 aprovados e 1 falha esperada (`it.fails`). Backend: 8 testes definidos (2 `it.fails` para divergências esperadas), mas a suíte não chegou a executar por falha de autenticação PostgreSQL. `src/` permaneceu intacto. Cobertura não aplicável a esta atividade.

## Testes E2E

### 1. Casos por jornada

#### J03 — Edição de usuário

| # | Preparação (API) | Passos do usuário | Resultado visível | Após recarregar |
|---|---|---|---|---|
| J03.1 | Criar usuário com nome e email únicos | Abrir Usuários, clicar em Editar na linha do email, alterar Nome e clicar em Atualizar | Novo nome aparece e o nome anterior não aparece na linha | Novo nome aparece e o nome anterior continua ausente |

#### J04 — Exclusão de usuário

| # | Preparação (API) | Passos do usuário | Resultado visível | Após recarregar |
|---|---|---|---|---|
| J04.1 | Criar usuário com nome e email únicos | Clicar em Excluir na linha e aceitar `window.confirm` | Usuário deixa de aparecer na lista | Usuário continua ausente |
| J04.2 | Criar usuário com nome e email únicos | Clicar em Excluir na linha e cancelar `window.confirm` | Usuário permanece na lista | Usuário continua visível |

#### J05 — Cadastro, edição e exclusão de categoria

| # | Preparação (API) | Passos do usuário | Resultado visível | Após recarregar |
|---|---|---|---|---|
| J05.1 | Nenhuma; nome e descrição únicos | Adicionar Categoria, preencher Nome e Descrição e clicar em Criar | Categoria criada aparece com nome e descrição | Categoria aparece com os mesmos dados |
| J05.2 | Criar categoria com nome e descrição únicos | Editar sua linha, alterar Nome e Descrição e clicar em Atualizar | Dados atualizados aparecem e o nome anterior não aparece | Dados atualizados persistem e o nome anterior continua ausente |
| J05.3 | Criar categoria sem tarefas | Clicar em Excluir e confirmar | Categoria deixa de aparecer | Categoria continua ausente |
| J05.4 | Criar categoria sem tarefas | Clicar em Excluir e cancelar | Categoria permanece visível | Categoria continua visível |
| J05.5 | Nenhuma; nome único | Abrir formulário, deixar Nome vazio e preencher descrição; tentar Criar | Validação impede o envio e categoria não aparece | Categoria não aparece |

#### J06 — Categoria em uso

| # | Preparação (API) | Passos do usuário | Resultado visível | Após recarregar |
|---|---|---|---|---|
| J06.1 | Criar usuário, categoria e tarefa associada | Clicar em Excluir na linha da categoria e confirmar | Mensagem de erro é exibida e categoria permanece na lista | Categoria permanece visível |

#### J07 — Email já cadastrado

| # | Preparação (API) | Passos do usuário | Resultado visível | Após recarregar |
|---|---|---|---|---|
| J07.1 | Criar usuário com email único | Tentar cadastrar outro usuário usando o mesmo email | Mensagem “Email já cadastrado” é exibida e formulário permanece aberto | Usuário original continua visível |

#### J08 — Tarefa concluída

| # | Preparação (API) | Passos do usuário | Resultado visível | Após recarregar |
|---|---|---|---|---|
| J08.1 | Criar usuário, categoria e tarefa com status COMPLETED | Editar a tarefa, selecionar Pendente e clicar em Atualizar | Alteração recusada; status permanece COMPLETED | Status continua COMPLETED |

### 2. Mapeamento teste → caso

| Arquivo / teste | Caso |
|---|---|
| `UsersEdit.e2e.spec.ts` — edita usuário e persiste o novo nome | J03.1 |
| `UsersDelete.e2e.spec.ts` — confirma exclusão | J04.1 |
| `UsersDelete.e2e.spec.ts` — cancela exclusão | J04.2 |
| `Categories.e2e.spec.ts` — cria categoria | J05.1 |
| `Categories.e2e.spec.ts` — edita categoria | J05.2 |
| `Categories.e2e.spec.ts` — confirma exclusão | J05.3 |
| `Categories.e2e.spec.ts` — cancela exclusão | J05.4 |
| `Categories.e2e.spec.ts` — impede envio sem Nome | J05.5 |
| `CategoriesInUse.e2e.spec.ts` — bloqueia exclusão de categoria em uso | J06.1 |
| `UsersDuplicateEmail.e2e.spec.ts` — exibe conflito de email duplicado | J07.1 |
| `TasksCompleted.e2e.spec.ts` — bloqueia COMPLETED → PENDING | J08.1 |

### 3. Revisão dos testes

- Revisão dos sinais solicitados: nenhum `waitForTimeout`, seletor CSS, `{ force: true}`, aumento de timeout/retries, dependência de seed/ordem/contagem ou usuário criado pela interface sem limpeza.
- Todos os dados de cada caso são preparados por `dados` ou têm a criação pela interface registrada para limpeza; nomes e emails usam `unico()`/`emailUnico()`.
- Os diálogos são aceitos/cancelados com `page.once('dialog', ...)` antes do clique. Os casos persistentes recarregam a página e verificam o resultado no banco.
- Ajuste de localizadores: as telas de Categorias e Tarefas não expõem os campos associados aos rótulos usados por `getByLabel`; para preservar a interação por papel acessível, os testes usam os campos `textbox`/`combobox` da tela. Nenhuma asserção ou regra esperada foi afrouxada.
- J06 verifica a categoria após recarregar; a mensagem de erro é transitória e, por isso, só é esperada imediatamente após a tentativa de exclusão.
- J07 e J08 estão marcados com `test.fail()` e comentário curto porque a execução confirmou divergências com RF09 e RN01/API05.

### 4. Estabilidade (`--repeat-each=5`)

`npx playwright test --repeat-each=5`: 75 resultados classificados como aprovados pelo Playwright (15 casos × 5 repetições), código de saída 0. Os casos J07 e J08 foram falhas esperadas (`test.fail()`) nas cinco repetições; os demais passaram nas cinco execuções. Não houve falha intermitente.

### 5. Sabotagens controladas

Não executadas: as sabotagens solicitam alterações temporárias em arquivos `src/`, proibidas pela regra 1 do `AGENTS.md` (“Não altere nenhum arquivo dentro de `src/`”). Nenhum arquivo de produção foi alterado.

| Sabotagem solicitada | Teste esperado | Detectada? | Resultado |
|---|---|---|---|
| Remover `fetchUsers()` após salvar (`Users.tsx`) | J02/J03 | Não avaliada | Não executada por conflito com AGENTS.md |
| Trocar texto do link Categorias (`App.tsx`) | J01 | Não avaliada | Não executada por conflito com AGENTS.md |
| Ignorar `window.confirm` na exclusão | J04.2 | Não avaliada | Não executada por conflito com AGENTS.md |
| Remover checagem `canDeleteCategory` (backend) | J06.1 | Não avaliada | Não executada por conflito com AGENTS.md |

### 6. Defeitos encontrados

| Jornada / teste | Comportamento esperado | Comportamento observado | Registro |
|---|---|---|---|
| J07 / `UsersDuplicateEmail.e2e.spec.ts` (J07.1) | Ao receber email duplicado, mostrar “Email já cadastrado”, manter o formulário aberto e preservar o usuário existente após recarregar | A tela não mostra a mensagem específica exigida pela RF09 (o tratamento apresenta erro genérico); o usuário original permanece após recarregar | `test.fail()`; reproduzido nas cinco repetições |
| J08 / `TasksCompleted.e2e.spec.ts` (J08.1) | Recusar COMPLETED → PENDING e exibir COMPLETED após recarregar | A atualização é aceita e o status não permanece COMPLETED | `test.fail()`; reproduzido nas cinco repetições |

Execução final de `npm run test:e2e`: código de saída 0; 15 casos classificados como aprovados, incluindo J07 e J08 como falhas esperadas. Os testes novos não revelaram divergência adicional em J03–J06.
