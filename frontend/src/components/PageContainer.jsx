import { cn } from '../lib/utils';

export default function PageContainer({ className, children }) {
  return <div className={cn('pf-enter mx-auto w-full max-w-[1360px] px-4 py-7 md:px-6 md:py-8', className)}>{children}</div>;
}
