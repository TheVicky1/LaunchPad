import React, { useState } from 'react';
import {
  Compass,
  FileText,
  HelpCircle,
  GitFork,
  GitBranch,
  Send,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Terminal,
  ExternalLink
} from 'lucide-react';

export const OpenSourceGuide = () => {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      title: '1. Finding the Right Repository',
      icon: Compass,
      summary: 'Target active projects using technologies you are learning.',
      content: (
        <div>
          <p className="text-sm text-slate-600 mb-3">
            Start with tools, libraries, or applications you actually use. Look for repositories with a recent commit history, clear contribution guidelines, and supportive maintainers.
          </p>
          <div className="bg-slate-900 text-slate-200 p-3 rounded-lg text-xs font-mono mb-2">
            Tip: Search GitHub topics like <span className="text-emerald-400">#good-first-issue</span> or <span className="text-emerald-400">#hacktoberfest</span>
          </div>
        </div>
      )
    },
    {
      title: '2. Understanding the README & CONTRIBUTING.md',
      icon: FileText,
      summary: 'Read the blueprints before touching any code.',
      content: (
        <div>
          <p className="text-sm text-slate-600 mb-2">
            The <strong>README.md</strong> explains the project architecture, dependencies, and local dev setup. The <strong>CONTRIBUTING.md</strong> details code styling rules, branch conventions, and testing instructions.
          </p>
          <ul className="list-disc list-inside text-xs text-slate-600 space-y-1 pl-1">
            <li>Check Node/Python version prerequisites.</li>
            <li>Run test suites locally to confirm your base environment is healthy.</li>
          </ul>
        </div>
      )
    },
    {
      title: '3. Finding Beginner-Friendly Issues',
      icon: HelpCircle,
      summary: 'Pick bite-sized bugs, docs, or UI polish tasks.',
      content: (
        <div>
          <p className="text-sm text-slate-600 mb-2">
            Filter the Issues tab using labels such as <code className="bg-indigo-50 text-indigo-700 px-1 py-0.5 rounded text-xs">good first issue</code>, <code className="bg-emerald-50 text-emerald-700 px-1 py-0.5 rounded text-xs">documentation</code>, or <code className="bg-amber-50 text-amber-700 px-1 py-0.5 rounded text-xs">help wanted</code>.
          </p>
          <p className="text-xs text-slate-500">
            Always leave a brief, polite comment on the issue asking: <em>"Hi maintainers, I would love to work on this issue if it is unassigned!"</em> Wait for assignment before writing code.
          </p>
        </div>
      )
    },
    {
      title: '4. Forking & Cloning the Repository',
      icon: GitFork,
      summary: 'Create your personal copy on GitHub and pull it locally.',
      content: (
        <div>
          <p className="text-sm text-slate-600 mb-2">
            Click the <strong>Fork</strong> button on the top-right of GitHub. Then clone your fork to your computer:
          </p>
          <div className="bg-slate-900 text-slate-200 p-3 rounded-lg text-xs font-mono space-y-1">
            <div className="text-slate-400"># Clone your fork</div>
            <div className="text-emerald-400">git clone https://github.com/YOUR_USERNAME/project-name.git</div>
            <div className="text-slate-400"># Navigate into directory and add upstream remote</div>
            <div>cd project-name</div>
            <div className="text-emerald-400">git remote add upstream https://github.com/ORIGINAL_ORG/project-name.git</div>
          </div>
        </div>
      )
    },
    {
      title: '5. Creating a Feature Branch',
      icon: GitBranch,
      summary: 'Never commit directly to your main branch.',
      content: (
        <div>
          <p className="text-sm text-slate-600 mb-2">
            Isolate your changes in a descriptive branch so your main branch stays in sync with upstream:
          </p>
          <div className="bg-slate-900 text-slate-200 p-3 rounded-lg text-xs font-mono space-y-1">
            <div className="text-slate-400"># Pull latest changes from upstream</div>
            <div>git checkout main && git pull upstream main</div>
            <div className="text-slate-400"># Create and switch to new branch</div>
            <div className="text-emerald-400">git checkout -b fix-auth-redirect-bug</div>
          </div>
        </div>
      )
    },
    {
      title: '6. Making Changes & Opening a Pull Request',
      icon: Send,
      summary: 'Commit cleanly, push to your fork, and submit your PR.',
      content: (
        <div>
          <p className="text-sm text-slate-600 mb-2">
            Make minimal, focused changes. Run linter and tests before pushing:
          </p>
          <div className="bg-slate-900 text-slate-200 p-3 rounded-lg text-xs font-mono space-y-1 mb-2">
            <div>git add .</div>
            <div className="text-emerald-400">git commit -m "fix: resolve auth redirect on login (#402)"</div>
            <div className="text-emerald-400">git push origin fix-auth-redirect-bug</div>
          </div>
          <p className="text-xs text-slate-500">
            Go to the original repository on GitHub, click <strong>"Compare & Pull Request"</strong>, fill out the PR template describing your solution, and link the issue with <code>Closes #402</code>!
          </p>
        </div>
      )
    }
  ];

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Compass className="w-5 h-5 text-indigo-600" />
            Getting Started with Open Source
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            A 6-step practical roadmap for making your first open source contribution.
          </p>
        </div>
        <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-100">
          Student Quickstart
        </span>
      </div>

      <div className="space-y-3">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          const isOpen = activeStep === idx;

          return (
            <div
              key={idx}
              className={`border rounded-xl transition-all duration-200 overflow-hidden ${
                isOpen ? 'border-indigo-300 bg-indigo-50/20' : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <button
                onClick={() => setActiveStep(isOpen ? -1 : idx)}
                className="w-full px-4 py-3 flex items-center justify-between text-left"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-semibold ${
                      isOpen ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-semibold text-slate-800">{step.title}</h4>
                    <p className="text-[11px] text-slate-500">{step.summary}</p>
                  </div>
                </div>
                {isOpen ? (
                  <ChevronUp className="w-4 h-4 text-indigo-600" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                )}
              </button>

              {isOpen && (
                <div className="px-4 pb-4 pt-1 border-t border-indigo-100/60 bg-white">
                  {step.content}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
