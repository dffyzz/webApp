package com.example.web.message;

import com.example.web.chatroom.ChatRoom;
import com.example.web.chatroom.ChatRoomRepository;
import com.example.web.user.User;
import com.example.web.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MessageService {

    private final MessageRepository messageRepository;
    private final ChatRoomRepository chatRoomRepository;
    private final UserRepository userRepository;

    private final SimpMessagingTemplate messagingTemplate;

    @Transactional
    public Message saveMessage(String content, Long chatRoomId, String userEmail) {
        ChatRoom chatRoom = chatRoomRepository.findById(chatRoomId)
                .orElseThrow(() -> new RuntimeException("Chat room not found"));
        User user = userRepository.findByNickname(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Message message = Message.builder()
                .content(content)
                .chatRoom(chatRoom)
                .sender(user)
                .timestamp(LocalDateTime.now())
                .build();
        return messageRepository.save(message);
    }

    @Transactional(readOnly = true)
    public List<MessageDTO> getMessagesForChatRoom(Long chatRoomId) {
        ChatRoom chatRoom = chatRoomRepository.findById(chatRoomId)
                .orElseThrow(() -> new RuntimeException("Chat room not found"));
        List<Message> messages = messageRepository.findByChatRoom(chatRoom);
        return messages.stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    private MessageDTO convertToDTO(Message message) {
        return new MessageDTO(
                message.getChatRoom().getId(),
                message.getContent(),
                message.getSender().getNickname(),
                message.getTimestamp().toString()
        );
    }

    public Message sendMessage(Long chatRoomId, String content, String senderEmail) {
        ChatRoom chatRoom = chatRoomRepository.findById(chatRoomId)
                .orElseThrow(() -> new RuntimeException("Chat room not found"));
        User sender = userRepository.findByNickname(senderEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Message message = Message.builder()
                .content(content)
                .sender(sender)
                .chatRoom(chatRoom)
                .timestamp(LocalDateTime.now())
                .build();

        Message savedMessage = messageRepository.save(message);

        messagingTemplate.convertAndSend("/topic/chat/" + chatRoomId, savedMessage);

        return savedMessage;
    }
}
