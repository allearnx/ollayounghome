import { MetadataRoute } from 'next';

const BASE_URL = 'https://home.allrounderenglish.co.kr';

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages = [
    { url: `${BASE_URL}/`, priority: 1.0, changeFrequency: 'weekly' as const },
    { url: `${BASE_URL}/about`, priority: 0.8, changeFrequency: 'monthly' as const },
    { url: `${BASE_URL}/curriculum`, priority: 0.8, changeFrequency: 'monthly' as const },
    { url: `${BASE_URL}/schedule`, priority: 0.8, changeFrequency: 'weekly' as const },
    { url: `${BASE_URL}/teachers`, priority: 0.7, changeFrequency: 'monthly' as const },
    { url: `${BASE_URL}/faq`, priority: 0.6, changeFrequency: 'monthly' as const },
    { url: `${BASE_URL}/reviews`, priority: 0.7, changeFrequency: 'weekly' as const },
    { url: `${BASE_URL}/allkill`, priority: 0.9, changeFrequency: 'weekly' as const },
    { url: `${BASE_URL}/courses/grammar`, priority: 0.8, changeFrequency: 'monthly' as const },
    { url: `${BASE_URL}/courses/school_exam`, priority: 0.9, changeFrequency: 'monthly' as const },
    { url: `${BASE_URL}/courses/reading`, priority: 0.8, changeFrequency: 'monthly' as const },
    { url: `${BASE_URL}/courses/international`, priority: 0.8, changeFrequency: 'monthly' as const },
    { url: `${BASE_URL}/courses/voca`, priority: 0.8, changeFrequency: 'monthly' as const },
    { url: `${BASE_URL}/privacy`, priority: 0.3, changeFrequency: 'yearly' as const },
    { url: `${BASE_URL}/terms`, priority: 0.3, changeFrequency: 'yearly' as const },
  ];

  return staticPages.map((page) => ({
    url: page.url,
    lastModified: new Date(),
    changeFrequency: page.changeFrequency,
    priority: page.priority,
  }));
}
