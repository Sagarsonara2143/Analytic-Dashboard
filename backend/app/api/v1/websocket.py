import uuid
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query
from app.core.security import decode_token
from app.workers.ws_manager import ws_manager

router = APIRouter(tags=["realtime"])


@router.websocket("/ws/{org_id}")
async def websocket_endpoint(
    org_id: uuid.UUID,
    websocket: WebSocket,
    token: str = Query(...),
):
    payload = decode_token(token)
    if not payload or payload.get("type") != "access":
        await websocket.close(code=4001)
        return

    await ws_manager.connect(org_id, websocket)
    try:
        while True:
            # Keep connection alive; server pushes via ws_manager.broadcast()
            await websocket.receive_text()
    except WebSocketDisconnect:
        ws_manager.disconnect(org_id, websocket)
