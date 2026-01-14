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
    <>
      {/* Agent Profile Card */}
      <section className="mx-4 mb-24 bg-card p-5 rounded-2xl border border-border shadow-lg">
        <div className="flex items-center gap-4">
          <div className="relative size-16 shrink-0">
            {agent.avatar_url ? (
              <img
                src={agent.avatar_url}
                alt={agent.full_name}
                className="size-full rounded-full object-cover ring-2 ring-primary/20"
              />
            ) : (
              <div className="size-full rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center ring-2 ring-primary/20">
                <span className="material-symbols-outlined text-2xl text-primary">person</span>
              </div>
            )}
            <div className="absolute -bottom-1 -right-1 bg-primary text-white p-0.5 rounded-full ring-2 ring-background">
              <span className="material-symbols-outlined text-[12px]">verified</span>
            </div>
          </div>
          <div className="flex-1">
            <h4 className="font-bold text-lg">{agent.full_name}</h4>
            <p className="text-xs text-muted-foreground">
              {agent.title}{agent.company_name && ` - ${agent.company_name}`}
            </p>
            <div className="flex items-center gap-1 mt-1">
              <span className="material-symbols-outlined text-amber-400 text-sm">star</span>
              <span className="text-xs font-bold">4.9</span>
              <span className="text-[10px] text-muted-foreground">(128 đánh giá)</span>
            </div>
          </div>
        </div>
        <div className="mt-4 flex gap-2">
          {agent.zalo_link ? (
            <a
              href={agent.zalo_link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-2 rounded-xl bg-muted text-sm font-bold flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-lg">chat_bubble</span>
              Nhắn tin
            </a>
          ) : (
            <a
              href={`https://zalo.me/${agent.phone}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-2 rounded-xl bg-muted text-sm font-bold flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-lg">chat_bubble</span>
              Nhắn tin
            </a>
          )}
          <a
            href={`tel:${agent.phone}`}
            className="flex-1 py-2 rounded-xl bg-muted text-sm font-bold flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-lg">call</span>
            Gọi ngay
          </a>
        </div>
      </section>

      {/* Sticky Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/90 backdrop-blur-xl border-t border-border flex gap-3 items-center z-50">
        <a
          href={agent.zalo_link || `https://zalo.me/${agent.phone}`}
          target="_blank"
          rel="noopener noreferrer"
          className="size-12 flex items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20"
        >
          <span className="material-symbols-outlined">forum</span>
        </a>
        <a
          href={`tel:${agent.phone}`}
          className="flex-1 h-12 bg-accent hover:bg-accent/90 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-accent/20 transition-all active:scale-95"
        >
          <span className="material-symbols-outlined">phone_in_talk</span>
          LIÊN HỆ NGAY
        </a>
      </div>
    </>
  )
}
