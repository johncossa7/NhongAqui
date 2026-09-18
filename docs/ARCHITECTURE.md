# Architecture

NhongAqui uses a single backend API shared by web and mobile clients.

```text
React/Vite Web   ->  Django REST API  <-  Expo Mobile
                           |
                      PostgreSQL
                           |
                Railway media volume
```

## Backend

Django is split into domain apps:

- `accounts`
- `categories`
- `products`
- `favorites`
- `messaging`
- `reviews`
- `reports`
- `verification`
- `notifications`
- `payments`
- `marketplace`

Object permissions are enforced server-side. Frontend checks are treated only as UX helpers.

## Clients

The web app and Expo app use the same `/api/v1/` endpoints and the same auth model. Public product/category reads are available to visitors; write flows require JWT authentication.

## Storage

Development uses local files. Production product images use the persistent Railway volume. Identity-document uploads remain disabled; if enabled later, they require private object storage instead of the public media volume.
