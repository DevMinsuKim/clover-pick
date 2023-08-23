import puppeteer from "puppeteer";

export async function POST(req: Request) {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
    args: ["--window-size=1920,1080"],
  });

  try {
    const numberSets = await req.json();

    const [page1] = await browser.pages();

    await page1.goto("https://dhlottery.co.kr/user.do?method=login&returnUrl=");
    await page1.waitForSelector(".money");
    const page2 = await browser.newPage();
    await page2.goto(
      "https://el.dhlottery.co.kr/game/TotalGame.jsp?LottoId=LO40"
    );

    const pages = await browser.pages();
    const firstTab = pages[1];
    await firstTab.bringToFront();

    const frames = page2
      .frames()
      .filter((frame) => frame.name() === "ifrm_tab");

    for (const numbers of numberSets) {
      for (const number of numbers) {
        const selector = `label[for=check645num${number}]`;

        for (const frame of frames) {
          const elementHandle = await frame.$(selector);

          if (elementHandle) {
            await elementHandle.click();
            break;
          }
        }
      }

      for (const frame of frames) {
        const buttonHandle = await frame.$("#btnSelectNum");

        if (buttonHandle) {
          await buttonHandle.click();
          break;
        }
      }
    }

    return new Response("ok!");
  } catch (error) {
    await browser.close();
    console.error(error);
  }
}
