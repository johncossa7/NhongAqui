# Google Play Release

This checklist reflects the production app as implemented in September 2026. Recheck the Play Console policy notices before every release.

## Technical status

- App name: `NhongAqui`
- Android application ID: `mz.co.nhongaqui.app`
- Expo account/project: `@jonhcossa7/nhongaqui`
- Build profile: `production` in `mobile/eas.json`
- Output: Android App Bundle (`.aab`)
- Target API: Android 16 / API 36 through Expo SDK 57
- Privacy policy: `https://web-production-d7b9f.up.railway.app/privacidade`
- Account deletion: `https://web-production-d7b9f.up.railway.app/eliminar-conta`

Create a signed release with:

```bash
cd mobile
npx eas-cli build --platform android --profile production
```

Let EAS manage the Android signing key and keep access to the Expo account protected with two-factor authentication.

First production bundle:

- EAS build: `195096d5-7370-4472-b59e-23b79f6619ec`
- App version: `1.0.0` (`versionCode 3`)
- Local file: `mobile/builds/nhongaqui-1.0.0-3.aab`
- SHA-256: `B551775AFEB05051473EC24B3EC2998FE9FDF25EB8ACF5A2C454F34C841D959B`

## Store listing draft

- App name: `NhongAqui`
- Category: `Shopping`
- Short description: `Compre e venda em Moçambique com fotografias, favoritos e conversa direta.`
- Audience: adults aged 18 and over; the service is not designed for children.
- Ads declaration: the current app contains no advertising SDK or paid ads.

Full description:

```text
O NhongAqui é um marketplace para comprar e vender produtos em Moçambique com contacto direto entre compradores e vendedores.

Descubra anúncios por categoria, cidade e preço. Guarde os seus favoritos, veja os detalhes e as fotografias de cada produto e converse com o vendedor dentro da aplicação.

Para vender, crie um anúncio com até oito fotografias, descrição, estado, preço e localização. Depois pode editar o anúncio, acrescentar ou remover fotografias e marcar o produto como reservado ou vendido.

A aplicação inclui notificações internas, gestão dos seus anúncios, avaliações, denúncia de conteúdo e bloqueio de utilizadores. A verificação manual ajuda a identificar vendedores, mas cada utilizador deve confirmar o produto e combinar pagamento e entrega com segurança.

O NhongAqui não recebe pagamentos nem realiza entregas nesta versão. O serviço destina-se a pessoas com 18 anos ou mais.
```

Release notes for version 1.0.0:

```text
Primeira versão do NhongAqui: pesquisa de produtos, favoritos, publicação de anúncios com fotografias, gestão de vendas, mensagens, notificações, avaliações, denúncias e controlo da conta.
```

Required graphics:

- 512 x 512 PNG store icon: `docs/store-assets/play-store-icon.png`.
- 1024 x 500 PNG feature graphic: `docs/store-assets/feature-graphic.png`.
- At least two real Android phone screenshots; include discovery, product details, publishing and messages.

Do not use Expo Go screenshots for the final listing. Capture them from the signed preview or internal-test build.

## App content declarations

- Complete the IARC content-rating questionnaire and declare user-generated listings, photographs, reviews and private messages accurately.
- Declare that users accept Terms before uploading content and that the app supports in-app reporting and user blocking.
- Select 18+ as the target audience, consistently with the Terms and Privacy Policy.
- App access: public browsing needs no login. Reviewers can create an account without an email code; provide a dedicated review account if Play Console requests credentials.
- Account deletion exists inside the app under Profile > Delete account and on the public web page above.

## Data safety working sheet

Use this as a working sheet, then answer according to the exact Play Console wording shown at submission time.

Data collected by the current production service:

- Personal information: name, email address and phone number.
- Approximate address information entered by the user: province, city and neighbourhood. The app does not request GPS location.
- User content: product titles/descriptions, product photographs, profile details, reviews, reports and support requests.
- Messages: buyer/seller chat messages and in-app notifications.
- Account and verification information: account type, verification status, NUIT and identity-document type/number when the user requests manual verification. Document image uploads are currently disabled.
- App activity: favourites, listing views, reservations and sold status.

Current behaviour:

- Data is transmitted over HTTPS and stored by the production API/database and image storage.
- Data is used for account management, marketplace operation, communication, moderation, fraud prevention and support.
- The application has no advertising or analytics SDK and does not sell personal data.
- Users can delete their account and associated stored files in the app. Limited records may only be retained where law, fraud prevention or third-party protection requires it, as described in the Privacy Policy.
- Infrastructure providers processing data on behalf of NhongAqui must be considered when answering Play's collection and sharing definitions.

## Before production access

1. Add the verified developer identity, public support email, phone and address in Play Console.
2. Replace the provisional operator details in the website Terms and Privacy Policy with the legal name, address, NUIT/company registration where applicable, and public support contact.
3. Upload `mobile/builds/nhongaqui-1.0.0-3.aab` to Internal testing and run the complete smoke-test checklist on a real Android device.
4. If the developer account is a personal account created after 13 November 2023, run a Closed test with at least 12 opted-in testers continuously for 14 days before applying for production access.
5. Fill in Privacy policy, Data safety, Ads, App access, Target audience and content, Content rating, Account deletion and any current Play Console declarations.
6. Confirm PostgreSQL and media-volume backups, external uptime alerts and a successful restore drill.
7. Have the legal pages reviewed by a qualified Mozambican professional before broad commercial launch.
