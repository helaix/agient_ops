# P0-CORE-002 Technical Specification: RedwoodSDK + Cloudflare Workers + EffectTS Integration

## Executive Summary

This document provides the technical specification for implementing P0-CORE-002: RedwoodSDK Application Setup on Cloudflare Workers with EffectTS integration. The implementation will create a modern, type-safe, full-stack application leveraging Cloudflare's edge computing platform with functional programming patterns.

## Architecture Overview

### Technology Stack
- **Frontend Framework**: RedwoodSDK (React-based, Cloudflare-native)
- **Runtime Environment**: Cloudflare Workers
- **Business Logic**: EffectTS (functional programming, type-safe error handling)
- **Infrastructure**: Alchemy IaC for deployment automation
- **Database**: Cloudflare D1 (SQLite-compatible)
- **Storage**: Cloudflare R2 (S3-compatible)
- **Build System**: Vite (integrated with RedwoodSDK)

### Key Architectural Decisions

1. **RedwoodSDK as Primary Framework**: Unlike traditional RedwoodJS, RedwoodSDK is purpose-built for Cloudflare, providing native Workers support and eliminating adaptation complexity.

2. **EffectTS for Server Actions**: All business logic will use Effect's functional programming patterns for type-safe error handling, dependency injection, and composable services.

3. **Monorepo Integration**: Application will reside in `packages/@sparkflow/sparkflow` following established monorepo patterns.

4. **IaC-First Deployment**: All infrastructure provisioning and deployment handled by Alchemy, ensuring consistent environments.

## Component Architecture

### 1. RedwoodSDK Application Structure

```
packages/@sparkflow/sparkflow/
├── src/
│   ├── app/                    # Application entry point
│   │   ├── app.tsx            # Main app component
│   │   └── routes/            # File-based routing
│   ├── components/            # React components
│   │   └── AppShell.tsx       # Main application container
│   ├── server/                # Server-side logic
│   │   ├── actions/           # Server Actions with EffectTS
│   │   ├── services/          # Effect Services
│   │   └── runtime/           # Effect Runtime configuration
│   └── lib/                   # Shared utilities
├── public/                    # Static assets
├── wrangler.toml             # Local development configuration
├── vite.config.ts            # Build configuration
└── package.json              # Dependencies and scripts
```

### 2. EffectTS Integration Pattern

#### Server Action Architecture
```typescript
// Example Server Action with EffectTS
import { Effect, Layer, Context } from "effect"
import { ServerAction } from "@redwoodjs/sdk"

// Define service interfaces
interface DatabaseService {
  readonly query: (sql: string) => Effect.Effect<unknown[], DatabaseError>
}

// Implement services
const DatabaseServiceLive = Layer.succeed(
  DatabaseService,
  DatabaseService.of({
    query: (sql) => Effect.tryPromise({
      try: () => env.DB.prepare(sql).all(),
      catch: (error) => new DatabaseError({ cause: error })
    })
  })
)

// Server Action implementation
export const helloWorldAction = ServerAction.create({
  handler: (input: { name: string }) =>
    Effect.gen(function* () {
      const db = yield* DatabaseService
      const result = yield* db.query("SELECT 'Hello ' || ? as greeting", [input.name])
      return { greeting: result[0].greeting }
    }).pipe(
      Effect.provide(DatabaseServiceLive),
      Effect.runPromise
    )
})
```

### 3. Cloudflare Workers Integration

#### Worker Entry Point
```typescript
// src/worker.ts
import { createApp } from "@redwoodjs/sdk"
import { Effect, Runtime } from "effect"

export default createApp({
  middleware: [
    // Effect runtime middleware
    (request, env, ctx) => {
      const runtime = Runtime.make(
        Layer.mergeAll(
          DatabaseServiceLive.pipe(Layer.provide(env.DB)),
          StorageServiceLive.pipe(Layer.provide(env.R2)),
          // Additional service layers
        )
      )
      
      // Attach runtime to request context
      request.runtime = runtime
      return request
    }
  ]
})
```

### 4. IaC Configuration with Alchemy

#### Worker Resource Definition
```typescript
// infrastructure/workers/sparkflow-app.ts
import { Worker, D1Database, R2Bucket } from "@alchemy/cloudflare"

export const sparkflowDatabase = new D1Database("sparkflow-db", {
  name: "sparkflow-app-db"
})

export const sparkflowStorage = new R2Bucket("sparkflow-storage", {
  name: "sparkflow-app-storage"
})

export const sparkflowWorker = new Worker("sparkflow-app", {
  name: "sparkflow-app",
  scriptPath: "./packages/@sparkflow/sparkflow/dist/worker.js",
  bindings: {
    DB: sparkflowDatabase,
    R2: sparkflowStorage
  },
  routes: [
    { pattern: "app.sparkflow.dev/*", zone: "sparkflow.dev" }
  ],
  environment: {
    NODE_ENV: "production"
  }
})
```

## Implementation Strategy

### Phase 1: Foundation Setup (P0C002-C02X1-InitRedwoodApp)
1. Initialize RedwoodSDK application in monorepo
2. Configure package.json with proper workspace dependencies
3. Verify basic project structure and build process

### Phase 2: Cloudflare Workers Configuration (P0C002-C02X2-ConfigureRedwoodForCFWorkers)
1. Configure RedwoodSDK for Workers deployment
2. Set up local development with wrangler.toml
3. Optimize build output for Workers runtime

### Phase 3: EffectTS Server Action Implementation (P0C002-C02X3-HelloWorldServerAction)
1. Implement Effect runtime integration
2. Create hello world Server Action with EffectTS
3. Establish service layer patterns

### Phase 4: IaC Integration (P0C002-C02X4-IaCWorkerDefinition)
1. Define Worker resources in Alchemy
2. Configure environment variables and bindings
3. Set up deployment automation

### Phase 5: Deployment and Verification (P0C002-C02X5-DeployAndVerify)
1. Deploy via IaC to development environment
2. Verify end-to-end functionality
3. Validate performance and monitoring

## Development Workflow

### Local Development Setup
1. **Environment Preparation**:
   ```bash
   cd packages/@sparkflow/sparkflow
   pnpm install
   pnpm dev  # Starts local development server with Miniflare
   ```

2. **Service Simulation**: Use Miniflare for local Cloudflare services simulation
3. **Hot Reloading**: Vite provides fast refresh for both client and server code
4. **Effect Debugging**: Leverage Effect's built-in debugging and tracing capabilities

### Testing Strategy

#### Unit Testing
- **Server Actions**: Test Effect programs in isolation using Effect.runSync
- **Services**: Mock Cloudflare bindings using Effect's test utilities
- **Components**: Standard React Testing Library patterns

#### Integration Testing
- **End-to-End**: Playwright tests against local Miniflare environment
- **API Testing**: Test Server Actions with real Effect runtime
- **Performance**: Measure cold start times and bundle size

#### Testing Tools
```typescript
// Example Effect test
import { Effect, Layer, TestContext } from "effect"
import { describe, it, expect } from "vitest"

describe("HelloWorldAction", () => {
  it("should return greeting", async () => {
    const result = await Effect.runPromise(
      helloWorldAction({ name: "World" }).pipe(
        Effect.provide(TestDatabaseLayer)
      )
    )
    
    expect(result.greeting).toBe("Hello World")
  })
})
```

## Risk Assessment and Mitigation

### High-Risk Areas

1. **EffectTS Learning Curve**
   - **Risk**: Team unfamiliarity with functional programming patterns
   - **Mitigation**: Comprehensive documentation, examples, and gradual adoption

2. **Bundle Size Impact**
   - **Risk**: EffectTS may increase Worker bundle size
   - **Mitigation**: Tree-shaking optimization, selective Effect imports

3. **Cold Start Performance**
   - **Risk**: Effect runtime initialization may impact cold starts
   - **Mitigation**: Runtime optimization, lazy loading patterns

4. **Debugging Complexity**
   - **Risk**: Effect stack traces may be difficult to debug
   - **Mitigation**: Enhanced logging, Effect debugging tools

### Medium-Risk Areas

1. **RedwoodSDK Maturity**
   - **Risk**: Newer framework may have undiscovered issues
   - **Mitigation**: Thorough testing, community engagement

2. **IaC Integration Complexity**
   - **Risk**: Alchemy configuration may be complex
   - **Mitigation**: Incremental IaC implementation, documentation

## Performance Considerations

### Bundle Optimization
- Tree-shaking for Effect imports
- Code splitting for large Effect programs
- Selective service loading

### Runtime Performance
- Effect runtime caching
- Service layer optimization
- Cloudflare Workers best practices

### Monitoring and Observability
- Effect tracing integration
- Cloudflare Analytics
- Custom metrics for Effect operations

## Security Considerations

### Authentication and Authorization
- Clerk JWT validation in Effect middleware
- Service-level authorization patterns
- Secure environment variable handling

### Data Protection
- Effect-based input validation
- Type-safe database operations
- Secure Cloudflare bindings usage

## Success Criteria

### Technical Criteria
1. ✅ RedwoodSDK application builds and deploys to Cloudflare Workers
2. ✅ EffectTS Server Actions execute successfully with proper error handling
3. ✅ IaC deployment works end-to-end
4. ✅ Local development environment mirrors production
5. ✅ All tests pass with >90% coverage

### Performance Criteria
1. ✅ Cold start time < 100ms
2. ✅ Bundle size < 1MB
3. ✅ Response time < 50ms for simple operations

### Quality Criteria
1. ✅ Type safety maintained throughout the stack
2. ✅ Error handling follows Effect patterns
3. ✅ Code follows established patterns and conventions

## Next Steps for Coder Agent

1. **Environment Setup**: Follow Phase 1 implementation checklist
2. **Reference Implementation**: Use provided code examples as starting points
3. **Incremental Development**: Implement phases sequentially with validation
4. **Testing Integration**: Implement tests alongside feature development
5. **Documentation**: Maintain implementation notes for future reference

## Appendices

### A. RedwoodSDK Resources
- [Official Documentation](https://docs.rwsdk.com/)
- [GitHub Repository](https://github.com/redwoodjs/sdk)
- [Community Examples](https://github.com/redwoodjs/sdk/tree/main/examples)

### B. EffectTS Resources
- [Effect Documentation](https://effect.website/)
- [Effect Examples](https://github.com/Effect-TS/effect/tree/main/examples)
- [Effect Best Practices](https://effect.website/docs/guides/style-guide)

### C. Cloudflare Workers Resources
- [Workers Documentation](https://developers.cloudflare.com/workers/)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/)
- [Workers Examples](https://github.com/cloudflare/workers-examples)

