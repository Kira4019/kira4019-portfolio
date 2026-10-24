# Portfólio do Publico 

Site de portfólio estático com painel de edição, pronto para rodar no seu computador
ou publicar em hosts mais conhecidas, ex: hostinger netlify etc...

O visual foi mantido no tema escuro/claro original, com o conteúdo adaptado para
**kira4019 — Programador · Bots Discord · Engenharia Militar**. O site tem
animações suaves, cartões com inclinação 3D, botões magnéticos, brilho que segue
o cursor e um mini player de música.

---

## 1. Rodar no seu computador (mais fácil)

### Windows

1. Extraia o `.zip`.
2. Dê dois cliques em **`start.bat`**.
3. O navegador abre em **http://localhost:8000**.

O script tenta usar **PHP** (para o painel funcionar) e, se não encontrar,
usa **Python** para apenas visualizar o site.

### Linux / macOS

```bash
cd kira4019-portfolio
chmod +x start.sh
./start.sh
```

Depois abra **http://localhost:8000**.

> Também funciona abrindo o `index.html` direto, mas o navegador pode bloquear
> o carregamento do `data/site.json`. Nesse caso o site usa uma cópia local
> (`data/site.fallback.js`). Para ver sempre o conteúdo atualizado, use o
> `start.bat` / `start.sh`.

---

## 2. Painel de edição

Acesse **http://localhost:8000/admin** (precisa de PHP 8.1+ rodando).

> O arquivo `config/admin.php` é local e **não** vai para o GitHub. Copie
> `config/admin.example.php` para `config/admin.php` e defina sua senha.
> No pacote ZIP original, o comentário dentro de `config/admin.php` lembra
> a senha padrão; troque-a antes de publicar.

### Gerar uma nova senha

No terminal, com PHP instalado:

```bash
php -r "echo password_hash('SUA_SENHA_AQUI', PASSWORD_DEFAULT);"
```

Copie o resultado (começa com `$2y$`) e cole em `config/admin.php`:

```php
'password_hash' => '$2y$10$...',
```

### O que dá para editar pelo painel

- Título, descrição e cor do navegador
- Nome, apelido, usuário, foto, função, foco e status
- Texto do topo (hero), imagem principal e faixa de tecnologias
- Números, seção “Sobre”, tags e barras de habilidade
- Projetos/servidores, projetos internos, vídeos e listas
- Contato, e-mail, Discord, GitHub e rodapé
- Upload de imagens (PNG, JPG, WEBP ou GIF, até 3 MB)

Depois de salvar, recarregue o site com **Ctrl+F5**.

> O campo **“Próximas áreas em mira”** (`next`) e as datas nas barras de
> habilidade ficam em `data/site.json`. O painel preserva esses dados, mas não
> os mostra como campos separados. Se quiser mudá-los, edite o JSON.

---

## 3. Editar direto no JSON

Todo o conteúdo fica em **`data/site.json`**. É um arquivo de texto simples.
Depois de editar, rode o site pelo `start.bat` / `start.sh` e recarregue.

Se você editar o JSON e quiser que a prévia sem servidor também atualize,
rode na pasta do projeto:

```bash
node -e "const fs=require('fs');const d=JSON.parse(fs.readFileSync('data/site.json','utf8'));fs.writeFileSync('data/site.fallback.js','window.SITE_DATA = '+JSON.stringify(d,null,2)+';\n')"
```

---

## 4. Personalizar contatos

Os contatos atuais ficam em `data/site.json` ou no painel:

| Campo | Valor atual |
|---|---|
| E-mail | `kiraa4019@gmail.com` |
| Discord | `kira4019` |
| GitHub | `https://github.com/kira4019` |
| Assinatura | `kira4019` |

Se ainda não tiver GitHub, deixe o link como `#` ou aponte para o seu perfil real.

---

## 5. Publicar na Hostinger

1. No **hPanel**, abra **Avançado → Versão do PHP** e escolha **8.1 ou superior**.
2. Em **Arquivos → Gerenciador de arquivos**, entre em `public_html`.
3. Envie **o conteúdo** desta pasta (os arquivos e pastas, não a pasta em si).
   Dica: compacte em `.zip`, envie e use **Extrair**.
4. Dê permissão de escrita para `data/` e `assets/` (normalmente `755`).
5. Ative o **SSL** em **Segurança → SSL**.
6. Acesse `seudominio.com/admin` e entre com a senha.

Antes de publicar, troque a senha padrão do painel.

---

## 6. Música de fundo

O site abre com um mini player no canto inferior direito tocando
**“worry (slowed)” — lonown** a partir do MP3 local
`assets/music/worry-slowed.mp3`, que já vem incluído neste pacote.
O player também tem links para Spotify e YouTube.

- O navegador **bloqueia autoplay com som** até o usuário interagir.
  O player tenta tocar sozinho e, se for bloqueado, mostra
  **“Toque para ouvir”**. A música começa no primeiro clique, toque
  ou tecla — e também tentamos ao rolar a página.
- Atalho: **M** liga/desliga a música (fora de campos de texto).
- O volume fica salvo no navegador. O player também tem link para
  Spotify e YouTube.
- Se o MP3 não carregar, o site tenta o player oficial do YouTube.
  Se o YouTube também estiver bloqueado/offline, o cartão mostra
  **“Ouvir no Spotify”** e o botão de play abre a música no Spotify.

### Configurar

Tudo fica no bloco `music` de `data/site.json`:

```json
"music": {
  "enabled": true,
  "title": "worry (slowed)",
  "artist": "lonown",
  "youtube": "lCKU-tI-upI",
  "youtubeFallback": "jmgfu9mk7mg",
  "spotify": "https://open.spotify.com/track/5zE2NfNO04DYlvdUrp4tQk",
  "local": "assets/music/worry-slowed.mp3",
  "volume": 45,
  "startAt": 0
}
```

- **Desativar:** `"enabled": false`.
- **Usar o YouTube em vez do MP3:** deixe `"local": ""`.
- **Trocar de música:** substitua o arquivo em `assets/music/` ou
  use outro ID do YouTube em `youtube`.
- **Reserva:** se o vídeo principal não estiver disponível, o site tenta
  `youtubeFallback` (o original) automaticamente.
- **Volume inicial:** `volume` de `0` a `100`.
- **Começar em outro ponto:** `startAt` em segundos.

### Substituir o MP3

Você pode trocar o áudio mantendo o mesmo nome
(`assets/music/worry-slowed.mp3`) ou apontar outro caminho:

```json
"local": "assets/music/outro-arquivo.mp3"
```

Com `local` preenchido, o site toca o MP3 em loop e não usa o YouTube.
Isso também funciona sem internet. Use apenas áudios que você tenha
direito de usar.

> O painel `/admin` não tem campos para a música: edite direto no
> `data/site.json` (o painel preserva o bloco ao salvar).

Links oficiais:

- YouTube (ultra slowed): https://www.youtube.com/watch?v=lCKU-tI-upI
- YouTube (original): https://www.youtube.com/watch?v=jmgfu9mk7mg
- Spotify: https://open.spotify.com/track/5zE2NfNO04DYlvdUrp4tQk

### Créditos

**“worry (slowed)” — lonown.** Todos os direitos pertencem ao artista e aos
detentores da obra. O MP3 local é usado apenas como trilha de fundo deste
portfólio. Se o arquivo for removido, o player continua funcionando com os
links oficiais do YouTube e do Spotify.

Consulte também [`CREDITS.md`](CREDITS.md).

---

## Estrutura

```
index.html              página principal
styles.css              visual e temas
script.js               carrega o conteúdo e controla as animações
data/site.json          TODO o conteúdo editável
data/site.fallback.js   cópia para abrir o index.html sem servidor
assets/                 foto/logo, favicon, avatar, hero, bot, winmc e banner
assets/music/           MP3 de fundo incluído no player
admin/                  painel de edição
api/                    backend PHP (login, salvar, upload)
config/admin.php        hash da senha do painel (local, não versionado)
config/admin.example.php modelo para criar o config/admin.php
404.html                página de erro
start.bat               inicia o servidor no Windows
start.sh                inicia o servidor no Linux/macOS
```

Backups: a cada salvamento pelo painel, a versão anterior fica em
`data/site.backup.json`.

---

## Solução de problemas

| Sintoma | O que fazer |
|---|---|
| O `start.bat` fecha na hora | Instale Python (https://python.org) ou PHP 8.1+. |
| Site sem conteúdo | Use `start.bat`; abrir `index.html` direto pode bloquear o JSON. |
| “Senha do painel ainda não configurada” | Confira `config/admin.php`. |
| “Senha incorreta” | Confira a senha definida em `config/admin.php` e gere um novo hash se necessário. |
| Imagem não aparece | Confira o caminho no JSON/painel; use o upload do painel. |
| Alteração não aparece | Recarregue com `Ctrl+F5` para limpar o cache. |
| Música não toca sozinha | O navegador bloqueia autoplay com som. Clique/toque na página ou use **M**. |
| Player de música indisponível | YouTube bloqueado/offline; use os links de Spotify/YouTube ou um MP3 local (`music.local`). |
| Painel não abre | O painel precisa de PHP; o `start.bat` usa Python quando não há PHP e serve apenas o site. |
