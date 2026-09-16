from dataclasses import dataclass


@dataclass(frozen=True)
class ModerationResult:
    status: str
    reason: str = ""


class ImageModerationService:
    def moderate(self, image) -> ModerationResult:
        raise NotImplementedError


class MockImageModerationService(ImageModerationService):
    def moderate(self, image) -> ModerationResult:
        return ModerationResult(status="approved")
