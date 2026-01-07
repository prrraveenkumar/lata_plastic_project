import React, { useState } from 'react';

export const SearchBar = ({ makeRequest, endpoint, onResultsFound }) => {
    const [query, setQuery] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSearch = async (e) => {
        e.preventDefault();
        if (query.trim() === '') return;

        setIsLoading(true);
        try {
            const response = await makeRequest(`${endpoint}?search=${encodeURIComponent(query)}`, 'GET');
            // Pass the data back to the parent component
            if (onResultsFound) onResultsFound(response.data);
        } catch (error) {
            console.error("Search error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full p-4 bg-white rounded-lg shadow-sm">
            <form onSubmit={handleSearch} className="flex items-center space-x-2">
                <input 
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Search records..."
                    disabled={isLoading}
                />
                <button 
                    type="submit" 
                    disabled={isLoading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300 transition-colors"
                >
                    {isLoading ? 'Searching...' : 'Search'}
                </button>
            </form>
        </div>
    );
};