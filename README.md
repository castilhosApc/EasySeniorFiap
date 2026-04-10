# SeniorEase — Plataforma de Acessibilidade Digital para Idosos

## Sobre o projeto

O **SeniorEase** é uma aplicação (web e mobile) pensada para apoiar pessoas idosas na organização de tarefas e na personalização da interface, com foco em **acessibilidade**, **linguagem clara** e **fluxos guiados**. O objetivo é promover autonomia digital no contexto acadêmico e do dia a dia.

Este repositório contém três partes principais:

| Pasta | Função |
|--------|--------|
| `shared/` | Domínio e casos de uso em TypeScript (entidades, serviços, contratos de repositório) reutilizados pela web e pelo mobile |
| `web/` | Aplicação **Next.js 14** (React) com estado persistido no navegador |
| `mobile/` | Aplicação **React Native + Expo** com persistência local (AsyncStorage) |

---

## Visão geral das funcionalidades

Abaixo está um resumo do que o projeto já implementa, alinhado às telas e módulos do código.

### Primeira utilização (onboarding)

- **Assistente de boas-vindas** (web e mobile) que orienta o uso inicial antes de abrir o app principal.
- Preferências de onboarding são guardadas em armazenamento local para não repetir o fluxo a cada abertura.

### Personalização e acessibilidade

- **Tamanho da fonte**, **contraste** e **espaçamento** entre elementos (valores aplicados via CSS no web e tema no mobile).
- **Modo de interface**: **básico** (menos abas e complexidade) ou **avançado** (inclui recursos de tutor e assistente contextual).
- **Feedback visual reforçado** após ações (por exemplo, confirmação ao criar tarefa).
- **Confirmações extras** antes de ações sensíveis (quando configurado).
- **Redução de movimento** (menos animações) quando ativada.
- **Preferências de lembretes** (ligar/desligar e frequência) integradas ao fluxo de lembretes de tarefas.

### Organizador de tarefas

- **Lista de tarefas** com cartões legíveis e ações claras.
- **Criação de tarefas** com dados como título, descrição, categoria, data de vencimento e **passos** (subtarefas ordenadas).
- **Conclusão** com atualização de passos e histórico.
- **Tarefas com verificação pelo tutor**: opção de exigir confirmação antes de considerar a tarefa concluída; estados como pendente/aprovado/rejeitado.
- **Histórico** de atividades para consulta.
- **Lembretes de vencimento** (no web: permissão de notificação do navegador e lógica de “tarefas para hoje”; no mobile: serviços de lembrete simulados alinhados ao fluxo).

### Tutor (apoio de um familiar ou responsável)

- **Cadastro de tutores** (nome, telefone, e-mail) e tutor principal.
- **Fila de pendências** abertas pelo idoso (pedidos de ajuda) e registro de lembretes enviados ao tutor (fluxo simulado no app).
- **Aprovação ou rejeição** de conclusões de tarefas que exigem verificação obrigatória.
- **Definição pelo tutor** de quais tarefas são obrigatoriamente verificadas.
- A aba **Tutor** só aparece no **modo avançado** (web e mobile).

### Perfil e contato de confiança

- **Resumo do perfil** e das preferências atuais de acessibilidade.
- **Contato de apoio** (nome e telefone) com ações rápidas de **ligar** e **SMS** (no web via `tel:`/`sms:`; no mobile conforme as telas).
- **Notificação ao tutor** em ações críticas (fluxo de apoio integrado ao store de tutor).
- Opção de **limpar dados locais** do aplicativo (reinício do estado no dispositivo/navegador).

### Assistente / co-piloto (IA e guias locais)

- **Integração com backend** (API opcional, por exemplo PHP + Gemini, configurável via `NEXT_PUBLIC_API_URL` na web) e **fallback para guias locais** quando a rede falha ou o tempo esgota.
- **Dicas de voz/texto** e contexto da tela (elementos de UI e “dicas” como tarefas pendentes, pendências do tutor).
- **Avisos na interface** quando a resposta é local em vez da nuvem.
- No **mobile**: bolha de co-piloto, indicador de carregamento, detecção de hesitação (latência) para ajuda proativa, e **fala** opcional (preparação de áudio no fluxo do co-piloto).

### Componentes de interface comuns

- **Botões e cartões** com tamanhos adequados à acessibilidade (por exemplo, áreas tocáveis amplas no mobile).
- **Navegação** por abas (Tarefas, Personalização, Tutor — se avançado —, Perfil).

---

## Arquitetura

O projeto segue ideias de **Clean Architecture** no pacote `shared/`:

- **Domínio**: entidades (`User`, `Task`, `Tutor`, etc.) e serviços como `AccessibilityService`.
- **Casos de uso**: por exemplo `CreateTask`, `CompleteTask`, `GetTaskHistory`, `GetUserPreferences`, `UpdateUserPreferences`.
- **Contratos**: interfaces de repositório (`ITaskRepository`, `IPreferencesRepository`, `IUserRepository`) para futuras implementações de persistência remota.

As apps **web** e **mobile** implementam a experiência do usuário e a persistência local; a camada compartilhada centraliza regras e tipos.

---

## Tecnologias

### Web

- Next.js 14 (React), TypeScript, Tailwind CSS, Zustand (estado com persistência).

### Mobile

- React Native, Expo, TypeScript, AsyncStorage, React Navigation.

### Compartilhado

- TypeScript em `shared/` para domínio e casos de uso.

---

## Como executar

### Instalação rápida (raiz do projeto)

```bash
npm run install:all
```

Instala dependências em `shared`, `web` e `mobile`.

### Versão web (desenvolvimento)

**Da raiz:**

```bash
npm run dev:web
```

**Ou no diretório `web`:**

```bash
cd web
npm install
npm run dev
```

Acesse: http://localhost:3000

Use `npm run dev` para desenvolvimento. O comando `npm start` na pasta `web` normalmente exige build prévio (`npm run build`).

### Versão mobile (Expo)

**Da raiz:**

```bash
npm run start:mobile
```

**Ou no diretório `mobile`:**

```bash
cd mobile
npm install
npm start
```

---

## Variáveis de ambiente (web)

- `NEXT_PUBLIC_API_URL` — URL base da API (por exemplo `http://localhost:8000`). Se não estiver disponível, o assistente usa os guias locais com aviso na interface.

---

## Acessibilidade (resumo)

- Ajustes reais de legibilidade: fonte, contraste e espaçamento.
- Áreas clicáveis amplas e feedback após ações.
- Navegação previsível e fluxos guiados (onboarding e passos nas tarefas).
- Modo básico para reduzir complexidade; modo avançado para tutor e assistente.
- Opção de reduzir movimento na interface.

---

## Estrutura do repositório

```
seniorease/
├── shared/           # Domínio, casos de uso e contratos (TypeScript)
├── web/              # Aplicação Next.js
├── mobile/           # Aplicação React Native (Expo)
├── README.md         # Este arquivo
├── INSTALL.md        # Instalação detalhada
└── ARCHITECTURE.md   # Arquitetura em detalhe
```

---

## Documentação adicional

- [INSTALL.md](./INSTALL.md) — instalação passo a passo e execução
- [ARCHITECTURE.md](./ARCHITECTURE.md) — arquitetura e camadas

---

## Roadmap (em análise)

- Autenticação de usuários
- Sincronização em nuvem
- Notificações mais estruturadas
- Testes automatizados
- PWA (Progressive Web App)
- Modo offline ampliado

---

## FIAP Inclusive

Projeto desenvolvido no contexto do **FIAP Inclusive**, com foco em inclusão digital e apoio a pessoas idosas.

## Licença

Desenvolvido para fins educacionais no âmbito do Hackathon FIAP Inclusive.
