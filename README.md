# 🎮 Qual jogo hoje?

**Seu backlog, sem indecisão.** Um aplicativo web para organizar jogos, descobrir o que jogar conforme seu tempo e sua vibe, registrar sessões e acompanhar estatísticas — tudo em uma interface responsiva, escura e instalável.

**[🚀 Acessar o aplicativo](https://mateusngz.github.io/qual-jogo-hoje-/)** · [📂 Código-fonte](https://github.com/mateusngz/qual-jogo-hoje-)

> Projeto acadêmico de front-end desenvolvido com **HTML, CSS e JavaScript puro**, sem frameworks, banco de dados ou backend.

## 💡 O problema

Já abriu sua biblioteca, ficou olhando dezenas de jogos e acabou não jogando nenhum? O **Qual jogo hoje?** foi criado para reduzir essa paralisia de escolha: em vez de percorrer o backlog inteiro, você informa quanto tempo tem e qual experiência procura, e recebe uma sugestão.

## ✨ Funcionalidades

- **🎲 Descobrir:** escolha o tempo disponível (**30 min, 1 h, 2 h ou 3 h+**) e uma vibe (**História, Competir, Relaxar, Adrenalina ou Cooperativo**). Receba uma sugestão da sua biblioteca, sorteie outra ou comece a jogar.
- **🔎 Busca e cadastro:** pesquise jogos pelo nome e selecione um resultado. O app tenta preencher automaticamente nome e capa, além de outras informações quando disponíveis. Todos os campos podem ser editados; também há cadastro manual.
- **📚 Biblioteca:** visualize seus jogos e filtre por nome, status e vibe.
- **🏷️ Progresso:** marque cada jogo como **No backlog, Jogando, Zerado ou Abandonado**.
- **⏱️ Sessões:** registre o tempo jogado por cronômetro ou manualmente e consulte o histórico.
- **📝 Notas:** anote onde parou, dicas, configurações e observações.
- **📊 Estatísticas:** acompanhe horas jogadas, jogos zerados, jogo mais jogado e horas por semana.
- **💾 Backup:** exporte e importe seus dados em JSON.
- **📱 PWA:** interface mobile-first, instalação em navegadores compatíveis e acesso offline às funcionalidades locais após o carregamento inicial.

## 🕹️ Como usar

1. Abra o **[Qual jogo hoje?](https://mateusngz.github.io/qual-jogo-hoje-/)**.
2. Entre em **Biblioteca → Adicionar jogo**.
3. Pesquise um título, selecione o resultado e ajuste os dados, se necessário. Depois, salve.
4. Na tela **Descobrir**, selecione o tempo e a vibe e clique em **Encontrar meu próximo jogo**.
5. Clique em **Começar a jogar** para acompanhar a sessão; consulte depois suas **Estatísticas**.

**Dica:** mantenha alguns jogos com status **No backlog** ou **Jogando** para que participem das sugestões.

## 🧰 Tecnologias

| Tecnologia | Uso |
| --- | --- |
| **HTML5** | Estrutura semântica da interface |
| **CSS3** | Tema escuro, animações e layout responsivo |
| **JavaScript (ES Modules)** | Lógica, busca, filtros, recomendações e sessões |
| **localStorage** | Persistência dos jogos, notas, sessões e configurações locais |
| **Service Worker + Web App Manifest** | Cache offline e instalação como PWA |
| **GitHub Pages** | Hospedagem estática gratuita |

### 🎮 De onde vêm os dados dos jogos?

O aplicativo combina fontes, com funcionamento progressivo:

1. **CheapShark:** busca online em um catálogo amplo, especialmente de jogos de PC, **sem exigir chave de API**. A disponibilidade de resultados, capas e detalhes varia conforme o título.
2. **RAWG (opcional):** ao configurar uma chave em `config.js`, o app também consulta a RAWG, que pode fornecer gêneros, tags, descrição, tempo estimado e capas.
3. **Catálogo demonstrativo local:** 15 jogos conhecidos disponíveis para busca mesmo sem conexão, com informações pré-cadastradas.
4. **Capas da Steam:** o app utiliza imagens públicas da CDN da Steam para títulos conhecidos e resultados que trazem um identificador Steam.

**Limitações:** nenhuma dessas fontes garante encontrar todos os jogos. O CheapShark é focado em PC e pode retornar dados incompletos; jogos sem capa ou metadados podem ser completados manualmente. Sem chave RAWG, informações como descrição, gêneros e tempo médio não são preenchidas para todos os resultados online. A busca online e as imagens externas dependem de conexão, ao contrário da biblioteca local.

## 💻 Executar localmente

Não é necessário instalar dependências ou usar Node.js.

```bash
git clone https://github.com/mateusngz/qual-jogo-hoje-.git
cd qual-jogo-hoje-
python3 -m http.server 8000
```

Abra **http://localhost:8000/**.

> Evite abrir o `index.html` diretamente via `file://`: módulos JavaScript e service workers precisam de um servidor local ou HTTPS.

### Configurar RAWG (opcional)

1. Consulte a documentação em **[RAWG API](https://rawg.io/apidocs)** e obtenha sua chave.
2. Edite `config.js`:

```js
window.APP_CONFIG = Object.freeze({
  RAWG_API_KEY: 'SUA_CHAVE_AQUI'
});
```

3. Recarregue o aplicativo.

**Atenção:** em uma hospedagem estática, qualquer chave colocada em `config.js` fica visível para visitantes. Não publique credenciais privadas; para proteger segredos, seria necessário um backend/proxy. **A chave RAWG não é necessária para testar a busca via CheapShark nem o catálogo local.**

## 🌐 Publicar no GitHub Pages

1. Envie os arquivos para um repositório público no GitHub.
2. Abra **Settings → Pages**.
3. Em **Build and deployment**, selecione **Deploy from a branch**.
4. Escolha **main** e **/ (root)** e salve.
5. Aguarde a publicação. O endereço será `https://SEU-USUARIO.github.io/NOME-DO-REPOSITORIO/`.

Este projeto está publicado em **https://mateusngz.github.io/qual-jogo-hoje-/**.

## 🗂️ Estrutura do projeto

```text
qual-jogo-hoje-/
├── index.html       # Estrutura da aplicação
├── styles.css       # Estilos e responsividade
├── config.js        # Configuração opcional da RAWG
├── manifest.json    # Metadados da PWA
├── sw.js            # Service worker e cache offline
├── icons/           # Ícones de instalação
└── js/
    ├── api.js       # Busca de jogos, fontes externas e cache
    ├── storage.js   # Persistência e backup JSON
    ├── vibes.js     # Regras de classificação por vibe
    ├── ui.js        # Componentes e páginas
    └── main.js      # Navegação, eventos, sorteio e cronômetro
```

## 🔐 Armazenamento e privacidade

- Os jogos, notas e sessões ficam no **localStorage do navegador**; não são enviados a um banco de dados próprio.
- **Não há contas nem sincronização** entre navegadores ou dispositivos.
- Limpar os dados do site ou usar outro navegador pode deixar a biblioteca vazia. **Exporte um backup JSON regularmente.**
- A **importação substitui** os dados atuais, não faz mesclagem. Faça backup antes de importar.
- O cronômetro pode continuar calculando o tempo enquanto estiver em andamento, mas é necessário **salvar a sessão** para adicioná-la às estatísticas.
- As imagens externas podem não aparecer offline se ainda não estiverem em cache.

## 📌 Sobre o projeto

O objetivo é demonstrar conceitos de desenvolvimento front-end, integração com APIs públicas, manipulação do DOM, armazenamento local, responsividade e Progressive Web Apps (PWA), aplicados a um problema real: **decidir o que jogar sem perder tempo escolhendo**.

### Fontes e créditos

- [RAWG Video Games Database](https://rawg.io/) — dados de jogos, quando configurada.
- [CheapShark](https://www.cheapshark.com/) — pesquisa de jogos de PC.
- [Steam](https://store.steampowered.com/) — capas de jogos disponíveis em sua CDN.

---

**Feito para jogar mais e escolher menos.** ✨
