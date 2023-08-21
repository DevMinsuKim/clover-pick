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
      "https://el.dhlottery.co.kr/game/TotalGame.jsp?LottoId=LP72"
    );

    const pages = await browser.pages();
    const firstTab = pages[1];
    await firstTab.bringToFront();

    const frames = page2
      .frames()
      .filter((frame) => frame.name() === "ifrm_tab");

    const popupFrames = page2
      .frames()
      .find((frame) => frame.name() === "ifrm_tab");

    const checkForPopup = async () => {
      try {
        // 팝업의 특정 요소가 나타나는지 최대 5초간 대기합니다.
        await popupFrames?.waitForSelector("#lotto720_popup_my_number", {
          timeout: 1500,
        }); // '.popup-selector'는 실제 팝업의 선택자로 변경해야 합니다.
        return true;
      } catch (err) {
        // 5초 내에 팝업의 요소가 검색되지 않으면 팝업이 없는 것으로 간주합니다.
        return false;
      }
    };

    const handlePopupIfPresent = async () => {
      if (await checkForPopup()) {
        // 팝업이 있다면 사용자가 팝업을 닫을 때까지 기다립니다.
        await popupFrames?.waitForFunction(
          "document.querySelector('#lotto720_popup_my_number') === null"
        );
      }
    };

    for (const set of numberSets) {
      for (let i = 0; i < set.length; i++) {
        let selector;

        // 첫 번째 인덱스의 경우
        if (i === 0) {
          selector = `label[for=lotto720_radio_group_wrapper_num${set[i]}]`;
        } else {
          selector = `a.lotto720_box.numsgroup.num${set[i]}`;
        }

        // 해당 프레임에서 선택자를 찾아 클릭
        for (const frame of frames) {
          const elementHandle = await frame.$(selector);

          if (elementHandle) {
            await elementHandle.click();
            break;
          }
        }
      }
      for (const frame of frames) {
        const elementHandle = await frame.$("a.lotto720_btn_confirm_number");

        if (elementHandle) {
          await elementHandle.click();
          await page2.waitForTimeout(1000);
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
