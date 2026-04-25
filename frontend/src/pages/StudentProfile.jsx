import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePlacementStore } from '../store/usePlacementStore';
import { updateStudentProfile } from '../services/studentService';
import PageContainer from '../components/PageContainer';
import SectionHeader from '../components/SectionHeader';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';

export default function StudentProfile() {
  const navigate = useNavigate();
  const currentStudentId = usePlacementStore((state) => state.currentStudentId);
  const students = usePlacementStore((state) => state.students);
  const refreshData = usePlacementStore((state) => state.refreshData);

  const currentStudent = students.find((student) => student.id === currentStudentId);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    cgpa: '',
    branch: '',
  });
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (currentStudent) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData({
        name: currentStudent.name || '',
        email: currentStudent.email || '',
        phone: currentStudent.phone || '',
        cgpa: currentStudent.cgpa || '',
        branch: currentStudent.branch || '',
      });
    }
  }, [currentStudent]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const result = updateStudentProfile(currentStudentId, {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      cgpa: parseFloat(formData.cgpa) || 0,
      branch: formData.branch,
    });

    if (result.ok) {
      refreshData();
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setIsEditing(false);
    } else {
      setMessage({ type: 'error', text: result.error || 'Failed to update profile' });
    }

    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  const handleCancel = () => {
    if (currentStudent) {
      setFormData({
        name: currentStudent.name || '',
        email: currentStudent.email || '',
        phone: currentStudent.phone || '',
        cgpa: currentStudent.cgpa || '',
        branch: currentStudent.branch || '',
      });
    }
    setIsEditing(false);
    setMessage({ type: '', text: '' });
  };

  if (!currentStudent) {
    return (
      <PageContainer>
        <SectionHeader title='Profile Not Found' subtitle='Please login again' />
        <Button onClick={() => navigate('/')}>Go to Login</Button>
      </PageContainer>
    );
  }

  return (
    <PageContainer className='space-y-6'>
      <SectionHeader
        title='Student Profile'
        subtitle='View and update your personal information'
      />

      {message.text && (
        <div
          className={`rounded-xl px-4 py-3 text-sm ${
            message.type === 'success'
              ? 'bg-green-50 text-green-700 border border-green-200'
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}
        >
          {message.text}
        </div>
      )}

      <Card>
        <div className='flex items-center justify-between mb-6'>
          <h3 className='text-lg font-semibold text-slate-900'>Personal Information</h3>
          {!isEditing && (
            <Button size='sm' variant='secondary' onClick={() => setIsEditing(true)}>
              Edit Profile
            </Button>
          )}
        </div>

        <form onSubmit={handleSubmit} className='space-y-4'>
          <div className='grid gap-4 md:grid-cols-2'>
            <div>
              <label className='block text-sm font-medium text-slate-700 mb-1.5'>
                Full Name
              </label>
              <Input
                type='text'
                name='name'
                value={formData.name}
                onChange={handleChange}
                disabled={!isEditing}
                placeholder='Enter your name'
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-slate-700 mb-1.5'>
                Email Address
              </label>
              <Input
                type='email'
                name='email'
                value={formData.email}
                onChange={handleChange}
                disabled={!isEditing}
                placeholder='Enter your email'
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-slate-700 mb-1.5'>
                Phone Number
              </label>
              <Input
                type='tel'
                name='phone'
                value={formData.phone}
                onChange={handleChange}
                disabled={!isEditing}
                placeholder='Enter your phone number'
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-slate-700 mb-1.5'>
                CGPA
              </label>
              <Input
                type='number'
                name='cgpa'
                value={formData.cgpa}
                onChange={handleChange}
                disabled={!isEditing}
                placeholder='Enter your CGPA'
                step='0.1'
                min='0'
                max='10'
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-slate-700 mb-1.5'>
                Branch
              </label>
              <Input
                type='text'
                name='branch'
                value={formData.branch}
                onChange={handleChange}
                disabled={!isEditing}
                placeholder='e.g., CSE, IT, ECE'
              />
            </div>
          </div>

          {isEditing && (
            <div className='flex gap-3 pt-4'>
              <Button type='submit' size='sm'>
                Update Profile
              </Button>
              <Button type='button' size='sm' variant='secondary' onClick={handleCancel}>
                Cancel
              </Button>
            </div>
          )}
        </form>
      </Card>
    </PageContainer>
  );
}
