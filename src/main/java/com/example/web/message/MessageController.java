package com.example.web.message;

import com.example.web.chatroom.ChatRoom;
import com.example.web.chatroom.ChatRoomRepository;
import com.example.web.user.User;
import com.example.web.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/messages")
@CrossOrigin(origins = "${application.config.host}")
@RequiredArgsConstructor
public class MessageController {

    private final MessageService messageService;
    private final UserRepository userRepository;
    private final ChatRoomRepository chatRoomRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @GetMapping("/{chatRoomId}")
    public ResponseEntity<List<MessageDTO>> getMessagesForChatRoom(@PathVariable Long chatRoomId) {
        List<MessageDTO> messages = messageService.getMessagesForChatRoom(chatRoomId);
        return ResponseEntity.ok(messages);
    }

    @MessageMapping("/send/{chatRoomId}")
    @SendTo("/topic/chat/{chatRoomId}")
    public MessageDTO sendMessage(@DestinationVariable Long chatRoomId, @Payload MessageDTO messageDTO) {
        messageService.saveMessage(messageDTO.getContent(), chatRoomId, messageDTO.getNickname());
        return messageDTO;
    }

    @MessageMapping("/removeUser/{chatRoomId}")
    public void removeUserFromChat(@DestinationVariable Long chatRoomId, @Payload String nickname) {
        ChatRoom chatRoom = chatRoomRepository.findById(chatRoomId)
                .orElseThrow(() -> new RuntimeException("Chat room not found"));
        User user = userRepository.findByNickname(nickname)
                .orElseThrow(() -> new RuntimeException("User not found"));

        chatRoom.getUsers().remove(user);
        chatRoomRepository.save(chatRoom);

        messagingTemplate.convertAndSend("/topic/chat/" + chatRoomId + "/userRemoved", nickname);
    }
}
