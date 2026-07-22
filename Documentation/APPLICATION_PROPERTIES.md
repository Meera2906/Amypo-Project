# APPLICATION_PROPERTIES

This document explains every line in `application.properties`.

---

## File Location

`backend/src/main/resources/application.properties`

---

## All Lines Explained

```properties
spring.application.name=demo
# for https
server.forward-headers-strategy=framework 
spring.datasource.url=jdbc:mysql://localhost:3306/loomlearn
spring.datasource.username=root
spring.datasource.password=root
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
```

---

### Line 1: `spring.application.name=demo`

**What it does:** Sets the name of the Spring Boot application to "demo".

**Why it matters:**
- This name is used in log messages (e.g., `demo - Started DemoApplication`).
- It's used by Spring Cloud (if you use it) for service discovery.
- It's used in actuator endpoints (if you use them).

**What happens if removed:** Spring Boot uses the default name, which is usually the artifact name from `pom.xml` (which is "demo" in this case).

---

### Line 2: `# for https`

**What it does:** This is a comment. It explains the next line.

**Why it matters:** Comments help developers understand the purpose of configuration.

---

### Line 3: `server.forward-headers-strategy=framework`

**What it does:** Tells Spring Boot to forward HTTP headers (like `X-Forwarded-For`, `X-Forwarded-Proto`) from the reverse proxy (e.g., nginx, Apache) to the application.

**Why it matters:**
- If the application is behind a reverse proxy (e.g., for HTTPS termination), the proxy adds headers like `X-Forwarded-Proto: https` to indicate the original request was HTTPS.
- Without this setting, Spring Boot might not recognize that the original request was HTTPS, which can cause issues with security (e.g., redirect loops, incorrect cookie flags).
- `framework` means Spring's own `ForwardedHeaderFilter` is used to process these headers.

**What happens if removed:** Spring Boot uses its default strategy, which may not correctly handle forwarded headers. This can cause issues in production behind a reverse proxy.

---

### Line 4: `spring.datasource.url=jdbc:mysql://localhost:3306/loomlearn`

**What it does:** Sets the database connection URL.

**Breakdown:**
- `jdbc:mysql://` — The JDBC protocol for MySQL.
- `localhost:3306` — The database server is running on the local machine, port 3306 (default MySQL port).
- `loomlearn` — The name of the database.

**Why it matters:** This tells Spring Boot where to find the MySQL database. The application will try to connect to this URL when it starts.

**What happens if removed:** Spring Boot will try to use an in-memory database (H2) if it's on the classpath. If not, the application will fail to start.

---

### Line 5: `spring.datasource.username=root`

**What it does:** Sets the database username to "root".

**Why it matters:** This is the username used to connect to MySQL. "root" is the default MySQL administrator account.

**What happens if removed:** Spring Boot uses "sa" (the default for H2) or fails to connect.

---

### Line 6: `spring.datasource.password=root`

**What it does:** Sets the database password to "root".

**Why it matters:** This is the password for the MySQL "root" user.

**Security note:** Using "root" as both username and password is a security risk in production. In a real application, you should use a dedicated database user with limited privileges.

**What happens if removed:** Spring Boot uses an empty password or fails to connect.

---

### Line 7: `spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver`

**What it does:** Specifies the JDBC driver class for MySQL.

**Why it matters:** The JDBC driver is the Java library that implements the JDBC API for MySQL. It's responsible for translating Java database calls into MySQL protocol messages.

- `com.mysql.cj.jdbc.Driver` — The driver class for MySQL Connector/J 8.x. The "cj" stands for "Connector/J".

**What happens if removed:** Spring Boot usually auto-detects the driver from the URL. However, explicitly setting it ensures the correct driver is used.

---

### Line 8: `spring.jpa.hibernate.ddl-auto=update`

**What it does:** Tells Hibernate (the JPA implementation) what to do with the database schema when the application starts.

**Possible values:**
- `update` — Hibernate automatically creates or updates the database tables based on the entity classes. If a table doesn't exist, it creates it. If a table exists but has missing columns, it adds them. **It does NOT delete columns or tables.**
- `create` — Drops and recreates the database schema on every startup. **All data is lost!**
- `create-drop` — Creates the schema on startup and drops it on shutdown.
- `validate` — Validates that the schema matches the entities. Does NOT make any changes. Throws an error if there's a mismatch.
- `none` — Does nothing. The schema must be managed manually.

**Why `update` is used:** It's convenient for development — you can add new fields to entities and Hibernate will automatically add the corresponding columns. It doesn't delete data, so existing records are preserved.

**What happens if removed:** Spring Boot defaults to `none` for production or `update` for embedded databases. For MySQL, it would likely default to `none`, meaning tables must be created manually.

**Production note:** `update` is NOT recommended for production. Use database migration tools like Flyway or Liquibase instead.

---

### Line 9: `spring.jpa.show-sql=true`

**What it does:** Tells Hibernate to print all SQL statements to the console (standard output).

**Why it matters:**
- Useful for debugging — you can see exactly what SQL queries are being executed.
- Helps identify performance issues (e.g., N+1 query problems).
- Shows the parameter values being used in queries.

**Example output:**
```sql
Hibernate: 
    select
        u.id,
        u.full_name,
        u.email 
    from academic_users u 
    where u.email=?
```

**What happens if removed:** SQL statements are not printed. This is the default behavior.

**Production note:** Should be set to `false` in production, as printing SQL can slow down the application and expose sensitive data in logs.

---

## Properties NOT in the file but referenced in code

### `loomlearn.jwt.secret`

**Where it's used:** `JwtUtil.java`

```java
@Value("${loomlearn.jwt.secret:defaultSecretKeyWithAtLeast256BitsLengthToAvoidWeakExceptions!}")
private String secret;
```

**What it does:** Sets the JWT signing secret. If not set in `application.properties`, the default value is used.

**Why it matters:** The JWT secret is used to sign and verify JWT tokens. If someone knows the secret, they can forge tokens.

**What happens if not set:** The default secret is used, which is insecure for production.

### `loomlearn.jwt.expiration`

**Where it's used:** `JwtUtil.java`

```java
@Value("${loomlearn.jwt.expiration:86400000}")
private long expirationTime;
```

**What it does:** Sets the JWT token expiration time in milliseconds. The default is 86,400,000 ms (24 hours).

**Why it matters:** Tokens expire after this time. The client must re-authenticate to get a new token.

**What happens if not set:** The default (24 hours) is used.

---

## Summary Table

| Property | Value | Purpose |
|---|---|---|
| `spring.application.name` | `demo` | Application name for logs |
| `server.forward-headers-strategy` | `framework` | Handle reverse proxy headers |
| `spring.datasource.url` | `jdbc:mysql://localhost:3306/loomlearn` | Database connection URL |
| `spring.datasource.username` | `root` | Database username |
| `spring.datasource.password` | `root` | Database password |
| `spring.datasource.driver-class-name` | `com.mysql.cj.jdbc.Driver` | MySQL JDBC driver |
| `spring.jpa.hibernate.ddl-auto` | `update` | Auto-create/update tables |
| `spring.jpa.show-sql` | `true` | Print SQL to console |
| `loomlearn.jwt.secret` | *(not set, uses default)* | JWT signing secret |
| `loomlearn.jwt.expiration` | *(not set, uses default 86400000)* | JWT token expiration (24h) |

**Common Viva Questions:**
- Q: What does `ddl-auto=update` do?
- A: It automatically creates or updates database tables based on entity classes. It adds new columns but doesn't delete existing ones.
- Q: Why is `show-sql=true` useful?
- A: It prints all SQL queries to the console, which helps with debugging and performance analysis.
- Q: Is `ddl-auto=update` safe for production?
- A: No. It can cause data loss or corruption. In production, use database migration tools like Flyway or Liquibase.
- Q: What is the default JWT expiration time?
- A: 86,400,000 milliseconds (24 hours).
