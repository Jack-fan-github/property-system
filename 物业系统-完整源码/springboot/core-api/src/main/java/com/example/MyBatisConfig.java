package com.example;

import com.zaxxer.hikari.HikariDataSource;
import org.apache.ibatis.session.SqlSessionFactory;
import org.mybatis.spring.SqlSessionFactoryBean;
import org.mybatis.spring.annotation.MapperScan;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.support.PathMatchingResourcePatternResolver;

import javax.sql.DataSource;

@Configuration
@MapperScan({
        "com.example.modules.auth.mapper",
        "com.example.modules.business.*.mapper",
        "com.example.modules.business.*.*.mapper",
        "com.example.modules.system.*.mapper",
        "com.example.modules.notice.mapper",
        "com.example.modules.repair.mapper"
})
public class MyBatisConfig {

    @Bean
    public DataSource dataSource() {
        HikariDataSource ds = new HikariDataSource();
        ds.setDriverClassName("com.mysql.cj.jdbc.Driver");
        ds.setJdbcUrl(System.getenv().getOrDefault("MYSQL_URL", "jdbc:mysql://localhost:3306/hr?useSSL=false&serverTimezone=Asia/Shanghai&allowPublicKeyRetrieval=true&useUnicode=true&characterEncoding=UTF-8&connectionCollation=utf8mb4_unicode_ci"));
        ds.setUsername(System.getenv().getOrDefault("MYSQL_USER", "root"));
        ds.setPassword(System.getenv().getOrDefault("MYSQL_PASSWORD", "123456"));
        return ds;
    }

    @Bean
    public SqlSessionFactory sqlSessionFactory(DataSource dataSource) throws Exception {
        SqlSessionFactoryBean factoryBean = new SqlSessionFactoryBean();
        factoryBean.setDataSource(dataSource);
        factoryBean.setMapperLocations(
                new PathMatchingResourcePatternResolver().getResources("classpath:mapper/*.xml")
        );
        factoryBean.setConfigLocation(
                new PathMatchingResourcePatternResolver().getResource("classpath:mybatis-config.xml")
        );
        return factoryBean.getObject();
    }
}
