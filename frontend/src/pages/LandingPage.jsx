import {
  ArrowRight,
  BarChart3,
  BrainCircuit,
  CheckCircle2,
  FileSearch,
  MessagesSquare,
  Sparkles,
  Target,
  UploadCloud,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';

const features = [
  { title: 'Recruitment Intelligence', text: 'Analyze branches, companies, skills, packages, and conversion with decision-ready charts.', icon: BarChart3 },
  { title: 'Resume Match Predictor', text: 'Compare student profiles against role requirements and explain missing skills clearly.', icon: FileSearch },
  { title: 'AI Mock Interviews', text: 'Generate role-aware HR, technical, behavioral, and project questions with feedback.', icon: MessagesSquare },
  { title: 'Placement Readiness', text: 'Give each student a roadmap with readiness score, weak areas, and next best actions.', icon: Target },
];

const stats = [
  ['84%', 'readiness lift'],
  ['6.8 LPA', 'avg package tracked'],
  ['128', 'profiles analyzed'],
  ['24', 'active drives'],
];

const MotionDiv = motion.div;
const MotionArticle = motion.article;

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <main className='min-h-screen overflow-hidden bg-slate-950 text-white'>
      <nav className='mx-auto flex max-w-7xl items-center justify-between px-4 py-5 sm:px-6 lg:px-8'>
        <div className='flex items-center gap-3'>
          <div className='rounded-xl bg-teal-300 p-2 text-slate-950'>
            <BrainCircuit className='h-5 w-5' />
          </div>
          <div>
            <p className='text-sm font-bold tracking-wide'>Placify AI</p>
            <p className='text-xs text-slate-500'>Placement readiness platform</p>
          </div>
        </div>
        <div className='flex items-center gap-2'>
          <Button variant='ghost' onClick={() => navigate('/login')} className='text-slate-200 hover:bg-white/10'>
            Sign in
          </Button>
          <Button onClick={() => navigate('/login')}>
            Open Dashboard
            <ArrowRight className='h-4 w-4' />
          </Button>
        </div>
      </nav>

      <section className='relative mx-auto grid max-w-7xl items-center gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1.04fr_0.96fr] lg:px-8 lg:py-20'>
        <div className='pointer-events-none absolute inset-x-0 top-[-24rem] h-[42rem] bg-[radial-gradient(circle,rgba(45,212,191,0.18),transparent_62%)]' />
        <MotionDiv initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }} className='relative'>
          <span className='inline-flex items-center gap-2 rounded-full border border-teal-300/20 bg-teal-300/10 px-3 py-1 text-xs font-semibold text-teal-100'>
            <Sparkles className='h-3.5 w-3.5' />
            AI-powered placement intelligence for colleges
          </span>
          <h1 className='mt-6 max-w-4xl text-5xl font-semibold leading-[1.02] tracking-tight text-white md:text-7xl'>
            Turn placement data into readiness, matches, and confident decisions.
          </h1>
          <p className='mt-6 max-w-2xl text-base leading-7 text-slate-300 md:text-lg'>
            Placify AI helps TPOs manage drives and helps students improve job readiness through analytics, resume scoring, match prediction, and mock interviews.
          </p>
          <div className='mt-8 flex flex-wrap gap-3'>
            <Button size='lg' onClick={() => navigate('/login')}>
              Try Demo
              <ArrowRight className='h-4 w-4' />
            </Button>
            <Button size='lg' variant='secondary' onClick={() => navigate('/login')} className='border-white/10 bg-white/5 text-white hover:bg-white/10'>
              View Student Portal
            </Button>
          </div>
        </MotionDiv>

        <MotionDiv
          initial={{ opacity: 0, y: 24, rotateX: 8 }}
          animate={{ opacity: 1, y: 0, rotateX: 0 }}
          transition={{ duration: 0.55, delay: 0.1 }}
          className='relative rounded-2xl border border-white/10 bg-white/[0.04] p-4 shadow-2xl backdrop-blur'
        >
          <div className='rounded-xl border border-white/10 bg-slate-900/90 p-4'>
            <div className='flex items-center justify-between border-b border-white/10 pb-4'>
              <div>
                <p className='text-xs uppercase tracking-[0.18em] text-teal-200'>Command Center</p>
                <h2 className='mt-1 text-xl font-semibold'>Recruitment Intelligence</h2>
              </div>
              <span className='rounded-full bg-emerald-400/10 px-3 py-1 text-xs text-emerald-200'>Live Demo</span>
            </div>
            <div className='mt-4 grid grid-cols-2 gap-3'>
              {stats.map(([value, label]) => (
                <div key={label} className='rounded-lg border border-white/10 bg-white/[0.04] p-4'>
                  <p className='text-2xl font-bold'>{value}</p>
                  <p className='text-xs text-slate-500'>{label}</p>
                </div>
              ))}
            </div>
            <div className='mt-4 rounded-xl border border-white/10 bg-slate-950 p-4'>
              <div className='mb-3 flex items-center justify-between text-xs text-slate-400'>
                <span>Branch placement trend</span>
                <span>2026</span>
              </div>
              <div className='flex h-40 items-end gap-3'>
                {[48, 72, 64, 88, 55, 78, 92].map((height, index) => (
                  <div key={height + index} className='flex flex-1 items-end rounded-t-md bg-gradient-to-t from-teal-500/40 to-sky-400' style={{ height: `${height}%` }} />
                ))}
              </div>
            </div>
          </div>
        </MotionDiv>
      </section>

      <section className='mx-auto grid max-w-7xl gap-4 px-4 py-10 sm:px-6 md:grid-cols-2 lg:grid-cols-4 lg:px-8'>
        {features.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <MotionArticle
              key={feature.title}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              className='rounded-2xl border border-white/10 bg-white/[0.035] p-5 transition hover:-translate-y-1 hover:bg-white/[0.06]'
            >
              <Icon className='h-5 w-5 text-teal-200' />
              <h3 className='mt-4 text-base font-semibold'>{feature.title}</h3>
              <p className='mt-2 text-sm leading-6 text-slate-400'>{feature.text}</p>
            </MotionArticle>
          );
        })}
      </section>

      <section className='mx-auto grid max-w-7xl gap-5 px-4 py-10 sm:px-6 lg:grid-cols-3 lg:px-8'>
        <PreviewCard title='Resume Parsing' icon={UploadCloud} lines={['Skills extracted', 'Projects mapped', 'ATS score generated']} />
        <PreviewCard title='Job Match Engine' icon={Target} lines={['Weighted score', 'Missing skills', 'Hiring probability']} />
        <PreviewCard title='Mock Interview' icon={MessagesSquare} lines={['Role questions', 'Timer + chat', 'Feedback summary']} />
      </section>

      <section className='mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8'>
        <div className='rounded-3xl border border-teal-300/20 bg-gradient-to-br from-teal-300/15 to-sky-400/10 p-8 text-center'>
          <h2 className='text-3xl font-semibold md:text-4xl'>Built for a fast, impressive college demo.</h2>
          <p className='mx-auto mt-3 max-w-2xl text-sm leading-6 text-slate-300'>
            Local demo data works instantly. Gemini-powered interviews activate when an API key is configured.
          </p>
          <Button size='lg' className='mt-6' onClick={() => navigate('/login')}>
            Launch Placify AI
            <ArrowRight className='h-4 w-4' />
          </Button>
        </div>
      </section>

      <footer className='border-t border-white/10 px-4 py-8 text-center text-xs text-slate-500'>
        Placify AI — Placement Readiness and Recruitment Intelligence Platform
      </footer>
    </main>
  );
}

function PreviewCard({ title, icon, lines }) {
  const PreviewIcon = icon;
  return (
    <div className='rounded-2xl border border-white/10 bg-white/[0.035] p-5'>
      <div className='flex items-center gap-3'>
        <span className='rounded-xl bg-teal-300/10 p-2 text-teal-100'>
          <PreviewIcon className='h-5 w-5' />
        </span>
        <h3 className='font-semibold'>{title}</h3>
      </div>
      <div className='mt-4 space-y-2'>
        {lines.map((line) => (
          <p key={line} className='flex items-center gap-2 text-sm text-slate-400'>
            <CheckCircle2 className='h-4 w-4 text-emerald-300' />
            {line}
          </p>
        ))}
      </div>
    </div>
  );
}
