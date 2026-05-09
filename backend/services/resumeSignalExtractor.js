function normalizeText(text) {
  return String(text || '').replace(/\s+/g, ' ').trim();
}

function splitLines(text) {
  return String(text || '')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function inferName(text) {
  const lines = splitLines(text).slice(0, 8);
  const candidate = lines.find((line) => /^[A-Za-z][A-Za-z\s.'-]{2,50}$/.test(line) && line.split(/\s+/).length <= 4);
  return candidate || 'Student Candidate';
}

function inferBranch(text) {
  const content = String(text || '').toLowerCase();

  const branchRules = [
    { branch: 'CSE', patterns: ['computer science', 'cse', 'software engineering'] },
    { branch: 'IT', patterns: ['information technology', 'it'] },
    { branch: 'ECE', patterns: ['electronics', 'ece', 'communication engineering'] },
    { branch: 'EEE', patterns: ['electrical engineering', 'eee'] },
    { branch: 'MECH', patterns: ['mechanical engineering', 'mech'] },
    { branch: 'CIVIL', patterns: ['civil engineering', 'civil'] },
  ];

  for (const rule of branchRules) {
    if (rule.patterns.some((pattern) => content.includes(pattern))) {
      return rule.branch;
    }
  }

  return 'CSE';
}

function hasAny(text, phrases) {
  const content = String(text || '').toLowerCase();
  return phrases.some((phrase) => content.includes(phrase));
}

function inferSkillFlags(text) {
  return {
    dsa: hasAny(text, ['data structures', 'algorithms', 'leetcode', 'competitive programming']) ? 1 : 0,
    web_dev: hasAny(text, ['react', 'angular', 'vue', 'node.js', 'express', 'frontend', 'backend', 'full stack', 'web development']) ? 1 : 0,
    machine_learning: hasAny(text, ['machine learning', 'deep learning', 'tensorflow', 'pytorch', 'ml model', 'scikit']) ? 1 : 0,
    cloud: hasAny(text, ['aws', 'azure', 'gcp', 'cloud', 'docker', 'kubernetes', 'devops']) ? 1 : 0,
  };
}

function inferInternships(text) {
  const content = String(text || '').toLowerCase();
  const matches = content.match(/\b(intern|internship|trainee)\b/g) || [];
  return Math.max(0, Math.min(4, matches.length || (content.includes('experience') ? 1 : 0)));
}

function inferProjects(text) {
  const content = String(text || '');
  const lines = splitLines(content);
  const projectHeadingIndex = lines.findIndex((line) => /^(projects?|project experience)$/i.test(line));

  if (projectHeadingIndex >= 0) {
    const slice = lines.slice(projectHeadingIndex + 1, projectHeadingIndex + 16);
    const bulletCount = slice.filter((line) => /^[-*•]/.test(line)).length;
    if (bulletCount > 0) return Math.min(6, bulletCount);
  }

  const projectWordMatches = (content.toLowerCase().match(/\bproject\b/g) || []).length;
  if (projectWordMatches === 0) return 1;
  return Math.max(1, Math.min(6, projectWordMatches));
}

function inferProgrammingLanguages(text) {
  const languageTerms = [
    'python', 'java', 'javascript', 'typescript', 'c++', 'c#', 'go', 'rust', 'kotlin', 'swift', 'php', 'r', 'matlab',
  ];

  const content = String(text || '').toLowerCase();
  const count = languageTerms.filter((term) => {
    if (term.includes('+') || term.includes('#')) {
      return content.includes(term);
    }
    return new RegExp(`\\b${term}\\b`, 'i').test(content);
  }).length;

  return Math.max(1, Math.min(8, count));
}

function extractResumeSignalsFromText(text) {
  const clean = normalizeText(text);
  if (!clean) {
    return {
      ok: false,
      error: 'Resume text is empty after extraction.',
    };
  }

  const inferred_name = inferName(text);
  const inferred_branch = inferBranch(text);
  const flags = inferSkillFlags(text);
  const internships = inferInternships(text);
  const no_of_projects = inferProjects(text);
  const no_of_programming_languages = inferProgrammingLanguages(text);

  return {
    ok: true,
    data: {
      inferred_name,
      inferred_branch,
      flags,
      internships,
      no_of_projects,
      no_of_programming_languages,
      source: 'resume-content-parser-v1',
    },
  };
}

module.exports = {
  extractResumeSignalsFromText,
};
