package com.stepup.config;

import lombok.extern.slf4j.Slf4j;
import org.flywaydb.core.Flyway;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.jpa.autoconfigure.EntityManagerFactoryDependsOnPostProcessor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import javax.sql.DataSource;

/**
 * Spring Boot 4.0 removed FlywayAutoConfiguration — Flyway must be configured manually.
 * This class:
 *   1. Creates and runs Flyway migrations at startup.
 *   2. Registers EntityManagerFactoryDependsOnPostProcessor so Hibernate schema validation
 *      always runs AFTER Flyway migrations complete.
 */
@Configuration
@Slf4j
public class FlywayConfig {

    @Value("${spring.flyway.baseline-on-migrate:false}")
    private boolean baselineOnMigrate;

    @Bean
    public Flyway flyway(DataSource dataSource) {
        log.info("=== Flyway: Configuring migrations (baselineOnMigrate={}) ===", baselineOnMigrate);
        Flyway flyway = Flyway.configure()
                .dataSource(dataSource)
                .locations("classpath:db/migration")
                .baselineOnMigrate(baselineOnMigrate)
                .validateOnMigrate(true)
                .cleanDisabled(true)
                .outOfOrder(false)
                .load();
        log.info("=== Flyway: Running migrations... ===");
        flyway.migrate();
        log.info("=== Flyway: Migrations completed. ===");
        return flyway;
    }

    /**
     * Makes EntityManagerFactory depend on the flyway bean so Hibernate never validates
     * the schema before Flyway has run. Required because Spring Boot 4 no longer provides
     * this ordering automatically.
     */
    @Bean
    public static EntityManagerFactoryDependsOnPostProcessor flywayEntityManagerFactoryDependsOnPostProcessor() {
        return new EntityManagerFactoryDependsOnPostProcessor("flyway");
    }
}
