# P0-CORE-002 Architecture Diagrams

## System Architecture Overview

```mermaid
graph TB
    subgraph "Client Layer"
        Browser[Browser]
        Mobile[Mobile App]
    end
    
    subgraph "Cloudflare Edge"
        CDN[Cloudflare CDN]
        Worker[RedwoodSDK Worker]
    end
    
    subgraph "Application Layer"
        App[RedwoodSDK App]
        Router[File-based Router]
        Components[React Components]
        ServerActions[Server Actions + EffectTS]
    end
    
    subgraph "Service Layer"
        EffectRuntime[Effect Runtime]
        DatabaseService[Database Service]
        StorageService[Storage Service]
        AIService[AI Service]
    end
    
    subgraph "Cloudflare Services"
        D1[(D1 Database)]
        R2[(R2 Storage)]
        AI[AI Gateway]
        Queue[Queues]
    end
    
    subgraph "Infrastructure"
        Alchemy[Alchemy IaC]
        GitHub[GitHub Repository]
        CI[CI/CD Pipeline]
    end
    
    Browser --> CDN
    Mobile --> CDN
    CDN --> Worker
    Worker --> App
    App --> Router
    App --> Components
    App --> ServerActions
    ServerActions --> EffectRuntime
    EffectRuntime --> DatabaseService
    EffectRuntime --> StorageService
    EffectRuntime --> AIService
    DatabaseService --> D1
    StorageService --> R2
    AIService --> AI
    EffectRuntime --> Queue
    
    GitHub --> CI
    CI --> Alchemy
    Alchemy --> Worker
    Alchemy --> D1
    Alchemy --> R2
    Alchemy --> AI
```

## Request Flow Architecture

```mermaid
sequenceDiagram
    participant Client
    participant CDN as Cloudflare CDN
    participant Worker as RedwoodSDK Worker
    participant Effect as Effect Runtime
    participant Services as Effect Services
    participant CF as Cloudflare Services
    
    Client->>CDN: HTTP Request
    CDN->>Worker: Route to Worker
    Worker->>Worker: Initialize Effect Runtime
    Worker->>Effect: Execute Server Action
    Effect->>Services: Resolve Dependencies
    Services->>CF: Query/Store Data
    CF-->>Services: Response
    Services-->>Effect: Service Result
    Effect-->>Worker: Action Result
    Worker-->>CDN: HTTP Response
    CDN-->>Client: Final Response
```

## EffectTS Integration Architecture

```mermaid
graph TB
    subgraph "Server Action Layer"
        SA1[Hello World Action]
        SA2[User Management Action]
        SA3[Data Processing Action]
    end
    
    subgraph "Effect Runtime"
        Runtime[Effect Runtime]
        Context[Effect Context]
        Layers[Service Layers]
    end
    
    subgraph "Service Implementations"
        DB[Database Service]
        Storage[Storage Service]
        Auth[Auth Service]
        AI[AI Service]
        Logger[Logger Service]
    end
    
    subgraph "Cloudflare Bindings"
        D1Binding[D1 Binding]
        R2Binding[R2 Binding]
        AIBinding[AI Gateway Binding]
        EnvVars[Environment Variables]
    end
    
    SA1 --> Runtime
    SA2 --> Runtime
    SA3 --> Runtime
    
    Runtime --> Context
    Context --> Layers
    
    Layers --> DB
    Layers --> Storage
    Layers --> Auth
    Layers --> AI
    Layers --> Logger
    
    DB --> D1Binding
    Storage --> R2Binding
    AI --> AIBinding
    Auth --> EnvVars
    Logger --> EnvVars
```

## Data Flow Architecture

```mermaid
graph LR
    subgraph "Frontend"
        UI[React Components]
        State[Client State]
    end
    
    subgraph "Server Actions"
        Action[Server Action]
        Validation[Input Validation]
        Business[Business Logic]
    end
    
    subgraph "Effect Pipeline"
        Parse[Parse Input]
        Validate[Validate Data]
        Transform[Transform Data]
        Persist[Persist Data]
        Response[Format Response]
    end
    
    subgraph "Data Layer"
        D1[(D1 Database)]
        R2[(R2 Storage)]
        Cache[Edge Cache]
    end
    
    UI --> Action
    Action --> Validation
    Validation --> Business
    Business --> Parse
    Parse --> Validate
    Validate --> Transform
    Transform --> Persist
    Persist --> D1
    Persist --> R2
    Persist --> Cache
    Response --> State
    Response --> UI
```

## Deployment Architecture

```mermaid
graph TB
    subgraph "Development"
        Dev[Developer]
        Local[Local Environment]
        Miniflare[Miniflare Simulation]
    end
    
    subgraph "Source Control"
        GitHub[GitHub Repository]
        Branch[Feature Branch]
        Main[Main Branch]
    end
    
    subgraph "CI/CD"
        Actions[GitHub Actions]
        Build[Build Process]
        Test[Test Suite]
        Deploy[Deployment]
    end
    
    subgraph "Infrastructure as Code"
        Alchemy[Alchemy IaC]
        Config[Worker Config]
        Resources[CF Resources]
    end
    
    subgraph "Cloudflare Environments"
        Dev_CF[Development]
        Staging[Staging]
        Prod[Production]
    end
    
    Dev --> Local
    Local --> Miniflare
    Dev --> Branch
    Branch --> GitHub
    GitHub --> Actions
    Actions --> Build
    Build --> Test
    Test --> Deploy
    Deploy --> Alchemy
    Alchemy --> Config
    Alchemy --> Resources
    Config --> Dev_CF
    Config --> Staging
    Main --> Prod
```

## Component Interaction Diagram

```mermaid
graph TB
    subgraph "RedwoodSDK Application"
        App[App.tsx]
        Shell[AppShell.tsx]
        Routes[Route Components]
        Components[UI Components]
    end
    
    subgraph "Server Layer"
        Actions[Server Actions]
        Middleware[Effect Middleware]
        Runtime[Effect Runtime]
    end
    
    subgraph "Service Layer"
        UserService[User Service]
        DataService[Data Service]
        FileService[File Service]
        NotificationService[Notification Service]
    end
    
    subgraph "External Services"
        Clerk[Clerk Auth]
        D1[(D1 Database)]
        R2[(R2 Storage)]
        AI[AI Gateway]
    end
    
    App --> Shell
    Shell --> Routes
    Routes --> Components
    Components --> Actions
    Actions --> Middleware
    Middleware --> Runtime
    Runtime --> UserService
    Runtime --> DataService
    Runtime --> FileService
    Runtime --> NotificationService
    
    UserService --> Clerk
    DataService --> D1
    FileService --> R2
    NotificationService --> AI
```

## Error Handling Flow

```mermaid
graph TB
    subgraph "Request Processing"
        Request[Incoming Request]
        Validation[Input Validation]
        Business[Business Logic]
        Response[Response Generation]
    end
    
    subgraph "Effect Error Handling"
        Try[Effect.try]
        Catch[Error Catching]
        Transform[Error Transformation]
        Recovery[Error Recovery]
    end
    
    subgraph "Error Types"
        ValidationError[Validation Error]
        BusinessError[Business Logic Error]
        ServiceError[Service Error]
        SystemError[System Error]
    end
    
    subgraph "Error Responses"
        UserError[User-Friendly Error]
        LogError[Logged Error]
        MetricError[Error Metrics]
    end
    
    Request --> Validation
    Validation --> Business
    Business --> Response
    
    Validation --> Try
    Business --> Try
    Try --> Catch
    Catch --> Transform
    Transform --> Recovery
    
    Transform --> ValidationError
    Transform --> BusinessError
    Transform --> ServiceError
    Transform --> SystemError
    
    ValidationError --> UserError
    BusinessError --> UserError
    ServiceError --> LogError
    SystemError --> LogError
    
    LogError --> MetricError
```

## Local Development Architecture

```mermaid
graph TB
    subgraph "Developer Machine"
        IDE[IDE/Editor]
        Terminal[Terminal]
        Browser[Browser]
    end
    
    subgraph "Local Development Server"
        Vite[Vite Dev Server]
        HMR[Hot Module Reload]
        Miniflare[Miniflare Runtime]
    end
    
    subgraph "Local Services"
        LocalD1[(Local D1)]
        LocalR2[(Local R2)]
        LocalAI[Local AI Simulation]
    end
    
    subgraph "Development Tools"
        DevTools[Browser DevTools]
        EffectDebug[Effect Debugging]
        Logs[Console Logs]
    end
    
    IDE --> Terminal
    Terminal --> Vite
    Vite --> HMR
    Vite --> Miniflare
    Miniflare --> LocalD1
    Miniflare --> LocalR2
    Miniflare --> LocalAI
    
    Browser --> Vite
    Browser --> DevTools
    DevTools --> EffectDebug
    EffectDebug --> Logs
```

## Security Architecture

```mermaid
graph TB
    subgraph "Authentication Layer"
        Clerk[Clerk Authentication]
        JWT[JWT Tokens]
        Session[Session Management]
    end
    
    subgraph "Authorization Layer"
        Middleware[Auth Middleware]
        RBAC[Role-Based Access]
        Permissions[Permission Checks]
    end
    
    subgraph "Data Protection"
        Encryption[Data Encryption]
        Validation[Input Validation]
        Sanitization[Data Sanitization]
    end
    
    subgraph "Infrastructure Security"
        WAF[Web Application Firewall]
        DDoS[DDoS Protection]
        SSL[SSL/TLS]
    end
    
    Clerk --> JWT
    JWT --> Session
    Session --> Middleware
    Middleware --> RBAC
    RBAC --> Permissions
    
    Permissions --> Validation
    Validation --> Sanitization
    Sanitization --> Encryption
    
    WAF --> SSL
    SSL --> DDoS
```

## Monitoring and Observability

```mermaid
graph TB
    subgraph "Application Metrics"
        Performance[Performance Metrics]
        Errors[Error Tracking]
        Usage[Usage Analytics]
    end
    
    subgraph "Effect Observability"
        Tracing[Effect Tracing]
        Spans[Span Collection]
        Metrics[Effect Metrics]
    end
    
    subgraph "Cloudflare Analytics"
        CFAnalytics[CF Analytics]
        WorkerMetrics[Worker Metrics]
        EdgeLogs[Edge Logs]
    end
    
    subgraph "External Monitoring"
        Sentry[Error Reporting]
        DataDog[APM Monitoring]
        Grafana[Dashboards]
    end
    
    Performance --> Tracing
    Errors --> Tracing
    Usage --> Spans
    Tracing --> Metrics
    
    Metrics --> CFAnalytics
    CFAnalytics --> WorkerMetrics
    WorkerMetrics --> EdgeLogs
    
    EdgeLogs --> Sentry
    Sentry --> DataDog
    DataDog --> Grafana
```

