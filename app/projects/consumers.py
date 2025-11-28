import logging
from datetime import datetime

from channels.generic.websocket import AsyncJsonWebsocketConsumer

logger = logging.getLogger(__name__)


class ProjectConsumer(AsyncJsonWebsocketConsumer):
    project_group_name = None
    project_id = None

    async def connect(self):
        """
        Handle initial WebSocket connection.
        """
        try:
            # Extract parameters from URL route
            self.project_id = self.scope["url_route"]["kwargs"]["project_id"]
            self.project_group_name = f"project_chat_{self.project_id}"

            # Join the Redis group
            await self.channel_layer.group_add(
                self.project_group_name, self.channel_name
            )

            # Accept the WebSocket connection
            # This must be done BEFORE sending any message (send_json)
            # and AFTER configuring the group (to avoid race conditions in receive)
            await self.accept()

            # Now we can send messages
            await self.send_json(
                {
                    "type": "connection_established",
                    "message": f"Connected to project room {self.project_id}",
                }
            )

            logger.info(f"WebSocket connected to project {self.project_id}")

        except KeyError:
            logger.error("Could not extract project_id from URL")
            await self.close()
        except Exception as e:
            logger.error(f"Error in WebSocket connection: {e}")
            await self.close()

    async def disconnect(self, close_code):
        if self.project_group_name:
            await self.channel_layer.group_discard(
                self.project_group_name, self.channel_name
            )

    async def receive_json(self, content, **kwargs):
        # If we don't have a group (failed connection), don't process
        if not self.project_group_name:
            return

        message_type = content.get("type", "chat_message")

        if message_type == "chat_message":
            user = self.scope.get("user")
            username = user.username if user and user.is_authenticated else "Anonymous"

            # Send message to Redis group
            await self.channel_layer.group_send(
                self.project_group_name,
                {
                    "type": "project.message",
                    "sender": username,
                    "text": content.get("text"),
                    "project_id": self.project_id,
                },
            )

    async def project_message(self, event):
        # Send message to WebSocket client
        await self.send_json(
            {
                "type": "chat_message",
                "sender": event["sender"],
                "text": event["text"],
                "timestamp": event.get("timestamp", str(datetime.now())),
            }
        )
