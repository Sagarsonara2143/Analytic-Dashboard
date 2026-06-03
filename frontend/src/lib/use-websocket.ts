"use client";
import { useEffect, useRef, useCallback } from "react";
import { useAuthStore } from "@/store/auth-store";

type MessageHandler = (data: unknown) => void;

export function useOrgWebSocket(orgId: string, onMessage: MessageHandler) {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeout = useRef<ReturnType<typeof setTimeout>>();
  const token = useAuthStore((s) => s.accessToken);

  const connect = useCallback(() => {
    if (!token || !orgId) return;
    // WS connects directly to backend (bypasses Next.js rewrite)
    const wsBase = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8004";
    const url = `${wsBase}/api/v1/ws/${orgId}?token=${token}`;
    const ws = new WebSocket(url);

    ws.onmessage = (e) => {
      try { onMessage(JSON.parse(e.data)); } catch { /* ignore */ }
    };

    ws.onclose = () => {
      reconnectTimeout.current = setTimeout(connect, 3000);
    };

    wsRef.current = ws;
  }, [orgId, token, onMessage]);

  useEffect(() => {
    connect();
    return () => {
      clearTimeout(reconnectTimeout.current);
      wsRef.current?.close();
    };
  }, [connect]);
}
