# Arquitetura do SeniorEase

## Clean Architecture

O projeto segue os princípios de **Clean Architecture**, garantindo separação de responsabilidades e independência de frameworks.

### Estrutura de Camadas

```
shared/
├── domain/                    # Camada de Domínio (Núcleo)
│   ├── entities/             # Entidades de negócio
│   │   ├── User.ts          # Entidade Usuário
│   │   └── Task.ts          # Entidade Tarefa
│   ├── repositories/        # Interfaces de repositórios
│   │   ├── IUserRepository.ts
│   │   ├── ITaskRepository.ts
│   │   └── IPreferencesRepository.ts
│   └── services/            # Serviços de domínio
│       └── AccessibilityService.ts
│
└── use-cases/               # Camada de Casos de Uso
    ├── UpdateUserPreferences.ts
    ├── CreateTask.ts
    ├── CompleteTask.ts
    ├── GetTaskHistory.ts
    └── GetUserPreferences.ts
```

### Princípios Aplicados

1. **Independência de Frameworks**: O código compartilhado não depende de React, Next.js ou React Native
2. **Testabilidade**: Casos de uso podem ser testados sem dependências de UI
3. **Reutilização**: A mesma lógica de negócio é usada em Web e Mobile
4. **Inversão de Dependência**: Interfaces definem contratos, implementações ficam nas camadas externas

## Adaptadores (Camadas Externas)

### Web (Next.js)

```
web/
├── app/                     # Páginas Next.js
├── components/             # Componentes React (UI)
│   ├── PersonalizationPanel.tsx
│   ├── TaskOrganizer.tsx
│   └── UserProfile.tsx
└── store/                  # Implementação de persistência
    └── accessibilityStore.ts  # Zustand + localStorage
```

### Mobile (React Native)

```
mobile/
├── src/
│   ├── screens/            # Telas React Native (UI)
│   │   ├── TasksScreen.tsx
│   │   ├── PersonalizationScreen.tsx
│   │   └── ProfileScreen.tsx
│   └── store/             # Implementação de persistência
│       └── accessibilityStore.ts  # Zustand + AsyncStorage
└── App.tsx                # Componente raiz
```

## Fluxo de Dados

### 1. Atualização de Preferências

```
UI (Componente React)
  ↓
Store (Zustand)
  ↓
LocalStorage/AsyncStorage (Persistência)
  ↓
Aplicação de Estilos (CSS/StyleSheet)
```

### 2. Criação de Tarefa

```
UI (Formulário)
  ↓
Store (Estado Local)
  ↓
LocalStorage/AsyncStorage (Persistência)
  ↓
Atualização da UI (Feedback)
```

## Padrões de Design Utilizados

### 1. Repository Pattern
- Interfaces definem contratos de acesso a dados
- Implementações específicas para Web (localStorage) e Mobile (AsyncStorage)

### 2. Use Case Pattern
- Cada caso de uso encapsula uma regra de negócio específica
- Independente de UI e frameworks

### 3. State Management (Zustand)
- Gerenciamento de estado global
- Persistência automática
- Sincronização entre componentes

## Acessibilidade

### Implementação

1. **Serviço de Acessibilidade** (`AccessibilityService`)
   - Centraliza lógica de cálculo de valores
   - Converte preferências em valores CSS/StyleSheet

2. **Aplicação Dinâmica**
   - Web: CSS Variables + Classes dinâmicas
   - Mobile: StyleSheet.create() com valores calculados

3. **Persistência**
   - Preferências salvas automaticamente
   - Aplicadas ao carregar a aplicação

## Extensibilidade

### Adicionar Nova Funcionalidade

1. **Domínio**: Criar entidade em `shared/domain/entities/`
2. **Repositório**: Definir interface em `shared/domain/repositories/`
3. **Caso de Uso**: Implementar em `shared/use-cases/`
4. **UI Web**: Criar componente em `web/components/`
5. **UI Mobile**: Criar tela em `mobile/src/screens/`
6. **Store**: Adicionar estado em `web/store/` e `mobile/src/store/`

### Exemplo: Adicionar Sistema de Notificações

```typescript
// 1. Domínio
shared/domain/entities/Notification.ts

// 2. Repositório
shared/domain/repositories/INotificationRepository.ts

// 3. Caso de Uso
shared/use-cases/CreateNotification.ts

// 4. UI Web
web/components/NotificationCenter.tsx

// 5. UI Mobile
mobile/src/screens/NotificationsScreen.tsx
```

## Testes (Futuro)

A arquitetura permite testes em cada camada:

- **Domínio**: Testes unitários de entidades e serviços
- **Casos de Uso**: Testes de lógica de negócio
- **UI**: Testes de componentes (React Testing Library)
- **Integração**: Testes end-to-end

## Benefícios da Arquitetura

1. ✅ **Manutenibilidade**: Código organizado e fácil de entender
2. ✅ **Testabilidade**: Cada camada pode ser testada independentemente
3. ✅ **Reutilização**: Lógica compartilhada entre Web e Mobile
4. ✅ **Escalabilidade**: Fácil adicionar novas funcionalidades
5. ✅ **Flexibilidade**: Trocar frameworks sem afetar lógica de negócio
