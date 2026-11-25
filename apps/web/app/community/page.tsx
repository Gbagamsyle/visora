"use client";

import { useState } from "react";
import { ArrowUpRight, Bookmark, Heart, MessageCircle, MoreHorizontal, Plus, Search, UsersRound } from "lucide-react";
import AppShell from "../../components/AppShell";

export default function CommunityPage() {
  const [filter, setFilter] = useState("Latest");
  const posts = [
    { author: "Amara Eze", initials: "AE", course: "Clinical Optics", time: "18 min ago", title: "How are you approaching prism adaptation practice?", body: "I’m working through the worked examples and would love to compare approaches before the quiz.", replies: 12, likes: 28 },
    { author: "Tobi Adeyemi", initials: "TA", course: "Visual Optics", time: "1 hr ago", title: "Useful revision note on reduced eyes", body: "A quick summary I made while reviewing schematic and reduced eye calculations.", replies: 8, likes: 19 },
  ];

  return (
    <AppShell active="Community">
      <header className="premium-page-header"><div><p className="premium-eyebrow">UNIVERSITY COMMUNITY</p><h1>Community</h1><p>Learn with your classmates and share thoughtful ideas.</p></div><button className="button button-primary premium-header-action"><Plus size={16} /> Create post</button></header>

      <div className="community-layout">
        <main>
          <div className="community-toolbar"><label><Search size={16} /><input placeholder="Search discussions" aria-label="Search discussions" /></label><div>{["Latest","Popular","Following"].map((item) => <button key={item} type="button" className={filter === item ? "active" : ""} onClick={() => setFilter(item)}>{item}</button>)}</div></div>
          <section className="community-feed">
            {posts.map((post) => <article className="community-post-card" key={post.title}><header><span className="community-avatar">{post.initials}</span><div><strong>{post.author}</strong><span>{post.course} · {post.time}</span></div><button type="button" aria-label="Post options"><MoreHorizontal size={18} /></button></header><h2>{post.title}</h2><p>{post.body}</p><footer><button type="button"><Heart size={16} /> {post.likes}</button><button type="button"><MessageCircle size={16} /> {post.replies} replies</button><button type="button" aria-label="Bookmark post"><Bookmark size={16} /></button><button type="button" aria-label="Open post"><ArrowUpRight size={16} /></button></footer></article>)}
          </section>
        </main>
        <aside className="community-aside"><section className="community-panel"><span className="community-panel-icon"><UsersRound size={18} /></span><p className="premium-eyebrow">YOUR CIRCLE</p><h2>Optometry peers</h2><div className="community-members"><span>AE</span><span>TA</span><span>IO</span><span>+42</span></div><p>Join conversations with 45 classmates in your programme.</p></section><section className="community-guidelines"><h3>Community guidelines</h3><p>Be constructive, respectful, and clear about the sources behind your ideas.</p><button type="button">Read guidelines <ArrowUpRight size={14} /></button></section></aside>
      </div>
    </AppShell>
  );
}
