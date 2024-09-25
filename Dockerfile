FROM eclipse-temurin:17-jdk-alpine
ARG JAR_FILE=target/*.jar
WORKDIR /app/backend
COPY ${JAR_FILE} app.jar
ENTRYPOINT ["java", "-jar", "app.jar"]