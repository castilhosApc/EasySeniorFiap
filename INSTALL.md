# Guia de Instalação - SeniorEase

## Pré-requisitos

- Node.js 18+ instalado
- npm ou yarn
- Para mobile: Expo CLI (`npm install -g expo-cli`)

## Instalação

### Opção 1: Instalação Rápida (Recomendada)

Execute na raiz do projeto:

```bash
npm run install:all
```

Isso instalará todas as dependências de uma vez.

### Opção 2: Instalação Manual

#### 1. Instalar dependências do código compartilhado

```bash
cd shared
npm install
```

#### 2. Instalar dependências da versão Web

```bash
cd ../web
npm install
```

#### 3. Instalar dependências da versão Mobile

```bash
cd ../mobile
npm install
```

**⚠️ IMPORTANTE**: Certifique-se de estar no diretório correto antes de executar os comandos!

## Executando o Projeto

### Versão Web (Next.js) - Desenvolvimento

**Opção 1: Da raiz do projeto**
```bash
npm run dev:web
```

**Opção 2: Do diretório web**
```bash
cd web
npm run dev
```

A aplicação estará disponível em: http://localhost:3000

**⚠️ IMPORTANTE**: 
- Para **desenvolvimento**, use `npm run dev` (não requer build)
- Para **produção**, primeiro execute `npm run build` e depois `npm start`
- O comando `npm start` só funciona após fazer o build do projeto

### Versão Mobile (React Native/Expo)

**Opção 1: Da raiz do projeto**
```bash
npm run start:mobile
```

**Opção 2: Do diretório mobile**
```bash
cd mobile
npm start
```

Isso abrirá o Expo DevTools. Você pode:
- Escanear o QR code com o app Expo Go no seu celular
- Pressionar `a` para abrir no emulador Android
- Pressionar `i` para abrir no simulador iOS

**⚠️ NOTA**: O script `npm start` só funciona dentro dos diretórios `web/` ou `mobile/`. Se você estiver na raiz ou em `shared/`, use os scripts do `package.json` da raiz ou navegue até o diretório correto.

## 🔧 Solução de Problemas

### Erro: "ENOENT: no such file or directory, open '.next/BUILD_ID'"

Este erro ocorre quando você tenta executar `npm start` (produção) sem ter feito o build primeiro.

**Solução**: Use `npm run dev` para desenvolvimento, que não requer build:

```bash
cd web
npm run dev
```

Ou se quiser usar produção, primeiro faça o build:

```bash
cd web
npm run build
npm start
```

### Diferença entre `dev` e `start`

- **`npm run dev`**: Modo desenvolvimento (hot reload, sem build necessário)
- **`npm start`**: Modo produção (requer build prévio com `npm run build`)

### Erro: "Missing script: start"

Você está no diretório errado. Certifique-se de estar em:
- `web/` para a versão web
- `mobile/` para a versão mobile

Ou use os scripts da raiz: `npm run dev:web` ou `npm run start:mobile`

## Estrutura do Projeto

```
seniorease/
├── shared/              # Código compartilhado (Clean Architecture)
│   ├── domain/         # Entidades e regras de negócio
│   ├── use-cases/      # Casos de uso
│   └── repositories/   # Interfaces de repositórios
├── web/                # Aplicação Next.js
│   ├── app/           # Páginas e layouts
│   ├── components/    # Componentes React
│   └── store/         # Gerenciamento de estado (Zustand)
└── mobile/            # Aplicação React Native
    ├── src/
    │   ├── screens/   # Telas da aplicação
    │   ├── store/     # Gerenciamento de estado
    │   └── providers/ # Providers React
    └── App.tsx        # Componente raiz
```

## Funcionalidades Implementadas

### ✅ Painel de Personalização
- Ajuste de tamanho da fonte (4 níveis)
- Nível de contraste (3 níveis)
- Espaçamento entre elementos (4 níveis)
- Modo básico/avançado
- Feedback visual reforçado
- Confirmações extras

### ✅ Organizador de Atividades
- Criação de tarefas com etapas
- Visualização de progresso
- Histórico de atividades concluídas
- Confirmações antes de ações críticas
- Feedback positivo ao completar tarefas

### ✅ Perfil do Usuário
- Visualização de informações pessoais
- Exibição de configurações de acessibilidade
- Preferências de lembretes

### ✅ Acessibilidade
- Botões com tamanho mínimo de 44x44px
- Contraste ajustável
- Fontes grandes e legíveis
- Espaçamento confortável
- Navegação previsível
- Feedback claro após ações

## Tecnologias Utilizadas

- **Web**: Next.js 14, React, TypeScript, Tailwind CSS, Zustand
- **Mobile**: React Native, Expo, TypeScript, Zustand, AsyncStorage
- **Compartilhado**: TypeScript, Clean Architecture

## Notas Importantes

- As configurações de acessibilidade são salvas automaticamente (localStorage na web, AsyncStorage no mobile)
- As tarefas são salvas localmente (localStorage na web, AsyncStorage no mobile)
- Em produção, recomenda-se implementar um backend para sincronização entre dispositivos
