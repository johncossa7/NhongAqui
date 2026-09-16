# Mobile

The mobile app is built with Expo, Expo Router and TypeScript. It consumes the same Django API as the website.

## Development

```bash
cd mobile
npm install
npm run start
```

Set `EXPO_PUBLIC_API_URL` for physical devices. For Android emulators, `http://10.0.2.2:8000/api/v1` may be required.

## Auth

Access and refresh tokens are stored with Expo SecureStore. The app refreshes sessions through the backend JWT refresh endpoint.

## Images

Product publishing supports selecting images from the gallery. Camera capture, reordering and primary image selection are structured in the UI and can be extended without changing the API contract.
