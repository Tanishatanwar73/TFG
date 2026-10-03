import { chatService as supabaseChatService } from './supabase/chatService';

export const communityService = {
  async getChannels() {
    try {
      const channels = await supabaseChatService.getChannels();

      return channels || [];
    } catch (error) {
      console.error(
        'Failed to fetch chat channels from Supabase:',
        error
      );

      return [];
    }
  },

  async getMessages(channelId, isDM = false, dmUserId = null) {
    try {
      const messages = await supabaseChatService.getMessages(channelId);

      if (!messages) {
        return [];
      }

      if (isDM && dmUserId) {
        return messages.filter(
          (message) =>
            message.isDirectMessage &&
            (
              message.senderId === dmUserId ||
              message.recipientId === dmUserId
            )
        );
      }

      return messages.filter(
        (message) =>
          !message.isDirectMessage &&
          message.channelId === channelId
      );
    } catch (error) {
      console.error(
        'Failed to fetch chat messages from Supabase:',
        error
      );

      return [];
    }
  },

  async sendMessage(msgData) {
    try {
      const newMessage = {
        ...msgData,
        timestamp:
          msgData.timestamp ||
          new Date().toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          }),
        reactions: msgData.reactions || [],
      };

      const savedMessage =
        await supabaseChatService.sendMessage(newMessage);

      return savedMessage || newMessage;
    } catch (error) {
      console.error(
        'Failed to send message to Supabase:',
        error
      );

      return {
        success: false,
        error: error.message || 'Failed to send message',
      };
    }
  },
};

export default communityService;