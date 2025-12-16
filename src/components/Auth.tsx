// import { useState } from 'react';
// import { supabase } from '../lib/supabase';
// import { AlertTriangle, LogIn } from 'lucide-react';

// export default function Auth() {
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [isSignUp, setIsSignUp] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [message, setMessage] = useState<string | null>(null);

//   const handleAuth = async (e: React.FormEvent<HTMLFormElement>) => {
//     e.preventDefault();
//     setLoading(true);
//     setError(null);
//     setMessage(null);

//     try {
//       let response;
//       if (isSignUp) {
//         response = await supabase.auth.signUp({ email, password });
//         if (!response.error) {
//           setMessage('Check your email for a confirmation link to complete your registration.');
//         }
//       } else {
//         response = await supabase.auth.signInWithPassword({ email, password });
//       }

//       if (response.error) {
//         throw response.error;
//       }
//     } catch (error: any) {
//       setError(error.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 flex items-center justify-center">
//       <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
//         <div className="flex flex-col items-center mb-6">
//           <div className="p-3 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-full mb-3">
//             <LogIn className="w-8 h-8 text-white" />
//           </div>
//           <h2 className="text-3xl font-bold text-gray-900">
//             {isSignUp ? 'Create an Account' : 'Welcome Back'}
//           </h2>
//           <p className="text-gray-500 mt-1">
//             {isSignUp ? 'Get started with your financial journey.' : 'Sign in to access your dashboard.'}
//           </p>
//         </div>

//         {error && (
//           <div className="p-4 mb-4 bg-red-100 border-l-4 border-red-500 text-red-700 flex items-center gap-3">
//             <AlertTriangle className="w-5 h-5" />
//             <p>{error}</p>
//           </div>
//         )}

//         {message && (
//           <div className="p-4 mb-4 bg-green-100 border-l-4 border-green-500 text-green-700">
//             <p>{message}</p>
//           </div>
//         )}

//         <form onSubmit={handleAuth} className="space-y-6">
//           <div>
//             <label className="block text-sm font-semibold text-gray-700 mb-2">
//               Email Address
//             </label>
//             <input
//               type="email"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               onFocus={() => {
//                 setError(null);
//                 setMessage(null);
//               }}
//               className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
//               placeholder="you@example.com"
//               required
//             />
//           </div>

//           <div>
//             <label className="block text-sm font-semibold text-gray-700 mb-2">
//               Password
//             </label>
//             <input
//               type="password"
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//               onFocus={() => {
//                 setError(null);
//                 setMessage(null);
//               }}
//               className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
//               placeholder="••••••••"
//               required
//             />
//           </div>

//           <div className="pt-2">
//             <button
//               type="submit"
//               disabled={loading}
//               className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2 disabled:bg-gray-400"
//             >
//               {loading ? 'Processing...' : (isSignUp ? 'Sign Up' : 'Sign In')}
//             </button>
//           </div>
//         </form>

//         <div className="mt-6 text-center">
//           <button
//             onClick={() => setIsSignUp(!isSignUp)}
//             className="text-sm text-blue-600 hover:underline"
//           >
//             {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }
