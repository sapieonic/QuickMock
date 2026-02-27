import MockForm from '@/components/MockForm';

export default function NewMockPage() {
  return (
    <div>
      <div className="mb-8 max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-800">Create New Mock</h1>
        <p className="text-slate-500 mt-1">Define a new mock endpoint for your API</p>
      </div>
      <MockForm mode="create" />
    </div>
  );
}
