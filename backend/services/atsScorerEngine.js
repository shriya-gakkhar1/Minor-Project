// ATS scoring engine for resume vs job description comparison.
// Scoring approach is inspired by open-source ATS matching patterns used in:
// - https://github.com/srbhr/Resume-Matcher (Apache-2.0)
// Adapted for this Node/Express project.

const STOP_WORDS = new Set([
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from', 'has', 'have', 'in', 'is', 'it',
  'of', 'on', 'or', 'that', 'the', 'to', 'was', 'were', 'will', 'with', 'your', 'you', 'our', 'we',
  'this', 'these', 'those', 'their', 'them', 'they', 'its', 'if', 'but', 'not', 'can', 'should',
  'must', 'about', 'into', 'over', 'under', 'using', 'used', 'use', 'job', 'role', 'candidate',
  'responsibility', 'responsibilities', 'qualification', 'qualifications', 'required', 'preferred',
  'experience', 'strong', 'good', 'excellent', 'ability', 'team', 'work', 'working', 'knowledge',
]);

const COMMON_SKILL_TERMS = [
  'python', 'java', 'javascript', 'typescript', 'c++', 'c#', 'go', 'rust', 'sql', 'nosql', 'mongodb',
  'postgresql', 'mysql', 'react', 'nextjs', 'node.js', 'node', 'express', 'fastapi', 'django',
  'spring', 'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'terraform', 'linux', 'git', 'github',
  'rest', 'api', 'microservices', 'html', 'css', 'tailwind', 'redux', 'pandas', 'numpy',
  'machine learning', 'deep learning', 'nlp', 'computer vision', 'power bi', 'tableau', 'excel',
  'spark', 'hadoop', 'ci/cd', 'jenkins', 'agile', 'jira', 'data structures', 'algorithms',
  'system design', 'oop', 'problem solving',
];

function normalizeSpace(text) {
  return String(text || '').replace(/\s+/g, ' ').trim();
}

function escapeRegex(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function keywordInText(keyword, text) {
  const key = normalizeSpace(keyword).toLowerCase();
  const content = String(text || '').toLowerCase();
  if (!key || !content) return false;

  if (/^[a-z0-9]+$/.test(key)) {
    return new RegExp(`\\b${escapeRegex(key)}\\b`, 'i').test(content);
  }

  return new RegExp(`(^|[^a-z0-9])${escapeRegex(key)}(?=[^a-z0-9]|$)`, 'i').test(content);
}

function tokenize(text) {
  return normalizeSpace(text)
    .toLowerCase()
    .split(/[^a-z0-9+#.]+/)
    .map((token) => token.trim())
    .filter((token) => token.length > 1 && !STOP_WORDS.has(token) && !/^\d+$/.test(token));
}

function buildFrequencyMap(tokens) {
  const map = new Map();
  tokens.forEach((token) => {
    map.set(token, (map.get(token) || 0) + 1);
  });
  return map;
}

function cosineSimilarity(textA, textB) {
  const tokensA = tokenize(textA);
  const tokensB = tokenize(textB);
  if (!tokensA.length || !tokensB.length) return 0;

  const freqA = buildFrequencyMap(tokensA);
  const freqB = buildFrequencyMap(tokensB);
  const dimensions = new Set([...freqA.keys(), ...freqB.keys()]);

  let dot = 0;
  let magA = 0;
  let magB = 0;

  dimensions.forEach((term) => {
    const a = freqA.get(term) || 0;
    const b = freqB.get(term) || 0;
    dot += a * b;
    magA += a * a;
    magB += b * b;
  });

  const denominator = Math.sqrt(magA) * Math.sqrt(magB);
  if (!denominator) return 0;

  return (dot / denominator) * 100;
}

function extractKeywordsFromJobDescription(jobDescription, targetRole = '') {
  const jd = String(jobDescription || '').toLowerCase();
  const role = String(targetRole || '').toLowerCase();
  const keywordSet = new Set();

  COMMON_SKILL_TERMS.forEach((term) => {
    if (keywordInText(term, jd)) keywordSet.add(term);
  });

  tokenize(`${role} ${jd}`).forEach((token) => {
    if (token.length >= 3) keywordSet.add(token);
  });

  return Array.from(keywordSet).slice(0, 90);
}

function calculateKeywordMatch(resumeText, jdKeywords) {
  const allKeywords = Array.from(new Set(jdKeywords.filter(Boolean)));
  if (!allKeywords.length) {
    return {
      score: 0,
      matchedKeywords: [],
      missingKeywords: [],
      totalKeywords: 0,
      matchedCount: 0,
    };
  }

  const matchedKeywords = allKeywords.filter((keyword) => keywordInText(keyword, resumeText));
  const missingKeywords = allKeywords.filter((keyword) => !matchedKeywords.includes(keyword));
  const score = (matchedKeywords.length / allKeywords.length) * 100;

  return {
    score,
    matchedKeywords,
    missingKeywords,
    totalKeywords: allKeywords.length,
    matchedCount: matchedKeywords.length,
  };
}

function extractYearsExperience(text) {
  const matches = [...String(text || '').matchAll(/(\d{1,2})\s*\+?\s*(years|year|yrs|yr)/gi)];
  if (!matches.length) return 0;

  return Math.max(...matches.map((match) => Number(match[1]) || 0));
}

function extractContactSignals(text) {
  const content = String(text || '');
  const email = content.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi)?.[0] || '';
  const phone = content.match(/(\+\d{1,3}[-\s]?)?\(?\d{3}\)?[-\s]?\d{3}[-\s]?\d{4}/g)?.[0] || '';

  return {
    email,
    phone,
    hasLinkedIn: /linkedin\.com\/in\//i.test(content),
    hasGithub: /github\.com\//i.test(content),
  };
}

function getSectionCompleteness(text) {
  const checks = {
    summary: /(summary|profile|objective)/i.test(text),
    experience: /(experience|employment|work history)/i.test(text),
    skills: /(skills|technical skills|competencies)/i.test(text),
    education: /(education|university|college|degree)/i.test(text),
    projects: /(projects|project experience)/i.test(text),
    certifications: /(certification|certifications|licenses)/i.test(text),
  };

  const sectionsFound = Object.entries(checks)
    .filter(([, value]) => value)
    .map(([key]) => key);

  const score = (sectionsFound.length / Object.keys(checks).length) * 100;
  return { score, sectionsFound, sectionChecks: checks };
}

function getFormatQualityScore(text, contactSignals) {
  const normalized = normalizeSpace(text);
  const wordCount = normalized ? normalized.split(' ').length : 0;
  const bulletCount = (String(text || '').match(/(^|\n)\s*[-*•]/g) || []).length;

  let score = 0;
  if (contactSignals.email) score += 20;
  if (contactSignals.phone) score += 15;
  if (contactSignals.hasLinkedIn) score += 10;
  if (contactSignals.hasGithub) score += 10;

  if (wordCount >= 250 && wordCount <= 1000) score += 25;
  else if (wordCount >= 150 && wordCount <= 1300) score += 15;

  if (bulletCount >= 4) score += 20;

  return {
    score: Math.min(score, 100),
    wordCount,
    bulletCount,
  };
}

function generateRecommendations({ keywordMatch, semanticScore, sectionInfo, formatInfo, missingKeywords }) {
  const recommendations = [];

  if (keywordMatch < 60) {
    recommendations.push(`Add role-critical keywords: ${missingKeywords.slice(0, 8).join(', ')}.`);
  }

  if (semanticScore < 50) {
    recommendations.push('Rewrite summary and experience bullets to mirror job-description language and outcomes.');
  }

  if (!sectionInfo.sectionChecks.skills) {
    recommendations.push('Add a dedicated Skills section with tools, frameworks, and domain strengths.');
  }

  if (!sectionInfo.sectionChecks.projects) {
    recommendations.push('Include 2-3 projects with impact metrics and stack details.');
  }

  if (formatInfo.wordCount < 220) {
    recommendations.push('Expand resume content with quantified achievements (impact, scale, ownership).');
  }

  if (formatInfo.wordCount > 1100) {
    recommendations.push('Reduce resume length and keep bullets concise for ATS readability.');
  }

  if (!recommendations.length) {
    recommendations.push('Strong ATS alignment. Keep tailoring for each role and update impact metrics regularly.');
  }

  return recommendations;
}

function scoreResumeAgainstJob({ resumeText, jobDescription, targetRole }) {
  const resume = String(resumeText || '');
  const jd = String(jobDescription || '');

  if (!normalizeSpace(resume)) {
    return { ok: false, error: 'Resume text could not be extracted.' };
  }

  if (!normalizeSpace(jd)) {
    return { ok: false, error: 'Job description is required for ATS scoring.' };
  }

  const jdKeywords = extractKeywordsFromJobDescription(jd, targetRole);
  const keywordStats = calculateKeywordMatch(resume, jdKeywords);

  const semanticScore = cosineSimilarity(resume, jd);
  const sectionInfo = getSectionCompleteness(resume);
  const contactSignals = extractContactSignals(resume);
  const formatInfo = getFormatQualityScore(resume, contactSignals);
  const yearsExperience = extractYearsExperience(resume);

  const overallScore = Math.round(
    keywordStats.score * 0.45 +
    semanticScore * 0.25 +
    sectionInfo.score * 0.2 +
    formatInfo.score * 0.1,
  );

  const grade = overallScore >= 80 ? 'A' : overallScore >= 68 ? 'B' : overallScore >= 55 ? 'C' : 'D';

  const recommendations = generateRecommendations({
    keywordMatch: keywordStats.score,
    semanticScore,
    sectionInfo,
    formatInfo,
    missingKeywords: keywordStats.missingKeywords,
  });

  return {
    ok: true,
    data: {
      overall_score: overallScore,
      grade,
      score_breakdown: {
        keyword_match: Number(keywordStats.score.toFixed(1)),
        semantic_similarity: Number(semanticScore.toFixed(1)),
        section_completeness: Number(sectionInfo.score.toFixed(1)),
        format_quality: Number(formatInfo.score.toFixed(1)),
      },
      keyword_stats: {
        total_keywords: keywordStats.totalKeywords,
        matched_count: keywordStats.matchedCount,
        matched_keywords: keywordStats.matchedKeywords,
        missing_keywords: keywordStats.missingKeywords,
      },
      extracted_profile: {
        email: contactSignals.email,
        phone: contactSignals.phone,
        has_linkedin: contactSignals.hasLinkedIn,
        has_github: contactSignals.hasGithub,
        years_experience: yearsExperience,
        sections_found: sectionInfo.sectionsFound,
        word_count: formatInfo.wordCount,
      },
      recommendations,
      source: 'ats-engine-resume-matcher-inspired-v1',
      attribution: {
        inspired_by: 'srbhr/Resume-Matcher',
        license: 'Apache-2.0',
      },
    },
  };
}

module.exports = {
  scoreResumeAgainstJob,
};
