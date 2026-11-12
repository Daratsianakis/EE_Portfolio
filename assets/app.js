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

  // Compact, responsive closed-loop diagram. Every coordinate is inside a 540x205 viewBox.
  const svg = byId("system-svg");
  const ns = "http://www.w3.org/2000/svg";
  const make = (tag, attrs, value, parent = svg) => {
    const item = document.createElementNS(ns, tag);
    Object.entries(attrs).forEach(([name, attr]) => item.setAttribute(name, String(attr)));
    if (value !== undefined) item.textContent = value;
    parent.appendChild(item);
    return item;
  };
  const defs = make("defs", {});
  const colors = { reference: "#60a5fa", control: "#22d3ee", plant: "#4ade80", feedback: "#a78bfa" };
  Object.entries(colors).forEach(([name, color]) => {
    const marker = make("marker", {
      id: `fc-arrow-${name}`, viewBox: "0 0 10 10", refX: 8, refY: 5,
      markerWidth: 5, markerHeight: 5, orient: "auto"
    }, undefined, defs);
    make("path", { d: "M 1 1 L 9 5 L 1 9 Z", fill: color }, undefined, marker);
  });
  const mono = "ui-monospace, SFMono-Regular, Menlo, monospace";
  const label = (value, x, y, attrs = {}) => make("text", {
    x, y, "text-anchor": "middle", "font-family": mono,
    "font-size": 11, fill: "#cbd5e1", ...attrs
  }, value);
  const block = (name, x, y, w, h, color, fontSize = 12) => {
    make("rect", { x, y, width: w, height: h, rx: 6,
      fill: "#1e293b", stroke: color, "stroke-width": 2 });
    label(name, x + w / 2, y + h / 2 + fontSize * .34, {
      "font-size": fontSize, fill: "#f8fafc", "font-weight": 700
    });
  };
  const wire = (pathData, type, duration = 2.2) => {
    make("path", { d: pathData, fill: "none", stroke: "#334155",
      "stroke-width": 4.6, "stroke-linecap": "round", "stroke-linejoin": "round" });
    const animated = make("path", { d: pathData, fill: "none", stroke: colors[type],
      "stroke-width": 2.5, "stroke-linecap": "round", "stroke-linejoin": "round",
      "stroke-dasharray": "8 7", "marker-end": `url(#fc-arrow-${type})` });
    make("animate", { attributeName: "stroke-dashoffset", values: "30;0",
      dur: `${duration}s`, repeatCount: "indefinite" }, undefined, animated);
  };

  // Labels and the plant surround stay inside the SVG boundary.
  label("DESIRED OUTPUT", 57, 47, { "font-size": 10, fill: "#94a3b8" });
  label("ACTUAL OUTPUT", 500, 35, { "font-size": 10, fill: "#94a3b8" });
  label("PLANT", 407, 40, { "font-size": 10, fill: "#94a3b8" });
  make("rect", { x: 316, y: 45, width: 185, height: 80, rx: 9,
    fill: "#0c2c31", stroke: "#155e75", "stroke-width": 1.3 });

  // Feedback arrives on the second, parallel input to Comparison.
  wire("M 93 68 H 124", "reference");
  wire("M 93 99 H 124", "feedback");
  wire("M 203 84 H 222", "control");
  wire("M 304 84 H 331", "control");
  wire("M 404 84 H 424", "plant");
  wire("M 496 84 H 526", "plant");
  wire("M 510 84 V 167 H 384", "feedback");
  wire("M 290 167 H 93 V 99", "feedback");

  block("COMPARISON", 124, 57, 79, 54, colors.reference, 10.6);
  block("CONTROLLER", 222, 57, 82, 54, colors.control, 10.4);
  block("ACTUATOR", 331, 57, 73, 54, colors.plant, 10.2);
  block("PROCESS", 424, 57, 72, 54, colors.plant, 10.8);
  block("SENSOR", 290, 147, 94, 40, colors.feedback, 11);
  make("circle", { cx: 510, cy: 84, r: 3.1, fill: colors.plant });
})();
