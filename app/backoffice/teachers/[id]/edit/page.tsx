'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import { supabase, Teacher, IMAGE_POSITION_OPTIONS } from '@/lib/supabase';

export default function EditTeacherPage() {
  const router = useRouter();
  const params = useParams();
  const teacherId = params.id as string;

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [notFound, setNotFound] = useState(false);
  
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [currentImageUrl, setCurrentImageUrl] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imagePosition, setImagePosition] = useState('center');

  useEffect(() => {
    const fetchTeacher = async () => {
      const { data, error } = await supabase
        .from('teachers')
        .select('*')
        .eq('id', teacherId)
        .single();

      if (error || !data) {
        console.error('Error fetching teacher:', error);
        setNotFound(true);
        setIsLoading(false);
        return;
      }

      setName(data.name);
      setBio(data.bio || '');
      setCurrentImageUrl(data.image_url || '');
      setImagePosition(data.image_position || 'center');
      setIsLoading(false);
    };

    if (teacherId) {
      fetchTeacher();
    }
  }, [teacherId]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      alert('선생님 이름을 입력해주세요.');
      return;
    }

    setIsSaving(true);

    try {
      let imageUrl = currentImageUrl;

      // 새 이미지가 있으면 업로드
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${teacherId}-${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('teachers')
          .upload(fileName, imageFile, { upsert: true });

        if (uploadError) {
          console.error('Upload error:', uploadError);
          alert('이미지 업로드에 실패했습니다.');
          setIsSaving(false);
          return;
        }

        const { data: urlData } = supabase.storage
          .from('teachers')
          .getPublicUrl(fileName);
        
        imageUrl = urlData.publicUrl;
      }

      // 선생님 데이터 수정
      const { error } = await supabase
        .from('teachers')
        .update({
          name: name.trim(),
          bio: bio.trim(),
          image_url: imageUrl,
          image_position: imagePosition,
        })
        .eq('id', teacherId);

      if (error) {
        console.error('Error updating teacher:', error);
        alert('선생님 정보 수정에 실패했습니다.');
        setIsSaving(false);
        return;
      }

      alert('선생님 정보가 수정되었습니다!');
      router.push('/backoffice/teachers');
    } catch (err) {
      console.error('Error:', err);
      alert('오류가 발생했습니다.');
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-violet-50/30 flex items-center justify-center">
        <svg className="animate-spin h-12 w-12 text-violet-500" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-violet-50/30 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-slate-100 rounded-full mb-6">
            <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-800 mb-2">선생님을 찾을 수 없습니다</h1>
          <p className="text-slate-500 mb-6">요청하신 선생님 정보가 존재하지 않습니다.</p>
          <a
            href="/backoffice/teachers"
            className="inline-block px-6 py-3 text-white bg-violet-500 hover:bg-violet-600 rounded-lg font-medium transition-colors"
          >
            목록으로 돌아가기
          </a>
        </div>
      </div>
    );
  }

  // 표시할 이미지 URL (새 이미지 프리뷰 > 기존 이미지)
  const displayImage = imagePreview || currentImageUrl;

  return (
    <div className="min-h-screen bg-violet-50/30">
      {/* 헤더 */}
      <header className="bg-white/90 backdrop-blur-lg border-b border-violet-100 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-5">
              <a href="/backoffice">
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
                <h1 className="text-2xl font-bold text-slate-800">선생님 정보 수정</h1>
              </div>
            </div>
            <a
              href="/backoffice/teachers"
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
                  {displayImage ? (
                    <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-violet-100">
                      <img 
                        src={displayImage} 
                        alt="Preview" 
                        className="w-full h-full object-cover"
                        style={{ objectPosition: imagePosition }}
                      />
                      {imagePreview && (
                        <button
                          type="button"
                          onClick={() => { setImageFile(null); setImagePreview(null); }}
                          className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="w-32 h-32 rounded-full bg-violet-100 flex items-center justify-center border-4 border-violet-50">
                      <svg className="w-12 h-12 text-violet-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                  )}
                  
                  {/* 위치 조정 */}
                  {displayImage && (
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
                      <p className="text-sm text-slate-500">클릭하여 새 이미지 업로드</p>
                      <p className="text-xs text-slate-400 mt-1">기존 이미지를 교체합니다</p>
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
                placeholder="선생님 이름을 입력하세요"
                className="w-full px-4 py-3 text-base border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-300 focus:border-violet-400 transition-all"
                required
              />
            </div>

            {/* 소개 */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                소개글
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="선생님 소개글을 입력하세요 (경력, 전문분야 등)"
                rows={5}
                className="w-full px-4 py-3 text-base border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-300 focus:border-violet-400 transition-all resize-none"
              />
            </div>

            {/* 버튼 */}
            <div className="flex gap-3 pt-4">
              <a
                href="/backoffice/teachers"
                className="flex-1 py-3.5 text-center text-base font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              >
                취소
              </a>
              <button
                type="submit"
                disabled={isSaving}
                className="flex-1 py-3.5 text-base font-semibold text-white bg-gradient-to-r from-violet-400 to-purple-400 hover:from-violet-500 hover:to-purple-500 rounded-xl transition-all shadow-md shadow-violet-200 disabled:opacity-50"
              >
                {isSaving ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    저장 중...
                  </span>
                ) : '저장하기'}
              </button>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}




