import React, { useState, useEffect } from "react";
import { useUser } from "@/src/contexts/UserContext";
import { updateUser } from "@/src/client/firebase.service.client";
import { useRTVIClientEvent } from "realtime-ai-react";
import { RTVIEvent } from "realtime-ai";
import { defaultUser } from "@/src/models/user";

const Profile: React.FC = () => {
  const { user, fetchUser } = useUser();
  const [copiedUser, setCopiedUser] = useState(defaultUser);
  const [isVisible, setIsVisible] = useState(true);

  useRTVIClientEvent(RTVIEvent.BotConnected, () => setIsVisible(false));
  useRTVIClientEvent(RTVIEvent.Disconnected, () => setIsVisible(true));

  useEffect(() => {
    console.log('user', user);
    if (user) setCopiedUser(user);
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const [key, subkey] = name.split('.') as ['profile' | 'preferences', string];
    setCopiedUser((prevUser) => ({ ...prevUser, [key]: { ...prevUser[key], [subkey]: value } }));
  };

  const handleSave = async () => {
    await updateUser(copiedUser);
    await fetchUser();
  };

  if (!isVisible) return null;

  return (
    <div className="flex justify-center items-center bg-gray-900">
      <div className="w-full max-w-md p-8 bg-gray-800 rounded-xl shadow-lg">
        <h2 className="text-3xl font-bold mb-6 text-center text-white">Profile Settings</h2>
        <div className="space-y-6">
          <div className="flex flex-col">
            <label className="mb-2 text-sm font-medium text-gray-300">Name:</label>
            <input 
              type="text" 
              name="profile.name" 
              value={copiedUser.profile?.name || ''} 
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50" 
            />
          </div>
          <div className="flex flex-col">
            <label className="mb-2 text-sm font-medium text-gray-300">Phone:</label>
            <input 
              type="text" 
              name="profile.phone" 
              value={copiedUser.profile?.phone || ''} 
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50" 
            />
          </div>
          <div className="flex flex-col">
            <label className="mb-2 text-sm font-medium text-gray-300">City:</label>
            <input 
              type="text" 
              name="profile.city" 
              value={copiedUser.profile?.city || ''} 
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50" 
            />
          </div>
          <button 
            onClick={handleSave}
            className="w-full mt-8 py-3 px-6 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium transition duration-300 ease-in-out transform hover:scale-105"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile; 