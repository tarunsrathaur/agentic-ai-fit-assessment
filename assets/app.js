(() => {
  "use strict";

  const sections = [
    { title: "Business problem and value", subtitle: "Confirm that the problem is worth solving.", questions: [
      ["Is the business outcome clearly defined and measurable?", "For example: reduce resolution time, improve completion rates, or lower manual effort."],
      ["Does the use case involve complexity that simpler automation cannot handle economically?", "A lookup or fixed decision tree may not justify an agent."],
      ["Is there enough business value to offset additional cost, latency, and operational overhead?", "Include orchestration, evaluation, monitoring, and human oversight."],
      ["Does the use case occur often enough, or create enough value per case, to justify implementation?", "Consider volume, exception rates, and the cost of an error."]
    ]},
    { title: "Task variability and uncertainty", subtitle: "Look for genuine uncertainty in the path.", questions: [
      ["Do inputs, context, or required actions vary materially between requests?", "Variability may come from natural-language requests, incomplete information, or changing circumstances."],
      ["Must the system interpret ambiguous or unstructured information to determine the next step?", "Examples: emails, documents, conversation history, or conflicting evidence."],
      ["Can the next action not always be fully specified in advance?", "The system may need to choose among valid actions based on the current situation."],
      ["Must the system revise its approach when new information or an unexpected result appears?", "Distinguish genuine adaptation from predefined retry rules."]
    ]},
    { title: "Autonomy and decision-making", subtitle: "Assess whether the system needs agency.", questions: [
      ["Must the system select the next action dynamically rather than execute a fixed sequence?", "For example, retrieve more evidence, ask a question, or invoke a different capability."],
      ["Does it need to pursue a goal through multiple dependent steps?", "Each step may influence what happens next."],
      ["Must it determine whether it has enough evidence to finish, or whether more work is needed?", "Completion criteria should still be explicit and testable."],
      ["Can it operate within clearly defined permissions, policies, and action boundaries?", "An agent without enforceable boundaries is not production-ready."]
    ]},
    { title: "Tools, systems, and feedback", subtitle: "Multiple tools are not sufficient by themselves.", questions: [
      ["Must the system use multiple tools, services, or information sources to achieve the outcome?", "Multiple tools alone do not prove that an agent is needed."],
      ["Do tool outputs or external events influence which action should happen next?", "This is stronger evidence for agency than simply calling several APIs."],
      ["Must the system inspect results and adjust its subsequent actions?", "For example, verify a change, handle a rejection, or retrieve missing information."],
      ["Are the required tools reliable, accessible, and equipped with appropriate permissions and error handling?", "An agent cannot compensate for unavailable or unsafe underlying capabilities."]
    ]},
    { title: "Risk, governance, and control", subtitle: "Safety and controls are design requirements.", questions: [
      ["Can the system's actions be constrained to an approved set of operations?", "Use allowlists, scoped credentials, validation, and policy enforcement."],
      ["Can consequential or irreversible actions require approval or additional checks?", "Examples include payments, lending decisions, account changes, or external communications."],
      ["Can important decisions and actions be traced and audited?", "Capture evidence, tool calls, decisions, outcomes, and approvals as appropriate."],
      ["Is the impact of incorrect actions bounded and recoverable?", "Consider compensating actions, rollback, idempotency, and escalation."],
      ["Can sensitive data, unauthorized instructions, and untrusted tool outputs be handled safely?", "Consider access control, data minimization, prompt injection, and information leakage."]
    ]},
    { title: "Reliability and operational readiness", subtitle: "A production design includes the operating model.", questions: [
      ["Can success be evaluated using objective criteria?", "Define correctness, completion, policy compliance, and quality thresholds."],
      ["Can the system detect failure, stop safely, and escalate when necessary?", "Include timeouts, retry budgets, step limits, and human handoff."],
      ["Can performance be tested across representative, edge, and adversarial cases?", "Use repeatable evaluations, regression tests, and production monitoring."],
      ["Can the business tolerate expected latency, variable execution paths, and operating cost?", "Agentic execution may use more calls and have less predictable duration."],
      ["Is there a clear owner for monitoring, incident response, policy changes, and ongoing evaluation?", "Production ownership is part of the solution, not an afterthought."]
    ]}
  ];

  const answers = {};
  const sectionRoot = document.getElementById("question-sections");
  const totalQuestions = sections.reduce((sum, s) => sum + s.questions.length, 0);
  const labels = { yes: "Yes", partial: "Partially", no: "No" };
  let lastReport = "";

  function esc(value) {
    return String(value).replace(/[&<>"']/g, c => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" }[c]));
  }

  function renderQuestions() {
    sectionRoot.innerHTML = sections.map((section, si) => `
      <section class="question-section">
        <header class="section-title">
          <span class="section-letter">${String.fromCharCode(65 + si)}</span>
          <div><h3>${esc(section.title)}</h3><p>${esc(section.subtitle)}</p></div>
        </header>
        ${section.questions.map((q, qi) => {
          const id = `q-${si}-${qi}`;
          return `<article class="question">
            <div class="question-top"><h4>${esc(q[0])}</h4><span class="question-number">${String(si + 1).padStart(2,"0")}.${String(qi + 1).padStart(2,"0")}</span></div>
            <p class="question-help">${esc(q[1])}</p>
            <div class="choice-row" role="radiogroup" aria-label="${esc(q[0])}">
              ${Object.entries(labels).map(([value, label]) => `<label class="choice"><input type="radio" name="${id}" value="${value}" data-key="${id}" ${answers[id] === value ? "checked" : ""}><span>${label}</span></label>`).join("")}
            </div>
          </article>`;
        }).join("")}
      </section>`).join("");
    sectionRoot.querySelectorAll("input[type=radio]").forEach(input => input.addEventListener("change", e => {
      answers[e.target.dataset.key] = e.target.value;
      updateProgress();
      document.getElementById("results").classList.add("hidden");
    }));
  }

  function getAnswer(si, qi) { return answers[`q-${si}-${qi}`] || null; }
  function sectionCounts(si) {
    const vals = sections[si].questions.map((_, qi) => getAnswer(si, qi));
    return { yes: vals.filter(v => v === "yes").length, partial: vals.filter(v => v === "partial").length,
      no: vals.filter(v => v === "no").length, answered: vals.filter(Boolean).length };
  }
  function updateProgress() {
    const answered = Object.values(answers).filter(Boolean).length;
    const noControlAnswers = [4,5].reduce((sum, si) => sum + sections[si].questions.filter((_, qi) => getAnswer(si, qi) === "no").length, 0);
    document.getElementById("progress-text").textContent = `${answered} of ${totalQuestions} answered`;
    document.getElementById("progress-percent").textContent = `${Math.round(answered / totalQuestions * 100)}%`;
    document.getElementById("progress-bar").style.width = `${answered / totalQuestions * 100}%`;
    document.getElementById("aside-answered").textContent = answered;
    document.getElementById("aside-gaps").textContent = noControlAnswers;
  }

  function buildAssessment() {
    const answered = Object.values(answers).filter(Boolean).length;
    const vari = [1,2,3].reduce((sum, si) => sum + sections[si].questions.reduce((a, _, qi) => a + (getAnswer(si,qi)==="yes" ? 1 : getAnswer(si,qi)==="partial" ? .5 : 0), 0), 0);
    const agency = [2,3].reduce((sum, si) => sum + sections[si].questions.reduce((a, _, qi) => a + (getAnswer(si,qi)==="yes" ? 1 : getAnswer(si,qi)==="partial" ? .5 : 0), 0), 0);
    const dynamicCore = [2,3].reduce((sum, si) => sum + sections[si].questions.reduce((a, _, qi) => {
      const keyQuestion = (si === 2 && [0,1,2].includes(qi)) || (si === 3 && [1,2].includes(qi));
      return a + (keyQuestion ? (getAnswer(si,qi)==="yes" ? 1 : getAnswer(si,qi)==="partial" ? .5 : 0) : 0);
    }, 0), 0);
    const riskQuestions = sections[4].questions.length;
    const riskNo = sections[4].questions.filter((_, qi) => getAnswer(4,qi) === "no").length;
    const riskPartial = sections[4].questions.filter((_, qi) => getAnswer(4,qi) === "partial").length;
    const businessYes = sections[0].questions.filter((_, qi) => getAnswer(0,qi) === "yes").length;
    const allCoreAnswered = [1,2,3].every(si => sections[si].questions.some((_, qi) => getAnswer(si,qi)));
    let title, tag, tone, summary, rationale, actions;

    if (riskNo > 0) {
      title = "Resolve control gaps before granting autonomy";
      tag = "GOVERNANCE REVIEW NEEDED"; tone = "amber";
      summary = `You marked ${riskNo} risk, governance, or control criterion as “No”. This does not automatically rule out AI, but it means the proposed autonomy should not be approved until those gaps are addressed or the design is constrained.`;
      rationale = "A bounded workflow or human-approved design may still be viable while controls are improved.";
      actions = ["Review each “No” in risk, governance, and control and assign an owner.", "Define permissions, policy enforcement, audit trails, failure handling, and human approval requirements.", "Reassess the intended autonomy after controls are demonstrably in place."];
    } else if (!allCoreAnswered || answered < 12) {
      title = "Gather more evidence before choosing";
      tag = "DISCOVERY INCOMPLETE"; tone = "";
      summary = "The answers do not yet provide enough evidence for a confident architecture recommendation. Treat this result as a discovery prompt, not a verdict.";
      rationale = "Unanswered questions—especially around dynamic decisions, feedback, value, and operational controls—can change the architecture choice.";
      actions = ["Interview business and operations stakeholders about real cases and exceptions.", "Map the current process, decision points, system interactions, and failure modes.", "Complete the checklist with concrete examples and measurable success criteria."];
    } else if (dynamicCore >= 3.5 && businessYes >= 2) {
      title = "Consider a bounded agentic workflow";
      tag = "AGENCY MAY ADD VALUE"; tone = "green";
      summary = "Your answers indicate several dynamic, feedback-driven behaviors alongside a meaningful business problem. A bounded agentic design may be worth prototyping, provided its actions and stopping conditions are explicit.";
      rationale = "The strongest case is when the system must choose among permitted next steps, inspect results, and adapt its path—not merely call several tools.";
      actions = ["Prototype against representative cases and compare with a deterministic or LLM-enhanced baseline.", "Define an allowlisted action set, step and time budgets, stopping conditions, and escalation paths.", "Measure task success, policy compliance, latency, cost, and recovery behavior before expanding autonomy."];
    } else if (agency >= 4 && businessYes >= 2) {
      title = "Compare a bounded agent with a controlled workflow";
      tag = "COMPARE ARCHITECTURES"; tone = "";
      summary = "There are signs of multi-step decision-making, but the evidence for adaptive agency is not decisive. Run a comparison rather than committing to an agent-first design.";
      rationale = "A predefined workflow with targeted LLM steps may deliver much of the value with better predictability and easier testing.";
      actions = ["Build the simplest viable workflow baseline.", "Identify specific cases where a fixed path fails and dynamic action selection could help.", "Compare quality, cost, latency, failure modes, and maintenance effort on the same test set."];
    } else {
      title = "Start with a deterministic or LLM-enhanced workflow";
      tag = "SIMPLER DESIGN FIRST"; tone = "green";
      summary = "Your answers do not currently establish a strong need for dynamic agency. Begin with a controlled workflow and add an agent only if measured evidence shows the fixed path is insufficient.";
      rationale = "Natural-language input, an LLM call, or multiple APIs do not by themselves justify an agentic architecture.";
      actions = ["Define explicit steps, decision rules, and output contracts.", "Use an LLM only for the steps that require interpretation or generation.", "Record exceptions and revisit agency only when real cases demonstrate a benefit."];
    }

    const unanswered = totalQuestions - answered;
    const controlNotes = riskNo > 0
      ? `${riskNo} control criterion/criteria marked No; ${riskPartial} marked Partially.`
      : riskPartial > 0 ? `${riskPartial} control criterion/criteria marked Partially; validate them before production.`
      : "No risk/control criteria were marked No. This is not proof of safety; validate controls with evidence.";
    const sectionSummaries = sections.map((s, si) => {
      const c = sectionCounts(si);
      return { title: s.title, ...c };
    });
    const rows = sections.map((s, si) => `### ${s.title}\n${s.questions.map((q, qi) => `- ${q[0]} — ${labels[getAnswer(si,qi)] || "Not answered"}`).join("\n")}`).join("\n\n");
    const report = `# Agentic AI Fit Assessment\n\n## Preliminary guidance: ${title}\n${summary}\n\n**Why:** ${rationale}\n\n## Suggested next steps\n${actions.map((a,i)=>`${i+1}. ${a}`).join("\n")}\n\n## Governance note\n${controlNotes}\n\n## Completion\n${answered}/${totalQuestions} criteria answered; ${unanswered} unanswered.\n\n## Responses\n${rows}\n\n---\nThis assessment is a decision aid, not a certification, safety guarantee, or substitute for domain-specific architecture, legal, security, and risk review.`;
    lastReport = report;

    const result = document.getElementById("result-content");
    result.innerHTML = `
      <div class="result-banner ${tone}">
        <div><p class="eyebrow">PRELIMINARY RECOMMENDATION</p><h3>${esc(title)}</h3><p>${esc(summary)}</p></div>
        <span class="result-tag">${esc(tag)}</span>
      </div>
      ${riskNo > 0 ? `<div class="control-warning"><h3>Control gap to resolve</h3><p>${esc(controlNotes)} Do not grant autonomous access to consequential actions until the relevant safeguards are addressed.</p></div>` : ""}
      <div class="result-grid">
        <article class="result-card"><h3>Why this result?</h3><p>${esc(rationale)}</p><p><strong>Assessment coverage:</strong> ${answered} of ${totalQuestions} criteria answered (${unanswered} unanswered).</p><p><strong>Governance:</strong> ${esc(controlNotes)}</p></article>
        <article class="result-card"><h3>Recommended next steps</h3><ul class="next-steps">${actions.map(a=>`<li>${esc(a)}</li>`).join("")}</ul></article>
        <article class="result-card"><h3>What the answers suggest</h3><ul>${sectionSummaries.map(s=>`<li><strong>${esc(s.title)}:</strong> ${s.yes} Yes, ${s.partial} Partially, ${s.no} No${s.answered < sections.find(x=>x.title===s.title).questions.length ? `, ${sections.find(x=>x.title===s.title).questions.length-s.answered} unanswered` : ""}.</li>`).join("")}</ul></article>
        <article class="result-card"><h3>Interpretation guardrails</h3><ul><li>Do not use a raw score as a universal pass/fail threshold.</li><li>“Yes” answers about tools or multiple steps are not sufficient by themselves.</li><li>Prototype against a simpler baseline before adding autonomy.</li><li>Reassess when requirements, risk, or operating conditions change.</li></ul></article>
      </div>`;
    document.getElementById("results").classList.remove("hidden");
    document.getElementById("results").scrollIntoView({ behavior: "smooth", block: "start" });
  }

  document.getElementById("review-button").addEventListener("click", buildAssessment);
  document.getElementById("reset-button").addEventListener("click", () => {
    Object.keys(answers).forEach(k => delete answers[k]);
    renderQuestions(); updateProgress(); document.getElementById("results").classList.add("hidden");
    document.getElementById("assessment").scrollIntoView({ behavior: "smooth", block: "start" });
  });
  document.getElementById("download-button").addEventListener("click", () => {
    if (!lastReport) return;
    const blob = new Blob([lastReport], {type:"text/markdown;charset=utf-8"});
    const url = URL.createObjectURL(blob); const a = document.createElement("a");
    a.href = url; a.download = "agentic-ai-fit-assessment.md"; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
  });
  document.getElementById("copy-button").addEventListener("click", async () => {
    if (!lastReport) return;
    try { await navigator.clipboard.writeText(lastReport); document.getElementById("copy-button").textContent = "Copied"; }
    catch { window.prompt("Copy your assessment summary:", lastReport); }
  });

  document.getElementById("feedback-form").addEventListener("submit", async e => {
    e.preventDefault();
    const status = document.getElementById("feedback-status");
    const config = window.ASSESSMENT_CONFIG || {};
    if (!document.getElementById("feedback-consent").checked) {
      status.textContent = "Please provide consent before submitting feedback."; return;
    }
    if (!config.feedbackEnabled || !config.feedbackEndpoint || !/^https:\/\//i.test(config.feedbackEndpoint)) {
      status.textContent = "Feedback is not configured on this site yet. Nothing was sent."; return;
    }
    const payload = {
      rating: document.getElementById("feedback-rating").value,
      comment: document.getElementById("feedback-note").value.trim(),
      consent: true,
      assessmentCompletionBand: completionBand(),
      submittedAt: new Date().toISOString(),
      toolVersion: "1.0"
    };
    status.textContent = "Submitting…";
    try {
      const response = await fetch(config.feedbackEndpoint, {
        method: "POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify(payload), mode: "cors"
      });
      if (!response.ok) throw new Error("Submission failed");
      status.textContent = "Thank you. Your feedback was submitted.";
      e.target.reset();
    } catch (err) {
      status.textContent = "Could not submit feedback. Nothing else was stored by this page; please try later.";
    }
  });

  function completionBand() {
    const n = Object.values(answers).filter(Boolean).length;
    if (n === 0) return "0";
    if (n < 8) return "1-7";
    if (n < 16) return "8-15";
    if (n < totalQuestions) return "16-23";
    return "all";
  }

  renderQuestions();
  updateProgress();
})();
