import { useNavigate } from "react-router-dom";

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-[#1e1f22] text-white">
      {/* Header */}
      <header className="flex justify-between items-center p-6 bg-[#2b2d31]">
        <h1
          className="text-2xl font-bold cursor-pointer"
          onClick={() => navigate("/")}
        >
          TeamChat
        </h1>
        <div className="flex gap-4">
          <button
            className="px-4 py-2 bg-indigo-600 rounded hover:bg-indigo-700"
            onClick={() => navigate("/login")}
          >
            Login
          </button>
          <button
            className="px-4 py-2 border border-indigo-600 rounded hover:bg-indigo-700"
            onClick={() => navigate("/signup")}
          >
            Sign Up
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center text-center flex-[1_1_auto] min-h-[85vh] p-16">
        <h2 className="text-7xl font-bold mb-6">TeamChat — Connect Instantly</h2>
        <p className="text-gray-300 text-xl mb-4 max-w-2xl">
          Collaborate with your team like never before. Create channels, chat in real-time, and stay on top of your team’s activity.
        </p>
        <p className="text-indigo-400 font-semibold mb-8 text-lg">
          “Your workspace, your way — faster, smarter, together.”
        </p>
        <div className="flex gap-6">
          <button
            className="px-8 py-4 bg-indigo-600 rounded hover:bg-indigo-700 font-semibold text-lg"
            onClick={() => navigate("/signup")}
          >
            Get Started
          </button>
          <button
            className="px-8 py-4 border border-indigo-600 rounded hover:bg-indigo-700 font-semibold text-lg"
            onClick={() => navigate("/login")}
          >
            Login
          </button>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-[#2b2d31] p-16">
        <h3 className="text-4xl font-bold text-center mb-12">Features</h3>
        <div className="grid md:grid-cols-3 gap-12">
          {/* Card 1 */}
          <div className="p-8 bg-[#1f2023] rounded-lg shadow hover:shadow-xl transition min-h-[220px] flex flex-col justify-center">
            <h4 className="font-bold text-2xl mb-4">Real-Time Messaging</h4>
            <p className="text-gray-300 text-lg">
              Instantly send and receive messages with your team, no delays.
            </p>
          </div>

          {/* Card 2 */}
          <div className="p-8 bg-[#1f2023] rounded-lg shadow hover:shadow-xl transition min-h-[220px] flex flex-col justify-center">
            <h4 className="font-bold text-2xl mb-4">Channels</h4>
            <p className="text-gray-300 text-lg">
              Organize conversations by channels and keep discussions focused.
            </p>
          </div>

          {/* Card 3 */}
          <div className="p-8 bg-[#1f2023] rounded-lg shadow hover:shadow-xl transition min-h-[220px] flex flex-col justify-center">
            <h4 className="font-bold text-2xl mb-4">Online Presence</h4>
            <p className="text-gray-300 text-lg">
              See who’s online and available for instant collaboration.
            </p>
          </div>

          {/* Card 4 */}
          <div className="p-8 bg-[#1f2023] rounded-lg shadow hover:shadow-xl transition min-h-[220px] flex flex-col justify-center">
            <h4 className="font-bold text-2xl mb-4">Message History</h4>
            <p className="text-gray-300 text-lg">
              Never lose track of conversations. Access message history anytime.
            </p>
          </div>

          {/* Card 5 */}
          <div className="p-8 bg-[#1f2023] rounded-lg shadow hover:shadow-xl transition min-h-[220px] flex flex-col justify-center">
            <h4 className="font-bold text-2xl mb-4">Typing Indicator</h4>
            <p className="text-gray-300 text-lg">
              Know when your teammates are typing to stay in sync.
            </p>
          </div>

          {/* Card 6 */}
          <div className="p-8 bg-[#1f2023] rounded-lg shadow hover:shadow-xl transition min-h-[220px] flex flex-col justify-center">
            <h4 className="font-bold text-2xl mb-4">Dark Theme</h4>
            <p className="text-gray-300 text-lg">
              Work comfortably with a modern dark theme, easy on the eyes.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#2b2d31] p-6 text-center text-gray-400 space-y-1">
        <p>Developed by Krishna Mudgal</p>
        <p>
          Contact:{" "}
          <a href="mailto:krishna@example.com" className="underline">
            krishna@example.com
          </a>
        </p>
        <p>© {new Date().getFullYear()} TeamChat. All rights reserved.</p>
      </footer>
    </div>
  );
}
