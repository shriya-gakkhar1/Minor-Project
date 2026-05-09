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
  package: '',
  eligibility: '',
  branch: '',
  deadline: '',
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
    navigate('/dashboard');
  };

  return (
    <PageContainer>
      <SectionHeader title='Add Company' subtitle='Create a new campus drive in two-column format' />
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
            <label className='mb-1 block text-sm font-medium text-slate-700'>Branch</label>
            <Input value={form.branch} onChange={(event) => updateField('branch', event.target.value)} placeholder='CSE/IT' />
          </div>

          <div>
            <label className='mb-1 block text-sm font-medium text-slate-700'>Deadline</label>
            <Input type='date' value={form.deadline} onChange={(event) => updateField('deadline', event.target.value)} />
          </div>

          <div className='md:col-span-2 flex justify-end gap-2 pt-2'>
            <Button type='button' variant='secondary' onClick={() => navigate('/dashboard')}>
              Cancel
            </Button>
            <Button type='submit'>Save Company</Button>
          </div>
        </form>
      </Card>
    </PageContainer>
  );
}
