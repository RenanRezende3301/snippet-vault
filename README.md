# Snippet Vault

Snippet Vault e uma aplicacao web feita em JavaScript Vanilla para organizar snippets de codigo, comandos recorrentes e anotacoes tecnicas. O projeto foi pensado para portfolio: pequeno o suficiente para ser entendido rapido, mas completo o bastante para demonstrar boas bases de front-end.

## Visao geral

O app funciona como uma biblioteca pessoal de produtividade para desenvolvedores. Cada snippet pode ser salvo com:

- Titulo
- Linguagem
- Tags
- Descricao
- Codigo
- Marcacao de favorito

Todos os dados ficam persistidos no navegador via `localStorage`, sem backend e sem dependencias externas.

## Funcionalidades

- Cadastro de snippets com formulario validado no cliente
- Busca em tempo real por titulo, linguagem, descricao, tags ou codigo
- Filtro por linguagem
- Filtro de favoritos
- Seeds com exemplos para uso imediato
- Copia rapida para a area de transferencia
- Importacao e exportacao da biblioteca em JSON
- Interface responsiva com identidade visual propria

## Stack

- HTML5
- CSS3
- JavaScript Vanilla
- Node.js para servir os arquivos localmente

## Estrutura

```text
.
├── index.html
├── package.json
├── README.md
├── server.js
└── src
    ├── app.js
    └── styles.css
```

## Como executar

```bash
cd /home/zerobytes/Documentos/ProjetoX
npm start
```

Depois abra:

```text
http://127.0.0.1:4173
```

Se a porta `4173` estiver ocupada:

```bash
PORT=4174 npm start
```

## O que este projeto demonstra

- Manipulacao de DOM sem framework
- Gerenciamento de estado no navegador
- Eventos de formulario e filtros de busca
- Persistencia local com `localStorage`
- Serializacao e restauracao de dados em JSON
- Organizacao de interface responsiva
- Separacao limpa entre markup, estilo e logica

## Verificacao local

Validado localmente com:

- Servidor Node respondendo com `HTTP 200`
- Acesso via porta alternativa para evitar conflito local
- Tratamento explicito para erro de porta ocupada

## Licenca

MIT
