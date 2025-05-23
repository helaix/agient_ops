// AppShell component - Main application container
import { useState } from 'react'
import { helloWorldAction } from '../server/actions/hello-world.js'

interface GreetingResult {
  message: string
  timestamp: string
  success: boolean
}

export function AppShell() {
  const [name, setName] = useState('')
  const [result, setResult] = useState<GreetingResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!name.trim()) {
      setError('Please enter your name')
      return
    }

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await helloWorldAction({ name: name.trim() })
      setResult(response)
    } catch (err) {
      console.error('Action failed:', err)
      setError(err instanceof Error ? err.message : 'An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setName('')
    setResult(null)
    setError(null)
  }

  return (
    <div style={{ 
      maxWidth: '600px', 
      margin: '0 auto', 
      padding: '2rem',
      fontFamily: 'system-ui, sans-serif'
    }}>
      <header style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h1 style={{ 
          color: '#2563eb',
          fontSize: '2.5rem',
          marginBottom: '0.5rem'
        }}>
          🚀 Sparkflow
        </h1>
        <p style={{ 
          color: '#6b7280',
          fontSize: '1.1rem'
        }}>
          RedwoodSDK + Cloudflare Workers + EffectTS
        </p>
      </header>

      <main>
        <div style={{
          backgroundColor: '#f8fafc',
          padding: '2rem',
          borderRadius: '0.5rem',
          border: '1px solid #e2e8f0',
          marginBottom: '2rem'
        }}>
          <h2 style={{ 
            marginBottom: '1rem',
            color: '#1f2937'
          }}>
            Hello World Server Action Demo
          </h2>
          
          <form onSubmit={handleSubmit} style={{ marginBottom: '1rem' }}>
            <div style={{ marginBottom: '1rem' }}>
              <label 
                htmlFor="name" 
                style={{ 
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontWeight: '500',
                  color: '#374151'
                }}
              >
                Enter your name:
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name here..."
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  fontSize: '1rem',
                  backgroundColor: loading ? '#f3f4f6' : 'white'
                }}
              />
            </div>
            
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                type="submit"
                disabled={loading || !name.trim()}
                style={{
                  backgroundColor: loading || !name.trim() ? '#9ca3af' : '#2563eb',
                  color: 'white',
                  padding: '0.75rem 1.5rem',
                  border: 'none',
                  borderRadius: '0.375rem',
                  fontSize: '1rem',
                  cursor: loading || !name.trim() ? 'not-allowed' : 'pointer',
                  fontWeight: '500'
                }}
              >
                {loading ? 'Sending...' : 'Say Hello'}
              </button>
              
              {(result || error) && (
                <button
                  type="button"
                  onClick={handleReset}
                  style={{
                    backgroundColor: '#6b7280',
                    color: 'white',
                    padding: '0.75rem 1.5rem',
                    border: 'none',
                    borderRadius: '0.375rem',
                    fontSize: '1rem',
                    cursor: 'pointer',
                    fontWeight: '500'
                  }}
                >
                  Reset
                </button>
              )}
            </div>
          </form>

          {error && (
            <div style={{
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#dc2626',
              padding: '1rem',
              borderRadius: '0.375rem',
              marginTop: '1rem'
            }}>
              <strong>Error:</strong> {error}
            </div>
          )}

          {result && (
            <div style={{
              backgroundColor: '#f0fdf4',
              border: '1px solid #bbf7d0',
              color: '#166534',
              padding: '1rem',
              borderRadius: '0.375rem',
              marginTop: '1rem'
            }}>
              <h3 style={{ marginBottom: '0.5rem', color: '#15803d' }}>
                ✅ Success!
              </h3>
              <p style={{ marginBottom: '0.5rem', fontSize: '1.1rem' }}>
                <strong>{result.message}</strong>
              </p>
              <p style={{ fontSize: '0.875rem', color: '#059669' }}>
                Timestamp: {new Date(result.timestamp).toLocaleString()}
              </p>
            </div>
          )}
        </div>

        <div style={{
          backgroundColor: '#fefce8',
          border: '1px solid #fde047',
          padding: '1.5rem',
          borderRadius: '0.5rem'
        }}>
          <h3 style={{ 
            marginBottom: '1rem',
            color: '#a16207'
          }}>
            🎯 Implementation Status
          </h3>
          <ul style={{ 
            listStyle: 'none',
            padding: 0,
            margin: 0,
            color: '#92400e'
          }}>
            <li style={{ marginBottom: '0.5rem' }}>
              ✅ RedwoodSDK Application Setup
            </li>
            <li style={{ marginBottom: '0.5rem' }}>
              ✅ EffectTS Server Action Implementation
            </li>
            <li style={{ marginBottom: '0.5rem' }}>
              ✅ AppShell Frontend Component
            </li>
            <li style={{ marginBottom: '0.5rem' }}>
              ✅ Vitest Test Infrastructure
            </li>
            <li style={{ marginBottom: '0.5rem' }}>
              🔄 IaC Configuration (In Progress)
            </li>
          </ul>
        </div>
      </main>
    </div>
  )
}

