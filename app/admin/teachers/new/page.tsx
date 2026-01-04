'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { supabase, IMAGE_POSITION_OPTIONS } from '@/lib/supabase';

export default function NewTeacherPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  // 폼 상태
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imagePosition, setImagePosition] = useState('center');

  // 인증 확인
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
        return;
      }
      setAuthLoading(false);
    };
    checkAuth();
  }, [router]);

  // 이미지 파일 선택 핸들러
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // 이미지 업로드 함수
  const uploadImage = async (file: File): Promise<string | null> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

    const { error } = await supabase.storage
      .from('teachers')
      .upload(fileName, file);

    if (error) {
      console.error('Upload error:', error);
      return null;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('teachers')
      .getPublicUrl(fileName);

    return publicUrl;
  };

  // 폼 제출
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      alert('이름을 입력해주세요.');
      return;
    }

    setIsLoading(true);

    try {
      // 이미지 업로드
      let imageUrl = '';
      if (imageFile) {
        const url = await uploadImage(imageFile);
        if (url) imageUrl = url;
      }

      // 선생님 데이터 저장
      const { error } = await supabase.from('teachers').insert({
        name: name.trim(),
        bio: bio.trim(),
        image_url: imageUrl,
        image_position: imagePosition,
      });

      if (error) throw error;

      alert('선생님이 등록되었습니다!');
      router.push('/admin/teachers');
    } catch (error) {
      console.error('Error creating teacher:', error);
      alert('등록 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-violet-50/30 flex items-center justify-center">
        <div className="text-center">
          <svg className="animate-spin h-12 w-12 text-violet-500 mx-auto mb-4" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p className="text-slate-600">인증 확인 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-violet-50/30">
      {/* 헤더 */}
      <header className="bg-white/90 backdrop-blur-lg border-b border-violet-100 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-5">
              <a href="/admin">
                <Image
                  src="/logo.png"
                  alt="올라영"
                  width={180}
                  height={60}
                  className="h-16 w-auto"
                />
              </a>
              <div className="hidden sm:block h-8 w-px bg-slate-200"></div>
              <div className="hidden sm:block">
                <h1 className="text-2xl font-bold text-slate-800">새 선생님 등록</h1>
              </div>
            </div>
            <a
              href="/admin/teachers"
              className="flex items-center gap-2 px-5 py-2.5 text-base font-medium text-slate-600 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              목록으로
            </a>
          </div>
        </div>
      </header>

      {/* 메인 */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-violet-100 shadow-sm p-6 md:p-8">
          <div className="space-y-6">
            {/* 프로필 사진 */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                프로필 사진
              </label>
              <div className="flex items-start gap-6">
                {/* 프리뷰 */}
                <div className="flex-shrink-0">
                  {imagePreview ? (
                    <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-violet-100">
                      <img 
                        src={imagePreview} 
                        alt="Preview" 
                        className="w-full h-full object-cover"
                        style={{ objectPosition: imagePosition }}
                      />
                      <button
                        type="button"
                        onClick={() => { setImageFile(null); setImagePreview(null); }}
                        className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ) : (
                    <div className="w-32 h-32 rounded-full bg-violet-100 flex items-center justify-center border-4 border-violet-50">
                      <svg className="w-12 h-12 text-violet-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                  )}
                  
                  {/* 위치 조정 */}
                  {imagePreview && (
                    <div className="mt-3">
                      <label className="block text-xs text-slate-500 mb-1">사진 위치</label>
                      <select
                        value={imagePosition}
                        onChange={(e) => setImagePosition(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-violet-300"
                      >
                        {IMAGE_POSITION_OPTIONS.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
                
                {/* 업로드 버튼 */}
                <div className="flex-1">
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer hover:border-violet-400 hover:bg-violet-50/50 transition-all">
                    <div className="flex flex-col items-center justify-center">
                      <svg className="w-8 h-8 text-slate-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <p className="text-sm text-slate-500">클릭하여 이미지 업로드</p>
                      <p className="text-xs text-slate-400 mt-1">권장: 정사각형 (400x400)</p>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>

            {/* 이름 */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                이름 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="예: 안홍미"
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-300 focus:border-violet-300 transition-all"
                required
              />
            </div>

            {/* 상세 소개 */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                상세 소개
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="선생님의 경력, 전문 분야, 교육 철학 등을 자유롭게 입력하세요.&#10;&#10;줄바꿈도 가능합니다."
                rows={8}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-300 focus:border-violet-300 transition-all resize-none"
              />
            </div>
          </div>

          {/* 버튼 */}
          <div className="mt-8 flex gap-4">
            <button
              type="button"
              onClick={() => router.push('/admin/teachers')}
              className="flex-1 py-3 border border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 py-3 bg-gradient-to-r from-violet-400 to-purple-400 hover:from-violet-500 hover:to-purple-500 text-white font-semibold rounded-xl transition-all shadow-lg shadow-violet-200 disabled:opacity-50"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  등록 중...
                </span>
              ) : (
                '등록하기'
              )}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}

