'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { HTTP_METHODS, HttpMethod, Mock } from '@/lib/types';

interface MockFormProps {
  mock?: Mock;
  mode: 'create' | 'edit';
}

const METHOD_COLORS: Record<string, string> = {
  GET: 'bg-emerald-500',
  POST: 'bg-blue-500',
  PUT: 'bg-amber-500',
  DELETE: 'bg-red-500',
  PATCH: 'bg-violet-500',
  HEAD: 'bg-slate-500',
  OPTIONS: 'bg-orange-500',
};

export default function MockForm({ mock, mode }: MockFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState(mock?.name ?? '');
  const [routePath, setRoutePath] = useState(mock?.route_path ?? '');
  const [method, setMethod] = useState<HttpMethod>(mock?.method ?? 'GET');
  const [requestHeaders, setRequestHeaders] = useState(mock?.request_headers ?? '');
  const [queryParams, setQueryParams] = useState(mock?.query_params ?? '');
  const [responseStatusCode, setResponseStatusCode] = useState(mock?.response_status_code ?? 200);
  const [responseHeaders, setResponseHeaders] = useState(mock?.response_headers ?? '');
  const [responseBody, setResponseBody] = useState(mock?.response_body ?? '');
  const [isActive, setIsActive] = useState(mock ? !!mock.is_active : true);

  function validateJson(value: string, fieldName: string): boolean {
    if (!value.trim()) return true;
    try {
      JSON.parse(value);
      return true;
    } catch {
      setError(`${fieldName} must be valid JSON`);
      return false;
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!name.trim() || !routePath.trim()) {
      setError('Name and Route Path are required');
      return;
    }

    if (!validateJson(requestHeaders, 'Request Headers')) return;
    if (!validateJson(queryParams, 'Query Params')) return;
    if (!validateJson(responseHeaders, 'Response Headers')) return;

    setSaving(true);
    try {
      const payload = {
        name: name.trim(),
        route_path: routePath.trim(),
        method,
        request_headers: requestHeaders.trim() || null,
        query_params: queryParams.trim() || null,
        response_status_code: responseStatusCode,
        response_headers: responseHeaders.trim() || null,
        response_body: responseBody || null,
        is_active: isActive,
      };

      const url = mode === 'create' ? '/api/mocks' : `/api/mocks/${mock!.id}`;
      const httpMethod = mode === 'create' ? 'POST' : 'PUT';

      const res = await fetch(url, {
        method: httpMethod,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Something went wrong');
        return;
      }

      router.push('/');
      router.refresh();
    } catch {
      setError('Failed to save mock');
    } finally {
      setSaving(false);
    }
  }

  const inputClass = 'block w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-2.5 text-slate-800 placeholder-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 focus:bg-white sm:text-sm transition-all outline-none';
  const labelClass = 'block text-sm font-semibold text-slate-700 mb-1.5';
  const textareaClass = inputClass + ' font-mono text-xs';

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
          <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          {error}
        </div>
      )}

      {/* Request Configuration */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
        <h2 className="text-lg font-bold text-slate-800 mb-5 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-indigo-500" />
          Request Configuration
        </h2>

        <div className="space-y-5">
          <div>
            <label className={labelClass}>Name <span className="text-red-400">*</span></label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} className={inputClass} placeholder="e.g. Get Users List" />
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className={labelClass}>Route Path <span className="text-red-400">*</span></label>
              <div className="flex">
                <span className="inline-flex items-center rounded-l-lg border border-r-0 border-slate-300 bg-slate-100 px-3 text-slate-500 text-sm font-mono whitespace-nowrap">/mock/</span>
                <input type="text" value={routePath} onChange={(e) => setRoutePath(e.target.value)} className="block w-full min-w-0 rounded-none rounded-r-lg border border-slate-300 bg-slate-50 px-4 py-2.5 text-slate-800 placeholder-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 focus:bg-white sm:text-sm transition-all outline-none font-mono" placeholder="api/users" />
              </div>
            </div>
            <div className="w-36 flex-shrink-0">
              <label className={labelClass}>Method</label>
              <div className="relative">
                <span className={`absolute left-3 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full ${METHOD_COLORS[method]}`} />
                <select value={method} onChange={(e) => setMethod(e.target.value as HttpMethod)} className={inputClass + ' pl-8'}>
                  {HTTP_METHODS.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div>
            <label className={labelClass}>Request Headers <span className="text-slate-400 font-normal">(JSON, optional match criteria)</span></label>
            <textarea rows={3} value={requestHeaders} onChange={(e) => setRequestHeaders(e.target.value)} className={textareaClass} placeholder='{"Authorization": "Bearer token123"}' />
          </div>

          <div>
            <label className={labelClass}>Query Params <span className="text-slate-400 font-normal">(JSON, optional match criteria)</span></label>
            <textarea rows={3} value={queryParams} onChange={(e) => setQueryParams(e.target.value)} className={textareaClass} placeholder='{"page": "1", "limit": "10"}' />
          </div>
        </div>
      </div>

      {/* Response Configuration */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
        <h2 className="text-lg font-bold text-slate-800 mb-5 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          Response Configuration
        </h2>

        <div className="space-y-5">
          <div className="flex gap-4 items-end">
            <div className="w-36 flex-shrink-0">
              <label className={labelClass}>Status Code</label>
              <input type="number" min={100} max={599} value={responseStatusCode} onChange={(e) => setResponseStatusCode(Number(e.target.value))} className={inputClass} />
            </div>
            <div className="pb-2">
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="sr-only peer" />
                <div className="w-11 h-6 bg-slate-300 peer-focus:ring-2 peer-focus:ring-indigo-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:border-slate-300 after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500 after:shadow-sm" />
                <span className="ml-3 text-sm font-medium text-slate-700">Active</span>
              </label>
            </div>
          </div>

          <div>
            <label className={labelClass}>Response Headers <span className="text-slate-400 font-normal">(JSON)</span></label>
            <textarea rows={3} value={responseHeaders} onChange={(e) => setResponseHeaders(e.target.value)} className={textareaClass} placeholder='{"Content-Type": "application/json"}' />
          </div>

          <div>
            <label className={labelClass}>Response Body</label>
            <textarea rows={8} value={responseBody} onChange={(e) => setResponseBody(e.target.value)} className={textareaClass} placeholder='{"users": [{"id": 1, "name": "Alice"}]}' />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium shadow-md hover:shadow-lg hover:from-indigo-600 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? (
            <>
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Saving...
            </>
          ) : mode === 'create' ? 'Create Mock' : 'Update Mock'}
        </button>
        <button
          type="button"
          onClick={() => router.push('/')}
          className="inline-flex items-center px-6 py-2.5 rounded-lg text-sm font-medium text-slate-700 bg-white border border-slate-300 shadow-sm hover:bg-slate-50 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
