import { cn } from '../lib/utils';

export default function PageContainer({ className, children }) {
  return <div className={cn('mx-auto w-full max-w-[1280px] px-4 py-6 md:px-6', className)}>{children}</div>;
}
