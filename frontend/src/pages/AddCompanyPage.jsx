import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import Card from '../components/Card';
import Input from '../components/Input';
import PageContainer from '../components/PageContainer';
import SectionHeader from '../components/SectionHeader';
import { usePlacementStore } from '../store/usePlacementStore';

const initialForm = {
  name: '',
  role: '',
  description: '',
  requiredSkills: '',
  preferredSkills: '',
  preferredCertifications: '',
  preferredTechnologies: '',
  internshipPreference: 'Preferred',
  package: '',
  eligibility: '',
  branch: '',
  deadline: '',
  status: 'Open',
};

export default function AddCompanyPage() {
  const navigate = useNavigate();
  const addCompany = usePlacementStore((state) => state.addCompany);
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState('');

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const result = addCompany(form);
    if (!result.ok) {
      setError(result.error);
      return;
    }

    setError('');
    setForm(initialForm);
    navigate('/tpo/dashboard');
  };

  return (
    <PageContainer>
      <SectionHeader title='Post Company Opening' subtitle='Create a role with eligibility, package, skills, and matching requirements.' />
      <Card>
        <form className='grid gap-4 md:grid-cols-2' onSubmit={handleSubmit}>
          {error ? <p className='md:col-span-2 text-sm text-rose-600'>{error}</p> : null}
          <div>
            <label className='mb-1 block text-sm font-medium text-slate-700'>Company Name</label>
            <Input value={form.name} onChange={(event) => updateField('name', event.target.value)} required />
          </div>

          <div>
            <label className='mb-1 block text-sm font-medium text-slate-700'>Role</label>
            <Input value={form.role} onChange={(event) => updateField('role', event.target.value)} required />
          </div>

          <div className='md:col-span-2'>
            <label className='mb-1 block text-sm font-medium text-slate-700'>Role Description</label>
            <textarea
              value={form.description}
              onChange={(event) => updateField('description', event.target.value)}
              placeholder='Short summary of responsibilities, selection process, and expectations.'
              className='min-h-[120px] w-full rounded-xl border border-white/10 bg-slate-950/70 p-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-teal-300 focus:ring-2 focus:ring-teal-300/20'
            />
          </div>

          <div>
            <label className='mb-1 block text-sm font-medium text-slate-700'>Package (LPA)</label>
            <Input
              type='number'
              min='0'
              step='0.1'
              value={form.package}
              onChange={(event) => updateField('package', event.target.value)}
              required
            />
          </div>

          <div>
            <label className='mb-1 block text-sm font-medium text-slate-700'>CGPA Eligibility</label>
            <Input
              type='number'
              min='0'
              max='10'
              step='0.1'
              value={form.eligibility}
              onChange={(event) => updateField('eligibility', event.target.value)}
              required
            />
          </div>

          <div>
            <label className='mb-1 block text-sm font-medium text-slate-700'>Eligible Branches</label>
            <Input value={form.branch} onChange={(event) => updateField('branch', event.target.value)} placeholder='CSE, IT, ECE or All' />
          </div>

          <div>
            <label className='mb-1 block text-sm font-medium text-slate-700'>Deadline</label>
            <Input type='date' value={form.deadline} onChange={(event) => updateField('deadline', event.target.value)} />
          </div>

          <div>
            <label className='mb-1 block text-sm font-medium text-slate-700'>Required Skills</label>
            <Input value={form.requiredSkills} onChange={(event) => updateField('requiredSkills', event.target.value)} placeholder='DSA, React, SQL' />
          </div>

          <div>
            <label className='mb-1 block text-sm font-medium text-slate-700'>Preferred Skills</label>
            <Input value={form.preferredSkills} onChange={(event) => updateField('preferredSkills', event.target.value)} placeholder='Docker, Cloud, System Design' />
          </div>

          <div>
            <label className='mb-1 block text-sm font-medium text-slate-700'>Preferred Certifications</label>
            <Input value={form.preferredCertifications} onChange={(event) => updateField('preferredCertifications', event.target.value)} placeholder='AWS, Azure, NPTEL, Coursera' />
          </div>

          <div>
            <label className='mb-1 block text-sm font-medium text-slate-700'>Preferred Technologies</label>
            <Input value={form.preferredTechnologies} onChange={(event) => updateField('preferredTechnologies', event.target.value)} placeholder='Docker, Git, PostgreSQL, Firebase' />
          </div>

          <div>
            <label className='mb-1 block text-sm font-medium text-slate-700'>Internship Preference</label>
            <select
              value={form.internshipPreference}
              onChange={(event) => updateField('internshipPreference', event.target.value)}
              className='h-10 w-full rounded-xl border border-white/10 bg-slate-950/70 px-3 text-sm text-slate-100 outline-none focus:border-teal-300 focus:ring-2 focus:ring-teal-300/20'
            >
              <option>Not Required</option>
              <option>Preferred</option>
              <option>Required</option>
            </select>
          </div>

          <div>
            <label className='mb-1 block text-sm font-medium text-slate-700'>Drive Status</label>
            <select
              value={form.status}
              onChange={(event) => updateField('status', event.target.value)}
              className='h-10 w-full rounded-xl border border-white/10 bg-slate-950/70 px-3 text-sm text-slate-100 outline-none focus:border-teal-300 focus:ring-2 focus:ring-teal-300/20'
            >
              <option>Open</option>
              <option>Screening</option>
              <option>Interviewing</option>
              <option>Closed</option>
            </select>
          </div>

          <div className='md:col-span-2 flex justify-end gap-2 pt-2'>
            <Button type='button' variant='secondary' onClick={() => navigate('/tpo/dashboard')}>
              Cancel
            </Button>
            <Button type='submit'>Post Opening</Button>
          </div>
        </form>
      </Card>
    </PageContainer>
  );
}
