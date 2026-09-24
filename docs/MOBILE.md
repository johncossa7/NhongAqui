# Mobile

The mobile app uses Expo SDK 57, Expo Router and TypeScript. It consumes the production Django API used by the website.

The EAS project is linked as `@jonhcossa7/nhongaqui`. See `docs/PLAY_STORE.md` for the final release and Play Console declarations.

## Development

```bash
cd mobile
npm install
npm run start
```

Create `mobile/.env` for a local or physical-device test:

```env
EXPO_PUBLIC_API_URL=http://10.0.2.2:8000/api/v1
EXPO_PUBLIC_WEB_URL=http://10.0.2.2:5173
```

Use the computer LAN address instead of `10.0.2.2` on a physical device.

## Implemented Flows

- JWT login, registration, secure token storage and automatic refresh.
- Product discovery, filters, favorites, seller profiles and image galleries.
- Publishing and editing listings with one to eight photos.
- Seller listing management, reservation, sale and deletion.
- Conversations, unread counters and in-app notifications.
- Reports, reviews, user blocking and manual account verification.
- Profile editing, password changes and in-app account deletion.
- Terms, privacy and prohibited-listing links to the public website.

Email verification and password recovery are deliberately hidden while transactional email is disabled. Private identity-document uploads are also disabled.

## Android Release

The Android package is `mz.co.nhongaqui.app`. Production EAS builds use the Railway API and generate an Android App Bundle:

```bash
cd mobile
npm run typecheck
npm run doctor
npm run export:android
npx eas-cli login
npx eas-cli build:configure
npx eas-cli build --platform android --profile production
```

The first EAS configuration command links the local project to the owner's Expo account and adds the generated `extra.eas.projectId` to `app.json`. Do not commit Play service-account keys.

Before Play Console submission:

1. Complete the store listing, screenshots, feature graphic and support contact using `docs/PLAY_STORE.md`.
2. Complete Data safety using the actual production data flows.
3. Declare the privacy policy URL and account deletion URL: `https://web-production-d7b9f.up.railway.app/eliminar-conta`.
4. Complete content rating, ads, target audience and app access declarations.
5. Upload the AAB to internal testing and test installation, login, image upload, chat and account deletion on a real Android device.
6. Replace the Railway URLs with the permanent domain before the public release if the domain is ready.

Push notifications are not included yet. Notifications are available inside the app and refresh while it is open.
