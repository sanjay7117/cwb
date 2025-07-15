import { useState } from "react";
import { Button } from "./ui/button";
import { Copy, Users, ShieldCheck, Globe, PenTool, Clock } from "lucide-react";
import { useAuth } from "../hooks/use-auth";

interface LandingProps {
  onEnterRoom: (roomId: string) => void;
}

export default function Landing({ onEnterRoom }: LandingProps) {
  const { user, isAuthenticated, login, signup, logout } = useAuth();
  const [currentView, setCurrentView] = useState<"landing" | "login" | "signup" | "room">("landing");
  const [roomType, setRoomType] = useState<"public" | "private" | null>(null);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [signupData, setSignupData] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [authError, setAuthError] = useState<string>("");
  const [authLoading, setAuthLoading] = useState(false);

  const generateRoom = () => {
    if (!roomType) return;
    const id = `room-${roomType}-${Math.random().toString(36).substr(2, 6)}`;
    setRoomId(id);
    setCurrentView("room");
  };

  const handleCopy = async () => {
    if (!roomId) return;
    await navigator.clipboard.writeText(`${window.location.origin}/room/${roomId}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError("");
    
    const result = await login(loginData.email, loginData.password);
    
    if (result.success) {
      setCurrentView("landing");
      setLoginData({ email: "", password: "" });
    } else {
      setAuthError(result.message);
    }
    
    setAuthLoading(false);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (signupData.password !== signupData.confirmPassword) {
      setAuthError("Passwords do not match");
      return;
    }
    
    setAuthLoading(true);
    setAuthError("");
    
    const result = await signup(signupData.name, signupData.email, signupData.password);
    
    if (result.success) {
      setCurrentView("login");
      setSignupData({ name: "", email: "", password: "", confirmPassword: "" });
      setAuthError("Account created successfully! Please sign in.");
    } else {
      setAuthError(result.message);
    }
    
    setAuthLoading(false);
  };

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="min-h-screen w-full relative overflow-hidden">
      {/* Dynamic Worldwide Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900"></div>
      
      {/* Animated World Map Pattern */}
      <div className="absolute inset-0 opacity-5" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        backgroundSize: '60px 60px'
      }}></div>
      
      {/* Global Network Lines */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-400/30 to-transparent animate-pulse"></div>
        <div className="absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-purple-400/30 to-transparent animate-pulse delay-1000"></div>
        <div className="absolute top-3/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent animate-pulse delay-2000"></div>
      </div>
      
      {/* Floating Global Elements */}
      <div className="absolute top-20 left-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute top-40 right-10 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      <div className="absolute bottom-20 left-1/3 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
      <div className="absolute bottom-40 right-1/4 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl animate-pulse delay-3000"></div>
      
      {/* Content */}
      <div className="relative z-10 text-white">
        
        {/* Navigation */}
        <nav className="flex justify-between items-center p-6 backdrop-blur-sm bg-white/5 border-b border-white/10">
          <div className="flex items-center space-x-2">
            <Globe className="w-8 h-8 text-blue-400" />
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              CollabBoard
            </span>
          </div>
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <span className="text-white/80">Welcome, {user?.name}!</span>
                <Button
                  variant="outline"
                  onClick={handleLogout}
                  className="bg-white/10 border-white/30 text-white hover:bg-white/20"
                >
                  Sign Out
                </Button>
              </div>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={() => setCurrentView("login")}
                  className="bg-white/10 border-white/30 text-white hover:bg-white/20"
                >
                  Sign In
                </Button>
                <Button
                  onClick={() => setCurrentView("signup")}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700"
                >
                  Sign Up
                </Button>
              </>
            )}
          </div>
        </nav>

        {/* Main Content */}
        <div className="flex flex-col items-center px-6">
          
          {/* Landing View */}
          {currentView === "landing" && (
            <>
              {/* Hero Section */}
              <section className="text-center mt-20 mb-16 max-w-4xl">
                <h1 className="text-5xl font-extrabold mb-6 bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent leading-tight">
                  🎨 CollabBoard
                </h1>
                
                <p className="text-xl max-w-2xl mx-auto text-white/80 leading-relaxed mb-8">
                  A blazing-fast, real-time collaborative whiteboard built for creativity, brainstorming, and teamwork.
                </p>
              </section>

              {/* Quick Room Creation */}
              <section className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10 mb-16 w-full max-w-2xl">
                <h3 className="text-2xl font-bold text-center mb-6">Create a Room</h3>
                
                {!roomId && (
                  <div className="text-center space-y-6">
                    <div>
                      <label className="block text-lg font-semibold mb-4">Choose Room Type:</label>
                      <div className="flex justify-center gap-4">
                        <Button
                          variant={roomType === "private" ? "default" : "outline"}
                          onClick={() => setRoomType("private")}
                          className="bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20 hover:border-white/50 transition-all duration-300"
                        >
                          🔒 Private Room
                        </Button>
                        <Button
                          variant={roomType === "public" ? "default" : "outline"}
                          onClick={() => setRoomType("public")}
                          className="bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20 hover:border-white/50 transition-all duration-300"
                        >
                          🌐 Public Room
                        </Button>
                      </div>
                    </div>

                    <Button
                      onClick={generateRoom}
                      disabled={!roomType}
                      className="px-8 py-3 text-lg bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Generate Room Link
                    </Button>
                  </div>
                )}
              </section>

              {/* Core Features */}
              <section className="w-full max-w-6xl">
                <h2 className="text-3xl font-bold text-center mb-10 bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
                  Why Choose CollabBoard?
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  <Feature icon={<Users className="w-8 h-8 mx-auto mb-2" />} title="Live Collaboration" desc="Work together in real-time with instant drawing sync." />
                  <Feature icon={<PenTool className="w-8 h-8 mx-auto mb-2" />} title="Smart Drawing Tools" desc="Use shapes, emojis, pens, and more — beautifully." />
                  <Feature icon={<Clock className="w-8 h-8 mx-auto mb-2" />} title="Persistent History" desc="Your canvas is saved, and undo/redo is always available." />
                  <Feature icon={<Globe className="w-8 h-8 mx-auto mb-2" />} title="Public & Private Rooms" desc="Generate rooms for your team or personal sketches." />
                  <Feature icon={<ShieldCheck className="w-8 h-8 mx-auto mb-2" />} title="Secure" desc="Private rooms are accessible only via link." />
                  <Feature icon={<Copy className="w-8 h-8 mx-auto mb-2" />} title="Shareable Links" desc="One-click copy to invite others." />
                </div>
              </section>
            </>
          )}

          {/* Login View */}
          {currentView === "login" && (
            <div className="mt-20 w-full max-w-md">
              <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20">
                <h2 className="text-3xl font-bold text-center mb-8">Welcome Back</h2>
                <form onSubmit={handleLogin} className="space-y-6">
                  {authError && (
                    <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 text-red-200 text-sm">
                      {authError}
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium mb-2">Email</label>
                    <input
                      type="email"
                      value={loginData.email}
                      onChange={(e) => setLoginData({...loginData, email: e.target.value})}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-blue-400"
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Password</label>
                    <input
                      type="password"
                      value={loginData.password}
                      onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-blue-400"
                      placeholder="Enter your password"
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={authLoading}
                    className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700"
                  >
                    {authLoading ? "Signing In..." : "Sign In"}
                  </Button>
                </form>
                <div className="mt-6 text-center">
                  <button
                    onClick={() => setCurrentView("signup")}
                    className="text-blue-400 hover:text-blue-300 text-sm"
                  >
                    Don't have an account? Sign up
                  </button>
                </div>
                <div className="mt-4 text-center">
                  <button
                    onClick={() => setCurrentView("landing")}
                    className="text-white/60 hover:text-white text-sm"
                  >
                    ← Back to home
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Signup View */}
          {currentView === "signup" && (
            <div className="mt-20 w-full max-w-md">
              <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20">
                <h2 className="text-3xl font-bold text-center mb-8">Join CollabBoard</h2>
                <form onSubmit={handleSignup} className="space-y-6">
                  {authError && (
                    <div className={`border rounded-lg p-3 text-sm ${
                      authError.includes('successfully') 
                        ? 'bg-green-500/20 border-green-500/50 text-green-200'
                        : 'bg-red-500/20 border-red-500/50 text-red-200'
                    }`}>
                      {authError}
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium mb-2">Full Name</label>
                    <input
                      type="text"
                      value={signupData.name}
                      onChange={(e) => setSignupData({...signupData, name: e.target.value})}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-blue-400"
                      placeholder="Enter your full name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Email</label>
                    <input
                      type="email"
                      value={signupData.email}
                      onChange={(e) => setSignupData({...signupData, email: e.target.value})}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-blue-400"
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Password</label>
                    <input
                      type="password"
                      value={signupData.password}
                      onChange={(e) => setSignupData({...signupData, password: e.target.value})}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-blue-400"
                      placeholder="Create a password"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Confirm Password</label>
                    <input
                      type="password"
                      value={signupData.confirmPassword}
                      onChange={(e) => setSignupData({...signupData, confirmPassword: e.target.value})}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-blue-400"
                      placeholder="Confirm your password"
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={authLoading}
                    className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700"
                  >
                    {authLoading ? "Creating Account..." : "Create Account"}
                  </Button>
                </form>
                <div className="mt-6 text-center">
                  <button
                    onClick={() => setCurrentView("login")}
                    className="text-blue-400 hover:text-blue-300 text-sm"
                  >
                    Already have an account? Sign in
                  </button>
                </div>
                <div className="mt-4 text-center">
                  <button
                    onClick={() => setCurrentView("landing")}
                    className="text-white/60 hover:text-white text-sm"
                  >
                    ← Back to home
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Room Created View */}
          {currentView === "room" && roomId && (
            <div className="mt-20 w-full max-w-2xl">
              <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20 text-center">
                <div className="mb-6">
                  <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Globe className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-3xl font-bold mb-2">Room Created Successfully!</h2>
                  <p className="text-white/80">Your collaborative workspace is ready</p>
                </div>
                
                <div className="bg-white/5 rounded-lg p-6 mb-6">
                  <p className="font-semibold mb-3">Share this link with your team:</p>
                  <div className="flex items-center justify-between bg-white/10 px-4 py-3 rounded-lg border border-white/20">
                    <span className="truncate text-sm font-mono">{`${window.location.origin}/room/${roomId}`}</span>
                    <button 
                      onClick={handleCopy}
                      className="ml-3 p-2 hover:bg-white/10 rounded transition-colors"
                    >
                      <Copy className="w-5 h-5 text-blue-400 hover:text-blue-300" />
                    </button>
                  </div>
                  {copied && <p className="text-green-400 text-sm mt-2">✓ Copied to clipboard!</p>}
                </div>
                
                <div className="flex gap-4 justify-center">
                  <Button
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700"
                    onClick={() => roomId && onEnterRoom(roomId)}
                  >
                    Enter Room
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {setCurrentView("landing"); setRoomId(null); setRoomType(null);}}
                    className="px-6 py-3 bg-white/10 border-white/30 text-white hover:bg-white/20"
                  >
                    Create Another
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Feature({ icon, title, desc }: { icon: JSX.Element; title: string; desc: string }) {
  return (
    <div className="bg-white/5 backdrop-blur-xl p-6 rounded-xl border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300 hover:transform hover:scale-105 hover:shadow-2xl">
      <div className="text-blue-400 mb-3">{icon}</div>
      <h3 className="font-semibold text-lg mb-2">{title}</h3>
      <p className="text-sm text-white/80">{desc}</p>
    </div>
  );
}