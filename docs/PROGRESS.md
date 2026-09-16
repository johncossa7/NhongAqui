# Progress

## Concluido

- Diretorio inicial analisado: `C:\Users\jonhc\Downloads\NhongAqui` estava vazio.
- Identificado que o repositorio Git ativo esta acima da pasta de trabalho, em `C:\Users\jonhc`; as alteracoes ficam confinadas a `Downloads\NhongAqui`.
- Estrutura de monorepo iniciada com `backend`, `web`, `mobile`, `docs`, `docker` e CI.
- Decisao arquitetural: Django REST API como backend unico; React/Vite e Expo consomem a mesma API.
- Decisao arquitetural: PostgreSQL e a base principal; SQLite fica apenas para testes automatizados leves com flag explicita.
- Backend validado localmente com `ruff check .` e `pytest`.
- Website validado com `npm run lint` e `npm run build`.
- Mobile Expo validado com `npm run typecheck`.
- Demo local iniciada com backend em `http://127.0.0.1:8000`, web em `http://127.0.0.1:5173` e Expo em `exp://192.168.1.169:8081`.
- Dados demo criados com `seed_demo`: categorias, vendedores, comprador e 20 produtos.
- GitHub Actions criadas para backend, web e mobile.

## Em desenvolvimento

- Validacao Docker/PostgreSQL end-to-end.
- Refinamento visual e funcional dos fluxos web/mobile apos teste manual.

## Por fazer

- Deploy real em Azure.
- Credenciais reais de Azure Blob Storage.
- Google OAuth ativo.
- Pagamentos, M-Pesa, e-Mola e compras in-app.
- IA real para moderacao de imagens.
- Resolver vulnerabilidades transitivas reportadas por `npm audit` no mobile quando Expo disponibilizar atualizacoes compativeis sem breaking changes.
- Testar Docker quando Docker Desktop estiver instalado nesta maquina.
- Push notifications e WebSockets.

## Decisoes importantes

- Uploads de documentos de verificacao comecam desativados por `VERIFICATION_UPLOADS_ENABLED=false`, porque envolvem dados pessoais sensiveis.
- Moderacao por IA e uma abstracao (`ImageModerationService`) com implementacao mock nesta fase.
- As paginas legais sao provisorias e exigem revisao juridica antes do lancamento.
- Nesta maquina, Docker nao esta disponivel no PATH; a demo atual usa SQLite explicitamente via `DJANGO_TEST_SQLITE=true`.
- Expo precisou de `NODE_TLS_REJECT_UNAUTHORIZED=0` apenas nesta sessao local devido ao problema de certificado TLS do ambiente.
