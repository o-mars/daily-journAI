import React from "react";
import { useDailySessionContext } from "@/src/contexts/DailySessionContext";
import Conversation from "../Conversation";

const DailyConversation: React.FC = () => {
  const { messages: liveMessages, isTextInputVisible } = useDailySessionContext();

  return (
    <Conversation 
      messages={liveMessages}
      isTextInputVisible={isTextInputVisible}
      staticHeight={false}
    />
  );
};

export default DailyConversation;