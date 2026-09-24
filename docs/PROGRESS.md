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
- Mobile preparado para Android/Google Play com Expo SDK 57, target API 36, EAS Build e bundle AAB.
- Primeiro AAB de producao assinado concluido no EAS (`1.0.0`, `versionCode 3`) e guardado em `mobile/builds/nhongaqui-1.0.0-3.aab`.
- Icone 512 x 512 e feature graphic 1024 x 500 preparados em `docs/store-assets`.
- Fluxos mobile de anuncios, edicao de fotografias, favoritos, mensagens, notificacoes, verificacao manual e gestao da conta concluidos.
- Demo local iniciada com backend em `http://127.0.0.1:8000`, web em `http://127.0.0.1:5173` e Expo em `exp://192.168.1.169:8081`.
- Dados demo criados com `seed_demo`: categorias, vendedores, comprador e 20 produtos.
- GitHub Actions criadas para backend, web e mobile.

## Em desenvolvimento

- Testes internos da app em dispositivos Android reais.
- Teste do AAB assinado num dispositivo Android real ou em teste interno da Play Store.

## Por fazer

- Google OAuth ativo.
- Pagamentos, M-Pesa, e-Mola e compras in-app.
- IA real para moderacao de imagens.
- Resolver vulnerabilidades transitivas reportadas por `npm audit` no mobile quando Expo disponibilizar atualizacoes compativeis sem breaking changes.
- Push notifications e WebSockets.
- Criar a ficha da Play Store, preencher Data safety e concluir o teste interno.

## Decisoes importantes

- Uploads de documentos de verificacao comecam desativados por `VERIFICATION_UPLOADS_ENABLED=false`, porque envolvem dados pessoais sensiveis.
- Moderacao por IA e uma abstracao (`ImageModerationService`) com implementacao mock nesta fase.
- As paginas legais estao publicadas, mas exigem revisao juridica profissional antes de um lancamento amplo.
- Web, API, PostgreSQL e volume de imagens estao no projeto Railway `NhongAqui website`.
- Notificacoes mobile sao internas; push em segundo plano fica para uma fase posterior.
