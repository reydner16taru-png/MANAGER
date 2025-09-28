import React, { useEffect } from 'react';
import type { Notification } from '../types';

interface NotificationContainerProps {
  notifications: Notification[];
  onRemove: (id: string) => void;
}

const NOTIFICATION_TIMEOUT = 5000;

const ICONS = {
    success: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    error: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    info: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
};

const COLORS = {
    success: 'text-green-500',
    error: 'text-red-500',
    info: 'text-blue-500',
};

const NotificationToast: React.FC<{ notification: Notification; onRemove: (id: string) => void; }> = ({ notification, onRemove }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onRemove(notification.id);
        }, NOTIFICATION_TIMEOUT);

        return () => clearTimeout(timer);
    }, [notification.id, onRemove]);

    return (
        <div className={`notification-toast-enter w-full max-w-sm p-4 rounded-lg shadow-lg border flex items-start gap-4 bg-[var(--color-bg-secondary)] border-[var(--color-border-primary)]`}>
            <div className={`flex-shrink-0 ${COLORS[notification.type]}`}>{ICONS[notification.type]}</div>
            <div className="flex-grow text-sm font-medium text-[var(--color-text-primary)]">{notification.message}</div>
            <button onClick={() => onRemove(notification.id)} className="flex-shrink-0 -mt-1 -mr-1 p-1 rounded-full text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-tertiary)]">&times;</button>
        </div>
    );
};


const NotificationContainer: React.FC<NotificationContainerProps> = ({ notifications, onRemove }) => {
  return (
    <>
      <div aria-live="assertive" className="fixed inset-0 flex items-end px-4 py-6 pointer-events-none sm:p-6 sm:items-start z-[100]">
        <div className="w-full flex flex-col items-center space-y-4 sm:items-end">
            {notifications.map((notification) => (
                <NotificationToast key={notification.id} notification={notification} onRemove={onRemove} />
            ))}
        </div>
      </div>
      <style>{`
        @keyframes toast-in-right {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .notification-toast-enter {
          animation: toast-in-right 0.5s cubic-bezier(0.21, 1.02, 0.73, 1) forwards;
        }
      `}</style>
    </>
  );
};

export default NotificationContainer;