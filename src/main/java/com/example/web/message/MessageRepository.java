package com.example.web.message;

import com.example.web.chatroom.ChatRoom;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MessageRepository extends JpaRepository<Message, Long> {
//    List<Message> findByChatRoomId(Long chatRoomId);
    List<Message> findByChatRoom(ChatRoom chatRoom);
}
