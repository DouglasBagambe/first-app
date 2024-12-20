'use client';

import React, { useState, useEffect } from 'react';
import './styles.css'; // Import the stylesheet

interface Transaction {
  txHash: string;
  gasUsed: number;
}

interface GasData {
  remainingGas: number;
  history: Transaction[];
}

export default function Page() {
  const [gasInfo, setGasInfo] = useState<GasData>({
    remainingGas: 0,
    history: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGasData = async () => {
      try {
        const response = await fetch('/api/frame');
        if (!response.ok) {
          throw new Error('Failed to fetch gas data');
        }
        const data = await response.json();
        setGasInfo(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchGasData();
  }, []);

  if (loading) {
    return <p className="loading-text">Loading gas data...</p>;
  }

  if (error) {
    return <p className="error-text">Error: {error}</p>;
  }

  return (
    <div className="container">
      <h1 className="title">Base Chain Gas Tracker</h1>
      <div className="remaining-gas">
        <h2>Remaining Gas:</h2>
        <p className="gas-price">{gasInfo.remainingGas} Gwei</p>
      </div>
      <div className="transaction-history">
        <h2>Transaction History:</h2>
        <ul className="history-list">
          {gasInfo.history.length > 0 ? (
            gasInfo.history.map((item, index) => (
              <li key={index} className="history-item">
                Tx: <span className="tx-hash">{item.txHash}</span> - Gas Used:
                <span className="gas-used">{item.gasUsed} Gwei</span>
              </li>
            ))
          ) : (
            <li className="no-transactions">No transaction history available.</li>
          )}
        </ul>
      </div>
    </div>
  );
}
