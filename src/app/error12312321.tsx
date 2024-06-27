// "use client";

// import Button from "@/components/common/Button";
// import CombinationLogo from "@/components/ui/icons/CombinationLogo";
// import * as Sentry from "@sentry/nextjs";
// import { Noto_Sans_KR } from "next/font/google";
// import { useEffect } from "react";

// const notoSansKR = Noto_Sans_KR({ subsets: ["latin"] });

// export default function GlobalError({
//   error,
// }: {
//   error: Error & { digest?: string };
// }) {
//   const handleReload = () => {
//     window.location.reload();
//   };

//   useEffect(() => {
//     if (error) {
//       Sentry.captureException(error);
//     }
//   }, [error]);

//   return (
//     <html suppressHydrationWarning lang="ko">
//       <body
//         className={`${notoSansKR.className} container relative mx-auto flex h-screen w-full min-w-[320px] max-w-screen-xl flex-col items-center justify-center break-keep px-6`}
//       >
//         {/* `NextError` is the default Next.js error page component. Its type
//         definition requires a `statusCode` prop. However, since the App Router
//         does not expose status codes for errors, we simply pass 0 to render a
//         generic error message. */}
//         <div
//           className="absolute top-10 w-48 cursor-pointer sm:w-56"
//           onClick={() => handleReload()}
//         >
//           <CombinationLogo />
//         </div>

//         <h2 className="mb-7 text-center text-2xl font-extrabold sm:text-4xl">
//           잠시 후 다시 시도해 주세요!
//         </h2>
//         <div className="mb-9 text-center sm:text-lg">
//           <p>지금 서비스에 연결할 수 없습니다.</p>
//           <p>
//             현재 문제를 해결하기 위해
//             <br className="sm:hidden" /> 최선을 다하고 있습니다.
//           </p>
//           <p>잠시 후 다시 시도해 주세요.</p>
//         </div>

//         <Button onClick={() => handleReload()}>다시 시도하기</Button>
//       </body>
//     </html>
//   );
// }
