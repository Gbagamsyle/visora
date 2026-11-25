"use client";

import { useState } from "react";
import { Bell, BookOpen, CheckCheck, MessageCircle, Target } from "lucide-react";
import AppShell from "../../components/AppShell";

export default function NotificationsPage() {
  const [read, setRead] = useState(false);
  const notifications = [
    { title: "New learning material", message: "Clinical Optics · Prism adaptation notes were added", time: "12 min ago", icon: BookOpen, unread: true },
    { title: "Practice reminder", message: "The Visual Optics timed test opens tomorrow at 10:30 AM", time: "1 hr ago", icon: Target, unread: true },
    { title: "Community reply", message: "Amara replied to your discussion about visual acuity", time: "Yesterday", icon: MessageCircle, unread: false },
  ];

  return (
    <AppShell active="notifications">
      <header className="premium-page-header">
        <div><p className="premium-eyebrow">UPDATES FOR YOU</p><h1>Notifications</h1><p>Stay on top of learning updates and conversations.</p></div>
        <button className="button button-secondary premium-header-action" type="button" onClick={() => setRead(true)}><CheckCheck size={16} /> Mark all as read</button>
      </header>

      <section className="notification-panel">
        <div className="notification-panel-heading"><div><span><Bell size={16} /></span><h2>Recent</h2></div><strong>{read ? "0" : "2"} unread</strong></div>
        <div className="notification-list">
          {notifications.map(({ title, message, time, icon: Icon, unread }) => (
            <article className={unread && !read ? "unread" : ""} key={title}>
              <span className="notification-list-icon"><Icon size={18} /></span>
              <div><strong>{title}</strong><p>{message}</p></div>
              <time>{time}</time>
              {unread && !read ? <i aria-label="Unread" /> : null}
            </article>
          ))}
        </div>
      </section>
    </AppShell>
  );
}
