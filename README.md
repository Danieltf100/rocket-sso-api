# Rocket SSO API

## Este é um simples projeto de uma API SSO

## Primeiros Passos

- Pré requisitos
    - NodeJS
    - MongoDB

- Para rodar:
    - ```npm install```
    - ```mongod```
    - ```node server.js```

## Rota de Exploração

_Interaja entre as abas para experimentar a aplicação._
- http://localhost/explorer

## Rotas para consumo da API

- Iniciar sessão
>
     `POST http://localhost/api/sessions`

- Recuperar todas as sessões ativas do usuário da sessão
>
     `GET http://localhost/api/sessions`

- Encerrar sessão
>
     `DELETE http://localhost/api/sessions`

- Criar um usuário
>
     `POST http://localhost/api/users`

- Excluir um usuário
>
     `DELETE http://localhost/api/users`

- Recuperar informações de um usuário
>
     `GET http://localhost/api/users/{id_do_usuario}`

## Acessos de desenvolvedores

- Liste todas as informações salvas de todos os usuarios com o token da API gerado ao inicializar localizado em no diretorio `./api/security/static/env.json`

> _Somente para solicitações em localhost ('::1')_


     `GET http://localhost/api/{token_da_api}/users/data`