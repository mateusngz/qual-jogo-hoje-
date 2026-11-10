# Qual jogo hoje? 🎮

PWA mobile-first para organizar o backlog, descobrir o que jogar, registrar sessões e acompanhar estatísticas. **100% HTML, CSS e JavaScript**, sem backend ou framework.

## Como usar

1. Crie uma conta em [RAWG API](https://rawg.io/apidocs) e obtenha sua chave gratuita.
2. Abra `config.js` e substitua `SUA_CHAVE_RAWG_AQUI` pela sua chave.
3. Na pasta do projeto, execute `python3 -m http.server 8000` e abra **http://localhost:8000/**.
4. No navegador compatível, use **Instalar app** ou a opção de instalação no menu do navegador. É necessário localhost ou HTTPS para o service worker funcionar.

Sem chave ou internet, é possível cadastrar jogos manualmente. A busca RAWG precisa de conexão.

## Publicação gratuita

**GitHub Pages:** envie os arquivos para um repositório. Em **Settings → Pages → Build and deployment**, escolha **Deploy from a branch**, branch `main`, pasta `/ (root)`. Acesse a URL indicada pelo GitHub.

**Vercel:** importe o repositório pelo dashboard da Vercel e selecione **Other** (site estático), sem comando de build. Publique o diretório raiz.

> **Atenção:** a chave colocada em `config.js` é pública em qualquer deploy estático; não é possível escondê-la sem backend. Para projeto público com controle de abuso, seria necessário usar um proxy server-side e proteger a chave lá. Verifique limites e condições atuais da RAWG.

## Organização

- `index.html` — navegação e layout base
- `styles.css` — tema responsivo e animações
- `config.js` — chave da API RAWG
- `js/api.js` — chamadas RAWG, cache de resultados por 7 dias, erros de rede e limite
- `js/storage.js` — jogos, sessões, timer e backups no localStorage
- `js/vibes.js` — mapeamento de gêneros/tags em vibes; fácil de personalizar
- `js/ui.js` — componentes e telas
- `js/main.js` — eventos, busca com debounce, sorteio ponderado, cronômetro e instalação
- `sw.js` — cache do app para funcionamento offline
- `manifest.json` e `icons/` — metadados e ícones de instalação

## Observações

- O tempo médio de jogo fornecido pela RAWG se refere ao tempo médio total, **não** à duração de uma sessão. O sorteio usa esse número apenas como um sinal leve de preferência; jogos longos continuam elegíveis.
- O cronômetro continua contando após fechar a aba enquanto estiver em andamento. Use **Salvar sessão** para registrar o tempo. Sessões manuais aceitam horas e minutos.
- Backups importados **substituem**, em vez de mesclar, os dados atuais. Exporte um JSON antes.
- Dados não são sincronizados entre dispositivos. Limpar os dados do site remove a biblioteca local. As imagens externas podem exigir internet quando não estiverem em cache.
- O app inclui um link de atribuição ativo à [RAWG](https://rawg.io/) em todas as páginas.
