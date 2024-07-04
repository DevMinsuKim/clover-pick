export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <div className="flex flex-col items-center justify-center border-t-[1px] border-divider pb-20 pt-3 sm:pb-5">
      <div className="max-w-screen-xl px-6">
        <p className="text-content3 w-full text-center text-xs sm:text-sm">
          Copyright © {year} CloverPick. All rights reserved
        </p>
      </div>
    </div>
  );
}
