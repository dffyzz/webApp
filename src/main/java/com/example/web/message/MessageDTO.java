package com.example.web.message;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class MessageDTO {
    private Long chatRoomId;
    private String content;
    private String nickname;
    private String time;
}
