// // src/app/page.js
// "use client"; // If using useSession or other client hooks
// import Link from 'next/link';
// import { useSession } from 'next-auth/react'; // Optional: for personalized welcome

// export default function HomePage() {
//   const { data: session, status } = useSession();

//   return (
//     <div className="text-center">
//       <header className="bg-white shadow rounded-lg p-8 mb-10">
//         <h1 className="text-4xl font-bold text-gray-800 mb-3">
//           Welcome to MiniCRM!
//         </h1>
//         {status === "authenticated" && session?.user?.name && (
//           <p className="text-xl text-gray-600 mb-6">
//             Hello, {session.user.name}! Lets manage your campaigns.
//           </p>
//         )}
//         <p className="text-lg text-gray-600 max-w-2xl mx-auto">
//           This platform enables customer segmentation, personalized campaign delivery, and intelligent insights using modern tools and AI.
//         </p>
//       </header>

//       <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
//         <Link href="/campaigns/create" className="block p-8 bg-indigo-600 text-white rounded-lg shadow-lg hover:bg-indigo-700 transition duration-150 ease-in-out transform hover:scale-105">
//             <h2 className="text-2xl font-semibold mb-2">🚀 Create New Campaign</h2>
//             <p>Define your audience and launch personalized marketing messages.</p>
//         </Link>
//         <Link href="/campaigns/history" className="block p-8 bg-teal-500 text-white rounded-lg shadow-lg hover:bg-teal-600 transition duration-150 ease-in-out transform hover:scale-105">
//             <h2 className="text-2xl font-semibold mb-2">📜 View Campaign History</h2>
//             <p>Track the performance and see insights from your past campaigns.</p>
//         </Link>
//       </div>

//       {/* You can add more sections here, e.g., brief explanation of AI features */}
//       <section className="mt-16 p-6 bg-white shadow rounded-lg">
//         <h3 className="text-2xl font-semibold text-gray-700 mb-4">Powered by AI</h3>
//         <ul className="list-disc list-inside text-left max-w-xl mx-auto text-gray-600 space-y-2">
//             <li>**Natural Language to Rules:** Describe your audience, and AI creates the segments.</li>
//             <li>**AI Message Suggestions:** Get creative message ideas for your campaigns.</li>
//             <li>**Performance Summaries:** Understand campaign results with AI-generated insights.</li>
//         </ul>
//       </section>
//     </div>
//   );
// }

"use client";
import Link from 'next/link';
import { useSession } from 'next-auth/react';

export default function HomePage() {
  const { data: session, status } = useSession();

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-indigo-600 to-purple-700 text-white rounded-2xl overflow-hidden shadow-xl mb-12">
        <div className="container mx-auto px-6 py-16 relative">
          <div className="max-w-3xl">
            <h1 className="text-5xl font-bold mb-4">
              Welcome to XenoCRM
            </h1>
            {status === "authenticated" && session?.user?.name && (
              <p className="text-xl font-medium mb-6 animate-fade-in">
                Hello, {session.user.name}! Your AI assistant is ready.
              </p>
            )}
            <p className="text-lg mb-8 leading-relaxed">
              Harness the power of artificial intelligence to transform your customer relationships. 
              Segment audiences, create personalized campaigns, and gain intelligent insights all in one platform.
            </p>
            <Link href="/campaigns/create" className="bg-white text-indigo-700 px-8 py-3 rounded-lg font-medium shadow-md hover:shadow-lg transition duration-300 inline-flex items-center">
              <span>Get Started</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </Link>
          </div>
          <div className="absolute right-0 bottom-0 opacity-20 lg:opacity-40">
            <svg width="320" height="280" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
              <path fill="white" d="M41.3,-62.5C53.8,-56.2,64.3,-44.8,71.2,-31.3C78.1,-17.8,81.5,-2.1,78,11.6C74.6,25.4,64.3,37.2,52.4,45.7C40.4,54.1,26.7,59.2,12.5,62.7C-1.8,66.3,-16.5,68.4,-31.5,65.4C-46.5,62.4,-61.8,54.4,-70.1,42C-78.4,29.7,-79.7,13,-75.5,-1.6C-71.3,-16.3,-61.7,-28.8,-50.5,-36.9C-39.4,-45,-26.8,-48.5,-14.9,-54.9C-3,-61.2,8.1,-70.4,20.5,-71C32.8,-71.6,45.3,-63.7,41.3,-62.5Z" transform="translate(100 100)" />
            </svg>
          </div>
        </div>
      </section>

      {/* Quick Action Cards */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-slate-800 mb-6">Quick Actions</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <Link href="/campaigns/create" className="block group">
            <div className="bg-white rounded-xl shadow-md hover:shadow-lg p-6 border border-slate-100 transition duration-300 h-full">
              <div className="bg-indigo-100 rounded-full w-12 h-12 flex items-center justify-center mb-4 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-2">Create Campaign</h3>
              <p className="text-slate-600">Launch personalized marketing campaigns tailored to your audience.</p>
            </div>
          </Link>
          
          <Link href="/campaigns/history" className="block group">
            <div className="bg-white rounded-xl shadow-md hover:shadow-lg p-6 border border-slate-100 transition duration-300 h-full">
              <div className="bg-emerald-100 rounded-full w-12 h-12 flex items-center justify-center mb-4 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-2">Campaign History</h3>
              <p className="text-slate-600">Track performance and gain insights from your past campaigns.</p>
            </div>
          </Link>
          
          <Link href="/audience" className="block group">
            <div className="bg-white rounded-xl shadow-md hover:shadow-lg p-6 border border-slate-100 transition duration-300 h-full">
              <div className="bg-amber-100 rounded-full w-12 h-12 flex items-center justify-center mb-4 text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-2">Audience Segments</h3>
              <p className="text-slate-600">Manage your customer segments and target specific groups.</p>
            </div>
          </Link>
        </div>
      </section>

      {/* AI Features Section */}
      <section className="bg-white rounded-2xl shadow-md p-8 mb-12">
        <div className="flex flex-col md:flex-row items-center">
          <div className="md:w-3/5 md:pr-8 mb-6 md:mb-0">
            <h2 className="text-3xl font-bold text-slate-800 mb-4">AI-Powered Features</h2>
            <p className="text-slate-600 mb-6">XenoCRM leverages cutting-edge AI to transform how you interact with customers:</p>
            
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="bg-indigo-100 rounded-full p-2 mr-4 text-indigo-600">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800">Natural Language Segmentation</h3>
                  <p className="text-slate-600">Simply describe your audience, and our AI creates precise customer segments.</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="bg-indigo-100 rounded-full p-2 mr-4 text-indigo-600">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
                    <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800">AI Message Suggestions</h3>
                  <p className="text-slate-600">Get creative message ideas tailored to each specific audience segment.</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="bg-indigo-100 rounded-full p-2 mr-4 text-indigo-600">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 0l-2 2a1 1 0 101.414 1.414L8 10.414l1.293 1.293a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800">Intelligent Insights</h3>
                  <p className="text-slate-600">Understand campaign performance with AI-generated analytics and recommendations.</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="md:w-2/5">
            <div className="bg-gradient-to-br from-purple-100 to-indigo-100 rounded-2xl p-6 relative overflow-hidden">
              <div className="relative z-10">
                <div className="w-16 h-16 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full flex items-center justify-center text-white mb-4 shadow-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-slate-800 mb-3">AI Assistant</h3>
                <p className="text-slate-700 mb-4">Ask questions about your data, get campaign recommendations, or analyze customer behavior with natural language.</p>
                <button className="bg-white text-indigo-600 px-4 py-2 rounded-lg font-medium shadow-sm hover:shadow-md transition duration-300 flex items-center">
                  <span>Try AI Assistant</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </button>
              </div>
              <div className="absolute bottom-0 right-0 opacity-20">
                <svg width="160" height="160" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                  <path fill="#4F46E5" d="M31.9,-54.1C39.7,-46.1,43.3,-33.2,50.1,-21.1C56.9,-9,66.8,2.4,68.3,15C69.9,27.7,63,41.5,51.7,49.6C40.3,57.6,24.4,59.9,10.8,57.9C-2.8,55.9,-13.9,49.7,-26.5,44.6C-39.1,39.5,-53,35.5,-60.2,26.1C-67.3,16.7,-67.6,2,-63.3,-11.3C-59,-24.6,-50.1,-36.7,-39.3,-44.5C-28.4,-52.3,-15.5,-55.9,-1.8,-53.6C11.9,-51.3,24.1,-42.9,31.9,-54.1Z" transform="translate(100 100)" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}