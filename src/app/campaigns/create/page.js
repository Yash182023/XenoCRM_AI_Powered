// src/app/campaigns/create/page.js
"use client"; // This page will have interactivity and state

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation'; // For redirection

export default function CreateCampaignPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [campaignName, setCampaignName] = useState('');
  const [rules, setRules] = useState([{ field: 'totalSpend', operator: '>', value: '', logic: 'AND' }]);
  const [messageTemplate, setMessageTemplate] = useState('');
  const [audienceSize, setAudienceSize] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [naturalLanguageQuery, setNaturalLanguageQuery] = useState('');
  const [isGeneratingRules, setIsGeneratingRules] = useState(false); // For loading state
  const [nlError, setNlError] = useState(''); // For NL specific errors
  const [campaignObjective, setCampaignObjective] = useState(''); // Optional objective
  const [messageSuggestions, setMessageSuggestions] = useState([]);
  const [isGeneratingMessages, setIsGeneratingMessages] = useState(false);
  const [messageGenError, setMessageGenError] = useState('');
  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/'); // Or your login page
    }
  }, [status, router]);

  const handleAddRule = () => {
    // For now, new rules are always ANDed with the previous one
    setRules([...rules, { field: 'totalSpend', operator: '>', value: '', logic: 'AND' }]);
  };

  const handleRuleChange = (index, property, newValue) => {
    const updatedRules = rules.map((rule, i) =>
      i === index ? { ...rule, [property]: newValue } : rule
    );
    setRules(updatedRules);
  };

  const handleRemoveRule = (index) => {
    if (rules.length > 1) { // Keep at least one rule
      setRules(rules.filter((_, i) => i !== index));
    }
  };

  
  const handlePreviewAudience = async () => {
    const allRuleValuesPresent = rules.every(rule => {
  if (typeof rule.value === 'string') {
    return rule.value.trim() !== '';
  }
  return rule.value !== undefined && rule.value !== null; // Numbers and booleans (if any) are fine if not undefined/null
});

if (!allRuleValuesPresent) {
  setError("Please fill in all rule values before previewing.");
  setAudienceSize(null);
  return;
}
    setIsLoading(true);
    setError('');
    setAudienceSize(null);
    try {
      // TODO: Create this API endpoint
      const res = await fetch('/api/segments/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rules }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to preview audience');
      }
      setAudienceSize(data.count);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }

  };



  const handleSubmitCampaign = async (e) => {
    e.preventDefault();
    const allRuleValuesPresentForSubmit = rules.every(rule => {
    if (typeof rule.value === 'string') {
        return rule.value.trim() !== '';
    }
    return rule.value !== undefined && rule.value !== null;
});

if (!campaignName.trim() || !messageTemplate.trim() || !allRuleValuesPresentForSubmit) {
    setError("Please fill in campaign name, message template, and all rule values.");
    return;
}
       
    setIsLoading(true);
    setError('');
    try {
      // TODO: Create this API endpoint
      const res = await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: campaignName,
          segmentRules: rules,
          messageTemplate,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to create campaign');
      }
      // On success, redirect to campaign history (we'll build this later)
      router.push('/campaigns/history'); // Or just router.push('/campaigns');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (status === 'loading') return <p className="text-center mt-10">Loading session...</p>;
  if (!session) return null; // Should be redirected by useEffect

  // Available fields and operators for rules
  const availableFields = [
    { value: 'totalSpend', label: 'Total Spend (INR)' },
    { value: 'visitCount', label: 'Visit Count' },
    { value: 'lastActiveDate', label: 'Days Since Last Active' }, // We'll need to handle this in backend
  ];
  const operators = [
    { value: '>', label: '>' },
    { value: '<', label: '<' },
    { value: '=', label: '=' },
    { value: '>=', label: '>=' },
    { value: '<=', label: '<=' },
    // { value: '!=', label: '!=' }, // Add more as needed
  ];

  const handleGenerateRulesFromNL = async () => {
  if (!naturalLanguageQuery.trim()) {
    setNlError("Please enter a description for your audience.");
    return;
  }
  setIsGeneratingRules(true);
  setNlError('');
  setError(''); // Clear general form error as well

  try {
    const res = await fetch('/api/ai/nl-to-rules', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: naturalLanguageQuery }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || 'Failed to generate rules from natural language.');
    }

    if (data.rules && Array.isArray(data.rules) && data.rules.length > 0) {
      // Validate if the rules structure is somewhat correct (basic check)
      const isValidStructure = data.rules.every(
        rule => typeof rule.field === 'string' &&
                typeof rule.operator === 'string' &&
                rule.value !== undefined // value can be number or string
      );
      if (isValidStructure) {
        setRules(data.rules); // Replace existing rules
        setNaturalLanguageQuery(''); // Optionally clear the NL query input
      } else {
        throw new Error("AI generated rules in an unexpected format. Please try a different query or define rules manually.");
      }
    } else if (data.rules && Array.isArray(data.rules) && data.rules.length === 0) {
        setNlError("AI couldn't identify specific rules from your query. Please try rephrasing or define rules manually.");
        setRules([{ field: 'totalSpend', operator: '>', value: '', logic: 'AND' }]); // Reset to default
    }
     else {
      throw new Error("AI did not return valid rules. Please try again or define rules manually.");
    }
  } catch (err) {
    console.error("NL to Rules error:", err);
    setNlError(err.message);
    // Optionally, don't clear existing rules if AI fails
  } finally {
    setIsGeneratingRules(false);
  }
};

const handleGenerateMessageSuggestions = async () => {
  setIsGeneratingMessages(true);
  setMessageGenError('');
  setMessageSuggestions([]);

  // Construct a brief description of the audience from rules for better AI context
  let audienceDescription = "a general audience";
  if (rules.length > 0 && rules.some(rule => rule.value.toString().trim() !== '')) {
    audienceDescription = rules.map(r => `${r.field} ${r.operator} ${r.value}`).join(' AND ');
  }

  try {
    const res = await fetch('/api/ai/message-suggestions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        campaignName: campaignName, // Pass campaign name for context
        objective: campaignObjective,
        audienceDescription: audienceDescription
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || 'Failed to generate message suggestions.');
    }

    if (data.suggestions && Array.isArray(data.suggestions)) {
      setMessageSuggestions(data.suggestions);
    } else {
      throw new Error("AI did not return valid suggestions.");
    }
  } catch (err) {
    console.error("Message Suggestion error:", err);
    setMessageGenError(err.message);
  } finally {
    setIsGeneratingMessages(false);
  }
};

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100"> {/* Keep your new outer div */}
      <div className="container mx-auto p-4 md:p-8 max-w-4xl">
        {/* Header section */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-800 flex items-center">
            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 text-transparent bg-clip-text">Create New Campaign</span>
            <span className="ml-3 px-2 py-1 text-xs font-medium bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-md">
              AI Powered
            </span>
          </h1>
          <p className="text-slate-500 mt-2">Define your audience, set campaign rules, and craft engaging messages</p>
        </div>
        
        {/* Main form */}
        <form onSubmit={handleSubmitCampaign} className="space-y-8"> {/* Added onSubmit */}
          {/* Card container */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden border border-slate-100">
            {/* Campaign name section */}
            <div className="p-6 border-b border-slate-100">
              <div className="flex items-center mb-4">
                <div className="h-8 w-8 rounded-md bg-indigo-100 flex items-center justify-center text-indigo-600 mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z"/>
                    <path fillRule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5v11z"/>
                  </svg>
                </div>
                <h2 className="text-lg font-semibold text-slate-900">Campaign Details</h2>
              </div>
              <div>
                <label htmlFor="campaignName" className="block text-sm font-medium text-slate-900 mb-1">
                  Campaign Name
                </label>
                <input
                  type="text"
                  id="campaignName"
                  value={campaignName}
                  onChange={(e) => setCampaignName(e.target.value)}
                  required
                  placeholder="Enter campaign name"
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200"
// Added: text-slate-700 (or text-gray-700, text-black, etc.)
                />
              </div>
            </div>
            
            {/* AI audience description section */}
            <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-slate-100">
              <div className="flex items-center mb-4">
                <div className="h-8 w-8 rounded-md bg-blue-100 flex items-center justify-center text-blue-600 mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M5.52.359A.5.5 0 0 1 6 0h4a.5.5 0 0 1 .474.658L8.694 6H12.5a.5.5 0 0 1 .395.807l-7 9a.5.5 0 0 1-.873-.454L6.823 9.5H3.5a.5.5 0 0 1-.48-.641l2.5-8.5z"/>
                  </svg>
                </div>
                <h2 className="text-lg font-semibold text-slate-900">AI-Powered Audience Targeting</h2>
              </div>
              <div className="space-y-4">
                <div>
                  <label htmlFor="naturalLanguageQuery" className="block text-sm font-medium text-slate-900 mb-1">
                    Describe your target audience in plain language
                  </label>
                  <textarea
                    id="naturalLanguageQuery"
                    rows="3"
                    value={naturalLanguageQuery}
                    onChange={(e) => setNaturalLanguageQuery(e.target.value)}
                    placeholder="e.g., Customers who spent over 5000 and were active in the last 30 days"
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                  ></textarea>
                </div>
                <button
                  type="button"
                  onClick={handleGenerateRulesFromNL}
                  disabled={isGeneratingRules || !naturalLanguageQuery.trim()}
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg shadow-sm flex items-center transition duration-200 font-medium disabled:opacity-50"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" className="mr-2">
                    <path d="M9.828 4a3 3 0 0 1-2.12-.879l-.83-.828A1 1 0 0 0 6.173 2H2.5a1 1 0 0 0-1 .981L1.546 4h-1L.5 3a2 2 0 0 1 2-2h3.672a2 2 0 0 1 1.414.586l.828.828A2 2 0 0 0 9.828 3v1z"/>
                    <path fillRule="evenodd" d="M13.81 4H2.19a1 1 0 0 0-.996 1.09l.637 7a1 1 0 0 0 .995.91h10.348a1 1 0 0 0 .995-.91l.637-7A1 1 0 0 0 13.81 4zM2.19 3A2 2 0 0 0 .198 5.181l.637 7A2 2 0 0 0 2.826 14h10.348a2 2 0 0 0 1.991-1.819l.637-7A2 2 0 0 0 13.81 3H2.19z"/>
                  </svg>
                  {isGeneratingRules ? 'Generating...' : 'Generate Rules from Description'}
                </button>
                {nlError && <p className="mt-2 text-sm text-red-500">{nlError}</p>}
              </div>
            </div>
            
            {/* Rules section */}
            <div className="p-6 border-b border-slate-100">
              <div className="flex items-center mb-4">
                <div className="h-8 w-8 rounded-md bg-purple-100 flex items-center justify-center text-purple-600 mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M5 11.5a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5zm-3 1a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm0 4a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm0 4a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"/>
                  </svg>
                </div>
                <h2 className="text-lg font-semibold text-slate-700">
                  {rules.length > 0 && naturalLanguageQuery.trim() ? 'Generated/Manual ' : ''}Audience Segment Rules
                </h2>
              </div>
              
              {/* Rule rows - DYNAMICALLY RENDERED */}
              <div className="space-y-3 mb-4">
                {rules.map((rule, index) => (
                  <div key={index} className="rule-group p-4 border border-slate-200  text-slate-700 rounded-lg bg-slate-50 space-y-3 md:space-y-0 md:flex md:items-center md:space-x-3">
                    {index > 0 && (
                      <div className="hidden md:block font-semibold text-slate-700 text-center px-2">AND</div>
                    )}
                    <select
                      value={rule.field}
                      onChange={(e) => handleRuleChange(index, 'field', e.target.value)}
                      className="w-full md:flex-1 px-3 py-2 rounded-lg border border-slate-200  text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-200"
                    >
                      {availableFields.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                    </select>
                    <select
                      value={rule.operator}
                      onChange={(e) => handleRuleChange(index, 'operator', e.target.value)}
                      className="w-full md:flex-1 px-3 py-2 rounded-lg border border-slate-200  text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-200"
                    >
                      {operators.map(op => <option key={op.value} value={op.value}>{op.label}</option>)}
                    </select>
                    <input
                      type={rule.field === 'lastActiveDate' ? 'number' : 'text'}
                      placeholder={rule.field === 'lastActiveDate' ? 'Days' : 'Value'}
                      value={rule.value}
                      onChange={(e) => handleRuleChange(index, 'value', e.target.value)}
                      required
                      className="w-full md:flex-1 px-3 py-2 rounded-lg border border-slate-200 text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-200"
                    />
                    {rules.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveRule(index)}
                        className="p-2 text-red-500 hover:text-red-700 transition duration-200"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                          <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                          <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
              </div>
              
              {/* Add rule button */}
              <button
                type="button"
                onClick={handleAddRule}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg shadow-sm flex items-center transition duration-200 font-medium"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" className="mr-2">
                  <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/>
                </svg>
                Add Rule (AND)
              </button>
            </div>
            
            {/* Preview section */}
            <div className="p-6 border-b border-slate-100">
              <div className="flex items-center mb-4">
                <div className="h-8 w-8 rounded-md bg-amber-100 flex items-center justify-center text-amber-600 mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M10.5 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0z"/>
                    <path d="M0 8s3-5.5 8-5.5S16 8 16 8s-3 5.5-8 5.5S0 8 0 8zm8 3.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z"/>
                  </svg>
                </div>
                <h2 className="text-lg font-semibold text-slate-700">Preview Audience</h2>
              </div>
              
              <button
                type="button"
                onClick={handlePreviewAudience}
                disabled={isLoading}
                className="px-4 py-2 border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 rounded-lg shadow-sm transition duration-200 font-medium disabled:opacity-50"
              >
                {isLoading && audienceSize === null ? 'Previewing...' : 'Preview Audience Size'}
              </button>
              
              {audienceSize !== null && (
                <div className="mt-3 bg-amber-50 rounded-lg p-3 inline-block">
                  <p className="text-sm text-amber-800">
                    <span className="font-semibold">Estimated Audience Size:</span> {audienceSize} customers
                  </p>
                </div>
              )}
              {/* Display general form error if it exists and nlError does not (to avoid double errors) */}
              {error && !nlError && <p className="mt-2 text-sm text-red-500">{error}</p>}
            </div>
            
            {/* Campaign objective section */}
            <div className="p-6 border-b border-slate-100">
              <div className="flex items-center mb-4">
                <div className="h-8 w-8 rounded-md bg-teal-100 flex items-center justify-center text-teal-600 mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M6 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm-5 6s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1H1zM11 3.5a.5.5 0 0 1 .5-.5h4a.5.5 0 0 1 0 1h-4a.5.5 0 0 1-.5-.5zm.5 2.5a.5.5 0 0 0 0 1h4a.5.5 0 0 0 0-1h-4zm2 3a.5.5 0 0 0 0 1h2a.5.5 0 0 0 0-1h-2zm0 3a.5.5 0 0 0 0 1h2a.5.5 0 0 0 0-1h-2z"/>
                  </svg>
                </div>
                <h2 className="text-lg font-semibold text-slate-900">Campaign Objective</h2>
              </div>
              
              <div>
                <input
                  type="text"
                  id="campaignObjective"
                  value={campaignObjective}
                  onChange={(e) => setCampaignObjective(e.target.value)}
                  placeholder="e.g., Re-engage inactive users, Announce new product, Boost sales"
                  className="w-full px-4 py-2 rounded-lg border border-slate-200  text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition duration-200"
                />
                <p className="mt-1 text-xs text-slate-500">Optional - helps AI generate better messages</p>
              </div>
            </div>
            
            {/* Message template section */}
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="h-8 w-8 rounded-md bg-indigo-100 flex items-center justify-center text-indigo-600 mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V4zm2-1a1 1 0 0 0-1 1v.217l7 4.2 7-4.2V4a1 1 0 0 0-1-1H2zm13 2.383-4.708 2.825L15 11.105V5.383zm-.034 6.876-5.64-3.471L8 9.583l-1.326-.795-5.64 3.47A1 1 0 0 0 2 13h12a1 1 0 0 0 .966-.741zM1 11.105l4.708-2.897L1 5.383v5.722z"/>
                  </svg>
                </div>
                <h2 className="text-lg font-semibold text-slate-700">Message Template</h2>
              </div>
              
              <div className="relative">
                <textarea
                  id="messageTemplate"
                  rows="4"
                  value={messageTemplate}
                  onChange={(e) => setMessageTemplate(e.target.value)}
                  required
                  placeholder="E.g., Hi {{name}}, here's a special offer for you!"
                  className="w-full px-4 py-3 rounded-lg border border-slate-200  text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200"
                ></textarea>
                <button
                  type="button"
                  onClick={handleGenerateMessageSuggestions}
                  disabled={isGeneratingMessages}
                  className="absolute top-2 right-2 px-3 py-2 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white rounded-lg shadow-sm flex items-center text-xs transition duration-200 font-medium disabled:opacity-50"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" className="mr-1" viewBox="0 0 16 16">
                    <path d="M15.384 6.115a.485.485 0 0 0-.047-.736A12.444 12.444 0 0 0 8 3C5.259 3 2.723 3.882.663 5.379a.485.485 0 0 0-.048.736.518.518 0 0 0 .668.05A11.448 11.448 0 0 1 8 4c2.507 0 4.827.802 6.716 2.164.205.148.49.13.668-.049z"/>
                    <path d="M13.229 8.271a.482.482 0 0 0-.063-.745A9.455 9.455 0 0 0 8 6c-1.905 0-3.68.56-5.166 1.526a.48.48 0 0 0-.063.745.525.525 0 0 0 .652.065A8.46 8.46 0 0 1 8 7a8.46 8.46 0 0 1 4.576 1.336c.206.132.48.108.653-.065zm-2.183 2.183c.226-.226.185-.605-.1-.75A6.473 6.473 0 0 0 8 9c-1.06 0-2.062.254-2.946.704-.285.145-.326.524-.1.75l.015.015c.16.16.407.19.611.09A5.478 5.478 0 0 1 8 10c.868 0 1.69.201 2.42.56.203.1.45.07.61-.091l.016-.015zM9.06 12.44c.196-.196.198-.52-.04-.66A1.99 1.99 0 0 0 8 11.5a1.99 1.99 0 0 0-1.02.28c-.238.14-.236.464-.04.66l.706.706a.5.5 0 0 0 .707 0l.707-.707z"/>
                  </svg>
                  {isGeneratingMessages ? 'Suggesting...' : '✨ Get AI Suggestions'}
                </button>
              </div>
              <p className="mt-1 text-xs text-slate-500">{'Use {{name}}, {{email}} for personalization.'}</p>
              
              {messageGenError && <p className="mt-1 text-xs text-red-500">{messageGenError}</p>}
              
              {/* Message suggestions - DYNAMICALLY RENDERED */}
              {messageSuggestions.length > 0 && (
                <div className="mt-4 p-4 border border-slate-200 rounded-lg bg-slate-50">
                  <h4 className="text-sm font-medium text-slate-900 mb-2 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" className="mr-1 text-indigo-500" viewBox="0 0 16 16">
                      <path d="M6 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm4 8c0 1-1 1-1 1H1s-1 0-1-1 1-4 6-4 6 3 6 4zm-1-.004c-.001-.246-.154-.986-.832-1.664C9.516 10.68 8.289 10 6 10c-2.29 0-3.516.68-4.168 1.332-.678.678-.83 1.418-.832 1.664h10z"/>
                      <path fillRule="evenodd" d="M15.854 5.146a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708 0l-1.5-1.5a.5.5 0 0 1 .708-.708L12.5 7.793l2.646-2.647a.5.5 0 0 1 .708 0z"/>
                    </svg>
                    AI Message Suggestions:
                  </h4>
                  <ul className="space-y-2">
                    {messageSuggestions.map((suggestion, index) => (
                      <li key={index}
                          onClick={() => { setMessageTemplate(suggestion); setMessageSuggestions([]); }}
                          className="p-3 border border-slate-200 rounded-lg bg-white hover:bg-slate-50 cursor-pointer transition duration-200 flex justify-between items-center">
                        <span className="text-sm text-slate-900 flex-grow mr-2">{suggestion}</span>
                        <span className="text-xs text-indigo-600 font-semibold ml-2 whitespace-nowrap">Use this</span>
                      </li>
                    ))}
                  </ul>
                  <button 
                    type="button" 
                    onClick={() => setMessageSuggestions([])} 
                    className="mt-2 text-xs text-slate-500 hover:text-slate-800"
                  >
                    Clear Suggestions
                  </button>
                </div>
              )}
            </div>
          </div>
          <div className="flex justify-end mt-8"> {/* Added mt-8 for spacing if desired, or remove for default form spacing */}
            {/* Display general form error if it exists, and specifically if nlError or messageGenError does not already cover it */}
            {error && !nlError && !messageGenError && (
              <p className="text-red-500 text-sm mr-4 self-center">{error}</p>
            )}
            <button
              type="submit"
              disabled={isLoading || status !== 'authenticated'} // isLoading is for overall form submission
              className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg shadow-md transition duration-200 font-medium flex items-center disabled:opacity-50"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" className="mr-2">
                <path d="M15.854.146a.5.5 0 0 1 .11.54l-5.819 14.547a.75.75 0 0 1-1.329.124l-3.178-4.995L.643 7.184a.75.75 0 0 1 .124-1.33L15.314.037a.5.5 0 0 1 .54.11ZM6.636 10.07l2.761 4.338L14.13 2.576 6.636 10.07Zm6.787-8.201L1.591 6.602l4.339 2.76 7.494-7.493Z"/>
              </svg>
              {isLoading ? 'Saving & Launching...' : 'Save & Launch Campaign'}
            </button>
          </div>
        </form> {/* End of Main form */}
      </div> {/* End of container mx-auto div */}
    </div> // End of min-h-screen bg-gradient div
  );
}