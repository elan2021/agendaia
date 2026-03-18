# PLANO: Atendimento Inteligente - Atendimento Automatizado

## Visão Geral
O Atendimento Inteligente é uma plataforma SaaS multi-tenant que automatiza o agendamento de serviços via WhatsApp usando IA (LLMs).
 O público-alvo são pequenas e médias empresas, como barbearias, manicures e clínicas, proporcionando uma experiência fluida onde os clientes agendam serviços diretamente pelo chat, sem necessidade de apps ou links.

## Tipo de Projeto
**WEB** (Dashboard Next.js + Painel de Gestão) & **BACKEND** (Orquestração n8n + WuzAPI + Turso DB)

## Critérios de Sucesso
- [ ] Configuração e armazenamento bem-sucedidos de dados específicos de cada tenant.
- [ ] Implementação de fluxos n8n para manipulação de mensagens WhatsApp e processamento de IA.
- [ ] Criação de um dashboard Next.js para empresas gerenciarem agenda, serviços e profissionais.
- [ ] Isolamento de dados multi-tenant usando bancos de dados individuais no Turso.

## Stack Tecnológica
- **Frontend:** Next.js 14 (App Router), Tailwind CSS
- **Backend/Orquestração:** n8n
- **Gateway WhatsApp:** WuzAPI (self-hosted)
- **Banco de Dados:** Turso (SQLite distribuído)
- **IA:** OpenAI GPT-4o / Claude 3.5
- **Gestão de Sessão:** Redis

## Estrutura de Arquivos (Planejada)
```text
/
├── prisma/               # Schema do banco (se usar Prisma)
├── src/
│   ├── app/              # App Router Next.js (Dashboard & Admin)
│   ├── components/       # Componentes de UI (Tailwind)
│   ├── lib/              # Lógica compartilhada (cliente Turso, utils de IA)
│   └── hooks/            # Hooks React customizados
├── n8n/
│   └── workflows/        # Workflows exportados em JSON
├── .agent/               # Instruções específicas para os agentes
└── ...
```

## Divisão de Tarefas

### Fase 1: Fundação (P0)
- [x] **Tarefa 1.1:** Configurar Infraestrutura do Projeto
  - **Agente:** `backend-specialist`
  - **Skills:** `nodejs-best-practices`, `database-design`
  - **Input:** Requisitos da stack tecnológica.
  - **Output:** Projeto Next.js inicializado e conexão com Turso.
  - **Verify:** Rodar `npm run dev` e testar conectividade com o banco.

- [x] **Tarefa 1.2:** Implementar API REST & Dashboard
  - **Funcionalidades:** Endpoints de Serviços, Disponibilidade, Agendamentos e Clientes.
  - **Interface:** Dashboard com Agenda, Cadastro de Profissionais/Serviços e Configurações de API.

### Fase 2: Mensageria & IA (P1)
- **Tarefa 2.1:** Implementar Workflow n8n para Mensagens
  - **Agente:** `backend-specialist`
  - **Skills:** `api-patterns`
  - **Input:** Specs do webhook WuzAPI.
  - **Output:** JSON do workflow n8n.
  - **Verify:** Enviar mensagem de teste para o WuzAPI e validar log no n8n.

- **Tarefa 2.2:** Engenharia do Prompt Mestre
  - **Agente:** `project-planner`
  - **Skills:** `brainstorming`
  - **Input:** Prompt mestre do documento.
  - **Output:** Prompt de sistema testado para a LLM.
  - **Verify:** Testar respostas do prompt com dados fictícios.

### Fase 3: UI do Dashboard (P2)
- **Tarefa 3.1:** Layout do Dashboard & Identidade Visual
  - **Agente:** `frontend-specialist`
  - **Skills:** `frontend-design`, `tailwind-patterns`
  - **Input:** Paleta de cores e tokens de design do documento (Seção 4).
  - **Output:** Estrutura do dashboard com sidebar e navegação.
  - **Verify:** Auditoria visual contra as regras de design (sem roxo, visual premium).

- **Tarefa 3.2:** Painel do Estabelecimento (Tenant Dashboard)
  - **Agente:** `frontend-specialist`
  - **Skills:** `frontend-design`
  - **Input:** Lista de módulos (Seção 5.3): Agenda do dia, Gestão de serviços/profissionais, Configuração da IA, Relatórios NPS.
  - **Output:** Telas funcionais para gestão do negócio.
  - **Verify:** Fluxo de criação de serviço e visualização de agenda.

### Fase 4: Super Admin & Expansão (P2)
- **Tarefa 4.1:** Dashboard Super Admin (SaaS Owner)
  - **Agente:** `frontend-specialist`
  - **Skills:** `frontend-design`
  - **Input:** Módulos do Super Admin (Seção 5.4): Gestão de tenants, Monitoramento WuzAPI, Logs de conversa, Métricas globais.
  - **Output:** Painel de controle global da plataforma.
  - **Verify:** Capacidade de visualizar logs de diferentes tenants e métricas de churn.

- **Tarefa 4.2:** Integração de Pagamentos (Roadmap)
  - **Agente:** `backend-specialist`
  - **Skills:** `api-patterns`
  - **Input:** Integração Pagar.me ou Stripe.
  - **Output:** Fluxo de checkout para assinatura de planos.
  - **Verify:** Processamento de transação de teste.

## Fase X: Verificação
- [ ] Rodar `python .agent/scripts/verify_all.py .`
- [ ] Verificação de build: `npm run build`
- [ ] Teste manual: Isolamento multi-tenant verificado em ambos os painéis.
