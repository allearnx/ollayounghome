'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { supabase, Teacher, CourseCategory, CATEGORY_LABELS } from '@/lib/supabase';

export default function NewCoursePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [teachers, setTeachers] = useState<Teacher[]>([]);

  // 폼 상태
  const [category, setCategory] = useState<CourseCategory>('grammar');
  const [title, setTitle] = useState('');
  const [teacherId, setTeacherId] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [detailFiles, setDetailFiles] = useState<File[]>([]);
  const [detailPreviews, setDetailPreviews] = useState<string[]>([]);

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

  // 선생님 목록 불러오기
  useEffect(() => {
    const fetchTeachers = async () => {
      const { data, error } = await supabase
        .from('teachers')
        .select('*')
        .order('name');
      
      if (error) {
        console.error('Error fetching teachers:', error);
        return;
      }
      setTeachers(data || []);
    };

    if (!authLoading) {
      fetchTeachers();
    }
  }, [authLoading]);

  // 썸네일 파일 선택 핸들러
  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setThumbnailFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnailPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // 상세 이미지 파일 선택 핸들러 (여러 장)
  const handleDetailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const newFiles = Array.from(files);
      setDetailFiles(prev => [...prev, ...newFiles]);
      
      // 프리뷰 생성
      newFiles.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setDetailPreviews(prev => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  // 상세 이미지 삭제
  const removeDetailImage = (index: number) => {
    setDetailFiles(prev => prev.filter((_, i) => i !== index));
    setDetailPreviews(prev => prev.filter((_, i) => i !== index));
  };

  // 이미지 업로드 함수
  const uploadImage = async (file: File, folder: string): Promise<string | null> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

    const { error } = await supabase.storage
      .from('courses')
      .upload(fileName, file);

    if (error) {
      console.error('Upload error:', error);
      return null;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('courses')
      .getPublicUrl(fileName);

    return publicUrl;
  };

  // 폼 제출
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      alert('강의명을 입력해주세요.');
      return;
    }

    setIsLoading(true);

    try {
      // 이미지 업로드
      let thumbnailUrl = '';
      let detailImageUrl = '';

      if (thumbnailFile) {
        const url = await uploadImage(thumbnailFile, 'thumbnails');
        if (url) thumbnailUrl = url;
      }

      // 여러 상세 이미지 업로드
      if (detailFiles.length > 0) {
        const uploadedUrls: string[] = [];
        for (const file of detailFiles) {
          const url = await uploadImage(file, 'details');
          if (url) uploadedUrls.push(url);
        }
        detailImageUrl = JSON.stringify(uploadedUrls);
      }

      // 강의 데이터 저장
      const { error } = await supabase.from('courses').insert({
        title: title.trim(),
        category,
        description: description.trim(),
        price: parseInt(price) || 0,
        thumbnail_url: thumbnailUrl,
        detail_image_url: detailImageUrl,
        teacher_id: teacherId || null,
      });

      if (error) throw error;

      alert('강의가 등록되었습니다!');
      router.push('/admin/courses');
    } catch (error) {
      console.error('Error creating course:', error);
      alert('강의 등록 중 오류가 발생했습니다.');
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
                <h1 className="text-2xl font-bold text-slate-800">새 강의 등록</h1>
              </div>
            </div>
            <a
              href="/admin/courses"
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
            {/* 카테고리 */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                강의 카테고리 <span className="text-red-500">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as CourseCategory)}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-300 focus:border-violet-300 transition-all"
              >
                {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>

            {/* 강의명 */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                강의명 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="예: 해커스 중학영문법 1학년"
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-300 focus:border-violet-300 transition-all"
                required
              />
            </div>

            {/* 선생님 */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                담당 선생님
              </label>
              <select
                value={teacherId}
                onChange={(e) => setTeacherId(e.target.value)}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-300 focus:border-violet-300 transition-all"
              >
                <option value="">선생님 선택 (선택사항)</option>
                {teachers.map((teacher) => (
                  <option key={teacher.id} value={teacher.id}>{teacher.name}</option>
                ))}
              </select>
              {teachers.length === 0 && (
                <p className="mt-2 text-sm text-amber-600">
                  ⚠️ 등록된 선생님이 없습니다. 
                  <a href="/admin/teachers/new" className="underline ml-1">선생님 먼저 등록하기</a>
                </p>
              )}
            </div>

            {/* 수강료 */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                수강료 (원)
              </label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="예: 200000"
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-300 focus:border-violet-300 transition-all"
              />
            </div>

            {/* 강의 설명 */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                강의 한줄 설명
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="강의에 대한 간단한 설명을 입력하세요"
                rows={3}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-300 focus:border-violet-300 transition-all resize-none"
              />
            </div>

            {/* 썸네일 이미지 */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                썸네일 이미지
              </label>
              <div className="flex items-start gap-4">
                <div className="flex-1">
                  <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer hover:border-violet-400 hover:bg-violet-50/50 transition-all">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <svg className="w-10 h-10 text-slate-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p className="text-sm text-slate-500">클릭하여 이미지 업로드</p>
                      <p className="text-xs text-slate-400 mt-1">목록용 썸네일 (권장: 1280x720)</p>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleThumbnailChange}
                      className="hidden"
                    />
                  </label>
                </div>
                {thumbnailPreview && (
                  <div className="relative w-40 h-40 rounded-xl overflow-hidden border border-slate-200">
                    <img src={thumbnailPreview} alt="Thumbnail preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => { setThumbnailFile(null); setThumbnailPreview(null); }}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* 상세 이미지 (여러 장) */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                상세 설명 이미지 <span className="text-slate-400 font-normal">(여러 장 선택 가능)</span>
              </label>
              
              {/* 업로드 영역 */}
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer hover:border-violet-400 hover:bg-violet-50/50 transition-all mb-4">
                <div className="flex flex-col items-center justify-center">
                  <svg className="w-8 h-8 text-slate-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <p className="text-sm text-slate-500">클릭하여 이미지 추가</p>
                  <p className="text-xs text-slate-400 mt-1">여러 장을 한번에 선택하거나, 추가로 업로드할 수 있습니다</p>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleDetailChange}
                  className="hidden"
                />
              </label>

              {/* 이미지 프리뷰 목록 */}
              {detailPreviews.length > 0 && (
                <div className="space-y-3">
                  <p className="text-sm text-slate-500">
                    {detailPreviews.length}장의 이미지가 선택됨 
                    <span className="text-xs text-slate-400 ml-2">(드래그하여 순서 변경 불가, 삭제 후 재업로드)</span>
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {detailPreviews.map((preview, index) => (
                      <div key={index} className="relative aspect-[3/4] rounded-lg overflow-hidden border border-slate-200 group">
                        <img src={preview} alt={`Detail ${index + 1}`} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <button
                            type="button"
                            onClick={() => removeDetailImage(index)}
                            className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                        <div className="absolute top-2 left-2 px-2 py-0.5 bg-black/50 text-white text-xs rounded">
                          {index + 1}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 버튼 */}
          <div className="mt-8 flex gap-4">
            <button
              type="button"
              onClick={() => router.push('/admin/courses')}
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

