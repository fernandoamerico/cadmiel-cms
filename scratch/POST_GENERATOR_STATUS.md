# Status do Gerador Automático de Posts (Agent Publisher)

## ✅ O que já foi feito (Concluído)

1. **Estrutura do Script (`agent-publisher.ts`)**
   - Criação do script básico para gerar e publicar posts automaticamente.
   - Integração com a API da OpenAI para gerar o conteúdo em texto do blog post.
   - Geração do `slug` automático baseado no título.
   - Função para gerar imagens de capa usando a API de Imagens da OpenAI (ex: `dall-e`).

2. **Frontend (Site `cadmiel`)**
   - Correção do bug visual onde a imagem antiga/errada dava um "flash" antes da imagem certa aparecer.
   - Alteração no `src/lib/payload.js` para capturar a `main_img` (imagem original, sem redimensionamento) em vez de apenas a versão `card`.
   - Atualização no `BlogPostPage.jsx` para usar a `main_img` no banner principal (hero), garantindo a melhor resolução e prevenindo o carregamento de thumbnails antigos cacheados.
   - Commit e Push das correções visuais do frontend para o repositório principal.

## 🚧 O que falta / Próximos Passos (To-Do)

- [x] **Ajustar o Modelo de Imagem no Script:**
  - O código atual pede o modelo `gpt-image-1-mini`, que não é o padrão da OpenAI. É recomendável testar ou alterar para `dall-e-3` ou `dall-e-2` no `openai.images.generate`.
- [ ] **Validação do Upload de Imagem no Payload CMS:**
  - Garantir que a imagem em base64 (`b64_json`) gerada pela OpenAI está sendo corretamente convertida e anexada/enviada para a coleção de `media` do Payload CMS via API.
- [ ] **Geração dos Campos AEO (Answer Engine Optimization):**
  - Garantir que o script do Agente Publisher também gera e preenche a "Resposta Direta" (`quickAnswer`) para melhorar o SEO/AEO.
- [ ] **Tratamento de Erros:**
  - Adicionar blocos robustos de `catch` para caso a API da OpenAI falhe ou o Payload recuse a criação do post.
- [ ] **Automação de Rotina (Cron / Deploy):**
  - Definir como o script vai rodar automaticamente no futuro (ex: Vercel Cron, GitHub Actions ou PM2/Servidor local).
- [ ] **Rodar Teste Fim a Fim:**
  - Executar o `agent-publisher.ts` e verificar no CMS (Painel do Payload) e no Frontend se o post gerado (texto + imagem) entra no ar 100% correto, do começo ao fim.
