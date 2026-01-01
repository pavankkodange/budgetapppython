import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Search, Loader2, X } from 'lucide-react';
import { searchMutualFunds, getMutualFundDetails, extractCategory, mapFundHouse, type MutualFund } from '@/services/mfapi';
import { showError, showSuccess } from '@/utils/toast';

interface MutualFundSearchProps {
    onFundSelect: (fundDetails: {
        name: string;
        schemeCode: string;
        fundHouse: string;
        category: string;
        nav: number;
    }) => void;
}

export const MutualFundSearch: React.FC<MutualFundSearchProps> = ({ onFundSelect }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<MutualFund[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const [isLoadingDetails, setIsLoadingDetails] = useState(false);

    // Debounced search
    useEffect(() => {
        if (!searchQuery || searchQuery.length < 2) {
            setSearchResults([]);
            setShowResults(false);
            return;
        }

        const timer = setTimeout(async () => {
            try {
                setIsSearching(true);
                const results = await searchMutualFunds(searchQuery);
                setSearchResults(results);
                setShowResults(true);
            } catch (error) {
                console.error('Search error:', error);
                showError('Failed to search funds. You can enter details manually.');
            } finally {
                setIsSearching(false);
            }
        }, 300); // 300ms debounce

        return () => clearTimeout(timer);
    }, [searchQuery]);

    const handleFundSelect = async (fund: MutualFund) => {
        try {
            setIsLoadingDetails(true);
            setShowResults(false);

            const details = await getMutualFundDetails(fund.schemeCode);

            console.log('Fund details from MFAPI:', details.meta);

            // Extract NAV
            let latestNAV = 0;
            if (details.data && details.data.length > 0) {
                latestNAV = parseFloat(details.data[0].nav);
            }

            // Ensure scheme code is always a string
            const schemeCodeStr = String(details.meta.scheme_code);

            const fundData = {
                name: details.meta.scheme_name,
                schemeCode: schemeCodeStr,
                fundHouse: mapFundHouse(details.meta.fund_house),
                category: extractCategory(details.meta.scheme_category),
                nav: latestNAV
            };

            console.log('Auto-filling with:', fundData);

            // Call parent with fund details
            onFundSelect(fundData);

            setSearchQuery('');
            setSearchResults([]);
            showSuccess('✅ Auto-filled! Check Fund House & Category dropdowns.');
        } catch (error) {
            console.error('Error loading fund details:', error);
            showError('Failed to load fund details');
        } finally {
            setIsLoadingDetails(false);
        }
    };

    return (
        <div className="space-y-2">
            <Label>Search Mutual Fund (Optional)</Label>
            <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by fund name (e.g., SBI Blue Chip)"
                    className="pl-10 pr-10"
                    disabled={isLoadingDetails}
                />
                {isSearching && (
                    <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
                )}
                {searchQuery && !isSearching && (
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7"
                        onClick={() => {
                            setSearchQuery('');
                            setSearchResults([]);
                            setShowResults(false);
                        }}
                    >
                        <X className="h-3 w-3" />
                    </Button>
                )}
            </div>

            {/* Search Results Dropdown */}
            {showResults && searchResults.length > 0 && (
                <div className="border rounded-md shadow-lg max-h-64 overflow-y-auto bg-background z-50">
                    {searchResults.map((fund) => (
                        <button
                            key={fund.schemeCode}
                            type="button"
                            onClick={() => handleFundSelect(fund)}
                            className="w-full text-left px-4 py-3 hover:bg-muted transition-colors border-b last:border-b-0 flex flex-col gap-1"
                            disabled={isLoadingDetails}
                        >
                            <span className="font-medium text-sm">{fund.schemeName}</span>
                            <span className="text-xs text-muted-foreground">Code: {fund.schemeCode}</span>
                        </button>
                    ))}
                </div>
            )}

            {showResults && searchResults.length === 0 && !isSearching && (
                <p className="text-sm text-muted-foreground">
                    No funds found. You can enter details manually below.
                </p>
            )}

            <p className="text-xs text-muted-foreground">
                💡 Start typing to search 40,000+ Indian mutual funds, or enter details manually below
            </p>
        </div>
    );
};
