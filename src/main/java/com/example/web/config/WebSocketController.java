package com.example.web.config;

import com.example.web.message.Message;
import com.example.web.message.MessageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

import java.time.LocalDateTime;

@Controller
public class WebSocketController {

    private final MessageService messageService;

    @Autowired
    public WebSocketController(MessageService messageService) {
        this.messageService = messageService;
    }

    @MessageMapping("/chat.sendMessage/{chatRoomId}")
    @SendTo("/topic/chat/{chatRoomId}")
    public Message sendMessage(@DestinationVariable Long chatRoomId, @Payload Message message) {
        System.out.println("sendMessage -> sendMessage");
        message.setTimestamp(LocalDateTime.now());
        messageService.saveMessage(message.getContent(), chatRoomId, message.getSender().getNickname());
        return message;
    }
}
