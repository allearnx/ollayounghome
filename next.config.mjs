/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: '/cs-center/qa',
        destination: '/faq',
        permanent: true,
      },
      {
        source: '/curriculum/full-lecture',
        destination: '/curriculum',
        permanent: true,
      },
      {
        source: '/page/shop/lms-detail',
        destination: '/',
        permanent: true,
      },
      {
        source: '/curriculum/grammar',
        destination: '/courses/grammar',
        permanent: true,
      },
      {
        source: '/curriculum/word',
        destination: '/courses/voca',
        permanent: true,
      },
      {
        source: '/page/member/login',
        destination: '/login',
        permanent: true,
      },
      {
        source: '/leveltest',
        destination: 'https://leveltest.allrounderenglish.co.kr',
        permanent: false,
      },
      {
        source: '/leveltest/:path*',
        destination: 'https://leveltest.allrounderenglish.co.kr/:path*',
        permanent: false,
      },
    ];
  },
};

export default nextConfig;





