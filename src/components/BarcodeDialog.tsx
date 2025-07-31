import React from 'react';
import { isPlatform } from '@capacitor/core';

const ScannerComponent: React.FC = () => {
  const startBarcodeScan = async () => {
    // Executa apenas em Android/iOS
    if (!isPlatform('android') && !isPlatform('ios')) {
      simulateBarcodeScan(); // fallback no navegador
      return;
    }

    try {
      // Importação dinâmica segura
      const { BarcodeScanner } = await import('@capacitor-community/barcode-scanner');

      // Solicita permissão (force = true abre popup se necessário)
      const permission = await BarcodeScanner.checkPermission({ force: true });
      if (!permission.granted) {
        alert('Permissão não concedida.');
        return;
      }

      // Inicia o escaneamento
      const result = await BarcodeScanner.startScan();
      if (result.hasContent) {
        console.log("Código escaneado:", result.content);
        alert(`Código escaneado: ${result.content}`);
      } else {
        alert("Nenhum conteúdo detectado.");
      }
    } catch (error) {
      console.error("Erro ao escanear:", error);
      alert("Erro ao escanear o código.");
    }
  };

  // Simulação no navegador
  const simulateBarcodeScan = () => {
    const input = prompt("Digite manualmente o código de barras:");
    if (input) {
      console.log("Código simulado:", input);
      alert(`Código simulado: ${input}`);
    }
  };

  return (
    <div>
      <h2>Leitor de Código de Barras</h2>
      <button onClick={startBarcodeScan}>Escanear</button>
    </div>
  );
};

export default ScannerComponent;
