const PrivacyPolicy: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
      <div className="space-y-4">
        <p>All data is stored securely and protected from unauthorized access.</p>
        <p>Your data is never shared, sold, or given to third parties under any circumstances.</p>
        <p>Data might be accessed by our team in order to improve the user experience.</p>
        {/* Add more privacy policy content as needed */}
      </div>
    </div>
  );
};

export default PrivacyPolicy;