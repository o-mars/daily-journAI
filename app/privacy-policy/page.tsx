const PrivacyPolicy: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-bold mb-8 text-blue-400">Privacy Policy</h1>
        
        <div className="space-y-6 text-gray-300">
          <section className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-white">Privacy</h2>
            <p className="leading-relaxed">
              All data is stored securely and protected from unauthorized access.
            </p>
            <br />
            <p className="leading-relaxed">
              Your data is never shared, sold, or given to third parties under any circumstances.
            </p>
          </section>

          <section className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-white">Data Retention</h2>
            <p className="leading-relaxed">
              You can delete your data or account at any time, which will permanently remove all your data from our systems.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;