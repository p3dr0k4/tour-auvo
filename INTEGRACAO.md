# Tour Auvo: como usar dentro do sistema e no site

URL de produção: https://tour-auvo.vercel.app

## O que a pessoa vê

1. **Abertura**: promessa em uma frase ("Do chamado à cobrança. Num só sistema."), o app se mexendo ao fundo, notificações da história e números publicados em auvo.com.
2. **Personalização em 3 toques** (operação, tamanho da equipe, maior desafio). O capítulo do desafio escolhido vem marcado, o PMOC só aparece para climatização e a recomendação final usa as respostas. Dá para pular.
3. **Tour guiado** (cerca de 2 min 45 s): uma história só, de quinta 16:10 a sexta 18:00, em 8 capítulos. Cada capítulo abre com um cartão (hora + promessa) e o sistema é clicado de verdade.
4. **Final**: o fio completo do chamado ao Pix, recomendação para a operação da pessoa, "Agendar apresentação gratuita", WhatsApp com mensagem pronta, compartilhar e "E tem mais".
5. **Explorar**: modo livre com missões, pontos e o Guia (igual antes).

## Links diretos

| Link | O que abre |
| --- | --- |
| `/` | Abertura com "Começar o tour" (passa pela personalização) e "Explorar por conta própria" |
| `/#tour` | Tour guiado do início, sem a personalização |
| `/#explorar` | Modo explorar (missões) |
| `/#chamado` `#ticket` `#agenda` `#campo` `#assinatura` `#cobranca` `#pmoc` `#resultados` | Tour guiado começando naquele capítulo |
| `/?apresentar=1#tour` | Modo apresentação (abaixo) |

Links antigos continuam funcionando: `#os` → assinatura, `#desk` → ticket, `#financeiro` → cobrança, `#relatorios` → resultados, `#mapa` → em campo, `#hub` → chamado, `#cadastros` → agenda.

O endereço acompanha o capítulo atual, então quem copia o link da barra compartilha o ponto exato.

## Modo apresentação (para o comercial)

`https://tour-auvo.vercel.app/?apresentar=1#tour`

- cada capítulo termina e espera: o botão → pulsa e o apresentador avança quando quiser (seta → do teclado ou clique);
- sem personalização, sem pontos, sem Guia e sem o selo "Dados fictícios" na barra;
- Espaço pausa e retoma, ← volta um capítulo.

## Controles do tour guiado

- **Pausar/continuar**: botão central da barra, Espaço, ou o botão grande no meio da tela quando pausado. O tour também pausa sozinho se a aba ficar escondida e retoma ao voltar.
- **Capítulos**: setas ← →, os botões da barra ou clicando no nome do capítulo. O tempo restante aparece à direita.
- **Narração**: alto-falante da barra ou tecla M. Na personalização também dá para escolher "Com narração" ou "Sem narração".
- **Assumir o controle**: sai do tour e continua no modo explorar na mesma tela.

## Narração

- Ligada por padrão no tour guiado (desligada no modo apresentação). A escolha da pessoa fica salva no navegador.
- Os navegadores só tocam som depois de um clique. Quem entra pelo botão "Começar o tour" já ouve desde o início. Quem abre um link direto (`#tour`, `#assinatura`…) vê o tour com legenda completa e o alto-falante com a etiqueta "Ouvir narração"; um clique ativa.
- Com narração, a legenda mostra só o título (a frase de apoio vira fala) e cada capítulo espera a fala terminar. Sem som, a legenda completa volta.
- Voz: enquanto a locução final não existir, usa a voz do navegador (no Edge, vozes neurais; no Chrome, as vozes do sistema). A locução final entra colocando os MP3 em `audio/` e listando no `audio/manifest.json` (guia completo em `NARRACAO.md`).
- Tour narrado com a voz de teste: cerca de 3 min 20 s.

## Modo embutido (iframe)

Adicione `?embed=1` para esconder o cabeçalho da página:

```html
<iframe src="https://tour-auvo.vercel.app/?embed=1#tour"
        title="Tour interativo do Auvo" loading="lazy"
        style="width:100%;aspect-ratio:16/10;border:0" allowfullscreen></iframe>
```

O palco é 16:9 e encolhe para caber. Para boa leitura, reserve pelo menos 900 px de largura; abaixo de 900 px o tour usa o layout de celular.

## Eventos para o site ou sistema hospedeiro

Dentro de um iframe, o tour envia `postMessage` ao pai (e os mesmos eventos vão para o Vercel Analytics):

```js
window.addEventListener('message', e => {
  if (e.data?.source !== 'auvo-tour') return;
  // e.data.name / e.data.data
});
```

| Evento | Dados | Quando |
| --- | --- | --- |
| `quiz_open`, `quiz`, `quiz_skip`, `quiz_done` | `{ step, value }` / `{ area, team, pain }` | personalização |
| `mode` | `{ mode }` | troca entre tour guiado e explorar |
| `chapter` | `{ chapter, index }` | início de cada capítulo |
| `pause`, `resume` | `{ chapter }` | pausa manual |
| `narration` | `{ on, from }` | liga/desliga a narração (barra, teclado ou personalização) |
| `take_control` | `{ chapter }` | "Assumir o controle" |
| `tour_complete` | `{ chapters }` | fim do tour guiado |
| `finish` | `{ explored, area, pain }` | tela final aberta |
| `cta_demo` | `{ from, area, pain }` | clique em "Agendar apresentação" (topo ou final) |
| `cta_whatsapp` | `{ from, area, pain }` | clique em "Falar no WhatsApp" |
| `final_pain`, `final_more`, `share` | | interações na tela final |
| `mission`, `mission_skip`, `signed` | | modo explorar |

## Atribuição de leads

Os botões de apresentação levam para `https://www.auvo.com/demonstracao-gratis` com `utm_source=tour-auvo`, `utm_medium=tour-interativo`, `utm_campaign=tour-auvo` e `utm_content=<operação escolhida>` (ou `geral`). O WhatsApp abre com uma mensagem pronta que já diz a operação, o tamanho da equipe e o desafio escolhidos. Número e URL ficam em `data.js` (`SALES`).

## Medição na Vercel

O HTML já carrega o script de Web Analytics. Falta ligar no painel do projeto `tour-auvo` (aba Analytics, Enable). Page views funcionam em qualquer plano; eventos personalizados dependem de plano que os inclua.

## Onde mexer

| Arquivo | Conteúdo |
| --- | --- |
| `index.html` | estrutura da página |
| `tour.css` | visual do tour (abertura, cartões, legenda, final, barras, jogo) |
| `app.css` | visual do sistema simulado |
| `data.js` | cenário fictício, listas, menus e dados comerciais (`SALES`) |
| `experience.js` | personalização, cartões de capítulo, legenda, notificações e final |
| `narration.js` | textos da narração, voz do navegador (protótipo) e locução gravada (`audio/`) |
| `tour.js` | roteiro dos capítulos, barra do tour, pausa, teclado e links diretos |
| `app.js` / `hub.js` | telas do Auvo, AuvoDesk e AuvoHub |
| `game.js` | missões, pontos e Guia do modo explorar |

## Deploy

```bash
cd "C:\Users\pdroh\Downloads\Tour Auvo Completo - fonte"
npx vercel deploy --prod --yes
```
