import { COLORS, DISPLAY_FONT } from "@/lib/ui";

/**
 * Arabic stand-ins for the home-page sticker artwork (stick.png / stick1.png),
 * whose lettering is baked into the images in French. Same colours, shapes
 * and rotation, drawn in HTML so the text can be Arabic.
 */
export function ArabicPriceSticker({ className = "" }: { className?: string }) {
  return (
    <div
      aria-label="أسعار عادلة كل يوم"
      className={`grid rotate-[8deg] place-items-center rounded-full text-center text-white drop-shadow-md ${className}`}
      style={{ background: COLORS.red, fontFamily: DISPLAY_FONT }}
    >
      <div className="px-2 leading-[1.15]">
        <div className="text-[13px] font-extrabold sm:text-[28px]">أسعار عادلة</div>
        <div className="text-[10px] font-bold sm:text-[20px]">كل يوم</div>
      </div>
    </div>
  );
}

export function ArabicDealsSticker({ className = "" }: { className?: string }) {
  return (
    <div
      aria-label="أفضل العروض"
      className={`relative -rotate-[6deg] select-none ${className}`}
      style={{ fontFamily: DISPLAY_FONT }}
    >
      <div
        className="w-fit rounded-md px-6 py-1.5 text-[34px] font-black leading-[1.35] text-white shadow-md"
        style={{ background: COLORS.red }}
      >
        أفضل
      </div>
      <div className="mt-[-6px] flex items-center gap-3 ps-6">
        <div
          className="w-fit rounded-md px-6 py-1.5 text-[34px] font-black leading-[1.35] shadow-md"
          style={{ background: COLORS.yellow, color: COLORS.red }}
        >
          العروض
        </div>
        <span
          className="text-[44px] font-black leading-none"
          style={{ color: COLORS.red }}
        >
          %
        </span>
      </div>
    </div>
  );
}
