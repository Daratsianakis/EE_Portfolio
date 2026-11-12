#!/usr/bin/env python3
"""Local graphical editor for profile, projects and professional links."""
import json
import subprocess
import sys
import tkinter as tk
from pathlib import Path
from tkinter import messagebox, ttk

ROOT = Path(__file__).resolve().parent
DATA_FILE = ROOT / "portfolio.json"
FIELDS = [
    ("name", "Display name"), ("eyebrow", "Header label"),
    ("role", "Professional title"), ("location", "Location"),
    ("tagline", "Headline / tagline"), ("education", "Education"),
    ("email", "Public email (optional)"), ("resume_url", "Resume URL (optional)"),
]

class PortfolioEditor(tk.Tk):
    def __init__(self):
        super().__init__()
        self.title("Engineering Portfolio — Local Editor")
        self.geometry("1010x740")
        self.minsize(760, 560)
        self.data = json.loads(DATA_FILE.read_text(encoding="utf-8"))
        self.profile_vars = {}
        self.current_project = None
        self.current_link = None
        self.project_fields = {}
        self.link_fields = {}
        self._build()
        self.protocol("WM_DELETE_WINDOW", self._close)

    def _build(self):
        bar = ttk.Frame(self, padding=10)
        bar.pack(fill="x")
        ttk.Label(bar, text="PORTFOLIO CONTENT MANAGER", font=("Helvetica", 15, "bold")).pack(side="left")
        ttk.Button(bar, text="Save Changes", command=self.save).pack(side="right", padx=5)
        ttk.Button(bar, text="Open Website Locally", command=self.open_site).pack(side="right", padx=5)
        tabs = ttk.Notebook(self)
        tabs.pack(fill="both", expand=True, padx=12, pady=8)
        self.profile_tab = ttk.Frame(tabs, padding=12)
        self.project_tab = ttk.Frame(tabs, padding=12)
        self.link_tab = ttk.Frame(tabs, padding=12)
        tabs.add(self.profile_tab, text="Profile / About")
        tabs.add(self.project_tab, text="Projects")
        tabs.add(self.link_tab, text="Professional Links")
        self._profile_ui()
        self._collection_ui(self.project_tab, "projects")
        self._collection_ui(self.link_tab, "links")
        ttk.Label(self, text="Save updates portfolio.json and site_data.js. Publishing is separate: bash publish.sh", padding=10).pack(anchor="w")

    def _profile_ui(self):
        frame = self.profile_tab
        frame.columnconfigure(1, weight=1)
        profile = self.data["profile"]
        for row, (key, label) in enumerate(FIELDS):
            ttk.Label(frame, text=label).grid(row=row, column=0, sticky="w", padx=7, pady=7)
            var = tk.StringVar(value=profile.get(key, ""))
            self.profile_vars[key] = var
            ttk.Entry(frame, textvariable=var).grid(row=row, column=1, sticky="ew", padx=7, pady=7)
        row = len(FIELDS)
        ttk.Label(frame, text="Technical focus\n(one per line)").grid(row=row, column=0, sticky="nw", padx=7, pady=7)
        self.interests = tk.Text(frame, height=5, width=65, wrap="word")
        self.interests.insert("1.0", "\n".join(profile.get("interests", [])))
        self.interests.grid(row=row, column=1, sticky="ew", padx=7, pady=7)
        ttk.Label(frame, text="About Me").grid(row=row + 1, column=0, sticky="nw", padx=7, pady=7)
        self.about = tk.Text(frame, height=8, width=65, wrap="word")
        self.about.insert("1.0", profile.get("about", ""))
        self.about.grid(row=row + 1, column=1, sticky="nsew", padx=7, pady=7)
        frame.rowconfigure(row + 1, weight=1)

    def _collection_ui(self, tab, kind):
        outer = ttk.PanedWindow(tab, orient="horizontal")
        outer.pack(fill="both", expand=True)
        left = ttk.Frame(outer, padding=6)
        right = ttk.Frame(outer, padding=12)
        outer.add(left, weight=1)
        outer.add(right, weight=3)
        listbox = tk.Listbox(left, exportselection=False)
        listbox.pack(fill="both", expand=True)
        controls = ttk.Frame(left)
        controls.pack(fill="x", pady=8)
        ttk.Button(controls, text="Add", command=lambda: self.add_item(kind)).pack(side="left", padx=2)
        ttk.Button(controls, text="Remove", command=lambda: self.remove_item(kind)).pack(side="left", padx=2)
        ttk.Button(controls, text="↑", width=3, command=lambda: self.move_item(kind, -1)).pack(side="left", padx=2)
        ttk.Button(controls, text="↓", width=3, command=lambda: self.move_item(kind, 1)).pack(side="left", padx=2)
        fields = (
            [("name", "Project name"), ("description", "Description"), ("url", "Project URL"),
             ("source_url", "Source repository URL"), ("tags", "Tags (comma-separated)"), ("featured", "Featured (true / false)")]
            if kind == "projects" else
            [("name", "Display name"), ("url", "URL"), ("kind", "Icon type (github, linkedin, youtube, website, other)")]
        )
        right.columnconfigure(1, weight=1)
        vars_dict = {}
        for i, (key, label) in enumerate(fields):
            ttk.Label(right, text=label).grid(row=i, column=0, sticky="w", pady=10, padx=6)
            var = tk.StringVar()
            vars_dict[key] = var
            ttk.Entry(right, textvariable=var).grid(row=i, column=1, sticky="ew", pady=10, padx=6)
        ttk.Button(right, text="Apply Item Changes", command=lambda: self.apply_item(kind)).grid(row=len(fields), column=1, sticky="e", padx=6, pady=16)
        if kind == "projects":
            self.project_list = listbox
            self.project_fields = vars_dict
        else:
            self.link_list = listbox
            self.link_fields = vars_dict
        listbox.bind("<<ListboxSelect>>", lambda _event: self.select_item(kind))
        self.refresh(kind)
        if self.data[kind]:
            listbox.selection_set(0)
            self.select_item(kind)

    def state_for(self, kind):
        if kind == "projects":
            return self.project_list, self.project_fields, "current_project"
        return self.link_list, self.link_fields, "current_link"

    def refresh(self, kind, selected=None):
        box, _, _ = self.state_for(kind)
        box.delete(0, tk.END)
        for item in self.data[kind]:
            box.insert(tk.END, item.get("name", "Untitled"))
        if selected is not None and 0 <= selected < len(self.data[kind]):
            box.selection_set(selected)
            box.see(selected)
            self.select_item(kind)

    def select_item(self, kind):
        box, fields, active = self.state_for(kind)
        selection = box.curselection()
        if not selection:
            return
        index = selection[0]
        if index == getattr(self, active):
            return
        self.apply_item(kind, quiet=True)
        item = self.data[kind][index]
        setattr(self, active, index)
        for key, var in fields.items():
            val = item.get(key, "")
            if isinstance(val, list): val = ", ".join(val)
            if isinstance(val, bool): val = str(val).lower()
            var.set(str(val))

    def apply_item(self, kind, quiet=False):
        _, fields, active = self.state_for(kind)
        index = getattr(self, active)
        if index is None or index >= len(self.data[kind]):
            return
        item = self.data[kind][index]
        for key, var in fields.items():
            raw = var.get().strip()
            if key == "tags": item[key] = [part.strip() for part in raw.split(",") if part.strip()]
            elif key == "featured": item[key] = raw.lower() in ("true", "yes", "1", "on")
            else: item[key] = raw
        if not quiet: self.refresh(kind, index)

    def add_item(self, kind):
        self.apply_item(kind, quiet=True)
        entry = ({"name": "New Project", "description": "", "url": "", "source_url": "", "tags": [], "featured": False}
                 if kind == "projects" else {"name": "New Link", "url": "", "kind": "other"})
        self.data[kind].append(entry)
        _, _, active = self.state_for(kind)
        setattr(self, active, None)
        self.refresh(kind, len(self.data[kind]) - 1)

    def remove_item(self, kind):
        box, _, active = self.state_for(kind)
        selected = box.curselection()
        if not selected: return
        index = selected[0]
        del self.data[kind][index]
        setattr(self, active, None)
        self.refresh(kind, min(index, len(self.data[kind]) - 1))

    def move_item(self, kind, direction):
        self.apply_item(kind, quiet=True)
        box, _, active = self.state_for(kind)
        selected = box.curselection()
        if not selected: return
        old = selected[0]
        new = old + direction
        if 0 <= new < len(self.data[kind]):
            self.data[kind][old], self.data[kind][new] = self.data[kind][new], self.data[kind][old]
            setattr(self, active, None)
            self.refresh(kind, new)

    def save(self):
        self.apply_item("projects", quiet=True)
        self.apply_item("links", quiet=True)
        profile = self.data["profile"]
        for key, var in self.profile_vars.items(): profile[key] = var.get().strip()
        profile["interests"] = [s.strip() for s in self.interests.get("1.0", "end-1c").splitlines() if s.strip()]
        profile["about"] = self.about.get("1.0", "end-1c").strip()
        original = DATA_FILE.read_text(encoding="utf-8")
        try:
            DATA_FILE.write_text(json.dumps(self.data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
            subprocess.run([sys.executable, str(ROOT / "build_data.py")], check=True, capture_output=True, text=True)
        except subprocess.CalledProcessError as exc:
            DATA_FILE.write_text(original, encoding="utf-8")
            details = (exc.stderr or exc.stdout or str(exc)).strip()
            messagebox.showerror("Save failed", details)
            return False
        except Exception as exc:
            DATA_FILE.write_text(original, encoding="utf-8")
            messagebox.showerror("Save failed", str(exc))
            return False
        messagebox.showinfo("Saved", "Saved portfolio.json and generated site_data.js.\nRun bash publish.sh when ready to publish.")
        return True

    def open_site(self):
        import webbrowser
        webbrowser.open((ROOT / "index.html").as_uri())

    def _close(self):
        if messagebox.askyesno("Close editor", "Close the editor? Save Changes first if you want to keep edits."):
            self.destroy()

if __name__ == "__main__":
    PortfolioEditor().mainloop()
