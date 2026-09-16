# Security

Security rules for the MVP:

- Secrets live only in environment variables.
- Django uses a custom user model from the beginning.
- JWT auth is required for all write actions.
- Object-level permissions protect products, conversations, reports and verification requests.
- CORS is configurable and must be restrictive in production.
- Verification documents are never returned in public serializers.
- Verification uploads start behind `VERIFICATION_UPLOADS_ENABLED`.
- Product uploads enforce image count limits and validation at API level.
- AI moderation is advisory only; it must not ban users automatically.

Before public launch:

- Add production rate limiting at the gateway or app layer.
- Configure private Azure Blob containers for identity documents.
- Review legal text with counsel.
- Add monitoring and security alerting.
