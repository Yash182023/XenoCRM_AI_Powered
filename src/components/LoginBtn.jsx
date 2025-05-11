// // src/components/LoginBtn.jsx
// "use client";

// import { useSession, signIn, signOut } from "next-auth/react";
// import Image from "next/image"; // Optional: for user image

// export default function LoginBtn() {
//   const { data: session, status } = useSession();

//   if (status === "loading") {
//     return <p>Loading...</p>;
//   }

//   if (session) {
//     return (
//       <div className="flex items-center gap-4">
//         {session.user.image && (
//           <Image
//             src={session.user.image}
//             alt={session.user.name || "User avatar"}
//             width={32}
//             height={32}
//             className="rounded-full"
//           />
//         )}
//         <p>
//           Signed in as {session.user.name || session.user.email}
//         </p>
//         <button
//           onClick={() => signOut()}
//           className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
//         >
//           Sign out
//         </button>
//       </div>
//     );
//   }
//   return (
//     <>
//       <p className="mr-4">Not signed in</p>
//       <button
//         onClick={() => signIn("google")}
//         className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
//       >
//         Sign in with Google
//       </button>
//     </>
//   );
// }

// src/components/LoginBtn.jsx
"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import Image from "next/image";
import { useState, useRef, useEffect } from "react";

export default function LoginBtn() {
  const { data: session, status } = useSession();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center h-8 w-8">
        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
      </div>
    );
  }

  if (session) {
    return (
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center space-x-2 focus:outline-none"
        >
          <div className="flex items-center space-x-2">
            {session.user.image ? (
              <Image
                src={session.user.image}
                alt={session.user.name || "User avatar"}
                width={32}
                height={32}
                className="rounded-full border-2 border-indigo-500"
              />
            ) : (
              <div className="h-8 w-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center text-white font-medium">
                {session.user.name ? session.user.name[0] : "U"}
              </div>
            )}
            <span className="hidden md:block text-sm text-gray-200">
              {session.user.name?.split(' ')[0] || session.user.email?.split('@')[0] || "User"}
            </span>
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className={`h-4 w-4 text-gray-300 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} 
              viewBox="0 0 20 20" 
              fill="currentColor"
            >
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </div>
        </button>

        {dropdownOpen && (
          <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white dark:bg-slate-800 ring-1 ring-black ring-opacity-5 z-50">
            <div className="py-1" role="menu" aria-orientation="vertical">
              <div className="px-4 py-2 border-b border-gray-100 dark:border-slate-700">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-200">{session.user.name || "User"}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{session.user.email}</p>
              </div>
              <a
                href="/profile"
                className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-700"
                role="menuitem"
              >
                Your Profile
              </a>
              <a
                href="/settings"
                className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-700"
                role="menuitem"
              >
                Settings
              </a>
              <button
                onClick={() => signOut()}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-700 border-t border-gray-100 dark:border-slate-700"
                role="menuitem"
              >
                Sign out
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-3">
      <button
        onClick={() => signIn("google")}
        className="flex items-center text-sm bg-white/10 hover:bg-white/20 text-white font-medium py-1.5 px-3 rounded-lg transition-colors duration-200 border border-white/20"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-4 h-4 mr-2">
          <path fill="currentColor" d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"/>
        </svg>
        <span>Sign in</span>
      </button>
    </div>
  );
}