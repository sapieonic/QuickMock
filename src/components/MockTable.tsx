'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Mock } from '@/lib/types';

const METHOD_COLORS: Record<string, string> = {
  GET: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
  POST: 'bg-blue-100 text-blue-700 border border-blue-200',
  PUT: 'bg-amber-100 text-amber-700 border border-amber-200',
  DELETE: 'bg-red-100 text-red-700 border border-red-200',
  PATCH: 'bg-violet-100 text-violet-700 border border-violet-200',
  HEAD: 'bg-slate-100 text-slate-700 border border-slate-200',
  OPTIONS: 'bg-orange-100 text-orange-700 border border-orange-200',
};

function buildCurl(mock: Mock): string {
  const host = window.location.host;
  const protocol = window.location.protocol;
  let url = `${protocol}//${host}/mock/${mock.route_path}`;

  // Append query params to URL if defined
  if (mock.query_params) {
    try {
      const params = JSON.parse(mock.query_params) as Record<string, string>;
      const qs = new URLSearchParams(params).toString();
      if (qs) url += `?${qs}`;
    } catch { /* ignore */ }
  }

  const parts: string[] = ['curl'];

  if (mock.method !== 'GET') {
    parts.push(`-X ${mock.method}`);
  }

  // Add request headers
  if (mock.request_headers) {
    try {
      const headers = JSON.parse(mock.request_headers) as Record<string, string>;
      for (const [key, value] of Object.entries(headers)) {
        parts.push(`-H '${key}: ${value}'`);
      }
    } catch { /* ignore */ }
  }

  parts.push(`'${url}'`);
  return parts.join(' \\\n  ');
}

interface MockTableProps {
  mocks: Mock[];
  onRefresh: () => void;
}

export default function MockTable({ mocks, onRefresh }: MockTableProps) {
  const router = useRouter();
  const { getIdToken } = useAuth();
  const [copiedId, setCopiedId] = useState<number | null>(null);

  async function handleToggle(id: number) {
    const token = await getIdToken();
    await fetch(`/api/mocks/${id}/toggle`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` },
    });
    onRefresh();
  }

  async function handleDelete(id: number, name: string) {
    if (!confirm(`Delete mock "${name}"?`)) return;
    const token = await getIdToken();
    await fetch(`/api/mocks/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    onRefresh();
  }

  async function handleCopyCurl(mock: Mock) {
    const curl = buildCurl(mock);
    await navigator.clipboard.writeText(curl);
    setCopiedId(mock.id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  if (mocks.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-16 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-indigo-50 flex items-center justify-center">
          <svg className="w-8 h-8 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
        </div>
        <p className="text-slate-600 font-medium">No mocks found</p>
        <p className="text-slate-400 text-sm mt-1">Get started by creating your first mock endpoint</p>
        <Link
          href="/mocks/new"
          className="inline-flex items-center gap-2 mt-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium shadow-md hover:shadow-lg transition-all"
        >
          + Create Mock
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <table className="w-full table-fixed divide-y divide-slate-200">
        <thead>
          <tr className="bg-slate-50">
            <th className="w-[70px] px-4 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
            <th className="w-[22%] px-4 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Name</th>
            <th className="w-[80px] px-4 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Method</th>
            <th className="px-4 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Route</th>
            <th className="w-[90px] px-4 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status Code</th>
            <th className="w-[200px] px-4 py-3.5 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {mocks.map((mock) => (
            <tr key={mock.id} className="hover:bg-indigo-50/40 transition-colors">
              <td className="px-4 py-4 whitespace-nowrap">
                <button
                  onClick={() => handleToggle(mock.id)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                    mock.is_active ? 'bg-emerald-500' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${
                      mock.is_active ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </td>
              <td className="px-4 py-4">
                <span className="block text-sm font-semibold text-slate-800 truncate" title={mock.name}>{mock.name}</span>
              </td>
              <td className="px-4 py-4 whitespace-nowrap">
                <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold ${METHOD_COLORS[mock.method] || 'bg-slate-100 text-slate-700'}`}>
                  {mock.method}
                </span>
              </td>
              <td className="px-4 py-4">
                <code className="block text-sm text-indigo-600 bg-indigo-50 px-2 py-1 rounded font-mono truncate" title={`/mock/${mock.route_path}`}>
                  /mock/{mock.route_path}
                </code>
              </td>
              <td className="px-4 py-4 whitespace-nowrap">
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                  mock.response_status_code >= 200 && mock.response_status_code < 300
                    ? 'bg-emerald-50 text-emerald-700'
                    : mock.response_status_code >= 400
                    ? 'bg-red-50 text-red-700'
                    : 'bg-amber-50 text-amber-700'
                }`}>
                  {mock.response_status_code}
                </span>
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-right space-x-1">
                <button
                  onClick={() => handleCopyCurl(mock)}
                  className={`inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-md border transition-colors ${
                    copiedId === mock.id
                      ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                      : 'text-slate-600 bg-slate-50 hover:bg-slate-100 border-slate-200'
                  }`}
                >
                  {copiedId === mock.id ? (
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  ) : (
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
                  )}
                  {copiedId === mock.id ? 'Copied!' : 'cURL'}
                </button>
                <button
                  onClick={() => router.push(`/mocks/${mock.id}/edit`)}
                  className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(mock.id, mock.name)}
                  className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 transition-colors"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
