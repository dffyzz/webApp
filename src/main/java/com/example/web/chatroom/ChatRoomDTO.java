package com.example.web.chatroom;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ChatRoomDTO {
    private Long id;
    private String name;
    private String book;
    private String author;
    private boolean passwordProtected;
}
