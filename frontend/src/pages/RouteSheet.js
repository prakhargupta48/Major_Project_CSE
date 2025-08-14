import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { QRCodeCanvas } from 'qrcode.react';
import OptimizationService from '../services/optimization.service';

const RouteSheet = () => {
  const { id } = useParams();
  const [optimization, setOptimization] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await OptimizationService.get(id);
        setOptimization(data);
      } catch (e) {
        // noop
      }
    })();
  }, [id]);

  useEffect(() => {
    document.body.classList.add('print-friendly');
    return () => document.body.classList.remove('print-friendly');
  }, []);

  if (!optimization) return <div className="container mx-auto px-6 py-8">Loading...</div>;

  const link = `${window.location.origin}/optimizations/${id}`;

  return (
    <div className="container mx-auto px-6 py-8">
      <h1 className="text-2xl font-bold mb-6">Route Sheets: {optimization.name}</h1>
      <button className="btn btn-outline mb-6" onClick={() => window.print()}>Print</button>
      <div className="grid md:grid-cols-2 gap-6">
        {optimization.routes.map((route, idx) => (
          <div key={idx} className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-sm">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="text-lg font-semibold">Vehicle: {route.vehicleName || `Route ${idx+1}`}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Stops: {route.stops.length}</div>
              </div>
              <div className="w-24 h-24">
                <QRCodeCanvas value={link} size={96} includeMargin bgColor="#ffffff" fgColor="#111827" />
              </div>
            </div>
            <ol className="list-decimal pl-5 space-y-1 text-sm">
              {route.stops.map((s, i) => (
                <li key={i}>
                  {s.locationName} {s.demand ? `(Demand: ${s.demand})` : ''}
                </li>
              ))}
            </ol>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RouteSheet;