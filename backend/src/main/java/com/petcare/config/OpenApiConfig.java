package com.petcare.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

// Chi de doi ten/mo ta hien thi tren trang Swagger UI (/swagger-ui.html)
// Springdoc tu quet tat ca @RestController co san, khong can annotation them.
@Configuration
public class OpenApiConfig {
    @Bean
    public OpenAPI petcareOpenAPI() {
        return new OpenAPI().info(new Info()
                .title("PetCare System API")
                .description("API cho he thong cua hang & dich vu cham soc thu cung. " +
                        "Dung cho team frontend tham khao request/response cua tung endpoint.")
                .version("v1.0"));
    }
}
