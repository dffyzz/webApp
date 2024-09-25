package com.example.web.post;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PostDto {
    private String book;
    private String author;
    private String nickname;
    private String content;
    private LocalDateTime timestamp;
}
