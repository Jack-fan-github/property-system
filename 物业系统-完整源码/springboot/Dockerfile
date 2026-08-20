FROM maven:3.9.9-eclipse-temurin-17 AS build
WORKDIR /build
COPY maven-settings.xml /root/.m2/settings.xml
COPY pom.xml .
COPY core-api/pom.xml core-api/pom.xml
COPY core-auth/pom.xml core-auth/pom.xml
COPY core-common/pom.xml core-common/pom.xml
COPY core-domain/pom.xml core-domain/pom.xml
COPY core-system/pom.xml core-system/pom.xml
COPY core-business/pom.xml core-business/pom.xml
COPY . .
# 镜像构建不需要测试产物。maven.test.skip 会连测试编译也跳过，避免下载仅测试使用的依赖；
# 下载过程中出现短暂网络中断时 Maven 会自动重试。
RUN mvn -B -Dmaven.test.skip=true -Dmaven.wagon.http.retryHandler.count=10 -Dmaven.wagon.httpconnectionManager.ttlSeconds=120 -Dmaven.wagon.http.pool=false package

FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=build /build/core-api/target/*.jar /app/app.jar
RUN mkdir -p /app/files
EXPOSE 8080
# application.yml 位于 classpath:/resources/（项目历史目录结构），显式指定，
# 否则 Spring Boot 会回退到 localhost，导致容器无法连接 Redis/MySQL。
ENTRYPOINT ["java", "-jar", "/app/app.jar", "--spring.config.location=classpath:/application.yml", "--spring.data.redis.host=redis", "--spring.data.redis.port=6379"]
