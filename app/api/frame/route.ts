import { NextResponse } from 'next/server';
import axios from 'axios';

const ETHERSCAN_API_KEY = '75283E1SG7GNYY3VH3YU13XSPDGDTYI1NZ'; // Etherscan API key

export async function GET() {
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

    // Fetching transaction history
    const response = await axios.get('https://api.etherscan.io/api', {
      params: {
        module: 'account',
        action: 'txlist',
        address: '0xA22Ec001DB5c3624d970A0F9Ce1492E101815a94', // Wallet address
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
