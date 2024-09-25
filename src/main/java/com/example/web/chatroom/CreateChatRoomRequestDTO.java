package com.example.web.chatroom;

import lombok.Data;

@Data
public class CreateChatRoomRequestDTO {
    private String name;
    private String book;
    private String author;
    private String password;
}
