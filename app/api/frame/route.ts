import { NextResponse } from 'next/server';
import axios from 'axios';

const ETHERSCAN_API_KEY = '75283E1SG7GNYY3VH3YU13XSPDGDTYI1NZ'; // Etherscan API key

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const wallet = searchParams.get('wallet');

  if (!wallet) {
    return NextResponse.json({ error: 'Wallet address is required' }, { status: 400 });
  }

  try {
    // Fetching the current gas price in gwei from Etherscan
    const gasPriceResponse = await axios.get('https://api.etherscan.io/api', {
      params: {
        module: 'proxy',
        action: 'eth_gasPrice',
        apikey: ETHERSCAN_API_KEY,
      },
    });

    // Gas price is returned in Wei, convert to Gwei
    const gasPriceInWei = parseInt(gasPriceResponse.data.result, 16);
    const gasPriceInGwei = gasPriceInWei / 10 ** 9; // Convert Wei to Gwei

    // Fetching transaction history for the provided wallet
    const response = await axios.get('https://api.etherscan.io/api', {
      params: {
        module: 'account',
        action: 'txlist',
        address: wallet, // Use wallet dynamically
        startblock: 0,
        endblock: 99999999,
        sort: 'asc',
        apikey: ETHERSCAN_API_KEY,
      },
    });

    const transactions = response.data.result.map((tx: any) => ({
      txHash: tx.hash,
      gasUsed: parseInt(tx.gasUsed, 10),
    }));

    // Construct the response with gas data and transaction history
    const gasData = {
      remainingGas: gasPriceInGwei, // Current gas price in Gwei
      history: transactions,
    };

    return NextResponse.json(gasData);
  } catch (error) {
    console.error('Error fetching gas data:', error);
    return NextResponse.json({ error: 'Failed to fetch gas data' }, { status: 500 });
  }
}
