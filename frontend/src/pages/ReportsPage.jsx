import Card from '../components/Card';
import PageContainer from '../components/PageContainer';
import SectionHeader from '../components/SectionHeader';

export default function ReportsPage() {
  return (
    <PageContainer>
      <SectionHeader
        title='Reporting & Statistics'
        subtitle='Activity dashboard, API and third-party integrations are available through migration and analytics modules.'
      />
      <Card>
        <p className='text-sm text-slate-600'>
          Use the dashboard charts and students page filters to generate operational reports. This view is ready for future PDF,
          PPT, and scheduled report exports.
        </p>
      </Card>
    </PageContainer>
  );
}
