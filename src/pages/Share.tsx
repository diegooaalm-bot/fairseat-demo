import { Logo } from '@/components/brand/Logo'
import { QRMark } from '@/components/ticket/DynamicQR'

export default function Share() {
  const url = typeof window !== 'undefined' ? `${window.location.origin}${window.location.pathname}#/demo` : ''
  return (
    <main className="grid min-h-dvh place-items-center bg-ink px-6 text-center">
      <div className="flex flex-col items-center gap-8">
        <Logo size={30} />
        <div className="rounded-[36px] bg-white p-6">
          <QRMark text={url} size={320} />
        </div>
        <div>
          <div className="text-[34px] font-bold tracking-[-0.03em]">Scan to try the live demo</div>
          <div className="mt-2 text-[17px] text-fg-2">{url.replace(/^https?:\/\//, '')}</div>
        </div>
      </div>
    </main>
  )
}
