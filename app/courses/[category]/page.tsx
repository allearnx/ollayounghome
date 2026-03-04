import { notFound } from 'next/navigation';
import CourseCategoryPage from '@/components/CourseCategoryPage';
import { isCourseCategory } from '@/lib/courseCategoryConfig';

export default async function DynamicCategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  if (!isCourseCategory(category)) {
    notFound();
  }
  return <CourseCategoryPage category={category} />;
}
