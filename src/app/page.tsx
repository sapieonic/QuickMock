'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { HTTP_METHODS, Mock } from '@/lib/types';
import MockTable from '@/components/MockTable';

export default function Dashboard() {
  const [mocks, setMocks] = useState<Mock[]>([]);
  const [search, setSearch] = useState('');
  const [methodFilter, setMethodFilter] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchMocks = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (methodFilter) params.set('method', methodFilter);
    const res = await fetch(`/api/mocks?${params.toString()}`);
    const data = await res.json();
    setMocks(data);
    setLoading(false);
  }, [search, methodFilter]);

  useEffect(() => {
    fetchMocks();
  }, [fetchMocks]);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Mock Endpoints</h1>
          <p className="text-slate-500 mt-1">Manage your API mock definitions</p>
        </div>
        <Link
          href="/mocks/new"
          className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium shadow-md hover:shadow-lg hover:from-indigo-600 hover:to-purple-700 transition-all"
        >
          + New Mock
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 mb-6">
        <div className="flex gap-4">
          <div className="relative flex-1 max-w-md">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search by name or route..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="block w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 bg-slate-50 text-slate-800 placeholder-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 focus:bg-white sm:text-sm transition-all outline-none"
            />
          </div>
          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            className="rounded-lg border border-slate-300 bg-slate-50 text-slate-700 px-4 py-2.5 sm:text-sm focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
          >
            <option value="">All Methods</option>
            {HTTP_METHODS.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-16 text-center">
          <div className="inline-block w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
          <p className="mt-3 text-slate-500 text-sm">Loading mocks...</p>
        </div>
      ) : (
        <MockTable mocks={mocks} onRefresh={fetchMocks} />
      )}
    </div>
  );
}
