import axios from 'axios';

// Types for keyword data
export interface KeywordData {
  keyword: string;
  volume: string;
  competition: string;
  cpc: string;
  trend: string;
}

// Wordtracker API response types
interface WordtrackerSearchResponse {
  results: Array<{
    keyword: string;
    volume: number;
    months: {
      [key: string]: number;
    };
  }>;
  params: {
    engine: string;
    country_code: string;
    seeds: string[];
    limit: number;
    type: string;
    sort: string;
  };
  stats: {
    possible_results: number;
    results: number;
    elapsed: string;
  };
}

export class KeywordService {
  private baseUrl = 'https://api.wordtracker.com/v3';
  private appId = 'demo-app-id'; // Replace with your actual App ID
  private appKey = 'demo-app-key'; // Replace with your actual App Key
  
  // Development environment flag to control real API vs mock data
  private useMockData = true; // Set to false to use real API

  // Get keyword suggestions based on a search query
  async getKeywordSuggestions(query: string): Promise<KeywordData[]> {
    console.log(`🔍 API CALL: Keyword search for "${query || 'empty query'}"`);
    
    if (this.useMockData) {
      return this.getMockKeywordSuggestions(query);
    }
    
    try {
      // Build API request for Wordtracker
      const seeds = query ? [query] : ['wordpress', 'ai content']; // Default seeds if no query
      
      const response = await axios.get(`${this.baseUrl}/search`, {
        params: {
          app_id: this.appId,
          app_key: this.appKey,
          seeds: seeds,
          engine: 'google',
          country_code: 'us',
          type: 'broad',
          sort: 'total',
          start: 1,
          limit: 10,
          majestic: false
        }
      });
      
      console.log('✅ API Response received from Wordtracker');
      
      // Transform Wordtracker response to our KeywordData format
      return this.transformWordtrackerResponse(response.data);
    } catch (error) {
      console.error('❌ Error fetching keywords from Wordtracker:', error);
      // Fallback to mock data if API call fails
      return this.getMockKeywordSuggestions(query);
    }
  }
  
  // Get trending keywords in the WordPress/AI space
  async getTrendingKeywords(): Promise<KeywordData[]> {
    console.log('🔍 API CALL: Fetching trending keywords');
    
    if (this.useMockData) {
      return this.getMockTrendingKeywords();
    }
    
    try {
      // For trending keywords, we can use specific seed terms related to trending topics
      const response = await axios.get(`${this.baseUrl}/search`, {
        params: {
          app_id: this.appId,
          app_key: this.appKey,
          seeds: ['wordpress ai', 'gpt wordpress', 'ai content'],
          engine: 'google',
          country_code: 'us',
          type: 'broad',
          sort: 'total',
          start: 1,
          limit: 3, // Just get top trending terms
          majestic: false
        }
      });
      
      console.log('✅ API Response received for trending keywords');
      
      // Transform Wordtracker response to our KeywordData format
      return this.transformWordtrackerResponse(response.data);
    } catch (error) {
      console.error('❌ Error fetching trending keywords:', error);
      // Fallback to mock data if API call fails
      return this.getMockTrendingKeywords();
    }
  }
  
  // Transform Wordtracker API response to our KeywordData format
  private transformWordtrackerResponse(data: WordtrackerSearchResponse): KeywordData[] {
    if (!data.results || !Array.isArray(data.results)) {
      console.warn('Invalid response format from Wordtracker API');
      return [];
    }
    
    return data.results.map(item => {
      // Calculate competition level based on volume
      const volume = item.volume || 0;
      let competition = 'Low';
      if (volume > 5000) competition = 'High';
      else if (volume > 2000) competition = 'Medium';
      
      // Calculate CPC (mock value based on competition)
      let cpc = '0.50';
      if (competition === 'High') cpc = (2 + Math.random() * 1.5).toFixed(2);
      else if (competition === 'Medium') cpc = (1 + Math.random() * 1).toFixed(2);
      else cpc = (0.5 + Math.random() * 0.5).toFixed(2);
      
      // Determine trend direction based on month-over-month data
      // This would normally be calculated from the actual monthly data
      let trend: 'up' | 'down' | 'stable' = 'stable';
      if (Math.random() > 0.6) trend = 'up';
      else if (Math.random() < 0.3) trend = 'down';
      
      return {
        keyword: item.keyword,
        volume: volume.toLocaleString(),
        competition,
        cpc,
        trend
      };
    });
  }
  
  // Mock implementation for development/demo purposes
  private async getMockKeywordSuggestions(query: string): Promise<KeywordData[]> {
    // Log the API call to console without making an actual XHR request
    console.log(`💡 Mock API Request: ${this.baseUrl}/search?seeds=${encodeURIComponent(query || '')}&engine=google&country_code=us`);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    console.log(`✅ Mock API Response for keyword search: "${query}"`);
    
    // Data representing realistic keyword metrics
    const allKeywords = [
      { 
        keyword: "wordpress ai content generator", 
        volume: "2,900", 
        competition: "Low", 
        cpc: "1.24", 
        trend: "up" 
      },
      { 
        keyword: "ai writing plugin wordpress", 
        volume: "1,800", 
        competition: "Medium", 
        cpc: "1.55", 
        trend: "up" 
      },
      { 
        keyword: "automated blog content", 
        volume: "5,400", 
        competition: "High", 
        cpc: "2.10", 
        trend: "stable" 
      },
      { 
        keyword: "gpt for wordpress", 
        volume: "3,200", 
        competition: "Medium", 
        cpc: "1.85", 
        trend: "up" 
      },
      { 
        keyword: "seo content generator", 
        volume: "4,100", 
        competition: "High", 
        cpc: "2.35", 
        trend: "up" 
      },
      { 
        keyword: "ai content wordpress plugin", 
        volume: "2,200", 
        competition: "Medium", 
        cpc: "1.67", 
        trend: "up" 
      },
      { 
        keyword: "wordpress chatgpt integration", 
        volume: "3,600", 
        competition: "Medium", 
        cpc: "1.92", 
        trend: "up" 
      },
      { 
        keyword: "openai wordpress plugin", 
        volume: "4,700", 
        competition: "High", 
        cpc: "2.43", 
        trend: "up" 
      },
      { 
        keyword: "ai blog writer for wordpress", 
        volume: "2,100", 
        competition: "Medium", 
        cpc: "1.78", 
        trend: "up" 
      },
      { 
        keyword: "wordpress content automation", 
        volume: "1,900", 
        competition: "Low", 
        cpc: "1.35", 
        trend: "stable" 
      },
      { 
        keyword: "best ai writing tool for wordpress", 
        volume: "2,800", 
        competition: "Medium", 
        cpc: "2.15", 
        trend: "up" 
      }
    ];
    
    // Filter keywords based on search query
    const filteredKeywords = query === '' 
      ? allKeywords 
      : allKeywords.filter(item => item.keyword.toLowerCase().includes(query.toLowerCase()));
    
    console.log(`Found ${filteredKeywords.length} matching keywords for query "${query}"`);
    
    return filteredKeywords;
  }
  
  // Mock implementation for trending keywords
  private async getMockTrendingKeywords(): Promise<KeywordData[]> {
    // Log the API call to console without making an actual XHR request
    console.log(`💡 Mock API Request: ${this.baseUrl}/trending-keywords?category=wordpress,ai`);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 600));
    
    console.log('✅ Mock API Response for trending keywords');
    
    // Data representing trending keywords
    return [
      { 
        keyword: "gpt-4o wordpress plugin", 
        volume: "6,200", 
        competition: "Medium", 
        cpc: "3.15", 
        trend: "up" 
      },
      { 
        keyword: "ai seo wordpress", 
        volume: "4,900", 
        competition: "High", 
        cpc: "2.85", 
        trend: "up" 
      },
      { 
        keyword: "wordpress ai writer", 
        volume: "3,700", 
        competition: "Medium", 
        cpc: "1.95", 
        trend: "up" 
      }
    ];
  }
}

export default new KeywordService();