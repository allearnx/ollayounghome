const PAYMENT_URL = 'https://www.allrounderenglish.co.kr/login?next=%2F';

export default function SinaeSinPayButton() {
  return (
    <a
      href={PAYMENT_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-block w-full text-center px-8 py-4 rounded-2xl font-bold text-lg text-white bg-indigo-600 hover:bg-indigo-700 transition-all duration-200 hover:scale-[1.02]"
    >
      결제하기 →
    </a>
  );
}
