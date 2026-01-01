// MFAPI Service - Free Indian Mutual Fund Data
// API: https://api.mfapi.in

export interface MutualFund {
    schemeCode: number;
    schemeName: string;
}

export interface MutualFundDetails {
    meta: {
        fund_house: string;
        scheme_type: string;
        scheme_category: string;
        scheme_code: string;
        scheme_name: string;
    };
    data: Array<{
        date: string;
        nav: string;
    }>;
}

const MFAPI_BASE_URL = 'https://api.mfapi.in';

/**
 * Search mutual funds by name
 * Fetches directly from API to avoid sessionStorage quota errors
 */
export async function searchMutualFunds(query: string): Promise<MutualFund[]> {
    if (!query || query.length < 2) {
        return [];
    }

    try {
        // Fetch directly from API (debouncing in component prevents spam)
        const response = await fetch(`${MFAPI_BASE_URL}/mf`);
        if (!response.ok) {
            throw new Error('Failed to fetch mutual funds');
        }

        const allFunds: MutualFund[] = await response.json();
        const searchTerm = query.toLowerCase();

        // Search and return top 50 matches
        return allFunds
            .filter(fund => fund.schemeName.toLowerCase().includes(searchTerm))
            .slice(0, 50);
    } catch (error) {
        console.error('Error searching mutual funds:', error);
        throw error;
    }
}

/**
 * Get detailed information for a specific mutual fund
 */
export async function getMutualFundDetails(schemeCode: string | number): Promise<MutualFundDetails> {
    try {
        const response = await fetch(`${MFAPI_BASE_URL}/mf/${schemeCode}`);
        if (!response.ok) {
            throw new Error('Failed to fetch fund details');
        }

        const data: MutualFundDetails = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching fund details:', error);
        throw error;
    }
}

/**
 * Extract category from MFAPI scheme_category
 * Example: "Equity Scheme - Large Cap Fund" -> "Large Cap"
 */
export function extractCategory(schemeCategory: string): string {
    // Common patterns in MFAPI categories
    const categoryMap: Record<string, string> = {
        'large cap': 'Large Cap',
        'mid cap': 'Mid Cap',
        'small cap': 'Small Cap',
        'multi cap': 'Multi Cap',
        'flexi cap': 'Flexi Cap',
        'elss': 'ELSS',
        'sectoral': 'Sectoral/Thematic',
        'thematic': 'Sectoral/Thematic',
        'index': 'Index',
        'focused': 'Focused',
        'value': 'Value',
        'contra': 'Contra',
        'dividend yield': 'Dividend Yield',
        'hybrid': 'Hybrid Conservative',
        'balanced': 'Balanced Advantage',
        'debt': 'Corporate Bond',
        'liquid': 'Liquid',
        'gilt': 'Gilt',
        'gold': 'Gold ETF',
        'international': 'International',
    };

    const lowerCategory = schemeCategory.toLowerCase();

    for (const [key, value] of Object.entries(categoryMap)) {
        if (lowerCategory.includes(key)) {
            return value;
        }
    }

    return 'Other ETF'; // Default fallback
}

/**
 * Map MFAPI fund house names to match dropdown options
 */
export function mapFundHouse(apiFundHouse: string): string {
  const mapping: Record<string, string> = {
    'Tata Asset Management Limited': 'Tata Mutual Fund',
    'Tata Asset Management Private Limited': 'Tata Mutual Fund',
    'SBI Funds Management Limited': 'SBI Mutual Fund',
    'HDFC Asset Management Company Limited': 'HDFC Mutual Fund',
    'ICICI Prudential Asset Management Company Limited': 'ICICI Prudential Mutual Fund',
    'Axis Asset Management Company Ltd.': 'Axis Mutual Fund',
    'Kotak Mahindra Asset Management Company Limited': 'Kotak Mahindra Mutual Fund',
    'Nippon Life India Asset Management Limited': 'Nippon India Mutual Fund',
  };

  return mapping[apiFundHouse] || apiFundHouse;
}
