---
name: Notification delivery safety
description: Reliability and privacy rules for appointment-request alert delivery.
---

Appointment-request alerts must be created transactionally with the request, keep content generic, and use the persistent outbox as the delivery authority.

**Why:** A post-commit queue write can silently lose alerts, while retrying an unabortable provider timeout can create a duplicate SMS. Notification messages must also avoid patient details outside the authenticated portal.

**How to apply:** Add any new alert work to the request transaction and retain one unique delivery record per request, recipient, and channel. Treat provider timeouts as an `unknown` outcome for manual reconciliation unless the transport can prove cancellation or supports idempotency. Do not place patient details in notification bodies or operational logs.