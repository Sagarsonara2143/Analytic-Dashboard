import uuid
from fastapi import WebSocket
from collections import defaultdict


class ConnectionManager:
    def __init__(self):
        self._connections: dict[str, list[WebSocket]] = defaultdict(list)

    async def connect(self, org_id: uuid.UUID, ws: WebSocket):
        await ws.accept()
        self._connections[str(org_id)].append(ws)

    def disconnect(self, org_id: uuid.UUID, ws: WebSocket):
        key = str(org_id)
        try:
            self._connections[key].remove(ws)
        except ValueError:
            pass

    async def broadcast(self, org_id: uuid.UUID, message: dict):
        key = str(org_id)
        dead = []
        for ws in self._connections[key]:
            try:
                await ws.send_json(message)
            except Exception:
                dead.append(ws)
        for ws in dead:
            self._connections[key].remove(ws)


ws_manager = ConnectionManager()
