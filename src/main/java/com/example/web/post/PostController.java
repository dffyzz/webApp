package com.example.web.post;

import com.example.web.user.User;
import com.example.web.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/posts")
@CrossOrigin(origins = "${application.config.host}")
@RequiredArgsConstructor
public class PostController {
    private final PostService postService;
    private final UserRepository userRepository;

    @GetMapping
    public List<PostDto> getAllPosts() {
        List<Post> posts = postService.findAll();
        return posts.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    private PostDto convertToDto(Post post) {
        return new PostDto(
                post.getBook(),
                post.getAuthor(),
                post.getUser().getNickname(),
                post.getContent(),
                post.getTimestamp()
        );
    }

    @PostMapping
    public ResponseEntity<PostDto> createPost(
            @RequestBody CreatePostDto createPostDto,
            Principal principal)
    {
        User user = userRepository.findByNickname(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Post post = Post.builder()
                .book(createPostDto.getBook())
                .author(createPostDto.getAuthor())
                .user(user)
                .content(createPostDto.getContent())
                .timestamp(LocalDateTime.now())
                .build();

        Post savedPost = postService.save(post);

        PostDto postDto = new PostDto(
                savedPost.getBook(),
                savedPost.getAuthor(),
                savedPost.getUser().getNickname(),
                savedPost.getContent(),
                savedPost.getTimestamp()
        );

        return ResponseEntity.ok(postDto);
    }
}

