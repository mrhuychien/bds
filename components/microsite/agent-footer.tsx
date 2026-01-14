interface AgentFooterProps {
  agent: {
    full_name: string
    phone: string
    avatar_url: string | null
    company_name: string | null
    title: string
    zalo_link: string | null
    facebook_link: string | null
  }
}

export function AgentFooter({ agent }: AgentFooterProps) {
  return (
    <div className="sticky bottom-0 bg-background border-t p-4 safe-bottom">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center overflow-hidden">
          {agent.avatar_url ? (
            <img src={agent.avatar_url} alt={agent.full_name} className="w-full h-full object-cover" />
          ) : (
            <svg className="w-6 h-6 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm truncate">{agent.full_name}</p>
          <p className="text-xs text-muted-foreground truncate">
            {agent.title}{agent.company_name && ` - ${agent.company_name}`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {agent.zalo_link && (
            <a
              href={agent.zalo_link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-blue-500 text-white"
              aria-label="Zalo"
            >
              <span className="text-xs font-bold">Zalo</span>
            </a>
          )}
          <a
            href={`tel:${agent.phone}`}
            className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground"
            aria-label="Gọi điện"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  )
}
