# SeniorEase - Plataforma de Acessibilidade Digital para Idosos

## 📋 Sobre o Projeto

O **SeniorEase** é uma plataforma desenvolvida para facilitar a vida acadêmica e profissional de pessoas idosas, promovendo autonomia, confiança e inclusão digital. A plataforma foi desenvolvida com foco em acessibilidade, oferecendo personalização completa da experiência do usuário.

## 🎯 Funcionalidades Principais

### 1. Painel de Personalização da Experiência
- Ajuste de tamanho da fonte
- Nível de contraste personalizável
- Espaçamento entre elementos
- Modo básico / modo avançado
- Feedback visual reforçado
- Confirmação adicional antes de ações críticas

### 2. Organizador de Atividades Simplificado
- Lista de tarefas com visual simples e direto
- Etapas guiadas para execução de atividades
- Lembretes com linguagem clara
- Avisos de conclusão com feedback positivo
- Histórico simples de atividades realizadas

### 3. Perfil do Usuário + Configurações Persistentes
- Armazenamento de preferências de acessibilidade
- Sincronização entre dispositivos
- Configurações persistentes

## 🏗️ Arquitetura

O projeto segue os princípios de **Clean Architecture** com separação clara entre:

- **Domínio**: Entidades e regras de negócio
- **Casos de Uso**: Lógica de aplicação independente de UI
- **Adaptadores**: Implementações de interfaces (UI, persistência)

## 📱 Tecnologias

### Web
- **Next.js 14** (React)
- **TypeScript**
- **Tailwind CSS**
- **Zustand** (Gerenciamento de estado)

### Mobile
- **React Native**
- **TypeScript**
- **Expo**
- **AsyncStorage** (Persistência local)

### Compartilhado
- **TypeScript** para lógica de domínio
- Interfaces e casos de uso reutilizáveis

## 🚀 Como Executar

### Instalação Rápida

Na raiz do projeto, execute:

```bash
npm run install:all
```

cd ### Versão Web (Desenvolvimento)

**Opção 1: Da raiz**
```bash
npm run dev:web
```

**Opção 2: Do diretório web**
```bash
cd web
npm install
npm run dev
```

Acesse: http://localhost:3000

**⚠️ NOTA**: Use `npm run dev` para desenvolvimento. O comando `npm start` só funciona após fazer o build (`npm run build`).

### Versão Mobile

**Opção 1: Da raiz**
```bash
npm run start:mobile
```

**Opção 2: Do diretório mobile**
```bash
cd mobile
npm install
## ♿ Acessibilidade

O SeniorEase implementa as seguintes melhorias de acessibilidade:

- ✅ Ajustes reais de legibilidade (fonte, contraste, espaçamento)
- ✅ Botões e áreas clicáveis ampliadas
- ✅ Feedback claro após cada ação
- ✅ Redução de complexidade visual
- ✅ Navegação previsível
- ✅ Fluxos guiados passo a passo
- ✅ Animações suaves e controláveis

## 📁 Estrutura do Projeto

```
seniorease/
├── shared/           # Código compartilhado (domínio, casos de uso)
├── web/              # Aplicação Next.js
├── mobile/           # Aplicação React Native
├── README.md         # Este arquivo
├── INSTALL.md        # Guia de instalação detalhado
└── ARCHITECTURE.md   # Documentação da arquitetura
```

## 📚 Documentação Adicional

- **[INSTALL.md](./INSTALL.md)**: Guia completo de instalação e execução
- **[ARCHITECTURE.md](./ARCHITECTURE.md)**: Documentação detalhada da arquitetura Clean Architecture

## 🎨 Recursos de Acessibilidade Implementados

### Personalização Visual
- **4 níveis de tamanho de fonte**: Pequeno, Médio, Grande, Muito Grande
- **3 níveis de contraste**: Normal, Alto, Muito Alto
- **4 níveis de espaçamento**: Compacto, Normal, Confortável, Espaçoso

### Interação
- **Botões ampliados**: Mínimo de 44x44px (padrão de acessibilidade)
- **Feedback visual reforçado**: Confirmações visuais após cada ação
- **Confirmações extras**: Opção de confirmar antes de ações críticas
- **Navegação simplificada**: Interface clara e previsível

### Organização
- **Tarefas com etapas**: Quebra de atividades complexas em passos simples
- **Histórico visual**: Registro de atividades concluídas com feedback positivo
- **Linguagem clara**: Textos diretos e fáceis de entender

## 🔄 Próximos Passos (Sugestões)

- [ ] Implementar autenticação de usuários
- [ ] Adicionar sincronização em nuvem
- [ ] Implementar sistema de notificações
- [ ] Adicionar testes automatizados
- [ ] Criar versão PWA (Progressive Web App)
- [ ] Implementar modo offline

## 👥 Desenvolvido para FIAP Inclusive

Este projeto foi desenvolvido como parte do movimento **FIAP Inclusive** para melhorar a experiência digital de pessoas idosas, promovendo autonomia, confiança e inclusão digital.

## 📄 Licença

Este projeto foi desenvolvido para fins educacionais como parte do Hackathon FIAP Inclusive.
