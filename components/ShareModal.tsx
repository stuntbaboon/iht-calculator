'use client';

import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { EstateState } from '@/types/iht';
import { X, Copy, Check, QrCode, Download, ExternalLink, Loader2 } from 'lucide-react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  state: EstateState;
}

export function ShareModal({ isOpen, onClose, state }: ShareModalProps) {
  const [data, setData] = useState<{
    loading: boolean;
    shareUrl: string;
    calculationId: string;
    qrCodeDataUrl: string;
    error: string | null;
  }>({
    loading: true,
    shareUrl: '',
    calculationId: '',
    qrCodeDataUrl: '',
    error: null,
  });
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;

    fetch('/api/calculations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ state }),
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to save calculation');
        return res.json();
      })
      .then(async (resData) => {
        if (!isMounted) return;
        const url = window.location.origin + `/c/${resData.id}`;

        let qr = '';
        try {
          qr = await QRCode.toDataURL(url, {
            width: 180,
            margin: 2,
            color: { dark: '#0f172a', light: '#ffffff' },
          });
        } catch (qrErr) {
          console.error('Failed to generate QR code:', qrErr);
        }

        if (!isMounted) return;
        setData({
          loading: false,
          shareUrl: url,
          calculationId: resData.id,
          qrCodeDataUrl: qr,
          error: null,
        });
      })
      .catch((err: unknown) => {
        if (!isMounted) return;
        const msg = err instanceof Error ? err.message : 'Error saving calculation';
        setData((prev) => ({
          ...prev,
          loading: false,
          error: msg,
        }));
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, state]);

  if (!isOpen) return null;

  const handleCopy = () => {
    if (!data.shareUrl) return;
    navigator.clipboard.writeText(data.shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(state, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `iht-calculation-${data.calculationId || 'draft'}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <QrCode className="w-5 h-5 text-blue-600" />
            Save & Share Calculation
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {data.loading ? (
            <div className="py-12 flex flex-col items-center justify-center space-y-3 text-slate-500">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              <p className="text-sm font-medium">Generating unique shareable link...</p>
            </div>
          ) : data.error ? (
            <div className="p-4 bg-rose-50 text-rose-800 rounded-xl text-sm border border-rose-200">
              {data.error}
            </div>
          ) : (
            <>
              <p className="text-xs text-slate-600 leading-relaxed">
                Your calculation has been securely saved. Anyone with this link can view and continue working on this calculation:
              </p>

              {/* Link Box */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={data.shareUrl}
                    className="w-full text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 select-all"
                  />
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shrink-0 shadow-xs"
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              </div>

              {/* QR Code */}
              {data.qrCodeDataUrl && (
                <div className="flex flex-col items-center justify-center pt-2 space-y-2">
                  <div className="p-2 bg-white border border-slate-200 rounded-xl shadow-xs">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={data.qrCodeDataUrl} alt="Scan to open calculation on mobile" className="w-36 h-36" />
                  </div>
                  <span className="text-[11px] text-slate-500">
                    Scan with a phone to view or share on mobile
                  </span>
                </div>
              )}

              {/* Download / Backup Option */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <button
                  type="button"
                  onClick={handleDownloadJson}
                  className="inline-flex items-center gap-1.5 text-slate-600 hover:text-slate-900 font-medium py-1"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download JSON Backup
                </button>
                <a
                  href={data.shareUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-semibold py-1"
                >
                  Open in New Tab
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
