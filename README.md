# Agentic AI Fit Assessment

A technology- and industry-agnostic static website that helps practitioners assess whether a use case merits agentic AI or whether a deterministic / LLM-enhanced workflow is a better fit.

## Features

- Responsive, accessible questionnaire with 24 criteria across six dimensions.
- Preliminary architecture guidance based on answer patterns, not a universal pass/fail score.
- Highlights risk, governance, and control gaps.
- Exports a Markdown report and supports copying the report summary.
- Privacy-first by default: no analytics, cookies, accounts, backend, or assessment-answer uploads.
- Optional feedback form with explicit consent. Feedback remains disabled until a site owner configures an HTTPS endpoint.

## Run locally

Open `index.html` in a browser. For the most realistic local experience, run a static server from the project directory:

```bash
python -m http.server 8000
```

Then visit `http://localhost:8000`.

No build step or package installation is required.

## Publish using GitHub Pages

1. Create a public GitHub repository, for example `agentic-ai-fit-assessment`.
2. Upload the contents of this folder to the repository root. The root should contain `index.html`, `README.md`, and `assets/`.
3. In the repository, open **Settings → Pages**.
4. Under the build/deployment source, choose **Deploy from a branch**.
5. Choose branch `main` and folder `/ (root)`, then save.
6. Wait for the Pages deployment to finish. The public URL will be shown in **Settings → Pages** and normally follows `https://YOUR-USERNAME.github.io/REPOSITORY-NAME/`.
7. Test the published site on desktop and mobile. Test all radio options, progress tracking, recommendation paths, reset, report download, and copy action.

The repository must be public for the simplest free GitHub Pages setup on GitHub Free. Review GitHub's current Pages plan and usage terms before publishing.

## Optional anonymized feedback

Feedback is not enabled by default. The page does not collect or send assessment answers. If you enable feedback, only the feedback rating, optional free-text comment, a broad assessment-completion band, submission timestamp, consent flag, and tool version are sent to the configured endpoint.

Before enabling it:

1. Select a feedback provider or operate an endpoint you control.
2. Review the provider's privacy policy, data handling, retention, and any IP/logging behavior. “Anonymous” cannot be guaranteed solely by this frontend; the provider or hosting infrastructure may log metadata.
3. Explain what will be collected and link a privacy notice suitable for your setup.
4. In `assets/config.js`, set `feedbackEndpoint` to your HTTPS endpoint and `feedbackEnabled` to `true`.
5. Ensure the endpoint supports browser CORS requests and accepts the JSON payload. Never put secret API keys or private credentials in this repository.
6. Test with non-sensitive data before launch.

The feedback form has a required consent checkbox. The optional comment is limited to 500 characters. Do not ask people to share confidential company information, personal data, or sensitive use-case details.

## Customise the site

- Edit the questions and their explanatory text in `assets/app.js`.
- Update brand copy and page metadata in `index.html`.
- Adjust colors, typography, and layout in `assets/styles.css`.
- Configure feedback only after a suitable endpoint and privacy notice exist in `assets/config.js`.

## Assessment logic

The recommendation logic is deliberately heuristic and transparent. It looks for patterns in dynamic action selection and feedback-driven adaptation, considers business value, and flags “No” answers in the risk/control section. It is not a validated scientific model, compliance assessment, security review, or certification. Validate the rubric with practitioners before relying on it for material architecture decisions.

## Suggested launch checklist

- [ ] Replace or add a project-owner name / portfolio link if desired.
- [ ] Verify all copy, accessibility, and mobile layout.
- [ ] Review the recommendation rules against representative sample use cases.
- [ ] Confirm no feedback endpoint is configured unless consent and privacy details are ready.
- [ ] Add a privacy notice if feedback is enabled.
- [ ] Publish and test the GitHub Pages URL.
- [ ] Add the public URL to LinkedIn Featured and write a post explaining the design principle.
- [ ] Invite a small group of architects to test the rubric and submit general feedback.

## License

MIT. See `LICENSE`.
