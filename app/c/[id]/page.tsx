import { Suspense } from 'react';
import Link from 'next/link';
import { getCalculation } from '@/lib/storage';
import { SharedClientPage } from './SharedClientPage';
import { Calculator, ArrowLeft, Loader2 } from 'lucide-react';

interface PageProps {
  params: Promise<{ id: string }>;
}

async function CalculationLoader({ params }: PageProps) {
  const { id } = await params;
  const record = await getCalculation(id);

  if (!record) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-md border border-slate-200 p-8 text-center space-y-4">
          <div className="w-12 h-12 bg-amber-100 text-amber-700 rounded-2xl flex items-center justify-center mx-auto">
            <Calculator className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">Calculation Not Found</h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            The calculation ID <code className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-800">{id}</code> could not be found or may have expired.
          </p>
          <div className="pt-2">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors shadow-xs"
            >
              <ArrowLeft className="w-4 h-4" />
              Start New Calculation
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <SharedClientPage
      initialState={record.state}
      calculationId={record.id}
      savedDate={record.createdAt}
    />
  );
}

export default function CalculationPage({ params }: PageProps) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 space-y-3 text-slate-500">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <p className="text-sm font-medium">Loading saved calculation...</p>
        </div>
      }
    >
      <CalculationLoader params={params} />
    </Suspense>
  );
}
