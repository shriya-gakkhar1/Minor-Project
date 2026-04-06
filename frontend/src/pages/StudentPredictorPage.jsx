import { useMemo, useState } from 'react';
import { BrainCircuit, CheckCircle2, FileUp, Gauge, Sparkles, Target } from 'lucide-react';
import Button from '../components/Button';
import Card from '../components/Card';
import Input from '../components/Input';
import PageContainer from '../components/PageContainer';
import SectionHeader from '../components/SectionHeader';
import { parseResumeSignals, predictStudentPlacement, recommendSkills } from '../services/predictionService';
import { usePlacementStore } from '../store/usePlacementStore';

const SKILL_FIELDS = [
  { key: 'dsa', label: 'DSA' },
  { key: 'web_dev', label: 'Web Development' },
  { key: 'machine_learning', label: 'Machine Learning' },
  { key: 'cloud', label: 'Cloud' },
  { key: 'mobile_dev', label: 'Mobile Dev' },
];

const PRESETS = [
  {
    id: 'job-ready',
    label: 'Job-ready',
    payload: {
      tier: 1,
      cgpa: 8.8,
      internships: 2,
      no_of_projects: 4,
      no_of_programming_languages: 4,
      dsa: 1,
      web_dev: 1,
      machine_learning: 1,
      cloud: 1,
      mobile_dev: 0,
      is_participate_hackathon: 1,
      is_participated_extracurricular: 1,
    },
  },
  {
    id: 'balanced',
    label: 'Balanced',
    payload: {
      tier: 2,
      cgpa: 7.6,
      internships: 1,
      no_of_projects: 3,
      no_of_programming_languages: 3,
      dsa: 1,
      web_dev: 1,
      machine_learning: 0,
      cloud: 0,
      mobile_dev: 0,
      is_participate_hackathon: 0,
      is_participated_extracurricular: 1,
    },
  },
  {
    id: 'needs-boost',
    label: 'Needs boost',
    payload: {
      tier: 3,
      cgpa: 6.8,
      internships: 0,
      no_of_projects: 1,
      no_of_programming_languages: 2,
      dsa: 0,
      web_dev: 0,
      machine_learning: 0,
      cloud: 0,
      mobile_dev: 0,
      is_participate_hackathon: 0,
      is_participated_extracurricular: 0,
    },
  },
];

function toNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function getReadinessScore(payload) {
  const cgpaScore = clamp((toNumber(payload.cgpa, 0) / 10) * 36, 0, 36);
  const internshipScore = clamp(toNumber(payload.internships, 0) * 8, 0, 16);
  const projectScore = clamp(toNumber(payload.no_of_projects, 0) * 5, 0, 20);
  const languageScore = clamp(toNumber(payload.no_of_programming_languages, 0) * 2, 0, 8);

  const skillFlags = ['dsa', 'web_dev', 'machine_learning', 'cloud', 'mobile_dev'];
  const skillScore = skillFlags.reduce((sum, key) => sum + (toNumber(payload[key], 0) ? 4 : 0), 0);

  return Math.round(clamp(cgpaScore + internshipScore + projectScore + languageScore + skillScore, 0, 100));
}

function getConfidenceBand(probability) {
  if (probability >= 75) return { label: 'High confidence', color: 'text-emerald-700', badge: 'bg-emerald-50 border-emerald-200 text-emerald-700' };
  if (probability >= 55) return { label: 'Moderate confidence', color: 'text-amber-700', badge: 'bg-amber-50 border-amber-200 text-amber-700' };
  return { label: 'Low confidence', color: 'text-rose-700', badge: 'bg-rose-50 border-rose-200 text-rose-700' };
}

export default function StudentPredictorPage() {
  const students = usePlacementStore((state) => state.students);
  const currentStudentId = usePlacementStore((state) => state.currentStudentId);
  const savedPrediction = usePlacementStore((state) => state.studentPrediction);
  const savedSkills = usePlacementStore((state) => state.studentSkillSuggestions);
  const setStudentPredictionResult = usePlacementStore((state) => state.setStudentPredictionResult);
  const currentStudent = students.find((student) => student.id === currentStudentId);

  const [form, setForm] = useState({
    name: currentStudent?.name || '',
    branch: currentStudent?.branch || 'CSE',
    tier: 2,
    cgpa: currentStudent?.cgpa || 7.5,
    inter_gpa: 8,
    ssc_gpa: 8,
    internships: 0,
    no_of_projects: 2,
    is_participate_hackathon: 0,
    is_participated_extracurricular: 0,
    no_of_programming_languages: 2,
    dsa: 0,
    web_dev: 0,
    machine_learning: 0,
    cloud: 0,
    mobile_dev: 0,
  });

  const [loading, setLoading] = useState(false);
  const [resumeHint, setResumeHint] = useState('');
  const [prediction, setPrediction] = useState(savedPrediction);
  const [skills, setSkills] = useState(savedSkills || []);
  const [skillSource, setSkillSource] = useState(savedSkills?.length ? 'cached' : 'not-run');
  const [error, setError] = useState('');
  const [lastRunAt, setLastRunAt] = useState(null);

  const profilePayload = useMemo(() => ({
    tier: toNumber(form.tier, 2),
    cgpa: toNumber(form.cgpa, 0),
    inter_gpa: toNumber(form.inter_gpa, 0),
    ssc_gpa: toNumber(form.ssc_gpa, 0),
    internships: toNumber(form.internships, 0),
    no_of_projects: toNumber(form.no_of_projects, 0),
    is_participate_hackathon: toNumber(form.is_participate_hackathon, 0),
    is_participated_extracurricular: toNumber(form.is_participated_extracurricular, 0),
    no_of_programming_languages: toNumber(form.no_of_programming_languages, 0),
    dsa: toNumber(form.dsa, 0),
    web_dev: toNumber(form.web_dev, 0),
    machine_learning: toNumber(form.machine_learning, 0),
    cloud: toNumber(form.cloud, 0),
    mobile_dev: toNumber(form.mobile_dev, 0),
    branch: form.branch || 'CSE',
  }), [form]);

  const readinessScore = useMemo(() => getReadinessScore(profilePayload), [profilePayload]);

  const profileCompleteness = useMemo(() => {
    let filled = 0;
    const checks = [
      String(form.name || '').trim().length > 0,
      String(form.branch || '').trim().length > 0,
      toNumber(form.cgpa, 0) > 0,
      toNumber(form.no_of_projects, 0) > 0,
      toNumber(form.no_of_programming_languages, 0) > 0,
      ['dsa', 'web_dev', 'machine_learning', 'cloud', 'mobile_dev'].some((key) => toNumber(form[key], 0) > 0),
    ];

    checks.forEach((ok) => {
      if (ok) filled += 1;
    });

    return Math.round((filled / checks.length) * 100);
  }, [form]);

  const confidence = useMemo(
    () => getConfidenceBand(Number(prediction?.placement_probability || 0)),
    [prediction?.placement_probability],
  );

  const runPrediction = async () => {
    setLoading(true);
    setError('');

    try {
      const [predictResult, skillResult] = await Promise.all([
        predictStudentPlacement(profilePayload),
        recommendSkills(profilePayload),
      ]);

      setPrediction(predictResult);
      setSkills(skillResult.recommended_skills || []);
      setSkillSource(skillResult.source || 'backend-ml');
      setStudentPredictionResult(predictResult, skillResult.recommended_skills || []);
      setLastRunAt(new Date().toISOString());
    } catch (predictError) {
      setError(predictError.message || 'Unable to run student prediction.');
      setPrediction(null);
      setSkills([]);
      setSkillSource('not-run');
      setStudentPredictionResult(null, []);
    } finally {
      setLoading(false);
    }
  };

  const handleResumeUpload = async (file) => {
    setError('');

    try {
      const signals = await parseResumeSignals(file);
      setForm((prev) => ({
        ...prev,
        name: signals.inferred_name || prev.name,
        branch: signals.inferred_branch || prev.branch,
        internships: signals.internships ?? prev.internships,
        no_of_projects: signals.no_of_projects ?? prev.no_of_projects,
        no_of_programming_languages: signals.no_of_programming_languages ?? prev.no_of_programming_languages,
        dsa: signals.flags?.dsa ?? prev.dsa,
        web_dev: signals.flags?.web_dev ?? prev.web_dev,
        machine_learning: signals.flags?.machine_learning ?? prev.machine_learning,
        cloud: signals.flags?.cloud ?? prev.cloud,
      }));
      setResumeHint(`Resume parsed from ${signals.source}. Please review values before predicting.`);
    } catch (resumeError) {
      setError(resumeError.message || 'Unable to parse resume. Fill details manually.');
    }
  };

  const applyPreset = (presetId) => {
    const preset = PRESETS.find((item) => item.id === presetId);
    if (!preset) return;

    setForm((prev) => ({
      ...prev,
      ...preset.payload,
    }));
    setResumeHint(`Preset applied: ${preset.label}. Fine-tune and run prediction.`);
  };

  const actionSteps = (skills || []).length
    ? skills.slice(0, 4)
    : (prediction?.top_improvement_factors || []).slice(0, 4);

  return (
    <PageContainer className='space-y-6'>
      <SectionHeader
        title='Student Predictor'
        subtitle='Phase 3: behavior-focused placement simulation with clearer guidance, confidence signaling, and action-first recommendations.'
      />

      <div className='grid gap-4 md:grid-cols-3'>
        <Card className='border-indigo-100 bg-gradient-to-br from-indigo-50 to-white'>
          <div className='flex items-center justify-between'>
            <p className='text-sm font-medium text-slate-600'>Readiness Score</p>
            <Gauge className='h-4 w-4 text-indigo-600' />
          </div>
          <p className='mt-2 text-3xl font-bold text-indigo-700'>{readinessScore}/100</p>
          <p className='mt-1 text-xs text-slate-500'>Quick self-check before running the model.</p>
        </Card>

        <Card>
          <div className='flex items-center justify-between'>
            <p className='text-sm font-medium text-slate-600'>Profile Completeness</p>
            <CheckCircle2 className='h-4 w-4 text-emerald-600' />
          </div>
          <p className='mt-2 text-3xl font-bold text-slate-900'>{profileCompleteness}%</p>
          <div className='mt-3 h-2 rounded-full bg-slate-100'>
            <div className='h-2 rounded-full bg-emerald-500' style={{ width: `${profileCompleteness}%` }} />
          </div>
        </Card>

        <Card>
          <div className='flex items-center justify-between'>
            <p className='text-sm font-medium text-slate-600'>Prediction State</p>
            <BrainCircuit className='h-4 w-4 text-slate-700' />
          </div>
          <p className='mt-2 text-xl font-semibold text-slate-900'>{prediction ? 'Model executed' : 'Awaiting run'}</p>
          <p className='mt-1 text-xs text-slate-500'>
            {lastRunAt ? `Last run: ${new Date(lastRunAt).toLocaleTimeString()}` : 'Run prediction to generate personalized action steps.'}
          </p>
        </Card>
      </div>

      <div className='grid gap-4 xl:grid-cols-3'>
        <Card>
          <h3 className='text-base font-semibold text-slate-900'>Step 1: Quick Setup</h3>
          <p className='mt-1 text-sm text-slate-500'>Start with resume or preset profile to reduce manual typing friction.</p>

          <label className='mt-4 flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 px-6 py-8 text-center transition hover:border-indigo-300 hover:bg-indigo-50'>
            <FileUp className='h-6 w-6 text-slate-500' />
            <span className='mt-2 text-sm font-medium text-slate-700'>Upload Resume (PDF/DOC)</span>
            <input
              type='file'
              accept='.pdf,.doc,.docx,.txt'
              className='hidden'
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) void handleResumeUpload(file);
              }}
            />
          </label>

          <div className='mt-4 space-y-2'>
            <p className='text-xs font-semibold uppercase tracking-wide text-slate-500'>Scenario Presets</p>
            <div className='flex flex-wrap gap-2'>
              {PRESETS.map((preset) => (
                <Button key={preset.id} size='sm' variant='secondary' onClick={() => applyPreset(preset.id)}>
                  {preset.label}
                </Button>
              ))}
            </div>
          </div>

          {resumeHint ? <p className='mt-3 text-xs text-emerald-700'>{resumeHint}</p> : null}
          {error ? <p className='mt-3 text-xs text-rose-600'>{error}</p> : null}
        </Card>

        <Card className='xl:col-span-2'>
          <h3 className='text-base font-semibold text-slate-900'>Step 2: Student Profile Inputs</h3>
          <p className='mt-1 text-sm text-slate-500'>Use realistic values. Better quality input gives better recommendation quality.</p>

          <div className='mt-4 grid gap-3 md:grid-cols-3'>
            <Input placeholder='Student Name' value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
            <Input placeholder='Branch' value={form.branch} onChange={(e) => setForm((p) => ({ ...p, branch: e.target.value }))} />
            <Input type='number' min='1' max='3' step='1' placeholder='Tier' value={form.tier} onChange={(e) => setForm((p) => ({ ...p, tier: e.target.value }))} />
            <Input type='number' min='0' max='10' step='0.1' placeholder='CGPA' value={form.cgpa} onChange={(e) => setForm((p) => ({ ...p, cgpa: e.target.value }))} />
            <Input type='number' min='0' max='10' step='0.1' placeholder='Inter GPA' value={form.inter_gpa} onChange={(e) => setForm((p) => ({ ...p, inter_gpa: e.target.value }))} />
            <Input type='number' min='0' max='10' step='0.1' placeholder='SSC GPA' value={form.ssc_gpa} onChange={(e) => setForm((p) => ({ ...p, ssc_gpa: e.target.value }))} />
            <Input type='number' min='0' step='1' placeholder='Internships' value={form.internships} onChange={(e) => setForm((p) => ({ ...p, internships: e.target.value }))} />
            <Input type='number' min='0' step='1' placeholder='Projects' value={form.no_of_projects} onChange={(e) => setForm((p) => ({ ...p, no_of_projects: e.target.value }))} />
            <Input type='number' min='0' step='1' placeholder='Programming Languages' value={form.no_of_programming_languages} onChange={(e) => setForm((p) => ({ ...p, no_of_programming_languages: e.target.value }))} />
            <Input type='number' min='0' max='1' step='1' placeholder='Hackathon (0/1)' value={form.is_participate_hackathon} onChange={(e) => setForm((p) => ({ ...p, is_participate_hackathon: e.target.value }))} />
            <Input type='number' min='0' max='1' step='1' placeholder='Extracurricular (0/1)' value={form.is_participated_extracurricular} onChange={(e) => setForm((p) => ({ ...p, is_participated_extracurricular: e.target.value }))} />
            <Input type='number' min='0' max='1' step='1' placeholder='Mobile Dev (0/1)' value={form.mobile_dev} onChange={(e) => setForm((p) => ({ ...p, mobile_dev: e.target.value }))} />
          </div>

          <div className='mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3'>
            <p className='mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500'>Skill Flags</p>
            <div className='grid gap-2 sm:grid-cols-3'>
              {SKILL_FIELDS.map((field) => (
                <button
                  key={field.key}
                  type='button'
                  onClick={() => setForm((prev) => ({ ...prev, [field.key]: Number(prev[field.key]) ? 0 : 1 }))}
                  className={`inline-flex items-center justify-between rounded-xl border px-3 py-2 text-sm transition ${Number(form[field.key])
                    ? 'border-indigo-300 bg-indigo-50 text-indigo-700'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span>{field.label}</span>
                  <span className='text-xs font-semibold'>{Number(form[field.key]) ? 'ON' : 'OFF'}</span>
                </button>
              ))}
            </div>
          </div>

          <div className='mt-4 flex flex-wrap items-center gap-2'>
            <Button onClick={runPrediction} disabled={loading}>
              <Sparkles className='h-4 w-4' />
              {loading ? 'Predicting...' : 'Step 3: Run Student Prediction'}
            </Button>
            <span className='text-xs text-slate-500'>Human-focused flow: fill profile, run model, follow next-best actions.</span>
          </div>
        </Card>
      </div>

      {prediction ? (
        <div className='grid gap-4 lg:grid-cols-4'>
          <Card className='lg:col-span-2 border-indigo-100 bg-gradient-to-r from-indigo-50 to-white'>
            <p className='text-sm text-slate-500'>Placement Probability</p>
            <p className='mt-2 text-3xl font-bold text-indigo-700'>{prediction.placement_probability}%</p>
            <div className='mt-3 h-2 rounded-full bg-indigo-100'>
              <div
                className='h-2 rounded-full bg-indigo-600'
                style={{ width: `${Math.max(0, Math.min(100, Number(prediction.placement_probability || 0)))}%` }}
              />
            </div>
            <div className={`mt-3 inline-flex rounded-full border px-2 py-1 text-xs font-semibold ${confidence.badge}`}>
              {confidence.label}
            </div>
            <p className='mt-2 text-xs text-slate-500'>Model: {prediction.model_used}</p>
          </Card>

          <Card>
            <p className='text-sm text-slate-500'>Predicted Salary</p>
            <p className='mt-2 text-3xl font-bold text-emerald-700'>{prediction.predicted_salary} LPA</p>
          </Card>

          <Card>
            <p className='text-sm text-slate-500'>Placement Decision</p>
            <p className={`mt-2 text-3xl font-bold ${prediction.is_placed ? 'text-emerald-700' : 'text-rose-700'}`}>
              {prediction.is_placed ? 'Likely Placed' : 'Needs Improvement'}
            </p>
          </Card>

          <Card>
            <p className='text-sm text-slate-500'>Readiness vs Outcome</p>
            <p className='mt-2 text-3xl font-bold text-slate-900'>{readinessScore}%</p>
            <p className={`mt-1 text-xs font-semibold ${confidence.color}`}>Current profile trend: {confidence.label}</p>
          </Card>
        </div>
      ) : null}

      {prediction ? (
        <div className='grid gap-4 lg:grid-cols-2'>
          <Card>
            <SectionHeader title='Top Improvement Factors' subtitle='Highest-impact areas from prediction model.' />
            <div className='space-y-2'>
              {(prediction.top_improvement_factors || []).map((factor) => (
                <p key={factor} className='rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700'>
                  {factor}
                </p>
              ))}
            </div>
          </Card>

          <Card>
            <SectionHeader title='Recommended Skills' subtitle='Action plan generated from current profile gaps.' />
            <div className='space-y-2'>
              {(skills || []).length ? (
                skills.map((item) => (
                  <p key={item} className='rounded-xl border border-indigo-200 bg-indigo-50 p-3 text-sm text-indigo-800'>
                    {item}
                  </p>
                ))
              ) : (
                <p className='rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700'>
                  No critical skill gaps detected. Continue advanced practice and mock interviews.
                </p>
              )}
            </div>
            <p className='mt-3 text-xs text-slate-500'>Recommendation source: {skillSource}</p>
          </Card>

          <Card>
            <SectionHeader title='Next Best Actions' subtitle='Prioritized for easier weekly execution.' />
            <div className='space-y-2'>
              {actionSteps.length ? (
                actionSteps.map((step) => (
                  <p key={step} className='rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-700'>
                    {step}
                  </p>
                ))
              ) : (
                <p className='rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600'>
                  Run prediction to generate your next action list.
                </p>
              )}
            </div>
          </Card>

          <Card>
            <SectionHeader title='Decision Psychology Layer' subtitle='Built for clarity, motivation, and low-friction action.' />
            <div className='space-y-2 text-sm text-slate-700'>
              <p className='rounded-xl border border-slate-200 bg-slate-50 p-3'>
                <Target className='mr-2 inline h-4 w-4 text-indigo-600' />
                Show confidence bands first to reduce ambiguity in decision making.
              </p>
              <p className='rounded-xl border border-slate-200 bg-slate-50 p-3'>
                <Gauge className='mr-2 inline h-4 w-4 text-emerald-600' />
                Use readiness score to anchor progress and increase action adherence.
              </p>
              <p className='rounded-xl border border-slate-200 bg-slate-50 p-3'>
                <BrainCircuit className='mr-2 inline h-4 w-4 text-slate-700' />
                Present only top actions to avoid cognitive overload.
              </p>
            </div>
          </Card>
        </div>
      ) : null}
    </PageContainer>
  );
}
