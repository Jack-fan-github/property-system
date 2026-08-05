FROM maven:3.9.9-eclipse-temurin-17 AS build
WORKDIR /build
COPY pom.xml .
COPY core-api/pom.xml core-api/pom.xml
COPY core-auth/pom.xml core-auth/pom.xml
COPY core-common/pom.xml core-common/pom.xml
COPY core-domain/pom.xml core-domain/pom.xml
COPY core-system/pom.xml core-system/pom.xml
COPY core-business/pom.xml core-business/pom.xml
RUN mvn -B -DskipTests dependency:go-offline
COPY . .
RUN mvn -B -DskipTests package

FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=build /build/core-api/target/*.jar /app/app.jar
RUN mkdir -p /app/files
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
