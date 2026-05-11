import { Download, ExternalLink, Smartphone } from 'lucide-react';

const APP_DOWNLOAD_LINKS = {
  appStore: 'https://apps.apple.com/app/salesboost-ai/id0000000000',
  googlePlay: 'https://play.google.com/store/apps/details?id=com.salesboost.ai',
};

interface AppDownloadButtonProps {
  compact?: boolean;
}

export function AppDownloadButton({ compact = false }: AppDownloadButtonProps) {
  return (
    <div className="relative shrink-0 group/app-download">
      <button
        type="button"
        className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-[#E5DED8] bg-white px-3 py-2 text-xs font-bold text-[#3F3A3D] shadow-sm transition-colors hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-500/15"
        aria-haspopup="menu"
      >
        <Download className="h-3.5 w-3.5" />
        <span>下载APP</span>
      </button>

      <div className="absolute right-0 top-full z-50 hidden w-60 pt-2 group-hover/app-download:block group-focus-within/app-download:block">
        <div className="rounded-xl border border-[#E5DED8] bg-white p-2 shadow-xl">
          {!compact ? (
            <div className="mb-1 flex items-start gap-2 rounded-lg bg-[#F8F5F3] px-2.5 py-2">
              <Smartphone className="mt-0.5 h-4 w-4 shrink-0 text-rose-500" />
              <div>
                <p className="text-xs font-bold text-[#242124]">移动端 APP 下载</p>
                <p className="mt-0.5 text-[10px] leading-relaxed text-[#766F73]">
                  BA 可在移动端查看课件、附加题、考试和陪练任务。
                </p>
              </div>
            </div>
          ) : null}

          <a
            href={APP_DOWNLOAD_LINKS.appStore}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-between rounded-lg px-2.5 py-2 text-xs font-bold text-[#3F3A3D] transition-colors hover:bg-[#F8F5F3] hover:text-rose-700"
          >
            <span data-i18n-skip="true">Apple App Store</span>
            <ExternalLink className="h-3.5 w-3.5 text-[#9A9396]" />
          </a>
          <a
            href={APP_DOWNLOAD_LINKS.googlePlay}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-between rounded-lg px-2.5 py-2 text-xs font-bold text-[#3F3A3D] transition-colors hover:bg-[#F8F5F3] hover:text-rose-700"
          >
            <span data-i18n-skip="true">Google Play</span>
            <ExternalLink className="h-3.5 w-3.5 text-[#9A9396]" />
          </a>
        </div>
      </div>
    </div>
  );
}
