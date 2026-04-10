# Roteiro de vídeo — SeniorEase (mobile e web)

Use este guião para gravar uma demo contínua (sugerido: **8–15 minutos**). Ajuste tempos conforme o seu ritmo. Onde diz “app”, pode gravar **Expo/mobile** e repetir o bloco equivalente no **navegador (web)** se quiser mostrar as duas plataformas.

**Sugestão de abertura (5–10 s):** logótipo ou nome “SeniorEase” + frase: *“Plataforma de acessibilidade digital para apoiar idosos na vida académica e profissional.”*

---

## 1. Primeira abertura — Onboarding (só quem nunca usou)

| Tempo | O que mostrar | O que dizer (exemplo) |
|--------|----------------|------------------------|
| 20–40 s | Ecrã de boas-vindas → passos de configuração | “Na primeira vez, o app pergunta só o essencial: tamanho do texto, contraste, modo básico ou avançado e espaçamento. Tudo isto pode mudar depois em Personalização.” |
| 15 s | Último passo → “Entrar no app” | “Com um toque guardamos estas opções e entramos nas tarefas.” |

**Nota para gravação:** se o onboarding não aparecer, limpe dados da app / localStorage de teste ou use perfil novo.

---

## 2. Navegação geral

| Tempo | O que mostrar | O que dizer |
|--------|----------------|-------------|
| 15–25 s | Abas: **Tarefas**, **Personalização**, **Tutor**, **Perfil** (mobile); mesma ordem na web | “Há quatro áreas: organizar atividades, ajustar acessibilidade, área do tutor e o meu perfil com contacto de apoio.” |

---

## 3. Personalização da experiência

| Tempo | O que mostrar | O que dizer |
|--------|----------------|-------------|
| 30–60 s | **Tamanho da fonte** (vários níveis) | “A letra aumenta de verdade em todo o app, não é só zoom.” |
| 20–40 s | **Contraste** (normal / alto / muito alto na web) | “Quem tem dificuldade com fundo cinza pode passar para contraste alto.” |
| 20–40 s | **Espaçamento** | “Mais espaço entre botões ajuda a acertar no dedo ou no rato.” |
| 20–30 s | **Modo básico / avançado** | “No modo básico mostramos menos opções de uma vez, para não sobrecarregar.” |
| 15–25 s | **Feedback reforçado** e **confirmações extras** | “Posso pedir confirmação antes de apagar ou concluir, e mensagens mais visíveis após cada ação.” |

---

## 4. Tarefas — criar, prazo e obrigatoriedade

| Tempo | O que mostrar | O que dizer |
|--------|----------------|-------------|
| 20–30 s | **Nova tarefa** → título obrigatório | “Criar uma tarefa começa sempre por um título claro.” |
| 15–25 s | Descrição, categoria (opcional) | “Detalhes e categoria são opcionais.” |
| 20–35 s | **Prazo** (data no web; AAAA-MM-DD no mobile) | “Se definir prazo, o sistema pode lembrar: no telemóvel às 9h do dia; no browser, notificação no dia se o utilizador permitir.” |
| 25–40 s | **Tarefa obrigatória** (tutor confirma) | “Tarefas obrigatórias só ficam concluídas depois do tutor aprovar — dá segurança em atividades importantes.” |
| 20–40 s | **Etapas** (subtarefas) no web; opcional no mobile | “No site posso partir a tarefa em passos e ir marcando o que já fiz.” |
| 10 s | Guardar / criar | “Gravar e a tarefa aparece na lista.” |

---

## 5. Tarefas — cartão de resumo e lista

| Tempo | O que mostrar | O que dizer |
|--------|----------------|-------------|
| 15–25 s | **Bloco Resumo** no topo | “Aqui vejo de relance: quantas estão abertas, quantas esperam o tutor e quantas concluí nos últimos sete dias.” |
| 20–40 s | Cartões na grelha / lista | “Cada cartão mostra prazo, categoria, se é obrigatória e o estado ‘a aguardar tutor’.” |
| 25–45 s | **Marcar etapas** (se existirem) e **Concluir** | “Completo os passos e depois concluo a tarefa.” |
| 30–50 s | Fluxo **obrigatória**: Concluir → pedido ao tutor | “Quando é obrigatória, o pedido vai para a área do tutor; aqui fica a mostrar ‘a aguardar confirmação’.” |
| 15–25 s | **Histórico** | “O histórico mostra o que já foi concluído com data.” |
| 15–25 s | **Excluir** (com confirmação se ativa) | “Apagar pede confirmação se essa opção estiver ligada.” |

---

## 6. Banner do tutor (lembrete ao idoso)

| Tempo | O que mostrar | O que dizer |
|--------|----------------|-------------|
| 15–30 s | Na aba **Tutor**, **Enviar lembrete** numa tarefa; voltar a **Tarefas** | “O tutor pode simular um lembrete; aparece um aviso na lista de tarefas para o idoso ler e pode dispensar.” |

*(No mobile há também notificação local simulada; na web o aviso in-app é o foco da demo.)*

---

## 7. Área do Tutor

| Tempo | O que mostrar | O que dizer |
|--------|----------------|-------------|
| 20–35 s | **Adicionar tutor** (nome, telefone, e-mail) | “Cadastro local de quem apoia — é simulação até haver servidor.” |
| 15–25 s | **Principal** / remover | “Definimos um tutor principal e podemos remover perfis.” |
| 40–70 s | **Pedidos**: aprovar ou recusar conclusão obrigatória | “Quando o idoso pede conclusão, o tutor aprova ou recusa; a lista de tarefas atualiza logo.” |
| 15–25 s | **Marcar como visto** em ações críticas | “Outros pedidos, como guardar perfil, podem ser só registados para o tutor ver.” |
| 15–25 s | **Histórico de lembretes** enviados | “Fica registo dos lembretes disparados.” |
| 15–20 s | Botão **ajuda** (área Tutor) | “Há ajuda contextual; se o servidor da IA não estiver disponível, o app explica na mesma com guia local.” |

---

## 8. Assistente / IA na nuvem vs modo local

| Tempo | O que mostrar | O que dizer |
|--------|----------------|-------------|
| 25–45 s | **Ajuda da assistente** (tarefas) ou ajuda na área Tutor **sem backend** | “Tentamos falar com a inteligência artificial no servidor. Se falhar a rede, **não perdemos as tarefas nem os lembretes** — aparece um aviso e a dica vem do guia local do próprio app.” |

**Dica de gravação:** com `localhost` ou API desligada, o aviso de “sem conexão com a assistente na nuvem” aparece naturalmente.

---

## 9. Perfil e contacto de apoio

| Tempo | O que mostrar | O que dizer |
|--------|----------------|-------------|
| 20–35 s | Dados simulados + resumo das preferências | “O perfil resume quem sou e as opções de acessibilidade; para mudar detalhes finos uso Personalização.” |
| 35–55 s | **Contacto de apoio**: nome, telefone, guardar | “Guardo o contacto de uma pessoa de confiança neste dispositivo ou navegador.” |
| 20–35 s | **Ligar** e **SMS** | “Com um toque ligo ou abro mensagem — útil em stress ou dúvida.” |
| 20–35 s | **Salvar perfil** (notificar tutor) | “Ações importantes podem gerar um pedido na fila do tutor, como simulação de acompanhamento.” |

*(No mobile, salvar perfil pode passar por modal de aprovação do tutor conforme configuração.)*

---

## 10. Co-piloto e hesitação (só mobile — mencionar no vídeo)

| Tempo | O que mostrar | O que dizer |
|--------|----------------|-------------|
| 20–40 s | Parar na tela sem tocar ~20+ s | “No telemóvel, se eu hesitar, o app pode oferecer ajuda por voz e destacar um botão.” |
| 10–15 s | Bolha do co-piloto / fechar / repetir | “Posso ouvir de novo a dica e fechar quando quiser.” |

**Se o vídeo for só web:** uma frase basta: *“Na versão móvel ainda há co-piloto por voz e deteção de hesitação.”*

---

## 11. Fecho (10–20 s)

| O que dizer (exemplo) |
|------------------------|
| “O SeniorEase junta **tarefas simples**, **personalização real de acessibilidade**, **papel do tutor** onde faz sentido e **apoio inteligente** que funciona mesmo quando a internet falha. Obrigado.” |

---

## Checklist rápido antes de gravar

- [ ] Backend opcional: mostrar **com** e **sem** API para o aviso de IA offline.  
- [ ] Pelo menos **uma tarefa obrigatória** pendente + aprovação no **Tutor**.  
- [ ] **Contacto de apoio** preenchido.  
- [ ] **Onboarding** (instalação limpa) ou explicar que já foi feito.  
- [ ] Áudio claro; se mobile, **não** cobrir o microfone ao mostrar gestos.

---

*Documento alinhado às funcionalidades mobile (Expo) e web (Next.js) do repositório SeniorEase / Projeto IAdoso.*
