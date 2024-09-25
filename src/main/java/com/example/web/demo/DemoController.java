package com.example.web.demo;

import io.swagger.v3.oas.annotations.Hidden;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@CrossOrigin(origins = "${application.config.host}")
@RequestMapping("/api/v1/test")
@Hidden
public class DemoController {

  @GetMapping
  public ResponseEntity<String> sayHello() {
    return ResponseEntity.ok("Привет!)");
  }

}
