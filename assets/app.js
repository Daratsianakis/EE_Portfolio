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
  const make = (tag, attributes, label) => {
    const node = document.createElementNS(ns, tag);
    for (const [key, value] of Object.entries(attributes)) node.setAttribute(key, String(value));
    if (label !== undefined) node.textContent = label;
    svg.appendChild(node);
    return node;
  };

  // Reference -> comparison -> controller -> plant -> output.
  // Measured output -> sensor -> negative input of comparison.
  const wires = [
    { d: "M 10 79 H 47", color: "#3b82f6" },
    { d: "M 75 79 H 104", color: "#22d3ee" },
    { d: "M 184 79 H 225", color: "#22d3ee" },
    { d: "M 325 79 H 407", color: "#4ade80" },
    { d: "M 370 79 V 157 H 283", color: "#a78bfa" },
    { d: "M 183 157 H 61 V 93", color: "#a78bfa" }
  ];

  // Background wires and animated direction-indicating pulses.
  wires.forEach(({ d, color }, index) => {
    make("path", {
      d, fill: "none", stroke: "#334155", "stroke-width": 6,
      "stroke-linecap": "round", "stroke-linejoin": "round"
    });
    const path = make("path", {
      d, fill: "none", stroke: color, "stroke-width": 3.2,
      "stroke-dasharray": "8 10", "stroke-linecap": "round",
      "stroke-linejoin": "round"
    });
    const animation = document.createElementNS(ns, "animate");
    for (const [key, value] of Object.entries({
      attributeName: "stroke-dashoffset",
      values: index === 4 || index === 5 ? "0;-36" : "36;0",
      dur: "1.7s", repeatCount: "indefinite"
    })) animation.setAttribute(key, value);
    path.appendChild(animation);
  });

  const blocks = [
    { x: 104, y: 53, width: 80, height: 52, label: "CONTROL", color: "#22d3ee" },
    { x: 225, y: 53, width: 100, height: 52, label: "MODEL", color: "#4ade80" },
    { x: 183, y: 137, width: 100, height: 40, label: "SENSOR", color: "#a78bfa" }
  ];

  blocks.forEach((block) => {
    make("rect", {
      x: block.x, y: block.y, width: block.width, height: block.height,
      rx: 7, fill: "#1e293b", stroke: block.color, "stroke-width": 2.3
    });
    make("text", {
      x: block.x + block.width / 2, y: block.y + block.height / 2 + 4.5,
      fill: "#e2e8f0", "font-size": 12, "font-family": "monospace",
      "text-anchor": "middle", "font-weight": 700
    }, block.label);
  });

  // Summing junction uses a reference and negative feedback.
  make("circle", { cx: 61, cy: 79, r: 14, fill: "#1e293b", stroke: "#3b82f6", "stroke-width": 2.5 });
  make("text", { x: 61, y: 83, fill: "#e2e8f0", "font-size": 15, "font-weight": 700, "text-anchor": "middle", "font-family": "monospace" }, "Σ");
  make("text", { x: 45, y: 67, fill: "#93c5fd", "font-size": 12, "font-weight": 700, "font-family": "monospace" }, "+");
  make("text", { x: 71, y: 108, fill: "#c4b5fd", "font-size": 13, "font-weight": 700, "font-family": "monospace" }, "−");
  make("circle", { cx: 370, cy: 79, r: 4.2, fill: "#4ade80" });

  // Keep arrows on the external reference and output wires only.
  make("path", { d: "M 407 79 l -8 -5 v 10 z", fill: "#4ade80" });
})();
