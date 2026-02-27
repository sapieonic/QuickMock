'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import MockForm from '@/components/MockForm';
import { Mock } from '@/lib/types';

export default function EditMockPage() {
  const params = useParams();
  const [mock, setMock] = useState<Mock | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMock() {
      const res = await fetch(`/api/mocks/${params.id}`);
      if (!res.ok) {
        setError('Mock not found');
        setLoading(false);
        return;
      }
      const data = await res.json();
      setMock(data);
      setLoading(false);
    }
    fetchMock();
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
        <p className="mt-3 text-slate-500 text-sm">Loading mock...</p>
      </div>
    );
  }

  if (error || !mock) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-red-200 p-12 text-center max-w-md mx-auto">
        <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-red-50 flex items-center justify-center">
          <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <p className="text-red-600 font-medium">{error || 'Mock not found'}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8 max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-800">Edit Mock</h1>
        <p className="text-slate-500 mt-1">Editing <span className="font-medium text-slate-700">{mock.name}</span></p>
      </div>
      <MockForm mock={mock} mode="edit" />
    </div>
  );
}
