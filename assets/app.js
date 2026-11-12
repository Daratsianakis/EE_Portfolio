(() => {
  "use strict";
  const data = window.PORTFOLIO_DATA || { profile: {}, projects: [], links: [] };
  const profile = data.profile || {};
  const byId = (id) => document.getElementById(id);
  const text = (id, value) => { if (byId(id)) byId(id).textContent = value || ""; };
  const validUrl = (value) => {
    try { const url = new URL(value); return ["https:", "http:"].includes(url.protocol) ? url.href : null; }
    catch { return null; }
  };
  const element = (tag, className, content) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (content !== undefined) node.textContent = String(content);
    return node;
  };
  const link = (url, title, className) => {
    const a = element("a", className, title);
    a.href = url;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    return a;
  };

  text("site-name", profile.name || "Electrical Engineering Portfolio");
  text("eyebrow", profile.eyebrow || "ENGINEERING / PROJECT PORTFOLIO");
  text("site-role", profile.role || "Electrical Engineering Student");
  text("tagline", profile.tagline);
  text("about-text", profile.about);
  text("education", profile.education);
  text("location", profile.location);
  text("footer-name", profile.name || "Engineering Portfolio");
  document.title = `${profile.name || "Engineering Portfolio"} | Portfolio`;
  const chips = byId("interests");
  for (const value of (Array.isArray(profile.interests) ? profile.interests : [])) {
    if (String(value).trim()) chips.appendChild(element("span", "tag", value));
  }
  const resume = validUrl(profile.resume_url);
  if (resume) byId("hero-actions").appendChild(link(resume, "Resume", "secondary-btn"));
  const email = String(profile.email || "").trim();
  if (email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    const anchor = element("a", "secondary-btn", "Email");
    anchor.href = `mailto:${email}`;
    byId("hero-actions").appendChild(anchor);
  }
  const projects = Array.isArray(data.projects) ? data.projects : [];
  text("project-count", `${String(projects.length).padStart(2, "0")} / PROJECTS`);
  const projectGrid = byId("project-grid");
  if (!projects.length) projectGrid.appendChild(element("div", "empty-state", "Projects will appear here when added through the local editor."));
  projects.forEach((project, index) => {
    const card = element("article", "project-card");
    const row = element("div", "flex justify-between items-center gap-3");
    row.appendChild(element("span", "mono text-xs text-slate-500", `PROJECT_${String(index + 1).padStart(2, "0")}`));
    if (project.featured) row.appendChild(element("span", "mono text-xs text-green-400", "FEATURED"));
    card.appendChild(row);
    card.appendChild(element("h3", "", project.name || "Untitled Project"));
    card.appendChild(element("p", "", project.description || ""));
    const tags = element("div", "flex flex-wrap gap-2");
    for (const tag of (Array.isArray(project.tags) ? project.tags : [])) {
      if (tag) tags.appendChild(element("span", "tag", tag));
    }
    card.appendChild(tags);
    const actions = element("div", "project-cta");
    const projectUrl = validUrl(project.url);
    const sourceUrl = validUrl(project.source_url);
    if (projectUrl) actions.appendChild(link(projectUrl, "View Project ↗"));
    if (sourceUrl) actions.appendChild(link(sourceUrl, "Source Code ↗"));
    card.appendChild(actions);
    projectGrid.appendChild(card);
  });
  const links = byId("links-grid");
  const glyphs = { github: "GH", linkedin: "in", youtube: "▶", website: "⌘", other: "↗" };
  let activeLinks = 0;
  for (const entry of (Array.isArray(data.links) ? data.links : [])) {
    const url = validUrl(entry.url);
    if (!url) continue;
    activeLinks += 1;
    const a = link(url, "", "link-card");
    a.setAttribute("aria-label", `Open ${entry.name || "external link"} in a new tab`);
    a.appendChild(element("span", "link-icon mono", glyphs[entry.kind] || glyphs.other));
    const details = element("div", "min-w-0");
    details.appendChild(element("strong", "", entry.name || "Professional Link"));
    details.appendChild(element("small", "mono", new URL(url).hostname));
    a.appendChild(details);
    links.appendChild(a);
  }
  if (!activeLinks) links.appendChild(element("div", "empty-state", "Professional links will appear here when their URLs are added."));

  const svg = byId("system-svg");
  const ns = "http://www.w3.org/2000/svg";
  const make = (tag, props, label) => {
    const el = document.createElementNS(ns, tag);
    Object.entries(props).forEach(([key, value]) => el.setAttribute(key, String(value)));
    if (label !== undefined) el.textContent = label;
    svg.appendChild(el);
    return el;
  };

  make("text", { x: 210, y: 24, fill: "#94a3b8", "font-family": "monospace", "font-size": 12, "text-anchor": "middle" }, "MODELING / CONTROL LOOP");

  const blocks = [
    { x: 14, y: 86, w: 88, h: 58, label: ["INPUT"], color: "#3b82f6" },
    { x: 148, y: 70, w: 124, h: 90, label: ["MODEL", "PROCESS"], color: "#22d3ee" },
    { x: 318, y: 86, w: 88, h: 58, label: ["OUTPUT"], color: "#4ade80" },
    { x: 306, y: 176, w: 112, h: 34, label: ["SENSING"], color: "#a78bfa" }
  ];

  blocks.forEach((block) => {
    make("rect", { x: block.x, y: block.y, width: block.w, height: block.h, rx: 8, fill: "#1e293b", stroke: block.color, "stroke-width": 2.2 });
    if (block.label.length === 1) {
      make("text", { x: block.x + block.w / 2, y: block.y + block.h / 2 + 5, fill: "#e2e8f0", "font-size": 12, "font-family": "monospace", "text-anchor": "middle", "font-weight": 700 }, block.label[0]);
    } else {
      make("text", { x: block.x + block.w / 2, y: block.y + block.h / 2 - 6, fill: "#e2e8f0", "font-size": 12, "font-family": "monospace", "text-anchor": "middle", "font-weight": 700 }, block.label[0]);
      make("text", { x: block.x + block.w / 2, y: block.y + block.h / 2 + 12, fill: "#e2e8f0", "font-size": 12, "font-family": "monospace", "text-anchor": "middle", "font-weight": 700 }, block.label[1]);
    }
  });

  const basePaths = [
    { d: "M 102 115 L 148 115", color: "#334155", width: 6 },
    { d: "M 272 115 L 318 115", color: "#334155", width: 6 },
    { d: "M 362 144 L 362 176", color: "#334155", width: 5 },
    { d: "M 306 193 L 286 193 Q 252 193 252 170 L 252 160", color: "#334155", width: 5 }
  ];
  basePaths.forEach((p) => make("path", { d: p.d, fill: "none", stroke: p.color, "stroke-width": p.width, "stroke-linecap": "round", "stroke-linejoin": "round" }));

  const animatedPaths = [
    { d: "M 102 115 L 148 115", color: "#3b82f6", delay: 0 },
    { d: "M 272 115 L 318 115", color: "#4ade80", delay: 0.7 },
    { d: "M 362 144 L 362 176", color: "#22d3ee", delay: 1.2 },
    { d: "M 306 193 L 286 193 Q 252 193 252 170 L 252 160", color: "#a78bfa", delay: 1.7 }
  ];
  animatedPaths.forEach((p) => {
    const path = make("path", { d: p.d, stroke: p.color, "stroke-width": 3, fill: "none", "stroke-linecap": "round", "stroke-linejoin": "round", "stroke-dasharray": "9 8" });
    const animate = document.createElementNS(ns, "animate");
    for (const [key, value] of Object.entries({ attributeName: "stroke-dashoffset", values: "34;0", dur: "1.8s", begin: `${p.delay}s`, repeatCount: "indefinite" })) animate.setAttribute(key, value);
    path.appendChild(animate);
  });

  [[58, 154, "#3b82f6"], [210, 170, "#22d3ee"], [362, 154, "#4ade80"], [252, 204, "#a78bfa"]].forEach(([cx, cy, color]) => {
    make("circle", { cx, cy, r: 4.2, fill: color });
  });

  [[58, 220, "REFERENCE"], [210, 220, "MODELING"], [362, 220, "OUTPUT"], [252, 204, ""]].forEach(([x, y, label]) => {
    if (label) make("text", { x, y, fill: "#64748b", "font-family": "monospace", "font-size": 10, "text-anchor": "middle" }, label);
  });
  make("text", { x: 252, y: 220, fill: "#64748b", "font-family": "monospace", "font-size": 10, "text-anchor": "middle" }, "FEEDBACK");
})();
