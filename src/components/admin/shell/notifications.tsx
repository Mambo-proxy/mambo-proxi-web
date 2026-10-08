'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Bell,
  Briefcase,
  Calendar,
  CircleAlert,
  FileText,
  Handshake,
  Star,
  UserPlus,
  type LucideIcon,
} from 'lucide-react';
import Link from 'next/link';
import type { Route } from 'next';
import { useEffect, useId, useRef, useState } from 'react';
import { data } from '@/lib/admin/query';
import { browserApi } from '@/lib/api/browser';
import type { Notification } from '@/lib/api/schema';
import { cn } from '@/lib/cn';
import { formatAgo } from '@/lib/format/date';

const ICONS: Record<Notification['kind'], LucideIcon> = {
  REQUEST: FileText,
  APPOINTMENT: Calendar,
  REVIEW: Star,
  APPLICATION: Briefcase,
  PARTNERSHIP: Handshake,
  REGISTRATION: UserPlus,
  SYSTEM: CircleAlert,
};

const notificationsKey = ['notifications'] as const;

/**
 * Cloche de notifications (`85:10369`, panneau non maquetté) : bouton 40 × 40, pastille orange s'il reste des
 * notifications non lues ; panneau déroulant des 30 dernières, « Tout marquer comme lu ».
 */
export function NotificationsButton({ size = 40 }: { size?: 38 | 40 }) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const root = useRef<HTMLDivElement>(null);
  const client = useQueryClient();
  const query = useQuery({
    queryKey: notificationsKey,
    queryFn: () => data(browserApi.GET('/v1/admin/notifications')),
    refetchInterval: 60_000,
  });
  const markRead = useMutation({
    mutationFn: (ids?: string[]) =>
      data(browserApi.PATCH('/v1/admin/notifications/read', { body: ids ? { ids } : {} })),
    onSettled: () => client.invalidateQueries({ queryKey: notificationsKey }),
  });
  const unread = query.data?.unreadCount ?? 0;

  useEffect(() => {
    if (!open) return;
    function onPointer(event: PointerEvent) {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpen(false);
        root.current?.querySelector<HTMLButtonElement>('button')?.focus();
      }
    }
    document.addEventListener('pointerdown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div ref={root} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={unread ? `Notifications (${unread} non lues)` : 'Notifications'}
        style={{ width: size, height: size }}
        className="relative flex items-center justify-center rounded-[10px] border border-border-default bg-neutral-0 text-text-main hover:bg-neutral-50"
      >
        <Bell aria-hidden size={18} />
        {unread > 0 && (
          <span
            aria-hidden
            className="absolute top-[7px] right-[8px] size-2 rounded-full bg-brand-primary ring-2 ring-neutral-0"
          />
        )}
      </button>
      {open && (
        <div
          id={panelId}
          role="region"
          aria-label="Notifications"
          className="absolute top-full right-0 z-40 mt-2 flex max-h-[min(520px,80dvh)] w-[min(380px,calc(100vw-32px))] flex-col overflow-hidden rounded-lg border border-border-default bg-neutral-0 shadow-4"
        >
          <div className="flex items-center justify-between gap-3 border-b border-border-default px-4 py-3">
            <p className="font-ui text-[15px] leading-6 font-semibold text-text-main">Notifications</p>
            {unread > 0 && (
              <button
                type="button"
                onClick={() => markRead.mutate(undefined)}
                className="rounded-xs font-ui text-[13px] leading-5 font-semibold text-text-brand hover:underline"
              >
                Tout marquer comme lu
              </button>
            )}
          </div>
          <ul className="overflow-y-auto">
            {query.data?.data.length === 0 && (
              <li className="px-4 py-8 text-center font-ui text-[14px] leading-5 text-text-muted">
                Aucune notification pour le moment.
              </li>
            )}
            {query.data?.data.map((notification) => {
              const Icon = ICONS[notification.kind];
              const content = (
                <>
                  <span
                    aria-hidden
                    className="flex size-9 shrink-0 items-center justify-center rounded-[10px] bg-neutral-100 text-icon-default"
                  >
                    <Icon size={16} />
                  </span>
                  <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <span
                      className={cn(
                        'font-ui text-[14px] leading-5 text-text-main',
                        !notification.readAt && 'font-semibold',
                      )}
                    >
                      {notification.title}
                    </span>
                    <span className="font-ui text-[12px] leading-4 text-text-muted">
                      {formatAgo(notification.createdAt)}
                    </span>
                  </span>
                  {!notification.readAt && (
                    <span className="mt-1.5 size-2 shrink-0 rounded-full bg-brand-primary">
                      <span className="sr-only">Non lue</span>
                    </span>
                  )}
                </>
              );
              const className =
                'flex items-start gap-3 border-b border-border-default px-4 py-3 last:border-b-0 hover:bg-neutral-50';
              return (
                <li key={notification.id}>
                  {notification.link ? (
                    <Link
                      href={notification.link as Route}
                      className={className}
                      onClick={() => {
                        if (!notification.readAt) markRead.mutate([notification.id]);
                        setOpen(false);
                      }}
                    >
                      {content}
                    </Link>
                  ) : (
                    <div className={className}>{content}</div>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
