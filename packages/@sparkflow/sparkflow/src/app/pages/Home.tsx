import { RequestInfo } from "rwsdk/worker";
import { AppShell } from "../../components/AppShell.js";

export function Home({ ctx }: RequestInfo) {
  return (
    <div>
      <AppShell />
      <div style={{ 
        textAlign: 'center', 
        marginTop: '2rem', 
        padding: '1rem',
        backgroundColor: '#f3f4f6',
        borderRadius: '0.5rem',
        fontSize: '0.875rem',
        color: '#6b7280'
      }}>
        {ctx.user?.username
          ? `🔐 Logged in as: ${ctx.user.username}`
          : "🔓 Not logged in"}
      </div>
    </div>
  );
}
