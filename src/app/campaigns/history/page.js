"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function CampaignHistoryPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [campaigns, setCampaigns] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [aiSummaries, setAiSummaries] = useState({}); // { campaignId: "summary text..." }
  const [isGeneratingSummary, setIsGeneratingSummary] = useState({}); // { campaignId: true/false }
  const [summaryError, setSummaryError] = useState({}); // { campaignId: "error message" }

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/');
    }

    if (status === 'authenticated') {
      const fetchCampaigns = async () => {
        setIsLoading(true);
        setError('');
        try {
          const res = await fetch('/api/campaigns');
          if (!res.ok) {
            const errorData = await res.json().catch(() => ({ message: 'Failed to fetch campaigns' }));
            throw new Error(errorData.message || 'Failed to fetch campaigns');
          }
          const data = await res.json();
          setCampaigns(data.campaigns || []);
        } catch (err) {
          console.error("Fetch campaigns error:", err);
          setError(err.message);
          setCampaigns([]);
        } finally {
          setIsLoading(false);
        }
      };
      fetchCampaigns();
    }
  }, [status, router]);

  if (status === 'loading' || isLoading) {
    return <p className="text-center mt-10">Loading campaigns...</p>;
  }

  if (!session) {
    return <p className="text-center mt-10">Please log in to view campaign history.</p>;
  }

  if (error) {
    return <p className="text-center mt-10 text-red-500">Error: {error}</p>;
  }

  const handleGenerateCampaignSummary = async (campaign) => {
  const campaignId = campaign._id;
  setIsGeneratingSummary(prev => ({ ...prev, [campaignId]: true }));
  setSummaryError(prev => ({ ...prev, [campaignId]: '' }));
  setAiSummaries(prev => ({ ...prev, [campaignId]: '' }));


  try {
    // Prepare data to send to the AI
    const payload = {
      campaignName: campaign.name,
      // segmentRules: campaign.segmentRules, // Could be too verbose, maybe a summary of rules
      messageTemplate: campaign.messageTemplate,
      audienceSize: campaign.audienceSize,
      sentCount: campaign.sentCount,
      failedCount: campaign.failedCount,
      // You could add more context like campaign creation date if relevant
    };

    const res = await fetch('/api/ai/summarize-campaign', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || 'Failed to generate campaign summary.');
    }

    if (data.summary) {
      setAiSummaries(prev => ({ ...prev, [campaignId]: data.summary }));
    } else {
      throw new Error("AI did not return a valid summary.");
    }
  } catch (err) {
    console.error("Campaign Summary error:", err);
    setSummaryError(prev => ({ ...prev, [campaignId]: err.message }));
  } finally {
    setIsGeneratingSummary(prev => ({ ...prev, [campaignId]: false }));
  }
};

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8"> {/* Added py-8 for overall page padding */}
      <div className="container mx-auto px-4 md:px-8">
        {/* Header section */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-800 flex items-center">
              <span className="bg-gradient-to-r from-teal-600 to-cyan-600 text-transparent bg-clip-text">Campaign History</span>
              {/* Optional: Icon or badge */}
            </h1>
            <p className="text-slate-500 mt-1">Review performance and insights from your past campaigns.</p>
          </div>
          <Link 
            href="/campaigns/create" 
            className="mt-4 sm:mt-0 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg shadow-md transition duration-200 font-medium flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="mr-2" viewBox="0 0 16 16">
              <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/>
            </svg>
            Create New Campaign
          </Link>
        </div>

        {/* Loading and Error States */}
        {(status === 'loading' || isLoading) && (
          <div className="text-center py-10">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-slate-600">Loading campaigns...</p>
          </div>
        )}

        {!isLoading && !session && (
          <div className="text-center py-10 bg-white p-8 rounded-xl shadow-md">
            <p className="text-slate-600">Please log in to view campaign history.</p>
          </div>
        )}

        {!isLoading && error && (
          <div className="text-center py-10 bg-red-50 p-8 rounded-xl shadow-md">
            <p className="text-red-600 font-medium">Error: {error}</p>
            <p className="text-sm text-red-500 mt-1">Could not load campaign history. Please try again later.</p>
          </div>
        )}

        {/* Campaign List */}
        {!isLoading && !error && session && (
          campaigns.length === 0 ? (
            <div className="text-center py-20 bg-white p-10 rounded-xl shadow-md">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="currentColor" className="mx-auto text-slate-400 mb-4" viewBox="0 0 16 16">
                <path d="M10.5 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0z"/>
                <path d="M0 8s3-5.5 8-5.5S16 8 16 8s-3 5.5-8 5.5S0 8 0 8zm8 3.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z"/>
              </svg>
              <p className="text-xl text-slate-500">You havent created any campaigns yet.</p>
              <p className="text-sm text-slate-400 mt-1">Why not start by creating one now?</p>
            </div>
          ) : (
            <div className="space-y-6">
              {campaigns.map((campaign) => (
                <div key={campaign._id} className="bg-white rounded-xl shadow-md overflow-hidden border border-slate-100 hover:shadow-lg transition-shadow duration-200">
                  {/* Campaign Header */}
                  <div className="p-5 md:p-6 bg-slate-50 border-b border-slate-200">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                      <h2 className="text-xl md:text-2xl font-semibold text-indigo-700 mb-1 sm:mb-0">{campaign.name}</h2>
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                          campaign.status === 'active' || campaign.status === 'processing' ? 'bg-green-100 text-green-700' :
                          campaign.status === 'completed' || campaign.status === 'completed_no_audience' ? 'bg-blue-100 text-blue-700' :
                          'bg-gray-100 text-gray-700'
                      }`}>
                        {campaign.status ? (campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)).replace(/_/g, ' ') : 'N/A'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Created: {new Date(campaign.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} at {new Date(campaign.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>

                  {/* Campaign Stats */}
                  <div className="p-5 md:p-6 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                    <div>
                        <p className="text-xs text-slate-500 uppercase tracking-wider">Audience</p>
                        <p className="text-2xl font-bold text-slate-700 mt-1">{campaign.audienceSize ?? '0'}</p>
                    </div>
                    <div>
                        <p className="text-xs text-slate-500 uppercase tracking-wider">Sent</p>
                        <p className="text-2xl font-bold text-green-600 mt-1">{campaign.sentCount ?? '0'}</p>
                    </div>
                    <div>
                        <p className="text-xs text-slate-500 uppercase tracking-wider">Failed</p>
                        <p className="text-2xl font-bold text-red-600 mt-1">{campaign.failedCount ?? '0'}</p>
                    </div>
                  </div>
                  
                  {/* Collapsible Details Section (Example using details/summary for simplicity) */}
                  <details className="group">
                    <summary className="p-5 md:p-6 border-t border-slate-200 cursor-pointer list-none flex justify-between items-center hover:bg-slate-50 transition-colors">
                      <span className="text-sm font-medium text-slate-600">View Details & AI Summary</span>
                      <span className="text-slate-400 group-open:rotate-90 transition-transform">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                          <path fillRule="evenodd" d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z"/>
                        </svg>
                      </span>
                    </summary>
                    <div className="p-5 md:p-6 border-t border-slate-200 bg-slate-50/50">
                      {/* Audience Rules */}
                      <div className="mb-4">
                        <h3 className="text-sm font-semibold text-slate-700 mb-1 flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" className="mr-2 text-purple-600" viewBox="0 0 16 16"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" className="mr-2 text-purple-600" viewBox="0 0 16 16">
    <path d="M5 11.5a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5zm-3 1a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm0 4a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm0 4a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"/>
</svg><path d="M5 11.5a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5zm-3 1a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm0 4a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm0 4a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"/></svg>
                          Audience Rules:
                        </h3>
                        <pre className="text-xs bg-slate-100 p-3 rounded-md overflow-x-auto shadow-inner">
                          {JSON.stringify(campaign.segmentRules, null, 2)}
                        </pre>
                      </div>

                      {/* Message Template */}
                      <div className="mb-4">
                        <h3 className="text-sm font-semibold text-slate-700 mb-1 flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" className="mr-2 text-indigo-600" viewBox="0 0 16 16"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" className="mr-2 text-indigo-600" viewBox="0 0 16 16">
    <path d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V4zm2-1a1 1 0 0 0-1 1v.217l7 4.2 7-4.2V4a1 1 0 0 0-1-1H2zm13 2.383-4.708 2.825L15 11.105V5.383zm-.034 6.876-5.64-3.471L8 9.583l-1.326-.795-5.64 3.47A1 1 0 0 0 2 13h12a1 1 0 0 0 .966-.741zM1 11.105l4.708-2.897L1 5.383v5.722z"/>
</svg><path d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V4zm2-1a1 1 0 0 0-1 1v.217l7 4.2 7-4.2V4a1 1 0 0 0-1-1H2zm13 2.383-4.708 2.825L15 11.105V5.383zm-.034 6.876-5.64-3.471L8 9.583l-1.326-.795-5.64 3.47A1 1 0 0 0 2 13h12a1 1 0 0 0 .966-.741zM1 11.105l4.708-2.897L1 5.383v5.722z"/></svg>
                          Message Template:
                        </h3>
                        <p className="text-xs bg-slate-100 p-3 rounded-md whitespace-pre-wrap shadow-inner">{campaign.messageTemplate}</p>
                      </div>

                      {/* AI Summary Section */}
                      <div className="mt-4">
                        <button
                          type="button"
                          onClick={() => handleGenerateCampaignSummary(campaign)}
                          disabled={isGeneratingSummary[campaign._id]}
                          className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:bg-gray-300"
                        >
                          {isGeneratingSummary[campaign._id] ? 'Summarizing...' : '📊 Get AI Performance Summary'}
                        </button>
                        {summaryError[campaign._id] && (
                          <p className="mt-2 text-sm text-red-500">{summaryError[campaign._id]}</p>
                        )}
                        {aiSummaries[campaign._id] && (
                          <div className="mt-3 p-4 border border-slate-200 rounded-lg bg-white shadow">
                            <h5 className="text-sm font-semibold text-slate-800 mb-1">AI Performance Insights:</h5>
                            <p className="text-sm text-slate-700 whitespace-pre-wrap">{aiSummaries[campaign._id]}</p>
                            <button
                              onClick={() => {
                                  setAiSummaries(prev => ({...prev, [campaign._id]: null}));
                                  setSummaryError(prev => ({...prev, [campaign._id]: null}));
                              }}
                              className="mt-2 text-xs text-slate-500 hover:text-slate-700"
                            >
                              Clear Summary
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </details>
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
}