import { useQuery } from "@tanstack/react-query";

import { apiRequest } from "../api/client";
import { useAuth } from "../lib/auth";

export function useUnreadCounts() {
  const { isAuthenticated } = useAuth();
  const messages = useQuery({
    queryKey: ["unread-messages"],
    queryFn: () => apiRequest<{ count: number }>("/conversations/unread-count/"),
    enabled: isAuthenticated,
    refetchInterval: 30000
  });
  const notifications = useQuery({
    queryKey: ["notification-summary"],
    queryFn: () => apiRequest<{ unread_count: number }>("/notifications/summary/"),
    enabled: isAuthenticated,
    refetchInterval: 30000
  });

  return {
    messages: messages.data?.count ?? 0,
    notifications: notifications.data?.unread_count ?? 0,
    total: (messages.data?.count ?? 0) + (notifications.data?.unread_count ?? 0)
  };
}
