// // src/app/layout.js
// import { Inter } from "next/font/google";
// import "./globals.css";
// import AuthProvider from "@/components/AuthProvider";
// import Navbar from "@/components/Navbar"; // <-- Import Navbar

// const inter = Inter({ subsets: ["latin"] });

// export const metadata = {
//   title: "Xeno Mini CRM", // Updated title
//   description: "Mini CRM Platform for Xeno Internship Assignment",
// };

// export default function RootLayout({ children }) {
//   return (
//     <html lang="en">
//       <body className={`${inter.className} bg-gray-100 min-h-screen flex flex-col`}> {/* Added bg and flex structure */}
//         <AuthProvider>
//           <Navbar /> {/* <-- Add Navbar here */}
//           <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8"> {/* Added main content wrapper */}
//             {children}
//           </main>
//           {/* Optional: Footer */}
//           {/* <footer className="bg-gray-700 text-white text-center p-4 mt-auto">
//               © 2025 MiniCRM by [Your Name]
//           </footer> */}
//         </AuthProvider>
//       </body>
//     </html>
//   );
// }

// src/app/layout.js
import { Inter } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/components/AuthProvider";
import Navbar from "@/components/Navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "XenoCRM | AI-Powered Customer Relationship Management",
  description: "Next-generation AI-powered CRM platform for modern businesses by Xeno",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-slate-50 min-h-screen flex flex-col`}>
        <AuthProvider>
          <Navbar />
          <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </main>
          <footer className="bg-slate-800 text-white text-center p-4 mt-auto">
            <div className="container mx-auto">
              <p className="text-sm">© {new Date().getFullYear()} XenoCRM | Powered by AI</p>
            </div>
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}