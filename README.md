# Electrical Engineering Portfolio

Static, GitHub Pages compatible professional portfolio using HTML5, Tailwind CSS, custom CSS, vanilla JavaScript, and SVG. Uses the same slate engineering dashboard style as the FPGA Simulator Hub.

## Files

- `index.html` — website
- `assets/style.css` — theme and responsive styling
- `assets/app.js` — renders profile, projects, links, animated SVG
- `portfolio.json` — editable site content
- `site_data.js` — generated data for the browser
- `edit_portfolio.py` — local graphical content manager
- `build_data.py` — validates and regenerates site data
- `publish.sh` — initial repository creation, Git push, GitHub Pages setup, and later updates

## Edit content locally

On macOS, open a terminal in the project folder and run:

```bash
python3 edit_portfolio.py
```

Use the Profile, Projects, and Professional Links tabs. Select an item, edit its fields, and choose **Apply Item Changes** or **Save Changes**. Saving regenerates `site_data.js`. Empty professional link URLs are hidden from the public site. Projects can have both a primary URL and a source URL. Links open in a new browser tab.

You can alternatively edit `portfolio.json` manually and run:

```bash
python3 build_data.py
```

Open `index.html` directly to preview the generated static page. It uses a CDN for Tailwind CSS, so an internet connection is needed for Tailwind utilities.

## Publish with GitHub Pages

Requirements: `git`, Python 3, and GitHub CLI (`gh`) installed. Authenticate once with `gh auth login`. The GitHub account must have permission to create repositories and enable Pages.

From the portfolio directory:

```bash
bash publish.sh
```

The first run creates a **public** repository named `EE_Portfolio` under the GitHub CLI authenticated account if it does not already exist, commits files, pushes the `main` branch, and enables GitHub Pages from the repository root. Subsequent runs commit only changes and push to the **same repository**. The script refuses to overwrite an unrelated `origin` repository.

The site URL is `https://USERNAME.github.io/EE_Portfolio/` after GitHub completes deployment. Each run can create a new Git commit, but not a new fork or repository.

## Notes

- Update the display name and About text in the editor before publishing.
- Add actual LinkedIn and YouTube URLs when available. The placeholders are hidden until configured.
- Do not store secrets or private information in `portfolio.json`: it is published to a public repository.
- GitHub Pages serves static files; the editor runs locally, not on the public website.
