import React, { useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { toast } from 'sonner';
import { Html5QrcodeScanner, Html5QrcodeScanType } from 'html5-qrcode';

export const BarcodeDialog = () => {
  useEffect(() => {
    const platform = Capacitor.getPlatform();

    if (platform !== 'web') {
      toast.info(`Rodando na plataforma: ${platform}`);
    }

    const scanner = new Html5QrcodeScanner(
      'reader',
      {
        fps: 10,
        qrbox: 250,
        supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA],
      },
      false
    );

    scanner.render(
      (decodedText, decodedResult) => {
        console.log('Código lido:', decodedText);
        toast.success(`Código: ${decodedText}`);
        scanner.clear();
      },
      (errorMessage) => {
        console.warn('Erro ao escanear', errorMessage);
      }
    );

    return () => {
      scanner.clear().catch((err) => {
        console.error('Erro ao limpar scanner:', err);
      });
    };
  }, []);

  return <div id="reader" style={{ width: '100%' }} />;
};
